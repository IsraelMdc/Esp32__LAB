<#
.SYNOPSIS
    Otimiza as fotos reais para a particao LittleFS do ESP32 e valida o orcamento de memoria.
.PARAMETER Origem
    Pasta no seu computador onde estao as fotos originais (JPG ou PNG).
#>

[CmdletBinding()]
param (
    [string]$Origem = "",
    [string]$Destino = "C:\Users\Public\esp32lab\projects\06-presente-gessy\data"
)

$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  PREPARADOR DE FOTOS E ORCAMENTO -- PRESENTE GESSY       " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$dirFotos = Join-Path $Destino "fotos"
if (-not (Test-Path $dirFotos)) {
    New-Item -ItemType Directory -Force $dirFotos | Out-Null
}

$limiteBytes = 2752512 # 2.625 MB da particao LittleFS

if ($Origem -and (Test-Path $Origem)) {
    Write-Host "[1/3] Processando fotos de: $Origem" -ForegroundColor Yellow

    $arquivos = Get-ChildItem -Path $Origem -Include *.jpg, *.jpeg, *.png -File
    if ($arquivos.Count -eq 0) {
        Write-Warning "Nenhuma foto JPG ou PNG encontrada na pasta informada."
    } else {
        $jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
        $encParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
        $encParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]74)

        $idx = 1
        foreach ($arq in $arquivos) {
            $num = $idx.ToString("00")
            $destFoto = Join-Path $dirFotos "$num.jpg"

            $bmp = [System.Drawing.Image]::FromFile($arq.FullName)
            $w = $bmp.Width
            $h = $bmp.Height
            $maxDim = 1024

            if ($w -gt $maxDim -or $h -gt $maxDim) {
                if ($w -gt $h) {
                    $nw = $maxDim
                    $nh = [int]($h * ($maxDim / [double]$w))
                } else {
                    $nh = $maxDim
                    $nw = [int]($w * ($maxDim / [double]$h))
                }
            } else {
                $nw = $w
                $nh = $h
            }

            $bmpReduzido = New-Object System.Drawing.Bitmap($nw, $nh)
            $g = [System.Drawing.Graphics]::FromImage($bmpReduzido)
            $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
            $g.DrawImage($bmp, 0, 0, $nw, $nh)

            $bmpReduzido.Save($destFoto, $jpegCodec, $encParams)

            $g.Dispose()
            $bmpReduzido.Dispose()
            $bmp.Dispose()

            $tam = [math]::Round(((Get-Item $destFoto).Length / 1KB), 1)
            Write-Host " -> $num.jpg salvo ($tam KB)" -ForegroundColor Green
            $idx++
        }
    }
} else {
    Write-Host "[1/3] Nenhuma pasta de fotos especificada (-Origem). Mantendo fotos existentes." -ForegroundColor Gray
}

# Verificacao do orcamento total de memoria
Write-Host "`n[2/3] Calculando orcamento total da pasta data/..." -ForegroundColor Yellow
$arquivosData = Get-ChildItem -Path $Destino -Recurse -File
$totalBytes = ($arquivosData | Measure-Object -Property Length -Sum).Sum
$totalMB = [math]::Round($totalBytes / 1MB, 2)
$limiteMB = [math]::Round($limiteBytes / 1MB, 2)
$porcentagem = [math]::Round(($totalBytes / $limiteBytes) * 100, 1)

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " RESUMO DO ESPACO NO LITTLEFS:" -ForegroundColor White
$corStatus = if ($totalBytes -le $limiteBytes) { "Green" } else { "Red" }
Write-Host " Total utilizado: $totalMB MB de $limiteMB MB ($porcentagem por cento)" -ForegroundColor $corStatus

if ($totalBytes -gt $limiteBytes) {
    Write-Host "`n[ALERTA] A pasta data/ ultrapassou o tamanho da particao LittleFS!" -ForegroundColor Red
    Write-Host "Remova algumas fotos ou reduza o tamanho do arquivo de audio." -ForegroundColor Red
} else {
    $livreMB = [math]::Round(($limiteBytes - $totalBytes) / 1MB, 2)
    Write-Host " Espaco livre restante: $livreMB MB" -ForegroundColor Green
    Write-Host "`n[3/3] Tudo pronto! Para gravar na placa fisica, rode:" -ForegroundColor Cyan
    Write-Host "  ..\..\pio.cmd run -t uploadfs" -ForegroundColor White
}
Write-Host "==========================================================" -ForegroundColor Cyan

