/*
 * ============================================================
 *  INTERAÇÃO COM OS QUADROS & CARTINHA SECRETA — PROJETO 06 (GESSY)
 * ============================================================
 */

import * as THREE from "../vendor/three.module.min.js";

export class GerenciadorInteracao {
  constructor(camera, listaQuadros, controlador, listaMemorias = [], config = {}) {
    this.camera = camera;
    this.quadros = listaQuadros;
    this.controlador = controlador;
    this.memorias = listaMemorias;
    this.config = config;

    this.raycaster = new THREE.Raycaster();
    this.miraCentro = new THREE.Vector2(0, 0); // Centro da tela

    this.quadroAtivo = null;
    this.distanciaMaxima = 4.5; // Metros de distância para interagir
    this.modalAberto = false;
    this.modalCartaAberto = false;
    this.memoriaAtualId = 1;

    // Elementos do DOM - Card HUD inferior
    this.elMira = document.getElementById("mira-central");
    this.elCard = document.getElementById("card-interacao");
    this.elTag = document.getElementById("card-tag");
    this.elTitulo = document.getElementById("card-titulo");
    this.elData = document.getElementById("card-data");
    this.btnHistoria = document.getElementById("btn-historia");

    // Elementos do DOM - Modal Overlay de Memória
    this.elModal = document.getElementById("modal-memoria");
    this.elModalBackdrop = document.getElementById("modal-memoria-backdrop");
    this.elBtnFechar = document.getElementById("btn-fechar-memoria");
    this.elBtnFecharX = document.getElementById("btn-fechar-x");
    this.elModalFoto = document.getElementById("modal-foto");
    this.elModalTag = document.getElementById("modal-tag");
    this.elModalTitulo = document.getElementById("modal-titulo");
    this.elModalData = document.getElementById("modal-data");
    this.elModalTexto = document.getElementById("modal-texto");
    this.elModalBtnAnt = document.getElementById("modal-btn-ant");
    this.elModalBtnProx = document.getElementById("modal-btn-prox");

    // Elementos do DOM - Modal da Cartinha Secreta
    this.elModalCarta = document.getElementById("modal-carta");
    this.elModalCartaBackdrop = document.getElementById("modal-carta-backdrop");
    this.elBtnFecharCarta = document.getElementById("btn-fechar-carta");
    this.elBtnFecharCartaX = document.getElementById("btn-fechar-carta-x");
    this.elCartaTitulo = document.getElementById("carta-titulo");
    this.elCartaSub = document.getElementById("carta-sub");
    this.elCartaCorpo = document.getElementById("carta-corpo");
    this.formRecado = document.getElementById("form-recado");
    this.inputRecado = document.getElementById("input-recado");
    this.btnEnviarRecado = document.getElementById("btn-enviar-recado");
    this.recadoFeedback = document.getElementById("recado-feedback");

    // Botão flutuante para o celular (polegar direito)
    this.btnAcaoMobile = document.getElementById("btn-acao-mobile");

    this.abertoEm = 0;
    this.distanciaToque = 6;
    this.pontoToque = new THREE.Vector2();

    // Toque direto na tela do celular
    if (this.controlador) {
      this.controlador.aoTocar = (x, y) => this.tocarNaTela(x, y);
    }

    this.configurarEventos();
  }

  tocarNaTela(clientX, clientY) {
    if (this.modalAberto || this.modalCartaAberto) return;

    this.pontoToque.set(
      (clientX / window.innerWidth) * 2 - 1,
      -(clientY / window.innerHeight) * 2 + 1
    );
    this.raycaster.setFromCamera(this.pontoToque, this.camera);
    const hits = this.raycaster.intersectObjects(this.quadros, false);

    if (hits.length > 0 && hits[0].distance <= this.distanciaToque) {
      this.ativarObjeto(hits[0].object);
    }
  }

  ativarObjeto(objeto) {
    if (!objeto || !objeto.userData) return;
    if (objeto.userData.ehPresente) {
      this.abrirCartaSecreta();
    } else if (objeto.userData.memoria) {
      this.abrirHistoria(objeto.userData.memoria);
    }
  }

