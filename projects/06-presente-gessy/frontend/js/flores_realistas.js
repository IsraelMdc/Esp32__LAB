/*
 * ============================================================
 *  MODELAGEM BOTÂNICA ULTRA-REALISTA DAS FLORES — PROJETO 06 (GESSY)
 *  Solução 1: Modelos 3D Reais (GLB) com Preload, Postura Ereta e PBR
 *  1. Lírio Rosa Stargazer (lilium com caule botânico e tépalas abertas)
 *  2. Gérbera Radiante (daisy/gerbera com miolo aveludado e pétalas coloridas)
 *  3. Rosa Vermelha Aveludada (rose com cálice, espinhos, caule ereto e pétalas aveludadas)
 * ============================================================
 */

import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

// Gerenciador de Carregamento Floral Sincronizado
const loadingManager = new THREE.LoadingManager();

let callbackProgresso = null;
export function aoProgredirCarregamento(fn) {
  callbackProgresso = fn;
}

const totalModelos = 3;
let modelosCarregados = 0;

loadingManager.onProgress = function(url, loaded, total) {
  modelosCarregados = loaded;
  const pct = Math.min(100, Math.round((loaded / Math.max(total, totalModelos)) * 100));
  if (callbackProgresso) {
    callbackProgresso(pct, loaded, total);
  }
};

let resolverPronto = null;
export const promessaFloresProntas = new Promise((resolve) => {
  resolverPronto = resolve;
});

loadingManager.onLoad = function() {
  if (callbackProgresso) callbackProgresso(100, totalModelos, totalModelos);
  if (resolverPronto) resolverPronto();
};

loadingManager.onError = function(url) {
  console.warn("Aviso ao carregar modelo floral:", url);
  if (resolverPronto) resolverPronto();
};

const gltfLoader = new GLTFLoader(loadingManager);

// Cache dos modelos 3D carregados
let modeloLirioTemplate = null;
let modeloRosaTemplate = null;
let modeloGerberaTemplate = null;

const pendentesLirio = [];
const pendentesRosa = [];
const pendentesGerbera = [];

// ------------------------------------------------------------
//  Carregamento Assíncrono dos Modelos GLB com Tratamento
// ------------------------------------------------------------

// 1. Lírio Rosa (Lilium Stargazer)
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

// 2. Rosa Vermelha (Red Velvet Rose)
gltfLoader.load(
  "modelos/rosa.glb",
  (gltf) => {
    modeloRosaTemplate = gltf.scene;
    
    // Remove luzes e câmeras exportadas por padrão no arquivo original
    const lixo = [];
    modeloRosaTemplate.traverse((child) => {
      if (child.isCamera || child.isLight) {
        lixo.push(child);
      } else if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material) {
          child.material.roughness = 0.45;
          child.material.metalness = 0.05;
        }
      }
    });
    lixo.forEach((obj) => obj.parent && obj.parent.remove(obj));

    pendentesRosa.forEach((fn) => fn(modeloRosaTemplate));
    pendentesRosa.length = 0;
  },
  undefined,
  (err) => console.warn("Aviso ao carregar rosa.glb:", err)
);

// 3. Gérbera Radiante (Gerbera)
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
//  Geradores de Flores com Postura Ereta e Enraizamento no Solo
// ------------------------------------------------------------

/**
 * Cria uma instância de Lírio Rosa 3D Real (Lilium Stargazer)
 */
export function criarLirioRealista(escala = 1.0) {
  const container = new THREE.Group();

  function aplicar(orig) {
    const clone = orig.clone(true);
    // Base no ponto 0,0,0 para enraizamento perfeito
    clone.position.set(0, 0, 0);
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
    // Base no ponto 0,0,0
    clone.position.set(0, 0, 0);
    clone.scale.set(escala * 1.45, escala * 1.45, escala * 1.45);

    // Tingimento botânico dinâmico nas pétalas
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
 * Cria uma instância de Rosa Vermelha 3D Real com postura ereta autêntica
 */
export function criarRosaRealista(corHex = 0xbf0603, escala = 1.0) {
  const container = new THREE.Group();

  function aplicar(orig) {
    const clone = orig.clone(true);

    // Remove qualquer luz ou câmera herdada no clone
    const lixo = [];
    clone.traverse((child) => {
      if (child.isCamera || child.isLight) lixo.push(child);
    });
    lixo.forEach((obj) => obj.parent && obj.parent.remove(obj));

    // A rosa já possui rotação de 90° em X embutida no nó original do glTF!
    // NÃO aplicar rotação extra para manter o caule perfeitamente ereto e enraizado no chão
    clone.position.set(0, 0, 0);
    clone.scale.set(escala * 0.38, escala * 0.38, escala * 0.38);

    // Ajuste botânico de veludo nas pétalas
    clone.traverse((child) => {
      if (child.isMesh && child.material) {
        if (corHex && child.material.name && child.material.name.toLowerCase().includes("petal")) {
          child.material = child.material.clone();
          child.material.color = new THREE.Color(corHex);
          child.material.roughness = 0.45;
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
