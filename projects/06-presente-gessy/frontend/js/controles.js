/*
 * ============================================================
 *  CONTROLES HÍBRIDOS (DESKTOP + MOBILE) — PROJETO 06 (GESSY)
 * ============================================================
 */

import * as THREE from "../vendor/three.module.min.js";

export class ControladorGaleria {
  constructor(camera, domElement, limitesSala) {
    this.camera = camera;
    this.domElement = domElement;
    this.limites = limitesSala; // { minX, maxX, minZ, maxZ }

    this.velocidade = 4.2; // metros por segundo
    this.sensibilidadeMouse = 0.0022;
    this.sensibilidadeTouch = 0.0045;

    // Celular/tablet: tela de toque como ponteiro principal OU tela estreita
    this.ehToque = window.matchMedia("(pointer: coarse)").matches || window.innerWidth <= 768;

    // Multi-touch: cada polegar é identificado pelo seu touch.identifier
    this.joystickTouchId = null;
    this.lookTouchId = null;
    this.inicioTouchLook = null;
    this.aoTocar = null;        // callback(x, y) definido pela interação (tap no quadro)
    this.soltarJoystick = null; // definido em configurarMobile()

    // Rotação da câmera
    this.pitch = 0; // Olhar para cima / baixo (eixo X)
    this.yaw = 0; // Olhar para frente (rumo ao centro da rotunda)

    // Estado do teclado
    this.teclas = { w: false, a: false, s: false, d: false };
    this.pointerTravado = false;

    // Estado do joystick mobile
    this.joystickAtivo = false;
    this.joystickDelta = { x: 0, y: 0 }; // normalizado de -1 a 1

    // Estado do toque para olhar (swipe)
    this.ultimoTouchLook = null;

    // Flag de bloqueio (ativada quando o modal de história estiver aberto)
    this.bloqueado = false;

    this.configurarTeclado();
    this.configurarPointerLock();
    this.configurarMobile();
  }

  configurarTeclado() {
    window.addEventListener("keydown", (e) => {
      const k = e.key.toLowerCase();
      if (k === "w" || k === "arrowup") this.teclas.w = true;
      if (k === "s" || k === "arrowdown") this.teclas.s = true;
      if (k === "a" || k === "arrowleft") this.teclas.a = true;
      if (k === "d" || k === "arrowright") this.teclas.d = true;
    });

    window.addEventListener("keyup", (e) => {
      const k = e.key.toLowerCase();
      if (k === "w" || k === "arrowup") this.teclas.w = false;
      if (k === "s" || k === "arrowdown") this.teclas.s = false;
      if (k === "a" || k === "arrowleft") this.teclas.a = false;
      if (k === "d" || k === "arrowright") this.teclas.d = false;
    });
  }

  configurarPointerLock() {
    this.domElement.addEventListener("click", () => {
      if (this.bloqueado) return;
      if (!this.pointerTravado && !this.ehToque) {
        this.domElement.requestPointerLock().catch(() => {});
      }
    });

    document.addEventListener("pointerlockchange", () => {
      this.pointerTravado = (document.pointerLockElement === this.domElement);
    });

    document.addEventListener("mousemove", (e) => {
      if (this.bloqueado || !this.pointerTravado) return;
      this.yaw -= e.movementX * this.sensibilidadeMouse;
      this.pitch -= e.movementY * this.sensibilidadeMouse;
      // Trava inclinação vertical entre -80° e +80°
      this.pitch = Math.max(-1.4, Math.min(1.4, this.pitch));
    });
  }

