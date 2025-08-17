# Script de teste para WAHA API
Write-Host "=== TESTE WAHA API ===" -ForegroundColor Green

$API_URL = "https://apiwhatsapp.vyzer.com.br/api"
$API_KEY = "atendia-waha-2024-secretkey"
$SESSION = "default"

Write-Host "`n1. Testando listar sessões..." -ForegroundColor Yellow
$headers = @{
    "X-Api-Key" = $API_KEY
    "Content-Type" = "application/json"
}

try {
    $response = Invoke-RestMethod -Uri "$API_URL/sessions" -Method GET -Headers $headers
    Write-Host "✅ Sessões encontradas:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 3
} catch {
    Write-Host "❌ Erro ao listar sessões: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n2. Testando status da sessão default..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$API_URL/sessions/$SESSION" -Method GET -Headers $headers
    Write-Host "✅ Status da sessão:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 3
} catch {
    Write-Host "❌ Erro ao verificar sessão: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n3. Testando endpoint de chats..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$API_URL/chats?session=$SESSION" -Method GET -Headers $headers
    Write-Host "✅ Chats encontrados:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 3
} catch {
    Write-Host "❌ Erro ao buscar chats: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Status Code: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
}

Write-Host "`n4. Testando URL incorreta (com /api duplicado)..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$API_URL/api/chats?session=$SESSION" -Method GET -Headers $headers
    Write-Host "✅ Resposta da URL incorreta:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 3
} catch {
    Write-Host "❌ Erro esperado com URL duplicada: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Status Code: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
}

Write-Host "`n=== FIM DOS TESTES ===" -ForegroundColor Green
