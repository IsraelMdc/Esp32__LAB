// ============================================================
//  SITE THIAGO PEIXOTO — interações do mockup (visual)
// ============================================================
(function () {
  'use strict';

  // ---- Menu mobile ----
  var toggle = document.getElementById('navToggle');
  var nav = document.getElementById('mainNav');

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
    });

    // Fecha o menu ao clicar em um link (mobile)
    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        nav.classList.remove('open');
        toggle.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ---- Formulário de contato (mockup: sem backend) ----
  var form = document.getElementById('contatoForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var nome = (document.getElementById('nome') || {}).value || '';
      nome = nome.trim();
      var primeiro = nome ? nome.split(' ')[0] : '';
      alert(
        (primeiro ? primeiro + ', s' : 'S') +
        'ua mensagem foi enviada com sucesso!\n\n(Demonstração — este formulário é apenas visual.)'
      );
      form.reset();
    });
  }
})();

// ============================================================
//  INTEGRAÃ‡ÃƒO COM A API DO ESP32
// ============================================================
async function alternarLedESP32() {
  const btn = document.getElementById('esp32-btn-led');
  const statusEl = document.getElementById('esp32-led-status');
  if (btn) btn.disabled = true;
  try {
    const res = await fetch('/api/led', { method: 'POST' });
    const data = await res.json();
    if (statusEl) {
      statusEl.textContent = data.led ? 'LIGADO' : 'DESLIGADO';
      statusEl.style.color = data.led ? '#ff5252' : '#888';
    }
  } catch (err) {
    console.error('Erro ao alternar LED:', err);
  } finally {
    if (btn) btn.disabled = false;
  }
}

async function atualizarStatusESP32() {
  try {
    const res = await fetch('/api/status');
    const data = await res.json();
    const uptimeEl = document.getElementById('esp32-uptime');
    const ipEl = document.getElementById('esp32-ip');
    const statusEl = document.getElementById('esp32-led-status');
    if (uptimeEl) uptimeEl.textContent = data.uptime + 's';
    if (ipEl) ipEl.textContent = data.ip;
    if (statusEl) {
      statusEl.textContent = data.led ? 'LIGADO' : 'DESLIGADO';
      statusEl.style.color = data.led ? '#ff5252' : '#888';
    }
  } catch (e) {}
}

document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('esp32-btn-led');
  if (btn) btn.addEventListener('click', alternarLedESP32);
  setInterval(atualizarStatusESP32, 3000);
  atualizarStatusESP32();
});
