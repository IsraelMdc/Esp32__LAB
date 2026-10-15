/*
 * ============================================================
 *  ABERTURA, CONTAGEM REGRESSIVA & TRILHA SONORA (COM WEB AUDIO)
 * ============================================================
 */

import { aoProgredirCarregamento, promessaFloresProntas } from "./flores_realistas.js";

let audioPlayer = null;
let musicaAtiva = true;
let sintetizadorAtivo = false;
let audioCtx = null;
let sintetizadorTimer = null;

// Sintetizador procedural de caixinha de música romântica (Fallback garantido sem 404)
function iniciarCaixaDeMusica() {
  if (sintetizadorAtivo) return;
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    if (!audioCtx) audioCtx = new AudioContextClass();
    if (audioCtx.state === "suspended") audioCtx.resume();

    sintetizadorAtivo = true;

    // Notas da escala pentatônica maior doce (C4, D4, E4, G4, A4, C5, D5, E5, G5)
    const escala = [
      261.63, 293.66, 329.63, 392.00, 440.00,
      523.25, 587.33, 659.25, 783.99
    ];

    // Padrão melódico suave estilo caixa de música de ninar/romântica
    const melodia = [
      2, 4, 5, 4, 2, 0, 2, 4,
      3, 5, 7, 5, 3, 1, 3, 5,
      4, 6, 7, 6, 4, 2, 4, 6,
      5, 7, 8, 7, 5, 4, 2, 0
    ];

    let passo = 0;
    sintetizadorTimer = setInterval(() => {
      if (!musicaAtiva || !sintetizadorAtivo || !audioCtx) return;

      const notaIdx = melodia[passo % melodia.length];
      passo++;
      const freq = escala[notaIdx] || 440;

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

      // Ataque rápido e decaimento exponencial tipo caixinha de música
      const agora = audioCtx.currentTime;
      gain.gain.setValueAtTime(0.0001, agora);
      gain.gain.exponentialRampToValueAtTime(0.12, agora + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, agora + 0.9);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(agora);
      osc.stop(agora + 0.95);
    }, 450);
  } catch (e) {
    console.warn("Web Audio não suportado ou bloqueado:", e);
  }
}

function pararCaixaDeMusica() {
  sintetizadorAtivo = false;
  if (sintetizadorTimer) {
    clearInterval(sintetizadorTimer);
    sintetizadorTimer = null;
  }
}

