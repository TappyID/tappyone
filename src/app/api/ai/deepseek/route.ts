import { NextRequest, NextResponse } from 'next/server'

interface DeepSeekRequest {
  text: string
  action: 'generate' | 'improve' | 'formal' | 'casual' | 'shorter' | 'longer'
}

interface DeepSeekMessage {
  role: 'system' | 'user'
  content: string
}

const getSystemPrompt = (action: string): string => {
  const prompts = {
    generate: 'Você é um assistente especializado em criar textos para mensagens de WhatsApp. Gere uma mensagem profissional, clara e adequada baseada no contexto fornecido.',
    improve: 'Você é um assistente especializado em melhorar textos. Melhore a mensagem fornecida mantendo o tom e o contexto, mas tornando-a mais clara, profissional e bem escrita.',
    formal: 'Você é um assistente especializado em formalizar textos. Transforme a mensagem fornecida em um texto mais formal e profissional, mantendo o contexto e significado.',
    casual: 'Você é um assistente especializado em tornar textos mais casuais. Transforme a mensagem fornecida em um texto mais descontraído e amigável, mantendo o contexto.',
    shorter: 'Você é um assistente especializado em resumir textos. Torne a mensagem fornecida mais concisa e direta, mantendo as informações essenciais.',
    longer: 'Você é um assistente especializado em expandir textos. Expanda a mensagem fornecida com mais detalhes e informações relevantes, mantendo o contexto.'
  }
  
  return prompts[action as keyof typeof prompts] || prompts.improve
}

export async function POST(request: NextRequest) {
  try {
    const { text, action }: DeepSeekRequest = await request.json()

    if (!text?.trim()) {
      return NextResponse.json(
        { error: 'Texto é obrigatório' },
        { status: 400 }
      )
    }

    const systemPrompt = getSystemPrompt(action)
    
    const messages: DeepSeekMessage[] = [
      {
        role: 'system',
        content: `${systemPrompt} Responda APENAS com o texto melhorado/gerado, sem explicações adicionais. O texto deve ser adequado para WhatsApp Business.`
      },
      {
        role: 'user',
        content: text
      }
    ]

    const response = await fetch(`${process.env.DEEPSEEK_API_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
        messages,
        max_tokens: 1000,
        temperature: 0.7,
        stream: false
      })
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('DeepSeek API Error:', errorData)
      return NextResponse.json(
        { error: 'Erro na API do DeepSeek' },
        { status: 500 }
      )
    }

    const data = await response.json()
    const generatedText = data.choices?.[0]?.message?.content?.trim()

    if (!generatedText) {
      return NextResponse.json(
        { error: 'Nenhum texto foi gerado' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      text: generatedText,
      action,
      originalText: text
    })

  } catch (error) {
    console.error('Erro na API DeepSeek:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
