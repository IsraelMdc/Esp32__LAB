# Projeto 04 — Wi-Fi Scan

Este é o projeto que mostra por que o ESP32 vale a pena. Wi-Fi e Bluetooth vêm
**dentro do módulo**, sem nenhum componente extra. Num Arduino Uno você
precisaria comprar um shield de rede; aqui é só incluir uma biblioteca.

Este projeto **não precisa da sua senha** — ele apenas escuta o que está no ar,
como a tela de "escolher rede Wi-Fi" do celular.

## Como rodar

```powershell
..\..\pio.cmd run -t upload -t monitor
```

Não precisa ligar nada na placa. Só o cabo USB.

## O que você deve ver

```
=== PROJETO 04 — WI-FI SCAN ===
MAC desta placa: A0:B7:65:1C:2D:3E

[Scan #1] Procurando redes...
7 redes encontradas:

  # | SSID                             | RSSI | Qualid.    | Ch | Seguranca
----+----------------------------------+------+------------+----+------------
  1 | MinhaCasa_5G                     |  -42 | otimo      |  6 | WPA2
  2 | VIVO-A1B2                        |  -71 | fraco      | 11 | WPA2/WPA3
  3 | <rede oculta>                    |  -80 | muito fraco|  1 | WPA2
```

A busca repete a cada 15 segundos. Ande pela casa com a placa ligada num
power bank e veja os valores de RSSI mudarem.

## Os conceitos

### RSSI — a força do sinal

**RSSI** (*Received Signal Strength Indicator*) é medido em **dBm** e é sempre
**negativo**. Quanto mais perto de zero, melhor:

| RSSI | Qualidade | Na prática |
|------|-----------|-----------|
| −30 a −55 dBm | ótimo | do lado do roteador |
| −56 a −67 dBm | bom | conexão estável, streaming ok |
| −68 a −78 dBm | fraco | funciona, mas cai às vezes |
| abaixo de −79 dBm | muito fraco | não confie |

Então **−42 é melhor que −71**. É contraintuitivo até você se acostumar: pense
como temperatura negativa, onde −5 °C é mais quente que −20 °C.

A escala é **logarítmica**: cada −3 dBm significa metade da potência.

### Canais

O Wi-Fi de 2,4 GHz é dividido em canais de 1 a 13. Canais vizinhos se
sobrepõem e se atrapalham — por isso só **1, 6 e 11** não interferem entre si.
Se o seu Wi-Fi vive travando, rode este scan: se houver cinco redes fortes no
mesmo canal do seu roteador, achou o culpado.

> Este scan só enxerga redes de **2,4 GHz**. O ESP32 não tem rádio de 5 GHz.
> Se uma rede sua não aparecer, é quase certo que ela está em 5 GHz.

### Segurança

A coluna mostra como a rede protege o tráfego:

- **ABERTA** — sem senha, tudo trafega em texto puro. Evite.
- **WEP** — quebrável em minutos. Considere insegura.
- **WPA2** — o padrão atual, seguro para uso normal.
- **WPA3** — o mais novo e o mais forte.

> ⚠️ O ESP32 com Arduino core 2.x conecta bem em redes **WPA2**. Em
> roteadores configurados como **somente WPA3**, a conexão pode falhar. Se isso
> acontecer, mude o roteador para o modo misto "WPA2/WPA3".

### Endereço MAC

O MAC (`A0:B7:65:1C:2D:3E`) é o identificador único da interface de rede,
gravado de fábrica. Serve para o roteador reservar sempre o mesmo IP para a
sua placa, ou para você identificar qual ESP32 é qual quando tiver vários.

### Detalhes de código que valem a pena notar

**`.c_str()`** — `Serial.printf("%s", ...)` é uma função de C e não entende o
tipo `String` do Arduino. `.c_str()` converte para o formato que o C espera.
Esquecer isso imprime lixo ou trava a placa.

**`%-32s`** — o `-` alinha o texto à esquerda e o `32` reserva 32 colunas. É o
que mantém a tabela alinhada.

**`WiFi.scanDelete()`** — a lista de redes fica guardada na RAM. Sem apagá-la,
cada scan consome mais memória até a placa reiniciar sozinha. Observe a linha
"RAM livre": ela deve ficar estável entre os scans. Se um dia você vir esse
número caindo sem parar, é vazamento de memória.

**`WIFI_STA`** — o ESP32 tem dois modos de Wi-Fi:

| Modo | Papel | Analogia |
|------|-------|----------|
| `WIFI_STA` | cliente, entra numa rede | celular conectando no Wi-Fi |
| `WIFI_AP` | cria a própria rede | o roteador |

Ele também pode fazer os dois ao mesmo tempo (`WIFI_AP_STA`).

## Experimentos

1. Mostre apenas redes com sinal acima de −70 dBm.
2. Conte quantas redes existem em cada canal e descubra o canal mais livre da
   sua vizinhança.
3. Acenda o LED quando alguma rede aberta (`WIFI_AUTH_OPEN`) for detectada.
4. Guarde o maior RSSI já visto para uma rede específica e imprima o recorde —
   um "detector de proximidade" do roteador.

## Próximo passo

Este projeto **escuta**. O passo seguinte é **conectar**, com `WiFi.begin(ssid,
senha)`, e aí sua senha entra no jogo. Quando fizer isso, coloque as
credenciais num arquivo `include/secrets.h` — o [.gitignore](../../.gitignore)
deste repositório já está configurado para nunca versionar esse arquivo.

---

← [03 — Botão](../03-botao/README.md) · [Índice](../../README.md)
