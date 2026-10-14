/*
 * ============================================================
 *  PROJETO 06 — PRESENTE DA GESSY: GALERIA 3D & CLOUDFLARE
 * ============================================================
 *
 *  O QUE FAZ:
 *      Hospeda uma galeria de arte 3D completa e interativa
 *      (Three.js, texturas, iluminação suave, fotos e música)
 *      diretamente na memória Flash do ESP32 (LittleFS).
 *
 *      O site é acessado localmente ou pelo mundo através do
 *      Cloudflare Tunnel. A Gessy caminha pelo salão 3D,
 *      interage com os quadros e lê as memórias de cada dia.
 *
 *  RECURSOS USADOS (SÓ A PLACA E O CABO USB):
 *      - Rádio Wi-Fi (Modo Estação para roteador)
 *      - Memória Flash SPI (partição customizada LittleFS de 2,62 MB)
 *      - Entrega otimizada com descompressão transparente de arquivos .gz
 *      - Botão BOOT embutido (GPIO 0): quando você aperta na placa,
 *        dispara uma chuva de corações mágica na tela dela em tempo real!
 *      - LED embutido (GPIO 2): pisca suavemente confirmando visitas e surpresas
 *      - Memória NVS (Preferences) para gravar Wi-Fi sem regravar firmware
 * ============================================================
 */

#include <Arduino.h>
#include <WiFi.h>
#include <WebServer.h>
#include <ESPmDNS.h>
#include <LittleFS.h>
#include <Preferences.h>
#include "config.h"

// Servidor HTTP na porta padrão 80
WebServer server(80);

// Armazenamento não-volátil (NVS) para salvar Wi-Fi configurado
Preferences prefs;
String wifiSsid = "";
String wifiPass = "";

// Estado do hardware
bool ledEstado = false;
volatile uint32_t contadorSurpresas = 0;
unsigned long ultimoApertoBoot = 0;
bool botaoEstavaApertado = false;

// Controle de tempo para tarefas periódicas
unsigned long ultimoStatusSerial = 0;
const unsigned long INTERVALO_STATUS_MS = 15000; // diagnóstico a cada 15s

// Controle de pulso do LED (sem usar delay)
unsigned long tempoFimPulsoLed = 0;

// ------------------------------------------------------------
//  MIME Types e Cache HTTP
// ------------------------------------------------------------
String obterMimeType(const String& path) {
  if (path.endsWith(".html") || path.endsWith(".htm")) return "text/html; charset=utf-8";
  if (path.endsWith(".css")) return "text/css; charset=utf-8";
  if (path.endsWith(".js")) return "application/javascript; charset=utf-8";
  if (path.endsWith(".json")) return "application/json; charset=utf-8";
  if (path.endsWith(".png")) return "image/png";
  if (path.endsWith(".jpg") || path.endsWith(".jpeg")) return "image/jpeg";
  if (path.endsWith(".svg")) return "image/svg+xml";
  if (path.endsWith(".ico")) return "image/x-icon";
  if (path.endsWith(".mp3")) return "audio/mpeg";
  if (path.endsWith(".glb")) return "model/gltf-binary";
  if (path.endsWith(".gltf")) return "model/gltf+json";
  return "text/plain";
}

const char* cacheParaTipo(const String& path) {
  // Arquivos estáticos pesados recebem cache longo de 1 dia no navegador
  if (path.startsWith("/fotos/") || path.startsWith("/vendor/") || path.startsWith("/modelos/") || path.endsWith(".mp3") || path.endsWith(".png") || path.endsWith(".jpg") || path.endsWith(".glb")) {
    return "public, max-age=86400, immutable";
  }
  // Páginas HTML e JSON de memórias ficam sem cache para alterações refletirem na hora
  return "no-cache, no-store, must-revalidate";
}

