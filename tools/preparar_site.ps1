<#
.SYNOPSIS
    Baixa os arquivos restantes e otimiza todas as imagens em JPG leve para a Flash do ESP32.
#>

[CmdletBinding()]
param (
    [string]$Destino = "C:\Users\Public\esp32lab\projects\05-web-server\data"
)

$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " Finalizando e Otimizando Fotos para Flash (LittleFS)     " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$baseUrl = "https://raw.githubusercontent.com/israelmdc/israelmdc.github.io/main"
$dirImg  = Join-Path $Destino "assets\img"
$dirImg2 = Join-Path $Destino "assets\img2"

$jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
$encParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
$encParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]72)

function Converter-Para-Jpg {
    param (
        [string]$ArquivoPng,
        [string]$ArquivoJpg,
        [int]$MaxLargura = 600
    )

    $bmp = [System.Drawing.Image]::FromFile($ArquivoPng)
    $origW = $bmp.Width
    $origH = $bmp.Height

    if ($origW -gt $MaxLargura) {
        $ratio = [double]$MaxLargura / [double]$origW
        $newW = $MaxLargura
        $newH = [int]($origH * $ratio)
    } else {
        $newW = $origW
        $newH = $origH
    }

    $novoBmp = New-Object System.Drawing.Bitmap($newW, $newH)
    $g = [System.Drawing.Graphics]::FromImage($novoBmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.Clear([System.Drawing.Color]::White)
    $g.DrawImage($bmp, 0, 0, $newW, $newH)

    $novoBmp.Save($ArquivoJpg, $jpegCodec, $encParams)

    $g.Dispose()
    $novoBmp.Dispose()
    $bmp.Dispose()
}

# 1. Baixar as imagens restantes (8, 9, 10) se ainda não existirem
$restantes = @("ImgID8", "ImgID9", "ImgID10")
foreach ($id in $restantes) {
    $nomePng = "SITE THIAGO PEIXOTO_$id.png"
    $caminhoPng = Join-Path $dirImg $nomePng
    $nomeJpg = "SITE THIAGO PEIXOTO_$id.jpg"
    $caminhoJpg = Join-Path $dirImg $nomeJpg

    if (!(Test-Path $caminhoJpg) -and !(Test-Path $caminhoPng)) {
        Write-Host "Baixando: $nomePng..." -NoNewline
        $url = "$baseUrl/assets/img/SITE%20THIAGO%20PEIXOTO_$id.png"
        $wc = New-Object System.Net.WebClient
        try {
            $bytes = $wc.DownloadData($url)
            [System.IO.File]::WriteAllBytes($caminhoPng, $bytes)
            Write-Host " Baixado." -ForegroundColor Green
        } finally {
            $wc.Dispose()
        }
    }
}

# 2. Converter todas as fotos pesadas PNG para JPG
Write-Host "`nConvertendo fotos para JPG leve (~50 KB cada)..." -ForegroundColor Yellow

# Fotos em assets/img
Get-ChildItem -Path $dirImg -Filter "*.png" | ForEach-Object {
    $pngPath = $_.FullName
    $jpgPath = [System.IO.Path]::ChangeExtension($pngPath, ".jpg")
    Write-Host "  Otimizando: $($_.Name) -> JPG..." -NoNewline
    Converter-Para-Jpg -ArquivoPng $pngPath -ArquivoJpg $jpgPath -MaxLargura 580
    Remove-Item $pngPath -Force
    $tam = [math]::Round((Get-Item $jpgPath).Length / 1024, 1)
    Write-Host " OK (${tam} KB)" -ForegroundColor Green
}

# Fotos em assets/img2 (exceto o logo com transparência)
Get-ChildItem -Path $dirImg2 -Filter "*.png" | ForEach-Object {
    if ($_.Name -like "*LOGO*") {
        Write-Host "  Preservando transparência do logotipo: $($_.Name)" -ForegroundColor Cyan
    } else {
        $pngPath = $_.FullName
        $jpgPath = [System.IO.Path]::ChangeExtension($pngPath, ".jpg")
        Write-Host "  Otimizando: $($_.Name) -> JPG..." -NoNewline
        Converter-Para-Jpg -ArquivoPng $pngPath -ArquivoJpg $jpgPath -MaxLargura 640
        Remove-Item $pngPath -Force
        $tam = [math]::Round((Get-Item $jpgPath).Length / 1024, 1)
        Write-Host " OK (${tam} KB)" -ForegroundColor Green
    }
}

# 3. Baixar index.html e ajustar caminhos para .jpg
Write-Host "`nBaixando e atualizando index.html e styles.css..." -ForegroundColor Yellow
$indexPath = Join-Path $Destino "index.html"
Invoke-WebRequest -Uri "$baseUrl/index.html" -OutFile $indexPath

$html = [System.IO.File]::ReadAllText($indexPath, [System.Text.Encoding]::UTF8)

# Substituir extensões das fotos para .jpg no HTML (mantendo o logo como .png)
$html = $html -replace 'SITE THIAGO PEIXOTO IMAGEM 1\.png', 'SITE THIAGO PEIXOTO IMAGEM 1.jpg'
$html = $html -replace 'SITE THIAGO PEIXOTO IMAGEM 2\.png', 'SITE THIAGO PEIXOTO IMAGEM 2.jpg'
$html = $html -replace 'SITE THIAGO PEIXOTO IMAGEM 3\.png', 'SITE THIAGO PEIXOTO IMAGEM 3.jpg'
for ($i = 4; $i -le 10; $i++) {
    $html = $html -replace "SITE THIAGO PEIXOTO_ImgID$i\.png", "SITE THIAGO PEIXOTO_ImgID$i.jpg"
}

# Atualizar styles.css para usar a imagem 1 em .jpg
$stylesPath = Join-Path $Destino "styles.css"
if (Test-Path $stylesPath) {
    $css = [System.IO.File]::ReadAllText($stylesPath, [System.Text.Encoding]::UTF8)
    $css = $css -replace 'SITE THIAGO PEIXOTO IMAGEM 1\.png', 'SITE THIAGO PEIXOTO IMAGEM 1.jpg'
    [System.IO.File]::WriteAllText($stylesPath, $css, [System.Text.Encoding]::UTF8)
}

# Injetar o Badge de controle do ESP32 antes de </body>
$badgeHtml = @"

  <!-- ============ BARRA DE STATUS ESP32 ============ -->
  <aside id="esp32-badge" style="position: fixed; bottom: 12px; right: 12px; background: rgba(18, 24, 38, 0.95); color: #fff; border: 1px solid #ff5252; padding: 10px 16px; border-radius: 8px; font-family: 'Mulish', sans-serif; font-size: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.4); z-index: 99999; backdrop-filter: blur(6px); display: flex; align-items: center; gap: 14px;">
    <div>
      <div style="font-weight: 800; color: #ffca28; display: flex; align-items: center; gap: 6px;">
        <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#00e676;"></span>
        ESP32 DevKit v1 · Online
      </div>
      <div style="color: #bbb; font-size: 11px; margin-top: 2px;">
        IP: <span id="esp32-ip" style="color:#fff; font-weight:600;">--</span> · Uptime: <span id="esp32-uptime">0s</span>
      </div>
    </div>
    <div style="border-left: 1px solid #444; padding-left: 12px; display: flex; align-items: center; gap: 8px;">
      <span>LED GPIO 2: <strong id="esp32-led-status" style="color: #888;">--</strong></span>
      <button id="esp32-btn-led" style="background: #ff5252; color: #fff; border: none; padding: 5px 10px; border-radius: 4px; font-size: 11px; font-weight: 700; cursor: pointer;">Alternar</button>
    </div>
  </aside>
</body>
"@

$html = $html -replace '</body>', $badgeHtml
[System.IO.File]::WriteAllText($indexPath, $html, [System.Text.Encoding]::UTF8)

# Resumo final
$totalBytes = (Get-ChildItem -Path $Destino -Recurse -File | Measure-Object -Property Length -Sum).Sum
$totalKB = [math]::Round($totalBytes / 1024, 1)
$totalMB = [math]::Round($totalBytes / (1024 * 1024), 2)

Write-Host "`n==========================================================" -ForegroundColor Green
Write-Host " SUCESSO COMPLETO!" -ForegroundColor Green
Write-Host " Tamanho total da pasta data/: $totalKB KB ($totalMB MB)" -ForegroundColor Green
Write-Host " Limite da partição LittleFS: 1966 KB (1.92 MB)" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
