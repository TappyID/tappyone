# Teste simples de mídia
$BACKEND_URL = "http://localhost:8081"

# Login
$loginData = @{
    email = "admin@tappyone.com"
    senha = "admin123"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "$BACKEND_URL/api/auth/login" -Method POST -Body $loginData -ContentType "application/json"
$token = $loginResponse.token

$headers = @{
    "Authorization" = "Bearer $token"
}

# Testar mídia
Write-Host "Testando endpoint de mídia..." -ForegroundColor Yellow
try {
    $mediaUrl = "$BACKEND_URL/api/whatsapp/media/true_5518997200106@c.us_3AE377CA93D6E9FBCA36"
    $mediaResponse = Invoke-WebRequest -Uri $mediaUrl -Headers $headers
    Write-Host "✅ Status: $($mediaResponse.StatusCode)" -ForegroundColor Green
    Write-Host "Content-Type: $($mediaResponse.Headers.'Content-Type')" -ForegroundColor Cyan
    Write-Host "Content-Length: $($mediaResponse.Headers.'Content-Length')" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Erro: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Response: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
}