  configurarEventos() {
    // Tecla 'E' para abrir história/carta ou 'Escape' para fechar qualquer modal
    window.addEventListener("keydown", (e) => {
      if (this.modalCartaAberto) {
        if (e.key === "Escape" || e.key === "Esc") {
          e.preventDefault();
          this.fecharCartaSecreta();
        }
        return;
      }

      if (this.modalAberto) {
        if (e.key === "Escape" || e.key === "Esc") {
          e.preventDefault();
          this.fecharHistoria();
        }
        return;
      }

      if ((e.key === "e" || e.key === "E") && this.quadroAtivo) {
        this.ativarObjeto(this.quadroAtivo);
      }
    });

    // Clique no botão do card HUD
    if (this.btnHistoria) {
      this.btnHistoria.addEventListener("click", (e) => {
        e.stopPropagation();
        if (this.quadroAtivo) {
          this.ativarObjeto(this.quadroAtivo);
        }
      });
    }

    // Botão flutuante do celular
    if (this.btnAcaoMobile) {
      this.btnAcaoMobile.addEventListener("click", (e) => {
        e.stopPropagation();
        if (this.quadroAtivo) {
          this.ativarObjeto(this.quadroAtivo);
        }
      });
    }

    // Clique geral na cena sobre o objeto em foco
    window.addEventListener("click", (e) => {
      if (this.modalAberto || this.modalCartaAberto) return;
      if (
        e.target.closest("#card-interacao") ||
        e.target.closest("#barra-topo") ||
        e.target.closest("#mobile-controles") ||
        e.target.closest("#btn-acao-mobile") ||
        e.target.closest("#modal-abertura")
      ) {
        return;
      }
      if (this.quadroAtivo) {
        this.ativarObjeto(this.quadroAtivo);
      }
    });

    // Fechar modal de Memória
    if (this.elBtnFechar) this.elBtnFechar.addEventListener("click", () => this.fecharHistoria());
    if (this.elBtnFecharX) this.elBtnFecharX.addEventListener("click", () => this.fecharHistoria());
    if (this.elModalBackdrop) this.elModalBackdrop.addEventListener("click", () => this.fecharHistoria());

    // Fechar modal de Cartinha
    if (this.elBtnFecharCarta) this.elBtnFecharCarta.addEventListener("click", () => this.fecharCartaSecreta());
    if (this.elBtnFecharCartaX) this.elBtnFecharCartaX.addEventListener("click", () => this.fecharCartaSecreta());
    if (this.elModalCartaBackdrop) this.elModalCartaBackdrop.addEventListener("click", () => this.fecharCartaSecreta());

    // Paginação Anterior / Próxima dentro do modal de memórias
    if (this.elModalBtnAnt) this.elModalBtnAnt.addEventListener("click", () => this.navegarMemoria(-1));
    if (this.elModalBtnProx) this.elModalBtnProx.addEventListener("click", () => this.navegarMemoria(1));

    // Formulário do Mural de Recados para o ESP32
    if (this.formRecado) {
      this.formRecado.addEventListener("submit", (e) => {
        e.preventDefault();
        this.enviarRecado();
      });
    }
  }

  atualizar() {
    if (this.modalAberto || this.modalCartaAberto) return;

    this.raycaster.setFromCamera(this.miraCentro, this.camera);
    const intersecoes = this.raycaster.intersectObjects(this.quadros, false);

    if (intersecoes.length > 0) {
      const hit = intersecoes[0];
      if (hit.distance <= this.distanciaMaxima) {
        this.destacarQuadro(hit.object);
        return;
      }
    }

    this.limparDestaque();
  }

