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

    // Enviar URL pública para o backend Go
    const backendUrl = process.env.BACKEND_URL || 'http://159.65.34.199:3001/'
    const token = request.headers.get('authorization')

    const response = await fetch(`${backendUrl}/api/whatsapp/chats/${params.chatId}/voice`, {
      method: 'POST',
      headers: {
        'Authorization': token || '',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        audioUrl: blob.url
      })
    })

    // Resposta do backend Go

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Erro do backend:', response.status, errorText)
      return NextResponse.json({ error: 'Erro ao enviar áudio' }, { status: response.status })
    }

    const result = await response.json()
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