// ------------------------------------------------------------
//  Entrega de Arquivos do LittleFS com Suporte Transparente a .gz
// ------------------------------------------------------------
bool servirArquivo(String caminho) {
  if (caminho.endsWith("/")) {
    caminho += "index.html";
  }

  // O MIME type é determinado pela extensão ORIGINAL do arquivo
  String mime = obterMimeType(caminho);
  String caminhoReal = caminho;

  // Em arquivos dentro de /vendor/ e /modelos/, a versão comprimida .gz é a padrão na flash
  if (caminho.startsWith("/vendor/") || caminho.startsWith("/modelos/")) {
    String versaoGz = caminhoReal + ".gz";
    if (LittleFS.exists(versaoGz)) {
      caminhoReal = versaoGz;
    }
  }

  // Se ainda não achou, verifica o arquivo cru e depois a versão .gz
  if (!LittleFS.exists(caminhoReal)) {
    String versaoGz = caminhoReal + ".gz";
    if (LittleFS.exists(versaoGz)) {
      caminhoReal = versaoGz;
    } else {
      return false; // Arquivo não encontrado
    }
  }

  File f = LittleFS.open(caminhoReal, "r");
  if (!f || f.isDirectory()) {
    if (f) f.close();
    return false;
  }

  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Cache-Control", cacheParaTipo(caminho));

  // O método streamFile do WebServer detecta automaticamente a terminação ".gz"
  // no nome do arquivo aberto e injeta o header "Content-Encoding: gzip",
  // permitindo que o navegador descompacte o arquivo no ar sem consumir RAM do chip!
  server.streamFile(f, mime);
  f.close();
  return true;
}

// Manipulador de requisições gerais (arquivos e SPA fallback)
void tratarRequisicaoWeb() {
  String uri = server.uri();

  // 1. Tenta servir o arquivo solicitado
  if (servirArquivo(uri)) {
    return;
  }

  // 2. Se a rota possui extensão (.mp3, .js, .css, .jpg, .png, etc.), NÃO faz fallback para index.html!
  int ultPonto = uri.lastIndexOf('.');
  int ultBarra = uri.lastIndexOf('/');
  if (ultPonto > ultBarra) {
    server.send(404, "text/plain", "404 - Arquivo nao encontrado");
    return;
  }

  // 3. Fallback para index.html apenas para rotas SPA limpas sem extensão
  if (servirArquivo("/index.html")) {
    return;
  }

  // 4. 404 se nada existir
  server.send(404, "text/plain", "404 - Arquivo não encontrado no LittleFS");
}

// ------------------------------------------------------------
//  Rotas da API REST
// ------------------------------------------------------------

// GET /api/status -> Telemetria do chip e estado da galeria
void tratarApiStatus() {
  String ipStr = WiFi.status() == WL_CONNECTED ? WiFi.localIP().toString() : "desconectado";
  int rssi = WiFi.status() == WL_CONNECTED ? WiFi.RSSI() : 0;
  uint32_t uptimeSegundos = millis() / 1000;
  uint32_t heapLivre = ESP.getFreeHeap();

  String json = "{";
  json += "\"status\":\"online\",";
  json += "\"projeto\":\"06-presente-gessy\",";
  json += "\"ip\":\"" + ipStr + "\",";
  json += "\"uptime\":" + String(uptimeSegundos) + ",";
  json += "\"heap_livre\":" + String(heapLivre) + ",";
  json += "\"wifi_rssi\":" + String(rssi) + ",";
  json += "\"surpresas_disparadas\":" + String(contadorSurpresas) + ",";
  json += "\"led\":" + String(ledEstado ? "true" : "false");
  json += "}";

  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Cache-Control", "no-cache");
  server.send(200, "application/json", json);
}

// GET /api/surpresa -> Polling da tela da Gessy para receber chuva de corações
void tratarApiSurpresa() {
  String json = "{\"contador\":" + String(contadorSurpresas) + "}";
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Cache-Control", "no-cache");
  server.send(200, "application/json", json);
}

// GET /api/visita?id=N -> A página chama quando a Gessy abre uma memória
void tratarApiVisita() {
  String id = server.arg("id");
  String titulo = server.arg("titulo");

  Serial.println();
  Serial.println("==========================================================");
  Serial.printf(" [💖 VISITA DA GESSY!] Ela acabou de abrir a memória #%s: \"%s\"\n",
                id.c_str(), titulo.c_str());
  Serial.println("==========================================================");

  // Pisca o LED embutido para alertar visualmente na bancada
  digitalWrite(PINO_LED, HIGH);
  tempoFimPulsoLed = millis() + 600;

  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.send(200, "application/json", "{\"status\":\"ok\"}");
}

