# TappyOne CRM

Sistema CRM completo com integração WhatsApp, Kanban, IA e gestão de cobrança.

## 🚀 Tecnologias

### Backend
- **Golang** - API REST
- **GORM** - ORM para PostgreSQL
- **Gin** - Framework web
- **Redis** - Cache e sessões
- **JWT** - Autenticação
- **WebSocket** - Comunicação em tempo real

### Frontend
- **Next.js 14** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Radix UI** - Componentes acessíveis
- **Framer Motion** - Animações
- **Prisma** - ORM e cliente de banco
- **NextAuth.js** - Autenticação
- **Socket.io** - WebSocket cliente

### Banco de Dados
- **PostgreSQL** - Banco principal
- **Redis** - Cache e sessões

### Integrações
- **apiwhatsapp.com.br** - API WhatsApp
- **DeepSeek** - IA para respostas automáticas
- **SMTP Hostinger** - Envio de emails

## 📋 Funcionalidades

### 👥 Gestão de Usuários
- Sistema de autenticação JWT
- Diferentes tipos de usuário (Admin, Atendentes, Assinantes, Afiliados)
- Perfis e permissões

### 📱 Integração WhatsApp
- Conexão via QR Code
- Recebimento e envio de mensagens
- Suporte a mídias (imagens, áudios, vídeos)
- Webhooks para tempo real

### 📋 Sistema Kanban
- Quadros personalizáveis
- Colunas com cores
- Cards com conversas do WhatsApp
- Drag & drop
- Agentes de IA por coluna

### 🤖 IA Integrada
- Respostas automáticas via DeepSeek
- Agentes personalizáveis por coluna
- Configuração de prompts e temperatura

### 💬 Chat e Atendimento
- Chat interno entre usuários
- Sistema de atendimento
- Respostas rápidas
- Histórico de conversas

### 📅 Agendamentos
- Sistema completo de agendamentos
- Integração com contatos
- Status de acompanhamento

### 💰 Gestão Financeira
- Planos e assinaturas
- Cobrança via PIX, cartão e boleto
- Controle de vencimentos
- Dashboard financeiro

### 📊 Analytics e NPS
- Sistema de avaliação NPS
- Métricas de atendimento
- Relatórios

## 🛠️ Instalação e Configuração

### Pré-requisitos
- Docker e Docker Compose
- Node.js 18+ e pnpm
- Go 1.21+

### 1. Clone o repositório
```bash
git clone <repository-url>
cd tappyone
```

### 2. Configure as variáveis de ambiente
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

### 3. Instale as dependências
```bash
make install
```

### 4. Inicie o ambiente de desenvolvimento
```bash
make dev
```

Ou usando Docker:
```bash
make docker-run
```

## 🐳 Docker

### Desenvolvimento
```bash
# Iniciar todos os serviços
make docker-run

# Ver logs
make docker-logs

# Parar serviços
make docker-stop
```

### Produção
```bash
# Build para produção
make prod-build

# Executar em produção
make prod-run
```

## 📚 Estrutura do Projeto

```
tappyone/
├── backend/                 # API Go
│   ├── cmd/server/         # Entrada da aplicação
│   ├── internal/
│   │   ├── config/         # Configurações
│   │   ├── database/       # Conexão e migrações
│   │   ├── handlers/       # Controllers HTTP
│   │   ├── middleware/     # Middlewares
│   │   ├── models/         # Modelos GORM
│   │   ├── router/         # Rotas
│   │   └── services/       # Lógica de negócio
│   └── go.mod
├── src/                    # Frontend Next.js
│   ├── app/               # App Router
│   ├── components/        # Componentes React
│   ├── lib/              # Utilitários
│   └── types/            # Tipos TypeScript
├── prisma/               # Schema e migrações
├── docker-compose.yml    # Docker para desenvolvimento
├── Dockerfile.*          # Dockerfiles
├── Makefile             # Comandos úteis
└── README.md
```

## 🔧 Comandos Úteis

```bash
# Desenvolvimento
make dev                 # Inicia ambiente de desenvolvimento
make build              # Compila backend e frontend
make test               # Executa todos os testes

# Docker
make docker-build       # Constrói imagens Docker
make docker-run         # Inicia todos os serviços
make docker-stop        # Para todos os serviços

# Banco de dados
make db-up              # Inicia apenas PostgreSQL e Redis
make db-migrate         # Executa migrações
make db-studio          # Abre Prisma Studio

# Utilitários
make format             # Formata código
make lint               # Executa linters
make clean              # Limpa arquivos de build
```

## 🌐 Endpoints da API

### Autenticação
- `POST /api/auth/login` - Login

### Usuários
- `GET /api/users/me` - Perfil do usuário
- `PUT /api/users/me` - Atualizar perfil
- `GET /api/users` - Listar usuários
- `POST /api/users` - Criar usuário

### WhatsApp
- `POST /api/whatsapp/sessions` - Criar sessão
- `GET /api/whatsapp/sessions` - Listar sessões
- `GET /api/whatsapp/sessions/:id/qr` - Obter QR Code
- `POST /api/whatsapp/sessions/:id/start` - Iniciar sessão

### Kanban
- `GET /api/kanban/quadros` - Listar quadros
- `POST /api/kanban/quadros` - Criar quadro
- `PUT /api/kanban/quadros/:id` - Atualizar quadro

## 🔐 Variáveis de Ambiente

Consulte o arquivo `.env.example` para todas as variáveis necessárias.

## 📝 Licença

Este projeto está sob licença MIT.

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📞 Suporte

Para suporte, entre em contato através do email: suporte@tappyone.com
