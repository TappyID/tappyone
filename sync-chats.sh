#!/bin/bash

# Configurações
WAHA_URL="http://159.65.34.199:3001/api/user_fb8da1d7_1758158816675/chats"
WAHA_API_KEY="tappyone-waha-2024-secretkey"
FILA_SEM_FILA_ID="0ea98670-9844-4803-847b-d9238497aad3"
ADMIN_USER_ID="fb8da1d7-d28f-4ef9-b8b0-e01f7466f578"

echo "📡 Buscando chats da WAHA..."

# Buscar todos os chats da WAHA
CHATS=$(curl -s -X GET "$WAHA_URL" -H "X-Api-Key: $WAHA_API_KEY")

# Contar total
TOTAL=$(echo "$CHATS" | jq '. | length')
echo "✅ $TOTAL chats encontrados"

# Extrair apenas os IDs
CHAT_IDS=$(echo "$CHATS" | jq -r '.[].id')

echo "📝 Gerando SQL..."

# Criar arquivo SQL temporário
SQL_FILE="/tmp/sync_chats.sql"
echo "-- Sincronizar chats da WAHA para o banco" > $SQL_FILE
echo "-- Total de chats: $TOTAL" >> $SQL_FILE
echo "" >> $SQL_FILE

COUNT=0
while IFS= read -r CHAT_ID; do
    # Escapar aspas simples no chat_id
    ESCAPED_CHAT_ID=$(echo "$CHAT_ID" | sed "s/'/''/g")
    
    # INSERT com ON CONFLICT para não duplicar
    cat >> $SQL_FILE << EOF
INSERT INTO chat_leads (chat_id, fila_id, user_id, status, status_final, pais)
VALUES ('$ESCAPED_CHAT_ID', '$FILA_SEM_FILA_ID', '$ADMIN_USER_ID', 'aguardando', 'ativo', 'Brasil')
ON CONFLICT (chat_id, user_id) 
DO UPDATE SET 
    fila_id = CASE WHEN chat_leads.fila_id IS NULL OR chat_leads.fila_id = '' 
              THEN '$FILA_SEM_FILA_ID' 
              ELSE chat_leads.fila_id END,
    atualizado_em = NOW();

EOF
    
    COUNT=$((COUNT + 1))
    
    # Log a cada 100
    if [ $((COUNT % 100)) -eq 0 ]; then
        echo "📊 Processados: $COUNT/$TOTAL"
    fi
done <<< "$CHAT_IDS"

echo "✅ SQL gerado: $SQL_FILE"
echo "🚀 Executando no banco de dados..."

# Executar SQL no banco
ssh root@159.65.34.199 "docker exec -i backend-postgres-1 psql -U postgres -d tappyone" < $SQL_FILE

echo ""
echo "🎉 CONCLUÍDO!"
echo "📊 Total processado: $COUNT chats"
