import { NextRequest, NextResponse } from 'next/server'

// Forçar rota dinâmica
export const dynamic = 'force-dynamic'

const WAHA_URL = process.env.NEXT_PUBLIC_WAHA_API_URL || 'http://159.65.34.199:3001'
const WAHA_API_KEY = process.env.NEXT_PUBLIC_WAHA_API_KEY || 'tappyone-waha-2024-secretkey'

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionName: string } }
) {
  try {
    const { sessionName } = params
    
    // Verificar se a sessão existe no WAHA primeiro
    const wahaUrl = `${WAHA_URL}/api/sessions`
    
    const response = await fetch(wahaUrl, {
      method: 'GET',
      headers: {
        'X-Api-Key': WAHA_API_KEY,
        'accept': 'application/json'
      }
    })

    if (!response.ok) {
      console.error(`❌ [SESSION ${sessionName} STATUS] Erro do WAHA:`, response.status)
      return NextResponse.json(
        { error: `Erro do WAHA: ${response.status}`, status: 'STOPPED' },
        { status: response.status }
      )
    }

    const sessions = await response.json()
    
    // Procurar a sessão específica
    const session = sessions.find((s: any) => s.name === sessionName)
    
    if (!session) {
      // Sessão não encontrada, retornar como STOPPED
      return NextResponse.json({
        status: 'STOPPED',
        name: sessionName,
        exists: false
      })
    }

    // Retornar o status da sessão encontrada
    return NextResponse.json({
      status: session.status,
      name: session.name,
      exists: true,
      ...session
    })

  } catch (error) {
    console.error(`❌ [SESSION ${params.sessionName} STATUS] Erro interno:`, error)
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        status: 'STOPPED'
      },
      { status: 500 }
    )
  }
}
