Add-Type -AssemblyName System.Drawing
$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$out = Join-Path $root "docs\play-store\assets"
New-Item -ItemType Directory -Force -Path $out | Out-Null

function New-Bitmap($width, $height) {
  $bitmap = New-Object System.Drawing.Bitmap $width, $height
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
  return @($bitmap, $graphics)
}

function Save-Png($bitmap, $graphics, $path) {
  $graphics.Dispose()
  $bitmap.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $bitmap.Dispose()
}

function Fill-Gradient($graphics, $rect, $start, $end) {
  $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush $rect, $start, $end, 0
  $graphics.FillRectangle($brush, $rect)
  $brush.Dispose()
}

function Draw-Text($graphics, $text, $fontName, $size, $style, $color, $x, $y) {
  $unit = [System.Drawing.GraphicsUnit]::Pixel
  $font = New-Object System.Drawing.Font -ArgumentList $fontName, $size, $style, $unit
  $brush = New-Object System.Drawing.SolidBrush $color
  $graphics.DrawString($text, $font, $brush, $x, $y)
  $brush.Dispose()
  $font.Dispose()
}

function Draw-RoundedRect($graphics, $x, $y, $w, $h, $radius, $color) {
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $path.AddArc($x, $y, $radius, $radius, 180, 90)
  $path.AddArc($x + $w - $radius, $y, $radius, $radius, 270, 90)
  $path.AddArc($x + $w - $radius, $y + $h - $radius, $radius, $radius, 0, 90)
  $path.AddArc($x, $y + $h - $radius, $radius, $radius, 90, 90)
  $path.CloseFigure()
  $brush = New-Object System.Drawing.SolidBrush $color
  $graphics.FillPath($brush, $path)
  $brush.Dispose()
  $path.Dispose()
}

function Draw-Crown($graphics, $x, $y, $scale) {
  $pen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(246, 184, 15)), (4 * $scale)
  $points = @(
    (New-Object System.Drawing.PointF ($x), ($y + 32 * $scale)),
    (New-Object System.Drawing.PointF ($x + 8 * $scale), ($y + 5 * $scale)),
    (New-Object System.Drawing.PointF ($x + 27 * $scale), ($y + 22 * $scale)),
    (New-Object System.Drawing.PointF ($x + 45 * $scale), ($y + 3 * $scale)),
    (New-Object System.Drawing.PointF ($x + 63 * $scale), ($y + 22 * $scale)),
    (New-Object System.Drawing.PointF ($x + 82 * $scale), ($y + 5 * $scale)),
    (New-Object System.Drawing.PointF ($x + 90 * $scale), ($y + 32 * $scale))
  )
  $graphics.DrawLines($pen, $points)
  $graphics.DrawLine($pen, $x + 5 * $scale, $y + 43 * $scale, $x + 85 * $scale, $y + 43 * $scale)
  $pen.Dispose()
}

$black = [System.Drawing.Color]::FromArgb(5, 8, 10)
$yellow = [System.Drawing.Color]::FromArgb(246, 184, 15)
$white = [System.Drawing.Color]::White
$muted = [System.Drawing.Color]::FromArgb(170, 174, 180)
$panel = [System.Drawing.Color]::FromArgb(13, 18, 21)

$pair = New-Bitmap 1024 500
$bmp = $pair[0]
$g = $pair[1]
Fill-Gradient $g (New-Object System.Drawing.Rectangle 0,0,1024,500) $black ([System.Drawing.Color]::FromArgb(26, 17, 4))
Draw-Crown $g 72 70 0.9
Draw-Text $g "Queens" "Arial" 54 ([System.Drawing.FontStyle]::Bold) $white 170 70
Draw-Text $g "Arena" "Arial" 54 ([System.Drawing.FontStyle]::Bold) $yellow 382 70
Draw-Text $g "Resultados e calendário" "Arial" 48 ([System.Drawing.FontStyle]::Bold) $white 72 190
Draw-Text $g "de desporto feminino" "Arial" 48 ([System.Drawing.FontStyle]::Bold) $yellow 72 250
Draw-Text $g "Jogos, equipas e dados reais do desporto feminino." "Arial" 25 ([System.Drawing.FontStyle]::Regular) $muted 76 335
Draw-RoundedRect $g 760 120 180 260 28 ([System.Drawing.Color]::FromArgb(18, 22, 26))
Draw-RoundedRect $g 785 160 130 38 14 $yellow
Draw-Text $g "EM DIRETO" "Arial" 15 ([System.Drawing.FontStyle]::Bold) $black 800 170
Draw-Text $g "NWSL" "Arial" 30 ([System.Drawing.FontStyle]::Bold) $white 796 230
Draw-Text $g "UWCL" "Arial" 30 ([System.Drawing.FontStyle]::Bold) $white 796 280
Draw-Text $g "EHF" "Arial" 30 ([System.Drawing.FontStyle]::Bold) $white 796 330
Save-Png $bmp $g (Join-Path $out "feature-graphic-1024x500.png")

