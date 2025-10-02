import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://159.65.34.199:8081'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token de autorização necessário' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const userId = params.id
    
    console.log('🔍 [FILAS USER] Buscando filas para usuário:', userId)

    // Fazer requisição para o backend Go
    const response = await fetch(`${BACKEND_URL}/api/filas/user/${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    console.log('📡 [FILAS USER] Status da resposta:', response.status)

    if (!response.ok) {
      const errorData = await response.text()
      console.error(`❌ [FILAS USER] Backend error: ${response.status} - ${errorData}`)
      return NextResponse.json(
        { error: 'Erro ao buscar filas do usuário' },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('✅ [FILAS USER] Filas encontradas:', data)
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ [FILAS USER] Erro na API:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
