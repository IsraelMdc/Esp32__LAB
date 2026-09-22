# Plano Detalhado de Implementação: Projeto 05-web-server

Laboratório: **Esp32__LAB**  
Placa: **ESP32 DevKit v1 (ESP-WROOM-32, 4 MB Flash)**  
Objetivo: Hospedar o site [israelmdc.github.io](https://israelmdc.github.io) 100% offline na Flash do ESP32, permitindo acesso local via Wi-Fi e acesso público mundial via Cloudflare Tunnel.

---

## 1. Visão Geral e Arquitetura

O ESP32 atuará como um **servidor HTTP completo**:
1. **Armazenamento**: O HTML, CSS, JavaScript e as fotos do site ficarão gravados na partição de arquivos do chip (**LittleFS**).
2. **Rede Local**: O ESP32 conecta no roteador Wi-Fi da sua residência (Modo Estação). Caso o Wi-Fi falhe ou não seja configurado, ele cria automaticamente uma rede própria (**Ponto de Acesso**: `ESP32-DrThiago` no IP `192.168.4.1`).
3. **Acesso Público (Cloudflare Tunnel)**: O seu computador Windows roda um túnel leve (`cloudflared tunnel --url http://<IP_DO_ESP32>`) que cria uma ponte segura HTTPS entre a internet e o ESP32, sem abrir portas no roteador e sem problemas de CGNAT.
4. **Interatividade de Hardware**: Além de exibir o site institucional com alta fidelidade visual, uma pequena API REST (`/api/led` e `/api/status`) permitirá controlar o LED embutido no pino GPIO 2 diretamente pelo navegador.

```
       [ Usuários na Internet ]
                  │
                  ▼ (HTTPS seguro)
       [ Servidores Cloudflare ]
                  │
                  ▼ (Túnel criptografado de saída)
       [ Seu PC Windows ] (cloudflared.exe)
                  │
                  ▼ (Rede Wi-Fi local)
       [ ESP32 DevKit v1 ] (LittleFS + WebServer na porta 80)
                  │
       ┌──────────┴──────────┐
       ▼                     ▼
[ Site Dr. Thiago ]   [ Controle do LED GPIO 2 ]
```

---

## 2. Diagnóstico Técnico de Memória e Particionamento

### O desafio da Flash:
* O ESP32 tem **4 MB (4.194.304 bytes)** de Flash no total.
* O site no GitHub possui **11 imagens** que somam mais de **200 MB** (algumas fotos individuais passam de 35 MB).
* **Solução**: Um script automático baixará os arquivos e comprimirá as imagens para resolução web otimizada (JPG/PNG comprimido de ~40 KB a 70 KB cada).
* O site completo (HTML + CSS + JS + 11 imagens) ocupará aproximadamente **600 KB a 800 KB**.

### Tabela de Partições (`no_ota.csv`):
Usaremos o esquema de partição nativo `no_ota.csv` da Espressif, que divide a memória da seguinte forma:
* **Firmware (Programa C++)**: 2 MB (`0x200000`)
* **Sistema de Arquivos (LittleFS)**: **1,92 MB** (`0x1E0000`) — espaço de sobra para os ~700 KB do site.
* **NVS / Dados do Sistema**: 28 KB

---

## 3. Estrutura de Arquivos a Ser Criada

```
Esp32__LAB/
├── docs/
│   └── plano-05-web-server.md         ← Este plano de referência
│
├── tools/
│   └── preparar_site.ps1              ← Script para baixar e otimizar os assets do GitHub
│
└── projects/
    └── 05-web-server/
        ├── platformio.ini             ← Configuração com LittleFS e no_ota.csv
        ├── README.md                  ← Teoria, comandos e guia do Cloudflare
        │
        ├── src/
        │   ├── main.cpp               ← Código C++ do servidor HTTP e rotas
        │   ├── config.h               ← SSID e senha do seu Wi-Fi (gitignored)
        │   └── config.h.example       ← Modelo de exemplo versionado no Git
        │
        └── data/                      ← Pasta que será gravada na Flash do ESP32
            ├── index.html             ← HTML adaptado com integração ao LED
            ├── styles.css             ← Estilos visuais do site
            ├── script.js              ← Interatividade e chamadas à API do ESP32
            └── assets/
                ├── img/
                │   ├── SITE THIAGO PEIXOTO_ImgID4.png
                │   ├── ...
                │   └── SITE THIAGO PEIXOTO_ImgID10.png
                └── img2/
                    ├── DR THIAGO - LOGO MANDATO 006 SEM FUNDO.png
                    ├── SITE THIAGO PEIXOTO IMAGEM 1.png
                    ├── SITE THIAGO PEIXOTO IMAGEM 2.png
                    └── SITE THIAGO PEIXOTO IMAGEM 3.png
```

---

## 4. Detalhamento dos Componentes

### 4.1. `platformio.ini`
```ini
[platformio]
extra_configs = ../../shared/base.ini

[env:web-server]
board_build.filesystem = littlefs
board_build.partitions = no_ota.csv
```

### 4.2. `src/config.h` e Segurança
Para que você não cometa o erro acidental de publicar a senha do seu Wi-Fi no GitHub:
* O arquivo `src/config.h` conterá:
  ```cpp
  #define WIFI_SSID "Nome_Do_Seu_WiFi"
  #define WIFI_PASSWORD "Sua_Senha_Aqui"
  #define AP_SSID "ESP32-DrThiago"
  #define AP_PASSWORD "12345678"
  ```
* Adicionaremos `projects/05-web-server/src/config.h` ao `.gitignore`.
* Um arquivo `config.h.example` será versionado com valores de modelo.

### 4.3. `src/main.cpp`
* **Inicialização**: Monta o `LittleFS`. Se a partição não estiver formatada, formata automaticamente na primeira vez.
* **Wi-Fi**:
  - Tenta conectar no roteador por até 10 segundos.
  - Se conectar: imprime na Serial o IP obtido (ex: `192.168.1.105`).
  - Se não conectar: ativa o Modo Ponto de Acesso (`ESP32-DrThiago` em `192.168.4.1`).
  - Inicia o serviço mDNS (`http://drthiago.local` e `http://esp32.local`).
* **Rotas do Servidor HTTP (`WebServer.h`)**:
  - `GET /api/status`: Retorna JSON com uptime em segundos, memória RAM livre, força do sinal Wi-Fi (RSSI) e estado do LED.
  - `POST /api/led`: Alterna o estado do LED embutido (GPIO 2) e retorna o novo estado.
  - `server.serveStatic("/", LittleFS, "/");`: Serve todos os arquivos estáticos (`.html`, `.css`, `.js`, `.png`, `.jpg`, `.svg`) com cache HTTP configurado para que o navegador não fique sobrecarregando o microcontrolador com requisições repetidas.
* **Diagnóstico no Monitor Serial**:
  Imprime instruções claras assim que conecta:
  ```text
  ======================================================
   PROJETO 05: SERVIDOR WEB OFFLINE + CLOUDFLARE TUNNEL
  ======================================================
  [LITTLEFS] Sistema de arquivos montado com sucesso.
  [WIFI] Conectado em: MinhaRede
  [WIFI] IP Local: 192.168.1.105
  [MDNS] Acesse: http://drthiago.local
  ------------------------------------------------------
  [CLOUDFLARE] Para disponibilizar na internet, rode:
  cloudflared tunnel --url http://192.168.1.105
  ======================================================
  ```

### 4.4. Integração Visual no `index.html`
O design do site será mantido **exatamente igual ao original**, com apenas uma adição elegante:
* Uma barra flutuante ou rodapé discreto indicando:
  `⚡ Servido por ESP32 DevKit v1 | Uptime: 45s | LED GPIO 2: [ Alternar ]`
* Isso permite a qualquer pessoa que abrir o site constatar imediatamente que o site está de fato rodando dentro daquele pequeno chip na sua mesa!

---

## 5. Roteiro de Teste e Validação Passo a Passo

### Etapa 1: Download e Processamento dos Arquivos
Executar o script `tools/preparar_site.ps1` para baixar os arquivos do GitHub `israelmdc.github.io`, comprimir as fotos e organizá-las na pasta `projects/05-web-server/data/`.
* *Critério de sucesso*: Pasta `data/` pesando menos de 1 MB.

### Etapa 2: Gravação na Memória Flash
Sempre pelo caminho seguro da junction (`C:\Users\Public\esp32lab\projects\05-web-server`):
1. **Gravar o site**: `..\..\pio.cmd run -t uploadfs`
   *(Grava a pasta `data/` na partição LittleFS do ESP32).*
2. **Gravar o programa**: `..\..\pio.cmd run -t upload -t monitor`
   *(Grava o firmware C++ e abre o monitor serial).*

### Etapa 3: Validação Local
* Abrir o navegador no computador ou celular e acessar `http://<IP_DO_ESP32>` ou `http://drthiago.local`.
* Testar se as imagens abrem e se o botão do LED acende/apaga o LED vermelho do GPIO 2 na placa.

### Etapa 4: Validação Externa (Cloudflare Tunnel)
1. Instalar o Cloudflare: `winget install --id Cloudflare.cloudflared`
2. No PowerShell: `cloudflared tunnel --url http://<IP_DO_ESP32>`
3. Acessar a URL gerada (`https://xxxx.trycloudflare.com`) pelo 4G do celular (fora do Wi-Fi).
* *Critério de sucesso*: O site abre no celular via internet móvel diretamente a partir do ESP32.

---

## 6. Configuração no VS Code
* Adicionar a pasta do novo projeto em [Esp32__LAB.code-workspace](file:///C:/Users/Public/esp32lab/Esp32__LAB.code-workspace):
  ```json
  { "name": "05 · web-server", "path": "projects/05-web-server" }
  ```
* Rodar `tools/gerar_intellisense.cmd` para o VS Code indexar todas as bibliotecas e não acusar erro de `#include`.
* Atualizar o [README.md](file:///C:/Users/Public/esp32lab/README.md) principal do repositório.

