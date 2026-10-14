# Inicia o Cloudflare Tunnel para a Galeria da Gessy
[CmdletBinding()]
param (
    [string]$IpEsp32 = ""
)

$ErrorActionPreference = "Continue"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  INICIANDO TUNEL PUBLICO - GALERIA DA GESSY              " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# Encerra qualquer instancia anterior do cloudflared que possa estar travada em outro IP
Get-Process | Where-Object { $_.ProcessName -match "cloudflared" } | Stop-Process -Force -ErrorAction SilentlyContinue

# Detecta automaticamente o IP do ESP32 se nao foi informado
$ipAlvo = $IpEsp32

if (-not $ipAlvo) {
    Write-Host "[BUSCA] Procurando ESP32 na rede local (http://gessy.local)..." -ForegroundColor Gray
    try {
        $resp = Invoke-RestMethod -Uri "http://gessy.local/api/status" -TimeoutSec 3 -ErrorAction Stop
        if ($resp -and $resp.ip) {
            $ipAlvo = $resp.ip
            Write-Host "[OK] ESP32 localizado automaticamente via mDNS: $ipAlvo" -ForegroundColor Green
        }
    } catch {
        # Fallback para o IP padrao recente
        $ipAlvo = "192.168.137.74"
    }
}

# Testa conectividade com o IP selecionado
Write-Host "[TESTE] Verificando conexao com http://$ipAlvo ..." -ForegroundColor Gray
try {
    $resp = Invoke-RestMethod -Uri "http://$ipAlvo/api/status" -TimeoutSec 3 -ErrorAction Stop
    Write-Host "[OK] ESP32 respondeu com sucesso! (Uptime: $($resp.uptime)s, Sinal: $($resp.wifi_rssi) dBm)" -ForegroundColor Green
} catch {
    Write-Host "[AVISO] Nao foi possivel confirmar o status em http://$ipAlvo. Tentando iniciar mesmo assim..." -ForegroundColor Yellow
}

# Impede o Windows de entrar em modo de suspensao enquanto o tunel estiver ativo
Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;
public class WindowsPower {
    [DllImport("kernel32.dll", CharSet = CharSet.Auto, SetLastError = true)]
    public static extern uint SetThreadExecutionState(uint esFlags);
    public const uint ES_CONTINUOUS = 0x80000000;
    public const uint ES_SYSTEM_REQUIRED = 0x00000001;
}
"@
[WindowsPower]::SetThreadExecutionState([WindowsPower]::ES_CONTINUOUS -bor [WindowsPower]::ES_SYSTEM_REQUIRED) | Out-Null
Write-Host "[OK] Modo Nao-Suspender ativado no Windows enquanto este terminal estiver aberto." -ForegroundColor Green

$cloudflared = "C:\Users\Public\esp32lab\tools\cloudflared.exe"
if (-not (Test-Path $cloudflared)) {
    $cloudflared = Join-Path $PSScriptRoot "cloudflared.exe"
}
if (-not (Test-Path $cloudflared)) {
    Write-Host "[ERRO] cloudflared.exe nao encontrado!" -ForegroundColor Red
    exit 1
}

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " Conectando tunel ao ESP32: http://$ipAlvo" -ForegroundColor Yellow
Write-Host " Guarde o link https://...trycloudflare.com que vai aparecer abaixo!" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""

& $cloudflared tunnel --url "http://$ipAlvo"
