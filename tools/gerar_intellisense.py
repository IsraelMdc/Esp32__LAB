"""
Gera a configuracao do IntelliSense do VS Code para todo o laboratorio.

Por que este script existe
--------------------------
O PlatformIO sabe gerar o .vscode/c_cpp_properties.json de UM projeto
("pio project init --ide vscode"). Mas aqui cada projeto vive em sua
propria pasta, e o VS Code procura esse arquivo na raiz da pasta que
voce abriu:

  - abriu o Esp32__LAB.code-workspace  -> le o config de cada projeto  OK
  - abriu a pasta Esp32__LAB inteira   -> procura em Esp32__LAB/.vscode  X

No segundo caso, sem um config na raiz, o editor nao acha Arduino.h e
sublinha tudo de vermelho (ainda que a compilacao funcione normalmente).

Este script cobre os dois casos: gera o config de cada projeto e mais um
na raiz, unindo os includePath e o src/ de todos eles.

Como usar
---------
    C:\\Users\\Public\\esp32lab\\tools\\gerar_intellisense.cmd

Depois recarregue a janela do VS Code:
    Ctrl+Shift+P  ->  Developer: Reload Window
"""

import json
import subprocess
import sys
from pathlib import Path

# ATENCAO: .absolute(), nunca .resolve().
#
# O repositorio e acessado pela junction C:\Users\Public\esp32lab, porque
# o caminho real contem acento e o compilador xtensa nao o suporta.
# .resolve() desfaria a junction e devolveria o caminho acentuado, que
# acabaria gravado dentro do c_cpp_properties.json. .absolute() preserva
# o caminho pelo qual o script foi chamado.
RAIZ = Path(__file__).absolute().parent.parent
PIO = RAIZ / ".venv" / "Scripts" / "pio.exe"
PROJETOS = sorted(p for p in (RAIZ / "projects").iterdir() if (p / "platformio.ini").is_file())


def sem_comentarios(texto: str) -> str:
    """Remove as linhas de comentario // que o PlatformIO poe no topo do JSON."""
    return "\n".join(l for l in texto.splitlines() if not l.lstrip().startswith("//"))


def main() -> int:
    if not PIO.is_file():
        print(f"ERRO: PlatformIO nao encontrado em {PIO}")
        print("Recrie o ambiente conforme o README (secao 'Recriando o ambiente do zero').")
        return 1

    if not PROJETOS:
        print("ERRO: nenhum projeto encontrado em projects/")
        return 1

    # --- 1. gera o config de cada projeto -------------------------------
    for proj in PROJETOS:
        print(f"  gerando  projects/{proj.name} ...", end=" ", flush=True)
        r = subprocess.run(
            [str(PIO), "project", "init", "--ide", "vscode"],
            cwd=proj,
            capture_output=True,
            text=True,
        )
        if r.returncode != 0:
            print("FALHOU")
            print(r.stdout[-2000:], r.stderr[-2000:])
            return 1

        # O "pio project init" cria um .gitignore em cada projeto, todos
        # iguais. O .gitignore da raiz ja cobre esses padroes, entao
        # removemos as copias para nao poluir o repositorio.
        gi = proj / ".gitignore"
        if gi.is_file():
            gi.unlink()

        print("ok")

    # --- 2. monta o config da raiz --------------------------------------
    # Usamos o primeiro projeto como base: todos compartilham a mesma
    # placa e framework, entao os includePath do framework sao iguais.
    # So precisamos acrescentar o src/ de cada um dos outros.
    base_arq = PROJETOS[0] / ".vscode" / "c_cpp_properties.json"
    if not base_arq.is_file():
        print(f"ERRO: {base_arq} nao foi gerado.")
        return 1

    cfg = json.loads(sem_comentarios(base_arq.read_text(encoding="utf-8")))
    conf = cfg["configurations"][0]
    conf["name"] = "PlatformIO (laboratorio inteiro)"

    incluidos = list(conf.get("includePath", []))
    for proj in PROJETOS:
        for sub in ("src", "include", "lib"):
            caminho = (proj / sub).as_posix()
            if (proj / sub).is_dir() and caminho not in incluidos:
                incluidos.append(caminho)
    conf["includePath"] = incluidos

    # O "browse" alimenta o "ir para definicao" e a busca de simbolos.
    if "browse" in conf:
        conf["browse"]["path"] = incluidos

    destino = RAIZ / ".vscode"
    destino.mkdir(exist_ok=True)
    saida = destino / "c_cpp_properties.json"
    saida.write_text(
        "// GERADO POR tools/gerar_intellisense.py - NAO EDITE A MAO\n"
        + json.dumps(cfg, indent=4),
        encoding="utf-8",
    )

    print()
    print(f"Config da raiz escrito em .vscode/c_cpp_properties.json")
    print(f"  {len(incluidos)} caminhos de include, {len(PROJETOS)} projetos")
    print()
    print("Agora recarregue o VS Code:  Ctrl+Shift+P -> Developer: Reload Window")
    return 0


if __name__ == "__main__":
    sys.exit(main())
