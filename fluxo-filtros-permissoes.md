# 📋 FLUXO DE FILTROS E PERMISSÕES - TAPPYONE

## 🎯 VISÃO GERAL
Sistema completo de permissões e filtragem para controle de acesso de atendentes aos chats/contatos.

## 🏗️ ESTRUTURA ATUAL (JÁ IMPLEMENTADO)

### ✅ Páginas Administrativas
- `/dashboard/admin/atendentes` - Gestão de atendentes
- `/dashboard/admin/kanban` - Gestão de quadros Kanban
- `/dashboard/admin/contatos` - Gestão de contatos (vinculado via contact_id ao WAHA)
- `/dashboard/admin/filas` - Gestão de filas com atendentes vinculados
- `/dashboard/admin/tags` - Gestão de tags

### ✅ Dados Disponíveis
- **Filas**: Nome, descrição, cor, atendentes vinculados
- **Atendentes**: Dados completos dos usuários
- **Contatos**: Vinculados ao WAHA via contact_id
- **Tags**: Sistema de tags real implementado
- **Kanban**: Quadros e cards existentes

## 🔄 FLUXO DE PERMISSÕES

### 1. **ADMIN - Configuração de Filas**
```
Admin cria fila → Escolhe atendentes → Escolhe contatos que a fila atende
```

### 2. **ADMIN - Configuração de Atendentes**
```
Admin cria atendente → Pode escolher contatos específicos por atendente
```

### 3. **ADMIN - Vinculação Kanban**
```
Fila pode ser associada a quadro Kanban → Mostra no chat
```

### 4. **ATENDENTE - Acesso Restrito**
```
Atendente acessa /dashboard/assinante/atendimentos
↓
Vê apenas chats das suas filas + contatos designados especificamente
```

## 🎛️ SISTEMA DE FILTRAGEM

### **Admin Dashboard (`/dashboard/admin/atendimentos`)**
- ✅ Ver todos os chats
- ✅ Filtrar por fila
- ✅ Filtrar por tag real
- ✅ Filtrar por atendente
- ✅ Filtrar por kanban
- 🔄 Filtrar por valor de orçamento (via contact_id)
- 🔄 Filtrar por agenda (via contact_id)
- ✅ Controle em tempo real

### **Atendente Dashboard (`/dashboard/assinante/atendimentos`)**
- 🔄 Clone do admin com permissões restritas
- 🔄 Só vê chats das suas filas
- 🔄 Só vê contatos designados para ele
- 🔄 Mesmos filtros, mas dados limitados

## 📊 DADOS NO CHAT

### **Informações Mostradas**
```
Chat Individual:
├── Nome do contato
├── Última mensagem
├── Tags reais aplicadas pelo admin
├── Fila responsável
├── Atendente designado
├── Badge do Kanban (se vinculado)
└── Status online/typing
```

### **Botão Tags no Topo**
```html
<!-- Badge Tag -->
<motion.button onClick={() => setShowTagsModal(true)}>
  <Hash className="w-4 h-4" />
  <div className="badge"></div>
</motion.button>
```
- 🔄 Modal mostra tags reais do contato
- 🔄 Admin pode adicionar/remover tags
- 🔄 Integração com sistema de tags existente

## 🔗 VINCULAÇÕES DE DADOS

### **Contato ↔ WAHA**
```
Contato.contact_id === WAHA.chat.id
```

### **Contato ↔ Orçamento**
```
Orcamento.contact_id === Contato.id
```

### **Contato ↔ Agenda**
```
Agendamento.contact_id === Contato.id
```

### **Fila ↔ Atendente**
```
FilaAtendente (Many-to-Many)
```

### **Fila ↔ Contato**
```
🔄 Implementar: FilaContato (Many-to-Many)
```

### **Atendente ↔ Contato**
```
🔄 Implementar: AtendenteContato (Many-to-Many)
```

## 🚀 IMPLEMENTAÇÃO NECESSÁRIA

### **1. Corrigir ConversationSidebar**
- ❌ Remover todos os mocks
- ✅ Usar apenas dados reais
- ✅ Integrar com hooks existentes
- ✅ Mostrar fila e atendente real

### **2. Sistema de Permissões**
```typescript
interface ChatPermission {
  userId: string
  canViewChat: (chatId: string) => boolean
  allowedQueues: string[]
  allowedContacts: string[]
}
```

### **3. Filtragem Avançada**
```typescript
interface ChatFilters {
  queues: string[]
  tags: string[]
  attendants: string[]
  kanbans: string[]
  budgetRange: { min: number, max: number }
  hasSchedule: boolean
}
```

### **4. Clone Atendente Dashboard**
- 🔄 Copiar `/dashboard/admin/atendimentos` para `/dashboard/assinante/atendimentos`
- 🔄 Aplicar filtros de permissão
- 🔄 Manter mesma UI, dados restritos

## ⚠️ CUIDADOS IMPORTANTES

### **Segurança**
- ✅ Validar permissões no backend
- ✅ Não expor dados não autorizados via API
- ✅ JWT com role-based access

### **Performance**
- ✅ Cache de permissões
- ✅ Lazy loading de chats
- ✅ Otimizar queries por permissão

### **Dados Reais**
- ❌ Zero mocks em produção
- ✅ Fallbacks apenas para dados não encontrados
- ✅ Loading states adequados

## 📝 PRÓXIMOS PASSOS

1. ✅ Corrigir erro ConversationSidebar (remover mocks)
2. 🔄 Implementar FilaContato e AtendenteContato no backend
3. 🔄 Criar APIs de permissão
4. 🔄 Integrar tags reais no topo do chat
5. 🔄 Clone dashboard atendente com permissões
6. 🔄 Teste completo do fluxo

---
**Status**: 🔄 Em Desenvolvimento  
**Última Atualização**: 2025-09-01 02:49  
**Responsável**: Admin Dashboard Enhancement
