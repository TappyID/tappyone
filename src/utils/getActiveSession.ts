/**
 * Busca a sessão ativa do usuário
 * Para uso em API routes (server-side)
 */
export async function getActiveSession(authHeader: string): Promise<string | null> {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://159.65.34.199:8081'
    
    console.log('🔍 [getActiveSession] Buscando conexões do backend:', backendUrl)
    console.log('🔑 [getActiveSession] Auth header recebido:', authHeader ? 'Presente' : 'AUSENTE')
    
    const response = await fetch(`${backendUrl}/api/connections/`, {
      headers: {
        'Authorization': authHeader, // Já vem com "Bearer " incluído
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      console.error('❌ [getActiveSession] Erro ao buscar conexões:', response.status)
      return null
    }

    const data = await response.json()
    
    const connections = data.connections || []

    // Buscar primeira conexão WORKING
    const activeConnection = connections.find((conn: any) => {
      const sessionName = conn.sessionName || conn.session_name // Suporta ambos formatos
      return conn.status === 'WORKING' || conn.status === 'connected'
    })

    if (activeConnection) {
      const sessionName = activeConnection.sessionName || activeConnection.session_name
      return sessionName
    }

    return null
  } catch (error) {
    console.error('❌ [getActiveSession] Erro:', error)
    return null
  }
}

/**
 * Busca a sessão ativa do usuário
 * Para uso em componentes client-side
 */
export async function getActiveSessionClient(): Promise<string | null> {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      console.error('❌ [getActiveSessionClient] Token não encontrado')
      return null
    }

    const response = await fetch('/api/connections', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      console.error('❌ [getActiveSessionClient] Erro:', response.status)
      return null
    }

    const data = await response.json()
    const connections = data.connections || []

    const activeConnection = connections.find((conn: any) => 
      conn.status === 'WORKING' || conn.status === 'connected'
    )

    return activeConnection?.sessionName || null
  } catch (error) {
    console.error('❌ [getActiveSessionClient] Erro:', error)
    return null
  }
}
