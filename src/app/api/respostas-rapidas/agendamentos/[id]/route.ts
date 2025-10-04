import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://159.65.34.199:8081'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader) {
      return NextResponse.json({ error: 'Authorization header missing' }, { status: 401 })
    }

    const { id } = params
    console.log('🗑️ [AGENDAMENTO] Cancelando agendamento:', id)

    const response = await fetch(`${BACKEND_URL}/api/respostas-rapidas/agendamentos/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': authHeader
      }
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('❌ [AGENDAMENTO] Erro ao cancelar:', data)
      return NextResponse.json(data, { status: response.status })
    }

    console.log('✅ [AGENDAMENTO] Cancelado com sucesso')
    return NextResponse.json(data)

  } catch (error) {
    console.error('❌ [AGENDAMENTO] Erro:', error)
    return NextResponse.json(
      { error: 'Erro ao cancelar agendamento' },
      { status: 500 }
    )
  }
}
