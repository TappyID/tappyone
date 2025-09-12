import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const filePath = params.path.join('/')
    
    // Fazer request para o backend Go para obter o arquivo
    const backendUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://159.65.34.199:8081/'}/api/whatsapp/media/download`
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('authorization') || '',
      },
      body: JSON.stringify({
        mediaUrl: filePath
      })
    })

    if (!response.ok) {
      console.error('Erro ao buscar mídia:', response.status, response.statusText)
      return new NextResponse('Media not found', { status: 404 })
    }

    const mediaData = await response.json()
    
    if (mediaData.data) {
      // Converter base64 para buffer
      const buffer = Buffer.from(mediaData.data, 'base64')
      
      // Determinar content-type baseado na extensão
      const ext = filePath.split('.').pop()?.toLowerCase()
      let contentType = 'application/octet-stream'
      
      switch (ext) {
        case 'jpg':
        case 'jpeg':
          contentType = 'image/jpeg'
          break
        case 'png':
          contentType = 'image/png'
          break
        case 'gif':
          contentType = 'image/gif'
          break
        case 'webp':
          contentType = 'image/webp'
          break
        case 'mp3':
          contentType = 'audio/mpeg'
          break
        case 'wav':
          contentType = 'audio/wav'
          break
        case 'oga':
        case 'ogg':
          contentType = 'audio/ogg'
          break
        case 'webm':
          contentType = 'video/webm'
          break
        case 'mp4':
          contentType = 'video/mp4'
          break
      }

      return new NextResponse(buffer, {
        headers: {
          'Content-Type': contentType,
          'Content-Length': buffer.length.toString(),
          'Cache-Control': 'public, max-age=31536000',
        },
      })
    }

    return new NextResponse('Media data not found', { status: 404 })
    
  } catch (error) {
    console.error('Erro no proxy de mídia:', error)
    return new NextResponse('Internal server error', { status: 500 })
  }
}
