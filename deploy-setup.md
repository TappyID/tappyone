# 🚀 Guia de Deploy - TappyOne CRM

## 📋 **ARQUITETURA DE DEPLOY**

```
┌─────────────────┐    ┌──────────────────────┐    ┌─────────────────┐
│   Vercel        │    │  Digital Ocean       │    │   Neon.tech     │
│   (Frontend)    │────│  Droplet             │────│   (Database)    │
│                 │    │                      │    │                 │
│ • Next.js       │    │ • Backend Go + GORM │    │ • PostgreSQL    │
│ • Static Files  │    │ • WAHA API Container │    │ • Managed       │
│ • CDN Global    │    │ • Nginx Proxy        │    │ • Backups       │
└─────────────────┘    └──────────────────────┘    └─────────────────┘
```

## 🐳 **CONTAINERS NO DROPLET**

### **1. Backend Go (Port 8080)**
- API REST com GORM
- Autenticação JWT
- Upload de arquivos
- Webhooks WhatsApp

### **2. WAHA API (Port 3000)**
- WhatsApp HTTP API
- Sessões persistentes
- QR Code para conexão
- Eventos em tempo real

### **3. Nginx (Port 80/443)**
- Reverse proxy
- SSL/TLS termination
- Rate limiting
- Load balancing

## 📦 **REPOSITÓRIOS GITHUB**

### **Frontend:**
```bash
https://github.com/TappyID/tappyone.git
```

### **Backend:**
```bash
https://github.com/TappyID/backend.git
```

## 🔧 **CONFIGURAÇÃO DO DROPLET**

### **1. Criar Droplet Digital Ocean**
```bash
# Especificações recomendadas:
- Ubuntu 22.04 LTS
- 2 GB RAM / 1 vCPU (mínimo)
- 50 GB SSD
- $12/mês
```

### **2. Instalar Docker & Docker Compose**
```bash
# Conectar via SSH
ssh root@your-droplet-ip

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### **3. Clonar e Configurar Backend**
```bash
# Clonar repositório
git clone https://github.com/TappyID/backend.git
cd backend

# Configurar variáveis de ambiente
cp .env.production .env
nano .env

# Editar com dados reais:
# DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/db?sslmode=require
# JWT_SECRET=sua-chave-super-secreta-256-bits
# WHATSAPP_API_TOKEN=seu-token-waha
```

### **4. Deploy com Docker Compose**
```bash
# Subir todos os containers
docker-compose -f docker-compose.prod.yml up -d

# Verificar status
docker-compose ps

# Ver logs
docker-compose logs -f backend
docker-compose logs -f waha
```

## 🗄️ **CONFIGURAÇÃO DO BANCO NEON**

### **1. Criar Database no Neon**
```bash
# Acessar: https://neon.tech
# Criar novo projeto
# Copiar connection string
```

### **2. Executar Migrations**
```bash
# No frontend local (onde está schema.prisma)
DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/db?sslmode=require"
npx prisma migrate deploy

# Ou executar SQL manual no Neon Console
```

## 🌐 **DEPLOY DO FRONTEND (VERCEL)**

### **1. Conectar Repositório**
```bash
# Acessar: https://vercel.com
# Import Git Repository
# Conectar: https://github.com/TappyID/tappyone.git
```

### **2. Configurar Environment Variables**
```bash
NEXT_PUBLIC_BACKEND_URL=https://api.yourdomain.com
NEXT_PUBLIC_APP_URL=https://app.yourdomain.com
DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/db?sslmode=require
```

### **3. Deploy Automático**
```bash
# Vercel faz deploy automático a cada push
# Build command: pnpm build
# Output directory: .next
```

## 🔐 **CONFIGURAÇÃO SSL/DOMÍNIO**

### **1. Configurar DNS**
```bash
# Apontar domínio para droplet IP
api.yourdomain.com → your-droplet-ip
```

### **2. Certificado SSL (Let's Encrypt)**
```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx

# Gerar certificado
sudo certbot --nginx -d api.yourdomain.com

# Renovação automática
sudo crontab -e
# Adicionar: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 📊 **MONITORAMENTO**

### **1. Health Checks**
```bash
# Backend
curl https://api.yourdomain.com/health

# WAHA API
curl https://api.yourdomain.com/waha/health
```

### **2. Logs**
```bash
# Ver logs em tempo real
docker-compose logs -f

# Logs específicos
docker-compose logs backend
docker-compose logs waha
docker-compose logs nginx
```

## 💰 **CUSTOS ESTIMADOS**

| Serviço | Plano | Custo/Mês |
|---------|-------|-----------|
| **Vercel** | Hobby | $0 |
| **Neon** | Free Tier | $0 |
| **Digital Ocean** | Droplet 2GB | $12 |
| **Domínio** | .com | $12/ano |
| **TOTAL** | | **~$13/mês** |

## 🚀 **COMANDOS DE DEPLOY**

### **Deploy Inicial:**
```bash
# 1. Configurar Neon DB
# 2. Configurar Droplet + Docker
# 3. Deploy Backend no Droplet
# 4. Deploy Frontend na Vercel
```

### **Updates:**
```bash
# Backend
git pull origin main
docker-compose -f docker-compose.prod.yml up -d --build

# Frontend (automático via Vercel)
git push origin main
```

## 🔧 **TROUBLESHOOTING**

### **Container não inicia:**
```bash
docker-compose logs container-name
docker-compose restart container-name
```

### **WAHA não conecta WhatsApp:**
```bash
# Ver QR Code
docker-compose logs waha | grep -A 10 "QR Code"

# Resetar sessão
docker-compose exec waha rm -rf /app/sessions/*
docker-compose restart waha
```

### **Backend não conecta no banco:**
```bash
# Testar conexão
docker-compose exec backend ping ep-xxx.neon.tech

# Verificar variáveis
docker-compose exec backend env | grep DATABASE_URL
```
