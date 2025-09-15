import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'

export async function POST(request: NextRequest) {
  try {
    console.log('🎥 [sendVideo] Iniciando...')
    const formData = await request.formData()
    const chatId = formData.get('chatId')
    const file = formData.get('file') as File
    const caption = formData.get('caption') as string
    
    console.log('📋 [sendVideo] Dados recebidos:', {
      chatId,
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type,
      caption
    })
    
    if (!chatId || !file) {
      console.error('❌ [sendVideo] Dados obrigatórios ausentes')
      return NextResponse.json({ error: 'ChatId e arquivo são obrigatórios' }, { status: 400 })
    }

    // Upload do arquivo para Vercel Blob Storage
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2, 15)
    const extension = file.name.split('.').pop()
    const fileName = `video/${timestamp}_${randomId}.${extension}`
    
    const blob = await put(fileName, file, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    })

    // Usar WAHA API diretamente com formato correto
    const wahaUrl = process.env.NEXT_PUBLIC_WAHA_API_URL || 'http://159.65.34.199:3001'
    const wahaApiKey = process.env.NEXT_PUBLIC_WAHA_API_KEY || 'tappyone-waha-2024-secretkey'

    // Payload no formato correto do WAHA para vídeos
    const payload: any = {
      chatId: chatId as string,
      file: {
        mimetype: file.type || 'video/mp4',
        filename: file.name,
        url: blob.url
      },
      session: 'user_3a24ed72_1757773035131'
    }

    if (caption) {
      payload.caption = caption
    }

    // Fazer requisição direta para WAHA
    const response = await fetch(`${wahaUrl}/api/sendVideo`, {
      method: 'POST',
      headers: {
        'X-API-Key': wahaApiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Erro do backend:', response.status, errorText)
      return NextResponse.json({ error: 'Erro ao enviar vídeo' }, { status: response.status })
    }

    const result = await response.json()
    return NextResponse.json(result)

  } catch (error) {
    console.error('Erro no sendVideo:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
