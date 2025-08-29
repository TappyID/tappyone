#!/bin/bash

# Script para configurar SSL/HTTPS na porta 3000 do WAHA
# Substitui o proxy SSL que o Hestia fazia

echo "🚀 Configurando SSL para WAHA na porta 3000..."

# 1. Instalar nginx se não estiver instalado
if ! command -v nginx &> /dev/null; then
    echo "📦 Instalando nginx..."
    apt update
    apt install -y nginx
else
    echo "✅ Nginx já instalado"
fi

# 2. Parar nginx se estiver rodando
echo "⏹️  Parando nginx..."
systemctl stop nginx 2>/dev/null || true

# 3. Backup da configuração existente
echo "💾 Fazendo backup da configuração nginx..."
cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.backup.$(date +%Y%m%d_%H%M%S) 2>/dev/null || true

# 4. Criar configuração nginx para WAHA SSL
echo "⚙️  Criando configuração nginx..."
cat > /etc/nginx/sites-available/waha-ssl << 'EOF'
server {
    listen 3000 ssl http2;
    server_name server.tappy.id;

    # SSL Configuration
    ssl_certificate /etc/ssl/certs/ssl-cert-snakeoil.pem;
    ssl_certificate_key /etc/ssl/private/ssl-cert-snakeoil.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;

    # Security Headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";

    # CORS Headers para WAHA API
    add_header Access-Control-Allow-Origin "https://crm.tappy.id" always;
    add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
    add_header Access-Control-Allow-Headers "Authorization, Content-Type, X-Api-Key" always;
    add_header Access-Control-Allow-Credentials true always;

    # Handle preflight requests
    if ($request_method = 'OPTIONS') {
        add_header Access-Control-Allow-Origin "https://crm.tappy.id";
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
        add_header Access-Control-Allow-Headers "Authorization, Content-Type, X-Api-Key";
        add_header Access-Control-Allow-Credentials true;
        add_header Content-Length 0;
        add_header Content-Type text/plain;
        return 204;
    }

    # Proxy para WAHA container
    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # WebSocket support para WAHA
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
EOF

# 5. Ativar site
echo "🔗 Ativando configuração..."
ln -sf /etc/nginx/sites-available/waha-ssl /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# 6. Modificar docker-compose.yml para mudar porta do WAHA
echo "🐳 Modificando porta do WAHA no docker-compose..."
sed -i 's/- "3000:3000"/- "3001:3000"/' /root/backend/docker-compose.yml

# 7. Testar configuração nginx
echo "🧪 Testando configuração nginx..."
if nginx -t; then
    echo "✅ Configuração nginx válida"
else
    echo "❌ Erro na configuração nginx"
    exit 1
fi

# 8. Abrir porta 3000 no firewall
echo "🔥 Configurando firewall..."
ufw allow 3000/tcp 2>/dev/null || true

# 9. Reiniciar containers docker
echo "🔄 Reiniciando containers..."
cd /root/backend
docker-compose down
docker-compose up -d

# 10. Aguardar containers iniciarem
echo "⏳ Aguardando containers iniciarem..."
sleep 10

# 11. Iniciar nginx
echo "🚀 Iniciando nginx..."
systemctl start nginx
systemctl enable nginx

# 12. Testar conectividade
echo "🧪 Testando conectividade..."
echo "Testando WAHA internamente..."
curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/health && echo " ✅ WAHA interno OK" || echo " ❌ WAHA interno FALHOU"

echo "Testando nginx SSL..."
curl -s -k -o /dev/null -w "%{http_code}" https://server.tappy.id:3000/api/health && echo " ✅ Nginx SSL OK" || echo " ❌ Nginx SSL FALHOU"

# 13. Mostrar status
echo ""
echo "📊 STATUS FINAL:"
echo "=================="
echo "Nginx: $(systemctl is-active nginx)"
echo "Containers Docker:"
docker-compose ps
echo ""
echo "🔍 Para testar:"
echo "curl -k https://server.tappy.id:3000/api/health"
echo ""
echo "🎯 Para ver logs:"
echo "docker-compose logs waha -f"
echo "tail -f /var/log/nginx/access.log"
echo ""
echo "✅ Setup concluído!"
