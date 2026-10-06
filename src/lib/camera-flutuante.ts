// Janela flutuante da câmera, sempre por cima de tudo (Document Picture-in-Picture
// do Chrome/Edge). Ela entra no vídeo porque a gravação é da tela inteira; a
// pessoa arrasta a janela para onde quiser, por cima da apresentação.
//
// Os controles (tempo, pausar, parar) só aparecem com o mouse em cima da janela,
// para não saírem no vídeo. Sem Document PiP (Safari, Firefox) cai no PiP comum
// do <video>, que só mostra a câmera.

type Controles = {
  estado: () => "parado" | "gravando" | "pausado";
  duracaoMs: () => number;
  onPausar: () => void;
  onRetomar: () => void;
  onParar: () => void;
};

export type CameraFlutuante = {
  /** Atualiza tempo e botões (chamar quando o estado da gravação muda). */
  atualizar: () => void;
  /** Número grande no meio da janela durante a contagem; null tira. */
  contagem: (n: number | null) => void;
  trocarCamera: (stream: MediaStream | null) => void;
  /** Vira a imagem na horizontal. Sai assim no vídeo (a gravação é da tela). */
  inverter: (sim: boolean) => void;
  fechar: () => void;
};

type DocumentPiP = {
  requestWindow: (o: { width: number; height: number }) => Promise<Window>;
  window: Window | null;
};

function documentPiP(): DocumentPiP | null {
  return (
    (window as unknown as { documentPictureInPicture?: DocumentPiP }).documentPictureInPicture ??
    null
  );
}

export function suportaCameraFlutuante() {
  return (
    !!documentPiP() || ("pictureInPictureEnabled" in document && document.pictureInPictureEnabled)
  );
}

/** Precisa ser chamada direto num clique (o navegador exige gesto). */
export async function abrirCameraFlutuante(
  stream: MediaStream,
  controles: Controles,
  aoFechar: () => void,
  invertida = false,
): Promise<CameraFlutuante> {
  const dpip = documentPiP();
  if (!dpip) return abrirPiPSimples(stream, aoFechar);

  const janela = await dpip.requestWindow({ width: 300, height: 300 });
  const doc = janela.document;
  doc.title = "Câmera";

  const estilo = doc.createElement("style");
  estilo.textContent = `
    html, body { margin: 0; height: 100%; background: #121110; overflow: hidden;
      font-family: Inter, system-ui, sans-serif; }
    video { position: fixed; inset: 0; width: 100%; height: 100%; object-fit: cover; }
    video.invertida { transform: scaleX(-1); }
    .barra { position: fixed; left: 8px; right: 8px; bottom: 8px; display: flex; gap: 6px;
      align-items: center; padding: 6px; border-radius: 10px; background: rgba(18,17,16,.82);
      color: #fff; opacity: 0; transition: opacity .15s; }
    body:hover .barra { opacity: 1; }
    .tempo { flex: 1; font-size: 13px; font-weight: 600; font-variant-numeric: tabular-nums;
      display: flex; align-items: center; gap: 6px; padding-left: 4px; }
    .ponto { width: 8px; height: 8px; border-radius: 50%; background: #A8A29E; }
    .gravando .ponto { background: #EF4444; }
    button { border: 0; border-radius: 7px; padding: 6px 10px; font: inherit; font-size: 12px;
      font-weight: 600; cursor: pointer; background: rgba(255,255,255,.14); color: #fff; }
    button.parar { background: #fff; color: #121110; }
    button[hidden] { display: none; }
    .contagem { position: fixed; inset: 0; display: flex; align-items: center;
      justify-content: center; background: rgba(0,0,0,.5); color: #fff; font-size: 96px;
      font-weight: 600; }
    .contagem[hidden] { display: none; }
    .sem { position: fixed; inset: 0; display: flex; align-items: center; justify-content: center;
      color: #A8A29E; font-size: 13px; }
    /* Sem isto o display:flex acima vence o atributo hidden e o aviso fica
       por cima da câmera ligada. */
    .sem[hidden] { display: none; }
  `;
  doc.head.append(estilo);

  const video = doc.createElement("video");
  video.autoplay = true;
  video.muted = true;
  video.playsInline = true;
  video.classList.toggle("invertida", invertida);

  const sem = doc.createElement("div");
  sem.className = "sem";
  sem.textContent = "Câmera desligada";

  const barra = doc.createElement("div");
  barra.className = "barra";
  const tempo = doc.createElement("div");
  tempo.className = "tempo";
  const ponto = doc.createElement("span");
  ponto.className = "ponto";
  const tempoTexto = doc.createElement("span");
  tempo.append(ponto, tempoTexto);
  const pausar = doc.createElement("button");
  const parar = doc.createElement("button");
  parar.className = "parar";
  parar.textContent = "Parar";
  barra.append(tempo, pausar, parar);

  const contagemEl = doc.createElement("div");
  contagemEl.className = "contagem";
  contagemEl.hidden = true;

  doc.body.append(video, sem, barra, contagemEl);

  pausar.onclick = () =>
    controles.estado() === "pausado" ? controles.onRetomar() : controles.onPausar();
  parar.onclick = () => controles.onParar();

  function trocarCamera(s: MediaStream | null) {
    video.srcObject = s;
    sem.hidden = !!s;
    if (s) void video.play().catch(() => {});
  }

  function atualizar() {
    const estado = controles.estado();
    barra.style.display = estado === "parado" ? "none" : "";
    barra.classList.toggle("gravando", estado === "gravando");
    pausar.textContent = estado === "pausado" ? "Retomar" : "Pausar";
    tempoTexto.textContent = formatarTempo(controles.duracaoMs());
  }

  // O relógio da janela: uma vez por segundo basta (e é o que o Chrome deixa
  // rodar com a aba do CRM em segundo plano).
  const relogio = janela.setInterval(atualizar, 500);

  let fechada = false;
  janela.addEventListener("pagehide", () => {
    if (fechada) return;
    fechada = true;
    janela.clearInterval(relogio);
    aoFechar();
  });

  trocarCamera(stream);
  atualizar();

  return {
    atualizar,
    contagem: (n) => {
      contagemEl.hidden = n === null;
      contagemEl.textContent = n === null ? "" : String(n);
    },
    trocarCamera,
    inverter: (sim) => video.classList.toggle("invertida", sim),
    fechar: () => {
      if (!fechada) janela.close();
    },
  };
}

async function abrirPiPSimples(
  stream: MediaStream,
  aoFechar: () => void,
): Promise<CameraFlutuante> {
  const video = document.createElement("video");
  video.muted = true;
  video.playsInline = true;
  video.srcObject = stream;
  await video.play();
  await video.requestPictureInPicture();
  video.addEventListener("leavepictureinpicture", () => aoFechar(), { once: true });
  return {
    atualizar: () => {},
    contagem: () => {},
    trocarCamera: (s) => {
      video.srcObject = s;
    },
    // O PiP comum (Safari/Firefox) é desenhado pelo navegador e ignora CSS.
    inverter: () => {},
    fechar: () => {
      if (document.pictureInPictureElement === video) void document.exitPictureInPicture();
    },
  };
}

export function formatarTempo(ms: number) {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const seg = String(s % 60).padStart(2, "0");
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${seg}` : `${m}:${seg}`;
}
