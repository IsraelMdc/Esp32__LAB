@echo off
title Galeria da Gessy - Teste Local
cd /d "%~dp0frontend"
echo ========================================================
echo   GALERIA DA GESSY - SERVIDOR LOCAL DE TESTE
echo ========================================================
echo Iniciando servidor web local...
echo O seu navegador sera aberto automaticamente.
echo.
python servidor_dev.py
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Python nao encontrado! Tentando com node ou http-server...
    npx -y serve . -p 8000
)
pause

