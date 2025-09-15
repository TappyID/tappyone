import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const chatId = formData.get('chatId')
    const file = formData.get('file') as File
    const caption = formData.get('caption') as string
    
    if (!chatId || !file) {
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

    // Usar WAHA API para envio direto de mídia
    const wahaUrl = process.env.NEXT_PUBLIC_WAHA_API_URL || 'http://159.65.34.199:3001'
    const wahaApiKey = process.env.NEXT_PUBLIC_WAHA_API_KEY || 'tappyone-waha-2024-secretkey'

    // Criar FormData para WAHA
    const wahaFormData = new FormData()
    wahaFormData.append('chatId', chatId as string)
    wahaFormData.append('file', file)
    if (formData.get('caption')) {
      wahaFormData.append('caption', formData.get('caption') as string)
    }

    const response = await fetch(`${wahaUrl}/api/sendVideo`, {
      method: 'POST',
      headers: {
        'X-API-Key': wahaApiKey
      },
      body: wahaFormData
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
