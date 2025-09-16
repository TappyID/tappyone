import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { prompt, context, type = 'response' } = await request.json()
    
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt é obrigatório' }, { status: 400 })
    }

    console.log('🤖 Iniciando geração com DeepSeek:', {
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

    const deepseekResponse = await fetch(`${process.env.DEEPSEEK_API_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
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
        max_tokens: 1000,
        temperature: 0.7,
        stream: false
      })
    })

    if (!deepseekResponse.ok) {
      const errorText = await deepseekResponse.text()
      console.error('❌ Erro do DeepSeek:', deepseekResponse.status, errorText)
      return NextResponse.json({ 
        error: 'Erro ao gerar conteúdo com IA', 
        details: errorText 
      }, { status: deepseekResponse.status })
    }

    const completion = await deepseekResponse.json()
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
