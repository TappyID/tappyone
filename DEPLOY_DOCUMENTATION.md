# 📚 TappyOne CRM - Documentação Completa de Deploy

## 🎯 **RESUMO EXECUTIVO**

Sistema TappyOne CRM totalmente deployado em produção com integração WhatsApp via WAHA Plus, frontend na Vercel e backend no Digital Ocean.

---

## 🏗️ **ARQUITETURA DO SISTEMA**

### **Frontend (Next.js + TypeScript)**
- **Plataforma:** Vercel
- **URL:** https://tappyone.vercel.app
- **Stack:** Next.js, TypeScript, Tailwind CSS, Shadcn/UI, Radix UI
- **Autenticação:** NextAuth
- **Validação:** Zod

### **Backend (Go)**
- **Plataforma:** Digital Ocean Droplet
- **IP:** 159.65.34.199:8080
- **Stack:** Go, Gin Framework, GORM
- **Banco:** PostgreSQL (Neon.tech)
- **Autenticação:** JWT

### **WhatsApp API (WAHA Plus)**
- **Container:** Docker (willianbianchirocha/waha-plus:latest)
- **URL:** http://159.65.34.199:3000
- **Dashboard:** http://159.65.34.199:3000/dashboard
- **Swagger:** http://159.65.34.199:3000 (login: tappyone/admin2024)

---

## 🛠️ **CONFIGURAÇÃO DO AMBIENTE**

### **Digital Ocean Droplet**
```bash
# Especificações
- CPU: 4 vCPUs
- RAM: 8GB
- Storage: 160GB SSD
- OS: Ubuntu 25.04
- IP: 159.65.34.199
```

### **Firewall Configuração**
```bash
# UFW (Sistema)
ufw allow 22/tcp    # SSH
ufw allow 8080/tcp  # Backend
ufw allow 3000/tcp  # WAHA Plus
ufw --force enable

# Digital Ocean Cloud Firewall "Fire"
- SSH (22) - All sources
- HTTP (80) - All sources
- Custom (3000) - All sources
- Custom (8080) - All sources
```

---

## 🐳 **DOCKER CONFIGURATION**

### **Dockerfile (Backend Go)**
```dockerfile
FROM golang:1.21-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main ./cmd/server/

FROM alpine:latest

RUN apk --no-cache add ca-certificates
WORKDIR /root/

COPY --from=builder /app/main .

EXPOSE 8080

CMD ["./main"]
```

### **docker-compose.prod.yml**
```yaml
version: '3.8'

services:
  backend:
    build: .
    ports:
      - "8080:8080"
    env_file:
      - config.env
    restart: unless-stopped
    depends_on:
      - waha
    networks:
      - tappyone-network

  waha:
    image: willianbianchirocha/waha-plus:latest
    ports:
      - "3000:3000"
    environment:
      - WHATSAPP_HOOK_URL=http://backend:8080/api/webhooks/whatsapp
      - WHATSAPP_HOOK_EVENTS=message,session.status
      # TappyOne White Label Configuration
      - WHATSAPP_SWAGGER_TITLE=TappyOne CRM API
      - WHATSAPP_SWAGGER_DESCRIPTION=<p><strong>TappyOne CRM</strong> - Sistema completo de gestão de relacionamento com clientes via WhatsApp.<br/><a href='https://tappyone.vercel.app'>Acesse nossa plataforma</a></p>
      - WHATSAPP_SWAGGER_EXTERNAL_DOC_URL=https://tappyone.vercel.app
      - WHATSAPP_SWAGGER_USERNAME=tappyone
      - WHATSAPP_SWAGGER_PASSWORD=admin2024
      - WAHA_API_KEY=tappyone-secure-key-2024
    volumes:
      - ./sessions:/app/.sessions
    restart: unless-stopped
    networks:
      - tappyone-network

networks:
  tappyone-network:
    driver: bridge
```

---

## 🔧 **VARIÁVEIS DE AMBIENTE**

### **config.env (Backend)**
```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# JWT
JWT_SECRET=tappyone_jwt_secret_key_2024

# WAHA Integration
WAHA_API_URL=http://waha:3000/api
WAHA_API_KEY=tappyone-secure-key-2024
WHATSAPP_API_TOKEN=your_whatsapp_token

# Server
PORT=8080
NODE_ENV=production

# Webhooks
WEBHOOK_URL=http://backend:8080/api/webhooks/whatsapp
BASE_URL=http://backend:8080
```

---

