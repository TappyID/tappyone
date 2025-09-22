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
    const token = localStorage.getItem('token')
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
  }
  
  return fetch(url, {
    ...options,
    headers
  })
}
