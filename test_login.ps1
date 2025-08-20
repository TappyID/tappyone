# Teste de login simples
Write-Host "Testando login..." -ForegroundColor Yellow

$body = @{
    email = "admin@tappyone.com"
    senha = "admin123"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8081/api/auth/login" -Method POST -Body $body -ContentType "application/json"
    Write-Host "✅ Login OK!" -ForegroundColor Green
    Write-Host "Token: $($response.token.Substring(0,20))..." -ForegroundColor Cyan
    
    # Agora testar mídia
    $headers = @{
        "Authorization" = "Bearer $($response.token)"
    }
    
    Write-Host "`nTestando mídia..." -ForegroundColor Yellow
    $mediaResponse = Invoke-WebRequest -Uri "http://localhost:8081/api/whatsapp/media/true_5518997200106@c.us_3AE377CA93D6E9FBCA36" -Headers $headers
    Write-Host "✅ Mídia Status: $($mediaResponse.StatusCode)" -ForegroundColor Green
    Write-Host "Content-Type: $($mediaResponse.Headers.'Content-Type')" -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ Erro: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "Status Code: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    }
}
