$port = 8080
$url = "http://localhost:$port/"
$root = $PSScriptRoot

Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "  DANG CHAY MAY CHU: DEP NAM TUYET NHUNG" -ForegroundColor Yellow
Write-Host "  Dia chi: $url" -ForegroundColor Green
Write-Host "  (Tranh cong 3000 va 3888)" -ForegroundColor DarkGray
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "Nhan Ctrl + C de dung may chu.`n" -ForegroundColor DarkYellow

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($url)

try {
    $listener.Start()
    Start-Process $url
} catch {
    Write-Host "Loi khoi dong cong $port: $_" -ForegroundColor Red
    Write-Host "Dang mo truc tiep file index.html..." -ForegroundColor Yellow
    Start-Process (Join-Path $root "index.html")
    exit
}

$mimeTypes = @{
    ".html" = "text/html; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".webp" = "image/webp"
    ".svg"  = "image/svg+xml"
    ".ico"  = "image/x-icon"
}

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $path = $request.Url.LocalPath
        if ($path -eq "/" -or [string]::IsNullOrWhiteSpace($path)) {
            $path = "/index.html"
        }

        $filePath = Join-Path $root ($path.TrimStart("/").Replace("/", [System.IO.Path]::DirectorySeparatorChar))

        if (Test-Path $filePath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $contentType = if ($mimeTypes.ContainsKey($ext)) { $mimeTypes[$ext] } else { "application/octet-stream" }
            
            $response.ContentType = $contentType
            $response.Headers.Add("Cache-Control", "no-cache")
            
            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $response.StatusCode = 404
            $msg = [System.Text.Encoding]::UTF8.GetBytes("<h2>404 - Khong tim thay trang</h2>")
            $response.ContentLength64 = $msg.Length
            $response.OutputStream.Write($msg, 0, $msg.Length)
        }
        $response.OutputStream.Close()
    } catch {
        # Bo qua loi khi client dong ket noi dot ngot
    }
}
