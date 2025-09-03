import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api.tappy.id'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get('token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Token não encontrado' }, { status: 401 })
    }

    // Buscar dados completos do contato pelo chatId
    const response = await fetch(`${BACKEND_URL}/api/contatos/chat/${params.id}/dados-completos`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        // Contato não encontrado, retornar dados vazios
        return NextResponse.json({
          id: params.id,
          fila: null,
          tags: [],
          atendente: null,
          kanbanBoard: null,
          orcamento: null,
          agendamento: null
        })
      }
      
      const errorData = await response.text()
      return NextResponse.json(
        { error: `Erro do backend: ${response.status}`, details: errorData },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)

  } catch (error) {
    console.error('Erro ao buscar dados completos do contato:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
