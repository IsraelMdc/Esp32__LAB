/*
 * ============================================================
 *  CENA 3D DA GALERIA NEOCLÁSSICA & JARDIM FLORAL — PROJETO 06 (GESSY)
 *  Ambiente com 4 Zonas: Hall de Gala, Galeria com Arandelas,
 *  Altar Floral de Presente (Lírios, Gérberas e Rosas) e Painel Final.
 * ============================================================
 */

import * as THREE from "../vendor/three.module.min.js";
import { criarLirioRealista, criarGerberaRealista, criarRosaRealista } from "./flores_realistas.js";

// ------------------------------------------------------------
//  Geradores Procedurais de Texturas (0 KB de Download)
// ------------------------------------------------------------

function criarTexturaMadeira() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#8a5a36";
  ctx.fillRect(0, 0, 512, 512);

  const tabuas = 8;
  const hTabua = 512 / tabuas;
  for (let i = 0; i < tabuas; i++) {
    const y = i * hTabua;
    ctx.fillStyle = (i % 2 === 0) ? "#9c6644" : "#7f5539";
    ctx.fillRect(0, y, 512, hTabua);

    ctx.strokeStyle = "rgba(0, 0, 0, 0.12)";
    ctx.lineWidth = 1.5;
    for (let r = 0; r < 6; r++) {
      ctx.beginPath();
      ctx.moveTo(0, y + (r * hTabua / 6) + (Math.sin(r) * 3));
      ctx.bezierCurveTo(150, y + (r * 10), 350, y + (r * 12), 512, y + (r * 10));
      ctx.stroke();
    }

    ctx.strokeStyle = "rgba(40, 20, 10, 0.7)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 16);
  return tex;
}

function criarTexturaParede() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#ede0d4";
  ctx.fillRect(0, 0, 256, 256);

  ctx.fillStyle = "rgba(0, 0, 0, 0.03)";
  for (let i = 0; i < 3000; i++) {
    const x = Math.random() * 256;
    const y = Math.random() * 256;
    ctx.fillRect(x, y, 2, 2);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(6, 6);
  return tex;
}

function criarTexturaTapete() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#780016";
  ctx.fillRect(0, 0, 512, 512);

  ctx.fillStyle = "rgba(0, 0, 0, 0.07)";
  for (let i = 0; i < 4000; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    ctx.fillRect(x, y, 2, 2);
  }

  const bordaL = 36;
  ctx.fillStyle = "#ffd166";
  ctx.fillRect(0, 0, bordaL, 512);
  ctx.fillRect(512 - bordaL, 0, bordaL, 512);

  ctx.strokeStyle = "#cca01d";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(bordaL + 8, 0); ctx.lineTo(bordaL + 8, 512);
  ctx.moveTo(512 - bordaL - 8, 0); ctx.lineTo(512 - bordaL - 8, 512);
  ctx.stroke();

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1, 8);
  return tex;
}

function criarTexturaJanelaNoturna() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 768;
  const ctx = canvas.getContext("2d");

  const grad = ctx.createLinearGradient(0, 0, 0, 768);
  grad.addColorStop(0, "#080c1a");
  grad.addColorStop(0.55, "#141c38");
  grad.addColorStop(0.85, "#251b3d");
  grad.addColorStop(1.0, "#3f2b4c");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 768);

  ctx.fillStyle = "#ffffff";
  for (let i = 0; i < 110; i++) {
    const sx = Math.random() * 512;
    const sy = Math.random() * 450;
    const sRaio = Math.random() * 1.6;
    ctx.beginPath();
    ctx.arc(sx, sy, sRaio, 0, Math.PI * 2);
    ctx.fill();
  }

  const lx = 370, ly = 190, lRaio = 55;
  const halo = ctx.createRadialGradient(lx, ly, lRaio * 0.8, lx, ly, lRaio * 3.0);
  halo.addColorStop(0, "rgba(255, 248, 225, 0.95)");
  halo.addColorStop(0.4, "rgba(255, 235, 180, 0.38)");
  halo.addColorStop(1, "rgba(255, 220, 150, 0)");
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(lx, ly, lRaio * 3.0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#fffdf7";
  ctx.beginPath();
  ctx.arc(lx, ly, lRaio, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#111422";
  ctx.beginPath();
  ctx.moveTo(0, 600);
  ctx.quadraticCurveTo(120, 520, 260, 570);
  ctx.quadraticCurveTo(390, 530, 512, 590);
  ctx.lineTo(512, 768);
  ctx.lineTo(0, 768);
  ctx.fill();

  ctx.fillStyle = "#090b12";
  const arvores = [45, 110, 180, 430, 480];
  arvores.forEach(ax => {
    ctx.beginPath();
    ctx.moveTo(ax, 768);
    ctx.lineTo(ax - 20, 620);
    ctx.quadraticCurveTo(ax, 480, ax + 20, 620);
    ctx.lineTo(ax, 768);
    ctx.fill();
  });

  ctx.strokeStyle = "#ffd166";
  ctx.lineWidth = 6;
  ctx.strokeRect(10, 10, 492, 748);
  ctx.beginPath();
  ctx.moveTo(256, 10); ctx.lineTo(256, 758);
  ctx.moveTo(10, 260); ctx.lineTo(502, 260);
  ctx.moveTo(10, 510); ctx.lineTo(502, 510);
  ctx.stroke();

  return new THREE.CanvasTexture(canvas);
}

function criarTexturaEspelho() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 768;
  const ctx = canvas.getContext("2d");

  const grad = ctx.createLinearGradient(0, 0, 512, 768);
  grad.addColorStop(0, "#bcc5ce");
  grad.addColorStop(0.3, "#e2e8f0");
  grad.addColorStop(0.7, "#cbd5e1");
  grad.addColorStop(1, "#94a3b8");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 768);

  ctx.strokeStyle = "rgba(180, 130, 40, 0.75)";
  ctx.lineWidth = 8;
  ctx.strokeRect(18, 18, 476, 732);
  ctx.lineWidth = 2.5;
  ctx.strokeRect(30, 30, 452, 708);

  ctx.fillStyle = "#5c3d11";
  ctx.font = "italic 26px Georgia, serif";
  ctx.textAlign = "center";
  ctx.fillText("Espelho, espelho meu...", 256, 160);

  ctx.fillStyle = "#7b1113";
  ctx.font = "bold 33px Georgia, serif";
  ctx.fillText("Existe alguém mais linda,", 256, 235);
  ctx.fillText("especial e amada", 256, 285);
  ctx.fillText("do que a Gessy?", 256, 335);

  ctx.fillStyle = "#c1121f";
  ctx.font = "38px serif";
  ctx.fillText("✨ 💛 ✨", 256, 415);

  ctx.fillStyle = "#3d2b1f";
  ctx.font = "italic 24px Georgia, serif";
  ctx.fillText("Resposta do Universo:", 256, 510);
  ctx.font = "bold 28px Georgia, serif";
  ctx.fillStyle = "#800f2f";
  ctx.fillText("Não existe! Ela é única. ✨", 256, 560);

  ctx.fillStyle = "rgba(100, 65, 15, 0.65)";
  ctx.font = "18px -apple-system, sans-serif";
  ctx.fillText("Toque para ver a surpresa 👆", 256, 675);

  return new THREE.CanvasTexture(canvas);
}