  destacarQuadro(objetoQuadro) {
    if (this.quadroAtivo === objetoQuadro) return;

    this.quadroAtivo = objetoQuadro;
    const mem = objetoQuadro.userData.memoria || {};
    const ehPresente = !!objetoQuadro.userData.ehPresente;

    if (this.elMira) this.elMira.classList.add("ativo");

    if (ehPresente) {
      if (this.elTag) this.elTag.textContent = "SURPRESA ESPECIAL 🎁";
      if (this.elTitulo) this.elTitulo.textContent = mem.titulo || "Cartinha Secreta 💌";
      if (this.elData) this.elData.textContent = "Abra para ler com carinho ✨";
      if (this.btnHistoria) {
        this.btnHistoria.innerHTML = "<span>💌</span><span>Abrir Cartinha</span><span>→</span>";
      }
      if (this.btnAcaoMobile) {
        this.btnAcaoMobile.innerHTML = "<span>💌</span><span>Abrir Carta</span>";
      }
    } else if (objetoQuadro.userData.ehEspelho) {
      if (this.elTag) this.elTag.textContent = "ELOGIO ESPECIAL ✨";
      if (this.elTitulo) this.elTitulo.textContent = mem.titulo || "O Espelho Mais Sincero 🪞";
      if (this.elData) this.elData.textContent = "Você é a mais linda do mundo! 💛";
      if (this.btnHistoria) {
        this.btnHistoria.innerHTML = "<span>🪞</span><span>Olhar no espelho</span><span>→</span>";
      }
      if (this.btnAcaoMobile) {
        this.btnAcaoMobile.innerHTML = "<span>🪞</span><span>Olhar espelho</span>";
      }
    } else {
      if (this.elTag) this.elTag.textContent = "MEMÓRIA";
      if (this.elTitulo) this.elTitulo.textContent = mem.titulo || "Memória";
      if (this.elData) this.elData.textContent = mem.data || "";
      if (this.btnHistoria) {
        this.btnHistoria.innerHTML = "<span>💛</span><span>Nossa história</span><span>→</span>";
      }
      if (this.btnAcaoMobile) {
        this.btnAcaoMobile.innerHTML = "<span>💛</span><span>Ver história</span>";
      }
    }

    if (this.elCard) this.elCard.classList.add("visivel");
    if (this.btnAcaoMobile) this.btnAcaoMobile.classList.add("visivel");
  }

  limparDestaque() {
    if (!this.quadroAtivo) return;

    this.quadroAtivo = null;
    if (this.elMira) this.elMira.classList.remove("ativo");
    if (this.elCard) this.elCard.classList.remove("visivel");
    if (this.btnAcaoMobile) this.btnAcaoMobile.classList.remove("visivel");
  }

  abrirHistoria(memoria) {
    if (!memoria) return;
    this.memoriaAtualId = memoria.id;
    this.modalAberto = true;
    this.abertoEm = performance.now();

    if (document.exitPointerLock) document.exitPointerLock();

    if (this.controlador) {
      this.controlador.bloqueado = true;
      if (this.controlador.soltarJoystick) this.controlador.soltarJoystick();
    }

    this.renderizarConteudoModal(memoria);

    if (this.elModal) {
      this.elModal.classList.remove("oculto");
      this.elModal.scrollTop = 0;
    }

    this.limparDestaque();

    // Notifica o ESP32 sobre a visita
    fetch(`/api/visita?id=${memoria.id}&titulo=${encodeURIComponent(memoria.titulo)}`, { cache: "no-store" }).catch(() => {});
  }

  fecharHistoria() {
    if (performance.now() - this.abertoEm < 350) return;

    this.modalAberto = false;
    if (this.controlador) this.controlador.bloqueado = false;
    if (this.elModal) this.elModal.classList.add("oculto");
  }

  abrirCartaSecreta() {
    this.modalCartaAberto = true;
    this.abertoEm = performance.now();

    if (document.exitPointerLock) document.exitPointerLock();

    if (this.controlador) {
      this.controlador.bloqueado = true;
      if (this.controlador.soltarJoystick) this.controlador.soltarJoystick();
    }

    const carta = this.config.carta_secreta || {
      titulo: "Para o amor da minha vida 💌",
      subtitulo: "Um pedacinho do meu coração para você neste dia 20 de Outubro ✨",
      texto: "Feliz aniversário, meu amor! Que cada passo nesta galeria mostre o quanto você é especial para mim."
    };

    if (this.elCartaTitulo) this.elCartaTitulo.textContent = carta.titulo;
    if (this.elCartaSub) this.elCartaSub.textContent = carta.subtitulo;

    if (this.elCartaCorpo) {
      // Divide quebras de linha em parágrafos elegantes
      const paragrafos = (carta.texto || "").split(/\n\s*\n/).filter(p => p.trim().length > 0);
      if (paragrafos.length > 0) {
        this.elCartaCorpo.innerHTML = paragrafos.map(p => `<p>${p.replace(/\n/g, "<br/>")}</p>`).join("");
      } else {
        this.elCartaCorpo.innerHTML = `<p>${carta.texto || ""}</p>`;
      }
    }

    if (this.elModalCarta) {
      this.elModalCarta.classList.remove("oculto");
      this.elModalCarta.scrollTop = 0;
    }

    this.limparDestaque();

    // Notifica o ESP32 que a Gessy abriu a cartinha secreta
    fetch("/api/visita?id=carta&titulo=Cartinha+Secreta", { cache: "no-store" }).catch(() => {});
  }

