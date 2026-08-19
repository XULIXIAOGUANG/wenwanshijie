# 文玩记录本 PWA 图标生成脚本
# 纯本地 System.Drawing 绘制，零外部依赖，可重复运行
# 图案：墨绿圆角底(#5C8F6E) + 白色串珠环 + 中心主珠
Add-Type -AssemblyName System.Drawing

function New-Icon {
  param([int]$size, [string]$path)
  $bmp = New-Object System.Drawing.Bitmap($size, $size)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.Clear([System.Drawing.Color]::Transparent)

  # 圆角矩形背景
  $radius = $size * 0.22
  $bg = New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml('#5C8F6E'))
  $d = $radius * 2
  $bgPath = New-Object System.Drawing.Drawing2D.GraphicsPath
  $bgPath.AddArc(0, 0, $d, $d, 180, 90)
  $bgPath.AddArc($size - $d, 0, $d, $d, 270, 90)
  $bgPath.AddArc($size - $d, $size - $d, $d, $d, 0, 90)
  $bgPath.AddArc(0, $size - $d, $d, $d, 90, 90)
  $bgPath.CloseFigure()
  $g.FillPath($bg, $bgPath)

  # 白色串珠环（8 颗小珠均匀环绕）
  $white = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::White)
  $beadR = $size * 0.075
  $ringR = $size * 0.26
  $cx = $size / 2
  $cy = $size / 2
  for ($i = 0; $i -lt 8; $i++) {
    $ang = 2 * [Math]::PI * $i / 8 - [Math]::PI / 2
    $x = $cx + $ringR * [Math]::Cos($ang) - $beadR
    $y = $cy + $ringR * [Math]::Sin($ang) - $beadR
    $g.FillEllipse($white, $x, $y, $beadR * 2, $beadR * 2)
  }

  # 中心主珠
  $mainR = $size * 0.11
  $g.FillEllipse($white, $cx - $mainR, $cy - $mainR, $mainR * 2, $mainR * 2)

  $g.Dispose()
  $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
  Write-Host ("generated: {0} ({1}x{1})" -f $path, $size)
}

$outDir = $PSScriptRoot
New-Icon 192 (Join-Path $outDir "icon-192.png")
New-Icon 512 (Join-Path $outDir "icon-512.png")
New-Icon 180 (Join-Path $outDir "apple-touch-icon.png")
