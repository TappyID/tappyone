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

    // Buscar orçamentos do chat
    const query = `
      SELECT id, titulo, status, valor, data_criacao
      FROM orcamentos 
      WHERE chat_id = $1
      ORDER BY data_criacao DESC
    `

    // Simulação da consulta - substitua pela sua implementação de DB
    // const result = await db.query(query, [chatId])
    
    // Por enquanto, retornar mock baseado no chatId
    const mockOrcamentos = [
      {
        id: '1',
        titulo: 'Proposta Sistema CRM',
        status: 'enviado'
      },
      {
        id: '2',
        titulo: 'Orçamento Consultoria',
        status: 'aprovado'
      }
    ]

    return NextResponse.json(mockOrcamentos)
  } catch (error) {
    console.error('Erro ao buscar orçamentos do chat:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