function criarTexturaPlaca(titulo, data) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#161b22";
  ctx.fillRect(0, 0, 512, 128);

  ctx.strokeStyle = "#ffd166";
  ctx.lineWidth = 4;
  ctx.strokeRect(6, 6, 500, 116);

  ctx.fillStyle = "#fff8f0";
  ctx.font = "bold 28px Georgia, serif";
  ctx.textAlign = "center";
  ctx.fillText(titulo, 256, 55);

  ctx.fillStyle = "#ffd166";
  ctx.font = "italic 20px Arial, sans-serif";
  ctx.fillText(data, 256, 95);

  return new THREE.CanvasTexture(canvas);
}

function criarTexturaLetreiroFinal(nome) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#1e1e2f";
  ctx.fillRect(0, 0, 1024, 512);

  ctx.strokeStyle = "#ffd166";
  ctx.lineWidth = 8;
  ctx.strokeRect(16, 16, 992, 480);

  ctx.fillStyle = "#ff4d6d";
  ctx.font = "60px Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("♥  ♥  ♥", 512, 130);

  ctx.fillStyle = "#fff8f0";
  ctx.font = "bold 56px Georgia, serif";
  ctx.fillText(`Feliz Aniversário, ${nome || "Gessy"}!`, 512, 230);

  ctx.fillStyle = "#ffd166";
  ctx.font = "italic 32px Georgia, serif";
  ctx.fillText("Cada dia ao seu lado é uma memória inesquecível.", 512, 310);

  ctx.fillStyle = "#c9d1d9";
  ctx.font = "26px Arial, sans-serif";
  ctx.fillText("Com todo meu amor, para sempre. ✨", 512, 390);

  return new THREE.CanvasTexture(canvas);
}

