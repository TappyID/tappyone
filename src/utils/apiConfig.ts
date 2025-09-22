/**
 * Configuração dinâmica de APIs baseada no ambiente
 * Resolve o problema de Mixed Content (HTTPS/HTTP) automaticamente
 */

// Função para detectar se estamos em produção HTTPS
const isProduction = () => {
  if (typeof window === 'undefined') return false
  return window.location.protocol === 'https:' && window.location.hostname !== 'localhost'
}

// Configuração das URLs base
export const API_CONFIG = {
  // WAHA API - WhatsApp
  WAHA: {
    get baseUrl() {
      if (isProduction()) {
        // Em produção HTTPS, usar proxy ou HTTPS se disponível
        return process.env.NEXT_PUBLIC_WAHA_HTTPS_URL || '/api/waha-proxy'
      }
      // Em desenvolvimento, usar HTTP direto
      return process.env.NEXT_PUBLIC_WAHA_API_URL || 'http://159.65.34.199:3001'
    },
    get apiKey() {
      return process.env.NEXT_PUBLIC_WAHA_API_KEY || 'tappyone-waha-2024-secretkey'
    }
  },

  // Backend API - Go
  BACKEND: {
    get baseUrl() {
      if (isProduction()) {
        // Em produção, usar proxy ou HTTPS se disponível
        return process.env.NEXT_PUBLIC_BACKEND_HTTPS_URL || '/api/backend-proxy'
      }
      // Em desenvolvimento, usar HTTP direto
      return process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8081'
    }
  }
}

// Headers padrão com autenticação
export const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  }
}

// Headers para WAHA API
export const getWahaHeaders = () => ({
  'Content-Type': 'application/json',
  'X-API-Key': API_CONFIG.WAHA.apiKey
})

// Função helper para fazer requests seguros
export const safeFetch = async (endpoint: string, options: RequestInit = {}) => {
  const isWahaEndpoint = endpoint.includes('/api/user_') || endpoint.includes('/chats') || endpoint.includes('/messages')
  const baseUrl = isWahaEndpoint ? API_CONFIG.WAHA.baseUrl : API_CONFIG.BACKEND.baseUrl
  const headers = isWahaEndpoint ? getWahaHeaders() : getAuthHeaders()
  
  const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint}`
  
  console.log(`🌐 [safeFetch] ${options.method || 'GET'} ${url}`)
  
  return fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...options.headers
    }
  })
}

export default API_CONFIG
