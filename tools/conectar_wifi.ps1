<#
.SYNOPSIS
    Busca as redes Wi-Fi disponíveis e permite conectar o ESP32 pelo terminal.
#>

$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Clear-Host
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "       ESP32 LAB — BUSCADOR DE REDES WI-FI NO TERMINAL    " -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔍 Escaneando redes Wi-Fi ao redor, aguarde um instante..." -ForegroundColor Green

# 1. Escanear redes via placa Wi-Fi
$scanRaw = netsh wlan show networks mode=bssid
$redesEncontradas = @()

$currSsid = ""
$currSignal = ""
$currBand = ""
$currAuth = ""

foreach ($line in ($scanRaw -split '\r?\n')) {
    if ($line -match '^\s*SSID\s*\d*\s*:\s*(.+)$') {
        $currSsid = $matches[1].Trim()
    }
    elseif ($line -match '^\s*Autenticação\s*:\s*(.+)$' -or $line -match '^\s*Authentication\s*:\s*(.+)$') {
        $currAuth = $matches[1].Trim()
    }
    elseif ($line -match '^\s*Sinal\s*:\s*(.+)$' -or $line -match '^\s*Signal\s*:\s*(.+)$') {
        $currSignal = $matches[1].Trim()
    }
    elseif ($line -match '^\s*Banda\s*:\s*(.+)$' -or $line -match '^\s*Band\s*:\s*(.+)$') {
        $currBand = $matches[1].Trim()
        if ($currSsid -and !($redesEncontradas | Where-Object { $_.SSID -eq $currSsid })) {
            $redesEncontradas += [PSCustomObject]@{
                SSID   = $currSsid
                Sinal  = $currSignal
                Banda  = $currBand
                Seg    = $currAuth
            }
        }
    }
}

# Se não pegou detalhado, faz fallback para scan simples
if ($redesEncontradas.Count -eq 0) {
    $scanSimples = netsh wlan show networks
    $matches = $scanSimples | Select-String "^\s*SSID\s*\d*\s*:\s*(.+)$"
    foreach ($m in $matches) {
        $nome = $m.Matches[0].Groups[1].Value.Trim()
        if ($nome -and !($redesEncontradas | Where-Object { $_.SSID -eq $nome })) {
            $redesEncontradas += [PSCustomObject]@{
                SSID   = $nome
                Sinal  = "OK"
                Banda  = "2.4G/5G"
                Seg    = "WPA2"
            }
        }
    }
}

Write-Host "`nRedes Wi-Fi encontradas:" -ForegroundColor Cyan
Write-Host "----------------------------------------------------------" -ForegroundColor DarkGray

if ($redesEncontradas.Count -eq 0) {
    Write-Host "Nenhuma rede visível encontrada pelo adaptador do PC." -ForegroundColor Yellow
} else {
    for ($i = 0; $i -lt $redesEncontradas.Count; $i++) {
        $r = $redesEncontradas[$i]
        $bandaAlerta = ""
        if ($r.Banda -match "5 GHz") {
            $bandaAlerta = " (Aviso: 5GHz - certifique-se que roteador tem 2.4GHz)"
        }
        Write-Host (" [{0}] {1,-26} | Sinal: {2,-4} | Banda: {3}{4}" -f ($i + 1), $r.SSID, $r.Sinal, $r.Banda, $bandaAlerta) -ForegroundColor White
    }
}

Write-Host " [0] Digitar o nome da rede manualmente" -ForegroundColor DarkGray
Write-Host "==========================================================" -ForegroundColor Cyan

$escolha = Read-Host "`nEscolha o número da rede desejada"
$ssidFinal = ""

if ($escolha -eq "0" -or [string]::IsNullOrWhiteSpace($escolha)) {
    $ssidFinal = Read-Host "Digite o nome da rede (SSID)"
} else {
    $idx = [int]$escolha - 1
    if ($idx -ge 0 -and $idx -lt $redesEncontradas.Count) {
        $ssidFinal = $redesEncontradas[$idx].SSID
    } else {
        $ssidFinal = Read-Host "Opção inválida. Digite o nome da rede (SSID)"
    }
}

$senhaFinal = Read-Host "Digite a senha para a rede '$ssidFinal'"

# 2. Gravar em config.h
$configPath = "C:\Users\Public\esp32lab\projects\05-web-server\src\config.h"
Write-Host "`n[1/3] Salvando configurações em config.h..." -ForegroundColor Cyan

$configConteudo = @"
#ifndef CONFIG_H
#define CONFIG_H

// Configuração atualizada via menu do terminal
#define WIFI_SSID     "$ssidFinal"
#define WIFI_PASS     "$senhaFinal"

#define AP_SSID       "ESP32-DrThiago"
#define AP_PASS       "12345678"

#define MDNS_HOST     "drthiago"
#define PINO_LED      2

#endif // CONFIG_H
"@

[System.IO.File]::WriteAllText($configPath, $configConteudo, [System.Text.Encoding]::UTF8)

# 3. Compilar e Gravar na placa
Write-Host "`n[2/3] Gravando na placa ESP32 (porta COM4)..." -ForegroundColor Cyan
$rootPath = "C:\Users\Public\esp32lab"
Set-Location -Path "$rootPath\projects\05-web-server"
& "$rootPath\pio.cmd" run -t upload

if ($LASTEXITCODE -ne 0) {
    Write-Host "`nERRO ao gravar na placa. Verifique se o monitor serial está aberto e feche com Ctrl+C." -ForegroundColor Red
    exit 1
}

# 4. Aguardar conexão e pegar IP
Write-Host "`n[3/3] Placa gravada! Conectando ao Wi-Fi '$ssidFinal'..." -ForegroundColor Green
Start-Sleep -Seconds 2

$ipDetectado = ""
try {
    $scriptPy = @"
import serial, time
try:
    s = serial.Serial('COM4', 115200, timeout=1)
    s.setDTR(False)
    s.setRTS(True)
    time.sleep(0.1)
    s.setRTS(False)
    inicio = time.time()
    while time.time() - inicio < 10:
        l = s.readline().decode('utf-8', errors='ignore').strip()
        if 'IP na rede local:' in l:
            print(l.split(':')[-1].strip())
            break
    s.close()
except Exception:
    pass
"@
    $ipDetectado = & "$rootPath\.venv\Scripts\python.exe" -c $scriptPy
} catch {}

if ($ipDetectado) {
    Write-Host "`n==========================================================" -ForegroundColor Green
    Write-Host " CONECTADO COM SUCESSO! 🚀" -ForegroundColor Yellow
    Write-Host " Rede: $ssidFinal" -ForegroundColor White
    Write-Host " Endereço IP Local: http://$ipDetectado" -ForegroundColor Cyan
    Write-Host "==========================================================" -ForegroundColor Green
    Write-Host ""
    $abrir = Read-Host "Deseja ligar o Cloudflare Tunnel agora para este IP? (S/N)"
    if ($abrir -match "^[sS]") {
        Write-Host "`nIniciando Cloudflare Tunnel... Copie o link abaixo para abrir no mundo:" -ForegroundColor Yellow
        & "$rootPath\tools\cloudflared.exe" tunnel --url "http://$ipDetectado"
    }
} else {
    Write-Host "`nA placa reiniciou. Abra o monitor serial para acompanhar:" -ForegroundColor Yellow
    Write-Host "..\..\pio.cmd run -t monitor" -ForegroundColor White
}
