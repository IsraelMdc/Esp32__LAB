# Quando der errado

Ordenado do problema mais comum para o mais raro. Antes de tudo, o **teste de
sanidade**: rode o [projeto 01](../projects/01-blink/README.md). Se o LED
pisca, a placa e o ambiente estão bons e o problema está no seu código.

---

## `No such file or directory` em arquivos que existem

```
xtensa-esp32-elf-g++: error: C:/Users/israe.MAGALHÃES_NOTE/.../WMath.cpp:
    No such file or directory
```

**Causa:** você compilou pelo caminho real do repositório. O compilador do
ESP32 não abre arquivos em caminhos com **acento**, e o seu usuário do Windows
é `israe.MAGALHÃES_NOTE`. O arquivo existe; o GCC é que não consegue lê-lo.

**Solução:** trabalhe sempre por `C:\Users\Public\esp32lab`, que é uma junction
apontando para a mesma pasta, só que sem acentos.

```powershell
cd C:\Users\Public\esp32lab\projects\01-blink
..\..\pio.cmd run -t upload -t monitor
```

Se a junction não existir mais, recrie:

```powershell
New-Item -ItemType Junction -Path "C:\Users\Public\esp32lab" -Target "C:\Users\israe.MAGALHÃES_NOTE\OneDrive\Desktop\Github\Esp32__LAB"
```

E no VS Code, abra por `C:\Users\Public\esp32lab\Esp32__LAB.code-workspace`.

---

## Nenhuma porta COM aparece

```powershell
C:\Users\Public\esp32lab\pio.cmd device list
```

Não listou nada? Na ordem de probabilidade:

**1. O cabo USB é só de carga.** Causa nº 1. Muitos cabos de carregador têm
apenas os fios de energia. A placa acende (LED vermelho), mas o PC nunca a
enxerga. Teste com outro cabo — de preferência um que você já usou para
transferir arquivos de um celular.

**2. Falta o driver do conversor USB-Serial.** A DevKit v1 usa um destes dois
chips; olhe o retângulo menor perto do conector USB:

