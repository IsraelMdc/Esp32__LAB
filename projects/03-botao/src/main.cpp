/*
 * ============================================================
 *  PROJETO 03 — BOTÃO (o mundo real entrando no chip)
 * ============================================================
 *
 *  Até agora o ESP32 só falava. Agora ele escuta.
 *
 *  O QUE ELE FAZ: a cada aperto do botão, o LED troca de estado
 *  (aceso <-> apagado) e o total de apertos aparece no serial.
 *  Ao mesmo tempo, um "heartbeat" imprime a cada 3 s para provar
 *  que o programa nunca trava esperando o botão.
 *
 *  LIGAÇÃO (não precisa de resistor, veja o README):
 *
 *      GPIO 4  ──────┐
 *                  [botão]
 *      GND ──────────┘
 *
 *  Sem botão em mãos? Encoste um fio do GPIO 4 no GND — o efeito
 *  é o mesmo (mas vai contar vários apertos, por causa do ruído).
 */

#include <Arduino.h>

const int PINO_BOTAO = 4;
const int PINO_LED   = 2;

// ------------------------------------------------------------
//  Estado do programa
// ------------------------------------------------------------
bool ledAceso = false;      // o LED está aceso agora?
int  totalApertos = 0;

// Qual era a leitura do botão na última passada do loop.
// Começa em HIGH porque, com INPUT_PULLUP, solto = HIGH.
int leituraAnterior = HIGH;

// --- Debounce ---
// Guarda quando a leitura mudou pela última vez.
unsigned long ultimaMudanca = 0;
const unsigned long DEBOUNCE_MS = 50;

// --- Heartbeat (prova que o loop nunca trava) ---
unsigned long ultimoHeartbeat = 0;
const unsigned long HEARTBEAT_MS = 3000;

void setup() {
  Serial.begin(115200);
  delay(500);

  pinMode(PINO_LED, OUTPUT);

  // INPUT_PULLUP é o detalhe importante. Ele liga um resistor que
  // já existe DENTRO do ESP32, puxando o pino para 3,3 V.
  // Resultado: solto = HIGH, apertado = LOW (o botão liga no GND).
  // Sem isso, o pino "flutua" e lê valores aleatórios.
  pinMode(PINO_BOTAO, INPUT_PULLUP);

  Serial.println();
  Serial.println("=== PROJETO 03 — BOTAO ===");
  Serial.println("Aperte o botao no GPIO 4 (ou encoste GPIO 4 no GND).");
}

void loop() {
  // ----------------------------------------------------------
  //  PARTE 1 — ler o botão, com debounce
  // ----------------------------------------------------------
  // digitalRead devolve HIGH (3,3 V) ou LOW (0 V).
  int leituraAgora = digitalRead(PINO_BOTAO);

  // Mudou em relação à última passada? Então (re)inicia o
  // cronômetro de estabilização. Um contato "sujo" oscila muito,
  // e cada oscilação cai aqui, reiniciando a contagem.
  if (leituraAgora != leituraAnterior) {
    ultimaMudanca = millis();
    leituraAnterior = leituraAgora;
  }

  // Só aceitamos a leitura depois que ela ficar estável por
  // DEBOUNCE_MS. Aí sim é um aperto de verdade, não ruído.
  static int estadoEstavel = HIGH;

  if ((millis() - ultimaMudanca) > DEBOUNCE_MS) {
    // A leitura estabilizou. Ela é diferente do estado que já
    // tínhamos aceitado como válido?
    if (leituraAgora != estadoEstavel) {
      estadoEstavel = leituraAgora;

      // Só agimos na BORDA DE DESCIDA: o instante em que o botão
      // passa de solto (HIGH) para apertado (LOW). Sem isso, o
      // LED trocaria de novo ao SOLTAR o botão.
      if (estadoEstavel == LOW) {
        totalApertos++;
        ledAceso = !ledAceso;                  // inverte: true<->false
        digitalWrite(PINO_LED, ledAceso ? HIGH : LOW);

        Serial.printf("Aperto #%d  ->  LED %s\n",
                      totalApertos,
                      ledAceso ? "ACESO" : "apagado");
      }
    }
  }

  // ----------------------------------------------------------
  //  PARTE 2 — heartbeat
  // ----------------------------------------------------------
  // Prova de que o loop continua girando livremente. Se aqui
  // houvesse delay(), o botão perderia apertos.
  if (millis() - ultimoHeartbeat >= HEARTBEAT_MS) {
    ultimoHeartbeat = millis();
    Serial.printf("   ...rodando ha %lu s (apertos: %d)\n",
                  millis() / 1000, totalApertos);
  }
}