// POST /api/recado -> Recebe mensagens enviadas pela Gessy diretamente na galeria
void tratarApiRecado() {
  String msg = "";
  if (server.hasArg("mensagem")) {
    msg = server.arg("mensagem");
  } else if (server.hasArg("plain")) {
    msg = server.arg("plain");
  }
  msg.trim();

  if (msg.length() > 0) {
    Serial.println();
    Serial.println("==========================================================");
    Serial.println("  [💌 RECADO DA GESSY RECEBIDO!]                          ");
    Serial.println("----------------------------------------------------------");
    Serial.printf("  \"%s\"\n", msg.c_str());
    Serial.println("==========================================================");

    // Salva o recado permanentemente no LittleFS
    File f = LittleFS.open("/recados.txt", "a");
    if (f) {
      f.printf("[%lu s] %s\n", millis() / 1000, msg.c_str());
      f.close();
    }

    // Batimento cardíaco no LED físico da bancada (tum-tum duplo)
    digitalWrite(PINO_LED, HIGH);
    delay(90);
    digitalWrite(PINO_LED, LOW);
    delay(90);
    digitalWrite(PINO_LED, HIGH);
    delay(140);
    digitalWrite(PINO_LED, LOW);
  }

  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Cache-Control", "no-cache");
  server.send(200, "application/json", "{\"status\":\"ok\",\"mensagem\":\"Recebido com muito amor pelo Israel! ❤️\"}");
}

// GET /api/recados -> Lista todos os recados salvos na placa
void tratarApiListarRecados() {
  String conteudo = "";
  if (LittleFS.exists("/recados.txt")) {
    File f = LittleFS.open("/recados.txt", "r");
    if (f) {
      conteudo = f.readString();
      f.close();
    }
  }
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Cache-Control", "no-cache");
  server.send(200, "text/plain; charset=utf-8", conteudo.length() > 0 ? conteudo : "Nenhum recado salvo ainda.");
}

// POST /api/led -> Permite alternar o LED manualmente
void tratarApiLed() {
  ledEstado = !ledEstado;
  digitalWrite(PINO_LED, ledEstado ? HIGH : LOW);
  String json = "{\"status\":\"ok\",\"led\":" + String(ledEstado ? "true" : "false") + "}";
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.send(200, "application/json", json);
}

// ------------------------------------------------------------
//  Leitura Interativa do Terminal Serial (Não-Bloqueante)
// ------------------------------------------------------------
String lerLinhaSerial() {
  while (Serial.available()) Serial.read();
  String s = "";
  unsigned long timeout = millis() + 45000;
  while (millis() < timeout) {
    if (Serial.available()) {
      char c = Serial.read();
      if (c == '\r') continue;
      if (c == '\n') {
        Serial.println();
        break;
      }
      Serial.print(c);
      s += c;
    }
    server.handleClient();
    delay(10);
  }
  s.trim();
  return s;
}

void menuSerialWiFi() {
  Serial.println();
  Serial.println("==========================================================");
  Serial.println("   MENU SERIAL DE CONFIGURAÇÃO WI-FI — PRESENTE GESSY     ");
  Serial.println("==========================================================");
  Serial.println("Escaneando redes 2.4 GHz disponíveis...");

  int n = WiFi.scanNetworks();
  if (n == 0) {
    Serial.println("Nenhuma rede Wi-Fi encontrada.");
  } else {
    Serial.printf("%d redes encontradas:\n", n);
    for (int i = 0; i < n && i < 12; ++i) {
      Serial.printf("  [%d] %-24s (%d dBm | %s)\n",
                    i + 1,
                    WiFi.SSID(i).c_str(),
                    WiFi.RSSI(i),
                    WiFi.encryptionType(i) == WIFI_AUTH_OPEN ? "Aberta" : "Segura");
    }
  }
  Serial.println("  [0] Digitar o nome (SSID) manualmente");
  Serial.println("==========================================================");
  Serial.print("Digite o número da rede desejada e aperte Enter: ");

  String optStr = lerLinhaSerial();
  int opt = optStr.toInt();
  String novoSSID = "";

  if (opt > 0 && opt <= n) {
    novoSSID = WiFi.SSID(opt - 1);
  } else {
    Serial.print("Digite o nome da rede (SSID): ");
    novoSSID = lerLinhaSerial();
  }

  Serial.printf("Digite a senha para '%s' e aperte Enter: ", novoSSID.c_str());
  String novaSenha = lerLinhaSerial();

  Serial.println("\nSalvando na memória Flash do ESP32 (NVS)...");
  prefs.putString("ssid", novoSSID);
  prefs.putString("pass", novaSenha);
  wifiSsid = novoSSID;
  wifiPass = novaSenha;

  Serial.printf("Conectando à rede '%s' ...\n", wifiSsid.c_str());
  WiFi.disconnect();
  WiFi.begin(wifiSsid.c_str(), wifiPass.c_str());

  unsigned long ini = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - ini < 15000) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("==========================================================");
    Serial.println(" ESP32 CONECTADO COM SUCESSO!");
    Serial.printf(" IP na rede local: http://%s\n", WiFi.localIP().toString().c_str());
    Serial.printf(" Cloudflare Tunnel: .\\tools\\cloudflared.exe tunnel --url http://%s\n",
                  WiFi.localIP().toString().c_str());
    Serial.println("==========================================================");
  } else {
    Serial.println("[AVISO] Falha ao conectar. Pressione 'm' para tentar novamente.");
  }
}

