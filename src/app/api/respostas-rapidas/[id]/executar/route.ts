import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://159.65.34.199:8081'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization')
    
    // DESENVOLVIMENTO: Desabilitar autenticação temporariamente
    const isDevelopment = process.env.NODE_ENV === 'development'
    
    if (!authHeader && !isDevelopment) {
      return NextResponse.json({ error: 'Authorization header missing' }, { status: 401 })
    }
    
    // Token para desenvolvimento - EXECUTAR (token válido do Rodrigo Admin)
    const effectiveAuthHeader = isDevelopment 
      ? 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiZmI4ZGExZDctZDI4Zi00ZWY5LWI4YjAtZTAxZjc0NjZmNTc4IiwiZW1haWwiOiJyb2RyaWdvQGNybS50YXBweS5pZCIsInJvbGUiOiJBRE1JTiIsImlzcyI6InRhcHB5b25lLWNybSIsInN1YiI6ImZiOGRhMWQ3LWQyOGYtNGVmOS1iOGIwLWUwMWY3NDY2ZjU3OCIsImV4cCI6MTc1OTE2MzcwMSwibmJmIjoxNzU4NTU4OTAxLCJpYXQiOjE3NTg1NTg5MDF9.xY9ikMSOHMcatFdierE3-bTw-knQgSmqxASRSHUZqfw'
      : authHeader
      
    console.log('🔍 [EXECUTAR] isDevelopment:', isDevelopment)
    console.log('🔍 [EXECUTAR] effectiveAuthHeader:', effectiveAuthHeader?.substring(0, 20) + '...')

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
        'Authorization': effectiveAuthHeader,
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
