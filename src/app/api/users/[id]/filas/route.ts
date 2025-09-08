import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔍 [USER FILAS API] Buscando filas do usuário:', params.id)
    
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 })
    }

    const response = await fetch(`${API_URL}/api/users/${params.id}/filas`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('❌ [USER FILAS API] Erro na resposta do backend:', response.status, errorData)
      return NextResponse.json(
        { error: `Erro do servidor: ${response.status}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('✅ [USER FILAS API] Filas do usuário obtidas:', data)

    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ [USER FILAS API] Erro interno:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('📝 [USER FILAS API] Atualizando filas do usuário:', params.id)
    
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 })
    }

    const body = await request.json()
    console.log('📝 [USER FILAS API] Dados recebidos:', body)

    const response = await fetch(`${API_URL}/api/users/${params.id}/filas`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('❌ [USER FILAS API] Erro na resposta do backend:', response.status, errorData)
      return NextResponse.json(
        { error: `Erro do servidor: ${response.status}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('✅ [USER FILAS API] Filas do usuário atualizadas:', data)

    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ [USER FILAS API] Erro interno:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
