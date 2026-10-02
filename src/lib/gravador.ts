// Gravador de tela + câmera que roda só no navegador: nada sobe para servidor.
//
// A tela compartilhada e a câmera são desenhadas num canvas 1920x1080 (câmera
// num círculo por cima) e o canvas é gravado com o áudio misturado do microfone
// e da aba. Ao parar, o vídeo vira um Blob para baixar.
//
// Por que não requestAnimationFrame: quando a pessoa vai para a aba da
// apresentação, a aba do CRM fica em segundo plano e o Chrome congela o rAF e
// segura os timers em 1 por segundo — o vídeo sairia travado. O ritmo vem de um
// Worker (que não é segurado) e, no Chrome, os quadros são lidos direto das
// trilhas com MediaStreamTrackProcessor, sem depender de <video> tocando.

export const LARGURA = 1920;
export const ALTURA = 1080;
const FPS = 30;

export type Tamanho = "p" | "m" | "g";
export const DIAMETRO: Record<Tamanho, number> = { p: 200, m: 280, g: 380 };
const MARGEM = 48;

export type Cena = {
  /** Centro do círculo da câmera, de 0 a 1 em relação ao quadro. */
  bolha: { x: number; y: number };
  tamanho: Tamanho;
  mostrarCamera: boolean;
  assinatura: boolean;
};

export const CENA_PADRAO: Cena = {
  bolha: cantoPara("inf-dir", "m"),
  tamanho: "m",
  mostrarCamera: true,
  assinatura: true,
};

export type Canto = "sup-esq" | "sup-dir" | "inf-esq" | "inf-dir";

export function cantoPara(canto: Canto, tamanho: Tamanho) {
  const r = DIAMETRO[tamanho] / 2;
  const x = canto.endsWith("esq") ? MARGEM + r : LARGURA - MARGEM - r;
  const y = canto.startsWith("sup") ? MARGEM + r : ALTURA - MARGEM - r;
  return { x: x / LARGURA, y: y / ALTURA };
}

/** Mantém o círculo inteiro dentro do quadro. */
export function limitarBolha(p: { x: number; y: number }, tamanho: Tamanho) {
  const r = DIAMETRO[tamanho] / 2;
  const x = Math.min(Math.max(p.x * LARGURA, r), LARGURA - r);
  const y = Math.min(Math.max(p.y * ALTURA, r), ALTURA - r);
  return { x: x / LARGURA, y: y / ALTURA };
}

/** Diz se o ponto (de 0 a 1) cai dentro do círculo da câmera. */
export function dentroDaBolha(p: { x: number; y: number }, cena: Cena) {
  const r = DIAMETRO[cena.tamanho] / 2;
  const dx = (p.x - cena.bolha.x) * LARGURA;
  const dy = (p.y - cena.bolha.y) * ALTURA;
  return dx * dx + dy * dy <= r * r;
}

// ---------------------------------------------------------------------------
// Fonte de quadros de uma trilha de vídeo

type Quadro = { imagem: CanvasImageSource; largura: number; altura: number };

type ProcessorCtor = new (init: { track: MediaStreamTrack }) => {
  readable: ReadableStream<VideoFrame>;
};

class FonteVideo {
  private ultimo: VideoFrame | null = null;
  private leitor: ReadableStreamDefaultReader<VideoFrame> | null = null;
  private video: HTMLVideoElement | null = null;
  private fechada = false;

  constructor(readonly track: MediaStreamTrack) {
    const Processor = (window as unknown as { MediaStreamTrackProcessor?: ProcessorCtor })
      .MediaStreamTrackProcessor;
    if (Processor) {
      this.leitor = new Processor({ track }).readable.getReader();
      void this.ler();
    } else {
      const v = document.createElement("video");
      v.muted = true;
      v.playsInline = true;
      v.srcObject = new MediaStream([track]);
      void v.play().catch(() => {});
      this.video = v;
    }
  }

  private async ler() {
    while (!this.fechada && this.leitor) {
      let r: ReadableStreamReadResult<VideoFrame>;
      try {
        r = await this.leitor.read();
      } catch {
        return;
      }
      if (r.done) return;
      if (this.fechada) {
        r.value.close();
        return;
      }
      this.ultimo?.close();
      this.ultimo = r.value;
    }
  }