  configurarMobile() {
    const areaJoy = document.getElementById("joystick-area");
    const knob = document.getElementById("joystick-knob");
    const areaLook = document.getElementById("toque-olhar-area");

    // Procura, entre os dedos que mudaram, aquele com o identificador pedido
    const acharToque = (lista, id) => {
      for (let i = 0; i < lista.length; i++) {
        if (lista[i].identifier === id) return lista[i];
      }
      return null;
    };

    // ---------- Polegar esquerdo: analógico para andar ----------
    if (areaJoy && knob) {
      const raioMaximo = 45; // pixels de deslocamento máximo do analógico

      areaJoy.addEventListener("touchstart", (e) => {
        e.preventDefault();
        if (this.joystickTouchId !== null || this.bloqueado) return;
        const t = e.changedTouches[0];
        this.joystickTouchId = t.identifier;
        this.joystickAtivo = true;
        areaJoy.classList.add("ativo");
        this.atualizarKnob(t, areaJoy, knob, raioMaximo);
      }, { passive: false });

      areaJoy.addEventListener("touchmove", (e) => {
        e.preventDefault();
        const t = acharToque(e.changedTouches, this.joystickTouchId);
        if (t) this.atualizarKnob(t, areaJoy, knob, raioMaximo);
      }, { passive: false });

      const finalizarJoy = (e) => {
        if (e && !acharToque(e.changedTouches, this.joystickTouchId)) return;
        this.joystickTouchId = null;
        this.joystickAtivo = false;
        this.joystickDelta = { x: 0, y: 0 };
        knob.style.transform = "translate(0px, 0px)";
        areaJoy.classList.remove("ativo");
      };
      this.soltarJoystick = () => finalizarJoy(null);

      areaJoy.addEventListener("touchend", finalizarJoy);
      areaJoy.addEventListener("touchcancel", finalizarJoy);
    }

    // ---------- Polegar direito: arrastar para olhar / tocar no quadro ----------
    if (areaLook) {
      areaLook.addEventListener("touchstart", (e) => {
        e.preventDefault();
        if (this.lookTouchId !== null || this.bloqueado) return;
        const t = e.changedTouches[0];
        this.lookTouchId = t.identifier;
        this.ultimoTouchLook = { x: t.clientX, y: t.clientY };
        this.inicioTouchLook = { x: t.clientX, y: t.clientY, tempo: performance.now() };
      }, { passive: false });

      areaLook.addEventListener("touchmove", (e) => {
        e.preventDefault();
        const t = acharToque(e.changedTouches, this.lookTouchId);
        if (!t || !this.ultimoTouchLook || this.bloqueado) return;

        const dx = t.clientX - this.ultimoTouchLook.x;
        const dy = t.clientY - this.ultimoTouchLook.y;

        this.yaw -= dx * this.sensibilidadeTouch;
        this.pitch -= dy * this.sensibilidadeTouch;
        this.pitch = Math.max(-1.4, Math.min(1.4, this.pitch));

        this.ultimoTouchLook = { x: t.clientX, y: t.clientY };
      }, { passive: false });

      const finalizarLook = (e) => {
        const t = acharToque(e.changedTouches, this.lookTouchId);
        if (!t) return;
        // preventDefault no touchend impede o "clique fantasma" que o navegador
        // dispara ~300ms depois (ele fecharia o modal recém-aberto)
        e.preventDefault();

        const inicio = this.inicioTouchLook;
        this.lookTouchId = null;
        this.ultimoTouchLook = null;
        this.inicioTouchLook = null;

        if (e.type !== "touchend" || !inicio || this.bloqueado) return;

        // Toque curto e quase parado = "tap" (abrir quadro), não arrasto
        const andou = Math.hypot(t.clientX - inicio.x, t.clientY - inicio.y);
        const durou = performance.now() - inicio.tempo;
        if (andou < 12 && durou < 350 && typeof this.aoTocar === "function") {
          this.aoTocar(t.clientX, t.clientY);
        }
      };
      areaLook.addEventListener("touchend", finalizarLook, { passive: false });
      areaLook.addEventListener("touchcancel", finalizarLook, { passive: false });
    }
  }

  atualizarKnob(touch, area, knob, maxR) {
    const rect = area.getBoundingClientRect();
    const centroX = rect.left + rect.width / 2;
    const centroY = rect.top + rect.height / 2;

    let dx = touch.clientX - centroX;
    let dy = touch.clientY - centroY;
    const dist = Math.hypot(dx, dy);

    if (dist > maxR) {
      dx = (dx / dist) * maxR;
      dy = (dy / dist) * maxR;
    }

    knob.style.transform = `translate(${dx}px, ${dy}px)`;
    this.joystickDelta.x = dx / maxR;
    this.joystickDelta.y = dy / maxR;
  }

  atualizar(delta) {
    if (this.bloqueado) return;

    // 1. Atualiza orientação da câmera a partir de yaw e pitch
    const euler = new THREE.Euler(0, 0, 0, "YXZ");
    euler.x = this.pitch;
    euler.y = this.yaw;
    this.camera.quaternion.setFromEuler(euler);

    // 2. Calcula vetor de movimento no plano XZ
    let frente = 0;
    let lado = 0;

    // Entrada pelo teclado
    if (this.teclas.w) frente += 1;
    if (this.teclas.s) frente -= 1;
    if (this.teclas.d) lado += 1;
    if (this.teclas.a) lado -= 1;

    // Entrada pelo joystick mobile
    if (this.joystickAtivo) {
      frente -= this.joystickDelta.y; // empurrar para cima é negativo no Y de tela
      lado += this.joystickDelta.x;
    }

    if (frente !== 0 || lado !== 0) {
      const direcao = new THREE.Vector3(lado, 0, -frente).normalize();

      // Alinha com o ângulo yaw da câmera
      direcao.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);

      const passo = this.velocidade * delta;
      this.camera.position.x += direcao.x * passo;
      this.camera.position.z += direcao.z * passo;

      // 3. Colisão com os limites da sala (Circular ou Retangular)
      if (this.limites) {
        if (this.limites.tipo === "circular") {
          const distXZ = Math.hypot(this.camera.position.x, this.camera.position.z);
          // Limite externo (paredes circulares da rotunda)
          if (distXZ > this.limites.raioMax) {
            const fator = this.limites.raioMax / distXZ;
            this.camera.position.x *= fator;
            this.camera.position.z *= fator;
          }
          // Limite interno (cerquinha do canteiro central)
          if (this.limites.raioMinCentro && distXZ < this.limites.raioMinCentro) {
            const fatorC = this.limites.raioMinCentro / distXZ;
            this.camera.position.x *= fatorC;
            this.camera.position.z *= fatorC;
          }
        } else {
          this.camera.position.x = Math.max(this.limites.minX, Math.min(this.limites.maxX, this.camera.position.x));
          this.camera.position.z = Math.max(this.limites.minZ, Math.min(this.limites.maxZ, this.camera.position.z));
        }
      }
    }
  }
}

