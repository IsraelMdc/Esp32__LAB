/*
 * ============================================================
 *  PROJETO 05 — SERVIDOR WEB OFFLINE & CLOUDFLARE TUNNEL
 * ============================================================
 *
 *  O QUE FAZ:
 *      Hospeda o site completo (HTML, CSS, JavaScript e imagens)
 *      diretamente na memória Flash do ESP32 usando o LittleFS.
 *      O site pode ser acessado localmente pelo Wi-Fi ou exposto
 *      publicamente para a internet através do Cloudflare Tunnel.
 *
 *      Possui MENU INTERATIVO VIA TERMINAL SERIAL para escanear
 *      e conectar a redes Wi-Fi sem precisar regravar o código!
 *
 *  RECURSOS USADOS (SÓ A PLACA E O USB):
 *      - Rádio Wi-Fi (Modo Estação para o roteador e/ou Ponto de Acesso)
 *      - Memória Flash SPI (partição LittleFS de 1,92 MB)
 *      - Memória NVS (Preferences) para gravar Wi-Fi e senhas
 *      - LED embutido (GPIO 2)
 *      - Resolução de nomes mDNS (http://drthiago.local)
 * ============================================================
 */

#include <Arduino.h>
#include <WiFi.h>
#include <WebServer.h>
#include <ESPmDNS.h>
#include <DNSServer.h>
#include <LittleFS.h>
#include <Preferences.h>
#include "config.h"

// Servidor HTTP na porta padrão da web (porta 80)
WebServer server(80);

// Servidor DNS para capturar qualquer endereço no Ponto de Acesso e direcionar para o ESP32
DNSServer dnsServer;
const byte PORTA_DNS = 53;

// Armazenamento não-volátil (NVS) para salvar o Wi-Fi escolhido no menu
Preferences prefs;
String wifiSsid = "";
String wifiPass = "";

// Estado do LED embutido (LOW = apagado, HIGH = aceso)
bool ledEstado = false;

// Controle de tempo para tarefas periódicas sem travar o loop
unsigned long ultimoStatusMs = 0;
const unsigned long INTERVALO_STATUS_MS = 10000; // a cada 10s imprime diagnóstico

// ------------------------------------------------------------
//  Rotas da API REST (comunicação entre o site e o chip)
// ------------------------------------------------------------

// GET /api/status -> Retorna dados de telemetria do chip em formato JSON
void tratarApiStatus() {
  String ipStr = WiFi.status() == WL_CONNECTED ? WiFi.localIP().toString() : WiFi.softAPIP().toString();
  int rssi = WiFi.status() == WL_CONNECTED ? WiFi.RSSI() : 0;
  uint32_t uptimeSegundos = millis() / 1000;
  uint32_t heapLivre = ESP.getFreeHeap();

  String json = "{";
  json += "\"status\":\"online\",";
  json += "\"ip\":\"" + ipStr + "\",";
  json += "\"uptime\":" + String(uptimeSegundos) + ",";
  json += "\"heap_livre\":" + String(heapLivre) + ",";
  json += "\"wifi_rssi\":" + String(rssi) + ",";
  json += "\"led\":" + String(ledEstado ? "true" : "false");
  json += "}";

  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.send(200, "application/json", json);
}

// POST /api/led -> Alterna o estado do LED embutido no GPIO 2
void tratarApiLed() {
  ledEstado = !ledEstado;
  digitalWrite(PINO_LED, ledEstado ? HIGH : LOW);

  Serial.printf("[HARDWARE] LED do GPIO 2 alterado para: %s (pelo navegador)\n",
                ledEstado ? "ACESO" : "APAGADO");

  String json = "{";
  json += "\"status\":\"ok\",";
  json += "\"led\":" + String(ledEstado ? "true" : "false");
  json += "}";

  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.send(200, "application/json", json);
}

// Função para obter o MIME Type correto de cada arquivo
String obterMimeType(const String& path) {
  if (path.endsWith(".html") || path.endsWith(".htm")) return "text/html";
  if (path.endsWith(".css")) return "text/css";
  if (path.endsWith(".js")) return "application/javascript";
  if (path.endsWith(".png")) return "image/png";
  if (path.endsWith(".jpg") || path.endsWith(".jpeg")) return "image/jpeg";
  if (path.endsWith(".svg")) return "image/svg+xml";
  if (path.endsWith(".ico")) return "image/x-icon";
  if (path.endsWith(".json")) return "application/json";
  return "text/plain";
}

