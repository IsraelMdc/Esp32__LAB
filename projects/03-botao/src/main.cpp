/*
 * ============================================================
 *  PROJETO 03 — BOTÃO (o mundo real entrando no chip)
 * ============================================================
 *
 *  Até agora o ESP32 só falava. Agora ele escuta.
 *
 *  NÃO PRECISA DE NENHUM COMPONENTE. Usamos o botão BOOT que já
 *  vem soldado na placa, ligado ao GPIO 0.
 *
 *  O QUE ELE FAZ: a cada aperto do BOOT, o LED troca de estado
 *  (aceso <-> apagado) e o total de apertos aparece no serial.
 *  Um "heartbeat" imprime a cada 3 s para provar que o programa
 *  nunca trava esperando o botão.
 *
 *      [EN]  <- este NÃO, reinicia a placa
 *      [BOOT] <- este aqui
 */

#include <Arduino.h>

// O botão BOOT da DevKit v1 está ligado ao GPIO 0. A própria
// placa já tem um resistor de pull-up nele, e o botão o conecta
// ao GND quando apertado.
const int PINO_BOTAO = 0;

// LED azul embutido.
const int PINO_LED = 2;

// ------------------------------------------------------------
//  Estado do programa
// ------------------------------------------------------------
bool ledAceso = false;      // o LED está aceso agora?
int  totalApertos = 0;

// Qual era a leitura do botão na última passada do loop.
// Começa em HIGH porque, com pull-up, solto = HIGH.
int leituraAnterior = HIGH;

// --- Debounce ---
unsigned long ultimaMudanca = 0;
const unsigned long DEBOUNCE_MS = 50;

// --- Heartbeat (prova que o loop nunca trava) ---
unsigned long ultimoHeartbeat = 0;
const unsigned long HEARTBEAT_MS = 3000;

void setup() {
  Serial.begin(115200);
  delay(500);

  pinMode(PINO_LED, OUTPUT);

  // INPUT_PULLUP liga um resistor que existe DENTRO do ESP32,
  // puxando o pino para 3,3 V. No GPIO 0 a placa já tem um
  // pull-up externo, então aqui é redundante — mas deixamos
  // explícito porque é o que você vai usar em qualquer outro pino.
  // Resultado: solto = HIGH, apertado = LOW.
  pinMode(PINO_BOTAO, INPUT_PULLUP);

  Serial.println();
  Serial.println("=== PROJETO 03 — BOTAO ===");
  Serial.println("Aperte o botao BOOT da placa (nao o EN).");
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
