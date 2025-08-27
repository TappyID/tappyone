# Chat Interno - Requisitos Backend

## 📋 Novos Modelos Prisma Necessários

### 1. MensagemInterna
```prisma
model MensagemInterna {
  id              String            @id @default(cuid())
  conteudo        String?
  tipo            TipoMensagemInterna
  urlArquivo      String?           // Para imagens, vídeos, documentos
  nomeArquivo     String?
  tamanhoArquivo  Int?
  duracao         Int?              // Para áudios/vídeos em segundos
  remetenteId     String
  destinatarioId  String
  lida            Boolean           @default(false)
  lidaEm          DateTime?
  editada         Boolean           @default(false)
  editadaEm       DateTime?
  respondendoId   String?           // Resposta a outra mensagem
  criadoEm        DateTime          @default(now())
  atualizadoEm    DateTime          @updatedAt

  // Relacionamentos
  remetente       Usuario           @relation("MensagemInternaRemetente", fields: [remetenteId], references: [id])
  destinatario    Usuario           @relation("MensagemInternaDestinatario", fields: [destinatarioId], references: [id])
  respondendo     MensagemInterna?  @relation("RespostaMensagemInterna", fields: [respondendoId], references: [id])
  respostas       MensagemInterna[] @relation("RespostaMensagemInterna")

  @@map("mensagens_internas")
}

enum TipoMensagemInterna {
  TEXTO
  IMAGEM
  VIDEO
  AUDIO
  DOCUMENTO
  EMOJI
}
```

### 2. StatusAtendente
```prisma
model StatusAtendente {
  id              String            @id @default(cuid())
  usuarioId       String            @unique
  status          StatusPresenca    @default(OFFLINE)
  ultimaAtividade DateTime          @default(now())
  mensagemStatus  String?           // Mensagem personalizada
  criadoEm        DateTime          @default(now())
  atualizadoEm    DateTime          @updatedAt

  // Relacionamentos
  usuario         Usuario           @relation(fields: [usuarioId], references: [id])

  @@map("status_atendentes")
}

enum StatusPresenca {
  ONLINE
  OCUPADO
  AUSENTE
  OFFLINE
}
```

### 3. ChamadaInterna
```prisma
model ChamadaInterna {
  id              String            @id @default(cuid())
  tipo            TipoChamada
  iniciadorId     String
  receptorId      String
  status          StatusChamada     @default(INICIANDO)
  duracaoSegundos Int?
  iniciadaEm      DateTime          @default(now())
  finalizadaEm    DateTime?
  canceladaEm     DateTime?
  motivoCancelamento String?

  // Relacionamentos
  iniciador       Usuario           @relation("ChamadaInternaIniciador", fields: [iniciadorId], references: [id])
  receptor        Usuario           @relation("ChamadaInternaReceptor", fields: [receptorId], references: [id])

  @@map("chamadas_internas")
}

enum TipoChamada {
  VOZ
  VIDEO
}

enum StatusChamada {
  INICIANDO
  TOCANDO
  ATENDIDA
  FINALIZADA
  CANCELADA
  NAO_ATENDIDA
}
```

### 4. AvaliacaoAtendente
```prisma
model AvaliacaoAtendente {
  id              String            @id @default(cuid())
  avaliadorId     String            // Admin que avaliou
  atendenteId     String            // Atendente avaliado
  nota            Int               // 1-5
  comentario      String?
  categoria       CategoriaAvaliacao
  periodo         DateTime          // Período da avaliação
  criadoEm        DateTime          @default(now())

  // Relacionamentos
  avaliador       Usuario           @relation("AvaliacaoAvaliador", fields: [avaliadorId], references: [id])
  atendente       Usuario           @relation("AvaliacaoAtendente", fields: [atendenteId], references: [id])

  @@map("avaliacoes_atendentes")
}

enum CategoriaAvaliacao {
  ATENDIMENTO
  PONTUALIDADE
  QUALIDADE
  PROATIVIDADE
  COMUNICACAO
}
```

