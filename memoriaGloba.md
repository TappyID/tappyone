version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: tappyone
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  backend:
    build: .
    image: backend-backend
    ports:
      - "8081:8081"
    volumes:
      - ./uploads:/app/uploads
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@postgres:5432/tappyone?sslmode=disable
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_NAME=tappyone
      - DB_USER=postgres
      - DB_PASSWORD=postgres
    depends_on:
      - postgres
    restart: unless-stopped
    command: "./main"

  waha:
    image: devlikeapro/waha-plus:chrome
    ports:
      - "3001:3000"
    environment:
      - WAHA_API_KEY=tappyone-waha-2024-secretkey
      - WAHA_API_PORT=3001
      - WAHA_AUTO_START_DELAY_SECONDS=1
      - WAHA_DASHBOARD_ENABLED=true
      - WAHA_DASHBOARD_URL=http://159.65.34.199:3001/dashboard
      - WAHA_GOWS_PATH=/app/gows
      - WAHA_GOWS_SOCKET=/tmp/gows.sock
      - WAHA_MEDIA_POSTGRESQL_URL=postgresql://postgres:postgres@postgres:5432/tappyone?sslmode=disable
      - WAHA_MEDIA_STORAGE=POSTGRESQL
      - WAHA_PRINT_QR=true
      - WAHA_WORKER_ID=tappyone-server
      - WAHA_ZIPPER=ZIPUNZIP
      - WHATSAPP_API_SCHEMA=http
      - WHATSAPP_DEFAULT_ENGINE=GOWS
      - WHATSAPP_HOOK_EVENTS=message,session.status
      - WHATSAPP_HOOK_URL=http://159.65.34.199:8081/webhooks/whatsapp
      - WHATSAPP_RESTART_ALL_SESSIONS=true
      - WHATSAPP_SWAGGER_DESCRIPTION=<p><strong>TappyOne CRM</strong> - Sistema completo de gestão via WhatsApp.<br/><a href='https://crm.tappy.id'>Acesse nossa plataforma</a></p>
      - WHATSAPP_SWAGGER_EXTERNAL_DOC_URL=https://crm.tappy.id
      - WHATSAPP_SWAGGER_TITLE=TappyOne CRM API
      - NODE_OPTIONS=--max-old-space-size=16384
      - CHOKIDAR_INTERVAL=5000 
      - CHOKIDAR_USEPOLLING=1
      - UV_THREADPOOL_SIZE=8
    restart: unless-stopped

volumes:
  postgres_data:



.env backend

# Backend Configuration
PORT=8081
DOMAIN=localhost

# JWT Secret
JWT_SECRET=tappyone_jwt_secret_2024_secure_key_a8f9e2d1c5b7f3e6a4d8c9b2e5f1a7d3

# WAHA API Configuration (production)
WAHA_API_URL=http://localhost:3001
WHATSAPP_API_TOKEN=tappyone-waha-2024-secretkey

# Frontend URL (production)
FRONTEND_URL=https://crm.tappy.id

# Webhook URL
WEBHOOK_URL=http://159.65.34.199:3001/webhooks/whatsapp

# Database
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/tappyone?sslmode=disable


.env frontend

# Created by Vercel CLI
BACKEND_URL="http://localhost:8081"
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_CZKLglFqr6p7Vjn6_OUaFk2tIdtpSM7YFZiWSYFBItE041n"
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/tappyone?sslmode=disable"
DATABASE_URL_UNPOOLED="postgresql://postgres:postgres@localhost:5432/tappyone?sslmode=disable"
DEEPSEEK_API_BASE_URL="https://api.deepseek.com/v1"
DEEPSEEK_API_KEY="sk-f98ff4ede4c4484c9c5ac3725af150c4"
DEEPSEEK_MODEL="deepseek-chat"
EMAIL_FROM="contato@vyzer.com.br"
EMAIL_SERVER_HOST="smtp.hostinger.com"
EMAIL_SERVER_PASSWORD="Lala147??"
EMAIL_SERVER_PORT="465"
EMAIL_SERVER_SECURE="true"
EMAIL_SERVER_USER="smtp@vyzer.com.br"
JWT_SECRET="tappyone_jwt_secret_2024_secure_key_a8f9e2d1c5b7f3e6a4d8c9b2e5f1a7d3"
NEON_PROJECT_ID="morning-butterfly-34751946"
NEXTAUTH_SECRET="VmSspnS+1wJHqCxOJeS6NIcWhP8Z+iypSbhtEJx0gRs="
NEXT_PUBLIC_API_URL="http://localhost:8081"
NEXT_PUBLIC_BACKEND_URL="http://localhost:8081"
NEXT_PUBLIC_FRONTEND_URL="https://crm.tappy.id"
NEXT_PUBLIC_STACK_PROJECT_ID="33938dc5-f875-4f17-8861-3f18ce7b472e"
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY="pck_81ndnbnf3gkpfe74ttpj37bzd41emxj4w225kb93hep48"
NEXT_PUBLIC_WAHA_API_KEY="tappyone-waha-2024-secretkey"
NEXT_PUBLIC_WAHA_API_URL="http://159.65.34.199:3001"
PGDATABASE="tappyone"
PGHOST="localhost"
PGHOST_UNPOOLED="localhost"
PGPASSWORD="postgres"
PGUSER="postgres"
POSTGRES_DATABASE="tappyone"
POSTGRES_HOST="localhost"
POSTGRES_PASSWORD="postgres"
POSTGRES_PRISMA_URL="postgresql://postgres:postgres@localhost:5432/tappyone?connect_timeout=15&sslmode=disable"
POSTGRES_URL="postgresql://postgres:postgres@localhost:5432/tappyone?sslmode=disable"


backend golang localhost:8081

frontend nextjs localhost:3000

backend golang digitalocean 159.65.34.199:8081

frontend nextjs digitalocean 159.65.34.199:3000

willian@pop-os:~/Área de Trabalho/tappyone/backend$ go build -o main ./cmd/server (build
)
willian@pop-os:~/Área de Trabalho/tappyone/backend$ ./main (run)