// ------------------------------------------------------------
//  Construção Completa da Galeria 3D (4 Zonas Temáticas)
// ------------------------------------------------------------
export function construirGaleria(cena, memorias, config) {
  const loader = new THREE.TextureLoader();
  const quadrosInterativos = [];

  const largura = 9.0;
  const altura = 4.0;
  const espacamentoZ = 4.2;
  const qtdMemorias = memorias.length;
  const comprimento = Math.max(16.0, (qtdMemorias / 2) * espacamentoZ + 10.0);

  // 1. Piso de madeira nobre
  const geoPiso = new THREE.PlaneGeometry(largura, comprimento);
  const matPiso = new THREE.MeshStandardMaterial({
    map: criarTexturaMadeira(),
    roughness: 0.35,
    metalness: 0.12
  });
  const piso = new THREE.Mesh(geoPiso, matPiso);
  piso.rotation.x = -Math.PI / 2;
  piso.position.set(0, 0, comprimento / 2);
  cena.add(piso);

  // 2. Tapete Vermelho Real com Bordas Douradas
  const geoTapete = new THREE.PlaneGeometry(2.5, comprimento - 1.2);
  const matTapete = new THREE.MeshStandardMaterial({
    map: criarTexturaTapete(),
    roughness: 0.85,
    metalness: 0.08
  });
  const tapete = new THREE.Mesh(geoTapete, matTapete);
  tapete.rotation.x = -Math.PI / 2;
  tapete.position.set(0, 0.008, comprimento / 2);
  cena.add(tapete);

  // 3. Teto com Claraboia Estelar para o Modo Noite
  const geoTeto = new THREE.PlaneGeometry(largura, comprimento);
  const matTeto = new THREE.MeshStandardMaterial({
    color: 0x16181e,
    roughness: 0.9,
    transparent: true,
    opacity: 1.0
  });
  const teto = new THREE.Mesh(geoTeto, matTeto);
  teto.rotation.x = Math.PI / 2;
  teto.position.set(0, altura, comprimento / 2);
  cena.add(teto);

  // 4. Paredes
  const matParede = new THREE.MeshStandardMaterial({
    map: criarTexturaParede(),
    roughness: 0.82
  });

  const geoParedeLat = new THREE.PlaneGeometry(comprimento, altura);
  const paredeEsq = new THREE.Mesh(geoParedeLat, matParede);
  paredeEsq.rotation.y = Math.PI / 2;
  paredeEsq.position.set(-largura / 2, altura / 2, comprimento / 2);
  cena.add(paredeEsq);

  const paredeDir = new THREE.Mesh(geoParedeLat, matParede);
  paredeDir.rotation.y = -Math.PI / 2;
  paredeDir.position.set(largura / 2, altura / 2, comprimento / 2);
  cena.add(paredeDir);

  const geoParedeFrente = new THREE.PlaneGeometry(largura, altura);
  const paredeEntrada = new THREE.Mesh(geoParedeFrente, matParede);
  paredeEntrada.position.set(0, altura / 2, 0);
  cena.add(paredeEntrada);

  const paredeFundo = new THREE.Mesh(geoParedeFrente, matParede);
  paredeFundo.rotation.y = Math.PI;
  paredeFundo.position.set(0, altura / 2, comprimento);
  cena.add(paredeFundo);

  // Rodapés clássicos
  const matRodape = new THREE.MeshStandardMaterial({ color: 0x241d18, roughness: 0.4 });
  const geoRodapeLat = new THREE.BoxGeometry(0.12, 0.22, comprimento);
  const rodapeEsq = new THREE.Mesh(geoRodapeLat, matRodape);
  rodapeEsq.position.set(-largura / 2 + 0.06, 0.11, comprimento / 2);
  cena.add(rodapeEsq);

  const rodapeDir = new THREE.Mesh(geoRodapeLat, matRodape);
  rodapeDir.position.set(largura / 2 - 0.06, 0.11, comprimento / 2);
  cena.add(rodapeDir);

  // Materiais Globais Reutilizáveis
  const matOuro = new THREE.MeshStandardMaterial({ color: 0xffd166, roughness: 0.25, metalness: 0.85 });
  const matMarmore = new THREE.MeshStandardMaterial({ color: 0xf8f9fa, roughness: 0.3, metalness: 0.2 });
  const matFolha = new THREE.MeshStandardMaterial({ color: 0x2d6a4f, roughness: 0.6 });
  const matVeludoVermelho = new THREE.MeshStandardMaterial({ color: 0x780016, roughness: 0.85 });

  // ============================================================
  //  ZONA 1: HALL DE ENTRADA DE GALA (Z = 0 a 3.5m)
  // ============================================================

  // Cortinas Imperiais de Veludo na Entrada
  const grupoCortinaEsq = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.55, 3.8, 12), matVeludoVermelho);
  grupoCortinaEsq.position.set(-2.6, 2.0, 0.3);
  grupoCortinaEsq.scale.set(0.6, 1.0, 0.3);
  cena.add(grupoCortinaEsq);

  const grupoCortinaDir = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.55, 3.8, 12), matVeludoVermelho);
  grupoCortinaDir.position.set(2.6, 2.0, 0.3);
  grupoCortinaDir.scale.set(0.6, 1.0, 0.3);
  cena.add(grupoCortinaDir);

  // Braçadeiras douradas nas cortinas
  const bracadeiraEsq = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.03, 8, 20), matOuro);
  bracadeiraEsq.position.set(-2.6, 1.8, 0.35);
  cena.add(bracadeiraEsq);

  const bracadeiraDir = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.03, 8, 20), matOuro);
  bracadeiraDir.position.set(2.6, 1.8, 0.35);
  cena.add(bracadeiraDir);

  // Vaso Imperial de Lírios Rosas (Aparador à esquerda na entrada)
  const grupoAparadorLirios = new THREE.Group();
  grupoAparadorLirios.position.set(-2.8, 0, 1.8);
  const aparador = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.85, 0.6), matMarmore);
  aparador.position.y = 0.425;
  grupoAparadorLirios.add(aparador);

  const vasoLirios = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.14, 0.65, 16), matMarmore);
  vasoLirios.position.y = 1.15;
  grupoAparadorLirios.add(vasoLirios);

  const folhagemLirios = new THREE.Mesh(new THREE.SphereGeometry(0.3, 10, 8), matFolha);
  folhagemLirios.position.y = 1.5;
  grupoAparadorLirios.add(folhagemLirios);

  // 7 Lírios Rosas esplêndidos em diferentes orientações
  const posLiriosEntrada = [
    [0, 1.85, 0, 0, 0],
    [0.18, 1.75, 0.12, 0.3, 0.2],
    [-0.18, 1.75, 0.12, 0.3, -0.2],
    [0.16, 1.75, -0.16, -0.3, 0.2],
    [-0.16, 1.75, -0.16, -0.3, -0.2],
    [0.26, 1.62, 0, 0, 0.4],
    [-0.26, 1.62, 0, 0, -0.4]
  ];
  posLiriosEntrada.forEach(([lx, ly, lz, rx, rz]) => {
    const flor = criarLirioRealista(0.48);
    flor.position.set(lx, ly, lz);
    flor.rotation.set(rx, Math.random() * Math.PI, rz);
    grupoAparadorLirios.add(flor);
  });
  cena.add(grupoAparadorLirios);

  // Espelho Veneziano Mágico ladeado por Floreira de Gérberas (À direita)
  const grupoEspelho = new THREE.Group();
  grupoEspelho.position.set(largura / 2 - 0.08, 2.05, 2.2);
  grupoEspelho.rotation.y = -Math.PI / 2;

  const meshMolduraEspelho = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.3, 0.08), matOuro);
  grupoEspelho.add(meshMolduraEspelho);

  const texEspelho = criarTexturaEspelho();
  const matVidroEspelho = new THREE.MeshBasicMaterial({ map: texEspelho });
  const meshVidroEspelho = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 2.1), matVidroEspelho);
  meshVidroEspelho.position.z = 0.05;
  meshVidroEspelho.userData = {
    ehEspelho: true,
    ehQuadro: true,
    memoria: {
      id: "espelho",
      titulo: "Espelho Mais Sincero ✨",
      data: "Para a Mulher da Minha Vida 💛",
      foto: "",
      texto: "Espelho, espelho meu...\n\nNão existe em todo o universo mulher mais deslumbrante, inteligente, carinhosa e perfeita do que você, Gessy! Você ilumina cada segundo da minha vida e eu tenho o maior orgulho do mundo de caminhar ao seu lado. Feliz Aniversário, meu amor!"
    }
  };
  grupoEspelho.add(meshVidroEspelho);
  quadrosInterativos.push(meshVidroEspelho);
  cena.add(grupoEspelho);

  // Floreira de Gérberas Coloridas aos pés do Espelho Mágico
  const grupoFloreiraGerberas = new THREE.Group();
  grupoFloreiraGerberas.position.set(largura / 2 - 0.65, 0, 2.2);

  const baseFloreiraG = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.35, 1.8), matMarmore);
  baseFloreiraG.position.y = 0.175;
  grupoFloreiraGerberas.add(baseFloreiraG);

  const folhaFloreiraG = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.2, 1.7), matFolha);
  folhaFloreiraG.position.y = 0.4;
  grupoFloreiraGerberas.add(folhaFloreiraG);

  // 12 Gérberas alegres em tons de amarelo, laranja e coral
  const coresGerberas = [0xff9f43, 0xfeca57, 0xff5252, 0xff758f, 0xffbe76];
  for (let g = 0; g < 12; g++) {
    const corG = coresGerberas[g % coresGerberas.length];
    const florG = criarGerberaRealista(corG, 0.4);
    const gz = (g / 11 - 0.5) * 1.5;
    const gx = (Math.random() - 0.5) * 0.35;
    florG.position.set(gx, 0.52, gz);
    florG.rotation.x = (Math.random() - 0.5) * 0.3;
    florG.rotation.z = (Math.random() - 0.5) * 0.3;
    grupoFloreiraGerberas.add(florG);
  }
  cena.add(grupoFloreiraGerberas);

  // ============================================================
  //  ZONA 2: SALÃO DAS MEMÓRIAS & JANELÕES DA LUA (Z = 3.5 a L-5m)
  // ============================================================

  // Janelões Franceses com Vista para Céu Noturno e Lua Cheia
  const geoJanela = new THREE.PlaneGeometry(2.6, 2.6);
  const matJanela = new THREE.MeshBasicMaterial({ map: criarTexturaJanelaNoturna() });
  const matMolduraJanela = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3, metalness: 0.3 });

  // Janela Esquerda
  const grupoJanelaEsq = new THREE.Group();
  grupoJanelaEsq.position.set(-largura / 2 + 0.03, 2.15, 3.6);
  grupoJanelaEsq.rotation.y = Math.PI / 2;
  const meshVidroEsq = new THREE.Mesh(geoJanela, matJanela);
  const molduraJanelaEsq = new THREE.Mesh(new THREE.BoxGeometry(2.8, 2.8, 0.06), matMolduraJanela);
  molduraJanelaEsq.position.z = -0.02;
  grupoJanelaEsq.add(molduraJanelaEsq);
  grupoJanelaEsq.add(meshVidroEsq);
  cena.add(grupoJanelaEsq);

  // Janela Direita
  const grupoJanelaDir = new THREE.Group();
  grupoJanelaDir.position.set(largura / 2 - 0.03, 2.15, comprimento - 4.5);
  grupoJanelaDir.rotation.y = -Math.PI / 2;
  const meshVidroDir = new THREE.Mesh(geoJanela, matJanela);
  const molduraJanelaDir = new THREE.Mesh(new THREE.BoxGeometry(2.8, 2.8, 0.06), matMolduraJanela);
  molduraJanelaDir.position.z = -0.02;
  grupoJanelaDir.add(molduraJanelaDir);
  grupoJanelaDir.add(meshVidroDir);
  cena.add(grupoJanelaDir);

  // Pufes / Bancos Aveludados de Museu nas Laterais
  function criarBancoMuseu(bx, bz) {
    const grupoBanco = new THREE.Group();
    grupoBanco.position.set(bx, 0, bz);

    const assento = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.22, 0.7), matVeludoVermelho);
    assento.position.y = 0.45;
    grupoBanco.add(assento);

    // Pés dourados torneados
    const posPes = [[-0.7, 0.2, -0.25], [0.7, 0.2, -0.25], [-0.7, 0.2, 0.25], [0.7, 0.2, 0.25]];
    posPes.forEach(([px, py, pz]) => {
      const pe = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.03, 0.42, 8), matOuro);
      pe.position.set(px, py, pz);
      grupoBanco.add(pe);
    });

    cena.add(grupoBanco);
  }
  criarBancoMuseu(-2.2, comprimento * 0.4);
  criarBancoMuseu(2.2, comprimento * 0.65);

  // Quadros de Memórias nas Paredes com Arandelas Douradas
  const larguraMoldura = 2.4;
  const alturaMoldura = 1.8;
  const geoMoldura = new THREE.BoxGeometry(larguraMoldura, alturaMoldura, 0.08);
  const matMoldura = new THREE.MeshStandardMaterial({
    color: 0x2b1d0c,
    roughness: 0.3,
    metalness: 0.4
  });

  const geoFoto = new THREE.PlaneGeometry(larguraMoldura - 0.2, alturaMoldura - 0.2);
  const geoPlaca = new THREE.PlaneGeometry(1.6, 0.4);

  memorias.forEach((memoria, index) => {
    const ehLadoEsquerdo = (index % 2 === 0);
    const posZ = 4.8 + Math.floor(index / 2) * espacamentoZ;
    const posX = ehLadoEsquerdo ? (-largura / 2 + 0.08) : (largura / 2 - 0.08);
    const rotY = ehLadoEsquerdo ? (Math.PI / 2) : (-Math.PI / 2);

    const grupoQuadro = new THREE.Group();
    grupoQuadro.position.set(posX, 2.0, posZ);
    grupoQuadro.rotation.y = rotY;

    // Moldura de madeira nobre
    const meshMoldura = new THREE.Mesh(geoMoldura, matMoldura);
    grupoQuadro.add(meshMoldura);

    // Foto da Memória
    const texFoto = loader.load(memoria.foto);
    const matFoto = new THREE.MeshStandardMaterial({
      map: texFoto,
      roughness: 0.5
    });
    const meshFoto = new THREE.Mesh(geoFoto, matFoto);
    meshFoto.position.z = 0.05;
    meshFoto.userData = { memoria: memoria, ehQuadro: true };
    grupoQuadro.add(meshFoto);
    quadrosInterativos.push(meshFoto);

    // Plaquinha informativa embaixo do quadro
    const texPlaca = criarTexturaPlaca(memoria.titulo, memoria.data);
    const matPlaca = new THREE.MeshBasicMaterial({ map: texPlaca });
    const meshPlaca = new THREE.Mesh(geoPlaca, matPlaca);
    meshPlaca.position.set(0, -alturaMoldura / 2 - 0.3, 0.05);
    grupoQuadro.add(meshPlaca);

    // Arandela Dourada Neoclássica acima do quadro
    const arandelaHaste = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.35), matOuro);
    arandelaHaste.position.set(0, alturaMoldura / 2 + 0.25, 0.15);
    arandelaHaste.rotation.x = Math.PI / 4;
    grupoQuadro.add(arandelaHaste);

    const arandelaCupula = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.14, 12, 1, true), matOuro);
    arandelaCupula.position.set(0, alturaMoldura / 2 + 0.38, 0.28);
    grupoQuadro.add(arandelaCupula);

    const luzArandela = new THREE.PointLight(0xffeedb, 0.45, 4.5);
    luzArandela.position.set(0, alturaMoldura / 2 + 0.35, 0.32);
    grupoQuadro.add(luzArandela);

    cena.add(grupoQuadro);
  });

  // ============================================================
  //  ZONA 3: ALTAR BOTÂNICO DO PRESENTE (Lírios, Gérberas e Rosas)
  // ============================================================
  const posZPresente = Math.min(comprimento - 3.5, Math.max(7.0, comprimento / 2 + 1.2));
  const grupoPresente = new THREE.Group();
  grupoPresente.position.set(0, 0, posZPresente);

  // Mureta Semicircular de Mármore para o Jardim do Altar
  const geoMureta = new THREE.CylinderGeometry(2.2, 2.3, 0.4, 32, 1, true, Math.PI * 0.15, Math.PI * 1.7);
  const muretaJardim = new THREE.Mesh(geoMureta, matMarmore);
  muretaJardim.position.y = 0.2;
  grupoPresente.add(muretaJardim);

  // Canteiro semicircular de terra e grama
  const geoCanteiro = new THREE.CylinderGeometry(2.1, 2.1, 0.35, 32);
  const canteiroVerde = new THREE.Mesh(geoCanteiro, matFolha);
  canteiroVerde.position.y = 0.18;
  grupoPresente.add(canteiroVerde);

  // Distribuição abundante das 3 Flores ao redor do Altar:
  // 1. Rosas Vermelhas contornando a base interna (Espiral áurea de Fibonacci)
  const qtdRosasAltar = 18;
  for (let r = 0; r < qtdRosasAltar; r++) {
    const angR = (r / qtdRosasAltar) * Math.PI * 1.8 + Math.PI * 0.1;
    const raioR = 1.35 + (Math.random() - 0.5) * 0.25;
    const rosa = criarRosaRealista(0xbf0603, 0.42);
    rosa.position.set(Math.cos(angR) * raioR, 0.42, Math.sin(angR) * raioR);
    rosa.rotation.y = Math.random() * Math.PI * 2;
    rosa.rotation.x = (Math.random() - 0.5) * 0.25;
    grupoPresente.add(rosa);
  }

  // 2. Gérberas Radiantes coloridas na borda intermediária (Capítulo e lígulas em camadas)
  const qtdGerberasAltar = 16;
  const coresGerberasAltar = [0xff9f43, 0xfeca57, 0xff5252, 0xff758f];
  for (let g = 0; g < qtdGerberasAltar; g++) {
    const angG = (g / qtdGerberasAltar) * Math.PI * 1.7 + Math.PI * 0.15;
    const raioG = 1.75 + (Math.random() - 0.5) * 0.2;
    const corG = coresGerberasAltar[g % coresGerberasAltar.length];
    const gerbera = criarGerberaRealista(corG, 0.45);
    gerbera.position.set(Math.cos(angG) * raioG, 0.45, Math.sin(angG) * raioG);
    gerbera.rotation.y = Math.random() * Math.PI * 2;
    gerbera.rotation.x = (Math.random() - 0.5) * 0.25;
    grupoPresente.add(gerbera);
  }

  // 3. Lírios Rosas Majestosos nos pontos focais do Altar (Tépalas reflexas e papilas)
  const qtdLiriosAltar = 8;
  for (let l = 0; l < qtdLiriosAltar; l++) {
    const angL = (l / qtdLiriosAltar) * Math.PI * 1.6 + Math.PI * 0.2;
    const raioL = 1.95;
    const lirio = criarLirioRealista(0.55);
    lirio.position.set(Math.cos(angL) * raioL, 0.56, Math.sin(angL) * raioL);
    lirio.rotation.set(0.25, angL, 0);
    grupoPresente.add(lirio);
  }

  // Pedestal Central de Mármore e Ouro
  const geoPedestal = new THREE.CylinderGeometry(0.65, 0.75, 0.9, 24);
  const matPedestal = new THREE.MeshStandardMaterial({
    color: 0x1c1e24,
    roughness: 0.3,
    metalness: 0.6
  });
  const pedestal = new THREE.Mesh(geoPedestal, matPedestal);
  pedestal.position.y = 0.45;
  grupoPresente.add(pedestal);

  const anelOuro = new THREE.Mesh(new THREE.TorusGeometry(0.68, 0.04, 12, 32), matOuro);
  anelOuro.rotation.x = Math.PI / 2;
  anelOuro.position.y = 0.88;
  grupoPresente.add(anelOuro);

  // Placa no pedestal "🎁 CARTINHA ESPECIAL"
  const canvasPlacaPresente = document.createElement("canvas");
  canvasPlacaPresente.width = 512;
  canvasPlacaPresente.height = 128;
  const ctxPP = canvasPlacaPresente.getContext("2d");
  ctxPP.fillStyle = "#11141c";
  ctxPP.fillRect(0, 0, 512, 128);
  ctxPP.strokeStyle = "#ffd166";
  ctxPP.lineWidth = 6;
  ctxPP.strokeRect(8, 8, 496, 112);
  ctxPP.fillStyle = "#ffd166";
  ctxPP.font = "bold 26px Georgia";
  ctxPP.textAlign = "center";
  ctxPP.fillText("🎁 CARTINHA ESPECIAL", 256, 52);
  ctxPP.fillStyle = "#ffffff";
  ctxPP.font = "20px -apple-system, sans-serif";
  ctxPP.fillText("Toque para abrir com amor 💛", 256, 92);
  const texPlacaPresente = new THREE.CanvasTexture(canvasPlacaPresente);
  const meshPlacaPresente = new THREE.Mesh(
    new THREE.PlaneGeometry(1.0, 0.25),
    new THREE.MeshBasicMaterial({ map: texPlacaPresente })
  );
  meshPlacaPresente.position.set(0, 0.5, 0.76);
  grupoPresente.add(meshPlacaPresente);

  // Caixa de Presente Flutuante
  const grupoCaixaFlutuante = new THREE.Group();
  grupoCaixaFlutuante.position.set(0, 1.45, 0);

  const geoCaixa = new THREE.BoxGeometry(0.65, 0.65, 0.65);
  const matCaixa = new THREE.MeshStandardMaterial({
    color: 0xc1121f,
    roughness: 0.35,
    metalness: 0.15
  });
  const meshCaixa = new THREE.Mesh(geoCaixa, matCaixa);
  meshCaixa.userData = {
    ehPresente: true,
    ehQuadro: true,
    memoria: {
      id: "carta",
      titulo: config.carta_secreta ? config.carta_secreta.titulo : "Cartinha Para Gessy 💌",
      data: "Especial de Aniversário ✨",
      foto: "",
      texto: config.carta_secreta ? config.carta_secreta.texto : ""
    }
  };
  grupoCaixaFlutuante.add(meshCaixa);
  quadrosInterativos.push(meshCaixa);

  // Fitas cruzadas de ouro
  const geoFita1 = new THREE.BoxGeometry(0.67, 0.67, 0.12);
  const geoFita2 = new THREE.BoxGeometry(0.12, 0.67, 0.67);
  const meshFita1 = new THREE.Mesh(geoFita1, matOuro);
  const meshFita2 = new THREE.Mesh(geoFita2, matOuro);
  grupoCaixaFlutuante.add(meshFita1);
  grupoCaixaFlutuante.add(meshFita2);

  const geoLacoEsfera = new THREE.SphereGeometry(0.1, 16, 16);
  const meshLacoCentro = new THREE.Mesh(geoLacoEsfera, matOuro);
  meshLacoCentro.position.y = 0.38;
  grupoCaixaFlutuante.add(meshLacoCentro);

  // Luz suave da caixa
  const luzPresente = new THREE.PointLight(0xffd166, 1.25, 4.0);
  luzPresente.position.y = 0.3;
  grupoCaixaFlutuante.add(luzPresente);

  // Partículas douradas orbitando o altar
  const qtdSparks = 28;
  const geoSparks = new THREE.BufferGeometry();
  const posSparks = new Float32Array(qtdSparks * 3);
  for (let s = 0; s < qtdSparks; s++) {
    const ang = (s / qtdSparks) * Math.PI * 2;
    const raio = 0.7 + Math.random() * 0.4;
    posSparks[s * 3] = Math.cos(ang) * raio;
    posSparks[s * 3 + 1] = (Math.random() - 0.5) * 0.7;
    posSparks[s * 3 + 2] = Math.sin(ang) * raio;
  }
  geoSparks.setAttribute("position", new THREE.BufferAttribute(posSparks, 3));
  const matSparks = new THREE.PointsMaterial({
    color: 0xffd166,
    size: 0.08,
    transparent: true,
    opacity: 0.85
  });
  const pointsSparks = new THREE.Points(geoSparks, matSparks);
  grupoCaixaFlutuante.add(pointsSparks);

  grupoPresente.add(grupoCaixaFlutuante);
  cena.add(grupoPresente);

  // ============================================================
  //  ZONA 4: LETREIRO FINAL EMOLDURADO COM COLUNAS
  // ============================================================
  const geoLetreiro = new THREE.PlaneGeometry(6.0, 3.0);
  const matLetreiro = new THREE.MeshStandardMaterial({
    map: criarTexturaLetreiroFinal(config.nome_homenageada),
    roughness: 0.4
  });
  const letreiro = new THREE.Mesh(geoLetreiro, matLetreiro);
  letreiro.rotation.y = Math.PI;
  letreiro.position.set(0, 2.0, comprimento - 0.05);
  cena.add(letreiro);

  // Colunas de mármore e cortinas emoldurando o letreiro
  const colunaEsq = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.24, 3.8, 16), matMarmore);
  colunaEsq.position.set(-3.2, 1.9, comprimento - 0.15);
  cena.add(colunaEsq);

  const colunaDir = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.24, 3.8, 16), matMarmore);
  colunaDir.position.set(3.2, 1.9, comprimento - 0.15);
  cena.add(colunaDir);

  // ============================================================
  //  ILUMINAÇÃO GERAL E LUSTRES DE CRISTAL
  // ============================================================
  const listaLustres = [];
  const luzesPontuais = [];
  const matCristal = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.1,
    metalness: 0.9,
    transparent: true,
    opacity: 0.88
  });

  function criarLustre(pz) {
    const grupoLustre = new THREE.Group();
    grupoLustre.position.set(0, altura, pz);

    const cabo = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.7, 8), matOuro);
    cabo.position.y = -0.35;
    grupoLustre.add(cabo);

    const aroMaior = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.03, 8, 24), matOuro);
    aroMaior.rotation.x = Math.PI / 2;
    aroMaior.position.y = -0.7;
    grupoLustre.add(aroMaior);

    const aroMenor = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.025, 8, 20), matOuro);
    aroMenor.rotation.x = Math.PI / 2;
    aroMenor.position.y = -0.95;
    grupoLustre.add(aroMenor);

    const qtdPingentes = 14;
    for (let p = 0; p < qtdPingentes; p++) {
      const ang = (p / qtdPingentes) * Math.PI * 2;
      const px = Math.cos(ang) * 0.55;
      const pzCirc = Math.sin(ang) * 0.55;
      const cristal = new THREE.Mesh(new THREE.OctahedronGeometry(0.065, 0), matCristal);
      cristal.position.set(px, -0.78, pzCirc);
      grupoLustre.add(cristal);
    }

    const gotaCentral = new THREE.Mesh(new THREE.OctahedronGeometry(0.12, 0), matCristal);
    gotaCentral.position.y = -1.1;
    grupoLustre.add(gotaCentral);

    const spot = new THREE.PointLight(0xffe29a, 0.9, 9.5);
    spot.position.y = -0.85;
    grupoLustre.add(spot);
    luzesPontuais.push(spot);

    cena.add(grupoLustre);
    listaLustres.push(grupoLustre);
  }

  for (let zLustre = 3.5; zLustre < comprimento; zLustre += 5.5) {
    criarLustre(zLustre);
  }

  const luzAmbiente = new THREE.AmbientLight(0xfff3e6, 0.65);
  cena.add(luzAmbiente);

  const luzPrincipal = new THREE.DirectionalLight(0xffedd8, 0.55);
  luzPrincipal.position.set(0, 3.8, comprimento / 2);
  cena.add(luzPrincipal);

  // ============================================================
  //  CÉU ESTRELADO & VAGA-LUMES (MODO NOITE)
  // ============================================================
  const qtdEstrelas = 300;
  const geoEstrelas = new THREE.BufferGeometry();
  const posEstrelas = new Float32Array(qtdEstrelas * 3);
  for (let e = 0; e < qtdEstrelas; e++) {
    posEstrelas[e * 3] = (Math.random() - 0.5) * (largura * 1.5);
    posEstrelas[e * 3 + 1] = altura + 0.3 + Math.random() * 8.0;
    posEstrelas[e * 3 + 2] = Math.random() * (comprimento + 4.0) - 2.0;
  }
  geoEstrelas.setAttribute("position", new THREE.BufferAttribute(posEstrelas, 3));
  const matEstrelas = new THREE.PointsMaterial({
    color: 0xfff3d6,
    size: 0.12,
    transparent: true,
    opacity: 0.0
  });
  const pointsEstrelas = new THREE.Points(geoEstrelas, matEstrelas);
  cena.add(pointsEstrelas);

  const qtdVagalumes = 22;
  const geoVagalumes = new THREE.BufferGeometry();
  const posVagalumes = new Float32Array(qtdVagalumes * 3);
  const dadosVagalumes = [];
  for (let v = 0; v < qtdVagalumes; v++) {
    const vx = (Math.random() - 0.5) * (largura - 1.5);
    const vy = 0.5 + Math.random() * (altura - 1.0);
    const vz = 1.0 + Math.random() * (comprimento - 2.0);
    posVagalumes[v * 3] = vx;
    posVagalumes[v * 3 + 1] = vy;
    posVagalumes[v * 3 + 2] = vz;
    dadosVagalumes.push({
      x: vx, y: vy, z: vz,
      baseY: vy,
      fase: Math.random() * Math.PI * 2,
      vel: 0.5 + Math.random() * 0.8
    });
  }
  geoVagalumes.setAttribute("position", new THREE.BufferAttribute(posVagalumes, 3));
  const matVagalumes = new THREE.PointsMaterial({
    color: 0xffe066,
    size: 0.15,
    transparent: true,
    opacity: 0.0
  });
  const pointsVagalumes = new THREE.Points(geoVagalumes, matVagalumes);
  cena.add(pointsVagalumes);

  // ============================================================
  //  CORAÇÕES & CHUVA DE PÉTALAS FLUTUANTES
  // ============================================================
  const shapeCoracao = new THREE.Shape();
  const x0 = 0, y0 = 0;
  shapeCoracao.moveTo(x0 + 0.25, y0 + 0.25);
  shapeCoracao.bezierCurveTo(x0 + 0.25, y0 + 0.25, x0 + 0.20, y0, x0, y0);
  shapeCoracao.bezierCurveTo(x0 - 0.30, y0, x0 - 0.30, y0 + 0.35, x0 - 0.30, y0 + 0.35);
  shapeCoracao.bezierCurveTo(x0 - 0.30, y0 + 0.55, x0 - 0.10, y0 + 0.77, x0 + 0.25, y0 + 1.0);
  shapeCoracao.bezierCurveTo(x0 + 0.60, y0 + 0.77, x0 + 0.80, y0 + 0.55, x0 + 0.80, y0 + 0.35);
  shapeCoracao.bezierCurveTo(x0 + 0.80, y0 + 0.35, x0 + 0.80, y0, x0 + 0.50, y0);
  shapeCoracao.bezierCurveTo(x0 + 0.35, y0, x0 + 0.25, y0 + 0.25, x0 + 0.25, y0 + 0.25);

  const geoCoracao = new THREE.ShapeGeometry(shapeCoracao);
  geoCoracao.center();
  geoCoracao.scale(0.18, 0.18, 0.18);
  const matCoracao = new THREE.MeshBasicMaterial({ color: 0xff4d6d, side: THREE.DoubleSide, transparent: true, opacity: 0.65 });

  const qtdCoracoes = 38;
  const instCoracoes = new THREE.InstancedMesh(geoCoracao, matCoracao, qtdCoracoes);
  const dadosCoracoes = [];
  const dummy = new THREE.Object3D();

  for (let i = 0; i < qtdCoracoes; i++) {
    const px = (Math.random() - 0.5) * (largura - 2.0);
    const py = Math.random() * (altura - 0.5) + 0.5;
    const pz = Math.random() * (comprimento - 3.0) + 1.5;
    const vel = 0.2 + Math.random() * 0.3;
    const rotVel = (Math.random() - 0.5) * 1.5;

    dadosCoracoes.push({ x: px, y: py, z: pz, vel: vel, rot: Math.random() * Math.PI, rotVel: rotVel });
    dummy.position.set(px, py, pz);
    dummy.updateMatrix();
    instCoracoes.setMatrixAt(i, dummy.matrix);
  }
  instCoracoes.instanceMatrix.needsUpdate = true;
  cena.add(instCoracoes);

  // Chuva de Pétalas de Rosa e Lírio Flutuantes
  const shapePetala = new THREE.Shape();
  shapePetala.moveTo(0, 0);
  shapePetala.quadraticCurveTo(0.08, 0.12, 0.05, 0.22);
  shapePetala.quadraticCurveTo(0, 0.28, -0.05, 0.22);
  shapePetala.quadraticCurveTo(-0.08, 0.12, 0, 0);

  const geoPetala = new THREE.ShapeGeometry(shapePetala);
  geoPetala.center();
  const matPetala = new THREE.MeshStandardMaterial({
    color: 0xd90429,
    side: THREE.DoubleSide,
    roughness: 0.5,
    transparent: true,
    opacity: 0.8
  });

  const qtdPetalas = 45;
  const instPetalas = new THREE.InstancedMesh(geoPetala, matPetala, qtdPetalas);
  const dadosPetalas = [];
  const dummyPetala = new THREE.Object3D();

  for (let p = 0; p < qtdPetalas; p++) {
    const px = (Math.random() - 0.5) * (largura - 1.5);
    const py = Math.random() * altura + 0.2;
    const pz = Math.random() * (comprimento - 2.0) + 1.0;
    const quedaVel = 0.35 + Math.random() * 0.35;
    const oscilacaoFase = Math.random() * Math.PI * 2;
    const rotXVel = (Math.random() - 0.5) * 2.0;
    const rotZVel = (Math.random() - 0.5) * 2.0;

    dadosPetalas.push({
      x: px, y: py, z: pz,
      quedaVel,
      fase: oscilacaoFase,
      rotX: Math.random() * Math.PI,
      rotZ: Math.random() * Math.PI,
      rotXVel, rotZVel
    });
    dummyPetala.position.set(px, py, pz);
    dummyPetala.updateMatrix();
    instPetalas.setMatrixAt(p, dummyPetala.matrix);
  }
  instPetalas.instanceMatrix.needsUpdate = true;
  cena.add(instPetalas);

  // Limites da Sala para colisão da câmera
  const limitesSala = {
    minX: -largura / 2 + 0.8,
    maxX: largura / 2 - 0.8,
    minZ: 0.8,
    maxZ: comprimento - 1.2
  };

  let modoNoiteAtivo = false;
  let tempoGeral = 0;

  return {
    quadros: quadrosInterativos,
    limites: limitesSala,
    comprimentoSala: comprimento,
    alternarModoNoite: (ativar) => {
      modoNoiteAtivo = (ativar !== undefined) ? ativar : !modoNoiteAtivo;
      if (modoNoiteAtivo) {
        luzAmbiente.color.setHex(0xff9f43);
        luzAmbiente.intensity = 0.22;
        luzPrincipal.color.setHex(0xe67e22);
        luzPrincipal.intensity = 0.2;
        matTeto.opacity = 0.12;
        matEstrelas.opacity = 0.95;
        matVagalumes.opacity = 0.88;
        luzesPontuais.forEach(l => {
          l.color.setHex(0xff793f);
          l.intensity = 1.15;
        });
      } else {
        luzAmbiente.color.setHex(0xfff3e6);
        luzAmbiente.intensity = 0.65;
        luzPrincipal.color.setHex(0xffedd8);
        luzPrincipal.intensity = 0.55;
        matTeto.opacity = 1.0;
        matEstrelas.opacity = 0.0;
        matVagalumes.opacity = 0.0;
        luzesPontuais.forEach(l => {
          l.color.setHex(0xffe29a);
          l.intensity = 0.9;
        });
      }
      return modoNoiteAtivo;
    },
    animarCenario: (delta) => {
      tempoGeral += delta;

      // 1. Balanço Suave dos Lustres de Cristal
      listaLustres.forEach((lustre, idx) => {
        lustre.rotation.z = Math.sin(tempoGeral * 1.1 + idx) * 0.016;
        lustre.rotation.x = Math.cos(tempoGeral * 0.85 + idx) * 0.012;
      });

      // 2. Animação da Caixinha de Presente no Altar
      grupoCaixaFlutuante.rotation.y += delta * 0.5;
      grupoCaixaFlutuante.position.y = 1.45 + Math.sin(tempoGeral * 2.0) * 0.06;
      pointsSparks.rotation.y -= delta * 1.2;

      // 3. Animação dos Corações
      for (let i = 0; i < qtdCoracoes; i++) {
        const d = dadosCoracoes[i];
        d.y += d.vel * delta;
        d.rot += d.rotVel * delta;
        if (d.y > altura - 0.3) {
          d.y = 0.4;
          d.x = (Math.random() - 0.5) * (largura - 2.0);
        }
        dummy.position.set(d.x, d.y, d.z);
        dummy.rotation.y = d.rot;
        dummy.rotation.z = Math.sin(d.rot) * 0.2;
        dummy.updateMatrix();
        instCoracoes.setMatrixAt(i, dummy.matrix);
      }
      instCoracoes.instanceMatrix.needsUpdate = true;

      // 4. Animação da Chuva de Pétalas com Vento
      for (let p = 0; p < qtdPetalas; p++) {
        const d = dadosPetalas[p];
        d.y -= d.quedaVel * delta;
        d.fase += delta * 2.2;
        d.rotX += d.rotXVel * delta;
        d.rotZ += d.rotZVel * delta;

        const ventoX = Math.sin(d.fase) * 0.18;
        if (d.y < 0.05) {
          d.y = altura - 0.2;
          d.x = (Math.random() - 0.5) * (largura - 1.5);
        }

        dummyPetala.position.set(d.x + ventoX, d.y, d.z);
        dummyPetala.rotation.set(d.rotX, tempoGeral * 0.4, d.rotZ);
        dummyPetala.updateMatrix();
        instPetalas.setMatrixAt(p, dummyPetala.matrix);
      }
      instPetalas.instanceMatrix.needsUpdate = true;

      // 5. Animação dos Vaga-lumes no Modo Noite
      if (modoNoiteAtivo) {
        const posAttr = geoVagalumes.attributes.position;
        for (let v = 0; v < qtdVagalumes; v++) {
          const d = dadosVagalumes[v];
          d.fase += delta * d.vel;
          const vy = d.baseY + Math.sin(d.fase) * 0.25;
          const vx = d.x + Math.cos(d.fase * 0.7) * 0.15;
          posAttr.setXYZ(v, vx, vy, d.z);
        }
        posAttr.needsUpdate = true;
        matEstrelas.size = 0.11 + Math.sin(tempoGeral * 3.0) * 0.03;
      }
    },
    animarCoracoes: function(delta) {
      this.animarCenario(delta);
    }
  };
}
