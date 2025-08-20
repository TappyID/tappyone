# Teste da API /api/files para verificar se está funcionando
Write-Host "=== Teste da API /api/files ===" -ForegroundColor Green

# Testar uma URL específica que estava dando 404
$testUrl = "http://localhost:3000/api/files/user_ce065849-4fa7-4757-a2cb-5581cfec9225/false_5518997200106@c.us_3FD4EFA6C191F4F64CB4.jpeg"

Write-Host "Testando URL: $testUrl" -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri $testUrl -Method GET -UseBasicParsing
    Write-Host "✅ Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Content-Type: $($response.Headers['Content-Type'])" -ForegroundColor Cyan
    Write-Host "Content-Length: $($response.Headers['Content-Length'])" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Erro: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "Status Code: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
        Write-Host "Status Description: $($_.Exception.Response.StatusDescription)" -ForegroundColor Red
    }
}

Write-Host "`n=== Teste Concluído ===" -ForegroundColor Green
