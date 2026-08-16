# Esp32\_\_LAB

Laboratório pessoal para testar aplicações em um **ESP32 DevKit v1**
(módulo ESP32-WROOM-32), usando **PlatformIO + VS Code**.

Duas regras organizam este repositório:

1. **Um projeto por pasta.** Cada experimento em `projects/` é independente,
   com seu próprio `platformio.ini` e seu próprio README explicando a teoria.
2. **Ambiente 100% isolado.** Compilador, framework e bibliotecas ficam dentro
   do repositório, em `.pio-core/`. Nada é instalado no resto da máquina.

> **Nunca mexeu com microcontrolador?** Comece por
> [docs/fundamentos.md](docs/fundamentos.md) e depois faça o
> [projeto 01](projects/01-blink/README.md). Os projetos são progressivos:
> cada um assume o que o anterior ensinou.

---

## ⚠️ Leia isto antes de tudo: use o caminho `C:\Users\Public\esp32lab`

O compilador do ESP32 (`xtensa-esp32-elf-gcc`) **não consegue abrir arquivos
em caminhos com acento**. O seu usuário do Windows é
`israe.MAGALHÃES_NOTE` — o `Ã` faz a compilação falhar com erros confusos do
tipo `No such file or directory` em arquivos que claramente existem.

A solução já está aplicada: existe uma **junction** (atalho no nível do sistema
de arquivos) apontando para este repositório:

```
C:\Users\Public\esp32lab   ──►   C:\Users\israe.MAGALHÃES_NOTE\OneDrive\Desktop\Github\Esp32__LAB
```

É **a mesma pasta**, os mesmos arquivos, só que acessada por um caminho sem
acentos. Editar por um caminho altera o outro na hora.

**Portanto: sempre trabalhe por `C:\Users\Public\esp32lab`.** Abra o VS Code
por ali, rode os comandos por ali. É a única coisa que você precisa lembrar.

Se algum dia a junction sumir (formatação, novo PC), recrie com:

```powershell
New-Item -ItemType Junction -Path "C:\Users\Public\esp32lab" -Target "C:\Users\israe.MAGALHÃES_NOTE\OneDrive\Desktop\Github\Esp32__LAB"
```

---

## Começando

### 1. Abrir o projeto

Abra o VS Code **pelo arquivo de workspace, a partir do caminho limpo**:

```powershell
code C:\Users\Public\esp32lab\Esp32__LAB.code-workspace
```

Abrir o `.code-workspace` (e não a pasta solta) é o que faz a extensão
PlatformIO enxergar todos os projetos de uma vez.

### 2. Conectar a placa

Ligue o ESP32 no USB e confirme que o Windows a reconheceu:

```powershell
C:\Users\Public\esp32lab\pio.cmd device list
```

Você deve ver uma porta `COM3`, `COM4`, etc. **Não apareceu nada?** É driver
faltando — veja [docs/troubleshooting.md](docs/troubleshooting.md).

### 3. Rodar o primeiro projeto

```powershell
cd C:\Users\Public\esp32lab\projects\01-blink
..\..\pio.cmd run -t upload -t monitor
```

O LED azul da placa deve começar a piscar. Para sair do monitor: `Ctrl + C`.

---

## Os comandos que você vai usar

Sempre de **dentro da pasta de um projeto**:

| Comando | O que faz |
|---------|-----------|
| `..\..\pio.cmd run` | Compila. Não toca na placa. |
| `..\..\pio.cmd run -t upload` | Compila e grava na placa. |
| `..\..\pio.cmd run -t monitor` | Abre o monitor serial. |
| `..\..\pio.cmd run -t upload -t monitor` | O combo do dia a dia. |
| `..\..\pio.cmd run -t clean` | Apaga o build (quando algo fica estranho). |
| `..\..\pio.cmd device list` | Lista as portas COM disponíveis. |

Pela interface do VS Code, os mesmos botões estão na **barra de status
inferior**: ✓ (build), → (upload), 🔌 (monitor).

> `pio.cmd` é um atalho para o PlatformIO isolado deste repo. Sem ele você
> teria que digitar o caminho inteiro do `.venv` toda vez.

---

## Os projetos

Faça na ordem. Cada README explica a teoria por trás do código.

| # | Projeto | O que você aprende | Precisa de hardware extra? |
|---|---------|--------------------|---------------------------|
| 01 | [blink](projects/01-blink/README.md) | GPIO, `setup()`/`loop()`, HIGH/LOW, o perigo do `delay()` | não |
| 02 | [serial](projects/02-serial/README.md) | Depuração, `printf`, ler comandos, **`millis()`** | não |
| 03 | [botao](projects/03-botao/README.md) | Entrada digital, `INPUT_PULLUP`, debounce, borda | um botão (ou um fio) |
| 04 | [wifi-scan](projects/04-wifi-scan/README.md) | Wi-Fi, RSSI, canais, segurança, MAC | não |

