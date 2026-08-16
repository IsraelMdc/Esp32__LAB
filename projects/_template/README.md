# \<Nome do projeto\>

> Template. Copie esta pasta para começar um projeto novo e substitua este
> texto.

Uma frase dizendo o que o projeto faz e por quê.

## Hardware: nenhum

Este laboratório usa **só a placa e o cabo USB**. Liste aqui quais recursos
embutidos o projeto utiliza.

| Recurso da placa | Pino | Modo |
|------------------|------|------|
| LED embutido | GPIO 2 | OUTPUT |
| Botão BOOT | GPIO 0 | INPUT_PULLUP |

Outros recursos disponíveis sem nada externo: toque capacitivo
(`touchRead(T0..T9)`), sensor hall (`hallRead()`), temperatura interna
(`temperatureRead()`), Wi-Fi, Bluetooth, deep sleep e os dois núcleos.

## Como rodar

```powershell
..\..\pio.cmd run -t upload -t monitor
```

## O que você deve ver

```
=== <NOME DO PROJETO> ===
[1 s] rodando
```

## Conceitos

O que este projeto ensina que os anteriores não ensinaram.

## Experimentos

1.
2.

---

← [Índice do laboratório](../../README.md)
