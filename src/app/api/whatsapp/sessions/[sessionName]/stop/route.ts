import { NextRequest, NextResponse } from 'next/server'

// Forçar rota dinâmica
export const dynamic = 'force-dynamic'

const WAHA_URL = process.env.NEXT_PUBLIC_WAHA_API_URL || 'http://159.65.34.199:3001'
const WAHA_API_KEY = process.env.NEXT_PUBLIC_WAHA_API_KEY || 'tappyone-waha-2024-secretkey'

export async function POST(
  request: NextRequest,
  { params }: { params: { sessionName: string } }
) {
  try {
    const { sessionName } = params
    
    // Parar sessão no WAHA
    const wahaUrl = `${WAHA_URL}/api/sessions/${sessionName}/stop`
    
    const response = await fetch(wahaUrl, {
      method: 'POST',
      headers: {
        'X-Api-Key': WAHA_API_KEY,
        'Content-Type': 'application/json',
        'accept': 'application/json'
      }
    })

    if (!response.ok) {
      console.error(`❌ [SESSION ${sessionName} STOP] Erro do WAHA:`, response.status)
      
      // Se for 404, a sessão já foi removida
      if (response.status === 404) {
        return NextResponse.json({
          message: 'Sessão já estava parada ou não existe',
          stopped: true
        })
      }
      
      const errorText = await response.text()
      return NextResponse.json(
        { error: `Erro do WAHA: ${response.status}`, details: errorText },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json({
      message: 'Sessão parada com sucesso',
      ...data
    })
    
  } catch (error) {
    console.error(`❌ [SESSION ${params.sessionName} STOP] Erro interno:`, error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
