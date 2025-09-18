'use client'

// Cache global para evitar requisições duplicadas
interface CacheEntry<T> {
  data: T
  timestamp: number
  expiry: number
  promise?: Promise<T> // Para evitar requisições simultâneas
}

class GlobalCache {
  private cache = new Map<string, CacheEntry<any>>()
  private pendingRequests = new Map<string, Promise<any>>()
  
  // Duração padrão do cache (5 minutos)
  private DEFAULT_CACHE_DURATION = 5 * 60 * 1000
  
  async get<T>(
    key: string, 
    fetchFn: () => Promise<T>, 
    cacheDuration?: number
  ): Promise<T> {
    const now = Date.now()
    const duration = cacheDuration || this.DEFAULT_CACHE_DURATION
    
    // Verificar se tem cache válido
    const cached = this.cache.get(key)
    if (cached && now < cached.timestamp + cached.expiry) {
      return cached.data
    }
    
    // Verificar se já tem uma requisição em andamento para essa chave
    const pendingRequest = this.pendingRequests.get(key)
    if (pendingRequest) {
      return pendingRequest
    }
    
    // Fazer nova requisição
    const request = fetchFn().then(data => {
      // Salvar no cache
      this.cache.set(key, {
        data,
        timestamp: now,
        expiry: duration
      })
      
      // Remover da lista de pendentes
      this.pendingRequests.delete(key)
      
      return data
    }).catch(error => {
      // Remover da lista de pendentes em caso de erro
      this.pendingRequests.delete(key)
      
      // Se tem cache expirado, usar ele
      if (cached) {
        console.warn(`Usando cache expirado para ${key} devido ao erro:`, error)
        return cached.data
      }
      
      throw error
    })
    
    // Adicionar à lista de pendentes
    this.pendingRequests.set(key, request)
    
    return request
  }
  
  // Limpar cache específico
  invalidate(key: string) {
    this.cache.delete(key)
    this.pendingRequests.delete(key)
  }
  
  // Limpar cache por padrão (regex)
  invalidatePattern(pattern: RegExp) {
    const keys = [...this.cache.keys()]
    for (const key of keys) {
      if (pattern.test(key)) {
        this.invalidate(key)
      }
    }
  }
  
  // Limpar tudo
  clear() {
    this.cache.clear()
    this.pendingRequests.clear()
  }
  
  // Verificar se tem no cache (sem buscar)
  has(key: string): boolean {
    const cached = this.cache.get(key)
    if (!cached) return false
    
    const now = Date.now()
    return now < cached.timestamp + cached.expiry
  }
  
  // Pré-carregar dados
  preload<T>(key: string, data: T, cacheDuration?: number) {
    const duration = cacheDuration || this.DEFAULT_CACHE_DURATION
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiry: duration
    })
  }
  
  // Stats do cache
  getStats() {
    return {
      cacheSize: this.cache.size,
      pendingRequests: this.pendingRequests.size,
      keys: [...this.cache.keys()]
    }
  }
}

// Instância global única
export const globalCache = new GlobalCache()

// Helper para chaves de cache padronizadas
export const cacheKeys = {
  // Auth
  authMe: (token: string) => `auth:me:${token.slice(-10)}`,
  
  // WhatsApp
  whatsappChats: (token: string) => `whatsapp:chats:${token.slice(-10)}`,
  whatsappGroups: (token: string) => `whatsapp:groups:${token.slice(-10)}`,
  whatsappMessages: (chatId: string) => `whatsapp:messages:${chatId}`,
  
  // Contatos
  contatos: (token: string) => `contatos:${token.slice(-10)}`,
  contatoById: (id: string) => `contato:${id}`,
  
  // Tags e Filas
  tags: (token: string) => `tags:${token.slice(-10)}`,
  filas: (token: string) => `filas:${token.slice(-10)}`,
  
  // Kanban
  kanbanQuadros: (token: string) => `kanban:quadros:${token.slice(-10)}`,
  kanbanMetadata: (quadroId: string) => `kanban:metadata:${quadroId}`,
  
  // WAHA
  wahaContacts: (userId: string) => `waha:contacts:${userId}`,
  wahaChats: (userId: string) => `waha:chats:${userId}`
}

// Cache para erros 500 - evita requests repetidos quando backend está falhando
const serverErrorCache = new Map<string, number>()
const SERVER_ERROR_CACHE_DURATION = 30 * 1000 // 30 segundos

// Helper para fazer requisições com cache
export async function fetchWithCache<T>(
  key: string,
  url: string,
  options: RequestInit = {},
  cacheDuration?: number
): Promise<T> {
  // Verificar se houve erro 500 recente nesta URL
  const errorKey = `error_${url}`
  const lastError = serverErrorCache.get(errorKey)
  if (lastError && Date.now() - lastError < SERVER_ERROR_CACHE_DURATION) {
    throw new Error(`HTTP 500: Server Error (cached - avoiding repeated requests)`)
  }
  
  return globalCache.get(
    key,
    () => fetch(url, options).then(res => {
      if (!res.ok) {
        // Cache erros 500+ para evitar spam de requests
        if (res.status >= 500) {
          serverErrorCache.set(errorKey, Date.now())
        }
        throw new Error(`HTTP ${res.status}: ${res.statusText}`)
      }
      return res.json()
    }),
    cacheDuration
  )
}