| Chip | Driver |
|------|--------|
| CP2102 | [Silicon Labs CP210x](https://www.silabs.com/developers/usb-to-uart-bridge-vcp-drivers) |
| CH340 / CH9102 | [WCH CH341SER](https://www.wch-ic.com/downloads/CH341SER_EXE.html) |

Não consegue ler o chip? Abra o **Gerenciador de Dispositivos**: se aparecer um
item com triângulo amarelo em "Outros dispositivos", é driver faltando.

**3. Porta USB do PC.** Teste outra, de preferência traseira, sem hub.

---

## `Failed to connect to ESP32: Timed out waiting for packet header`

A placa é vista, mas não entra em modo de gravação.

**Solução manual (funciona quase sempre):**

1. Segure o botão **BOOT** pressionado.
2. Sem soltar, aperte e solte o **EN** (reset).
3. Solte o **BOOT**.
4. Rode o upload imediatamente.

**Outras causas:**

- **Monitor serial aberto em outro lugar.** A porta só aceita um programa por
  vez. Feche o outro monitor (`Ctrl + C`) e tente de novo.
- **Velocidade alta demais.** Reduza no `platformio.ini` do projeto:

  ```ini
  upload_speed = 115200
  ```

- **Algo ligado nos pinos 0, 2, 12 ou 15.** São *strapping pins*: definem como
  a placa liga. Desconecte tudo deles e grave de novo.

---

## Lixo no monitor serial

```
Ã¾â–’Ã¿Ã¾â–’â–’Ã¿Ã¾
```

**Se for lixo o tempo todo:** velocidade errada. O número em
`Serial.begin(115200)` precisa ser idêntico ao `monitor_speed` do
`platformio.ini`.

**Se for lixo só nas primeiras linhas e depois normalizar:** é normal, pode
ignorar. É a mensagem de boot do próprio ESP32, emitida a 74880 baud, uma
velocidade fixa de fábrica.

---

## `could not open port COM3: Access is denied`

Outro programa está segurando a porta. Quase sempre é um monitor serial que
ficou aberto — na aba anterior do terminal, no Arduino IDE, no PuTTY.

Feche-o com `Ctrl + C`. Se não achar quem é, desconecte e reconecte o cabo USB.

---

## A placa reinicia sozinha, em loop

O monitor mostra a mensagem de boot repetidamente. Três causas possíveis:

**1. Falta de energia.** O Wi-Fi puxa picos de até 500 mA na transmissão.
Portas USB fracas (teclado, monitor, hub sem fonte) não dão conta. Ligue direto
numa porta do PC ou use uma fonte de 5 V / 1 A.

**2. Acabou a RAM.** Imprima `ESP.getFreeHeap()` periodicamente (o
[projeto 02](../projects/02-serial/README.md) mostra como). Se o número só cai,
você tem vazamento — algo é alocado e nunca liberado. No caso do Wi-Fi scan, o
culpado costuma ser a falta de `WiFi.scanDelete()`.

**3. Watchdog.** Se o `loop()` demora demais numa passada, o ESP32 assume que
travou e reinicia. Aparece assim:

```
E (5000) task_wdt: Task watchdog got triggered.
```

Evite laços longos e `delay()` grandes. Se realmente precisar de uma operação
demorada, chame `yield()` no meio dela.

---

## O código roda, mas o pino não faz nada

Confira na [tabela de pinos](fundamentos.md#3-os-pinos-gpio). As duas
armadilhas:

- **GPIO 34, 35, 36, 39 são só de entrada.** `digitalWrite()` neles compila
  normalmente, roda normalmente, e não faz absolutamente nada. Nenhum erro é
  emitido.
- **GPIO 6 a 11 estão ligados à flash interna.** Usá-los trava o boot da placa.

---

## Erro de compilação depois de mexer no `platformio.ini`

Comece limpando o build:

```powershell
..\..\pio.cmd run -t clean
..\..\pio.cmd run
```

Se persistir, apague a pasta `.pio` do projeto e compile de novo.

---

## Sublinhado vermelho no `#include <Arduino.h>`

```
#include errors detected. Please update your includePath.
cannot open source file "stdlib.h" (dependency of "Arduino.h")
```

**Isso não é erro de compilação.** É só o IntelliSense do VS Code, que não sabe
onde ficam os headers do ESP32. O código compila e grava normalmente — o que
não funciona é o sublinhado, o autocompletar e o "ir para definição".

O arquivo que ensina isso ao editor é o `.vscode/c_cpp_properties.json`, e quem
o gera é o próprio PlatformIO. De dentro da pasta do projeto:

```powershell
..\..\pio.cmd project init --ide vscode
```

Depois **recarregue a janela do VS Code**: `Ctrl + Shift + P` →
*Developer: Reload Window*.

Precisa rodar isso quando:

- o projeto é novo (copiado do `_template`);
- você acabou de clonar o repositório (o arquivo é gitignored, porque contém
  caminhos absolutos desta máquina);
- você adicionou uma biblioteca em `lib_deps` e o editor não a reconhece.

## O VS Code não mostra os botões do PlatformIO

Você abriu a pasta solta em vez do workspace. Cada projeto tem seu próprio
`platformio.ini`, e a extensão procura esse arquivo na raiz de cada pasta do
workspace.

```powershell
code C:\Users\Public\esp32lab\Esp32__LAB.code-workspace
```

Criou um projeto novo? Adicione-o à lista `folders` desse arquivo.

---

## `can't create .pio/build/.../arquivo.o: No such file or directory`

Pastas de saída que deveriam existir somem no meio do build.

A causa mais comum é ter apagado a pasta `.pio` **no mesmo comando** que
dispara a compilação. O Windows conclui a remoção de diretórios de forma
assíncrona, então a exclusão ainda em andamento apaga as pastas que o
compilador acabou de criar.

Separe as duas coisas em comandos distintos:

```powershell
Remove-Item -Recurse -Force .pio
..\..\pio.cmd run
```

Ou simplesmente use `..\..\pio.cmd run -t clean`, que faz a limpeza de forma
coordenada com o build.

> Programas que vigiam a pasta em segundo plano — sincronizadores de nuvem,
> antivírus com varredura em tempo real — podem causar o mesmo sintoma. Aqui a
> sincronização do OneDrive está desativada, então não é o caso.

---

## Recomeçar do zero

Se o ambiente ficar irrecuperável, apague `.venv/` e `.pio-core/` e reconstrua:

```powershell
cd C:\Users\Public\esp32lab
Remove-Item -Recurse -Force .venv, .pio-core
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install platformio
cd projects\01-blink
..\..\pio.cmd run
```

Nenhuma dessas pastas vai para o Git justamente por serem descartáveis. Seu
código está a salvo.
