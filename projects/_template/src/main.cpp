/*
 * ============================================================
 *  <NOME DO PROJETO>
 * ============================================================
 *
 *  O QUE FAZ:
 *      (descreva em uma linha)
 *
 *  LIGAÇÃO:
 *      (quais pinos, o que está ligado neles)
 *
 *  COMO RODAR:
 *      ..\..\pio.cmd run -t upload -t monitor
 */

#include <Arduino.h>

const int PINO_LED = 2;   // LED azul embutido na DevKit v1

// Controle de tempo sem travar o chip (veja o projeto 02).
unsigned long ultimoTick = 0;
const unsigned long INTERVALO_MS = 1000;

// ------------------------------------------------------------
//  Roda UMA vez, ao ligar ou resetar a placa
// ------------------------------------------------------------
void setup() {
  Serial.begin(115200);
  delay(500);              // dá tempo do monitor serial conectar

  pinMode(PINO_LED, OUTPUT);

  Serial.println();
  Serial.println("=== <NOME DO PROJETO> ===");
}

// ------------------------------------------------------------
//  Roda para SEMPRE, depois do setup()
// ------------------------------------------------------------
void loop() {
  // Padrão millis(): faz algo periodicamente sem usar delay(),
  // deixando o loop livre para outras tarefas.
  if (millis() - ultimoTick >= INTERVALO_MS) {
    ultimoTick = millis();

    // ---- seu código periódico aqui ----
    Serial.printf("[%lu s] rodando\n", millis() / 1000);
  }

  // ---- seu código contínuo aqui (ler botões, sensores...) ----
}
