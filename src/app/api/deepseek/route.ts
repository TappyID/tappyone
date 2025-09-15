import { NextRequest, NextResponse } from 'next/server'

interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface DeepSeekRequest {
  model: string
  messages: DeepSeekMessage[]
  temperature?: number
  max_tokens?: number
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { messages, systemPrompt, temperature = 0.7, max_tokens = 1000, userMessage } = body

    // Verificar se o DEEPSEEK_API_KEY está configurado
    const apiKey = process.env.DEEPSEEK_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'DEEPSEEK_API_KEY não configurada' },
        { status: 500 }
      )
    }

    // Construir mensagens para DeepSeek
    const deepseekMessages: DeepSeekMessage[] = [
      {
        role: 'system',
        content: systemPrompt || 'Você é um assistente IA útil.'
      },
      // Adicionar histórico de mensagens se fornecido
      ...(messages || []),
      {
        role: 'user',
        content: userMessage
      }
    ]

    console.log('🤖 [DEEPSEEK] Enviando requisição:', {
      messages: deepseekMessages.length,
      systemPrompt: systemPrompt?.substring(0, 100) + '...',
      userMessage: userMessage?.substring(0, 100) + '...'
    })

    // Fazer requisição para DeepSeek API
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: deepseekMessages,
        temperature,
        max_tokens,
        stream: false
      })
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('🚨 [DEEPSEEK] Erro na API:', response.status, errorData)
      return NextResponse.json(
        { error: 'Erro na API DeepSeek', status: response.status, details: errorData },
        { status: response.status }
      )
    }

    const data = await response.json()
    const aiResponse = data.choices?.[0]?.message?.content

    if (!aiResponse) {
      return NextResponse.json(
        { error: 'Resposta vazia da IA' },
        { status: 500 }
      )
    }

    console.log('✅ [DEEPSEEK] Resposta recebida:', aiResponse.substring(0, 100) + '...')

    return NextResponse.json({
      response: aiResponse,
      usage: data.usage
    })

  } catch (error) {
    console.error('🚨 [DEEPSEEK] Erro interno:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    )
  }
}
