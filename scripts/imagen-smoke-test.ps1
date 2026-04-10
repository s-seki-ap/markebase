# Imagen 4 疎通確認スクリプト
# Usage: powershell -ExecutionPolicy Bypass -File .\scripts\imagen-smoke-test.ps1

$ErrorActionPreference = "Stop"

Write-Host "[1/4] Getting access token (ADC)..."
$token = & gcloud auth application-default print-access-token
if (-not $token) {
    Write-Error "Failed to get ADC access token. Run 'gcloud auth application-default login' first."
    exit 1
}
Write-Host "  Token obtained (length: $($token.Length), prefix: $($token.Substring(0, [Math]::Min(20, $token.Length)))...)"

Write-Host "[2/4] Building request body..."
$body = @{
    instances = @(
        @{
            prompt = "a cute chibi creature mascot in Pokemon-inspired style, pastel colors, claymorphism aesthetic, rounded puffy shapes, friendly big eyes, front-facing full body, plain white background, high quality digital illustration"
        }
    )
    parameters = @{
        sampleCount = 1
        aspectRatio = "1:1"
    }
} | ConvertTo-Json -Depth 5

Write-Host "[3/4] Calling Imagen 4 API..."
$uri = "https://asia-northeast1-aiplatform.googleapis.com/v1/projects/ap-hp-bq-test/locations/asia-northeast1/publishers/google/models/imagen-4.0-generate-001:predict"
$headers = @{
    "Authorization" = "Bearer $token"
    "X-Goog-User-Project" = "ap-hp-bq-test"
}

try {
    $response = Invoke-RestMethod -Uri $uri -Method Post -Headers $headers -ContentType "application/json" -Body $body
} catch {
    Write-Error "API call failed: $_"
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $errorBody = $reader.ReadToEnd()
        Write-Host "Error response body:"
        Write-Host $errorBody
    }
    exit 1
}

Write-Host "[4/4] Saving image..."
$base64 = $response.predictions[0].bytesBase64Encoded
if (-not $base64) {
    Write-Error "No image returned. Response: $($response | ConvertTo-Json -Depth 3)"
    exit 1
}

$outPath = "$env:USERPROFILE\Desktop\monster_test.png"
[System.IO.File]::WriteAllBytes($outPath, [Convert]::FromBase64String($base64))
Write-Host ""
Write-Host "SUCCESS: Saved to $outPath" -ForegroundColor Green
