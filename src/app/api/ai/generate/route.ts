import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://159.65.34.199:8081/'

export async function POST(request: NextRequest) {
  try {
    const { prompt, context, type = 'response' } = await request.json()
    
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt é obrigatório' }, { status: 400 })
    }

    console.log('🤖 Iniciando geração com IA:', {
      prompt: prompt.substring(0, 100) + '...',
      type,
      hasContext: !!context
    })

    let systemMessage = ''
    
    switch (type) {
      case 'response':
        systemMessage = 'Você é um assistente especializado em atendimento ao cliente via WhatsApp. Gere respostas profissionais, amigáveis e úteis. Use uma linguagem natural e brasileira. Seja conciso mas completo.'
        break
      case 'improve':
        systemMessage = 'Você é um especialista em comunicação. Melhore o texto fornecido mantendo o sentido original, mas tornando-o mais claro, profissional e amigável. Use linguagem brasileira natural.'
        break
      case 'formal':
        systemMessage = 'Transforme o texto em uma versão mais formal e profissional, mantendo a cordialidade. Use linguagem brasileira corporativa.'
        break
      case 'casual':
        systemMessage = 'Transforme o texto em uma versão mais casual e amigável, mantendo o profissionalismo. Use linguagem brasileira descontraída.'
        break
      default:
        systemMessage = 'Você é um assistente de atendimento ao cliente. Ajude a criar respostas úteis e profissionais.'
    }

    if (context) {
      systemMessage += `\n\nContexto adicional: ${context}`
    }

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: systemMessage
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.7,
        presence_penalty: 0.1,
        frequency_penalty: 0.1
      })
    })

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text()
      console.error('❌ Erro da OpenAI:', openaiResponse.status, errorText)
      return NextResponse.json({ 
        error: 'Erro ao gerar conteúdo com IA', 
        details: errorText 
      }, { status: openaiResponse.status })
    }

    const completion = await openaiResponse.json()
    const generatedText = completion.choices[0]?.message?.content || ''
    
    console.log('✅ Geração concluída:', {
      text: generatedText.substring(0, 100) + '...',
      length: generatedText.length,
      tokens_used: completion.usage?.total_tokens
    })

    return NextResponse.json({
      success: true,
      text: generatedText,
      type,
      tokens_used: completion.usage?.total_tokens
    })

  } catch (error) {
    console.error('💥 Erro na geração com IA:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
