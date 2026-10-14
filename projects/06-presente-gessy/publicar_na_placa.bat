@echo off
title Galeria da Gessy - Publicar no ESP32
cd /d "%~dp0"
echo ========================================================
echo   PUBLICAR FRONTEND NO ESP32 (LITTLEFS)
echo ========================================================
echo.
echo 1. Sincronizando arquivos de 'frontend' para 'data'...
robocopy frontend data /MIR /XD .git __pycache__ /XF servidor_dev.py recados.txt *.bat > nul
echo    [OK] Arquivos sincronizados com sucesso!
echo.
echo 2. Gravando arquivos na memoria flash do ESP32 via uploadfs...
call ..\..\pio.cmd run -t uploadfs
if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================================
    echo  [SUCESSO] Frontend atualizado e gravado no ESP32!
    echo ========================================================
) else (
    echo.
    echo [ERRO] Falha ao gravar no ESP32. Verifique se o cabo USB esta conectado.
)
echo.
pause

