# CLAUDE.md

Contexto para o Claude Code trabalhar neste repositório.

## O que é

Laboratório de experimentos com **ESP32 DevKit v1** (ESP32-WROOM-32), usando
**PlatformIO + framework Arduino**. O dono do repositório está **aprendendo
microcontroladores do zero** — o código e a documentação devem ensinar, não só
funcionar.

## 🚨 Regra crítica: nunca compile pelo caminho real

O compilador `xtensa-esp32-elf-gcc` **não abre arquivos em caminhos com
acento**, e o perfil do Windows é `israe.MAGALHÃES_NOTE`. Compilar pelo
caminho real falha com `No such file or directory` em arquivos que existem.

Existe uma **junction** para contornar isso:

```
C:\Users\Public\esp32lab  ──►  C:\Users\israe.MAGALHÃES_NOTE\OneDrive\Desktop\Github\Esp32__LAB
```

**Sempre rode comandos do PlatformIO por `C:\Users\Public\esp32lab`.** Editar
arquivos por qualquer um dos dois caminhos funciona (é a mesma pasta), mas
compilar só funciona pelo caminho limpo.

Recriar a junction, se sumir:

```powershell
New-Item -ItemType Junction -Path "C:\Users\Public\esp32lab" -Target "C:\Users\israe.MAGALHÃES_NOTE\OneDrive\Desktop\Github\Esp32__LAB"
```

## Comandos

Sempre de dentro da pasta de um projeto, pelo caminho limpo:

```powershell
cd C:\Users\Public\esp32lab\projects\01-blink
..\..\pio.cmd run                      # compilar
..\..\pio.cmd run -t upload            # gravar na placa
..\..\pio.cmd run -t upload -t monitor # gravar e abrir o serial
..\..\pio.cmd device list              # listar portas COM
```

`pio.cmd` (na raiz) é um wrapper para `.venv\Scripts\pio.exe`.

## Ambiente isolado

Nada é instalado fora do repositório:

- `.venv/` — PlatformIO Core 6.1.19, instalado via pip.
- `.pio-core/` — compilador xtensa, framework Arduino, bibliotecas. Vem de
  `core_dir = ../../.pio-core` em `shared/base.ini`.
- Nenhum `~/.platformio` global é criado.

Ambas as pastas são gitignored e recriáveis (veja o README).

## Estrutura: um projeto por pasta

Cada pasta em `projects/` é um projeto PlatformIO **independente**, com seu
próprio `platformio.ini`. Todos herdam `shared/base.ini` via:

```ini
[platformio]
extra_configs = ../../shared/base.ini
```

> `extra_configs` **precisa** estar dentro da seção `[platformio]`. Solto no
> topo do arquivo, dá `File contains no section headers`.

Configuração de placa, framework e isolamento fica só no `base.ini`. O
`platformio.ini` de cada projeto normalmente tem apenas o nome do ambiente e
suas `lib_deps` específicas.

Ao criar um projeto novo: copie `projects/_template/` e **adicione a pasta na
lista `folders` do `Esp32__LAB.code-workspace`**.

## Convenções de código

- Comentários e documentação em **português**.
- Comentar generosamente, explicando o *porquê* — o leitor é iniciante.
- Preferir `millis()` a `delay()`, e explicar a diferença quando aparecer.
- Cada projeto tem um `README.md` com: como rodar, saída esperada, os
  conceitos novos e uma lista de experimentos.
- `platform` está fixado em `espressif32@7.0.1` no `base.ini`, de propósito.

## Estado validado

Os quatro projetos compilam (testado): 01-blink 20,5% de flash, 02-serial
20,7%, 03-botao 20,6%, 04-wifi-scan 55,4%.

**Nada foi testado em hardware real ainda** — nenhuma placa estava conectada
durante o setup (`pio device list` não retornou portas).

## Cuidados conhecidos

- **OneDrive**: o repositório está dentro da pasta sincronizada. Já causou uma
  falha de build (pastas de `.pio` sumindo durante a compilação). Se der erro
  intermitente com `can't create ... .o`, é isso; rodar de novo resolve.
- **3,3 V**: os GPIO do ESP32 não toleram 5 V. Ao sugerir circuitos, verificar
  a tensão do componente.
- **Pinos**: 6–11 são da flash interna (nunca usar); 34–39 são só entrada;
  0, 12, 15 são strapping pins.
