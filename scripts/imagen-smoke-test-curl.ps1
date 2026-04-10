# Imagen 4 疎通確認 (curl.exe version)
# Usage: powershell -ExecutionPolicy Bypass -File .\scripts\imagen-smoke-test-curl.ps1

$ErrorActionPreference = "Stop"

Write-Host "[1/5] Getting access token (ADC)..."
$token = & gcloud auth application-default print-access-token
if (-not $token) {
    Write-Error "Failed to get ADC access token."
    exit 1
}
Write-Host "  Token length: $($token.Length)"

Write-Host "[2/5] Writing request body to temp file..."
$bodyJson = @"
{
  "instances": [
    {
      "prompt": "a cute chibi creature mascot in Pokemon-inspired style, pastel colors, claymorphism aesthetic, rounded puffy shapes, friendly big eyes, front-facing full body, plain white background, high quality digital illustration"
    }
  ],
  "parameters": {
    "sampleCount": 1,
    "aspectRatio": "1:1"
  }
}
"@

$bodyPath = "$env:TEMP\imagen_body.json"
$responsePath = "$env:TEMP\imagen_response.json"
Set-Content -Path $bodyPath -Value $bodyJson -Encoding UTF8
Write-Host "  Body written to $bodyPath"

Write-Host "[3/5] Calling Imagen 4 API via curl.exe..."
$uri = "https://asia-northeast1-aiplatform.googleapis.com/v1/projects/ap-hp-bq-test/locations/asia-northeast1/publishers/google/models/imagen-4.0-generate-001:predict"

# Use curl.exe (not the PowerShell alias) for raw HTTP
& curl.exe -s -S `
    -X POST $uri `
    -H "Authorization: Bearer $token" `
    -H "X-Goog-User-Project: ap-hp-bq-test" `
    -H "Content-Type: application/json" `
    --data-binary "@$bodyPath" `
    -o $responsePath `
    -w "HTTP_STATUS:%{http_code}`n"

Write-Host "[4/5] Inspecting response..."
if (-not (Test-Path $responsePath)) {
    Write-Error "No response file created."
    exit 1
}

$responseSize = (Get-Item $responsePath).Length
Write-Host "  Response size: $responseSize bytes"

# Show first 500 chars of response for diagnosis
$responsePreview = Get-Content -Path $responsePath -Raw -Encoding UTF8
$previewLength = [Math]::Min(500, $responsePreview.Length)
Write-Host "  Response preview (first $previewLength chars):"
Write-Host "  ---"
Write-Host $responsePreview.Substring(0, $previewLength)
Write-Host "  ---"

Write-Host "[5/5] Attempting to parse and save image..."
try {
    $response = Get-Content -Path $responsePath -Raw | ConvertFrom-Json
    $base64 = $response.predictions[0].bytesBase64Encoded
    if ($base64) {
        $outPath = "$env:USERPROFILE\Desktop\monster_test.png"
        [System.IO.File]::WriteAllBytes($outPath, [Convert]::FromBase64String($base64))
        Write-Host ""
        Write-Host "SUCCESS: Saved to $outPath" -ForegroundColor Green
    } else {
        Write-Host "Response JSON did not contain bytesBase64Encoded." -ForegroundColor Yellow
    }
} catch {
    Write-Host "Failed to parse response as JSON (likely HTML error page): $_" -ForegroundColor Yellow
}
