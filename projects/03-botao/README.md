# Projeto 03 — Botão

Até agora o ESP32 só falava. Agora ele escuta o mundo real — e o mundo real é
sujo, impreciso e cheio de ruído. Este projeto ensina os dois conceitos que
todo mundo erra na primeira vez: **pull-up** e **debounce**.

## Hardware: nenhum

Usamos o botão **BOOT** que já vem soldado na placa, ligado ao **GPIO 0**.

```
        ESP32 DevKit v1
        ┌───────────────────────┐
        │  ▓▓▓ ESP32-WROOM-32E  │
        └───────────────────────┘
           [EN]          [BOOT]
            ▲               ▲
       NÃO é este      é ESTE aqui
       (reinicia)      (GPIO 0)
```

Cuidado para não apertar o **EN** por engano: ele reinicia a placa e o
contador volta a zero.

> **Por que o botão BOOT existe?** Ele serve para forçar a placa a entrar em
> modo de gravação. Se o GPIO 0 estiver em LOW **no momento do reset**, o
> ESP32 sobe em modo bootloader em vez de rodar o seu programa. Lê-lo durante
> a execução normal, como fazemos aqui, é perfeitamente seguro.
>
> Consequência prática: se você segurar o BOOT e apertar o EN, a placa fica
> esperando um upload e o programa não roda. Solte tudo e aperte o EN sozinho
> para voltar ao normal.

## Como rodar

```powershell
..\..\pio.cmd run -t upload -t monitor
```

## O que você deve ver

```
=== PROJETO 03 — BOTAO ===
Aperte o botao BOOT da placa (nao o EN).
   ...rodando ha 3 s (apertos: 0)
Aperto #1  ->  LED ACESO
Aperto #2  ->  LED apagado
   ...rodando ha 6 s (apertos: 2)
```

Repare que o heartbeat continua imprimindo mesmo sem você apertar nada. Isso é
proposital: prova que o programa **nunca fica parado esperando** o botão.

## Os conceitos

### 1. Pull-up: por que um pino "solto" mente para você

Um pino configurado como `INPUT` e ligado a nada não fica em 0 V. Ele fica
**flutuando** — capta interferência do ambiente, da sua mão, da rede elétrica —
e `digitalRead()` devolve HIGH e LOW aleatoriamente. Esse pino é chamado de
*floating*.

A solução é um **resistor de pull-up**: um resistor ligando o pino ao 3,3 V.
Ele "puxa" o pino para HIGH quando nada mais está acontecendo.

O ESP32 já tem esses resistores embutidos. `INPUT_PULLUP` liga o de dentro do
chip — por isso você nunca precisa de um resistor externo para ler um botão:

```cpp
pinMode(PINO_BOTAO, INPUT_PULLUP);
```

> No caso específico do GPIO 0, a própria placa já traz um pull-up soldado,
> então essa linha é redundante aqui. Deixamos ela mesmo assim porque é
> exatamente o que você vai escrever em qualquer outro pino.

A consequência é que **a lógica fica invertida**, e isso confunde todo mundo:

| Botão | Circuito | Leitura |
|-------|----------|---------|
| solto | pull-up puxa para 3,3 V | `HIGH` |
| apertado | ligado direto ao GND, 0 V | `LOW` |

Ou seja: **`LOW` significa "apertado"**. Não é bug, é o padrão.

### 2. Debounce: um aperto vira dez

O contato de um botão é metal batendo em metal. Ele **quica**, como uma bola
no chão. Durante uns 5–50 ms depois do toque, a leitura oscila:

```
tensão
  HIGH ──┐ ┌┐ ┌─┐
         │ ││ │ │
  LOW    └─┘└─┘ └──────────────
         ↑              ↑
      você apertou   estabilizou
         │← ~20 ms →│
```

O ESP32 lê o pino milhares de vezes por segundo, então ele enxerga cada uma
dessas oscilações. Um aperto seu vira 5, 10, 20 apertos no contador.

A correção é o **debounce**: só aceite a leitura depois que ela ficar parada
por um tempo.

```cpp
if (leituraAgora != leituraAnterior) {
  ultimaMudanca = millis();      // oscilou? reinicia o cronômetro
  leituraAnterior = leituraAgora;
}

if ((millis() - ultimaMudanca) > DEBOUNCE_MS) {
  // ficou 50 ms sem mudar → agora é confiável
}
```

Cada quique reinicia a contagem. Só quando o sinal fica realmente parado por
50 ms é que o código age.

### 3. Borda, não nível

Ainda falta um detalhe. Se agíssemos toda vez que o botão *estivesse* em LOW,
o LED trocaria milhares de vezes enquanto você segura o botão apertado.

Queremos agir apenas no **instante da transição** de solto para apertado — a
chamada **borda de descida** (HIGH → LOW):

```cpp
if (leituraAgora != estadoEstavel) {   // houve transição?
  estadoEstavel = leituraAgora;
  if (estadoEstavel == LOW) {          // e foi para apertado?
    // age uma única vez
  }
}
```

| Abordagem | Efeito ao segurar o botão |
|-----------|---------------------------|
| por nível (`if (digitalRead(p) == LOW)`) | dispara milhares de vezes |
| por borda (este código) | dispara **uma** vez |

### 4. O padrão toggle

```cpp
ledAceso = !ledAceso;   // o "!" inverte: true vira false, false vira true
digitalWrite(PINO_LED, ledAceso ? HIGH : LOW);
```

Para inverter um estado, guarde-o numa variável `bool` e negue. Note que o
programa precisa **lembrar** do estado entre uma passada e outra do `loop()` —
por isso `ledAceso` é declarada fora das funções, como variável global.

## Experimentos

1. Comente a linha do debounce (troque `DEBOUNCE_MS` para `0`) e veja o
   contador pular vários números por aperto. É o problema acontecendo ao vivo.
2. Veja um pino **flutuando** ao vivo. Adicione no `setup()` um
   `pinMode(4, INPUT);` e no `loop()` um `Serial.println(digitalRead(4));`.
   O GPIO 4 não está ligado em nada, e você vai ver 0 e 1 alternando sozinhos.
   Encoste o dedo perto do pino e a bagunça aumenta.

   Depois troque para `pinMode(4, INPUT_PULLUP);` e veja a leitura travar em
   `1`, estável. É exatamente esse o trabalho do resistor de pull-up.

   > Fazer isso no próprio GPIO 0 não funcionaria: a placa tem um pull-up
   > soldado nele, então ele nunca flutua.
3. Adicione um `delay(2000)` no fim do `loop()` e tente apertar o botão. Você
   vai perder quase todos os apertos — a demonstração definitiva de por que
   `delay()` é ruim.
4. Faça um clique longo (segurar 1 s) apagar o LED e um clique curto acender.
   Dica: guarde o `millis()` de quando o botão desceu e compare quando subir.

---

← [02 — Serial](../02-serial/README.md) · [Índice](../../README.md) · Próximo: [04 — Wi-Fi Scan](../04-wifi-scan/README.md) →
