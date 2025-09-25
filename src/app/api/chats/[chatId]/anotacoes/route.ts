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

    // Buscar anotações do chat
    const query = `
      SELECT id, conteudo, data_criacao, usuario_id
      FROM anotacoes 
      WHERE chat_id = $1
      ORDER BY data_criacao DESC
    `

    // Simulação da consulta - substitua pela sua implementação de DB
    // const result = await db.query(query, [chatId])
    
    // Por enquanto, retornar mock baseado no chatId
    const mockAnotacoes = [
      {
        id: '1',
        conteudo: 'Cliente muito interessado no produto premium'
      },
      {
        id: '2',
        conteudo: 'Agendar demonstração para próxima semana'
      }
    ]

    return NextResponse.json(mockAnotacoes)
  } catch (error) {
    console.error('Erro ao buscar anotações do chat:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
