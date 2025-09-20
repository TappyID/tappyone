import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'

export async function POST(
  request: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    // Recebendo requisição de áudio
    
    const formData = await request.formData()
    const file = formData.get('voice') as File

    if (!file) {
      // Nenhum arquivo de áudio encontrado
      return NextResponse.json({ error: 'Nenhum áudio fornecido' }, { status: 400 })
    }

    // Arquivo de áudio encontrado

    // Converter webm para ogg para melhor compatibilidade com WhatsApp
    let finalFile = file
    let finalExtension = 'ogg'
    
    if (file.type.includes('webm')) {
      // Convertendo webm para ogg
      const arrayBuffer = await file.arrayBuffer()
      finalFile = new File([arrayBuffer], file.name.replace('.webm', '.ogg'), {
        type: 'audio/ogg; codecs=opus'
      })
    }

    // Upload do arquivo para Vercel Blob Storage
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2, 15)
    const fileName = `voice/${timestamp}_${randomId}.${finalExtension}`

    // Fazendo upload para Vercel Blob Storage
    
    const blob = await put(fileName, finalFile, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    })

    // Upload concluído

    console.log('🎙️ Enviando áudio para WAHA:', {
      chatId: params.chatId,
      audioUrl: blob.url,
      fileType: finalFile.type
    })

    // Usar WAHA API diretamente (igual sendImage)
    const wahaUrl = process.env.NEXT_PUBLIC_WAHA_API_URL || 'http://159.65.34.199:3001'
    const wahaApiKey = process.env.NEXT_PUBLIC_WAHA_API_KEY || 'tappyone-waha-2024-secretkey'

    // Payload no formato WAHA
    const payload = {
      chatId: params.chatId,
      file: {
        mimetype: finalFile.type || 'audio/ogg',
        filename: finalFile.name,
        url: blob.url
      },
      session: 'user_fb8da1d7_1758158816675'
    }

    // Fazer requisição direta para WAHA
    const response = await fetch(`${wahaUrl}/api/sendVoice`, {
      method: 'POST',
      headers: {
        'X-API-Key': wahaApiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Erro do WAHA:', response.status, errorText)
      return NextResponse.json({ 
        error: 'Erro ao enviar áudio', 
        details: errorText 
      }, { status: response.status })
    }

    const result = await response.json()
    console.log('✅ Áudio enviado com sucesso via WAHA')
    
    return NextResponse.json({
      success: true,
      blobUrl: blob.url,
      ...result
    })

  } catch (error) {
    console.error('Erro no upload de áudio:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
