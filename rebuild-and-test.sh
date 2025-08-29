#!/bin/bash

echo "🔧 REBUILD E TESTE APÓS CORREÇÕES DE AUTH"
echo ""

echo "1️⃣ Fazendo rebuild do container..."
cd /root/backend
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up --build -d

echo ""
echo "2️⃣ Aguardando container subir (30s)..."
sleep 30

echo ""
echo "3️⃣ Testando correções..."
cd /root

# Executar script de teste
chmod +x test-api.sh
./test-api.sh

echo ""
echo "🏁 TESTE COMPLETO!"
