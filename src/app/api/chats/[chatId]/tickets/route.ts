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

    // Buscar tickets do chat
    const query = `
      SELECT id, titulo, status, prioridade, data_criacao
      FROM tickets 
      WHERE chat_id = $1
      ORDER BY data_criacao DESC
    `

    // Simulação da consulta - substitua pela sua implementação de DB
    // const result = await db.query(query, [chatId])
    
    // Por enquanto, retornar mock baseado no chatId
    const mockTickets = [
      {
        id: '1',
        titulo: 'Suporte Técnico',
        status: 'aberto'
      },
      {
        id: '2',
        titulo: 'Dúvida sobre Funcionalidade',
        status: 'resolvido'
      }
    ]

    return NextResponse.json(mockTickets)
  } catch (error) {
    console.error('Erro ao buscar tickets do chat:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
