import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get('audio') as File
    
    if (!audioFile) {
      return NextResponse.json({ error: 'Arquivo de áudio não fornecido' }, { status: 400 })
    }

    console.log('🎤 Iniciando transcrição:', {
      fileName: audioFile.name,
      fileSize: audioFile.size,
      fileType: audioFile.type
    })

    // Preparar FormData para a API da OpenAI
    const openaiFormData = new FormData()
    openaiFormData.append('file', audioFile)
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
      text: transcription.text,
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