// Serve qualquer arquivo estático presente no LittleFS com headers corretos e cache
bool servirArquivoLittleFS(String path) {
  if (path.endsWith("/")) {
    path += "index.html";
  }

  if (LittleFS.exists(path)) {
    File file = LittleFS.open(path, "r");
    String mime = obterMimeType(path);
    // Habilitar cache de 1 dia no navegador para economizar CPU e banda do ESP32
    server.sendHeader("Cache-Control", "max-age=86400");
    server.streamFile(file, mime);
    file.close();
    return true;
  }
  return false;
}

// Manipulador genérico para páginas e arquivos
void tratarRequisicaoWeb() {
  String uri = server.uri();

  // 1. Tenta servir o arquivo requisitado (HTML, CSS, JS, Imagens)
  if (servirArquivoLittleFS(uri)) {
    return;
  }

  // 2. Se a rota não foi encontrada, tenta redirecionar para /index.html (Captive Portal)
  if (servirArquivoLittleFS("/index.html")) {
    return;
  }

  // 3. Fallback se nem o index.html existir
  server.send(404, "text/plain", "404 - Arquivo nao encontrado");
}

// ------------------------------------------------------------
//  Inicialização do Sistema de Arquivos LittleFS
// ------------------------------------------------------------
void iniciarLittleFS() {
  Serial.println("[FS] Montando o sistema de arquivos LittleFS...");

  if (!LittleFS.begin(true)) {
    Serial.println("[FS] ERRO: Falha crítica ao montar o LittleFS!");
    Serial.println("[FS] Certifique-se de executar: ..\\..\\pio.cmd run -t uploadfs");
    return;
  }

  Serial.println("[FS] LittleFS montado com sucesso!");
  Serial.printf("[FS] Espaço total: %u KB\n", (unsigned int)(LittleFS.totalBytes() / 1024));
  Serial.printf("[FS] Espaço usado: %u KB\n", (unsigned int)(LittleFS.usedBytes() / 1024));

  if (LittleFS.exists("/index.html")) {
    Serial.println("[FS] Arquivo /index.html encontrado.");
  } else {
    Serial.println("[FS] AVISO: /index.html não encontrado! Grave a pasta data/ com 'uploadfs'.");
  }
}

// ------------------------------------------------------------
//  Leitura interativa de texto pelo Monitor Serial
// ------------------------------------------------------------
String lerLinhaSerial() {
  while (Serial.available()) Serial.read(); // limpa caracteres residuais
  String s = "";
  unsigned long timeout = millis() + 45000; // 45 segundos de timeout
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

// ------------------------------------------------------------
//  MENU INTERATIVO WI-FI VIA TERMINAL SERIAL
// ------------------------------------------------------------
void menuSerialWiFi() {
  Serial.println();
  Serial.println("==========================================================");
  Serial.println("   MENU SERIAL DE CONFIGURAÇÃO WI-FI — ESP32 LAB         ");
  Serial.println("==========================================================");
  Serial.println("Escaneando redes 2.4 GHz disponíveis no ar...");

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
    Serial.printf(" IP na rede local: %s\n", WiFi.localIP().toString().c_str());
    Serial.printf(" Abra no navegador: http://%s\n", WiFi.localIP().toString().c_str());
    Serial.println("----------------------------------------------------------");
    Serial.printf(" Para ligar o Cloudflare Tunnel, rode no PowerShell:\n");
    Serial.printf(" .\\tools\\cloudflared.exe tunnel --url http://%s\n", WiFi.localIP().toString().c_str());
    Serial.println("==========================================================");
  } else {
    Serial.println("[AVISO] Falha ao conectar. Pressione 'm' e Enter para tentar de novo.");
  }
}