  quadro(): Quadro | null {
    if (this.ultimo) {
      return {
        imagem: this.ultimo,
        largura: this.ultimo.displayWidth,
        altura: this.ultimo.displayHeight,
      };
    }
    const v = this.video;
    if (v && v.videoWidth > 0) return { imagem: v, largura: v.videoWidth, altura: v.videoHeight };
    return null;
  }

  fechar() {
    this.fechada = true;
    void this.leitor?.cancel().catch(() => {});
    this.ultimo?.close();
    this.ultimo = null;
    if (this.video) this.video.srcObject = null;
  }
}

// ---------------------------------------------------------------------------
// Ritmo de desenho que não é congelado em aba de fundo

function criarRelogio(fps: number, tique: () => void) {
  const codigo = `setInterval(() => postMessage(0), ${Math.round(1000 / fps)});`;
  const url = URL.createObjectURL(new Blob([codigo], { type: "text/javascript" }));
  const worker = new Worker(url);
  worker.onmessage = tique;
  return () => {
    worker.terminate();
    URL.revokeObjectURL(url);
  };
}

// ---------------------------------------------------------------------------

const FORMATOS = [
  "video/mp4;codecs=avc1.640028,mp4a.40.2",
  "video/mp4;codecs=avc1,mp4a.40.2",
  "video/mp4",
  "video/webm;codecs=vp9,opus",
  "video/webm;codecs=vp8,opus",
  "video/webm",
];

function escolherFormato() {
  if (typeof MediaRecorder === "undefined") return null;
  return FORMATOS.find((f) => MediaRecorder.isTypeSupported(f)) ?? "";
}

export function navegadorSuporta() {
  return (
    typeof navigator !== "undefined" &&
    !!navigator.mediaDevices?.getUserMedia &&
    !!navigator.mediaDevices?.getDisplayMedia &&
    typeof MediaRecorder !== "undefined" &&
    typeof Worker !== "undefined"
  );
}

export type Resultado = { blob: Blob; tipo: string; extensao: "mp4" | "webm"; duracaoMs: number };

export type Estado = "parado" | "gravando" | "pausado";

export class Gravador {
  readonly canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private pararRelogio: (() => void) | null = null;

  cena: Cena = { ...CENA_PADRAO, bolha: { ...CENA_PADRAO.bolha } };

  private camStream: MediaStream | null = null;
  private micStream: MediaStream | null = null;
  private telaStream: MediaStream | null = null;
  private cam: FonteVideo | null = null;
  private tela: FonteVideo | null = null;

  private audio: AudioContext;
  private destino: MediaStreamAudioDestinationNode;
  private micNode: MediaStreamAudioSourceNode | null = null;
  private telaAudioNode: MediaStreamAudioSourceNode | null = null;
  readonly analisador: AnalyserNode;

  private canvasTrack: CanvasCaptureMediaStreamTrack;
  private recorder: MediaRecorder | null = null;
  private pedacos: Blob[] = [];
  private inicio = 0;
  private acumulado = 0;

  estado: Estado = "parado";
  /** Avisa a tela quando algo muda fora dela (ex.: "Parar compartilhamento" do Chrome). */
  onMudanca: () => void = () => {};

  constructor() {
    this.canvas = document.createElement("canvas");
    this.canvas.width = LARGURA;
    this.canvas.height = ALTURA;
    const ctx = this.canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas indisponível neste navegador.");
    this.ctx = ctx;

    // captureStream(0) + requestFrame(): o quadro sai quando o relógio manda,
    // e não quando o navegador acha que o canvas mudou.
    this.canvasTrack = this.canvas
      .captureStream(0)
      .getVideoTracks()[0] as CanvasCaptureMediaStreamTrack;

    this.audio = new AudioContext();
    this.destino = this.audio.createMediaStreamDestination();
    this.analisador = this.audio.createAnalyser();
    this.analisador.fftSize = 512;

    this.desenhar();
    this.pararRelogio = criarRelogio(FPS, () => {
      this.desenhar();
      this.canvasTrack.requestFrame();
    });
  }

  get temCamera() {
    return !!this.cam;
  }
  get temMicrofone() {
    return !!this.micNode;
  }
  get temTela() {
    return !!this.tela;
  }
  get temAudioDaTela() {
    return !!this.telaAudioNode;
  }

