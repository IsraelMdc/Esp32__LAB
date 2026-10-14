/*
 * ============================================================
 *  MODELAGEM BOTÂNICA ULTRA-REALISTA DAS FLORES — PROJETO 06 (GESSY)
 *  Solução 1: Modelos 3D Reais (GLB / GLTF) com Texturas PBR Fotográficas
 *  1. Lírio Rosa Stargazer (lilium com caule botânico e tépalas abertas)
 *  2. Gérbera Radiante (daisy/gerbera com miolo aveludado e pétalas coloridas)
 *  3. Rosa Vermelha Aveludada (rose com cálice, espinhos, caule e pétalas aveludadas)
 * ============================================================
 */

import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const gltfLoader = new GLTFLoader();

// Cache dos modelos 3D carregados
let modeloLirioTemplate = null;
let modeloRosaTemplate = null;
let modeloGerberaTemplate = null;

const pendentesLirio = [];
const pendentesRosa = [];
const pendentesGerbera = [];

// ------------------------------------------------------------
//  Carregamento Assíncrono dos Modelos GLB
// ------------------------------------------------------------

// 1. Lírio Rosa
gltfLoader.load(
  "modelos/lirio.glb",
  (gltf) => {
    modeloLirioTemplate = gltf.scene;
    modeloLirioTemplate.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material) {
          child.material.roughness = 0.35;
          child.material.metalness = 0.05;
        }
      }
    });
    pendentesLirio.forEach((fn) => fn(modeloLirioTemplate));
    pendentesLirio.length = 0;
  },
  undefined,
  (err) => console.warn("Aviso ao carregar lirio.glb:", err)
);

// 2. Rosa Vermelha
gltfLoader.load(
  "modelos/rosa.glb",
  (gltf) => {
    modeloRosaTemplate = gltf.scene;
    modeloRosaTemplate.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material) {
          child.material.roughness = 0.4;
          child.material.metalness = 0.08;
        }
      }
    });
    pendentesRosa.forEach((fn) => fn(modeloRosaTemplate));
    pendentesRosa.length = 0;
  },
  undefined,
  (err) => console.warn("Aviso ao carregar rosa.glb:", err)
);

// 3. Gérbera Radiante
gltfLoader.load(
  "modelos/gerbera.glb",
  (gltf) => {
    modeloGerberaTemplate = gltf.scene;
    modeloGerberaTemplate.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    pendentesGerbera.forEach((fn) => fn(modeloGerberaTemplate));
    pendentesGerbera.length = 0;
  },
  undefined,
  (err) => console.warn("Aviso ao carregar gerbera.glb:", err)
);

// ------------------------------------------------------------
//  Geradores de Flores com Modelos 3D Reais (GLB)
// ------------------------------------------------------------

/**
 * Cria uma instância de Lírio Rosa 3D Real (Lilium Stargazer)
 */
export function criarLirioRealista(escala = 1.0) {
  const container = new THREE.Group();

  function aplicar(orig) {
    const clone = orig.clone(true);
    // Ajuste de escala e orientação botânica
    clone.scale.set(escala * 1.5, escala * 1.5, escala * 1.5);
    container.add(clone);
  }

  if (modeloLirioTemplate) {
    aplicar(modeloLirioTemplate);
  } else {
    pendentesLirio.push(aplicar);
  }

  return container;
}

/**
 * Cria uma instância de Gérbera Radiante 3D Real com cor personalizável
 */
export function criarGerberaRealista(corHex = 0xff9f43, escala = 1.0) {
  const container = new THREE.Group();

  function aplicar(orig) {
    const clone = orig.clone(true);
    clone.scale.set(escala * 1.35, escala * 1.35, escala * 1.35);

    // Tingimento botânico dinâmico nas pétalas da gérbera
    clone.traverse((child) => {
      if (child.isMesh && child.material) {
        if (child.material.name === "Kit white" || child.name.toLowerCase().includes("petal")) {
          child.material = child.material.clone();
          child.material.color = new THREE.Color(corHex);
          child.material.roughness = 0.5;
        }
      }
    });

    container.add(clone);
  }

  if (modeloGerberaTemplate) {
    aplicar(modeloGerberaTemplate);
  } else {
    pendentesGerbera.push(aplicar);
  }

  return container;
}

/**
 * Cria uma instância de Rosa Vermelha 3D Real (Red Velvet Rose)
 */
export function criarRosaRealista(corHex = 0xbf0603, escala = 1.0) {
  const container = new THREE.Group();

  function aplicar(orig) {
    const clone = orig.clone(true);
    
    // A rosa vem orientada no eixo Z com botão no topo; ajustamos para ficar ereta
    clone.rotation.x = Math.PI / 2;
    clone.position.y = 0.45 * escala;
    clone.scale.set(escala * 0.45, escala * 0.45, escala * 0.45);

    // Ajuste de veludo no material da flor
    clone.traverse((child) => {
      if (child.isMesh && child.material) {
        if (corHex && child.material.name && child.material.name.toLowerCase().includes("petal")) {
          child.material = child.material.clone();
          child.material.color = new THREE.Color(corHex);
        }
      }
    });

    container.add(clone);
  }

  if (modeloRosaTemplate) {
    aplicar(modeloRosaTemplate);
  } else {
    pendentesRosa.push(aplicar);
  }

  return container;
}