O conceito mais importante de todos é o **`millis()`**, no projeto 02. É o que
separa um programa que trava de um que faz várias coisas ao mesmo tempo.

---

## Estrutura do repositório

```
Esp32__LAB/
│
├── README.md                    ← você está aqui
├── Esp32__LAB.code-workspace    ← abra ESTE arquivo no VS Code
├── pio.cmd                      ← atalho para o PlatformIO isolado
│
├── shared/
│   └── base.ini                 ← config comum: placa, framework, isolamento
│
├── docs/
│   ├── fundamentos.md           ← teoria: o que é um microcontrolador
│   └── troubleshooting.md       ← quando der errado, comece por aqui
│
├── projects/                    ← UM PROJETO POR PASTA
│   ├── _template/               ← copie esta pasta para criar um novo
│   ├── 01-blink/
│   │   ├── platformio.ini       ← config só deste projeto
│   │   ├── README.md            ← a teoria deste projeto
│   │   └── src/main.cpp         ← o código
│   ├── 02-serial/
│   ├── 03-botao/
│   └── 04-wifi-scan/
│
├── .venv/                       ← PlatformIO Core  (não versionado)
└── .pio-core/                   ← compilador e bibliotecas  (não versionado)
```

### Por que cada projeto tem seu próprio `platformio.ini`

Porque assim eles são de verdade independentes: você pode fixar uma versão de
biblioteca em um projeto sem afetar os outros, copiar uma pasta para outro
computador e ela funciona sozinha, ou apagar um experimento sem quebrar nada.

Para não repetir a mesma configuração quatro vezes, todos herdam
[shared/base.ini](shared/base.ini):

```ini
[platformio]
extra_configs = ../../shared/base.ini

[env:blink]
```

Trocou de placa? Muda **só** o `base.ini` e vale para todos.

---

## Criando um projeto novo

```powershell
cd C:\Users\Public\esp32lab\projects
xcopy /E /I _template 05-meu-projeto
```

Depois:

1. Em `05-meu-projeto/platformio.ini`, mude o nome do ambiente:
   `[env:meu-projeto]`.
2. Escreva o código em `src/main.cpp`.
3. Adicione a pasta na lista `folders` do `Esp32__LAB.code-workspace`.

Precisa de uma biblioteca? Adicione no `platformio.ini` **daquele projeto**:

```ini
[env:meu-projeto]
lib_deps =
    adafruit/DHT sensor library@^1.4.6
```

Ela é baixada para dentro do repositório, só para esse projeto.

---

## Como funciona o isolamento

Por padrão, o PlatformIO joga tudo em `C:\Users\<você>\.platformio` — uma
pasta global, compartilhada com qualquer outro projeto da máquina. Uma linha
em [shared/base.ini](shared/base.ini) muda isso:

```ini
[platformio]
core_dir = ../../.pio-core
```

| Componente | Onde fica | Versionado no Git? |
|-----------|-----------|--------------------|
| PlatformIO Core | `.venv/` (repo) | não |
| Compilador xtensa, framework Arduino | `.pio-core/` (repo) | não |
| Bibliotecas de terceiros | `.pio-core/` (repo) | não |
| Artefatos de build (`.bin`, `.elf`) | `projects/*/.pio/` | não |
| Extensão do VS Code | global (inevitável) | — |

Nada além da extensão do VS Code toca o resto do sistema. Apagar este
repositório apaga o ambiente inteiro, sem deixar rastro.

### Recriando o ambiente do zero

O `.venv/` e o `.pio-core/` não vão para o Git, porque juntos passam de 1 GB e
podem ser reconstruídos com dois comandos:

```powershell
cd C:\Users\Public\esp32lab
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install platformio
cd projects\01-blink
..\..\pio.cmd run          # baixa compilador e framework automaticamente
```

---

## Quando der errado

Vá para [docs/troubleshooting.md](docs/troubleshooting.md). Ele cobre os casos
mais comuns: placa não aparece, `Failed to connect`, lixo no monitor serial,
`Permission denied` na porta COM e a placa reiniciando em loop.

O primeiro teste de sanidade é sempre o **projeto 01**. Se o blink funciona, a
placa e o ambiente estão bons, e o problema está no seu código.

---

## Sobre o OneDrive

Este repositório está dentro da pasta do OneDrive, então o `.pio-core/` (mais
de 1 GB de compilador) tende a ser sincronizado para a nuvem. Isso gasta banda
e, ocasionalmente, o OneDrive trava um arquivo no meio de uma compilação.

Se isso incomodar, a saída é mover o repositório para fora do OneDrive — por
exemplo `C:\Dev\Esp32__LAB` — e recriar a junction apontando para o novo
lugar. O Git continua sendo o backup real do que importa: o código.