### 5. AtendenteTag (Relacionamento Many-to-Many)
```prisma
model AtendenteTag {
  id          String   @id @default(cuid())
  atendenteId String
  tagId       String
  aplicadaPor String   // Admin que aplicou a tag
  criadoEm    DateTime @default(now())

  // Relacionamentos
  atendente   Usuario  @relation("AtendenteTagAtendente", fields: [atendenteId], references: [id])
  tag         Tag      @relation(fields: [tagId], references: [id])
  admin       Usuario  @relation("AtendenteTagAdmin", fields: [aplicadaPor], references: [id])

  @@unique([atendenteId, tagId])
  @@map("atendente_tags")
}
```

## 🔌 WebSocket Backend (Go)

### Estrutura WebSocket
```go
// internal/websocket/hub.go
type Hub struct {
    clients    map[*Client]bool
    broadcast  chan []byte
    register   chan *Client
    unregister chan *Client
    rooms      map[string]map[*Client]bool // Salas por usuário
}

type Client struct {
    hub      *Hub
    conn     *websocket.Conn
    send     chan []byte
    userID   string
    userType string // "admin" ou "atendente"
}

type Message struct {
    Type         string    `json:"type"`
    From         string    `json:"from"`
    To           string    `json:"to"`
    Content      string    `json:"content"`
    MessageType  string    `json:"messageType"`
    Timestamp    time.Time `json:"timestamp"`
    FileURL      string    `json:"fileUrl,omitempty"`
    FileName     string    `json:"fileName,omitempty"`
}
```

### Tipos de Mensagem WebSocket
- `message` - Nova mensagem
- `typing` - Usuário digitando
- `status_change` - Mudança de status
- `call_request` - Solicitação de chamada
- `call_answer` - Resposta da chamada
- `call_end` - Fim da chamada
- `file_upload` - Upload de arquivo
- `read_receipt` - Confirmação de leitura

## 🛠 Endpoints API Necessários

### Chat Interno
```
GET    /api/chat-interno/conversas          # Lista conversas do admin
GET    /api/chat-interno/mensagens/:userId  # Mensagens com um atendente
POST   /api/chat-interno/mensagem           # Enviar mensagem
PUT    /api/chat-interno/mensagem/:id/lida  # Marcar como lida
POST   /api/chat-interno/arquivo            # Upload de arquivo
DELETE /api/chat-interno/mensagem/:id       # Deletar mensagem
```

### Status e Presença
```
GET    /api/atendentes/status               # Status de todos atendentes
PUT    /api/atendentes/status               # Atualizar próprio status
GET    /api/atendentes/online               # Lista atendentes online
```

### Chamadas
```
POST   /api/chamadas/iniciar                # Iniciar chamada
PUT    /api/chamadas/:id/atender            # Atender chamada
PUT    /api/chamadas/:id/finalizar          # Finalizar chamada
GET    /api/chamadas/historico/:userId      # Histórico de chamadas
```

### Avaliações
```
GET    /api/avaliacoes/atendente/:id        # Avaliações do atendente
POST   /api/avaliacoes/atendente            # Criar avaliação
GET    /api/avaliacoes/estatisticas/:id     # Estatísticas do atendente
```

### Tags e Filas (Integração)
```
POST   /api/atendentes/:id/tags             # Aplicar tag ao atendente
DELETE /api/atendentes/:id/tags/:tagId      # Remover tag
PUT    /api/atendentes/:id/fila             # Atribuir fila
GET    /api/atendentes/:id/kanban           # Ver cards do atendente
```

## 📁 Estrutura de Arquivos Backend

```
backend/
├── internal/
│   ├── websocket/
│   │   ├── hub.go
│   │   ├── client.go
│   │   └── message.go
│   ├── handlers/
│   │   ├── chat_interno.go
│   │   ├── atendente_status.go
│   │   ├── chamadas.go
│   │   └── avaliacoes.go
│   ├── services/
│   │   ├── chat_service.go
│   │   ├── file_service.go
│   │   └── notification_service.go
│   └── models/
│       └── chat_interno.go
```

## 🔄 Fluxo de Implementação

1. **Adicionar modelos ao Prisma**
2. **Implementar WebSocket Hub**
3. **Criar handlers de API**
4. **Integrar com upload de arquivos**
5. **Implementar notificações**
6. **Conectar frontend com WebSocket**
7. **Testes e validação**
