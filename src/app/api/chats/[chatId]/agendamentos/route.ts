import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    const { chatId } = params

    if (!chatId) {
      return NextResponse.json({ error: 'Chat ID é obrigatório' }, { status: 400 })
    }

    // Buscar agendamentos do chat
    const query = `
      SELECT id, titulo, status, data_agendamento
      FROM agendamentos 
      WHERE chat_id = $1
      ORDER BY data_agendamento DESC
    `

    // Simulação da consulta - substitua pela sua implementação de DB
    // const result = await db.query(query, [chatId])
    
    // Por enquanto, retornar mock baseado no chatId
    const mockAgendamentos = [
      {
        id: '1',
        titulo: 'Reunião de Apresentação',
        status: 'agendado'
      },
      {
        id: '2',
        titulo: 'Follow-up Proposta',
        status: 'concluido'
      }
    ]

    return NextResponse.json(mockAgendamentos)
  } catch (error) {
    console.error('Erro ao buscar agendamentos do chat:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