// ------------------------------------------------------------
//  Inicialização do Sistema de Arquivos LittleFS
// ------------------------------------------------------------
void iniciarLittleFS() {
  Serial.println("[FS] Montando partição LittleFS de 2,62 MB...");

  if (!LittleFS.begin(true)) {
    Serial.println("[FS] ERRO: Falha ao montar o LittleFS!");
    Serial.println("[FS] Certifique-se de executar: ..\\..\\pio.cmd run -t uploadfs");
    return;
  }

  Serial.println("[FS] LittleFS montado com sucesso!");
  Serial.printf("[FS] Espaço Total : %u KB (%.2f MB)\n",
                (unsigned int)(LittleFS.totalBytes() / 1024),
                (float)LittleFS.totalBytes() / (1024.0 * 1024.0));
  Serial.printf("[FS] Espaço Usado : %u KB (%.2f MB)\n",
                (unsigned int)(LittleFS.usedBytes() / 1024),
                (float)LittleFS.usedBytes() / (1024.0 * 1024.0));

  if (LittleFS.exists("/index.html")) {
    Serial.println("[FS] /index.html pronto para entrega.");
  } else {
    Serial.println("[FS] AVISO: /index.html não encontrado! Grave a pasta data com uploadfs.");
  }
}

// ------------------------------------------------------------
//  Conexão Wi-Fi (Modo Estação)
// ------------------------------------------------------------
void iniciarWiFi() {
  WiFi.mode(WIFI_STA);
  WiFi.setSleep(false);
  WiFi.setAutoReconnect(true);

  prefs.begin("gessy_cfg", false);
  wifiSsid = prefs.isKey("ssid") ? prefs.getString("ssid") : WIFI_SSID;
  wifiPass = prefs.isKey("pass") ? prefs.getString("pass") : WIFI_PASS;

  if (wifiSsid.length() > 0 && wifiSsid != "SEU_WIFI_2.4G") {
    Serial.printf("[WIFI] Conectando à rede '%s' ...\n", wifiSsid.c_str());
    WiFi.begin(wifiSsid.c_str(), wifiPass.c_str());

    unsigned long ini = millis();
    while (WiFi.status() != WL_CONNECTED && millis() - ini < 12000) {
      delay(500);
      Serial.print(".");
    }
    Serial.println();

    if (WiFi.status() == WL_CONNECTED) {
      Serial.println("[WIFI] Conectado com sucesso!");
      Serial.printf("[WIFI] IP Local: %s\n", WiFi.localIP().toString().c_str());
      Serial.printf("[WIFI] RSSI (Sinal): %d dBm\n", WiFi.RSSI());
    } else {
      Serial.println("[WIFI] Falha ao conectar. Pressione 'm' para abrir o menu de redes.");
    }
  } else {
    Serial.println("[WIFI] Nenhuma rede configurada. Pressione 'm' para configurar.");
  }

  // Inicializa mDNS para http://gessy.local
  if (MDNS.begin(MDNS_HOST)) {
    Serial.printf("[MDNS] Respondendo em: http://%s.local\n", MDNS_HOST);
    MDNS.addService("http", "tcp", 80);
  }
}

