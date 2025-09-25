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

    // Buscar em qual coluna do Kanban o chat está
    const query = `
      SELECT k.id, k.nome, k.cor 
      FROM kanban_cards kc
      JOIN kanban_colunas k ON k.id = kc.coluna_id
      WHERE kc.chat_id = $1
      ORDER BY kc.created_at DESC
      LIMIT 1
    `

    // Simulação da consulta - substitua pela sua implementação de DB
    // const result = await db.query(query, [chatId])
    
    // Por enquanto, retornar mock baseado no chatId
    const mockKanbanStatus = {
      id: '1',
      nome: 'Prospecção',
      cor: '#3b82f6'
    }

    return NextResponse.json(mockKanbanStatus)
  } catch (error) {
    console.error('Erro ao buscar status do Kanban:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