// ------------------------------------------------------------
//  Configuração das Redes Wi-Fi (Modo Estação + Ponto de Acesso)
// ------------------------------------------------------------
void iniciarWiFi() {
  WiFi.mode(WIFI_AP_STA);
  WiFi.setSleep(false);
  WiFi.setAutoReconnect(true);

  // Carregar credenciais salvas na memória Flash (NVS)
  prefs.begin("wifi_cfg", false);
  wifiSsid = prefs.getString("ssid", WIFI_SSID);
  wifiPass = prefs.getString("pass", WIFI_PASS);

  // 1. Conectar ao roteador se houver SSID configurado
  if (wifiSsid.length() > 0 && wifiSsid != "SEU_WIFI_AQUI") {
    Serial.printf("[WIFI] Conectando à rede: %s ...\n", wifiSsid.c_str());
    WiFi.begin(wifiSsid.c_str(), wifiPass.c_str());

    unsigned long inicioTentativa = millis();
    while (WiFi.status() != WL_CONNECTED && millis() - inicioTentativa < 12000) {
      delay(500);
      Serial.print(".");
    }
    Serial.println();

    if (WiFi.status() == WL_CONNECTED) {
      Serial.println("[WIFI] Conectado com sucesso!");
      Serial.printf("[WIFI] IP na rede local: %s\n", WiFi.localIP().toString().c_str());
      Serial.printf("[WIFI] Força do sinal (RSSI): %d dBm\n", WiFi.RSSI());
    } else {
      Serial.println("[WIFI] Falha ao conectar na rede configurada.");
      Serial.println("[WIFI] Pressione qualquer tecla e Enter no terminal para escanear e listar as redes do ar!");
    }
  } else {
    Serial.println("[WIFI] Nenhuma rede configurada.");
    Serial.println("[WIFI] Pressione qualquer tecla e Enter no terminal para escanear e listar as redes do ar!");
  }

  // 2. Iniciar Ponto de Acesso próprio como contingência
  IPAddress ipAP(192, 168, 4, 1);
  IPAddress gatewayAP(192, 168, 4, 1);
  IPAddress subnetAP(255, 255, 255, 0);
  WiFi.softAPConfig(ipAP, gatewayAP, subnetAP);
  WiFi.softAP(AP_SSID, String(AP_PASS).length() > 0 ? AP_PASS : NULL);
  Serial.printf("[WIFI] Ponto de Acesso ativo: '%s' -> http://%s\n",
                AP_SSID, WiFi.softAPIP().toString().c_str());

  // 3. Iniciar DNS Server e mDNS
  dnsServer.start(PORTA_DNS, "*", WiFi.softAPIP());
  if (MDNS.begin(MDNS_HOST)) {
    Serial.printf("[MDNS] Respondendo em: http://%s.local\n", MDNS_HOST);
    MDNS.addService("http", "tcp", 80);
  }
}

// ------------------------------------------------------------
//  Configuração do Servidor HTTP
// ------------------------------------------------------------
void iniciarServidorWeb() {
  server.on("/api/status", HTTP_GET, tratarApiStatus);
  server.on("/api/led", HTTP_POST, tratarApiLed);
  server.onNotFound(tratarRequisicaoWeb);
  server.begin();
  Serial.println("[WEB] Servidor HTTP iniciado com sucesso na porta 80!");
}

// ------------------------------------------------------------
//  SETUP: Executado uma única vez na inicialização
// ------------------------------------------------------------
void setup() {
  Serial.begin(115200);
  delay(500);

  Serial.println();
  Serial.println("==========================================================");
  Serial.println(" PROJETO 05 — SERVIDOR WEB OFFLINE & CLOUDFLARE TUNNEL    ");
  Serial.println("==========================================================");

  pinMode(PINO_LED, OUTPUT);
  digitalWrite(PINO_LED, LOW);

  iniciarLittleFS();
  iniciarWiFi();
  iniciarServidorWeb();

  Serial.println("----------------------------------------------------------");
  Serial.println(" [COMANDOS NO TERMINAL SERIAL]");
  Serial.println(" Digite 'm' e Enter a qualquer momento para abrir o MENU WI-FI.");
  if (WiFi.status() == WL_CONNECTED) {
    Serial.printf(" Acesse: http://%s  ou  http://%s.local\n",
                  WiFi.localIP().toString().c_str(), MDNS_HOST);
    Serial.printf(" Cloudflare: cloudflared tunnel --url http://%s\n", WiFi.localIP().toString().c_str());
  }
  Serial.println("==========================================================");
}

// ------------------------------------------------------------
//  LOOP: Executado continuamente
// ------------------------------------------------------------
void loop() {
  dnsServer.processNextRequest();
  server.handleClient();

  // Se o usuário digitar 'm' ou 'M' no terminal serial, abre o menu de redes!
  if (Serial.available()) {
    char c = Serial.read();
    if (c == 'm' || c == 'M') {
      while (Serial.available()) Serial.read(); // consome quebras de linha
      menuSerialWiFi();
    }
  }

  // Watchdog de reconexão
  static unsigned long ultimaVerificacaoWiFi = 0;
  if (millis() - ultimaVerificacaoWiFi >= 8000) {
    ultimaVerificacaoWiFi = millis();

    if (wifiSsid.length() > 0 && WiFi.status() != WL_CONNECTED) {
      Serial.println("[WIFI] Sinal desconectado. Tentando reconectar...");
      WiFi.disconnect();
      WiFi.begin(wifiSsid.c_str(), wifiPass.c_str());
    }
  }

  if (millis() - ultimoStatusMs >= INTERVALO_STATUS_MS) {
    ultimoStatusMs = millis();
  }
}
