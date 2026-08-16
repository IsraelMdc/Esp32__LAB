# Projeto 02 — Serial

A porta serial é a sua janela para dentro do chip. Sem ela, o ESP32 é uma
caixa preta: ou o LED pisca, ou não pisca, e você não faz ideia do porquê.
Com ela, você vê valores de variáveis, mensagens de erro e o momento exato em
que as coisas quebram.

Este projeto ensina os dois sentidos da conversa: **imprimir** do ESP32 para o
PC, e **ler** o que você digita no PC.

## Como rodar

```powershell
..\..\pio.cmd run -t upload -t monitor
```

Com o monitor aberto, digite um comando e aperte **Enter**:

| Comando | Efeito |
|---------|--------|
| `on`    | acende o LED azul |
| `off`   | apaga o LED azul |
| `info`  | mostra CPU, RAM livre, flash e tempo ligado |
| `help`  | lista os comandos |

## Os conceitos

### O que é "serial" e o que é "baud rate"

Comunicação serial manda dados **um bit por vez** por um único fio. Para os
dois lados se entenderem, precisam concordar na velocidade — o **baud rate**,
medido em bits por segundo.

`Serial.begin(115200)` no código precisa bater com `monitor_speed = 115200`
no `platformio.ini`. Se não bater, você vê lixo na tela:

```
Ã¾â–’Ã¿Ã¾â–’â–’Ã¿Ã¾
```

Isso quase sempre significa velocidade errada — não é a placa quebrada.

> **Lixo só nas primeiras linhas, e depois normaliza?** Isso é normal. É a
> mensagem de boot do ESP32, que sai a 74880 baud (uma velocidade fixa de
> fábrica). Pode ignorar.

### Imprimindo: println vs printf

```cpp
Serial.println("texto");              // imprime e pula linha
Serial.print("sem pular linha");      // imprime e fica na mesma linha
Serial.printf("RAM: %u bytes\n", x);  // monta texto com variáveis
```

`printf` usa marcadores que são substituídos pelos valores:

| Marcador | Serve para | Exemplo |
|----------|-----------|---------|
| `%d`     | número inteiro | `printf("n=%d\n", 42)` |
| `%u`     | inteiro sem sinal | `printf("%u\n", ESP.getFreeHeap())` |
| `%lu`    | inteiro longo sem sinal (`millis()`) | `printf("%lu\n", millis())` |
| `%s`     | texto | `printf("%s\n", "oi")` |
| `%f`     | número com vírgula | `printf("%.2f\n", 3.14159)` |
| `%\n`    | quebra de linha | — |

### Lendo: por que o `.trim()` é obrigatório

Quando você digita `on` e aperta Enter, o PC não manda 2 caracteres — manda
`o`, `n`, e mais um ou dois caracteres invisíveis de fim de linha (`\r\n`).

Sem `comando.trim()`, a comparação `comando == "on"` compara `"on\r"` com
`"on"` e dá **falso**. Seu comando nunca funcionaria e você ficaria olhando
para um código aparentemente correto. Esquecer o `trim()` é um dos erros mais
comuns e mais frustrantes de iniciante.

### millis() — o jeito certo de medir tempo

Este é o conceito mais valioso do projeto.

`millis()` devolve há quantos milissegundos a placa está ligada. Em vez de
congelar o chip com `delay()`, você anota *quando* fez algo e pergunta se já
passou tempo suficiente:

```cpp
unsigned long agora = millis();
if (agora - ultimoPrint >= 1000) {   // já passou 1 segundo?
  ultimoPrint = agora;               // marca o novo ponto de partida
  // ...faz a tarefa
}
```

Compare os dois modelos:

| | `delay(1000)` | `millis()` |
|---|---|---|
| Durante a espera | chip **congelado** | chip **livre** |
| Ler botão enquanto espera | impossível | funciona |
| Fazer 2 coisas em ritmos diferentes | impossível | fácil |

É por isso que, neste projeto, o contador imprime a cada segundo **e** os
comandos respondem na hora. Com `delay()` você teria que escolher um ou outro.

> Use `unsigned long` para guardar tempo, nunca `int`. Um `int` estoura em
> ~32 segundos e o programa passa a se comportar de forma imprevisível.

## Experimentos

1. Adicione um comando `blink` que pisca o LED 5 vezes.
2. Adicione um comando `reset` que zera o contador.
3. Faça o LED piscar sozinho a cada 2 s usando um **segundo** `millis()`,
   sem parar de responder aos comandos. (Precisa de outra variável de tempo,
   tipo `ultimoBlink`.)
4. Troque `Serial.printf` por `Serial.print` numa linha e veja como fica bem
   mais trabalhoso montar o texto.

---

← [01 — Blink](../01-blink/README.md) · [Índice](../../README.md) · Próximo: [03 — Botão](../03-botao/README.md) →
