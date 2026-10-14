/*
 * ============================================================
 *  CHUVA DE CORAÇÕES & BOTÃO BOOT — PROJETO 06 (GESSY)
 * ============================================================
 */

export class GerenciadorSurpresa {
  constructor() {
    this.ultimoContador = null;
    this.chuvaContainer = document.getElementById("chuva-container");
    this.alertaSurpresa = document.getElementById("alerta-surpresa");

    this.iniciarPolling();
  }

  iniciarPolling() {
    // Consulta a API do ESP32 a cada 2.5 segundos
    setInterval(() => {
      this.verificarSurpresa();
    }, 2500);

    // Primeira verificação imediata
    this.verificarSurpresa();
  }

  async verificarSurpresa() {
    try {
      const resp = await fetch("/api/surpresa", { cache: "no-store" });
      if (!resp.ok) return;
      const dados = await resp.json();

      if (this.ultimoContador === null) {
        // Primeira leitura: apenas registra o contador atual do ESP32
        this.ultimoContador = dados.contador;
        return;
      }

      if (dados.contador > this.ultimoContador) {
        this.ultimoContador = dados.contador;
        this.dispararChuvaCoracoes();
      }
    } catch (e) {
      // Ignora falhas temporárias de rede
    }
  }

  dispararChuvaCoracoes() {
    if (!this.chuvaContainer) return;

    // Vibração háptica no celular
    if ("vibrate" in navigator) {
      navigator.vibrate([100, 50, 100, 50, 200]);
    }

    // Exibe banner de alerta
    if (this.alertaSurpresa) {
      this.alertaSurpresa.classList.add("visivel");
      setTimeout(() => {
        this.alertaSurpresa.classList.remove("visivel");
      }, 4500);
    }

    // Cria 40 corações caindo pela tela
    const emoticons = ["💖", "💕", "✨", "❤️", "🥰", "🌸", "⭐"];
    for (let i = 0; i < 40; i++) {
      const el = document.createElement("div");
      el.className = "coracao-caindo";
      el.textContent = emoticons[Math.floor(Math.random() * emoticons.length)];

      const left = Math.random() * 96; // 0% a 96% da largura
      const dur = 2.5 + Math.random() * 2.5; // 2.5s a 5s
      const delay = Math.random() * 1.5;
      const size = 18 + Math.random() * 22; // 18px a 40px

      el.style.left = `${left}%`;
      el.style.animationDuration = `${dur}s`;
      el.style.animationDelay = `${delay}s`;
      el.style.fontSize = `${size}px`;

      this.chuvaContainer.appendChild(el);

      // Remove do DOM após a animação
      setTimeout(() => {
        el.remove();
      }, (dur + delay) * 1000);
    }
  }
}

