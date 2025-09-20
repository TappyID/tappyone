import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { text, targetLanguage, sourceLanguage = 'pt' } = await request.json()
    
    if (!text || !targetLanguage) {
      return NextResponse.json({ 
        error: 'Texto e idioma de destino são obrigatórios' 
      }, { status: 400 })
    }

    console.log('🌍 Iniciando tradução:', {
      text: text.substring(0, 100) + '...',
      from: sourceLanguage,
      to: targetLanguage
    })

    // Usar DeepSeek (mais barato) ou OpenAI como fallback
    const useDeepSeek = true // Ativar DeepSeek
    
    const apiUrl = useDeepSeek 
      ? 'https://api.deepseek.com/v1/chat/completions'
      : 'https://api.openai.com/v1/chat/completions'
    
    const apiKey = useDeepSeek 
      ? process.env.DEEPSEEK_API_KEY 
      : process.env.OPENAI_API_KEY
    
    const model = useDeepSeek ? 'deepseek-chat' : 'gpt-4o-mini'

    console.log('🤖 Usando API:', useDeepSeek ? 'DeepSeek' : 'OpenAI')

    const openaiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: `You are a professional translator. Translate the following text from ${sourceLanguage} to ${targetLanguage === 'pt' ? 'Brazilian Portuguese (pt-BR)' : targetLanguage}. Return ONLY the translated text in ${targetLanguage === 'pt' ? 'natural Brazilian Portuguese' : 'natural ' + targetLanguage}, no explanations or additional content. Maintain the original formatting and tone.`
          },
          {
            role: 'user',
            content: text
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      })
    })

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text()
      console.error('❌ Erro da OpenAI:', openaiResponse.status, errorText)
      return NextResponse.json({ 
        error: 'Erro ao traduzir texto', 
        details: errorText 
      }, { status: openaiResponse.status })
    }

    const result = await openaiResponse.json()
    const translatedText = result.choices?.[0]?.message?.content?.trim()

    if (!translatedText) {
      return NextResponse.json({ 
        error: 'Tradução vazia ou inválida' 
      }, { status: 500 })
    }

    console.log('✅ Tradução concluída:', {
      originalLength: text.length,
      translatedLength: translatedText.length,
      targetLanguage
    })

    return NextResponse.json({
      success: true,
      translatedText,
      sourceLanguage,
      targetLanguage
    })

  } catch (error) {
    console.error('💥 Erro na tradução:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