  async ligarCamera(deviceId?: string) {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        deviceId: deviceId ? { exact: deviceId } : undefined,
        width: { ideal: 1280 },
        height: { ideal: 720 },
        frameRate: { ideal: FPS },
      },
    });
    this.desligarCamera();
    this.camStream = stream;
    this.cam = new FonteVideo(stream.getVideoTracks()[0]);
    this.onMudanca();
  }

  desligarCamera() {
    this.cam?.fechar();
    this.cam = null;
    this.camStream?.getTracks().forEach((t) => t.stop());
    this.camStream = null;
    this.onMudanca();
  }

  async ligarMicrofone(deviceId?: string) {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        deviceId: deviceId ? { exact: deviceId } : undefined,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });
    this.desligarMicrofone();
    void this.audio.resume();
    this.micStream = stream;
    this.micNode = this.audio.createMediaStreamSource(stream);
    this.micNode.connect(this.destino);
    this.micNode.connect(this.analisador);
    this.onMudanca();
  }

  desligarMicrofone() {
    this.micNode?.disconnect();
    this.micNode = null;
    this.micStream?.getTracks().forEach((t) => t.stop());
    this.micStream = null;
    this.onMudanca();
  }

  /** Abre o seletor do navegador. Rejeita se a pessoa cancelar. */
  async compartilharTela() {
    const opcoes = {
      video: { frameRate: { ideal: FPS }, width: { ideal: LARGURA }, height: { ideal: ALTURA } },
      audio: true,
      // Não oferece a própria aba do CRM (daria o efeito de espelho infinito).
      selfBrowserSurface: "exclude",
      surfaceSwitching: "include",
      systemAudio: "include",
    } as DisplayMediaStreamOptions;
    const stream = await navigator.mediaDevices.getDisplayMedia(opcoes);
    this.pararTela();
    void this.audio.resume();
    this.telaStream = stream;
    const video = stream.getVideoTracks()[0];
    this.tela = new FonteVideo(video);
    // Botão "Parar compartilhamento" do Chrome: volta para só a câmera.
    video.addEventListener("ended", () => {
      if (this.telaStream === stream) this.pararTela();
    });
    if (stream.getAudioTracks().length > 0) {
      this.telaAudioNode = this.audio.createMediaStreamSource(
        new MediaStream(stream.getAudioTracks()),
      );
      this.telaAudioNode.connect(this.destino);
    }
    this.onMudanca();
  }

  pararTela() {
    this.tela?.fechar();
    this.tela = null;
    this.telaAudioNode?.disconnect();
    this.telaAudioNode = null;
    this.telaStream?.getTracks().forEach((t) => t.stop());
    this.telaStream = null;
    this.onMudanca();
  }

  // -------------------------------------------------------------------------

  private desenhar() {
    const { ctx } = this;
    const tela = this.tela?.quadro() ?? null;
    const cam = this.cena.mostrarCamera ? (this.cam?.quadro() ?? null) : null;

    ctx.fillStyle = "#121110";
    ctx.fillRect(0, 0, LARGURA, ALTURA);

    if (tela) {
      desenharContido(ctx, tela, 0, 0, LARGURA, ALTURA);
      if (cam) this.desenharBolha(cam);
    } else if (cam) {
      // Sem tela: a câmera ocupa o quadro inteiro.
      desenharCobrindo(ctx, cam, 0, 0, LARGURA, ALTURA);
    } else {
      ctx.fillStyle = "#57534E";
      ctx.font = "500 36px Inter, system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(
        this.cam && !this.cena.mostrarCamera
          ? "Câmera oculta"
          : "Ative a câmera ou compartilhe a tela",
        LARGURA / 2,
        ALTURA / 2,
      );
    }

    if (this.cena.assinatura) {
      ctx.save();
      ctx.font = "600 22px Inter, system-ui, sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "bottom";
      ctx.shadowColor = "rgba(0,0,0,0.55)";
      ctx.shadowBlur = 8;
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      ctx.fillText("Legacy BrandCo.", 40, ALTURA - 32);
      ctx.restore();
    }
  }

  private desenharBolha(cam: Quadro) {
    const { ctx } = this;
    const d = DIAMETRO[this.cena.tamanho];
    const cx = this.cena.bolha.x * LARGURA;
    const cy = this.cena.bolha.y * ALTURA;
    const r = d / 2;

    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.35)";
    ctx.shadowBlur = 24;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = "#121110";
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.clip();
    desenharCobrindo(ctx, cam, cx - r, cy - r, d, d);
    ctx.restore();

    ctx.beginPath();
    ctx.arc(cx, cy, r - 2, 0, Math.PI * 2);
    ctx.lineWidth = 4;
    ctx.strokeStyle = "rgba(255,255,255,0.9)";
    ctx.stroke();
  }

  // -------------------------------------------------------------------------

  iniciar() {
    if (this.estado !== "parado") return;
    const formato = escolherFormato();
    if (formato === null) throw new Error("Este navegador não grava vídeo.");

    const trilhas: MediaStreamTrack[] = [this.canvasTrack];
    // Sempre manda a trilha de áudio misturada (mesmo muda) para o arquivo ter som
    // quando o microfone ou a aba entrarem no meio da gravação.
    trilhas.push(...this.destino.stream.getAudioTracks());

    const recorder = new MediaRecorder(new MediaStream(trilhas), {
      mimeType: formato || undefined,
      videoBitsPerSecond: 6_000_000,
      audioBitsPerSecond: 128_000,
    });
    this.pedacos = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) this.pedacos.push(e.data);
    };
    void this.audio.resume();
    recorder.start(1000);
    this.recorder = recorder;
    this.inicio = performance.now();
    this.acumulado = 0;
    this.estado = "gravando";
    this.onMudanca();
  }

  pausar() {
    if (this.estado !== "gravando" || !this.recorder) return;
    this.recorder.pause();
    this.acumulado += performance.now() - this.inicio;
    this.estado = "pausado";
    this.onMudanca();
  }

  retomar() {
    if (this.estado !== "pausado" || !this.recorder) return;
    this.recorder.resume();
    this.inicio = performance.now();
    this.estado = "gravando";
    this.onMudanca();
  }

  /** Tempo gravado, sem contar as pausas. */
  duracaoMs() {
    if (this.estado === "gravando") return this.acumulado + performance.now() - this.inicio;
    return this.acumulado;
  }

  /** Tamanho aproximado do que já foi gravado. */
  bytesGravados() {
    return this.pedacos.reduce((t, p) => t + p.size, 0);
  }

  parar(): Promise<Resultado> {
    const recorder = this.recorder;
    if (!recorder || this.estado === "parado") return Promise.reject(new Error("Nada gravando."));
    const duracaoMs = this.duracaoMs();
    return new Promise((resolve) => {
      recorder.onstop = () => {
        const tipo = recorder.mimeType || "video/webm";
        const blob = new Blob(this.pedacos, { type: tipo });
        this.pedacos = [];
        this.recorder = null;
        this.estado = "parado";
        this.onMudanca();
        resolve({ blob, tipo, extensao: tipo.includes("mp4") ? "mp4" : "webm", duracaoMs });
      };
      recorder.stop();
    });
  }

  /** Solta câmera, microfone, tela e o relógio. */
  destruir() {
    this.onMudanca = () => {};
    if (this.recorder && this.recorder.state !== "inactive") this.recorder.stop();
    this.recorder = null;
    this.pararRelogio?.();
    this.pararRelogio = null;
    this.desligarCamera();
    this.desligarMicrofone();
    this.pararTela();
    this.canvasTrack.stop();
    void this.audio.close().catch(() => {});
  }
}

function desenharContido(
  ctx: CanvasRenderingContext2D,
  q: Quadro,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  const escala = Math.min(w / q.largura, h / q.altura);
  const dw = q.largura * escala;
  const dh = q.altura * escala;
  ctx.drawImage(q.imagem, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
}

function desenharCobrindo(
  ctx: CanvasRenderingContext2D,
  q: Quadro,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  const escala = Math.max(w / q.largura, h / q.altura);
  const sw = w / escala;
  const sh = h / escala;
  ctx.drawImage(q.imagem, (q.largura - sw) / 2, (q.altura - sh) / 2, sw, sh, x, y, w, h);
}
