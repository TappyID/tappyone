import { NextRequest, NextResponse } from 'next/server'

// Generate image with OpenAI DALL-E
async function generateImage(prompt: string, model: 'dall-e-2' | 'dall-e-3' = 'dall-e-2') {
  try {
    console.log(`🎨 Gerando imagem com ${model.toUpperCase()}:`, prompt.substring(0, 100))
    
    const requestBody: any = {
      model,
      prompt: prompt,
      n: 1,
      size: '1024x1024'
    }
    
    // DALL-E 3 tem parâmetros extras
    if (model === 'dall-e-3') {
      requestBody.quality = 'standard'
      requestBody.style = 'vivid'
    }
    
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('❌ Erro do OpenAI:', response.status, error)
      return NextResponse.json({ 
        error: 'Erro ao gerar imagem', 
        details: error 
      }, { status: response.status })
    }

    const result = await response.json()
    const imageUrl = result.data[0]?.url

    console.log('✅ Imagem gerada com sucesso')
    
    // Baixar a imagem e converter para base64 (evitar CORS no frontend)
    console.log('📥 Baixando imagem para base64...')
    const imgResponse = await fetch(imageUrl)
    const imgBuffer = await imgResponse.arrayBuffer()
    const base64Image = Buffer.from(imgBuffer).toString('base64')
    const imageDataUrl = `data:image/png;base64,${base64Image}`

    return NextResponse.json({
      success: true,
      type: 'image',
      imageUrl: imageDataUrl, // Retornar como data URL base64
      imageUrlOriginal: imageUrl, // URL original da OpenAI
      prompt,
      revised_prompt: result.data[0]?.revised_prompt
    })

  } catch (error) {
    console.error('💥 Erro na geração de imagem:', error)
    return NextResponse.json(
      { error: 'Erro interno na geração de imagem' },
      { status: 500 }
    )
  }
}

// Generate audio with OpenAI TTS
async function generateAudio(prompt: string, voice: string = 'nova') {
  try {
    console.log(`🎵 Gerando áudio com OpenAI TTS (voz: ${voice}):`, prompt.substring(0, 100))
    
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1', // tts-1 ou tts-1-hd (mais qualidade)
        input: prompt,
        voice: voice, // Voz dinâmica!
        response_format: 'mp3',
        speed: 1.0 // 0.25 a 4.0
      })
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('❌ Erro do OpenAI TTS:', response.status, error)
      return NextResponse.json({ 
        error: 'Erro ao gerar áudio', 
        details: error 
      }, { status: response.status })
    }

    // Converter response para base64 para enviar ao frontend
    const audioBuffer = await response.arrayBuffer()
    const base64Audio = Buffer.from(audioBuffer).toString('base64')
    const audioDataUrl = `data:audio/mp3;base64,${base64Audio}`

    console.log('✅ Áudio gerado com sucesso:', {
      size: audioBuffer.byteLength,
      prompt: prompt.substring(0, 50)
    })

    return NextResponse.json({
      success: true,
      type: 'audio',
      message: '🎵 Áudio gerado com sucesso!',
      audioUrl: audioDataUrl, // Base64 data URL
      prompt,
      duration_estimate: Math.ceil(prompt.length / 15) // Estimativa: ~15 caracteres por segundo
    })

  } catch (error) {
    console.error('💥 Erro na geração de áudio:', error)
    return NextResponse.json(
      { error: 'Erro interno na geração de áudio' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { prompt, context, type = 'response', voice = 'nova', imageModel = 'dall-e-2' } = await request.json()
    
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt é obrigatório' }, { status: 400 })
    }

    console.log('🤖 Iniciando geração:', {
      prompt: prompt.substring(0, 100) + '...',
      type,
      hasContext: !!context
    })

    // Handle image generation with OpenAI DALL-E
    if (type === 'image') {
      return await generateImage(prompt, imageModel)
    }

    // Handle audio generation with selected voice
    if (type === 'audio') {
      return await generateAudio(prompt, voice)
    }

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
