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

    // Buscar tags do chat
    const query = `
      SELECT t.id, t.nome, t.cor 
      FROM chat_tags ct
      JOIN tags t ON t.id = ct.tag_id
      WHERE ct.chat_id = $1
      ORDER BY t.nome
    `

    // Simulação da consulta - substitua pela sua implementação de DB
    // const result = await db.query(query, [chatId])
    
    // Por enquanto, retornar mock baseado no chatId
    const mockTags = [
      {
        id: '1',
        nome: 'Interessado',
        cor: '#10b981'
      },
      {
        id: '2', 
        nome: 'VIP',
        cor: '#f59e0b'
      }
    ]

    return NextResponse.json(mockTags)
  } catch (error) {
    console.error('Erro ao buscar tags do chat:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
