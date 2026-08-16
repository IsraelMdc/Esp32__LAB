/*
 * ============================================================
 *  PROJETO 01 — BLINK (pisca-pisca)
 * ============================================================
 *
 *  O "Hello World" do mundo dos microcontroladores. Se este
 *  programa rodar, significa que TODA a cadeia funciona:
 *  compilador -> cabo USB -> gravação na flash -> chip executando.
 *
 *  O QUE ELE FAZ: acende e apaga o LED azul da placa, 1x por segundo.
 *
 *  Leia o README.md desta pasta para entender a teoria.
 */

// Traz as funções do Arduino (pinMode, digitalWrite, delay...).
// No Arduino IDE isso é automático; no PlatformIO é explícito.
#include <Arduino.h>

// ------------------------------------------------------------
//  CONFIGURAÇÃO
// ------------------------------------------------------------
// No ESP32 DevKit v1 o LED azul embutido está ligado ao GPIO 2.
// "GPIO" = General Purpose Input/Output = um pino que o programa
// controla. Usamos const para deixar claro que nunca muda.
const int PINO_LED = 2;

// Quanto tempo o LED fica em cada estado, em milissegundos.
// 1000 ms = 1 segundo.
const int INTERVALO_MS = 1000;

// ------------------------------------------------------------
//  setup() — roda UMA VEZ, quando a placa liga ou é resetada
// ------------------------------------------------------------
void setup() {
  // Abre a comunicação serial com o PC pelo mesmo cabo USB que
  // alimenta a placa. 115200 é a velocidade; precisa ser igual ao
  // monitor_speed do platformio.ini.
  Serial.begin(115200);

  // Configura o pino como SAÍDA (OUTPUT), ou seja, o ESP32 vai
  // *fornecer* tensão nele. O oposto seria INPUT, para ler um
  // sensor ou botão. Todo pino precisa ser configurado antes do uso.
  pinMode(PINO_LED, OUTPUT);

  Serial.println("Blink iniciado! O LED azul deve piscar.");
}

// ------------------------------------------------------------
//  loop() — roda INFINITAMENTE, para sempre, após o setup()
// ------------------------------------------------------------
// Microcontrolador não tem "fim de programa". Quando o loop()
// termina, ele é chamado de novo, milhões de vezes por segundo.
void loop() {
  // HIGH = manda ~3,3 V no pino = LED acende.
  digitalWrite(PINO_LED, HIGH);
  Serial.println("LED aceso");

  // Pausa a execução. Durante o delay o chip não faz mais nada —
  // por isso, mais pra frente, aprenderemos a evitá-lo.
  delay(INTERVALO_MS);

  // LOW = manda 0 V no pino = LED apaga.
  digitalWrite(PINO_LED, LOW);
  Serial.println("LED apagado");

  delay(INTERVALO_MS);

  // Aqui o loop() acaba... e recomeça do zero automaticamente.
}
