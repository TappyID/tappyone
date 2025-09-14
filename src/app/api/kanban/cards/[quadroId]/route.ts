import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://159.65.34.199:8081/'

export async function GET(
  request: NextRequest,
  { params }: { params: { quadroId: string } }
) {
  console.log('🃏 [KANBAN CARDS] GET route foi chamado para quadroId:', params.quadroId)
  
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('🃏 [KANBAN CARDS] Token não encontrado no header')
      return NextResponse.json(
        { error: 'Token de autorização não encontrado' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    console.log('🃏 [KANBAN CARDS] Token extraído do header')

    // Usar endpoint existente do backend que já funciona
    const backendUrl = `${BACKEND_URL}/api/kanban/quadros/${params.quadroId}`
    console.log('🃏 [KANBAN CARDS] Enviando para backend:', backendUrl)

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    console.log('🃏 [KANBAN CARDS] Status da resposta do backend:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('🃏 [KANBAN CARDS] Erro do backend:', response.status, errorText)
      return NextResponse.json(
        { error: `Erro do backend: ${response.status} - ${errorText}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('🃏 [KANBAN CARDS] Cards obtidos com sucesso:', data?.length || 0, 'cards')
    
    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error('🃏 [KANBAN CARDS] Erro na API proxy:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
