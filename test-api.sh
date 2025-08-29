#!/bin/bash

# 🔥 SCRIPT COMPLETO DE TESTE - DIGITAL OCEAN
# Testa todas as possibilidades de autenticação e rotas

BASE_URL="https://server.tappy.id"
EMAIL="admin@tappyone.com"
PASSWORD="admin123"

echo "🚀 INICIANDO TESTES COMPLETOS..."
echo "📍 URL Base: $BASE_URL"
echo ""

# 1. FAZER LOGIN E OBTER TOKEN
echo "1️⃣ FAZENDO LOGIN..."
LOGIN_RESPONSE=$(curl -s -X POST \
  "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"senha\":\"$PASSWORD\"}")

echo "Response: $LOGIN_RESPONSE"

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo "❌ ERRO: Não foi possível obter token"
    exit 1
fi

echo "✅ Token obtido: ${TOKEN:0:50}..."
echo ""

# 2. TESTAR /api/auth/me (sempre funciona)
echo "2️⃣ TESTANDO /api/auth/me..."
curl -s -X GET \
  "$BASE_URL/api/auth/me" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq .
echo ""

# 3. TESTAR ROTAS WHATSAPP (que funcionam)
echo "3️⃣ TESTANDO ROTAS WHATSAPP (que funcionam)..."

echo "📱 /api/whatsapp/groups:"
curl -s -X GET \
  "$BASE_URL/api/whatsapp/groups" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq .
echo ""

echo "📱 /api/whatsapp/chats:"
curl -s -X GET \
  "$BASE_URL/api/whatsapp/chats" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq .
echo ""

# 4. TESTAR ROTAS QUE FALHAM
echo "4️⃣ TESTANDO ROTAS QUE FALHAM..."

echo "📋 /api/kanban/quadros:"
curl -s -X GET \
  "$BASE_URL/api/kanban/quadros" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq .
echo ""

echo "📅 /api/agendamentos:"
curl -s -X GET \
  "$BASE_URL/api/agendamentos" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq .
echo ""

echo "📝 /api/anotacoes:"
curl -s -X GET \
  "$BASE_URL/api/anotacoes" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq .
echo ""

echo "💰 /api/assinaturas:"
curl -s -X GET \
  "$BASE_URL/api/assinaturas" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq .
echo ""

# 5. TESTES DE DEBUG
echo "5️⃣ TESTES DE DEBUG..."

echo "🔍 Testando com diferentes formatos de token..."

echo "Teste 1 - Token sem Bearer:"
curl -s -X GET \
  "$BASE_URL/api/kanban/quadros" \
  -H "Authorization: $TOKEN" \
  -H "Content-Type: application/json" | jq .
echo ""

echo "Teste 2 - Header authorization (minúsculo):"
curl -s -X GET \
  "$BASE_URL/api/kanban/quadros" \
  -H "authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq .
echo ""

echo "Teste 3 - Verificando se token é válido:"
echo "Token: $TOKEN"
echo "Length: ${#TOKEN}"
echo ""

# 6. COMPARAR HEADERS
echo "6️⃣ COMPARANDO HEADERS..."

echo "WhatsApp groups com headers verbose:"
curl -v -X GET \
  "$BASE_URL/api/whatsapp/groups" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" 2>&1 | head -20
echo ""

echo "Kanban quadros com headers verbose:"
curl -v -X GET \
  "$BASE_URL/api/kanban/quadros" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" 2>&1 | head -20
echo ""

echo "🏁 TESTES CONCLUÍDOS!"
