/*
 * ============================================================
 *  PONTO DE ENTRADA DO FRONTEND — PROJETO 06 (GESSY)
 *  Inicialização do Three.js, Câmera, Controles e Interações
 * ============================================================
 */

import * as THREE from "../vendor/three.module.min.js";
import { inicializarAbertura } from "./abertura.js";
import { construirGaleria } from "./galeria.js";
import { ControladorGaleria } from "./controles.js";
import { GerenciadorInteracao } from "./interacao.js";
import { GerenciadorSurpresa } from "./surpresa.js";

// Inicia escuta da chuva de corações física (Botão BOOT) imediatamente
new GerenciadorSurpresa();

export async function iniciarAplicacao() {
  // 1. Carrega dados de configuração e memórias do JSON
  let dadosConfig = {
    aniversario: "2026-10-20T00:00:00-03:00",
    nome_homenageada: "Gessy",
    memorias: []
  };

  try {
    const resp = await fetch("memorias.json", { cache: "no-store" });
    if (resp.ok) {
      dadosConfig = await resp.json();
    }
  } catch (e) {
    console.warn("Aviso: usando configuração padrão:", e);
  }

  // 2. Inicializa tela de contagem regressiva e abertura
  inicializarAbertura(dadosConfig, () => {
    const dica = document.getElementById("dica-mobile");
    if (!dica) return;
    dica.classList.add("visivel");
    const esconder = () => dica.classList.remove("visivel");
    setTimeout(esconder, 9000);
    const controles = document.getElementById("mobile-controles");
    if (controles) {
      controles.addEventListener("touchstart", () => setTimeout(esconder, 600), { once: true, passive: true });
    }
  });

  // 3. Cria cena, câmera e renderizador Three.js
  const canvas = document.getElementById("canvas-3d");
  const cena = new THREE.Scene();
  cena.background = new THREE.Color(0x0d1117);

  const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 1.7, -5.5); // Entrada da Rotunda, olhando para o canteiro central (0, 0, 0)

  const renderizador = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    powerPreference: "high-performance"
  });
  renderizador.setSize(window.innerWidth, window.innerHeight);
  renderizador.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

  // 4. Constrói o salão neoclássico 3D
  const mundo = construirGaleria(cena, dadosConfig.memorias || [], dadosConfig);

  // 5. Controlador de movimento (Teclado, Mouse e Touch Mobile)
  const controlador = new ControladorGaleria(camera, canvas, mundo.limites);

  // Restaura posição se voltou de navegação anterior
  const posSalva = sessionStorage.getItem("gessy_posicao_galeria");
  if (posSalva) {
    try {
      const p = JSON.parse(posSalva);
      camera.position.set(p.x, p.y, p.z);
      controlador.yaw = p.yaw;
      controlador.pitch = p.pitch;
      sessionStorage.removeItem("gessy_posicao_galeria");
    } catch (e) {}
  }

  // 6. Configura interações de raycast, modal de histórias e cartinha
  const interacao = new GerenciadorInteracao(camera, mundo.quadros, controlador, dadosConfig.memorias || [], dadosConfig);

  // Botão de Modo Noite / Luz de Velas & Céu Estrelado
  const btnNoite = document.getElementById("btn-noite");
  if (btnNoite && mundo.alternarModoNoite) {
    let ativo = false;
    btnNoite.addEventListener("click", () => {
      ativo = mundo.alternarModoNoite();
      btnNoite.textContent = ativo ? "☀️" : "🕯️";
      btnNoite.title = ativo ? "Voltar ao Modo Clássico" : "Modo Luz de Velas & Céu Estrelado";
    });
  }

  // Botão direto na barra para abrir a Cartinha Secreta
  const btnAbrirCarta = document.getElementById("btn-abrir-carta");
  if (btnAbrirCarta) {
    btnAbrirCarta.addEventListener("click", () => {
      interacao.abrirCartaSecreta();
    });
  }

  // 7. Redimensionamento e rotação de tela dinâmicos
  function ajustarTela() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.fov = camera.aspect < 1 ? 80 : 65; // Mais aberto no celular em pé
    camera.updateProjectionMatrix();
    renderizador.setSize(window.innerWidth, window.innerHeight);
  }
  window.addEventListener("resize", ajustarTela);
  window.addEventListener("orientationchange", () => setTimeout(ajustarTela, 250));
  ajustarTela();

  // 8. Loop de animação contínuo a 60 FPS
  const clock = new THREE.Clock();
  function animar() {
    requestAnimationFrame(animar);
    const delta = Math.min(clock.getDelta(), 0.1);

    controlador.atualizar(delta);
    interacao.atualizar();
    if (mundo.animarCenario) {
      mundo.animarCenario(delta);
    } else if (mundo.animarCoracoes) {
      mundo.animarCoracoes(delta);
    }

    renderizador.render(cena, camera);
  }
  animar();
}

// Inicia automaticamente quando a página carrega
window.addEventListener("DOMContentLoaded", iniciarAplicacao);
