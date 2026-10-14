#!/usr/bin/env python3
"""
Servidor local de teste e pre-visualizacao da Galeria 3D da Gessy.
Simula exatamente o comportamento do ESP32:
 - Entrega arquivos estaticos de data/
 - Suporta descompressao transparente de arquivos .gz (Three.js)
 - Simula as rotas da API REST (/api/status, /api/surpresa, /api/visita)
"""

import os
import sys
import json
import mimetypes
from http.server import HTTPServer, SimpleHTTPRequestHandler

# Garante saida em UTF-8 no terminal Windows sem erro de charmap
if sys.stdout and hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if sys.stderr and hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

PORT = 8080
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "projects", "06-presente-gessy", "data"))
contador_surpresas = 0

class PresenteHandler(SimpleHTTPRequestHandler):
    def translate_path(self, path):
        clean_path = path.split("?", 1)[0].split("#", 1)[0]
        clean_path = clean_path.lstrip("/")
        if not clean_path or clean_path == "/":
            clean_path = "index.html"
        return os.path.join(BASE_DIR, clean_path)

    def do_GET(self):
        global contador_surpresas
        url_path = self.path.split("?", 1)[0]

        # API Simulado: /api/surpresa
        if url_path == "/api/surpresa":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps({"contador": contador_surpresas}).encode("utf-8"))
            return

        # API Simulado: /api/visita
        if url_path == "/api/visita":
            print(f"\n[SIMULACAO VISITA] A Gessy abriu uma memoria! ({self.path})")
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(b'{"status":"ok"}')
            return

        # API Simulado: /api/status
        if url_path == "/api/status":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps({
                "status": "online",
                "simulador": True,
                "surpresas_disparadas": contador_surpresas
            }).encode("utf-8"))
            return

        # Rota de simulacao do botao BOOT: /disparar-surpresa
        if url_path == "/disparar-surpresa":
            contador_surpresas += 1
            print(f"\n[SIMULACAO BOOT] Chuva de coracoes #{contador_surpresas} disparada!")
            self.send_response(200)
            self.send_header("Content-Type", "text/plain; charset=utf-8")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(f"Surpresa #{contador_surpresas} disparada com sucesso! Olhe a aba da galeria.".encode("utf-8"))
            return

        # Arquivos estaticos normais e suporte a .gz
        caminho_local = self.translate_path(self.path)

        is_gz = False
        if not os.path.exists(caminho_local) and os.path.exists(caminho_local + ".gz"):
            caminho_local = caminho_local + ".gz"
            is_gz = True

        if os.path.isdir(caminho_local):
            caminho_local = os.path.join(caminho_local, "index.html")

        if not os.path.exists(caminho_local):
            self.send_error(404, "Arquivo nao encontrado")
            return

        caminho_original = caminho_local[:-3] if is_gz else caminho_local
        mime, _ = mimetypes.guess_type(caminho_original)
        if caminho_original.endswith(".js"):
            mime = "application/javascript"
        elif caminho_original.endswith(".json"):
            mime = "application/json"
        elif not mime:
            mime = "application/octet-stream"

        try:
            with open(caminho_local, "rb") as f:
                conteudo = f.read()

            self.send_response(200)
            self.send_header("Content-Type", mime)
            self.send_header("Content-Length", str(len(conteudo)))
            if is_gz:
                self.send_header("Content-Encoding", "gzip")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(conteudo)
        except Exception as e:
            self.send_error(500, f"Erro ao ler arquivo: {e}")

def main():
    server = HTTPServer(("0.0.0.0", PORT), PresenteHandler)
    print("=" * 60)
    print("  SIMULADOR DA GALERIA 3D DA GESSY (PROJETO 06)")
    print("=" * 60)
    print(f" Servindo pasta: {BASE_DIR}")
    print(f" Abra no navegador: http://localhost:{PORT}")
    print(f" Para testar a contagem liberada: http://localhost:{PORT}/?preview=1")
    print(f" Para simular o botao BOOT (chuva de coracoes): http://localhost:{PORT}/disparar-surpresa")
    print("=" * 60)
    print(" Pressione Ctrl+C para encerrar.\n")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServidor encerrado.")

if __name__ == "__main__":
    main()

