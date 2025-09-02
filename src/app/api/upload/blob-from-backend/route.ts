import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const msgType = formData.get('msgType') as string
    
    if (!file) {
      return NextResponse.json({ error: 'Arquivo não encontrado' }, { status: 400 })
    }

    // Gerar nome único baseado no tipo de mídia
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2, 15)
    
    // Determinar extensão baseada no tipo
    let ext = ''
    switch (msgType) {
      case 'image':
        ext = '.jpg'
        break
      case 'audio':
      case 'voice':
        ext = '.oga'
        break
      case 'video':
        ext = '.mp4'
        break
      default:
        const originalExt = file.name.split('.').pop()
        ext = originalExt ? `.${originalExt}` : '.bin'
    }
    
    const fileName = `media/${msgType}_${timestamp}_${randomId}${ext}`

    // Upload para Vercel Blob Storage
    const token = process.env.BLOB_READ_WRITE_TOKEN || 'vercel_blob_rw_CZKLglFqr6p7Vjn6_OUaFk2tIdtpSM7YFZiWSYFBItE041n'
    const blob = await put(fileName, file, {
      access: 'public',
      token: token,
    })

    return NextResponse.json({
      success: true,
      url: blob.url,
      fileName: fileName,
      size: file.size
    })

  } catch (error) {
    console.error('Erro no upload para blob:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
