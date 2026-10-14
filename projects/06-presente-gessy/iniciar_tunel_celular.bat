@echo off
title Galeria da Gessy - Iniciar Link para Celular (Cloudflare)
cd /d "%~dp0"
echo ========================================================
echo   INICIANDO LINK PUBLICO PARA A GESSY ACESSAR NO CELULAR
echo ========================================================
echo.
powershell.exe -ExecutionPolicy Bypass -File "..\..\tools\iniciar_presente.ps1"
pause

