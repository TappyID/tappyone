# Multi-stage build para otimizar o tamanho da imagem

# Stage 1: Build do backend Go
FROM golang:1.21-alpine AS backend-builder

WORKDIR /app/backend

# Instalar dependências do sistema
RUN apk add --no-cache git

# Copiar go mod e sum files
COPY backend/go.mod backend/go.sum ./

# Download das dependências
RUN go mod download

# Copiar código fonte
COPY backend/ .

# Build da aplicação
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main ./cmd/server

# Stage 2: Build do frontend Next.js
FROM node:18-alpine AS frontend-builder

WORKDIR /app

# Instalar pnpm
RUN npm install -g pnpm

# Copiar package files
COPY package.json pnpm-lock.yaml* ./

# Instalar dependências
RUN pnpm install --frozen-lockfile

# Copiar código fonte
COPY . .

# Gerar cliente Prisma
RUN pnpm prisma generate

# Build do Next.js
RUN pnpm build

# Stage 3: Imagem final
FROM alpine:latest

# Instalar certificados CA
RUN apk --no-cache add ca-certificates

WORKDIR /root/

# Copiar binário do backend
COPY --from=backend-builder /app/backend/main .

# Copiar build do frontend
COPY --from=frontend-builder /app/.next ./.next
COPY --from=frontend-builder /app/public ./public
COPY --from=frontend-builder /app/package.json ./
COPY --from=frontend-builder /app/node_modules ./node_modules

# Expor portas
EXPOSE 8080 3000

# Comando para iniciar a aplicação
CMD ["./main"]
