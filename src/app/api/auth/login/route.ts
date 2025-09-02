import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8081'

export async function POST(request: NextRequest) {
  console.log('🔑 [LOGIN API] POST route foi chamado!')
  
  try {
    const body = await request.json()
    console.log('🔑 [LOGIN API] Body parseado:', { email: body.email, senha: '***' })

    console.log('🔑 [LOGIN API] Enviando para backend:', `${BACKEND_URL}/api/auth/login`)

    const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    console.log('📡 [LOGIN API] Status da resposta do backend:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ [LOGIN API] Erro do backend:', response.status, errorText)
      return NextResponse.json(
        { error: `Erro do backend: ${response.status} - ${errorText}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('✅ [LOGIN API] Login realizado com sucesso')
    
    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error('❌ [LOGIN API] Erro na API proxy:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