// ------------------------------------------------------------
//  Rotas do Servidor Web
// ------------------------------------------------------------
void iniciarServidorWeb() {
  server.on("/favicon.ico", HTTP_GET, []() {
    server.send(204, "image/x-icon", "");
  });
  server.on("/api/status", HTTP_GET, tratarApiStatus);
  server.on("/api/surpresa", HTTP_GET, tratarApiSurpresa);
  server.on("/api/visita", HTTP_GET, tratarApiVisita);
  server.on("/api/recado", HTTP_POST, tratarApiRecado);
  server.on("/api/recados", HTTP_GET, tratarApiListarRecados);
  server.on("/api/led", HTTP_POST, tratarApiLed);

  server.onNotFound(tratarRequisicaoWeb);
  server.begin();
  Serial.println("[WEB] Servidor HTTP iniciado na porta 80!");
}

// ------------------------------------------------------------
//  SETUP
// ------------------------------------------------------------
void setup() {
  Serial.begin(115200);
  delay(500);

  Serial.println();
  Serial.println("==========================================================");
  Serial.println("  PROJETO 06 — PRESENTE DA GESSY: GALERIA 3D & CLOUDFLARE ");
  Serial.println("==========================================================");

  // Configuração dos pinos físicos da DevKit v1 (sem hardware externo)
  pinMode(PINO_LED, OUTPUT);
  digitalWrite(PINO_LED, LOW);

  // O pino BOOT (GPIO 0) possui pull-up interno: fica HIGH solto e LOW apertado
  pinMode(PINO_BOOT, INPUT_PULLUP);

  iniciarLittleFS();
  iniciarWiFi();
  iniciarServidorWeb();

  Serial.println("----------------------------------------------------------");
  Serial.println(" [INSTRUÇÕES DE OPERAÇÃO]");
  Serial.println(" 1. Digite 'm' e Enter a qualquer momento para reconfigurar o Wi-Fi.");
  Serial.println(" 2. Aperte o botão BOOT na placa física para mandar uma");
  Serial.println("    chuva mágica de corações para a tela da Gessy!");
  if (WiFi.status() == WL_CONNECTED) {
    Serial.printf(" 3. Acesso Local : http://%s ou http://%s.local\n",
                  WiFi.localIP().toString().c_str(), MDNS_HOST);
    Serial.printf(" 4. Túnel Público: .\\tools\\cloudflared.exe tunnel --url http://%s\n",
                  WiFi.localIP().toString().c_str());
  }
  Serial.println("==========================================================");
}

// ------------------------------------------------------------
//  LOOP
// ------------------------------------------------------------
void loop() {
  server.handleClient();

  // Leitura com debounce do botão BOOT (GPIO 0)
  // LOW = botão pressionado pelo usuário na placa física
  bool estadoAtualBoot = (digitalRead(PINO_BOOT) == LOW);
  if (estadoAtualBoot && !botaoEstavaApertado && (millis() - ultimoApertoBoot > 350)) {
    ultimoApertoBoot = millis();
    contadorSurpresas++;

    Serial.println();
    Serial.printf("[💖 SURPRESA #%u] Botão BOOT acionado! Enviando chuva de corações para a Gessy...\n",
                  contadorSurpresas);

    // Feedback visual imediato no LED da placa
    digitalWrite(PINO_LED, HIGH);
    tempoFimPulsoLed = millis() + 400;
  }
  botaoEstavaApertado = estadoAtualBoot;

  // Desliga o LED após o pulso visual de confirmação
  if (tempoFimPulsoLed > 0 && millis() > tempoFimPulsoLed) {
    tempoFimPulsoLed = 0;
    digitalWrite(PINO_LED, ledEstado ? HIGH : LOW);
  }

  // Menu serial quando o usuário teclar 'm' ou 'M'
  if (Serial.available()) {
    char c = Serial.read();
    if (c == 'm' || c == 'M') {
      while (Serial.available()) Serial.read();
      menuSerialWiFi();
    }
  }

  // Watchdog de reconexão automática do Wi-Fi a cada 10 segundos
  static unsigned long ultimaVerificacaoWiFi = 0;
  if (millis() - ultimaVerificacaoWiFi >= 10000) {
    ultimaVerificacaoWiFi = millis();
    if (wifiSsid.length() > 0 && WiFi.status() != WL_CONNECTED) {
      Serial.println("[WIFI] Sinal desconectado. Tentando reconectar...");
      WiFi.disconnect();
      WiFi.begin(wifiSsid.c_str(), wifiPass.c_str());
    }
  }

  // Diagnóstico periódico no Monitor Serial
  if (millis() - ultimoStatusSerial >= INTERVALO_STATUS_MS) {
    ultimoStatusSerial = millis();
  }
}

