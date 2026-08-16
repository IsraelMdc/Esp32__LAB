# Fundamentos — do zero

Leitura de uns 15 minutos, para quem nunca mexeu com microcontrolador. Não
precisa decorar nada: volte aqui quando os projetos citarem um conceito.

---

## 1. O que é um microcontrolador

Um computador comum (o seu notebook) tem processador, memória RAM, HD e placa
de rede como peças **separadas**, e roda um sistema operacional que gerencia
tudo isso.

Um **microcontrolador** coloca processador, memória e portas de entrada/saída
num **único chip**, e roda **um programa só** — o seu — direto no metal.

|  | Notebook | Microcontrolador |
|---|---|---|
| Sistema operacional | Windows, Linux | nenhum (só o seu código) |
| Ligar | leva ~30 s | pronto em ~0,3 s |
| Memória RAM | 8–32 **GB** | 320 **KB** (~50 mil vezes menos) |
| Consome | 20–90 W | 0,05–0,5 W |
| Programas ao mesmo tempo | centenas | um |
| Custa | R$ 3.000+ | R$ 25 |
| Serve para | tudo | **uma** tarefa, para sempre |

A troca é essa: você perde conforto e ganha **controle direto sobre pinos
elétricos**, consumo baixíssimo e inicialização instantânea. É o que está
dentro do seu micro-ondas, do controle remoto e da fechadura eletrônica.

---

## 2. O que é o ESP32

O ESP32 é um microcontrolador da fabricante chinesa Espressif que ficou famoso
por um motivo: **Wi-Fi e Bluetooth vêm dentro do chip**, sem custo extra.

