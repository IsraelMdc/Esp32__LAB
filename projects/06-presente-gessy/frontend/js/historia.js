/*
 * ============================================================
 *  PÁGINA DE HISTÓRIA — PROJETO 06 (GESSY)
 * ============================================================
 */

import { GerenciadorSurpresa } from "./surpresa.js";

async function carregarHistoria() {
  new GerenciadorSurpresa();

  // Lê id da memória da URL: historia.html?id=1
  const params = new URLSearchParams(window.location.search);
  const idAtual = parseInt(params.get("id"), 10) || 1;

  let config = { memorias: [] };
  try {
    const resp = await fetch("memorias.json", { cache: "no-store" });
    if (resp.ok) config = await resp.json();
  } catch (e) {
    console.error("Erro ao carregar dados:", e);
  }

  const memorias = config.memorias || [];
  const indexAtual = memorias.findIndex((m) => m.id === idAtual);
  const memoria = indexAtual !== -1 ? memorias[indexAtual] : memorias[0];

  if (!memoria) return;

  // Notifica o ESP32 sobre a visita (para piscar LED e registrar na Serial)
  fetch(`/api/visita?id=${memoria.id}&titulo=${encodeURIComponent(memoria.titulo)}`, { cache: "no-store" }).catch(() => {});

  // Preenche elementos na tela
  document.title = `${memoria.titulo} · Galeria da Gessy 💛`;
  document.getElementById("historia-tag").textContent = `MEMÓRIA #${memoria.id}`;
  document.getElementById("historia-titulo").textContent = memoria.titulo;
  document.getElementById("historia-data").textContent = `📅 ${memoria.data}`;
  document.getElementById("historia-texto").textContent = memoria.texto;

  const elFoto = document.getElementById("historia-foto");
  if (elFoto) {
    elFoto.src = memoria.foto;
    elFoto.alt = memoria.titulo;
  }

  // Configura botões de paginação Anterior / Próxima
  const btnAnt = document.getElementById("btn-anterior");
  const btnProx = document.getElementById("btn-proxima");

  if (indexAtual > 0) {
    btnAnt.href = `historia.html?id=${memorias[indexAtual - 1].id}`;
    btnAnt.classList.remove("desabilitado");
  } else {
    btnAnt.classList.add("desabilitado");
  }

  if (indexAtual < memorias.length - 1) {
    btnProx.href = `historia.html?id=${memorias[indexAtual + 1].id}`;
    btnProx.classList.remove("desabilitado");
  } else {
    btnProx.classList.add("desabilitado");
  }

  // Continua música se estiver ativa
  const btnSom = document.getElementById("btn-som");
  if (config.musica && config.musica.trim() !== "") {
    const audio = new Audio(config.musica);
    audio.loop = true;
    audio.volume = 0.6;
    const tempoSalvo = sessionStorage.getItem("gessy_musica_tempo");
    if (tempoSalvo) audio.currentTime = parseFloat(tempoSalvo);

    let tocando = false;

    // Tenta retomar se o usuário já liberou na galeria
    if (sessionStorage.getItem("gessy_entrou_sessao") === "1") {
      audio.play().then(() => {
        tocando = true;
      }).catch(() => {});
    }

    if (btnSom) {
      btnSom.addEventListener("click", () => {
        tocando = !tocando;
        if (tocando) {
          audio.play().catch(() => {});
          btnSom.textContent = "🔊";
        } else {
          audio.pause();
          btnSom.textContent = "🔇";
        }
      });
    }

    // Salva tempo continuamente
    setInterval(() => {
      if (!audio.paused) {
        sessionStorage.setItem("gessy_musica_tempo", audio.currentTime);
      }
    }, 1000);
  } else if (btnSom) {
    btnSom.style.display = "none";
  }
}

carregarHistoria();

