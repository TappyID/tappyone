import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'

// Forçar rota dinâmica para permitir uso de headers
export const dynamic = 'force-dynamic'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://159.65.34.199:8081'

export async function GET(request: NextRequest) {
  console.log('👤 [AUTH ME] GET route foi chamado!')
  
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ [AUTH ME] Token não encontrado no header')
      return NextResponse.json(
        { error: 'Token de autorização não encontrado' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7) // Remove "Bearer "s
    console.log('👤 [AUTH ME] Token extraído do header')

    console.log('👤 [AUTH ME] Enviando para backend:', `${BACKEND_URL}/api/auth/me`)

    const response = await fetch(`${BACKEND_URL}/api/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    console.log('📡 [AUTH ME] Status da resposta do backend:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ [AUTH ME] Erro do backend:', response.status, errorText)
      return NextResponse.json(
        { error: `Erro do backend: ${response.status} - ${errorText}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('✅ [AUTH ME] Dados do usuário obtidos com sucesso')
    
    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error('❌ [AUTH ME] Erro na API proxy:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
