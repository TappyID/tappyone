# Teste de upload de mídia para Vercel Blob Storage
Write-Host "=== Teste de Upload para Blob Storage ===" -ForegroundColor Green

# Criar arquivo de teste (imagem simulada)
$testImageData = [System.Text.Encoding]::UTF8.GetBytes("fake-image-data-for-testing")
$tempFile = [System.IO.Path]::GetTempFileName() + ".jpg"
[System.IO.File]::WriteAllBytes($tempFile, $testImageData)

Write-Host "Arquivo de teste criado: $tempFile" -ForegroundColor Yellow

try {
    # Testar API de upload do blob
    $uri = "http://localhost:3000/api/upload/blob-from-backend"
    
    # Criar form data
    $boundary = [System.Guid]::NewGuid().ToString()
    $LF = "`r`n"
    
    $bodyLines = (
        "--$boundary",
        "Content-Disposition: form-data; name=`"file`"; filename=`"test.jpg`"",
        "Content-Type: image/jpeg$LF",
        [System.Text.Encoding]::UTF8.GetString($testImageData),
        "--$boundary",
        "Content-Disposition: form-data; name=`"msgType`"$LF",
        "image",
        "--$boundary--$LF"
    ) -join $LF
    
    $body = [System.Text.Encoding]::UTF8.GetBytes($bodyLines)
    
    Write-Host "Enviando requisição para: $uri" -ForegroundColor Yellow
    
    $response = Invoke-RestMethod -Uri $uri -Method Post -Body $body -ContentType "multipart/form-data; boundary=$boundary"
    
    Write-Host "✅ Upload realizado com sucesso!" -ForegroundColor Green
    Write-Host "URL do blob: $($response.url)" -ForegroundColor Cyan
    Write-Host "Arquivo: $($response.fileName)" -ForegroundColor Cyan
    Write-Host "Tamanho: $($response.size) bytes" -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ Erro no upload: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Detalhes: $($_.Exception.Response)" -ForegroundColor Red
} finally {
    # Limpar arquivo temporário
    if (Test-Path $tempFile) {
        Remove-Item $tempFile -Force
        Write-Host "Arquivo temporário removido" -ForegroundColor Gray
    }
}

Write-Host "`n=== Teste Concluído ===" -ForegroundColor Green
