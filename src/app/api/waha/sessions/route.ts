import { NextRequest, NextResponse } from 'next/server'

const WAHA_API_URL = process.env.NEXT_PUBLIC_WAHA_API_URL || 'http://159.65.34.199:3001'
const WAHA_API_KEY = process.env.NEXT_PUBLIC_WAHA_API_KEY || 'tappyone-waha-2024-secretkey'

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 [WAHA PROXY] POST /sessions - Criando sessão WAHA')
    
    const body = await request.json()
    console.log('📝 [WAHA PROXY] Dados da sessão:', body)

    const response = await fetch(`${WAHA_API_URL}/api/sessions`, {
      method: 'POST',
      headers: {
        'X-Api-Key': WAHA_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })

    console.log('📡 [WAHA PROXY] Status WAHA:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ [WAHA PROXY] Erro WAHA:', response.status, errorText)
      return NextResponse.json(
        { error: `Erro WAHA: ${response.status}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('✅ [WAHA PROXY] Sessão criada:', data)
    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ [WAHA PROXY] Erro interno:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    console.log('🔍 [WAHA PROXY] GET /sessions - Listando sessões WAHA')

    const response = await fetch(`${WAHA_API_URL}/api/sessions`, {
      method: 'GET',
      headers: {
        'X-Api-Key': WAHA_API_KEY
      }
    })

    console.log('📡 [WAHA PROXY] Status WAHA:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ [WAHA PROXY] Erro WAHA:', response.status, errorText)
      return NextResponse.json(
        { error: `Erro WAHA: ${response.status}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('✅ [WAHA PROXY] Sessões obtidas:', data)
    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ [WAHA PROXY] Erro interno:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
