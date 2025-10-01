import { NextRequest, NextResponse } from 'next/server'

// URL do backend baseado no ambiente
const getBackendUrl = () => {
  // Em produção, usar a URL da Digital Ocean
  if (process.env.NODE_ENV === 'production') {
    return process.env.BACKEND_URL || 'http://159.65.34.199:8081'
  }
  // Em desenvolvimento, tentar primeiro localhost, depois Digital Ocean
  return process.env.BACKEND_URL || 'http://159.65.34.199:8081'
}

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')
    const { searchParams } = new URL(request.url)
    
    if (!token) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 })
    }


    // Construir query params
    const queryParams = new URLSearchParams()
    const filaId = searchParams.get('fila_id')
    const responsavelId = searchParams.get('responsavel_id')
    
    if (filaId) queryParams.append('fila_id', filaId)
    if (responsavelId) queryParams.append('responsavel_id', responsavelId)

    const backendUrl = getBackendUrl()
    const url = `${backendUrl}/api/chats/stats${queryParams.toString() ? '?' + queryParams.toString() : ''}`
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
      },
    })

    const data = await response.json()
    
    if (!response.ok) {
      console.error('❌ [STATS] Erro do backend:', data)
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data)

  } catch (error) {
    console.error('❌ [STATS] Erro na API:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
