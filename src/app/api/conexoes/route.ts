import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://159.65.34.199:8081'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Token não fornecido' },
        { status: 401 }
      )
    }

    console.log('🔌 [CONEXOES] Buscando conexões do usuário')

    const response = await fetch(`${BACKEND_URL}/api/conexoes`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('❌ [CONEXOES] Erro do backend:', errorData)
      return NextResponse.json(
        { error: `Erro do backend: ${response.status}`, details: errorData },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('✅ [CONEXOES] Conexões retornadas:', data.conexoes?.length || 0)

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('❌ [CONEXOES] Erro:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar conexões', details: error.message },
      { status: 500 }
    )
  }
}
