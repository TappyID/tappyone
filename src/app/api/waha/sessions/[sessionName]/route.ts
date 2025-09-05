import { NextRequest, NextResponse } from 'next/server'

const WAHA_API_URL = process.env.NEXT_PUBLIC_WAHA_API_URL || 'http://159.65.34.199:3001'
const WAHA_API_KEY = process.env.NEXT_PUBLIC_WAHA_API_KEY || 'tappyone-waha-2024-secretkey'

export async function GET(request: NextRequest, { params }: { params: { sessionName: string } }) {
  try {
    console.log(`🔍 [WAHA PROXY] GET /sessions/${params.sessionName} - Status da sessão`)

    const response = await fetch(`${WAHA_API_URL}/api/sessions/${params.sessionName}`, {
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
    console.log('✅ [WAHA PROXY] Status da sessão:', data)
    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ [WAHA PROXY] Erro interno:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { sessionName: string } }) {
  try {
    console.log(`🗑️ [WAHA PROXY] DELETE /sessions/${params.sessionName} - Deletando sessão`)

    const response = await fetch(`${WAHA_API_URL}/api/sessions/${params.sessionName}`, {
      method: 'DELETE',
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
    console.log('✅ [WAHA PROXY] Sessão deletada:', data)
    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ [WAHA PROXY] Erro interno:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
