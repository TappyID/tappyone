import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type')
    
    let audioFile: File | null = null
    let audioUrl: string | null = null
    
    if (contentType?.includes('multipart/form-data')) {
      // Formato antigo - arquivo direto
      const formData = await request.formData()
      audioFile = formData.get('audio') as File
    } else {
      // Formato novo - URL do áudio
      const { audioUrl: url } = await request.json()
      audioUrl = url
    }
    
    if (!audioFile && !audioUrl) {
      return NextResponse.json({ error: 'Arquivo de áudio ou URL não fornecido' }, { status: 400 })
    }

    // Se for URL, baixar o arquivo primeiro
    if (audioUrl) {
      console.log('🎤 Baixando áudio da URL:', audioUrl)
      const audioResponse = await fetch(audioUrl)
      if (!audioResponse.ok) {
        return NextResponse.json({ error: 'Erro ao baixar áudio da URL' }, { status: 400 })
      }
      const audioBuffer = await audioResponse.arrayBuffer()
      audioFile = new File([audioBuffer], 'audio.ogg', { type: 'audio/ogg' })
    }

    console.log('🎤 Iniciando transcrição:', {
      fileName: audioFile?.name,
      fileSize: audioFile?.size,
      fileType: audioFile?.type,
      source: audioUrl ? 'URL' : 'Upload'
    })

    // Preparar FormData para a API da OpenAI
    const openaiFormData = new FormData()
    openaiFormData.append('file', audioFile!)
    openaiFormData.append('model', 'whisper-1')
    openaiFormData.append('language', 'pt') // Português brasileiro

    const openaiResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: openaiFormData
    })

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text()
      console.error('❌ Erro da OpenAI:', openaiResponse.status, errorText)
      return NextResponse.json({ 
        error: 'Erro ao transcrever áudio', 
        details: errorText 
      }, { status: openaiResponse.status })
    }

    const transcription = await openaiResponse.json()
    
    console.log('✅ Transcrição concluída:', {
      text: transcription.text?.substring(0, 100) + '...',
      length: transcription.text?.length
    })

    return NextResponse.json({
      success: true,
      transcription: transcription.text,
      language: 'pt-BR'
    })

  } catch (error) {
    console.error('💥 Erro na transcrição:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
