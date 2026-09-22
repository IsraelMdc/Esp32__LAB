@echo off
REM ============================================================
REM  Atalho inteligente para o PlatformIO deste repositorio.
REM ============================================================
REM  Redireciona automaticamente caminhos acentuados para a
REM  junction C:\Users\Public\esp32lab para que a compilacao
REM  nunca falhe com erro de caracteres no caminho.
REM ============================================================
"C:\Users\Public\esp32lab\.venv\Scripts\python.exe" "C:\Users\Public\esp32lab\tools\pio_wrapper.py" %*
