import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { contatoId: string } }
) {
  try {
    const { contatoId } = params
    
    if (!contatoId) {
      return NextResponse.json(
        { error: 'ID do contato é obrigatório' },
        { status: 400 }
      )
    }

    // Buscar conexão ativa que contenha este contato nos selectedChats ou selectedContacts
    const conexaoResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/conexoes/contato/${contatoId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('authorization') || '',
      },
    })

    if (!conexaoResponse.ok) {
      if (conexaoResponse.status === 404) {
        return NextResponse.json({
          conexao: null,
          fila: null,
          atendentes: [],
          hasConnection: false
        })
      }
      throw new Error(`Erro ao buscar conexão: ${conexaoResponse.status}`)
    }

    const result = await conexaoResponse.json()

    return NextResponse.json({
      conexao: result.conexao || null,
      fila: result.fila || null,
      atendentes: result.atendentes || [],
      hasConnection: !!result.conexao
    })

  } catch (error) {
    console.error('❌ [API] Erro ao buscar conexão/fila do contato:', error)
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}