## 📦 **COMANDOS DE DEPLOY**

### **1. Preparação do Servidor**
```bash
# Conectar ao droplet
ssh root@159.65.34.199

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Instalar Docker Compose
curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
```

### **2. Deploy do Backend**
```bash
# Clonar repositório ou fazer upload dos arquivos
cd ~/backend

# Build e deploy
docker-compose -f docker-compose.prod.yml up -d --build

# Verificar status
docker ps
docker logs backend-backend-1
docker logs backend-waha-1
```

### **3. Configuração do Firewall**
```bash
# Configurar UFW
ufw allow 22/tcp
ufw allow 8080/tcp
ufw allow 3000/tcp
ufw --force enable

# Verificar portas abertas
ss -tlnp | grep -E ':(8080|3000)'
```

---

## 🔐 **SEGURANÇA E AUTENTICAÇÃO**

### **API Keys**
- **WAHA API Key:** `tappyone-secure-key-2024`
- **JWT Secret:** `tappyone_jwt_secret_key_2024`
- **Swagger Login:** `tappyone` / `admin2024`

### **White Label Configuration**
- **Título:** TappyOne CRM API
- **Descrição:** Sistema completo de gestão via WhatsApp
- **URL Externa:** https://tappyone.vercel.app
- **Nenhuma menção ao WAHA visível ao cliente**

---

## 🌐 **URLS DE ACESSO**

```bash
# Frontend
https://tappyone.vercel.app

# Backend API
http://159.65.34.199:8080

# WAHA Plus API
http://159.65.34.199:3000/api

# Dashboard WhatsApp
http://159.65.34.199:3000/dashboard

# Swagger/OpenAPI
http://159.65.34.199:3000
# Login: tappyone / admin2024
```

---

## 🗄️ **BANCO DE DADOS**

### **PostgreSQL (Neon.tech)**
- **Provider:** Neon.tech (Serverless PostgreSQL)
- **Conexão:** Via DATABASE_URL
- **Migrações:** Automáticas via GORM
- **Tabelas:** users, conversas, mensagens, cards, etc.

---

## 📋 **COMANDOS DE MANUTENÇÃO**

### **Verificar Status**
```bash
# Status dos containers
docker ps

# Logs em tempo real
docker logs -f backend-backend-1
docker logs -f backend-waha-1

# Verificar conectividade
curl -I http://159.65.34.199:8080
curl -I http://159.65.34.199:3000
```

### **Restart do Sistema**
```bash
cd ~/backend
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d
```

### **Backup das Sessões WhatsApp**
```bash
# Backup das sessões
tar -czf sessions-backup-$(date +%Y%m%d).tar.gz sessions/

# Restaurar sessões
tar -xzf sessions-backup-YYYYMMDD.tar.gz
```

---

## 🚀 **PRÓXIMOS PASSOS**

### **Opcional - SSL/HTTPS**
```bash
# Instalar Certbot
apt install certbot

# Configurar Nginx reverse proxy
# Obter certificado SSL
# Configurar redirecionamento HTTPS
```

### **Monitoramento**
- Configurar logs centralizados
- Implementar health checks
- Configurar alertas de sistema

---

## 📞 **SUPORTE E TROUBLESHOOTING**

### **Problemas Comuns**

1. **Container não inicia:**
   ```bash
   docker logs container-name
   docker-compose -f docker-compose.prod.yml down
   docker-compose -f docker-compose.prod.yml up -d
   ```

2. **Erro de conectividade:**
   ```bash
   # Verificar firewall
   ufw status
   # Verificar portas
   ss -tlnp | grep -E ':(8080|3000)'
   ```

3. **Problema de API Key:**
   ```bash
   # Verificar variáveis de ambiente
   docker exec backend-backend-1 env | grep WAHA_API_KEY
   docker exec backend-waha-1 env | grep WAHA_API_KEY
   ```

---

## ✅ **STATUS FINAL**

- ✅ Frontend deployado na Vercel
- ✅ Backend Go funcionando no Digital Ocean
- ✅ WAHA Plus integrado e customizado
- ✅ Banco PostgreSQL (Neon) conectado
- ✅ Firewall configurado
- ✅ White Label aplicado (TappyOne)
- ✅ API Key de segurança configurada
- ✅ Sessões WhatsApp persistentes

**Sistema 100% operacional em produção!** 🎉

---

*Documentação criada em: 18/08/2025*
*Versão: 1.0*
*Autor: Deploy TappyOne CRM*