$pair = New-Bitmap 1080 1920
$bmp = $pair[0]
$g = $pair[1]
Fill-Gradient $g (New-Object System.Drawing.Rectangle 0,0,1080,1920) $black ([System.Drawing.Color]::FromArgb(15, 9, 2))
Draw-Crown $g 80 90 1.1
Draw-Text $g "Queens" "Arial" 58 ([System.Drawing.FontStyle]::Bold) $white 190 88
Draw-Text $g "Arena" "Arial" 58 ([System.Drawing.FontStyle]::Bold) $yellow 420 88
Draw-Text $g "The game belongs to" "Arial" 78 ([System.Drawing.FontStyle]::Bold) $white 80 300
Draw-Text $g "queens." "Arial" 96 ([System.Drawing.FontStyle]::Bold) $yellow 80 405
Draw-RoundedRect $g 80 620 860 170 24 $panel
Draw-Text $g "Próximo jogo" "Arial" 28 ([System.Drawing.FontStyle]::Bold) $yellow 115 650
Draw-Text $g "Brest Bretagne vs Gyor Audi ETO KC" "Arial" 36 ([System.Drawing.FontStyle]::Bold) $white 115 700
Draw-Text $g "EHF Champions League Women" "Arial" 25 ([System.Drawing.FontStyle]::Regular) $muted 115 750
Draw-RoundedRect $g 80 860 860 520 24 $panel
Draw-Text $g "Dados reais" "Arial" 44 ([System.Drawing.FontStyle]::Bold) $white 115 900
Draw-Text $g "NWSL" "Arial" 40 ([System.Drawing.FontStyle]::Bold) $yellow 115 1010
Draw-Text $g "UEFA Women's Champions League" "Arial" 34 ([System.Drawing.FontStyle]::Bold) $white 115 1090
Draw-Text $g "EHF Champions League Women" "Arial" 34 ([System.Drawing.FontStyle]::Bold) $white 115 1170
Draw-Text $g "QueensArena Data API" "Arial" 30 ([System.Drawing.FontStyle]::Regular) $muted 115 1290
Save-Png $bmp $g (Join-Path $out "phone-screenshot-1.png")

$pair = New-Bitmap 1080 1920
$bmp = $pair[0]
$g = $pair[1]
Fill-Gradient $g (New-Object System.Drawing.Rectangle 0,0,1080,1920) $black ([System.Drawing.Color]::FromArgb(9, 11, 13))
Draw-Crown $g 80 90 1.1
Draw-Text $g "Competições" "Arial" 68 ([System.Drawing.FontStyle]::Bold) $white 80 240
Draw-Text $g "acompanhadas" "Arial" 68 ([System.Drawing.FontStyle]::Bold) $yellow 80 330
Draw-RoundedRect $g 80 520 860 190 24 $panel
Draw-Text $g "NWSL" "Arial" 46 ([System.Drawing.FontStyle]::Bold) $white 120 560
Draw-Text $g "EUA - Futebol feminino" "Arial" 30 ([System.Drawing.FontStyle]::Regular) $muted 120 625
Draw-RoundedRect $g 80 760 860 190 24 $panel
Draw-Text $g "UEFA Women's Champions League" "Arial" 40 ([System.Drawing.FontStyle]::Bold) $white 120 800
Draw-Text $g "Europa - Futebol feminino" "Arial" 30 ([System.Drawing.FontStyle]::Regular) $muted 120 865
Draw-RoundedRect $g 80 1000 860 190 24 $panel
Draw-Text $g "EHF Champions League Women" "Arial" 40 ([System.Drawing.FontStyle]::Bold) $white 120 1040
Draw-Text $g "Europa - Andebol feminino" "Arial" 30 ([System.Drawing.FontStyle]::Regular) $muted 120 1105
Draw-RoundedRect $g 80 1320 860 120 24 $yellow
Draw-Text $g "Ver jogos e resultados" "Arial" 38 ([System.Drawing.FontStyle]::Bold) $black 220 1354
Save-Png $bmp $g (Join-Path $out "phone-screenshot-2.png")

Write-Host "Generated Play Store assets in $out"
