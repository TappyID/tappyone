# Teste dos endpoints corretos da WAHA API
Write-Host "=== TESTE ENDPOINTS WAHA ===" -ForegroundColor Green

$API_URL = "https://apiwhatsapp.vyzer.com.br/api"
$API_KEY = "atendia-waha-2024-secretkey"
$SESSION = "user_7f9ffbbd-b4d2-4516-baa1-d5641c6a90d1"  # Sessão que está WORKING

$headers = @{
    "X-Api-Key" = $API_KEY
    "Content-Type" = "application/json"
}

Write-Host "`n1. Testando /api/{session}/chats..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$API_URL/$SESSION/chats" -Method GET -Headers $headers
    Write-Host "✅ Chats encontrados:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 3
} catch {
    Write-Host "❌ Erro: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n2. Testando /api/{session}/messages..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$API_URL/$SESSION/messages" -Method GET -Headers $headers
    Write-Host "✅ Mensagens encontradas:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 2
} catch {
    Write-Host "❌ Erro: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n3. Testando /api/{session}/contacts..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$API_URL/$SESSION/contacts" -Method GET -Headers $headers
    Write-Host "✅ Contatos encontrados:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 2
} catch {
    Write-Host "❌ Erro: $($_.Exception.Message)" -ForegroundColor Red
}

# Testando foto de perfil com endpoint correto da WAHA
Write-Host "`n4. Testando fotos de perfil com endpoint correto..." -ForegroundColor Yellow

# IDs dos chats que vimos no resultado anterior
$chatIds = @("554396532909@c.us", "5518997974883@c.us", "5518997200106@c.us")

foreach ($chatId in $chatIds) {
    Write-Host "`nTestando foto para: $chatId" -ForegroundColor Cyan
    
    # Endpoint correto da WAHA: /api/{session}/chats/{chatId}/picture
    try {
        $pictureResponse = Invoke-RestMethod -Uri "$API_URL/$SESSION/chats/$chatId/picture" -Method GET -Headers $headers
        Write-Host "✅ Foto encontrada via /chats/picture:" -ForegroundColor Green
        $pictureResponse | ConvertTo-Json -Depth 2
    } catch {
        Write-Host "❌ Erro em /chats/picture: $($_.Exception.Message)" -ForegroundColor Red
        
        # Tentar com parâmetro refresh
        try {
            $refreshPictureResponse = Invoke-RestMethod -Uri "$API_URL/$SESSION/chats/$chatId/picture?refresh=true" -Method GET -Headers $headers
            Write-Host "✅ Foto encontrada com refresh=true:" -ForegroundColor Green
            $refreshPictureResponse | ConvertTo-Json -Depth 2
        } catch {
            Write-Host "❌ Erro com refresh=true: $($_.Exception.Message)" -ForegroundColor Red
            Write-Host "❌ Nenhum endpoint de foto funcionou para $chatId" -ForegroundColor Red
        }
    }
}

Write-Host "`n=== FIM DOS TESTES ===" -ForegroundColor Green
