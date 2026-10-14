r"""
Wrapper inteligente para o PlatformIO.
Detecta se o usuario executou o comando a partir do caminho real acentuado
(ex: C:\Users\israe.MAGALHAES_NOTE\...) e redireciona transparentemente
o processo para a junction limpa (C:\Users\Public\esp32lab\...) antes
de disparar o compilador xtensa.
"""
import os
import sys
import subprocess

cwd = os.getcwd()
junction_root = r"C:\Users\Public\esp32lab"
marker = "esp32__lab"

# Se o caminho atual contiver a pasta do repositorio mas nao começar com o caminho limpo
if marker in cwd.lower() and not cwd.lower().startswith(junction_root.lower()):
    idx = cwd.lower().find(marker)
    subpath = cwd[idx + len(marker):].lstrip("\\/")
    target_dir = os.path.join(junction_root, subpath)
    if os.path.exists(target_dir):
        os.chdir(target_dir)

cmd = [sys.executable, "-m", "platformio"] + sys.argv[1:]
res = subprocess.run(cmd)
sys.exit(res.returncode)

