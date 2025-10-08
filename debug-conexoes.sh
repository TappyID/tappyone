#!/bin/bash

# Script para verificar conexões no banco de dados

echo "🔍 Verificando conexões no banco..."
echo ""

# Conectar ao banco e listar todas as conexões
docker exec backend-postgres-1 psql -U admin -d tappyone -c "
SELECT 
  session_name as \"Sessão\",
  ativo as \"Ativo\",
  status as \"Status\",
  created_at as \"Criado Em\"
FROM connections
ORDER BY created_at DESC;
"

echo ""
echo "🔍 Conexões ATIVAS (ativo=true E status=WORKING):"
docker exec backend-postgres-1 psql -U admin -d tappyone -c "
SELECT 
  session_name as \"Sessão\",
  ativo as \"Ativo\",
  status as \"Status\"
FROM connections
WHERE ativo = true AND status = 'WORKING';
"

echo ""
echo "⚠️  Conexões INATIVAS mas no banco:"
docker exec backend-postgres-1 psql -U admin -d tappyone -c "
SELECT 
  session_name as \"Sessão\",
  ativo as \"Ativo\",
  status as \"Status\"
FROM connections
WHERE ativo = false OR ativo IS NULL OR status != 'WORKING';
"
