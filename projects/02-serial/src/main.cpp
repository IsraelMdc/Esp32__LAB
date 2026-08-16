/*
 * ============================================================
 *  PROJETO 02 — SERIAL (conversando com o PC)
 * ============================================================
 *
 *  O ESP32 não tem tela nem teclado. A porta serial é a sua
 *  janela para dentro do chip: é como você imprime valores,
 *  descobre por que algo não funciona e manda comandos.
 *
 *  Dominar isto é o que separa "chutar" de "depurar".
 *
 *  O QUE ELE FAZ: imprime informações do chip, mostra um contador
 *  a cada segundo e responde a comandos que você digita.
 *
 *  COMANDOS: digite no monitor e aperte Enter
 *      on     -> acende o LED
 *      off    -> apaga o LED
 *      info   -> mostra dados do chip
 *      help   -> lista os comandos
 */

#include <Arduino.h>

const int PINO_LED = 2;

// Guarda o instante da última impressão do contador.
// unsigned long porque millis() cresce muito (até ~49 dias).
unsigned long ultimoPrint = 0;
const unsigned long INTERVALO_MS = 1000;
int contador = 0;

// ------------------------------------------------------------
//  Função auxiliar: imprime dados do próprio chip
// ------------------------------------------------------------
void mostrarInfo() {
  Serial.println();
  Serial.println("--- INFORMACOES DO CHIP ---");

  // Frequência do processador em MHz (normalmente 240).
  Serial.printf("CPU            : %d MHz\n", getCpuFrequencyMhz());

  // Memória RAM livre, em bytes. Útil para detectar vazamento
  // de memória: se este número só cai, seu código tem um problema.
  Serial.printf("RAM livre      : %u bytes\n", ESP.getFreeHeap());

  // Tamanho da memória flash (onde o programa fica gravado).
  Serial.printf("Flash          : %u bytes\n", ESP.getFlashChipSize());

  // Há quanto tempo a placa está ligada.
  Serial.printf("Tempo ligado   : %lu segundos\n", millis() / 1000);
  Serial.println("---------------------------");
  Serial.println();
}

void setup() {
  Serial.begin(115200);
  pinMode(PINO_LED, OUTPUT);

  // Pequena pausa: dá tempo do monitor serial conectar antes das
  // primeiras mensagens, senão você perde as linhas iniciais.
  delay(500);

  Serial.println();
  Serial.println("=== PROJETO 02 — SERIAL ===");
  Serial.println("Digite 'help' e aperte Enter.");
  mostrarInfo();
}

void loop() {
  // ----------------------------------------------------------
  //  PARTE 1 — LER o que você digitou
  // ----------------------------------------------------------
  // Serial.available() diz quantos caracteres chegaram do PC.
  // Se for maior que zero, tem coisa esperando para ser lida.
  if (Serial.available() > 0) {
    // Lê até o Enter (caractere '\n').
    String comando = Serial.readStringUntil('\n');

    // Remove espaços e quebras de linha das pontas. Sem isso,
    // "on\r" nunca seria igual a "on" e nada funcionaria.
    comando.trim();

    Serial.println("> " + comando);

    if (comando == "on") {
      digitalWrite(PINO_LED, HIGH);
      Serial.println("LED aceso.");
    } else if (comando == "off") {
      digitalWrite(PINO_LED, LOW);
      Serial.println("LED apagado.");
    } else if (comando == "info") {
      mostrarInfo();
    } else if (comando == "help") {
      Serial.println("Comandos: on | off | info | help");
    } else if (comando.length() > 0) {
      Serial.println("Comando desconhecido. Digite 'help'.");
    }
  }

  // ----------------------------------------------------------
  //  PARTE 2 — IMPRIMIR um contador, SEM travar o chip
  // ----------------------------------------------------------
  // Repare: nenhum delay() aqui. Em vez de congelar tudo por 1
  // segundo, perguntamos "já passou 1 segundo?" e seguimos.
  //
  // millis() = quantos milissegundos desde que a placa ligou.
  unsigned long agora = millis();

  if (agora - ultimoPrint >= INTERVALO_MS) {
    ultimoPrint = agora;  // marca o novo ponto de partida
    contador++;
    Serial.printf("[%lu s] contador = %d\n", agora / 1000, contador);
  }

  // Como não há delay(), este loop roda milhares de vezes por
  // segundo — e por isso os comandos respondem instantaneamente.
}
