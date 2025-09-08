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

willian@pop-os:~/Área de Trabalho/tappyone$ tree
.
├── backend
│   ├── backend.exe
│   ├── cmd
│   │   ├── cleanup
│   │   │   └── main.go
│   │   ├── create-users
│   │   │   └── main.go
│   │   ├── fix-data
│   │   │   └── main.go
│   │   ├── force-migrate
│   │   │   └── main.go
│   │   ├── hash-password
│   │   │   └── main.go
│   │   ├── migrate
│   │   │   └── main.go
│   │   ├── seed
│   │   │   └── main.go
│   │   ├── server
│   │   │   └── main.go
│   │   └── verify
│   │       └── main.go
│   ├── debug-users.sh
│   ├── docker-compose.yml
│   ├── execute_migration.sql
│   ├── fix_conversa_id.sql
│   ├── go.mod
│   ├── go.sum
│   ├── hash-password.py
│   ├── internal
│   │   ├── config
│   │   │   └── config.go
│   │   ├── database
│   │   │   ├── connection.go
│   │   │   └── migrate.go
│   │   ├── handlers
│   │   │   ├── agendamentos.go
│   │   │   ├── agentes.go
│   │   │   ├── alertas.go
│   │   │   ├── anotacoes.go
│   │   │   ├── assinaturas.go
│   │   │   ├── automacao.go
│   │   │   ├── cobranca.go
│   │   │   ├── connection.go
│   │   │   ├── contatos.go
│   │   │   ├── conteudo.go
│   │   │   ├── conversas.go
│   │   │   ├── dashboard.go
│   │   │   ├── filas.go
│   │   │   ├── fluxos.go
│   │   │   ├── handlers.go
│   │   │   ├── media.go
│   │   │   ├── orcamentos.go
│   │   │   ├── quadros.go
│   │   │   ├── resposta_rapida.go
│   │   │   ├── sessoes_whatsapp.go
│   │   │   ├── tags.go
│   │   │   ├── websocket.go
│   │   │   ├── whatsapp_media.go
│   │   │   ├── whatsapp_messages.go
│   │   │   └── whatsapp_webhook.go
│   │   ├── middleware
│   │   │   └── auth.go
│   │   ├── models
│   │   │   ├── alerta.go
│   │   │   ├── business.go
│   │   │   ├── connection.go
│   │   │   ├── fila.go
│   │   │   ├── kanban.go
│   │   │   ├── models.go
│   │   │   └── resposta_rapida.go
│   │   ├── repositories
│   │   │   ├── connection.go
│   │   │   └── resposta_rapida.go
│   │   ├── router
│   │   │   └── router.go
│   │   ├── services
│   │   │   ├── auth.go
│   │   │   ├── connection.go
│   │   │   ├── container.go
│   │   │   ├── fluxo_execution.go
│   │   │   ├── resposta_rapida.go
│   │   │   └── services.go
│   │   └── utils
│   │       ├── auth.go
│   │       └── jwt_helper.go
│   ├── main
│   ├── main.exe~
│   ├── migrations
│   │   ├── 003_create_user_connections.sql
│   │   ├── 004_create_respostas_rapidas.sql
│   │   ├── 005_add_fallback_column.sql
│   │   ├── 006_add_four_flows_models.sql
│   │   ├── 007_create_filas.sql
│   │   └── 008_create_alertas.sql
│   ├── server.exe
│   ├── tappyone-backend.exe
│   ├── tappyone.exe
│   └── uploads
│       ├── 310e9601-43c7-47b0-a90b-eda25457a85b.webm
│       ├── b8bad996-1e77-4ff7-a55b-728d26d61d32.webm
│       ├── image_1755731484_5064423287112488080.png
│       ├── image_1755732003_9094473375331457521.png
│       ├── image_1755748128_3924296544761732182.jpg
│       ├── image_1755967098_552774381403125978.png
│       ├── image_1755986956_4201472931247472518.png
│       ├── image_1755990905_9127488985225322364.jpg
│       ├── image_1756004489_5660485623990068710.png
│       ├── image_1756004512_8328325833960183727.png
│       ├── image_1756131013_7034549275172208424.webp
│       ├── voice_message-1755732496.webm
│       ├── voice_message-1755732560.webm
│       ├── voice_message-1755732694.webm
│       ├── voice_message-1755733273.webm
│       ├── voice_message-1755733412.webm
│       ├── voice_message-1755733616.webm
│       ├── voice_message-1755733727.webm
│       ├── voice_message-1755734314.webm
│       ├── voice_message-1755734707.webm
│       ├── voice_message-1755737933.webm
│       ├── voice_message-1755737966.webm
│       ├── voice_message-1755738282.webm
│       ├── voice_message-1755738348.webm
│       ├── voice_message-1755739741.webm
│       └── voice_message-1755739816.webm
├── debug-logs
│   ├── kanban-debug-2025-08-31.json
│   ├── kanban-debug-2025-09-01.json
│   ├── kanban-debug-2025-09-02.json
│   ├── kanban-debug-2025-09-03.json
│   ├── kanban-debug-2025-09-04.json
│   ├── kanban-debug-2025-09-05.json
│   └── kanban-debug-2025-09-06.json
├── documentacao
├── fluxo-filtros-permissoes.md
├── logo-branca.svg
├── logo.svg
├── Makefile
├── memoriaGloba.md
├── middleware.ts
├── next.config.js
├── next-env.d.ts
├── node_modules
│   ├── autoprefixer -> .pnpm/autoprefixer@10.4.21_postcss@8.5.6/node_modules/autoprefixer
│   ├── axios -> .pnpm/axios@1.11.0/node_modules/axios
│   ├── bcryptjs -> .pnpm/bcryptjs@3.0.2/node_modules/bcryptjs
│   ├── class-variance-authority -> .pnpm/class-variance-authority@0.7.1/node_modules/class-variance-authority
│   ├── clsx -> .pnpm/clsx@2.1.1/node_modules/clsx
│   ├── cors -> .pnpm/cors@2.8.5/node_modules/cors
│   ├── date-fns -> .pnpm/date-fns@3.6.0/node_modules/date-fns
│   ├── @dnd-kit
│   │   ├── core -> ../.pnpm/@dnd-kit+core@6.3.1_react-dom@18.3.1_react@18.3.1/node_modules/@dnd-kit/core
│   │   ├── sortable -> ../.pnpm/@dnd-kit+sortable@10.0.0_@dnd-kit+core@6.3.1_react@18.3.1/node_modules/@dnd-kit/sortable
│   │   └── utilities -> ../.pnpm/@dnd-kit+utilities@3.2.2_react@18.3.1/node_modules/@dnd-kit/utilities
│   ├── @emotion
│   │   ├── react -> ../.pnpm/@emotion+react@11.14.0_@types+react@18.3.23_react@18.3.1/node_modules/@emotion/react
│   │   └── styled -> ../.pnpm/@emotion+styled@11.14.1_@emotion+react@11.14.0_@types+react@18.3.23_react@18.3.1/node_modules/@emotion/styled
│   ├── @eslint
│   │   ├── eslintrc -> ../.pnpm/@eslint+eslintrc@2.1.4/node_modules/@eslint/eslintrc
│   │   └── js -> ../.pnpm/@eslint+js@8.57.1/node_modules/@eslint/js
│   ├── eslint -> .pnpm/eslint@8.57.1/node_modules/eslint
│   ├── @eslint-community
│   │   ├── eslint-utils -> ../.pnpm/@eslint-community+eslint-utils@4.7.0_eslint@8.57.1/node_modules/@eslint-community/eslint-utils
│   │   └── regexpp -> ../.pnpm/@eslint-community+regexpp@4.12.1/node_modules/@eslint-community/regexpp
│   ├── eslint-config-next -> .pnpm/eslint-config-next@14.0.4_eslint@8.57.1_typescript@5.9.2/node_modules/eslint-config-next
│   ├── eslint-import-resolver-node -> .pnpm/eslint-import-resolver-node@0.3.9/node_modules/eslint-import-resolver-node
│   ├── eslint-import-resolver-typescript -> .pnpm/eslint-import-resolver-typescript@3.10.1_eslint-plugin-import@2.32.0_eslint@8.57.1/node_modules/eslint-import-resolver-typescript
│   ├── eslint-module-utils -> .pnpm/eslint-module-utils@2.12.1_@typescript-eslint+parser@6.21.0_eslint-import-resolver-node@0.3.9_5re4sdu5dxklrkqjhl4kblqr4y/node_modules/eslint-module-utils
│   ├── eslint-plugin-import -> .pnpm/eslint-plugin-import@2.32.0_@typescript-eslint+parser@6.21.0_eslint-import-resolver-typescript@3.10.1_eslint@8.57.1/node_modules/eslint-plugin-import
│   ├── eslint-plugin-jsx-a11y -> .pnpm/eslint-plugin-jsx-a11y@6.10.2_eslint@8.57.1/node_modules/eslint-plugin-jsx-a11y
│   ├── eslint-plugin-react -> .pnpm/eslint-plugin-react@7.37.5_eslint@8.57.1/node_modules/eslint-plugin-react
│   ├── eslint-plugin-react-hooks -> .pnpm/eslint-plugin-react-hooks@5.0.0-canary-7118f5dd7-20230705_eslint@8.57.1/node_modules/eslint-plugin-react-hooks
│   ├── eslint-scope -> .pnpm/eslint-scope@7.2.2/node_modules/eslint-scope
│   ├── eslint-visitor-keys -> .pnpm/eslint-visitor-keys@3.4.3/node_modules/eslint-visitor-keys
│   ├── express -> .pnpm/express@5.1.0/node_modules/express
│   ├── framer-motion -> .pnpm/framer-motion@10.18.0_react-dom@18.3.1_react@18.3.1/node_modules/framer-motion
│   ├── @hookform
│   │   └── resolvers -> ../.pnpm/@hookform+resolvers@3.10.0_react-hook-form@7.61.1/node_modules/@hookform/resolvers
│   ├── lucide-react -> .pnpm/lucide-react@0.303.0_react@18.3.1/node_modules/lucide-react
│   ├── @mui
│   │   ├── material -> ../.pnpm/@mui+material@7.3.2_@emotion+react@11.14.0_@emotion+styled@11.14.1_@types+react@18.3.23_react-dom@18.3.1_react@18.3.1/node_modules/@mui/material
│   │   └── x-charts-pro -> ../.pnpm/@mui+x-charts-pro@8.11.0_@emotion+react@11.14.0_@emotion+styled@11.14.1_@mui+material@7.3.2_@_q3pea24bvs2fy62udt37s7frii/node_modules/@mui/x-charts-pro
│   ├── @next
│   │   └── eslint-plugin-next -> ../.pnpm/@next+eslint-plugin-next@14.0.4/node_modules/@next/eslint-plugin-next
│   ├── next -> .pnpm/next@14.0.4_react-dom@18.3.1_react@18.3.1/node_modules/next
│   ├── next-auth -> .pnpm/next-auth@4.24.11_next@14.0.4_nodemailer@7.0.6_react-dom@18.3.1_react@18.3.1/node_modules/next-auth
│   ├── @nivo
│   │   └── funnel -> ../.pnpm/@nivo+funnel@0.99.0_react-dom@18.3.1_react@18.3.1/node_modules/@nivo/funnel
│   ├── nodemailer -> .pnpm/nodemailer@7.0.6/node_modules/nodemailer
│   ├── postcss -> .pnpm/postcss@8.5.6/node_modules/postcss
│   ├── @prisma
│   │   └── client -> ../.pnpm/@prisma+client@5.22.0_prisma@5.22.0/node_modules/@prisma/client
│   ├── prisma -> .pnpm/prisma@5.22.0/node_modules/prisma
│   ├── @radix-ui
│   │   ├── react-avatar -> ../.pnpm/@radix-ui+react-avatar@1.1.10_@types+react-dom@18.3.7_@types+react@18.3.23_react-dom@18.3.1_react@18.3.1/node_modules/@radix-ui/react-avatar
│   │   ├── react-dialog -> ../.pnpm/@radix-ui+react-dialog@1.1.14_@types+react-dom@18.3.7_@types+react@18.3.23_react-dom@18.3.1_react@18.3.1/node_modules/@radix-ui/react-dialog
│   │   ├── react-dropdown-menu -> ../.pnpm/@radix-ui+react-dropdown-menu@2.1.15_@types+react-dom@18.3.7_@types+react@18.3.23_react-dom@18.3.1_react@18.3.1/node_modules/@radix-ui/react-dropdown-menu
│   │   ├── react-icons -> ../.pnpm/@radix-ui+react-icons@1.3.2_react@18.3.1/node_modules/@radix-ui/react-icons
│   │   ├── react-label -> ../.pnpm/@radix-ui+react-label@2.1.7_@types+react-dom@18.3.7_@types+react@18.3.23_react-dom@18.3.1_react@18.3.1/node_modules/@radix-ui/react-label
│   │   ├── react-popover -> ../.pnpm/@radix-ui+react-popover@1.1.14_@types+react-dom@18.3.7_@types+react@18.3.23_react-dom@18.3.1_react@18.3.1/node_modules/@radix-ui/react-popover
│   │   ├── react-select -> ../.pnpm/@radix-ui+react-select@2.2.5_@types+react-dom@18.3.7_@types+react@18.3.23_react-dom@18.3.1_react@18.3.1/node_modules/@radix-ui/react-select
│   │   ├── react-separator -> ../.pnpm/@radix-ui+react-separator@1.1.7_@types+react-dom@18.3.7_@types+react@18.3.23_react-dom@18.3.1_react@18.3.1/node_modules/@radix-ui/react-separator
│   │   ├── react-slot -> ../.pnpm/@radix-ui+react-slot@1.2.3_@types+react@18.3.23_react@18.3.1/node_modules/@radix-ui/react-slot
│   │   ├── react-switch -> ../.pnpm/@radix-ui+react-switch@1.2.5_@types+react-dom@18.3.7_@types+react@18.3.23_react-dom@18.3.1_react@18.3.1/node_modules/@radix-ui/react-switch
│   │   ├── react-tabs -> ../.pnpm/@radix-ui+react-tabs@1.1.12_@types+react-dom@18.3.7_@types+react@18.3.23_react-dom@18.3.1_react@18.3.1/node_modules/@radix-ui/react-tabs
│   │   └── react-toast -> ../.pnpm/@radix-ui+react-toast@1.2.14_@types+react-dom@18.3.7_@types+react@18.3.23_react-dom@18.3.1_react@18.3.1/node_modules/@radix-ui/react-toast
│   ├── react -> .pnpm/react@18.3.1/node_modules/react
│   ├── react-beautiful-dnd -> .pnpm/react-beautiful-dnd@13.1.1_react-dom@18.3.1_react@18.3.1/node_modules/react-beautiful-dnd
│   ├── react-country-flag -> .pnpm/react-country-flag@3.1.0_react@18.3.1/node_modules/react-country-flag
│   ├── react-dom -> .pnpm/react-dom@18.3.1_react@18.3.1/node_modules/react-dom
│   ├── reactflow -> .pnpm/reactflow@11.11.4_@types+react@18.3.23_react-dom@18.3.1_react@18.3.1/node_modules/reactflow
│   ├── react-hook-form -> .pnpm/react-hook-form@7.61.1_react@18.3.1/node_modules/react-hook-form
│   ├── react-hot-toast -> .pnpm/react-hot-toast@2.5.2_react-dom@18.3.1_react@18.3.1/node_modules/react-hot-toast
│   ├── react-window -> .pnpm/react-window@1.8.11_react-dom@18.3.1_react@18.3.1/node_modules/react-window
│   ├── react-window-infinite-loader -> .pnpm/react-window-infinite-loader@1.0.10_react-dom@18.3.1_react@18.3.1/node_modules/react-window-infinite-loader
│   ├── recharts -> .pnpm/recharts@3.1.2_@types+react@18.3.23_react-dom@18.3.1_react-is@19.1.1_react@18.3.1_redux@5.0.1/node_modules/recharts
│   ├── @rushstack
│   │   └── eslint-patch -> ../.pnpm/@rushstack+eslint-patch@1.12.0/node_modules/@rushstack/eslint-patch
│   ├── socket.io-client -> .pnpm/socket.io-client@4.8.1/node_modules/socket.io-client
│   ├── tailwindcss -> .pnpm/tailwindcss@3.4.17/node_modules/tailwindcss
│   ├── tailwindcss-animate -> .pnpm/tailwindcss-animate@1.0.7_tailwindcss@3.4.17/node_modules/tailwindcss-animate
│   ├── tailwind-merge -> .pnpm/tailwind-merge@2.6.0/node_modules/tailwind-merge
│   ├── tsx -> .pnpm/tsx@4.20.3/node_modules/tsx
│   ├── @types
│   │   ├── bcryptjs -> ../.pnpm/@types+bcryptjs@3.0.0/node_modules/@types/bcryptjs
│   │   ├── cors -> ../.pnpm/@types+cors@2.8.19/node_modules/@types/cors
│   │   ├── express -> ../.pnpm/@types+express@5.0.3/node_modules/@types/express
│   │   ├── node -> ../.pnpm/@types+node@20.19.9/node_modules/@types/node
│   │   ├── nodemailer -> ../.pnpm/@types+nodemailer@7.0.1/node_modules/@types/nodemailer
│   │   ├── react -> ../.pnpm/@types+react@18.3.23/node_modules/@types/react
│   │   ├── react-beautiful-dnd -> ../.pnpm/@types+react-beautiful-dnd@13.1.8/node_modules/@types/react-beautiful-dnd
│   │   ├── react-dom -> ../.pnpm/@types+react-dom@18.3.7_@types+react@18.3.23/node_modules/@types/react-dom
│   │   └── react-window -> ../.pnpm/@types+react-window@1.8.8/node_modules/@types/react-window
│   ├── typescript -> .pnpm/typescript@5.9.2/node_modules/typescript
│   ├── @typescript-eslint
│   │   ├── parser -> ../.pnpm/@typescript-eslint+parser@6.21.0_eslint@8.57.1_typescript@5.9.2/node_modules/@typescript-eslint/parser
│   │   ├── scope-manager -> ../.pnpm/@typescript-eslint+scope-manager@6.21.0/node_modules/@typescript-eslint/scope-manager
│   │   ├── types -> ../.pnpm/@typescript-eslint+types@6.21.0/node_modules/@typescript-eslint/types
│   │   ├── typescript-estree -> ../.pnpm/@typescript-eslint+typescript-estree@6.21.0_typescript@5.9.2/node_modules/@typescript-eslint/typescript-estree
│   │   └── visitor-keys -> ../.pnpm/@typescript-eslint+visitor-keys@6.21.0/node_modules/@typescript-eslint/visitor-keys
│   ├── @vercel
│   │   └── blob -> ../.pnpm/@vercel+blob@1.1.1/node_modules/@vercel/blob
│   └── zod -> .pnpm/zod@3.25.76/node_modules/zod
├── package.json
├── pnpm-lock.yaml
├── postcss.config.js
├── prisma
│   └── schema.prisma
├── public
│   ├── favicon.svg
│   ├── favicon-white.svg
│   ├── logo-branca.svg
│   └── logo.svg
├── README.md
├── src
│   ├── app
│   │   ├── adminrecovery
│   │   │   └── page.tsx
│   │   ├── api
│   │   │   ├── admin
│   │   │   │   └── generate-password
│   │   │   │       └── route.ts
│   │   │   ├── agendamentos
│   │   │   │   ├── batch
│   │   │   │   ├── [id]
│   │   │   │   │   └── route.ts
│   │   │   │   └── route.ts
│   │   │   ├── agentes
│   │   │   │   ├── ativos
│   │   │   │   │   └── route.ts
│   │   │   │   ├── [id]
│   │   │   │   │   ├── route.ts
│   │   │   │   │   └── toggle
│   │   │   │   │       └── route.ts
│   │   │   │   └── route.ts
│   │   │   ├── ai
│   │   │   │   └── generate
│   │   │   │       └── route.ts
│   │   │   ├── alertas
│   │   │   │   ├── [id]
│   │   │   │   │   └── route.ts
│   │   │   │   └── route.ts
│   │   │   ├── anotacoes
│   │   │   │   ├── batch
│   │   │   │   └── route.ts
│   │   │   ├── assinaturas
│   │   │   │   ├── batch
│   │   │   │   ├── [id]
│   │   │   │   │   ├── route.ts
│   │   │   │   │   └── status
│   │   │   │   │       └── route.ts
│   │   │   │   └── route.ts
│   │   │   ├── atendentes
│   │   │   │   ├── [id]
│   │   │   │   │   └── route.ts
│   │   │   │   └── route.ts
│   │   │   ├── atendimentos
│   │   │   │   └── stats
│   │   │   ├── auth
│   │   │   │   ├── forgot-password
│   │   │   │   │   └── route.ts
│   │   │   │   ├── login
│   │   │   │   │   └── route.ts
│   │   │   │   ├── me
│   │   │   │   │   └── route.ts
│   │   │   │   └── reset-password
│   │   │   │       └── route.ts
│   │   │   ├── chat-agentes
│   │   │   │   └── [chatId]
│   │   │   │       ├── activate
│   │   │   │       │   └── route.ts
│   │   │   │       ├── deactivate
│   │   │   │       │   └── route.ts
│   │   │   │       └── route.ts
│   │   │   ├── connections
│   │   │   │   ├── route.ts
│   │   │   │   └── whatsapp
│   │   │   │       ├── route.ts
│   │   │   │       ├── [sessionName]
│   │   │   │       │   └── route.ts
│   │   │   │       └── sync
│   │   │   │           └── [sessionName]
│   │   │   │               └── route.ts
│   │   │   ├── contatos
│   │   │   │   ├── export
│   │   │   │   │   └── route.ts
│   │   │   │   ├── [id]
│   │   │   │   │   ├── dados-completos
│   │   │   │   │   │   └── route.ts
│   │   │   │   │   ├── route.ts
│   │   │   │   │   └── tags
│   │   │   │   │       └── route.ts
│   │   │   │   ├── import
│   │   │   │   │   └── route.ts
│   │   │   │   ├── route.ts
│   │   │   │   └── stats
│   │   │   │       └── route.ts
│   │   │   ├── debug-logs
│   │   │   │   └── route.ts
│   │   │   ├── filas
│   │   │   │   ├── [id]
│   │   │   │   │   └── route.ts
│   │   │   │   └── route.ts
│   │   │   ├── files
│   │   │   │   └── [...path]
│   │   │   │       └── route.ts
│   │   │   ├── fluxos
│   │   │   │   ├── [id]
│   │   │   │   │   ├── execute
│   │   │   │   │   │   └── route.ts
│   │   │   │   │   ├── route.ts
│   │   │   │   │   └── toggle
│   │   │   │   │       └── route.ts
│   │   │   │   ├── route.ts
│   │   │   │   └── stats
│   │   │   │       └── route.ts
│   │   │   ├── kanban
│   │   │   │   ├── card-movement
│   │   │   │   │   └── route.ts
│   │   │   │   ├── column-create
│   │   │   │   │   └── route.ts
│   │   │   │   ├── column-delete
│   │   │   │   │   └── route.ts
│   │   │   │   ├── column-edit
│   │   │   │   │   └── route.ts
│   │   │   │   ├── coluna
│   │   │   │   │   ├── [id]
│   │   │   │   │   │   └── color
│   │   │   │   │   │       └── route.ts
│   │   │   │   │   └── reorder
│   │   │   │   │       └── route.ts
│   │   │   │   ├── colunas
│   │   │   │   │   └── route.ts
│   │   │   │   ├── [id]
│   │   │   │   │   └── metadata
│   │   │   │   │       └── route.ts
│   │   │   │   └── quadros
│   │   │   │       ├── [id]
│   │   │   │       │   └── route.ts
│   │   │   │       └── route.ts
│   │   │   ├── link-preview
│   │   │   │   └── route.ts
│   │   │   ├── media
│   │   │   │   └── [...path]
│   │   │   │       └── route.ts
│   │   │   ├── orcamentos
│   │   │   │   ├── batch
│   │   │   │   └── route.ts
│   │   │   ├── respostas-rapidas
│   │   │   │   ├── categorias
│   │   │   │   └── route.ts
│   │   │   ├── sessoes-whatsapp
│   │   │   │   └── route.ts
│   │   │   ├── tags
│   │   │   │   ├── [id]
│   │   │   │   │   ├── contatos
│   │   │   │   │   │   └── route.ts
│   │   │   │   │   └── route.ts
│   │   │   │   └── route.ts
│   │   │   ├── transcribe
│   │   │   │   └── route.ts
│   │   │   ├── translate
│   │   │   │   └── route.ts
│   │   │   ├── upload
│   │   │   │   ├── blob
│   │   │   │   │   └── route.ts
│   │   │   │   └── blob-from-backend
│   │   │   │       └── route.ts
│   │   │   ├── usuarios
│   │   │   │   └── route.ts
│   │   │   ├── waha
│   │   │   │   ├── [sessionName]
│   │   │   │   │   ├── auth
│   │   │   │   │   │   └── qr
│   │   │   │   │   │       └── route.ts
│   │   │   │   │   └── screenshot
│   │   │   │   │       └── route.ts
│   │   │   │   └── sessions
│   │   │   │       ├── route.ts
│   │   │   │       └── [sessionName]
│   │   │   │           ├── route.ts
│   │   │   │           ├── start
│   │   │   │           │   └── route.ts
│   │   │   │           └── stop
│   │   │   │               └── route.ts
│   │   │   ├── webhooks
│   │   │   │   └── whatsapp
│   │   │   │       └── route.ts
│   │   │   └── whatsapp
│   │   │       ├── chats
│   │   │       │   ├── [chatId]
│   │   │       │   │   ├── archive
│   │   │       │   │   │   └── route.ts
│   │   │       │   │   ├── contact
│   │   │       │   │   │   └── route.ts
│   │   │       │   │   ├── delete
│   │   │       │   │   │   └── route.ts
│   │   │       │   │   ├── file
│   │   │       │   │   │   └── route.ts
│   │   │       │   │   ├── image
│   │   │       │   │   │   └── route.ts
│   │   │       │   │   ├── messages
│   │   │       │   │   │   └── route.ts
│   │   │       │   │   ├── picture
│   │   │       │   │   │   └── route.ts
│   │   │       │   │   ├── read
│   │   │       │   │   │   └── route.ts
│   │   │       │   │   ├── seen
│   │   │       │   │   │   └── route.ts
│   │   │       │   │   ├── typing
│   │   │       │   │   │   ├── start
│   │   │       │   │   │   │   └── route.ts
│   │   │       │   │   │   └── stop
│   │   │       │   │   │       └── route.ts
│   │   │       │   │   ├── unarchive
│   │   │       │   │   │   └── route.ts
│   │   │       │   │   ├── video
│   │   │       │   │   │   └── route.ts
│   │   │       │   │   └── voice
│   │   │       │   │       └── route.ts
│   │   │       │   └── route.ts
│   │   │       ├── check-connection
│   │   │       │   └── route.ts
│   │   │       ├── contacts
│   │   │       │   └── route.ts
│   │   │       ├── groups
│   │   │       │   └── route.ts
│   │   │       ├── messages
│   │   │       │   ├── forward
│   │   │       │   │   └── route.ts
│   │   │       │   ├── [messageId]
│   │   │       │   │   ├── forward
│   │   │       │   │   │   └── route.ts
│   │   │       │   │   └── reaction
│   │   │       │   │       └── route.ts
│   │   │       │   └── star
│   │   │       │       └── route.ts
│   │   │       ├── reaction
│   │   │       │   └── route.ts
│   │   │       ├── reply
│   │   │       │   └── route.ts
│   │   │       ├── sendFile
│   │   │       │   └── route.ts
│   │   │       ├── sendImage
│   │   │       │   └── route.ts
│   │   │       ├── sendSeen
│   │   │       │   └── route.ts
│   │   │       ├── sendVideo
│   │   │       │   └── route.ts
│   │   │       ├── sessions
│   │   │       │   ├── route.ts
│   │   │       │   └── [sessionName]
│   │   │       │       ├── qr
│   │   │       │       │   └── route.ts
│   │   │       │       ├── route.ts
│   │   │       │       ├── start
│   │   │       │       │   └── route.ts
│   │   │       │       ├── status
│   │   │       │       │   └── route.ts
│   │   │       │       └── stop
│   │   │       │           └── route.ts
│   │   │       └── star
│   │   │           └── route.ts
│   │   ├── dashboard
│   │   │   ├── admin
│   │   │   │   ├── agendamentos
│   │   │   │   │   ├── components
│   │   │   │   │   │   ├── AgendamentoStats.tsx
│   │   │   │   │   │   ├── CalendarioSofisticado.tsx
│   │   │   │   │   │   ├── CriarAgendamentoModal.tsx
│   │   │   │   │   │   └── DetalhesAgendamentoModal.tsx
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── agentes
│   │   │   │   │   ├── components
│   │   │   │   │   │   ├── AgentesList.tsx
│   │   │   │   │   │   ├── CriarAgenteModal.tsx
│   │   │   │   │   │   └── EstatisticasAgentes.tsx
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── alertas
│   │   │   │   │   ├── components
│   │   │   │   │   │   ├── AlertasFilters.tsx
│   │   │   │   │   │   ├── AlertasHeader.tsx
│   │   │   │   │   │   ├── AlertasList.tsx
│   │   │   │   │   │   ├── AlertasStats.tsx
│   │   │   │   │   │   └── CriarAlertaModal.tsx
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── assinaturas
│   │   │   │   │   ├── components
│   │   │   │   │   │   ├── AssinaturasFilters.tsx
│   │   │   │   │   │   ├── AssinaturasHeader.tsx
│   │   │   │   │   │   ├── AssinaturasList.tsx
│   │   │   │   │   │   ├── AssinaturasStats.tsx
│   │   │   │   │   │   └── CriarAssinaturaModal.tsx
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── atendentes
│   │   │   │   │   ├── components
│   │   │   │   │   │   ├── AtendentesFilters.tsx
│   │   │   │   │   │   ├── AtendentesHeader.tsx
│   │   │   │   │   │   ├── AtendentesListSimplified.tsx
│   │   │   │   │   │   ├── AtendentesList.tsx
│   │   │   │   │   │   ├── AtendentesStats.tsx
│   │   │   │   │   │   ├── AtribuirFilaModal.tsx
│   │   │   │   │   │   ├── CriarAtendenteModalSimplified.tsx
│   │   │   │   │   │   ├── CriarAtendenteModal.tsx
│   │   │   │   │   │   ├── EditarAtendenteModal.tsx
│   │   │   │   │   │   └── VisualizarAtendenteModal.tsx
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── atendimentos
│   │   │   │   │   ├── components
│   │   │   │   │   │   ├── AnotacoesSidebar.tsx
│   │   │   │   │   │   ├── AtendimentosTopBar.tsx
│   │   │   │   │   │   ├── ChatArea.tsx
│   │   │   │   │   │   ├── ConversationSidebar.tsx
│   │   │   │   │   │   ├── EditTextModal.tsx
│   │   │   │   │   │   ├── InfiniteConversationSidebar.tsx
│   │   │   │   │   │   ├── modals
│   │   │   │   │   │   │   ├── AgendamentoModal.tsx
│   │   │   │   │   │   │   ├── AgenteSelectionModal.tsx
│   │   │   │   │   │   │   ├── AnotacoesModal.tsx
│   │   │   │   │   │   │   ├── AssinaturaModal.tsx
│   │   │   │   │   │   │   ├── CompartilharTelaModal.tsx
│   │   │   │   │   │   │   ├── LigacaoModal.tsx
│   │   │   │   │   │   │   ├── OrcamentoModal.tsx
│   │   │   │   │   │   │   ├── TagsModal.tsx
│   │   │   │   │   │   │   ├── TransferirAtendimentoModal.tsx
│   │   │   │   │   │   │   └── VideoChamadaModal.tsx
│   │   │   │   │   │   ├── OptimizedConversationSidebar.tsx
│   │   │   │   │   │   └── QuickActionsSidebar.tsx
│   │   │   │   │   ├── layout.tsx
│   │   │   │   │   ├── optimized-page.tsx
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── atendimentos-teste
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── chat-interno
│   │   │   │   │   ├── components
│   │   │   │   │   │   ├── AtendentesLista.tsx
│   │   │   │   │   │   ├── ChatInternoArea.tsx
│   │   │   │   │   │   ├── ChatInternoTopBar.tsx
│   │   │   │   │   │   └── MicroModals.tsx
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── components
│   │   │   │   │   ├── AdminLayout.tsx
│   │   │   │   │   ├── AgendaButton.tsx
│   │   │   │   │   ├── AgentSelector.tsx
│   │   │   │   │   ├── analytics
│   │   │   │   │   │   ├── FunnelAnalytics.tsx
│   │   │   │   │   │   ├── NCSAnalytics.tsx
│   │   │   │   │   │   └── OverviewAnalytics.tsx
│   │   │   │   │   ├── AnalyticsHub.tsx
│   │   │   │   │   ├── ChatToggle.tsx
│   │   │   │   │   ├── ColorThemeSelector.tsx
│   │   │   │   │   ├── ComponentInterfaces.ts
│   │   │   │   │   ├── GlassClock.tsx
│   │   │   │   │   ├── LanguageSelector.tsx
│   │   │   │   │   ├── NotificationsDropdown.tsx
│   │   │   │   │   ├── ProfileDropdown.tsx
│   │   │   │   │   ├── QuickResponsesButton.tsx
│   │   │   │   │   ├── QuoteButton.tsx
│   │   │   │   │   ├── SearchBar.tsx
│   │   │   │   │   ├── SidebarItem.tsx
│   │   │   │   │   ├── SidebarLogo.tsx
│   │   │   │   │   ├── sidebar-scrollbar.css
│   │   │   │   │   ├── SidebarToggle.tsx
│   │   │   │   │   ├── Sidebar.tsx
│   │   │   │   │   ├── SubscriptionButton.tsx
│   │   │   │   │   ├── ThemeToggle.tsx
│   │   │   │   │   ├── TopBarButton.tsx
│   │   │   │   │   └── TopBar.tsx
│   │   │   │   ├── conexoes
│   │   │   │   │   ├── components
│   │   │   │   │   │   ├── ActiveConnectionsTable.tsx
│   │   │   │   │   │   ├── ApiTest.tsx
│   │   │   │   │   │   ├── ConnectionsGrid.tsx
│   │   │   │   │   │   ├── ConnectionStats.tsx
│   │   │   │   │   │   ├── EditConnectionModal.tsx
│   │   │   │   │   │   ├── NewConnectionModal.tsx
│   │   │   │   │   │   ├── SocialConnection.tsx
│   │   │   │   │   │   ├── ViewConnectionModal.tsx
│   │   │   │   │   │   └── WhatsAppConnection.tsx
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── configuracoes
│   │   │   │   │   ├── components
│   │   │   │   │   │   ├── BackupSection.tsx
│   │   │   │   │   │   ├── EmailSection.tsx
│   │   │   │   │   │   ├── GeralSection.tsx
│   │   │   │   │   │   ├── IntegracoesSection.tsx
│   │   │   │   │   │   ├── NotificacoesSection.tsx
│   │   │   │   │   │   ├── PerformanceSection.tsx
│   │   │   │   │   │   ├── PermissoesSection.tsx
│   │   │   │   │   │   ├── SegurancaSection.tsx
│   │   │   │   │   │   ├── TarefasSection.tsx
│   │   │   │   │   │   └── TemaSection.tsx
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── contatos
│   │   │   │   │   ├── components
│   │   │   │   │   │   ├── ContactActionModal.tsx
│   │   │   │   │   │   ├── ContatosList.tsx
│   │   │   │   │   │   ├── ContatosStats.tsx
│   │   │   │   │   │   ├── ContatosTopBar.tsx
│   │   │   │   │   │   ├── CreateContactModal.tsx
│   │   │   │   │   │   ├── ExportModal.tsx
│   │   │   │   │   │   └── ImportModal.tsx
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── debug
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── filas
│   │   │   │   │   ├── components
│   │   │   │   │   │   ├── CriarFilaModal.tsx
│   │   │   │   │   │   ├── FilasFilters.tsx
│   │   │   │   │   │   ├── FilasHeader.tsx
│   │   │   │   │   │   ├── FilasList.tsx
│   │   │   │   │   │   └── FilasStats.tsx
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── fluxograma
│   │   │   │   │   ├── components
│   │   │   │   │   │   ├── AiGeneratorModal.tsx
│   │   │   │   │   │   ├── CreateFluxoTab.tsx
│   │   │   │   │   │   ├── FlowEditor.tsx
│   │   │   │   │   │   ├── FluxoCard.tsx
│   │   │   │   │   │   ├── FluxoNodes.tsx
│   │   │   │   │   │   └── ViewFluxosTab.tsx
│   │   │   │   │   ├── page-clean.tsx
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── kanban
│   │   │   │   │   ├── components
│   │   │   │   │   │   ├── ColorPickerModal.tsx
│   │   │   │   │   │   ├── CriarCardModal.tsx
│   │   │   │   │   │   └── CriarQuadroModal.tsx
│   │   │   │   │   ├── [id]
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── orcamentos
│   │   │   │   │   ├── components
│   │   │   │   │   │   ├── ContatosSidebar.tsx
│   │   │   │   │   │   ├── CriarOrcamentoModal.tsx
│   │   │   │   │   │   ├── OrcamentoPDF.tsx
│   │   │   │   │   │   ├── OrcamentoStats.tsx
│   │   │   │   │   │   └── OrcamentoViewer.tsx
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── page.tsx
│   │   │   │   ├── respostas-rapidas
│   │   │   │   │   ├── components
│   │   │   │   │   │   ├── CategoriasList.tsx
│   │   │   │   │   │   ├── CriarCategoriaModal.tsx
│   │   │   │   │   │   ├── CriarComIAModal.tsx
│   │   │   │   │   │   ├── CriarRespostaModal.tsx
│   │   │   │   │   │   ├── EstatisticasCard.tsx
│   │   │   │   │   │   ├── RespostasList.tsx
│   │   │   │   │   │   └── VisualizarRespostaModal.tsx
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── tags
│   │   │   │   │   ├── components
│   │   │   │   │   │   ├── CriarTagModal.tsx
│   │   │   │   │   │   ├── EditarTagModal.tsx
│   │   │   │   │   │   ├── ImportarTagsModal.tsx
│   │   │   │   │   │   ├── TagsList.tsx
│   │   │   │   │   │   ├── TagsStats.tsx
│   │   │   │   │   │   └── TagsTopBar.tsx
│   │   │   │   │   ├── layout.tsx
│   │   │   │   │   └── page.tsx
│   │   │   │   └── usuarios
│   │   │   │       ├── components
│   │   │   │       │   ├── CriarUsuarioModal.tsx
│   │   │   │       │   ├── EditarUsuarioModal.tsx
│   │   │   │       │   ├── ImportarUsuariosModal.tsx
│   │   │   │       │   ├── PermissoesModal.tsx
│   │   │   │       │   ├── UsuariosList.tsx
│   │   │   │       │   └── UsuariosStats.tsx
│   │   │   │       ├── layout.tsx
│   │   │   │       └── page.tsx
│   │   │   ├── assinante
│   │   │   │   └── page.tsx
│   │   │   └── atendente
│   │   │       └── page.tsx
│   │   ├── globals.css
│   │   ├── landingpage
│   │   │   ├── components
│   │   │   │   ├── AboutSection.tsx
│   │   │   │   ├── BackgroundPatterns.tsx
│   │   │   │   ├── FeaturesSection.tsx
│   │   │   │   ├── Footer.tsx
│   │   │   │   ├── HeroSection.tsx
│   │   │   │   ├── Navigation.tsx
│   │   │   │   ├── PricingSection.tsx
│   │   │   │   └── TestimonialsSection.tsx
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── layout.tsx
│   │   ├── login
│   │   │   └── page.tsx
│   │   ├── page.tsx
│   │   └── reset-password
│   │       └── page.tsx
│   ├── components
│   │   ├── AudioMessageComponent.tsx
│   │   ├── DeleteConfirmTooltip.tsx
│   │   ├── EditMessageModal.tsx
│   │   ├── EmojiPicker.tsx
│   │   ├── ForwardMessageModal.tsx
│   │   ├── InputLinkPreview.tsx
│   │   ├── landing
│   │   │   ├── BenefitsSection.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── HeroSection.tsx
│   │   │   ├── NewsletterCTA.tsx
│   │   │   ├── PricingSection.tsx
│   │   │   ├── ServicesCarousel.tsx
│   │   │   └── TestimonialsSection.tsx
│   │   ├── LinkPreview.tsx
│   │   ├── MediaSendModal.tsx
│   │   ├── MessageContent.tsx
│   │   ├── MessageContextMenu.tsx
│   │   ├── MessageSearch.tsx
│   │   ├── shared
│   │   │   ├── AudioRecorder.tsx
│   │   │   ├── CookieConsent.tsx
│   │   │   ├── FloatingChat.tsx
│   │   │   ├── MediaUpload.tsx
│   │   │   ├── TopBar.tsx
│   │   │   └── UniversalAgendamentoModal.tsx
│   │   ├── ui
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── MediaSendModal.tsx
│   │   │   ├── SpecialMediaModal.tsx
│   │   │   └── VirtualizedList.tsx
│   │   └── VirtualizedChatArea.tsx
│   ├── contexts
│   │   ├── ColorThemeContext.tsx
│   │   └── ThemeContext.tsx
│   ├── hooks
│   │   ├── useAgentes.ts
│   │   ├── useAlertas.ts
│   │   ├── useAssinaturas.ts
│   │   ├── useAtendentes.ts
│   │   ├── useAtendimentoStats.ts
│   │   ├── useAudioRecorder.ts
│   │   ├── useAuth.ts
│   │   ├── useCachedAuth.ts
│   │   ├── useChatAgente.ts
│   │   ├── useContatoData.ts
│   │   ├── useContatoTags.ts
│   │   ├── useFavorites.ts
│   │   ├── useFilas.ts
│   │   ├── useInfiniteChats.ts
│   │   ├── useInfiniteMessages.ts
│   │   ├── useKanban.ts
│   │   ├── useMediaUpload.ts
│   │   ├── useMessageActions.ts
│   │   ├── useNotificationSound.ts
│   │   ├── useOptimizedAtendimentos.ts
│   │   ├── useOptimizedChats.ts
│   │   ├── useOrcamentos.ts
│   │   ├── usePresencePolling.ts
│   │   ├── usePresence.ts
│   │   ├── useRespostasRapidas.ts
│   │   ├── useTags.ts
│   │   ├── useTranslation.ts
│   │   ├── useWebSocket.ts
│   │   ├── useWhatsAppData.ts
│   │   └── useWhatsAppSession.ts
│   ├── lib
│   │   ├── blob-storage.ts
│   │   └── utils.ts
│   └── utils
│       ├── debugLogger.ts
│       ├── fileLogger.ts
│       ├── globalCache.ts
│       ├── linkDetector.ts
│       └── testSound.ts
├── tailwind.config.ts
└── tsconfig.json

324 directories, 490 files
willian@pop-os:~/Área de Trabalho/tappyone$ 