// Utilitário para gerenciar URLs de API com suporte a proxy HTTPS

export function getApiUrl(type: 'waha' | 'backend', path: string = ''): string {
  const isProduction = typeof window !== 'undefined' && window.location.protocol === 'https:'
  
  if (type === 'waha') {
    // WAHA API
    const baseUrl = isProduction 
      ? '/api/waha-proxy' 
      : 'http://159.65.34.199:3001'
    return `${baseUrl}${path}`
  } else {
    // Backend API
    const baseUrl = isProduction 
      ? '/api/backend-proxy' 
      : 'http://159.65.34.199:8081'
    return `${baseUrl}${path}`
  }
}

// Headers padrão para WAHA
export const WAHA_HEADERS = {
  'X-Api-Key': 'tappyone-waha-2024-secretkey',
  'Content-Type': 'application/json'
}

// Função helper para requisições
export async function fetchApi(
  type: 'waha' | 'backend',
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = getApiUrl(type, path)
  
  // Adicionar headers padrão
  const headers = {
    ...options.headers,
    ...(type === 'waha' ? WAHA_HEADERS : {})
  }
  
  // Adicionar token se for backend
  if (type === 'backend') {
    // Token fixo mais longo (1 ano) para desenvolvimento
    const FALLBACK_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiZmI4ZGExZDctZDI4Zi00ZWY5LWI4YjAtZTAxZjc0NjZmNTc4IiwiZW1haWwiOiJyb2RyaWdvQGNybS50YXBweS5pZCIsInJvbGUiOiJBRE1JTiIsImlzcyI6InRhcHB5b25lLWNybSIsInN1YiI6ImZiOGRhMWQ3LWQyOGYtNGVmOS1iOGIwLWUwMWY3NDY2ZjU3OCIsImV4cCI6MTc1OTE2MzcwMSwibmJmIjoxNzU4NTU4OTAxLCJpYXQiOjE3NTg1NTg5MDF9.xY9ikMSOHMcatFdierE3-bTw-knQgSmqxASRSHUZqfw'
    
    let token = localStorage.getItem('token') || FALLBACK_TOKEN
    
    // Se o token do localStorage expirou, usar o fallback e atualizar localStorage
    try {
      if (token !== FALLBACK_TOKEN) {
        // Decodificar JWT para verificar expiração
        const payload = JSON.parse(atob(token.split('.')[1]))
        const now = Math.floor(Date.now() / 1000)
        
        if (payload.exp && payload.exp < now) {
          console.log(' Token expirado, usando fallback')
          token = FALLBACK_TOKEN
          localStorage.setItem('token', FALLBACK_TOKEN)
        }
      }
    } catch (error) {
      console.log(' Erro ao verificar token, usando fallback')
      token = FALLBACK_TOKEN
      localStorage.setItem('token', FALLBACK_TOKEN)
    }
    
    if (token) {
      // Se o token não começar com Bearer, adicionar
      headers['Authorization'] = token.startsWith('Bearer ') ? token : `Bearer ${token}`
    }
  }
  return fetch(url, {
    ...options,
    headers
  })
}
