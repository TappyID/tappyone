import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://159.65.34.199:8081'
const WAHA_URL = process.env.NEXT_PUBLIC_WAHA_URL || 'http://159.65.34.199:3001'

export async function POST(
  request: NextRequest,
  { params }: { params: { sessionName: string } }
) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader) {
      return NextResponse.json({ error: 'Authorization header missing' }, { status: 401 })
    }

    const { sessionName } = params
    console.log('🔄 [RESTART] Reiniciando sessão:', sessionName)

    // Chamar endpoint de restart da WAHA
    const wahaResponse = await fetch(`${WAHA_URL}/api/sessions/${sessionName}/restart`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!wahaResponse.ok) {
      const error = await wahaResponse.text()
      console.error('❌ [RESTART] Erro WAHA:', error)
      return NextResponse.json({ error: 'Erro ao reiniciar sessão' }, { status: wahaResponse.status })
    }

    const data = await wahaResponse.json()
    console.log('✅ [RESTART] Sessão reiniciada:', data)

    return NextResponse.json({ 
      success: true, 
      message: 'Sessão reiniciada com sucesso',
      data 
    })

  } catch (error) {
    console.error('❌ [RESTART] Erro:', error)
    return NextResponse.json(
      { error: 'Erro ao reiniciar sessão' },
      { status: 500 }
    )
  }
}
