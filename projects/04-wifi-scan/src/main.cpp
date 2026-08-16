/*
 * ============================================================
 *  PROJETO 04 — WI-FI SCAN
 * ============================================================
 *
 *  Aqui o ESP32 deixa de ser "um Arduino" e vira o que ele
 *  realmente é: um chip de rede. Wi-Fi e Bluetooth vêm dentro
 *  do módulo, sem nenhum componente extra.
 *
 *  O QUE ELE FAZ: procura todas as redes Wi-Fi ao redor e monta
 *  uma tabela com nome, potência do sinal, canal e segurança.
 *
 *  Este projeto NÃO precisa da sua senha de Wi-Fi — ele apenas
 *  escuta o que está no ar, como quem procura redes no celular.
 */

#include <Arduino.h>

// Biblioteca de Wi-Fi. Já vem com o framework Arduino do ESP32,
// não precisa instalar nada.
#include <WiFi.h>

const unsigned long INTERVALO_SCAN_MS = 15000;  // 15 s entre buscas
unsigned long ultimoScan = 0;
int numeroDoScan = 0;

// ------------------------------------------------------------
//  Traduz o código de criptografia para algo legível
// ------------------------------------------------------------
const char* tipoDeSeguranca(wifi_auth_mode_t tipo) {
  switch (tipo) {
    case WIFI_AUTH_OPEN:            return "ABERTA (!)";
    case WIFI_AUTH_WEP:             return "WEP (fraca)";
    case WIFI_AUTH_WPA_PSK:         return "WPA";
    case WIFI_AUTH_WPA2_PSK:        return "WPA2";
    case WIFI_AUTH_WPA_WPA2_PSK:    return "WPA/WPA2";
    case WIFI_AUTH_WPA3_PSK:        return "WPA3";
    case WIFI_AUTH_WPA2_WPA3_PSK:   return "WPA2/WPA3";
    default:                        return "desconhecida";
  }
}

// ------------------------------------------------------------
//  Converte o RSSI (dBm) numa avaliação em palavras
// ------------------------------------------------------------
const char* qualidadeDoSinal(int rssi) {
  if (rssi >= -55) return "otimo";
  if (rssi >= -67) return "bom";
  if (rssi >= -78) return "fraco";
  return "muito fraco";
}

void fazerScan() {
  numeroDoScan++;
  Serial.printf("\n[Scan #%d] Procurando redes...\n", numeroDoScan);

  // WiFi.scanNetworks() bloqueia por 2-3 s e devolve quantas
  // redes achou. Um número negativo indica erro.
  int totalRedes = WiFi.scanNetworks();

  if (totalRedes <= 0) {
    Serial.println("Nenhuma rede encontrada.");
    return;
  }

  Serial.printf("%d redes encontradas:\n\n", totalRedes);
  Serial.println("  # | SSID                             | RSSI | Qualid.    | Ch | Seguranca");
  Serial.println("----+----------------------------------+------+------------+----+------------");

  for (int i = 0; i < totalRedes; i++) {
    // O ESP32 já devolve a lista ordenada da mais forte para a
    // mais fraca, então o índice 0 é a melhor rede.
    String nome = WiFi.SSID(i);
    if (nome.length() == 0) nome = "<rede oculta>";

    Serial.printf("%3d | %-32s | %4d | %-10s | %2d | %s\n",
                  i + 1,
                  nome.c_str(),               // %s precisa de char*, não String
                  WiFi.RSSI(i),               // potência em dBm
                  qualidadeDoSinal(WiFi.RSSI(i)),
                  WiFi.channel(i),            // canal (1-13 em 2,4 GHz)
                  tipoDeSeguranca(WiFi.encryptionType(i)));
  }

  // Libera a memória usada pela lista do scan. Sem isso, a RAM
  // vai sendo consumida a cada busca.
  WiFi.scanDelete();

  Serial.printf("\nRAM livre: %u bytes\n", ESP.getFreeHeap());
}

void setup() {
  Serial.begin(115200);
  delay(500);

  Serial.println();
  Serial.println("=== PROJETO 04 — WI-FI SCAN ===");

  // WIFI_STA = modo "station": o ESP32 se comporta como um
  // cliente que procura redes, igual ao seu celular.
  // O outro modo seria WIFI_AP, em que ele CRIA uma rede.
  WiFi.mode(WIFI_STA);

  // Garante que não estamos conectados a nada antes de escanear.
  WiFi.disconnect();
  delay(100);

  // O endereço MAC é o "RG" da placa de rede: único no mundo.
  Serial.print("MAC desta placa: ");
  Serial.println(WiFi.macAddress());

  fazerScan();
  ultimoScan = millis();
}

void loop() {
  if (millis() - ultimoScan >= INTERVALO_SCAN_MS) {
    ultimoScan = millis();
    fazerScan();
  }
}
