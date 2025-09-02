import { NextRequest, NextResponse } from 'next/server'
import { getBlobUrl } from '@/lib/blob-storage'

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const filePath = params.path.join('/')
    console.log('API /api/files chamada para:', filePath)
    
    // Se o arquivo já é uma URL do blob, redireciona diretamente
    if (filePath.startsWith('http')) {
      return NextResponse.redirect(filePath)
    }
    
    // Verificar se é um caminho do WAHA (user_xxx/arquivo)
    if (filePath.includes('user_')) {
      // Fazer proxy para o WAHA em produção
      const wahaUrl = `http://159.65.34.199:3001/api/files/${filePath}`
      console.log('Fazendo proxy para WAHA:', wahaUrl)
      
      try {
        const wahaResponse = await fetch(wahaUrl, {
          headers: {
            'X-Api-Key': 'tappyone-waha-2024-secretkey'
          }
        })
        
        if (wahaResponse.ok) {
          const contentType = wahaResponse.headers.get('content-type') || 'application/octet-stream'
          const buffer = await wahaResponse.arrayBuffer()
          
          return new NextResponse(buffer, {
            headers: {
              'Content-Type': contentType,
              'Cache-Control': 'public, max-age=31536000'
            }
          })
        }
      } catch (wahaError) {
        console.log('Erro ao acessar WAHA:', wahaError)
      }
    }
    
    // Tentar media server local como fallback
    try {
      const mediaServerUrl = `http://localhost:8082/media/${filePath}`
      const mediaResponse = await fetch(mediaServerUrl, { method: 'HEAD' })
      
      if (mediaResponse.ok) {
        console.log('Arquivo encontrado no media server local:', mediaServerUrl)
        return NextResponse.redirect(mediaServerUrl)
      }
    } catch (mediaError) {
      console.log('Media server não disponível')
    }
    
    // Tentar construir URL do blob como último recurso
    const blobUrl = getBlobUrl(filePath)
    console.log('Tentando blob URL:', blobUrl)
    
    try {
      const blobResponse = await fetch(blobUrl, { method: 'HEAD' })
      if (blobResponse.ok) {
        return NextResponse.redirect(blobUrl)
      }
    } catch (blobError) {
      console.log('Arquivo não encontrado no blob storage')
    }
    
    // Se nenhum funcionar, retornar 404
    console.log('Arquivo não encontrado em nenhum local:', filePath)
    return new NextResponse('File not found', { status: 404 })
    
  } catch (error) {
    console.error('Erro ao acessar arquivo:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
