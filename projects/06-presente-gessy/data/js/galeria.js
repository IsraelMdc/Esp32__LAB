/*
 * ============================================================
 *  GRANDE ROTUNDA NEOCLÁSSICA & JARDIM FLORAL CENTRAL — PROJETO 06 (GESSY)
 *  Salão Circular de Museu (360°) com Canteiro Central Cercado,
 *  Flores Botânicas Eretas, Cúpula Noturna e 9 Quadros de Memórias em Anel
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
  tex.repeat.set(6, 6);
  return tex;
}

function criarTexturaParede() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#f3ebe3";
  ctx.fillRect(0, 0, 512, 512);

  ctx.fillStyle = "rgba(0, 0, 0, 0.025)";
  for (let i = 0; i < 5000; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    ctx.fillRect(x, y, 2, 2);
  }

  // Boiserie clássica sutil
  ctx.strokeStyle = "rgba(180, 150, 120, 0.25)";
  ctx.lineWidth = 4;
  ctx.strokeRect(32, 32, 448, 448);
  ctx.lineWidth = 1.5;
  ctx.strokeRect(48, 48, 416, 416);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(12, 2);
  return tex;
}

function criarTexturaTapete() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#780016";
  ctx.fillRect(0, 0, 512, 512);

  ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
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
  canvas.height = 512;
  const ctx = canvas.getContext("2d");

  const grad = ctx.createRadialGradient(256, 256, 30, 256, 256, 256);
  grad.addColorStop(0, "#19223e");
  grad.addColorStop(0.55, "#0e1529");
  grad.addColorStop(1.0, "#050811");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  // Estrelas
  ctx.fillStyle = "#ffffff";
  for (let i = 0; i < 140; i++) {
    const sx = Math.random() * 512;
    const sy = Math.random() * 512;
    const sRaio = Math.random() * 1.5;
    ctx.beginPath();
    ctx.arc(sx, sy, sRaio, 0, Math.PI * 2);
    ctx.fill();
  }

  // Lua Cheia Brilhante no Centro
  const lx = 256, ly = 210, lRaio = 48;
  const halo = ctx.createRadialGradient(lx, ly, lRaio * 0.7, lx, ly, lRaio * 2.8);
  halo.addColorStop(0, "rgba(255, 248, 225, 0.95)");
  halo.addColorStop(0.4, "rgba(255, 235, 180, 0.35)");
  halo.addColorStop(1, "rgba(255, 220, 150, 0)");
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(lx, ly, lRaio * 2.8, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#fffdf7";
  ctx.beginPath();
  ctx.arc(lx, ly, lRaio, 0, Math.PI * 2);
  ctx.fill();

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

function criarTexturaTerraMusgo() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#22150c";
  ctx.fillRect(0, 0, 512, 512);

  for (let i = 0; i < 5000; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const r = Math.random() * 2.2 + 0.6;
    ctx.fillStyle = Math.random() > 0.5 ? "#322013" : "#170e08";
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const coresMusgo = [
    "rgba(34, 76, 32, 0.55)",
    "rgba(45, 90, 39, 0.65)",
    "rgba(64, 108, 53, 0.45)",
    "rgba(82, 121, 64, 0.40)"
  ];
  for (let m = 0; m < 70; m++) {
    const mx = Math.random() * 512;
    const my = Math.random() * 512;
    const mRad = 18 + Math.random() * 36;
    const grad = ctx.createRadialGradient(mx, my, 2, mx, my, mRad);
    const cor = coresMusgo[Math.floor(Math.random() * coresMusgo.length)];
    grad.addColorStop(0, cor);
    grad.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(mx, my, mRad, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 3);
  return tex;
}

function criarGeometriaTufoGrama() {
  const positions = [];
  const uvs = [];
  const indices = [];

  const blades = [
    { ang: 0.15, arc: 0.035, h: 0.095, w: 0.018 },
    { ang: 1.35, arc: 0.045, h: 0.115, w: 0.016 },
    { ang: 2.70, arc: 0.030, h: 0.085, w: 0.017 },
    { ang: 4.10, arc: 0.050, h: 0.120, w: 0.015 },
    { ang: 5.30, arc: 0.040, h: 0.100, w: 0.016 }
  ];

  let vertOffset = 0;
  blades.forEach((b) => {
    const cosA = Math.cos(b.ang);
    const sinA = Math.sin(b.ang);

    const nos = [
      { y: 0, z: 0, w: b.w },
      { y: b.h * 0.35, z: b.arc * 0.15, w: b.w * 0.85 },
      { y: b.h * 0.70, z: b.arc * 0.55, w: b.w * 0.55 },
      { y: b.h * 1.00, z: b.arc * 1.00, w: 0.002 }
    ];

    nos.forEach((no, idx) => {
      const halfW = no.w / 2;
      const xL = -halfW * cosA + no.z * sinA;
      const zL = halfW * sinA + no.z * cosA;
      const xR = halfW * cosA + no.z * sinA;
      const zR = -halfW * sinA + no.z * cosA;

      positions.push(xL, no.y, zL);
      positions.push(xR, no.y, zR);

      uvs.push(0, idx / (nos.length - 1));
      uvs.push(1, idx / (nos.length - 1));
    });

    for (let s = 0; s < nos.length - 1; s++) {
      const bIdx = vertOffset + s * 2;
      indices.push(bIdx, bIdx + 1, bIdx + 2);
      indices.push(bIdx + 1, bIdx + 3, bIdx + 2);
    }
    vertOffset += nos.length * 2;
  });

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

// ------------------------------------------------------------
//  Construção da Grande Rotunda Neoclássica Circular (360°)
// ------------------------------------------------------------
export function construirGaleria(cena, memorias, config) {
  const loader = new THREE.TextureLoader();
  const quadrosInterativos = [];

  const raioRotunda = 7.5;
  const altura = 4.2;

  // Materiais Globais Reutilizáveis
  const matOuro = new THREE.MeshStandardMaterial({ color: 0xffd166, roughness: 0.22, metalness: 0.88 });
  const matMarmore = new THREE.MeshStandardMaterial({ color: 0xfbfbfb, roughness: 0.25, metalness: 0.15 });
  const matFolha = new THREE.MeshStandardMaterial({ color: 0x2d6a4f, roughness: 0.65 });
  const matVeludoVermelho = new THREE.MeshStandardMaterial({ color: 0x780016, roughness: 0.85 });

  // ============================================================
  //  1. ESTRUTURA ARQUITETÔNICA DA ROTUNDA (Círculo 360°)
  // ============================================================

  // 1.1 Piso Circular de Madeira Nobre
  const geoPiso = new THREE.CircleGeometry(raioRotunda, 64);
  const matPiso = new THREE.MeshStandardMaterial({
    map: criarTexturaMadeira(),
    roughness: 0.35,
    metalness: 0.12
  });
  const piso = new THREE.Mesh(geoPiso, matPiso);
  piso.rotation.x = -Math.PI / 2;
  piso.position.set(0, 0, 0);
  cena.add(piso);

  // 1.2 Tapete Anelar Aveludado circundando a área de contemplação
  const geoTapeteAnel = new THREE.RingGeometry(2.7, 4.5, 64);
  const matTapeteAnel = new THREE.MeshStandardMaterial({
    color: 0x780016,
    roughness: 0.85,
    metalness: 0.08,
    side: THREE.DoubleSide
  });
  const tapeteAnel = new THREE.Mesh(geoTapeteAnel, matTapeteAnel);
  tapeteAnel.rotation.x = -Math.PI / 2;
  tapeteAnel.position.set(0, 0.008, 0);
  cena.add(tapeteAnel);

  // Filetes Dourados nos aros do tapete anelar
  const bordaTapeteInt = new THREE.Mesh(new THREE.TorusGeometry(2.7, 0.02, 8, 64), matOuro);
  bordaTapeteInt.rotation.x = Math.PI / 2;
  bordaTapeteInt.position.y = 0.012;
  cena.add(bordaTapeteInt);

  const bordaTapeteExt = new THREE.Mesh(new THREE.TorusGeometry(4.5, 0.02, 8, 64), matOuro);
  bordaTapeteExt.rotation.x = Math.PI / 2;
  bordaTapeteExt.position.y = 0.012;
  cena.add(bordaTapeteExt);

  // Passadeira Vermelha da Entrada conectando a porta (-Z) ao anel central
  const geoPassadeira = new THREE.PlaneGeometry(1.8, 3.0);
  const passadeira = new THREE.Mesh(geoPassadeira, matTapeteAnel);
  passadeira.rotation.x = -Math.PI / 2;
  passadeira.position.set(0, 0.009, -5.9);
  cena.add(passadeira);

  // 1.3 Parede Cilíndrica Curva da Rotunda
  const geoParede = new THREE.CylinderGeometry(raioRotunda, raioRotunda, altura, 64, 1, true);
  const matParede = new THREE.MeshStandardMaterial({
    map: criarTexturaParede(),
    roughness: 0.82,
    side: THREE.BackSide
  });
  const parede = new THREE.Mesh(geoParede, matParede);
  parede.position.y = altura / 2;
  cena.add(parede);

  // Rodapé clássico contínuo na base circular
  const rodape = new THREE.Mesh(new THREE.TorusGeometry(raioRotunda - 0.06, 0.11, 8, 64), matOuro);
  rodape.rotation.x = Math.PI / 2;
  rodape.position.y = 0.11;
  cena.add(rodape);

  // Sanca neoclássica superior
  const sanca = new THREE.Mesh(new THREE.TorusGeometry(raioRotunda - 0.05, 0.07, 8, 64), matOuro);
  sanca.rotation.x = Math.PI / 2;
  sanca.position.y = altura - 0.07;
  cena.add(sanca);

  // 1.4 Teto Abobadado com Óculo Noturno e Claraboia de Estrelas
  const matTeto = new THREE.MeshStandardMaterial({
    color: 0x16181e,
    roughness: 0.9,
    transparent: true,
    opacity: 1.0,
    side: THREE.DoubleSide
  });
  const teto = new THREE.Mesh(new THREE.CircleGeometry(raioRotunda, 64), matTeto);
  teto.rotation.x = Math.PI / 2;
  teto.position.y = altura;
  cena.add(teto);

  // Óculo Noturno no Teto
  const matOculo = new THREE.MeshBasicMaterial({ map: criarTexturaJanelaNoturna(), side: THREE.DoubleSide });
  const oculo = new THREE.Mesh(new THREE.CircleGeometry(2.6, 32), matOculo);
  oculo.rotation.x = Math.PI / 2;
  oculo.position.y = altura - 0.02;
  cena.add(oculo);

  const aroOculo = new THREE.Mesh(new THREE.TorusGeometry(2.6, 0.08, 8, 48), matOuro);
  aroOculo.rotation.x = Math.PI / 2;
  aroOculo.position.y = altura - 0.02;
  cena.add(aroOculo);

  // ============================================================
  //  2. PORTAL DE ENTRADA DE GALA (Z = -7.4m)
  // ============================================================

  // Cortinas Imperiais de Veludo no Portal
  const grupoCortinaEsq = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.52, 4.0, 12), matVeludoVermelho);
  grupoCortinaEsq.position.set(-1.8, 2.0, -7.0);
  grupoCortinaEsq.scale.set(0.6, 1.0, 0.35);
  cena.add(grupoCortinaEsq);

  const grupoCortinaDir = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.52, 4.0, 12), matVeludoVermelho);
  grupoCortinaDir.position.set(1.8, 2.0, -7.0);
  grupoCortinaDir.scale.set(0.6, 1.0, 0.35);
  cena.add(grupoCortinaDir);

  const bracadeiraEsq = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.03, 8, 20), matOuro);
  bracadeiraEsq.position.set(-1.8, 1.8, -6.9);
  cena.add(bracadeiraEsq);

  const bracadeiraDir = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.03, 8, 20), matOuro);
  bracadeiraDir.position.set(1.8, 1.8, -6.9);
  cena.add(bracadeiraDir);

  // Aparador Rebaixado com Vaso de Lírios (ao lado da entrada, à esquerda)
  const grupoAparadorLirios = new THREE.Group();
  grupoAparadorLirios.position.set(-3.6, 0, -6.1);
  grupoAparadorLirios.rotation.y = Math.PI * 0.2;

  const aparador = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.58, 0.60), matMarmore);
  aparador.position.y = 0.29;
  grupoAparadorLirios.add(aparador);

  const fileteAparador = new THREE.Mesh(new THREE.BoxGeometry(0.87, 0.025, 0.62), matOuro);
  fileteAparador.position.y = 0.58;
  grupoAparadorLirios.add(fileteAparador);

  const vasoLirios = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.15, 0.34, 20), matMarmore);
  vasoLirios.position.y = 0.75;
  grupoAparadorLirios.add(vasoLirios);

  const anelBocalVaso = new THREE.Mesh(new THREE.TorusGeometry(0.23, 0.015, 8, 24), matOuro);
  anelBocalVaso.rotation.x = Math.PI / 2;
  anelBocalVaso.position.y = 0.92;
  grupoAparadorLirios.add(anelBocalVaso);

  const folhagemLirios = new THREE.Mesh(new THREE.SphereGeometry(0.28, 10, 8), matFolha);
  folhagemLirios.position.y = 0.96;
  folhagemLirios.scale.set(0.95, 0.5, 0.95);
  grupoAparadorLirios.add(folhagemLirios);

  const posLiriosEntrada = [
    [0.0, 1.15, 0.04, 0.35, 0.0],
    [0.15, 1.08, 0.10, 0.45, 0.25],
    [-0.15, 1.08, 0.10, 0.45, -0.25],
    [0.18, 1.10, -0.06, 0.20, 0.38],
    [-0.18, 1.10, -0.06, 0.20, -0.38],
    [0.22, 1.00, 0.06, 0.42, 0.42],
    [-0.22, 1.00, 0.06, 0.42, -0.42]
  ];
  posLiriosEntrada.forEach(([lx, ly, lz, rx, rz]) => {
    const flor = criarLirioRealista(0.48);
    flor.position.set(lx, ly, lz);
    flor.rotation.set(rx, Math.random() * Math.PI, rz);
    grupoAparadorLirios.add(flor);
  });

  const luzAparador = new THREE.PointLight(0xfff1dc, 0.95, 3.5);
  luzAparador.position.set(0.1, 1.5, 0.25);
  grupoAparadorLirios.add(luzAparador);
  cena.add(grupoAparadorLirios);

  // Espelho Veneziano Mágico ladeado por Gérberas (à direita da entrada)
  const grupoEspelho = new THREE.Group();
  grupoEspelho.position.set(3.6, 2.05, -6.1);
  grupoEspelho.rotation.y = -Math.PI * 0.2;

  const meshMolduraEspelho = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.3, 0.08), matOuro);
  grupoEspelho.add(meshMolduraEspelho);

  const matVidroEspelho = new THREE.MeshBasicMaterial({ map: criarTexturaEspelho() });
  const meshVidroEspelho = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 2.1), matVidroEspelho);
  meshVidroEspelho.position.z = 0.05;
  meshVidroEspelho.userData = {
    ehEspelho: true,
    ehQuadro: true,
    memoria: {
      id: "espelho",
      titulo: "Espelho Mais Sincero ✨",
      data: "Reflexo do Coração",
      foto: "",
      texto: "Se este espelho pudesse refletir o que eu vejo em você todos os dias, você saberia que é a mulher mais doce, radiante e encantadora do mundo. Te amo! 💛"
    }
  };
  grupoEspelho.add(meshVidroEspelho);
  quadrosInterativos.push(meshVidroEspelho);

  // Floreira de Gérberas embaixo do espelho
  const floreiraEspelho = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.32, 0.4), matMarmore);
  floreiraEspelho.position.set(0, -1.35, 0.15);
  grupoEspelho.add(floreiraEspelho);

  const coresGerberas = [0xff758f, 0xff9f43, 0xfeca57, 0xff5252, 0xff9ff3];
  for (let fg = -0.65; fg <= 0.65; fg += 0.28) {
    const cor = coresGerberas[Math.floor(Math.random() * coresGerberas.length)];
    const gFlor = criarGerberaRealista(cor, 0.38);
    gFlor.position.set(fg, -1.18, 0.2);
    gFlor.rotation.x = 0.2;
    grupoEspelho.add(gFlor);
  }
  cena.add(grupoEspelho);

  // ============================================================
  //  3. O CANTEIRO CENTRAL CERCADO COM AS FLORES (Centro 0, 0, 0)
  // ============================================================
  const grupoPresente = new THREE.Group();
  grupoPresente.position.set(0, 0, 0);

  const raioCanteiro = 2.4;

  // 3.1 Mureta de Mármore Branca Perfeita 360°
  const geoMureta = new THREE.CylinderGeometry(raioCanteiro, raioCanteiro + 0.08, 0.40, 48);
  const muretaJardim = new THREE.Mesh(geoMureta, matMarmore);
  muretaJardim.position.y = 0.20;
  grupoPresente.add(muretaJardim);

  // Borda saliente superior de mármore
  const anelMuretaTopo = new THREE.Mesh(new THREE.TorusGeometry(raioCanteiro + 0.04, 0.045, 8, 48), matMarmore);
  anelMuretaTopo.rotation.x = Math.PI / 2;
  anelMuretaTopo.position.y = 0.40;
  grupoPresente.add(anelMuretaTopo);

  // 3.2 Solo Orgânico e Rico em Húmus e Musgo
  const texTerraMusgo = criarTexturaTerraMusgo();
  const matTerraMusgo = new THREE.MeshStandardMaterial({ map: texTerraMusgo, roughness: 0.90, metalness: 0.05 });
  const canteiroVerde = new THREE.Mesh(new THREE.CylinderGeometry(raioCanteiro - 0.04, raioCanteiro - 0.04, 0.38, 48), matTerraMusgo);
  canteiroVerde.position.y = 0.19;
  grupoPresente.add(canteiroVerde);

  // 3.3 CERQUINHA ORNAMENTAL EM VOLTA DO CANTEIRO COM FLORES E HERAS
  const alturaCerca = 0.42;
  const yTopoCerquinha = 0.40 + alturaCerca; // 0.82m

  // Corrimão Superior em Ouro
  const corrimaoSuperior = new THREE.Mesh(new THREE.TorusGeometry(raioCanteiro + 0.02, 0.025, 8, 48), matOuro);
  corrimaoSuperior.rotation.x = Math.PI / 2;
  corrimaoSuperior.position.y = yTopoCerquinha;
  grupoPresente.add(corrimaoSuperior);

  // Barra Intermediária Ornamental em Ouro
  const barraIntermediaria = new THREE.Mesh(new THREE.TorusGeometry(raioCanteiro + 0.02, 0.016, 8, 48), matOuro);
  barraIntermediaria.rotation.x = Math.PI / 2;
  barraIntermediaria.position.y = 0.60;
  grupoPresente.add(barraIntermediaria);

  // Barra Inferior em Ouro
  const barraInferior = new THREE.Mesh(new THREE.TorusGeometry(raioCanteiro + 0.02, 0.018, 8, 48), matOuro);
  barraInferior.rotation.x = Math.PI / 2;
  barraInferior.position.y = 0.42;
  grupoPresente.add(barraInferior);

  // 32 Balaústres Torneados em Ouro e Mármore
  const qtdBalaustres = 32;
  for (let b = 0; b < qtdBalaustres; b++) {
    const angB = (b / qtdBalaustres) * Math.PI * 2;
    // Pequeno vão frontal para acolher quem entra pelo portal (-Z)
    if (Math.abs(angB - (-Math.PI / 2)) < 0.12) continue;

    const bx = Math.cos(angB) * (raioCanteiro + 0.02);
    const bz = Math.sin(angB) * (raioCanteiro + 0.02);

    const balaustre = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.022, alturaCerca, 8), matOuro);
    balaustre.position.set(bx, 0.40 + alturaCerca / 2, bz);
    grupoPresente.add(balaustre);

    // Esfera dourada no topo de cada balaústre
    const esferaBalaustre = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 8), matOuro);
    esferaBalaustre.position.set(bx, yTopoCerquinha + 0.025, bz);
    grupoPresente.add(esferaBalaustre);

    // Heras e folhinhas entrelaçadas nos balaústres
    if (b % 2 === 0) {
      const folhaCerca = new THREE.Mesh(new THREE.ConeGeometry(0.028, 0.05, 3), matFolha);
      folhaCerca.position.set(bx * 0.98, 0.50 + (b % 3) * 0.08, bz * 0.98);
      folhaCerca.rotation.set(Math.random() * 0.5, angB, Math.PI / 2);
      grupoPresente.add(folhaCerca);
    }
  }

  // 2 Postes Nobres do Portãozinho Frontal de Entrada (-Z)
  const posPortoes = [-0.35, 0.35];
  posPortoes.forEach(px => {
    const pz = -(raioCanteiro + 0.02);
    const posteNobre = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, alturaCerca + 0.08, 12), matOuro);
    posteNobre.position.set(px, 0.40 + (alturaCerca + 0.08) / 2, pz);
    grupoPresente.add(posteNobre);

    const pinha = new THREE.Mesh(new THREE.SphereGeometry(0.065, 12, 12), matOuro);
    pinha.position.set(px, yTopoCerquinha + 0.08, pz);
    grupoPresente.add(pinha);
  });

  // 3.4 Grama Silvestre Baixa (InstancedMesh: 280 tufos em 1 único draw call GPU)
  const matGrama = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.70,
    metalness: 0.04,
    side: THREE.DoubleSide
  });
  const tuftGeo = criarGeometriaTufoGrama();
  const qtdTufos = 280;
  const instancedGrama = new THREE.InstancedMesh(tuftGeo, matGrama, qtdTufos);

  const dummyGrama = new THREE.Object3D();
  const paletaGrama = [
    new THREE.Color(0x2d6a4f),
    new THREE.Color(0x40916c),
    new THREE.Color(0x52b788),
    new THREE.Color(0x606c38),
    new THREE.Color(0x283618)
  ];

  for (let tg = 0; tg < qtdTufos; tg++) {
    const angTG = Math.random() * Math.PI * 2;
    const raioTG = 0.85 + Math.random() * 1.45;
    const tgX = Math.cos(angTG) * raioTG;
    const tgZ = Math.sin(angTG) * raioTG;
    const tgY = 0.38;

    dummyGrama.position.set(tgX, tgY, tgZ);
    dummyGrama.rotation.y = Math.random() * Math.PI * 2;
    dummyGrama.rotation.x = (Math.random() - 0.5) * 0.12;
    dummyGrama.rotation.z = (Math.random() - 0.5) * 0.12;

    const escTG = 0.75 + Math.random() * 0.45;
    dummyGrama.scale.set(escTG * (0.9 + Math.random() * 0.2), escTG, escTG * (0.9 + Math.random() * 0.2));
    dummyGrama.updateMatrix();

    instancedGrama.setMatrixAt(tg, dummyGrama.matrix);
    instancedGrama.setColorAt(tg, paletaGrama[Math.floor(Math.random() * paletaGrama.length)]);
  }
  instancedGrama.instanceMatrix.needsUpdate = true;
  if (instancedGrama.instanceColor) instancedGrama.instanceColor.needsUpdate = true;
  grupoPresente.add(instancedGrama);

  // 3.5 Ramos Lenhosos Naturais Arqueados
  const matRamo = new THREE.MeshStandardMaterial({ color: 0x3d271d, roughness: 0.88, metalness: 0.05 });
  const qtdRamos = 8;
  for (let rm = 0; rm < qtdRamos; rm++) {
    const a1 = (rm / qtdRamos) * Math.PI * 2;
    const a2 = a1 + 0.35;
    const a3 = a1 + 0.65;
    const r1 = 1.1 + Math.random() * 0.3;
    const r2 = 1.4 + Math.random() * 0.4;
    const r3 = 1.8 + Math.random() * 0.3;

    const curva = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(Math.cos(a1) * r1, 0.38, Math.sin(a1) * r1),
      new THREE.Vector3(Math.cos(a2) * r2, 0.48, Math.sin(a2) * r2),
      new THREE.Vector3(Math.cos(a3) * r3, 0.39, Math.sin(a3) * r3)
    );
    const geoRamo = new THREE.TubeGeometry(curva, 10, 0.02, 6, false);
    const meshRamo = new THREE.Mesh(geoRamo, matRamo);
    grupoPresente.add(meshRamo);

    const broto = new THREE.Mesh(new THREE.ConeGeometry(0.022, 0.05, 4), matFolha);
    broto.position.set(Math.cos(a2) * r2, 0.50, Math.sin(a2) * r2);
    broto.rotation.z = Math.PI / 4;
    grupoPresente.add(broto);
  }

  // 3.6 Distribuição Botânica das 3 Flores em 360°
  // A. 24 Rosas Vermelhas Aveludadas no anel interno
  const qtdRosasAltar = 24;
  for (let r = 0; r < qtdRosasAltar; r++) {
    const angR = (r / qtdRosasAltar) * Math.PI * 2 + (Math.random() - 0.5) * 0.15;
    const raioR = 1.35 + (Math.random() - 0.5) * 0.25;
    const rosa = criarRosaRealista(0xbf0603, 0.46);
    rosa.position.set(Math.cos(angR) * raioR, 0.38, Math.sin(angR) * raioR);
    rosa.rotation.y = Math.random() * Math.PI * 2;
    rosa.rotation.x = (Math.random() - 0.5) * 0.08;
    rosa.rotation.z = (Math.random() - 0.5) * 0.08;
    grupoPresente.add(rosa);
  }

  // B. 20 Gérberas Radiantes Multicoloridas no anel intermediário
  const qtdGerberasAltar = 20;
  const coresGerberasAltar = [0xff9f43, 0xfeca57, 0xff5252, 0xff758f, 0xff9ff3];
  for (let g = 0; g < qtdGerberasAltar; g++) {
    const angG = (g / qtdGerberasAltar) * Math.PI * 2 + (Math.random() - 0.5) * 0.18;
    const raioG = 1.78 + (Math.random() - 0.5) * 0.22;
    const corG = coresGerberasAltar[g % coresGerberasAltar.length];
    const gerbera = criarGerberaRealista(corG, 0.52);
    gerbera.position.set(Math.cos(angG) * raioG, 0.38, Math.sin(angG) * raioG);
    gerbera.rotation.y = Math.random() * Math.PI * 2;
    gerbera.rotation.x = (Math.random() - 0.5) * 0.08;
    gerbera.rotation.z = (Math.random() - 0.5) * 0.08;
    grupoPresente.add(gerbera);
  }

  // C. 12 Lírios Rosas Majestosos no anel externo próximo à cerquinha
  const qtdLiriosAltar = 12;
  for (let l = 0; l < qtdLiriosAltar; l++) {
    const angL = (l / qtdLiriosAltar) * Math.PI * 2;
    const raioL = 2.05;
    const lirio = criarLirioRealista(0.56);
    lirio.position.set(Math.cos(angL) * raioL, 0.38, Math.sin(angL) * raioL);
    lirio.rotation.set(0.12, angL, 0);
    grupoPresente.add(lirio);
  }

  // 3.7 Pedestal Central de Mármore e Ouro
  const geoPedestal = new THREE.CylinderGeometry(0.65, 0.75, 0.9, 32);
  const matPedestal = new THREE.MeshStandardMaterial({ color: 0x1c1e24, roughness: 0.3, metalness: 0.6 });
  const pedestal = new THREE.Mesh(geoPedestal, matPedestal);
  pedestal.position.y = 0.45;
  grupoPresente.add(pedestal);

  const anelOuro = new THREE.Mesh(new THREE.TorusGeometry(0.68, 0.04, 12, 32), matOuro);
  anelOuro.rotation.x = Math.PI / 2;
  anelOuro.position.y = 0.88;
  grupoPresente.add(anelOuro);

  // Placa Especial Dourada voltada para quem entra (-Z)
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
  meshPlacaPresente.position.set(0, 0.52, -0.76);
  meshPlacaPresente.rotation.y = Math.PI;
  grupoPresente.add(meshPlacaPresente);

  // Caixa de Presente Flutuante Iluminada
  const grupoCaixaFlutuante = new THREE.Group();
  grupoCaixaFlutuante.position.set(0, 1.45, 0);

  const geoCaixa = new THREE.BoxGeometry(0.65, 0.65, 0.65);
  const matCaixa = new THREE.MeshStandardMaterial({ color: 0xc1121f, roughness: 0.35, metalness: 0.15 });
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

  const geoFita1 = new THREE.BoxGeometry(0.67, 0.67, 0.12);
  const geoFita2 = new THREE.BoxGeometry(0.12, 0.67, 0.67);
  const meshFita1 = new THREE.Mesh(geoFita1, matOuro);
  const meshFita2 = new THREE.Mesh(geoFita2, matOuro);
  grupoCaixaFlutuante.add(meshFita1);
  grupoCaixaFlutuante.add(meshFita2);

  const meshLacoCentro = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 16), matOuro);
  meshLacoCentro.position.y = 0.38;
  grupoCaixaFlutuante.add(meshLacoCentro);

  const luzPresente = new THREE.PointLight(0xffd166, 1.35, 5.0);
  luzPresente.position.y = 0.3;
  grupoCaixaFlutuante.add(luzPresente);

  // Partículas Douradas orbitando o altar
  const qtdSparks = 32;
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
  const matSparks = new THREE.PointsMaterial({ color: 0xffd166, size: 0.08, transparent: true, opacity: 0.85 });
  const pointsSparks = new THREE.Points(geoSparks, matSparks);
  grupoCaixaFlutuante.add(pointsSparks);

  grupoPresente.add(grupoCaixaFlutuante);
  cena.add(grupoPresente);

  // ============================================================
  //  4. OS 9 QUADROS DE MEMÓRIAS EM ANEL CIRCULAR 360°
  // ============================================================
  const raioParedesQuadros = raioRotunda - 0.12; // 7.38m
  const larguraMoldura = 2.2;
  const alturaMoldura = 1.7;
  const geoMoldura = new THREE.BoxGeometry(larguraMoldura, alturaMoldura, 0.08);
  const matMoldura = new THREE.MeshStandardMaterial({ color: 0x2b1d0c, roughness: 0.3, metalness: 0.4 });
  const geoFoto = new THREE.PlaneGeometry(larguraMoldura - 0.2, alturaMoldura - 0.2);
  const geoPlaca = new THREE.PlaneGeometry(1.6, 0.38);

  // Ângulos distribuídos harmoniosamente em 360°, deixando o portal em -Z aberto
  const angulosQuadros = [
    -0.30 * Math.PI, // Memória 1 (Lado direito-frente)
    -0.10 * Math.PI, // Memória 2
     0.10 * Math.PI, // Memória 3
     0.30 * Math.PI, // Memória 4
     0.70 * Math.PI, // Memória 5
     0.90 * Math.PI, // Memória 6
     1.10 * Math.PI, // Memória 7
     1.30 * Math.PI, // Memória 8
     1.45 * Math.PI  // Memória 9 (Lado esquerdo-frente)
  ];

  memorias.forEach((memoria, index) => {
    const ang = angulosQuadros[index % angulosQuadros.length];
    const qx = Math.cos(ang) * raioParedesQuadros;
    const qz = Math.sin(ang) * raioParedesQuadros;
    const rotY = -ang - Math.PI / 2; // Voltado exatamente para o centro (0, 0, 0)

    const grupoQuadro = new THREE.Group();
    grupoQuadro.position.set(qx, 2.05, qz);
    grupoQuadro.rotation.y = rotY;

    const meshMoldura = new THREE.Mesh(geoMoldura, matMoldura);
    grupoQuadro.add(meshMoldura);

    const texFoto = loader.load(memoria.foto);
    const matFoto = new THREE.MeshStandardMaterial({ map: texFoto, roughness: 0.5 });
    const meshFoto = new THREE.Mesh(geoFoto, matFoto);
    meshFoto.position.z = 0.05;
    meshFoto.userData = { memoria: memoria, ehQuadro: true };
    grupoQuadro.add(meshFoto);
    quadrosInterativos.push(meshFoto);

    const texPlaca = criarTexturaPlaca(memoria.titulo, memoria.data);
    const meshPlaca = new THREE.Mesh(geoPlaca, new THREE.MeshBasicMaterial({ map: texPlaca }));
    meshPlaca.position.set(0, -alturaMoldura / 2 - 0.28, 0.05);
    grupoQuadro.add(meshPlaca);

    // Arandela Dourada Neoclássica
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
  //  5. LETREIRO COMEMORATIVO NO ÁPICE DA ROTUNDA (+Z)
  // ============================================================
  const angLetreiro = 0.50 * Math.PI; // Ápice oposto à entrada (+Z)
  const lx = Math.cos(angLetreiro) * raioParedesQuadros;
  const lz = Math.sin(angLetreiro) * raioParedesQuadros;

  const grupoLetreiro = new THREE.Group();
  grupoLetreiro.position.set(lx, 2.1, lz);
  grupoLetreiro.rotation.y = -angLetreiro - Math.PI / 2;

  const geoLetreiro = new THREE.PlaneGeometry(4.8, 2.5);
  const matLetreiro = new THREE.MeshStandardMaterial({
    map: criarTexturaLetreiroFinal(config.nome_homenageada),
    roughness: 0.4
  });
  const letreiro = new THREE.Mesh(geoLetreiro, matLetreiro);
  grupoLetreiro.add(letreiro);

  const colunaEsq = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.20, 3.8, 16), matMarmore);
  colunaEsq.position.set(-2.6, 0, 0.1);
  grupoLetreiro.add(colunaEsq);

  const colunaDir = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.20, 3.8, 16), matMarmore);
  colunaDir.position.set(2.6, 0, 0.1);
  grupoLetreiro.add(colunaDir);

  cena.add(grupoLetreiro);

  // Bancos Aveludados de Museu nas Curvas
  function criarBancoRotunda(angB) {
    const bx = Math.cos(angB) * (raioRotunda - 0.7);
    const bz = Math.sin(angB) * (raioRotunda - 0.7);
    const grupoBanco = new THREE.Group();
    grupoBanco.position.set(bx, 0, bz);
    grupoBanco.rotation.y = -angB;

    const assento = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.22, 0.65), matVeludoVermelho);
    assento.position.y = 0.45;
    grupoBanco.add(assento);

    const posPes = [[-0.65, 0.2, -0.22], [0.65, 0.2, -0.22], [-0.65, 0.2, 0.22], [0.65, 0.2, 0.22]];
    posPes.forEach(([px, py, pz]) => {
      const pe = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.03, 0.42, 8), matOuro);
      pe.position.set(px, py, pz);
      grupoBanco.add(pe);
    });

    cena.add(grupoBanco);
  }
  criarBancoRotunda(-0.52 * Math.PI); // À esquerda da entrada
  criarBancoRotunda(0.0);             // Na lateral direita

  // ============================================================
  //  6. ILUMINAÇÃO GERAL E LUSTRES DE CRISTAL
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

  // Grande Lustre Central Imperial sobre o Canteiro e o Presente
  function criarLustre(px, py, pz, escalaL = 1.0) {
    const grupoLustre = new THREE.Group();
    grupoLustre.position.set(px, py, pz);

    const cabo = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.8 * escalaL, 8), matOuro);
    cabo.position.y = -0.4 * escalaL;
    grupoLustre.add(cabo);

    const aroMaior = new THREE.Mesh(new THREE.TorusGeometry(0.65 * escalaL, 0.035, 8, 24), matOuro);
    aroMaior.rotation.x = Math.PI / 2;
    aroMaior.position.y = -0.8 * escalaL;
    grupoLustre.add(aroMaior);

    const aroMenor = new THREE.Mesh(new THREE.TorusGeometry(0.38 * escalaL, 0.028, 8, 20), matOuro);
    aroMenor.rotation.x = Math.PI / 2;
    aroMenor.position.y = -1.1 * escalaL;
    grupoLustre.add(aroMenor);

    const qtdPingentes = 16;
    for (let p = 0; p < qtdPingentes; p++) {
      const ang = (p / qtdPingentes) * Math.PI * 2;
      const cpx = Math.cos(ang) * (0.65 * escalaL);
      const cpz = Math.sin(ang) * (0.65 * escalaL);
      const cristal = new THREE.Mesh(new THREE.OctahedronGeometry(0.075 * escalaL, 0), matCristal);
      cristal.position.set(cpx, -0.9 * escalaL, cpz);
      grupoLustre.add(cristal);
    }

    const gotaCentral = new THREE.Mesh(new THREE.OctahedronGeometry(0.14 * escalaL, 0), matCristal);
    gotaCentral.position.y = -1.25 * escalaL;
    grupoLustre.add(gotaCentral);

    const spot = new THREE.PointLight(0xffe29a, 1.1 * escalaL, 12.0);
    spot.position.y = -0.95 * escalaL;
    grupoLustre.add(spot);
    luzesPontuais.push(spot);

    cena.add(grupoLustre);
    listaLustres.push(grupoLustre);
  }

  // 1 Lustre Imperial no Centro (0, 0)
  criarLustre(0, altura, 0, 1.25);

  // 4 Lustres Satélites a meia distância nos quadrantes
  const angulosLustres = [Math.PI * 0.25, Math.PI * 0.75, Math.PI * 1.25, Math.PI * 1.75];
  angulosLustres.forEach(al => {
    criarLustre(Math.cos(al) * 4.6, altura, Math.sin(al) * 4.6, 0.85);
  });

  const luzAmbiente = new THREE.AmbientLight(0xfff3e6, 0.70);
  cena.add(luzAmbiente);

  const luzPrincipal = new THREE.DirectionalLight(0xffedd8, 0.60);
  luzPrincipal.position.set(0, 4.0, 0);
  cena.add(luzPrincipal);

  // ============================================================
  //  7. CÉU ESTRELADO & VAGA-LUMES (MODO NOITE)
  // ============================================================
  const qtdEstrelas = 320;
  const geoEstrelas = new THREE.BufferGeometry();
  const posEstrelas = new Float32Array(qtdEstrelas * 3);
  for (let e = 0; e < qtdEstrelas; e++) {
    const angE = Math.random() * Math.PI * 2;
    const raioE = Math.random() * (raioRotunda * 1.2);
    posEstrelas[e * 3] = Math.cos(angE) * raioE;
    posEstrelas[e * 3 + 1] = altura + 0.3 + Math.random() * 6.0;
    posEstrelas[e * 3 + 2] = Math.sin(angE) * raioE;
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

  const qtdVagalumes = 26;
  const geoVagalumes = new THREE.BufferGeometry();
  const posVagalumes = new Float32Array(qtdVagalumes * 3);
  const dadosVagalumes = [];
  for (let v = 0; v < qtdVagalumes; v++) {
    const angV = Math.random() * Math.PI * 2;
    const raioV = Math.random() * (raioRotunda - 1.2);
    const vx = Math.cos(angV) * raioV;
    const vy = 0.6 + Math.random() * (altura - 1.2);
    const vz = Math.sin(angV) * raioV;
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
  //  8. CORAÇÕES & CHUVA DE PÉTALAS FLUTUANTES
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

  const qtdCoracoes = 42;
  const instCoracoes = new THREE.InstancedMesh(geoCoracao, matCoracao, qtdCoracoes);
  const dadosCoracoes = [];
  const dummy = new THREE.Object3D();

  for (let i = 0; i < qtdCoracoes; i++) {
    const angC = Math.random() * Math.PI * 2;
    const raioC = Math.random() * (raioRotunda - 1.2);
    const px = Math.cos(angC) * raioC;
    const py = Math.random() * (altura - 0.5) + 0.5;
    const pz = Math.sin(angC) * raioC;
    const vel = 0.2 + Math.random() * 0.3;
    const rotVel = (Math.random() - 0.5) * 1.5;

    dadosCoracoes.push({ x: px, y: py, z: pz, vel: vel, rot: Math.random() * Math.PI, rotVel: rotVel });
    dummy.position.set(px, py, pz);
    dummy.updateMatrix();
    instCoracoes.setMatrixAt(i, dummy.matrix);
  }
  instCoracoes.instanceMatrix.needsUpdate = true;
  cena.add(instCoracoes);

  // Chuva de Pétalas Flutuantes
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

  const qtdPetalas = 48;
  const instPetalas = new THREE.InstancedMesh(geoPetala, matPetala, qtdPetalas);
  const dadosPetalas = [];
  const dummyPetala = new THREE.Object3D();

  for (let p = 0; p < qtdPetalas; p++) {
    const angP = Math.random() * Math.PI * 2;
    const raioP = Math.random() * (raioRotunda - 1.0);
    const px = Math.cos(angP) * raioP;
    const py = Math.random() * altura + 0.2;
    const pz = Math.sin(angP) * raioP;
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

  // ============================================================
  //  9. RETORNO DO AMBIENTE (Limites Circulares & Animações)
  // ============================================================
  const limitesSala = {
    tipo: "circular",
    raioMax: 7.1,
    raioMinCentro: 2.65
  };

  let modoNoiteAtivo = false;
  let tempoGeral = 0;

  return {
    quadros: quadrosInterativos,
    limites: limitesSala,
    comprimentoSala: raioRotunda * 2,
    alternarModoNoite: (ativar) => {
      modoNoiteAtivo = (ativar !== undefined) ? ativar : !modoNoiteAtivo;
      if (modoNoiteAtivo) {
        luzAmbiente.color.setHex(0xff9f43);
        luzAmbiente.intensity = 0.25;
        luzPrincipal.color.setHex(0xe67e22);
        luzPrincipal.intensity = 0.25;
        matTeto.opacity = 0.15;
        matEstrelas.opacity = 0.95;
        matVagalumes.opacity = 0.88;
        luzesPontuais.forEach(l => {
          l.color.setHex(0xff793f);
          l.intensity = 1.25;
        });
      } else {
        luzAmbiente.color.setHex(0xfff3e6);
        luzAmbiente.intensity = 0.70;
        luzPrincipal.color.setHex(0xffedd8);
        luzPrincipal.intensity = 0.60;
        matTeto.opacity = 1.0;
        matEstrelas.opacity = 0.0;
        matVagalumes.opacity = 0.0;
        luzesPontuais.forEach(l => {
          l.color.setHex(0xffe29a);
          l.intensity = 1.0;
        });
      }
      return modoNoiteAtivo;
    },
    animarCenario: (delta) => {
      tempoGeral += delta;

      // 1. Balanço dos Lustres
      listaLustres.forEach((lustre, idx) => {
        lustre.rotation.z = Math.sin(tempoGeral * 1.1 + idx) * 0.016;
        lustre.rotation.x = Math.cos(tempoGeral * 0.85 + idx) * 0.012;
      });

      // 2. Animação da Caixinha de Presente no Centro
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
          const ang = Math.random() * Math.PI * 2;
          const r = Math.random() * (raioRotunda - 1.2);
          d.x = Math.cos(ang) * r;
          d.z = Math.sin(ang) * r;
        }
        dummy.position.set(d.x, d.y, d.z);
        dummy.rotation.y = d.rot;
        dummy.rotation.z = Math.sin(d.rot) * 0.2;
        dummy.updateMatrix();
        instCoracoes.setMatrixAt(i, dummy.matrix);
      }
      instCoracoes.instanceMatrix.needsUpdate = true;

      // 4. Animação da Chuva de Pétalas com Vento Radial
      for (let p = 0; p < qtdPetalas; p++) {
        const d = dadosPetalas[p];
        d.y -= d.quedaVel * delta;
        d.fase += delta * 2.0;
        d.rotX += d.rotXVel * delta;
        d.rotZ += d.rotZVel * delta;

        const ventoX = Math.sin(d.fase) * 0.15;
        if (d.y < 0.05) {
          d.y = altura - 0.2;
          const ang = Math.random() * Math.PI * 2;
          const r = Math.random() * (raioRotunda - 1.0);
          d.x = Math.cos(ang) * r;
          d.z = Math.sin(ang) * r;
        }

        dummyPetala.position.set(d.x + ventoX, d.y, d.z);
        dummyPetala.rotation.set(d.rotX, tempoGeral * 0.4, d.rotZ);
        dummyPetala.updateMatrix();
        instPetalas.setMatrixAt(p, dummyPetala.matrix);
      }
      instPetalas.instanceMatrix.needsUpdate = true;

      // 5. Vaga-lumes no Modo Noite
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
