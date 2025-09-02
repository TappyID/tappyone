import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://159.65.34.199:3001/'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [WHATSAPP GROUPS] GET route chamado')
    
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      console.log('❌ [WHATSAPP GROUPS] Token não fornecido')
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 })
    }

    console.log('🔑 [WHATSAPP GROUPS] Token encontrado')
    console.log('📡 [WHATSAPP GROUPS] Fazendo chamada para backend:', `${BACKEND_URL}/api/whatsapp/groups`)

    // Proxy para o backend Go
    const response = await fetch(`${BACKEND_URL}/api/whatsapp/groups`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      }
    })

    console.log('📡 [WHATSAPP GROUPS] Status da resposta do backend:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ [WHATSAPP GROUPS] Erro do backend:', response.status, errorText)
      return NextResponse.json(
        { error: `Erro do backend: ${response.status}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('✅ [WHATSAPP GROUPS] Dados obtidos do backend:', data?.length || 0, 'grupos')
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ [WHATSAPP GROUPS] Erro interno:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
