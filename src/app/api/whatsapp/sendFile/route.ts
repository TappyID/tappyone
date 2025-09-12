import { NextRequest, NextResponse } from 'next/server'
import { uploadToBlob } from '@/lib/blob-storage'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const chatId = formData.get('chatId')
    const file = formData.get('file') as File
    const caption = formData.get('caption') as string
    
    if (!chatId || !file) {
      return NextResponse.json({ error: 'ChatId e arquivo são obrigatórios' }, { status: 400 })
    }

    // Upload do arquivo para o Vercel Blob Storage
    const uploadResult = await uploadToBlob(file)
    const blobUrl = uploadResult.url

    // Enviar URL do arquivo para o backend Go
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://159.65.34.199:8081/'
    const token = request.headers.get('authorization')

    const response = await fetch(`${backendUrl}/api/whatsapp/chats/${chatId}/file`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token || '',
      },
      body: JSON.stringify({
        fileUrl: blobUrl,
        filename: file.name,
        caption: caption,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Erro do backend:', response.status, errorText)
      return NextResponse.json({ error: 'Erro ao enviar arquivo' }, { status: response.status })
    }

    const result = await response.json()
    return NextResponse.json(result)

  } catch (error) {
    console.error('Erro no sendFile:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
