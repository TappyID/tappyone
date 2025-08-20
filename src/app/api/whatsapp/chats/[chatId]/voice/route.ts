import { NextRequest, NextResponse } from 'next/server'
import { uploadToBlob } from '@/lib/blob-storage'

export async function POST(
  request: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    const { chatId } = params
    
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Token de autorização necessário' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('audio') as File
    
    if (!file) {
      return NextResponse.json({ error: 'Nenhum áudio fornecido' }, { status: 400 })
    }

    // Upload para Vercel Blob Storage
    const blobResult = await uploadToBlob(file)
    
    // Criar FormData para enviar ao backend Go com a URL do blob
    const backendFormData = new FormData()
    backendFormData.append('audioUrl', blobResult.url)

    const backendUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8081'}/api/whatsapp/chats/${chatId}/voice`
    
    console.log('Enviando áudio via blob URL:', blobResult.url)
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
      },
      body: backendFormData
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Erro do backend:', response.status, errorText)
      return NextResponse.json({ error: 'Erro ao enviar áudio' }, { status: response.status })
    }

    const result = await response.json()
    
    // Adicionar URL do blob ao resultado
    return NextResponse.json({
      ...result,
      mediaUrl: blobResult.url
    })
    
  } catch (error) {
    console.error('Erro no upload de áudio:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
