// Função utilitária para obter a URL base da API
export const getApiUrl = () => {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081'
}

// Função para construir URLs da API
export const buildApiUrl = (endpoint: string) => {
  const baseUrl = getApiUrl()
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint
  return `${baseUrl}/${cleanEndpoint}`
}
