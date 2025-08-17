# Teste rápido do backend corrigido
Write-Host "=== TESTE BACKEND CORRIGIDO ===" -ForegroundColor Green

$BACKEND_URL = "http://localhost:8080"

# Login primeiro
$loginData = @{
    email = "admin@tappyone.com"
    password = "123456"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$BACKEND_URL/api/auth/login" -Method POST -Body $loginData -ContentType "application/json"
    $token = $loginResponse.token
    Write-Host "✅ Login OK - Token obtido" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro no login: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

Write-Host "`n1. Testando /api/whatsapp/chats..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BACKEND_URL/api/whatsapp/chats" -Method GET -Headers $headers
    Write-Host "✅ Chats funcionando!" -ForegroundColor Green
    Write-Host "Quantidade de chats: $($response.Count)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Erro nos chats: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n2. Testando /api/whatsapp/contacts..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BACKEND_URL/api/whatsapp/contacts" -Method GET -Headers $headers
    Write-Host "✅ Contatos funcionando!" -ForegroundColor Green
    Write-Host "Quantidade de contatos: $($response.Count)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Erro nos contatos: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== FIM DOS TESTES ===" -ForegroundColor Green
