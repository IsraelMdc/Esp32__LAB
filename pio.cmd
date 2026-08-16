@echo off
REM ============================================================
REM  Atalho para o PlatformIO ISOLADO deste repositorio.
REM ============================================================
REM  Sem isto voce teria que digitar o caminho completo do .venv
REM  toda vez. Com isto, de dentro de qualquer projeto:
REM
REM      ..\..\pio.cmd run -t upload -t monitor
REM
REM  %~dp0 = a pasta onde ESTE arquivo esta (a raiz do repo).
REM  %*    = repassa todos os argumentos que voce digitou.
REM ============================================================
"%~dp0.venv\Scripts\pio.exe" %*
