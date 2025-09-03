import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { user_id } = await request.json()

    if (!user_id) {
      return NextResponse.json(
        { error: 'user_id é obrigatório' },
        { status: 400 }
      )
    }

    const sessionName = `user_${user_id}`
    const wahaUrl = process.env.WAHA_URL || 'http://localhost:3000'
    const wahaApiKey = process.env.WAHA_API_KEY || 'your-secret-api-key-here'

    // Verificar se a sessão existe no WAHA
    const wahaResponse = await fetch(`${wahaUrl}/api/sessions/${sessionName}`, {
      headers: {
        'Accept': 'application/json',
        'X-API-Key': wahaApiKey
      }
    })

    if (wahaResponse.ok) {
      const sessionData = await wahaResponse.json()
      
      // Verificar se a sessão está ativa (WORKING)
      const isConnected = sessionData.status === 'WORKING'
      const isActive = sessionData.status === 'WORKING'

      if (isConnected) {
        // Salvar no localStorage via response headers
        return NextResponse.json({
          connected: true,
          active: true,
          session: sessionData,
          timestamp: Date.now()
        })
      }
    }

    // Se chegou aqui, não está conectado
    return NextResponse.json({
      connected: false,
      active: false,
      timestamp: Date.now()
    })

  } catch (error) {
    console.error('Erro ao verificar conexão:', error)
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}
