// Gravador de tela + câmera que roda só no navegador: nada sobe para servidor.
//
// A trilha da tela vai direto para o MediaRecorder, sem montar quadro nenhum em
// JavaScript. A câmera aparece no vídeo porque fica numa janela flutuante por
// cima de tudo (ver camera-flutuante.ts) e a pessoa compartilha a tela inteira.
//
// Por que assim: a primeira versão montava tela + câmera num canvas 1920x1080 a
// 30 quadros por segundo e, no Mac da Legacy (gráfico integrado), gravava a ~5
// quadros por segundo e travava o Chrome. Montar no Worker também não aguentou.
// Gravar a trilha da tela direto não custa quase nada.
//
// O áudio (microfone + som da tela, quando houver) é misturado num AudioContext.

const FPS = 30;
const LARGURA_MAX = 1920;
const ALTURA_MAX = 1080;

export function navegadorSuporta() {
  return (
    typeof navigator !== "undefined" &&
    !!navigator.mediaDevices?.getUserMedia &&
    !!navigator.mediaDevices?.getDisplayMedia &&
    typeof MediaRecorder !== "undefined"
  );
}

const FORMATOS = [
  "video/mp4;codecs=avc1.640028,mp4a.40.2",
  "video/mp4;codecs=avc1,mp4a.40.2",
  "video/mp4",
  "video/webm;codecs=vp9,opus",
  "video/webm;codecs=vp8,opus",
  "video/webm",
];

function escolherFormato() {
  return FORMATOS.find((f) => MediaRecorder.isTypeSupported(f)) ?? "";
}

export type Resultado = { blob: Blob; tipo: string; extensao: "mp4" | "webm"; duracaoMs: number };

export type Estado = "parado" | "gravando" | "pausado";

export class Gravador {
  private camStream: MediaStream | null = null;
  private micStream: MediaStream | null = null;
  private telaStream: MediaStream | null = null;

  private audio: AudioContext;
  private destino: MediaStreamAudioDestinationNode;
  private micNode: MediaStreamAudioSourceNode | null = null;
  private telaAudioNode: MediaStreamAudioSourceNode | null = null;
  readonly analisador: AnalyserNode;

  private recorder: MediaRecorder | null = null;
  private pedacos: Blob[] = [];
  private bytes = 0;
  private inicio = 0;
  private acumulado = 0;

  estado: Estado = "parado";
  /** Avisa a tela quando algo muda fora dela (ex.: "Parar compartilhamento" do Chrome). */
  onMudanca: () => void = () => {};
  /** A trilha gravada acabou no meio da gravação (a pessoa parou o compartilhamento). */
  onFonteEncerrada: () => void = () => {};

  constructor() {
    this.audio = new AudioContext();
    this.destino = this.audio.createMediaStreamDestination();
    this.analisador = this.audio.createAnalyser();
    this.analisador.fftSize = 512;
  }

  get camera() {
    return this.camStream;
  }
  get tela() {
    return this.telaStream;
  }
  get temCamera() {
    return !!this.camStream;
  }
  get temMicrofone() {
    return !!this.micNode;
  }
  get temTela() {
    return !!this.telaStream;
  }
  get temAudioDaTela() {
    return !!this.telaAudioNode;
  }
  private camVideo() {
    return this.camStream?.getVideoTracks()[0] ?? null;
  }

  /** Chamar direto no clique: o Chrome só libera o áudio com gesto da pessoa. */
  acordarAudio() {
    void this.audio.resume();
  }

  async ligarCamera(deviceId?: string) {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        deviceId: deviceId ? { exact: deviceId } : undefined,
        width: { ideal: 1280 },
        height: { ideal: 720 },
        frameRate: { ideal: FPS, max: FPS },
      },
    });
    this.desligarCamera();
    this.camStream = stream;
    this.onMudanca();
  }

  desligarCamera() {
    if (!this.camStream) return;
    this.camStream.getTracks().forEach((t) => t.stop());
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
    if (!this.micStream) return;
    this.micNode?.disconnect();
    this.micNode = null;
    this.micStream.getTracks().forEach((t) => t.stop());
    this.micStream = null;
    this.onMudanca();
  }

  /** Abre o seletor do navegador já sugerindo "Tela inteira". Rejeita se a pessoa cancelar. */
  async compartilharTela() {
    const opcoes = {
      video: {
        displaySurface: "monitor",
        frameRate: { ideal: FPS, max: FPS },
        // Monitor ultrawide ou 4K vem reduzido pelo próprio Chrome.
        width: { max: LARGURA_MAX },
        height: { max: ALTURA_MAX },
      },
      audio: true,
      selfBrowserSurface: "exclude",
      // Trocar de fonte no meio muda a resolução, e o MP4 não aceita isso.
      surfaceSwitching: "exclude",
      systemAudio: "include",
      monitorTypeSurfaces: "include",
    } as DisplayMediaStreamOptions;
    const stream = await navigator.mediaDevices.getDisplayMedia(opcoes);
    this.pararTela();
    void this.audio.resume();
    this.telaStream = stream;
    const video = stream.getVideoTracks()[0];
    video.contentHint = "detail";
    // Botão "Parar compartilhamento" do Chrome.
    video.addEventListener("ended", () => {
      if (this.telaStream !== stream) return;
      const gravandoEla = this.recorder?.stream.getVideoTracks()[0] === video;
      this.pararTela();
      if (gravandoEla) this.onFonteEncerrada();
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
    if (!this.telaStream) return;
    this.telaAudioNode?.disconnect();
    this.telaAudioNode = null;
    this.telaStream.getTracks().forEach((t) => t.stop());
    this.telaStream = null;
    this.onMudanca();
  }

  // -------------------------------------------------------------------------

  iniciar() {
    if (this.estado !== "parado") return;
    if (this.audio.state !== "running") {
      // Sem o áudio rodando o MP4 não avança (o vídeo para no primeiro segundo).
      throw new Error("O áudio do navegador está pausado. Clique em Gravar de novo.");
    }
    const video = this.telaStream?.getVideoTracks()[0] ?? this.camVideo();
    if (!video) throw new Error("Compartilhe a tela ou ligue a câmera para gravar.");

    // Sempre manda a trilha de áudio misturada (mesmo muda) para o arquivo ter som
    // quando o microfone entrar no meio da gravação.
    const trilhas = [video, ...this.destino.stream.getAudioTracks()];
    const recorder = new MediaRecorder(new MediaStream(trilhas), {
      mimeType: escolherFormato() || undefined,
      videoBitsPerSecond: 5_000_000,
      audioBitsPerSecond: 128_000,
    });
    this.pedacos = [];
    this.bytes = 0;
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        this.pedacos.push(e.data);
        this.bytes += e.data.size;
      }
    };
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
    return this.bytes;
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
      if (recorder.state === "inactive") recorder.onstop(new Event("stop"));
      else recorder.stop();
    });
  }

  /** Solta câmera, microfone e tela. */
  destruir() {
    this.onMudanca = () => {};
    this.onFonteEncerrada = () => {};
    if (this.recorder && this.recorder.state !== "inactive") this.recorder.stop();
    this.recorder = null;
    this.desligarCamera();
    this.desligarMicrofone();
    this.pararTela();
    void this.audio.close().catch(() => {});
  }
}
