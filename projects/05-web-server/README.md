# Projeto 05 — Servidor Web & Cloudflare Tunnel

Hospeda o site institucional completo (HTML, CSS, JavaScript e imagens)
**100% offline dentro da memória Flash do ESP32**, permitindo acesso pela rede local
ou para o mundo inteiro através do **Cloudflare Tunnel**.

Além de servir a página com alta fidelidade visual, o site possui uma integração
direta com a placa: um botão no navegador para **acender e apagar o LED embutido
(GPIO 2)** em tempo real!

---

## Como gravar e rodar

Este projeto utiliza o sistema de arquivos **LittleFS**, portanto a gravação é feita em **duas etapas**:

### 1. Configurar o seu Wi-Fi (opcional)
Abra `src/config.h` e preencha com o nome e a senha do seu Wi-Fi residencial:
```cpp
#define WIFI_SSID     "SuaRedeWiFi"
#define WIFI_PASS     "SuaSenha123"
```
*(Se deixar em branco, o ESP32 iniciará automaticamente criando a sua própria rede Wi-Fi `ESP32-DrThiago`).*

### 2. Gravar os arquivos do site na memória Flash (`data/` ➜ Flash)
Sempre de dentro da pasta do projeto (`C:\Users\Public\esp32lab\projects\05-web-server`):
```powershell
..\..\pio.cmd run -t uploadfs
```
*(Esse comando formata a partição LittleFS e grava todos os arquivos estáticos: HTML, CSS, scripts e imagens).*

### 3. Gravar o programa C++ e abrir o Monitor Serial
```powershell
..\..\pio.cmd run -t upload -t monitor
```

---

## O que você deve ver no Monitor Serial

Ao iniciar, o ESP32 montará o LittleFS, conectará ao Wi-Fi e imprimirá as instruções de acesso:

```text
==========================================================
 PROJETO 05 — SERVIDOR WEB OFFLINE & CLOUDFLARE TUNNEL    
==========================================================
[FS] Montando o sistema de arquivos LittleFS...
[FS] LittleFS montado com sucesso!
[FS] Espaço total: 1966 KB
[FS] Espaço usado: 712 KB
[FS] Arquivo /index.html encontrado.
[WIFI] Conectando à rede: MinhaCasa ...
[WIFI] Conectado com sucesso ao roteador!
[WIFI] IP na rede local: 192.168.1.105
[WIFI] Ponto de Acesso ativo: 'ESP32-DrThiago'
[WIFI] IP do Ponto de Acesso: 192.168.4.1
[MDNS] Respondendo em: http://drthiago.local
[WEB] Servidor HTTP iniciado com sucesso na porta 80!
----------------------------------------------------------
 [COMO ACESSAR O SITE]
 1. Na rede Wi-Fi local: http://192.168.1.105  ou  http://drthiago.local
 2. Para colocar na internet com Cloudflare, rode no PowerShell:
    cloudflared tunnel --url http://192.168.1.105
 3. Conectando direto no Wi-Fi do ESP32: Rede 'ESP32-DrThiago' -> http://192.168.4.1
==========================================================
```

---

## Expondo o site para o mundo com Cloudflare Tunnel

Com o **Cloudflare Tunnel**, qualquer pessoa do planeta pode acessar o site que está dentro do seu ESP32 com **HTTPS gratuito**, sem precisar abrir portas no roteador nem lidar com CGNAT.

### Passo 1: Instalar o Cloudflare no Windows
No PowerShell (como Administrador ou usuário comum):
```powershell
winget install --id Cloudflare.cloudflared
```

### Passo 2: Iniciar o Túnel Rápido
Copie o IP que o ESP32 imprimiu no monitor serial (ex: `192.168.1.105`) e execute:
```powershell
cloudflared tunnel --url http://192.168.1.105
```

A Cloudflare gerará na hora uma URL pública protegida por SSL:
```text
+--------------------------------------------------------------------------------------------+
|  Your quick Tunnel has been created! Visit it at:                                          |
|  https://exemplos-aleatorios-aqui.trycloudflare.com                                       |
+--------------------------------------------------------------------------------------------+
```

Abra essa URL no 4G/5G do seu celular (desconectado do Wi-Fi) e veja o site do seu ESP32 abrindo no mundo real!

---

## Os conceitos deste projeto

### 1. O que é o LittleFS?
O ESP32 possui **4 MB** de memória Flash externa ao silício do processador. O **LittleFS** é um sistema de arquivos desenhado especialmente para microcontroladores com memórias Flash do tipo SPI/NOR:
- **Resistente a quedas de energia**: se você puxar o cabo USB no meio de uma gravação, o sistema de arquivos não se corrompe.
- **Nivelamento de desgaste (Wear Leveling)**: espalha as gravações para prolongar a vida útil dos setores da Flash.

### 2. A Tabela de Partição (`no_ota.csv`)
Por padrão, o ESP32 divide os 4 MB reservando espaço para atualizações OTA (*Over-The-Air*), o que deixava apenas ~1,4 MB para arquivos.
Configurando `board_build.partitions = no_ota.csv` no `platformio.ini`, realocamos os blocos:
- **2,0 MB** para o programa (`app0`)
- **1,92 MB** exclusivos para a partição de arquivos (`spiffs`/`littlefs`)
Isso permitiu guardar todo o site institucional com 11 fotos otimizadas ocupando menos de 800 KB!

### 3. Servidor Web (`WebServer.h`) e Rotas
O microcontrolador roda um loop escutando a porta 80:
* `server.serveStatic("/", LittleFS, "/")`: entrega qualquer arquivo requisitado pelo navegador (`index.html`, `styles.css`, `.png`), configurando automaticamente o tipo MIME.
* `server.on("/api/led", HTTP_POST, ...)`: permite que o JavaScript do site chame o chip via `fetch('/api/led')` para acender ou apagar o LED do GPIO 2.

---

## Experimentos

1. Abra o site no celular e clique no botão **"Alternar"** na barra inferior para ver o LED da placa acender fisicamente na sua bancada.
2. Desconecte o roteador Wi-Fi da tomada e veja o ESP32 continuar servindo o site offline através da sua própria rede `ESP32-DrThiago` em `http://192.168.4.1`.
3. Compartilhe o link do Cloudflare Tunnel com um amigo em outra cidade e peça para ele clicar no botão do LED enquanto você observa a placa!

---

← [04 — Wi-Fi Scan](../04-wifi-scan/README.md) · [Índice](../../README.md)

