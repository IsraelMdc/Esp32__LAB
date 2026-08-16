@echo off
REM ============================================================
REM  Regenera a configuracao do IntelliSense do VS Code.
REM ============================================================
REM  Rode isto quando o editor sublinhar #include <Arduino.h> de
REM  vermelho, ou depois de criar um projeto novo / clonar o repo.
REM
REM  Depois: Ctrl+Shift+P -> Developer: Reload Window
REM ============================================================
"%~dp0..\.venv\Scripts\python.exe" "%~dp0gerar_intellisense.py" %*
