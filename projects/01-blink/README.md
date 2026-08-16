# Projeto 01 — Blink

O "Hello World" dos microcontroladores: piscar um LED.

Parece bobo, mas é o teste mais importante que existe. Se o LED pisca, você
provou que **a cadeia inteira funciona**: o código compilou, o cabo USB
transmite dados, a gravação na memória flash deu certo, e o chip está
executando o seu programa. Quando algo der errado em projetos futuros, você
volta aqui para saber se o problema é seu ou da placa.

## Como rodar

Com a placa conectada no USB, a partir **desta pasta**:

```powershell
# Compilar, gravar na placa e abrir o monitor serial de uma vez
..\..\pio.cmd run -t upload -t monitor
```

Para sair do monitor serial: `Ctrl + C`.

## O que você deve ver

O LED **azul** da placa piscando a cada 1 segundo, e no terminal:

```
Blink iniciado! O LED azul deve piscar.
LED aceso
LED apagado
LED aceso
...
```

> Existem dois LEDs na placa. O **vermelho** fica aceso direto e só indica que
> há energia — ele não é controlável. O que pisca é o **azul**, no GPIO 2.

## Os conceitos

### GPIO

**GPIO** = *General Purpose Input/Output*. É um pino que o seu programa
controla. Cada pino pode ser:

- **OUTPUT (saída)** — o ESP32 fornece tensão. Serve para acender um LED,
  acionar um relé, girar um motor.
- **INPUT (entrada)** — o ESP32 lê tensão. Serve para ler um botão ou sensor.

Você declara qual dos dois com `pinMode()` antes de usar o pino.

### Nível lógico: HIGH e LOW

Eletronicamente o ESP32 só sabe duas coisas:

| Estado | Tensão no pino | Significado |
|--------|----------------|-------------|
| `HIGH` | ~3,3 V         | ligado, 1, verdadeiro |
| `LOW`  | 0 V            | desligado, 0, falso   |

`digitalWrite(PINO_LED, HIGH)` literalmente coloca 3,3 V no pino 2, e essa
tensão acende o LED.

> ⚠️ O ESP32 trabalha com **3,3 V**, não 5 V como o Arduino Uno. Ligar 5 V
> direto num pino pode queimar o chip. É o erro nº 1 de quem vem do Arduino.

### setup() e loop()

Todo programa em Arduino tem exatamente estas duas funções:

```
    ligar a placa
          │
          ▼
    ┌───────────┐
    │  setup()  │   roda UMA vez — configuração inicial
    └─────┬─────┘
          │
          ▼
    ┌───────────┐
    │  loop()   │◄──┐  roda para SEMPRE
    └─────┬─────┘   │
          └─────────┘
```

Um microcontrolador não tem "fim de programa" como um app no PC. Ele liga,
configura, e então repete o `loop()` até alguém tirar da tomada.

### delay() — e por que ele é uma armadilha

`delay(1000)` congela o chip por 1 segundo. **Nada mais acontece** nesse
tempo: nenhum botão é lido, nenhuma rede é atendida. Para o Blink tudo bem,
mas em projetos reais isso trava tudo. O projeto **03-botao** mostra o
problema na prática, e você aprende `millis()` para resolver.

## Experimentos

Mexa no código e regrave — é assim que se aprende:

1. Mude `INTERVALO_MS` para `100`. O LED pisca 10x mais rápido.
2. Faça piscar em ritmo irregular: um `delay` de 100 e outro de 900.
3. Ligue um LED externo (com resistor de 220 Ω a 330 Ω em série!) em outro
   pino, como o GPIO 4, e mude `PINO_LED` para 4.

> Sempre use resistor em série com LED externo. Sem ele, o LED puxa corrente
> demais e queima — o LED, o pino do ESP32, ou os dois.

---

← [Voltar ao índice do laboratório](../../README.md) · Próximo: [02 — Serial](../02-serial/README.md) →