No seu ESP32 (valores confirmados lendo o próprio chip, veja
[Qual é exatamente o seu chip](#qual-é-exatamente-o-seu-chip)):

| Recurso | Valor | Para comparar |
|---------|-------|---------------|
| Processador | 2 núcleos a 240 MHz | Arduino Uno: 1 núcleo, 16 MHz |
| RAM utilizável | 320 KB | Arduino Uno: 2 KB |
| Flash (onde o programa mora) | 4 MB | Arduino Uno: 32 KB |
| Wi-Fi | 802.11 b/g/n, 2,4 GHz | Uno: não tem |
| Bluetooth | Clássico + BLE | Uno: não tem |
| Pinos de I/O | ~25 utilizáveis | Uno: 20 |
| Conversor analógico | 12 bits (0–4095) | Uno: 10 bits (0–1023) |
| Tensão de trabalho | **3,3 V** | Uno: 5 V |

Ele é, em resumo, dezenas de vezes mais poderoso que um Arduino Uno e custa
menos.

> **Por que você vai ver "520 KB" na internet?** O ESP32 tem 520 KB de SRAM no
> total, mas parte dela é reservada para instruções e para o próprio sistema.
> O que sobra para as suas variáveis são os 320 KB — que é exatamente o número
> que aparece ao fim de cada compilação (`from 327680 bytes`). Os dois valores
> estão certos; um é o total do datasheet, o outro é o que você pode usar.

### A placa vs o módulo vs o chip

Cuidado com os nomes, porque eles se misturam — são três coisas encaixadas uma
dentro da outra:

- **ESP32-D0WD-V3** — o **chip** processador em si, do tamanho de uma unha.
- **ESP-WROOM-32** — o **módulo**: o chip + antena + memória flash de 4 MB,
  tudo dentro daquela latinha metálica prateada. O nome vem impresso nela.
- **ESP32 DevKit v1** — a **placa** que você tem na mão: o módulo + conversor
  USB-Serial + regulador de tensão + botões + pinos. É o que permite ligar no
  USB e programar.

### Qual é exatamente o seu chip

Você não precisa adivinhar: o chip se identifica quando perguntado. Com a
placa conectada, rode da raiz do laboratório:

```powershell
.\.venv\Scripts\python.exe .pio-core\packages\tool-esptoolpy\esptool.py --port COM4 flash_id
```

Nesta placa a resposta foi:

```
Chip is ESP32-D0WD-V3 (revision v3.1)
Features: WiFi, BT, Dual Core, 240MHz, VRef calibration in efuse
Crystal is 40MHz
Detected flash size: 4MB
```

Decifrando o código **D0WD**: `D` = *dual core*, `0` = **sem** flash dentro do
encapsulamento do chip (ela é o CI separado ao lado, de 4 MB), `WD` = *Wi-Fi +
Dual-mode Bluetooth*.

O sufixo **V3** é a geração do silício, e é a melhor notícia: é a terceira
revisão, com várias erratas do ESP32 original corrigidas. Placas mais antigas
trazem V1, que tem limitações conhecidas em *deep sleep* e no conversor
analógico.

### Como identificar o seu módulo: três fontes

Há três jeitos de saber o que você tem em mãos, e vale conhecer os três porque
eles respondem perguntas diferentes:

| Fonte | Onde ver | O que ela prova |
|-------|----------|-----------------|
| Serigrafia | impressa na lata metálica | a **família** do módulo |
| FCC ID | impresso na lata, abaixo do nome | o **fabricante** e o modelo certificado |
| `esptool.py` | perguntando ao chip | a **geração exata** do silício |

Nesta placa as três dizem:

```
Lata     : ESP-WROOM-32
FCC ID   : 2AC7Z-ESP32WROOM32
esptool  : ESP32-D0WD-V3 (revision v3.1)
```

O **FCC ID** é o dado mais confiável dos três. Ele tem duas partes: `2AC7Z` é o
código de outorgado, atribuído pela FCC à **Espressif**, e `ESP32WROOM32` é o
produto certificado. Você pode conferir qualquer FCC ID em
[fcc.gov](https://www.fcc.gov/oet/ea/fccid) ou em fccid.io.

Isso importa na prática: **é a prova de que o módulo é Espressif genuíno**, e
não um clone. O mercado tem muitos módulos parecidos com marcação copiada, mas
eles raramente carregam um FCC ID válido — certificação custa caro. Módulo
genuíno significa antena projetada corretamente e alcance de Wi-Fi de verdade.

### A lata diz uma coisa, o chip diz outra — e os dois estão certos

Repare que a lata diz **`ESP-WROOM-32`** e o chip se identifica como
**`ESP32-D0WD-V3`**. Isso parece contradição e não é.

`ESP-WROOM-32` é a marcação **original** da Espressif, de 2016 (repare que não
tem "32" depois de "ESP"). Ela pegou tão bem que virou praticamente sinônimo de
"módulo ESP32", e continuou sendo estampada em módulos por anos — enquanto o
silício lá dentro era atualizado silenciosamente:

| Geração do chip | Quando | Marcação típica da lata |
|-----------------|--------|-------------------------|
| ESP32-D0WDQ6 | 2016 | `ESP-WROOM-32` |
| ESP32-D0WD | intermediário | `ESP-WROOM-32` ou `ESP32-WROOM-32D` |
| **ESP32-D0WD-V3** | atual — **este aqui** | `ESP-WROOM-32` ou `ESP32-WROOM-32E` |

Ou seja: a lata identifica a **família do módulo**, e o `esptool` identifica a
**geração exata do silício**. Um módulo carimbado `ESP-WROOM-32` com um chip V3
dentro é comum e perfeitamente normal — significa que você tem a marcação
clássica com o silício novo, que é o melhor dos dois mundos.

Para tudo o que fazemos neste laboratório as gerações se comportam igual: mesmo
pinout, mesma flash, mesmo código. A diferença aparece só em detalhes finos de
consumo e de erratas corrigidas.

> **Moral da história:** para saber o que você realmente tem, pergunte ao chip,
> não à lata. A serigrafia diz de que família é; só o `esptool` diz a revisão.

Sem a placa de desenvolvimento, o módulo sozinho exigiria soldar fios e montar
uma fonte de alimentação.

### O que tem na sua placa

```
              ┌──── antena (a serpentina impressa)
              │
        ┌─────┴──────────────────┐
   ┌────┤ ▓▓▓   ESP-WROOM-32     ├────┐
   │    │ ▓▓▓  (latinha metálica)│    │
 pinos  └────────────────────────┘  pinos
   │      [EN]            [BOOT]      │
   │       ▲                ▲         │
   │    reset          modo gravação  │
   │         ┌──────────┐             │
   └─────────┤   USB    ├─────────────┘
             └──────────┘
```

- **USB** — alimenta a placa **e** transmite os dados. Um cabo só faz tudo.
- **Botão EN (ou RST)** — reinicia. Igual a desligar e ligar.
- **Botão BOOT** — força o modo de gravação. Você quase nunca precisa dele: a
  placa entra nesse modo sozinha. Só serve para socorro (veja o
  [troubleshooting](troubleshooting.md)).
- **LED de energia** — fica aceso direto, sem piscar. Indica apenas que há
  alimentação e não é controlável por software.
- **LED do GPIO 2** — controlável pelo seu código. É o que pisca no projeto 01.

> A **cor** desses LEDs varia conforme o fabricante da placa: o do GPIO 2 pode
> ser azul, vermelho ou verde. Não use a cor para identificá-los — use o
> comportamento. O que fica aceso direto é o de energia; o que pisca quando
> você roda o blink é o do GPIO 2.

> ⚠️ **Use um cabo USB de dados.** Muitos cabos de carregador de celular têm
> só os fios de energia. A placa acende, mas o PC nunca a enxerga. É a causa
> nº 1 de "meu ESP32 não aparece".

---

## 3. Os pinos (GPIO)

**GPIO** = *General Purpose Input/Output*. Cada pino é um contato elétrico que
o seu programa controla, e pode funcionar como:

- **Saída (OUTPUT)** — o ESP32 fornece tensão: acende LED, aciona relé.
- **Entrada (INPUT)** — o ESP32 lê tensão: botão, sensor.

Você escolhe com `pinMode(pino, OUTPUT)` ou `pinMode(pino, INPUT)`.

E só existem dois estados:

| Estado | Tensão | Também chamado de |
|--------|--------|-------------------|
| `HIGH` | 3,3 V | 1, ligado, verdadeiro |
| `LOW`  | 0 V   | 0, desligado, falso |

### 🔴 A regra que salva a placa: 3,3 V, nunca 5 V

O ESP32 trabalha em **3,3 V**. Ligar 5 V direto em um pino GPIO **queima o
chip** — e não tem conserto.

Isso pega muita gente que vem do Arduino Uno, que é 5 V. Sensores vendidos
"para Arduino" frequentemente são 5 V. Antes de ligar qualquer coisa nova,
confirme a tensão dela.

> O pino marcado **VIN** é a exceção: ele aceita 5 V porque passa pelo
> regulador de tensão da placa. Mas os **GPIO** não.

### Nem todo pino serve para tudo

Esta tabela evita horas de frustração:

| Pinos | Situação | Use? |
|-------|----------|------|
| 4, 5, 13, 14, 16, 17, 18, 19, 21, 22, 23, 25, 26, 27, 32, 33 | livres, sem efeitos colaterais | ✅ **prefira estes** |
| 2 | LED interno da placa | ✅ ok (é o do blink) |
| 34, 35, 36, 39 | **só entrada**, sem pull-up interno | ⚠️ só para sensores |
| 0, 12, 15 | *strapping*: definem como a placa liga | ⚠️ evite |
| 6, 7, 8, 9, 10, 11 | ligados à memória flash interna | 🚫 **nunca** |
| 1, 3 | são o TX/RX do USB serial | 🚫 quebram o monitor |

Dois erros clássicos que essa tabela previne:

- **Usar 34–39 como saída.** Eles são fisicamente incapazes disso. O código
  compila, roda, e simplesmente não faz nada — sem nenhuma mensagem de erro.
- **Usar 6–11.** A placa para de dar boot. Parece que você a queimou.

> Quer usar um botão nos pinos 34–39? Vai precisar de um resistor de pull-up
> **externo**, porque esses pinos não têm o interno. Nos outros, o
> `INPUT_PULLUP` resolve (veja o [projeto 03](../projects/03-botao/README.md)).

---

## 4. Como o seu código chega na placa

```
   você escreve            o PC traduz              o PC envia
   main.cpp        ──►     firmware.bin      ──►    pela USB
   (C++ legível)           (binário do ESP32)            │
                                                         ▼
                                              grava na FLASH da placa
                                                         │
                                                         ▼
                                              a placa reinicia e RODA
```

Três etapas, três comandos:

| Etapa | Comando | O que acontece |
|-------|---------|----------------|
| **Compilar** | `pio.cmd run` | Traduz seu C++ para instruções do ESP32. Erros de sintaxe aparecem aqui. Não toca na placa. |
| **Gravar** | `pio.cmd run -t upload` | Manda o binário pela USB para a flash. |
| **Monitorar** | `pio.cmd run -t monitor` | Abre a janela que mostra o que a placa está imprimindo. |

Na prática você usa o combo `-t upload -t monitor`, que faz os três.

O programa fica gravado na **flash** de forma permanente: desligue da tomada,
ligue em um carregador de celular amanhã, e ele roda de novo sozinho. Só é
apagado quando você grava outro por cima.

### Flash e RAM

Ao final de cada compilação aparece isto:

```
RAM:   [=         ]   6.6% (used 21464 bytes from 327680 bytes)
Flash: [==        ]  20.5% (used 269193 bytes from 1310720 bytes)
```

- **Flash** — onde o **programa** mora. Permanente. Se passar de 100%, o
  programa não cabe: remova funcionalidades ou mude o esquema de partições.
- **RAM** — onde as **variáveis** vivem enquanto roda. Apagada ao desligar. Se
  acabar durante a execução, a placa reinicia sozinha, em loop.

> Só o "esqueleto" do Wi-Fi já ocupa uns 20% da flash — por isso o blink, que
> não usa quase nada, já aparece com 20,5%. É normal.

---

## 5. setup() e loop()

Todo programa Arduino tem exatamente estas duas funções:

```cpp
void setup() {
  // roda UMA vez, ao ligar ou resetar
}

void loop() {
  // roda para SEMPRE, milhares de vezes por segundo
}
```

```
    ligar / resetar
          │
          ▼
    ┌───────────┐
    │  setup()  │   configura pinos, abre serial, conecta Wi-Fi
    └─────┬─────┘
          │
          ▼
    ┌───────────┐
    │  loop()   │◄──┐   lê sensores, decide, age
    └─────┬─────┘   │
          └─────────┘
```

Não existe "fim de programa". Quando o `loop()` termina, ele é chamado de
novo, para sempre.

### O erro que todo iniciante comete: delay()

`delay(1000)` **congela o chip inteiro** por 1 segundo. Nesse tempo nenhum
botão é lido, nenhuma rede é atendida, nada acontece.

Funciona no blink, mas quebra tudo em projetos reais. A alternativa é
`millis()`, que pergunta "já passou o tempo?" em vez de parar e esperar:

```cpp
if (millis() - ultimoTick >= 1000) {
  ultimoTick = millis();
  // faz a tarefa periódica — e o loop continua livre
}
```

Este é o conceito mais importante de todo o laboratório. Ele é ensinado em
detalhe no [projeto 02](../projects/02-serial/README.md) e usado dali em
diante.

---

## 6. A porta serial

O ESP32 não tem tela. A **porta serial** é a sua única janela para dentro do
chip: é onde você imprime valores e descobre por que algo não funciona.

```cpp
Serial.begin(115200);              // no setup(), abre a comunicação
Serial.println("cheguei aqui");    // imprime texto
Serial.printf("valor = %d\n", x);  // imprime com variáveis
```

O número `115200` é a **velocidade** (baud rate) e precisa ser idêntico ao
`monitor_speed` do `platformio.ini`. Se não bater, você vê lixo na tela.

Depurar em microcontrolador é, na prática, encher o código de `Serial.println`
até descobrir onde ele para de imprimir. É primitivo, mas é o que funciona.

---

## 7. Para onde ir agora

1. [Projeto 01 — Blink](../projects/01-blink/README.md): confirma que tudo
   funciona.
2. [Projeto 02 — Serial](../projects/02-serial/README.md): aprende a depurar e
   conhece o `millis()`.
3. [Projeto 03 — Botão](../projects/03-botao/README.md): lê o mundo real.
4. [Projeto 04 — Wi-Fi](../projects/04-wifi-scan/README.md): usa o que torna o
   ESP32 especial.

Deu erro em algum? [docs/troubleshooting.md](troubleshooting.md).
