#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
============================================================
 SERVIDOR DE DESENVOLVIMENTO LOCAL — GALERIA DA GESSY
 Permite testar, alterar fotos, textos e estilos no seu PC
 sem precisar de placa ligada nem de nenhuma IA!
============================================================
"""

import http.server
import socketserver
import webbrowser
import urllib.parse
import json
import os
import time

PORTA = 8000
DIRETORIO_ATUAL = os.path.dirname(os.path.abspath(__file__))

contador_surpresas = 0
recados_locais = []

class ManipuladorGaleria(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRETORIO_ATUAL, **kwargs)

    def do_GET(self):
        global contador_surpresas
        parsed = urllib.parse.urlparse(self.path)
        rota = parsed.path
        params = urllib.parse.parse_qs(parsed.query)

        # Mock da API /api/status do ESP32
        if rota == "/api/status":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            dados = {
                "status": "online (servidor local de teste)",
                "projeto": "06-presente-gessy-frontend",
                "ip": "localhost",
                "uptime": int(time.time()),
                "heap_livre": 240000,
                "wifi_rssi": -10,
                "surpresas_disparadas": contador_surpresas,
                "led": False
            }
            self.wfile.write(json.dumps(dados).encode("utf-8"))
            return

        # Mock da API /api/surpresa (chuva de corações)
        elif rota == "/api/surpresa":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            dados = {"contador": contador_surpresas}
            self.wfile.write(json.dumps(dados).encode("utf-8"))
            return

        # Mock da API /api/visita (quando abre um quadro ou cartinha)
        elif rota == "/api/visita":
            mem_id = params.get("id", ["?"])[0]
            titulo = params.get("titulo", ["Memória"])[0]
            print(f"\n[💖 VISITA LOCAL] Gessy abriu a memória #{mem_id}: \"{titulo}\"")
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(b'{"status":"ok"}')
            return

        # Mock da API /api/recados (listar recados gravados)
        elif rota == "/api/recados":
            self.send_response(200)
            self.send_header("Content-Type", "text/plain; charset=utf-8")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            if os.path.exists("recados.txt"):
                with open("recados.txt", "r", encoding="utf-8") as f:
                    conteudo = f.read()
            else:
                conteudo = "Nenhum recado ainda."
            self.wfile.write(conteudo.encode("utf-8"))
            return

        # Se for qualquer outro arquivo estático (HTML, CSS, JS, Fotos)
        return super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        rota = parsed.path

        # Mock da API /api/recado (grava o recado da Gessy)
        if rota == "/api/recado":
            tamanho = int(self.headers.get("Content-Length", 0))
            corpo = self.rfile.read(tamanho).decode("utf-8")
            dados = urllib.parse.parse_qs(corpo)
            msg = dados.get("mensagem", [corpo])[0]

            print("\n" + "=" * 55)
            print(" [💌 NOVO RECADO RECEBIDO NO TESTE LOCAL!]")
            print(f" \"{msg}\"")
            print("=" * 55)

            with open("recados.txt", "a", encoding="utf-8") as f:
                f.write(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] {msg}\n")

            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            resp = {"status": "ok", "mensagem": "Recebido com muito amor pelo Israel! ❤️"}
            self.wfile.write(json.dumps(resp).encode("utf-8"))
            return

        self.send_response(404)
        self.end_headers()

def iniciar():
    os.chdir(DIRETORIO_ATUAL)
    with socketserver.TCPServer(("", PORTA), ManipuladorGaleria) as httpd:
        url = f"http://localhost:{PORTA}"
        print("=" * 60)
        print("   GALERIA DA GESSY — SERVIDOR LOCAL DE DESENVOLVIMENTO   ")
        print("=" * 60)
        print(f" Servidor rodando em: {url}")
        print(" Abra no seu navegador e aperte F5 para ver alterações no ar!")
        print(" Pressione Ctrl + C no terminal a qualquer momento para fechar.")
        print("=" * 60)
        webbrowser.open(url)
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServidor encerrado.")

if __name__ == "__main__":
    iniciar()