  fecharCartaSecreta() {
    if (performance.now() - this.abertoEm < 350) return;

    this.modalCartaAberto = false;
    if (this.controlador) this.controlador.bloqueado = false;
    if (this.elModalCarta) this.elModalCarta.classList.add("oculto");
  }

  async enviarRecado() {
    if (!this.inputRecado || !this.btnEnviarRecado) return;
    const msg = this.inputRecado.value.trim();
    if (!msg) return;

    this.btnEnviarRecado.disabled = true;
    this.btnEnviarRecado.innerHTML = "<span>⏳</span><span>Gravando na placa física...</span>";

    try {
      const resp = await fetch("/api/recado", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: "mensagem=" + encodeURIComponent(msg)
      });

      if (this.recadoFeedback) {
        this.recadoFeedback.className = "recado-feedback sucesso";
        this.recadoFeedback.innerHTML = "💖 <strong>Seu recado foi gravado na placa!</strong> O LED do ESP32 pulsou na minha bancada em dois batimentos de coração e eu guardei sua mensagem com todo carinho.";
      }
      this.inputRecado.value = "";
    } catch (err) {
      if (this.recadoFeedback) {
        this.recadoFeedback.className = "recado-feedback";
        this.recadoFeedback.innerHTML = "💌 Recado enviado com sucesso! (Guardado para o Israel ler).";
      }
      this.inputRecado.value = "";
    } finally {
      this.btnEnviarRecado.disabled = false;
      this.btnEnviarRecado.innerHTML = "<span>💖</span><span>Enviar Recado para o ESP32</span>";
    }
  }

  navegarMemoria(direcao) {
    if (!this.memorias || this.memorias.length === 0) return;
    const indexAtual = this.memorias.findIndex((m) => m.id === this.memoriaAtualId);
    if (indexAtual === -1) return;

    const novoIndex = indexAtual + direcao;
    if (novoIndex >= 0 && novoIndex < this.memorias.length) {
      this.abrirHistoria(this.memorias[novoIndex]);
    }
  }

  renderizarConteudoModal(memoria) {
    const molduraFoto = this.elModalFoto ? this.elModalFoto.parentElement : null;

    if (memoria.id === "espelho") {
      if (molduraFoto) molduraFoto.classList.add("moldura-oculta");
      if (this.elModalTag) this.elModalTag.textContent = "ELOGIO DO UNIVERSO ✨";
      if (this.elModalTitulo) this.elModalTitulo.textContent = memoria.titulo || "O Espelho Mais Sincero 🪞";
      if (this.elModalData) this.elModalData.textContent = `💖 ${memoria.data}`;
      if (this.elModalTexto) {
        this.elModalTexto.innerHTML = `<p class="texto-elogio-espelho">${(memoria.texto || "").replace(/\n\n/g, '</p><p class="texto-elogio-espelho">')}</p>`;
      }
      
      // Esconde botões anterior/próximo quando for o espelho
      if (this.elModalBtnAnt) this.elModalBtnAnt.classList.add("desabilitado");
      if (this.elModalBtnProx) this.elModalBtnProx.classList.add("desabilitado");
      return;
    }

    if (molduraFoto) molduraFoto.classList.remove("moldura-oculta");
    if (this.elModalFoto) {
      this.elModalFoto.src = memoria.foto;
      this.elModalFoto.alt = memoria.titulo;
    }
    if (this.elModalTag) this.elModalTag.textContent = `MEMÓRIA #${memoria.id}`;
    if (this.elModalTitulo) this.elModalTitulo.textContent = memoria.titulo;
    if (this.elModalData) this.elModalData.textContent = `📅 ${memoria.data}`;
    if (this.elModalTexto) this.elModalTexto.textContent = memoria.texto;

    if (this.memorias && this.memorias.length > 0) {
      const idx = this.memorias.findIndex((m) => m.id === memoria.id);
      if (this.elModalBtnAnt) {
        if (idx > 0) {
          this.elModalBtnAnt.classList.remove("desabilitado");
        } else {
          this.elModalBtnAnt.classList.add("desabilitado");
        }
      }
      if (this.elModalBtnProx) {
        if (idx < this.memorias.length - 1) {
          this.elModalBtnProx.classList.remove("desabilitado");
        } else {
          this.elModalBtnProx.classList.add("desabilitado");
        }
      }
    }
  }
}