export function inicializarAbertura(config, aoEntrarCallback) {
  const modal = document.getElementById("modal-abertura");
  const titulo = document.getElementById("abertura-titulo");
  const sub = document.getElementById("abertura-sub");
  const gridContagem = document.getElementById("grid-contagem");
  const btnEntrar = document.getElementById("btn-entrar");
  const btnSom = document.getElementById("btn-som");

  let temMp3 = false;
  if (config.musica && config.musica.trim() !== "") {
    try {
      audioPlayer = new Audio(config.musica);
      audioPlayer.loop = true;
      audioPlayer.volume = 0.6;
      temMp3 = true;

      const tempoSalvo = sessionStorage.getItem("gessy_musica_tempo");
      if (tempoSalvo) audioPlayer.currentTime = parseFloat(tempoSalvo);

      audioPlayer.addEventListener("error", () => {
        // Se falhar o MP3 (ex: 404), ativa a caixinha de música procedural sem erro!
        audioPlayer = null;
        if (musicaAtiva) iniciarCaixaDeMusica();
      });
    } catch (e) {
      audioPlayer = null;
    }
  }

  if (btnSom) {
    btnSom.addEventListener("click", () => {
      musicaAtiva = !musicaAtiva;
      if (musicaAtiva) {
        if (audioPlayer) {
          audioPlayer.play().catch(() => iniciarCaixaDeMusica());
        } else {
          iniciarCaixaDeMusica();
        }
        btnSom.textContent = "🔊";
      } else {
        if (audioPlayer) audioPlayer.pause();
        pararCaixaDeMusica();
        btnSom.textContent = "🔇";
      }
    });
  }

  // Verifica se já entrou nesta sessão
  const jaEntrou = sessionStorage.getItem("gessy_entrou_sessao") === "1";
  const urlParams = new URLSearchParams(window.location.search);
  const modoPreview = urlParams.get("preview") === "1";

  // Data do aniversário: 20 de Outubro
  const dataAlvo = new Date(config.aniversario || "2026-10-20T00:00:00-03:00").getTime();

  const barraProgresso = document.getElementById("barra-progresso-flores");
  const textoProgresso = document.getElementById("texto-progresso-flores");
  let floresProntas = false;

  aoProgredirCarregamento((pct) => {
    if (barraProgresso) barraProgresso.style.width = pct + "%";
    if (textoProgresso) {
      if (pct < 100) {
        textoProgresso.textContent = `Cultivando o jardim de flores... ${pct}%`;
      } else {
        textoProgresso.textContent = "✨ Jardim florescido com todo amor!";
      }
    }
  });

  let contagemZerada = false;

  function atualizarContagem() {
    const agora = new Date().getTime();
    const diferenca = dataAlvo - agora;

    if (diferenca <= 0 || modoPreview) {
      contagemZerada = true;
      if (gridContagem) gridContagem.style.display = "none";
      if (titulo) titulo.textContent = `Feliz Aniversário, ${config.nome_homenageada || "Gessy"}! 🎂`;
      if (sub) sub.textContent = "Preparei esta galeria 3D especial com as nossas melhores memórias. Toque abaixo para passear pelo nosso salão.";
      
      if (btnEntrar) {
        btnEntrar.style.display = "inline-flex";
        if (floresProntas) {
          btnEntrar.disabled = false;
          btnEntrar.innerHTML = `
            <span class="btn-icone-galeria">🖼</span>
            <span class="btn-texto-galeria">Descobrir nossa galeria</span>
            <span class="btn-seta-galeria">→</span>
          `;
          btnEntrar.style.cursor = "pointer";
        } else {
          btnEntrar.disabled = true;
          btnEntrar.innerHTML = `
            <span class="btn-icone-galeria">🌸</span>
            <span class="btn-texto-galeria">Cultivando o jardim...</span>
          `;
          btnEntrar.style.cursor = "wait";
        }
      }
      return true;
    } else {
      contagemZerada = false;
      const dias = Math.floor(diferenca / (1000 * 60 * 60 * 24));
      const horas = Math.floor((diferenca % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutos = Math.floor((diferenca % (1000 * 60 * 60)) / (1000 * 60));
      const segundos = Math.floor((diferenca % (1000 * 60)) / 1000);

      const elDias = document.getElementById("tempo-dias");
      const elHoras = document.getElementById("tempo-horas");
      const elMin = document.getElementById("tempo-min");
      const elSeg = document.getElementById("tempo-seg");

      if (elDias) elDias.textContent = String(dias).padStart(2, "0");
      if (elHoras) elHoras.textContent = String(horas).padStart(2, "0");
      if (elMin) elMin.textContent = String(minutos).padStart(2, "0");
      if (elSeg) elSeg.textContent = String(segundos).padStart(2, "0");

      if (titulo) titulo.textContent = `${config.nome_homenageada || "Gessy"}, prepare seu coração...`;
      if (sub) sub.textContent = `Estamos contando cada segundo para celebrar você.`;
      
      // TRAVA ATIVA: Botão desabilitado com cadeado enquanto o cronômetro não zerar
      if (btnEntrar) {
        btnEntrar.style.display = "inline-flex";
        btnEntrar.disabled = true;
        btnEntrar.style.cursor = "not-allowed";
        btnEntrar.innerHTML = `
          <span class="btn-icone-galeria">🔒</span>
          <span class="btn-texto-galeria">Aguardando a data especial...</span>
        `;
      }
      return false;
    }
  }

  function liberarBotaoEntrar() {
    floresProntas = true;
    if (barraProgresso) barraProgresso.style.width = "100%";
    if (textoProgresso) textoProgresso.textContent = "Cada segundo nos aproxima de um momento especial ♡";
    if (contagemZerada) {
      if (btnEntrar) {
        btnEntrar.disabled = false;
        btnEntrar.innerHTML = `
          <span class="btn-icone-galeria">🖼</span>
          <span class="btn-texto-galeria">Descobrir nossa galeria</span>
          <span class="btn-seta-galeria">→</span>
        `;
        btnEntrar.style.cursor = "pointer";
      }
    }
  }

  promessaFloresProntas.then(() => {
    liberarBotaoEntrar();
  });

  // Timeout de segurança (7 segundos) para o carregamento 3D
  setTimeout(() => {
    if (!floresProntas) liberarBotaoEntrar();
  }, 7000);

  const liberado = atualizarContagem();
  const timer = setInterval(() => {
    if (atualizarContagem()) clearInterval(timer);
  }, 1000);

  function entrarNaGaleria() {
    // Trava de segurança: impede entrada se a contagem não tiver zerado (a menos que seja preview)
    if (!contagemZerada && !modoPreview) {
      console.warn("Acesso bloqueado: o cronômetro ainda está em andamento.");
      return;
    }

    sessionStorage.setItem("gessy_entrou_sessao", "1");
    if (modal) modal.classList.add("oculto");

    // Inicia música ou caixinha procedural
    if (musicaAtiva) {
      if (audioPlayer) {
        audioPlayer.play().catch(() => {
          iniciarCaixaDeMusica();
        });
        setInterval(() => {
          if (audioPlayer && !audioPlayer.paused) {
            sessionStorage.setItem("gessy_musica_tempo", audioPlayer.currentTime);
          }
        }, 1000);
      } else {
        iniciarCaixaDeMusica();
      }
    }

    if (aoEntrarCallback) aoEntrarCallback();
  }

  // Só pula direto para a galeria se já entrou NESTA sessão E se o cronômetro estiver zerado
  if (jaEntrou && (contagemZerada || modoPreview)) {
    entrarNaGaleria();
  } else if (btnEntrar) {
    btnEntrar.addEventListener("click", () => {
      if (contagemZerada || modoPreview) {
        entrarNaGaleria();
      }
    });
  }
}
