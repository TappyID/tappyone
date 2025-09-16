import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://159.65.34.199:8081'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Authorization header missing' }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    console.log('🚀 [RESPOSTAS-RAPIDAS] POST EXECUTAR - ID:', id, 'Body:', body)
    
    // Converter para chat_id (formato esperado pelo backend Go)
    const backendBody = {
      chat_id: body.chat_id || body.chatId || body.ChatID,
      // Se há ações customizadas, converter conteudo para string JSON (formato esperado pelo Go)
      ...(body.acoes_customizadas && { 
        acoes_customizadas: body.acoes_customizadas.map(acao => ({
          ...acao,
          conteudo: typeof acao.conteudo === 'object' 
            ? JSON.stringify(acao.conteudo) 
            : acao.conteudo
        }))
      })
    }
    
    console.log('📦 [RESPOSTAS-RAPIDAS] Body enviado para backend:', JSON.stringify(backendBody, null, 2))
    
    // Log das ações customizadas se existirem
    if (backendBody.acoes_customizadas) {
      console.log('🎯 [RESPOSTAS-RAPIDAS] Ações customizadas sendo enviadas:')
      backendBody.acoes_customizadas.forEach((acao, index) => {
        console.log(`  ${index + 1}. Tipo: ${acao.tipo}, Ativo: ${acao.ativo}, ID: ${acao.id}`)
      })
    }
    
    // Chamada para o endpoint /executar no backend Go
    const response = await fetch(`${BACKEND_URL}/api/respostas-rapidas/${id}/executar`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(backendBody),
    })

    console.log('📡 [RESPOSTAS-RAPIDAS] POST EXECUTAR Status do backend:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.log('❌ [RESPOSTAS-RAPIDAS] POST EXECUTAR Erro do backend:', errorText)
      return NextResponse.json(
        { error: errorText || 'Failed to execute resposta rapida' },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('✅ [RESPOSTAS-RAPIDAS] POST EXECUTAR Sucesso:', data)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error executing resposta rapida:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
