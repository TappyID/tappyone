import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const filePath = params.path.join('/')
    
    // Usar backend Go diretamente para servir arquivos
    const backendUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8081'}/uploads/${filePath}`
    
    console.log('Proxy request para:', backendUrl)
    
    // Fazer request para o backend Go
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Accept': '*/*',
      },
    })

    if (!response.ok) {
      console.error('Erro do backend:', response.status, response.statusText)
      return new NextResponse('File not found', { status: 404 })
    }

    // Obter o tipo de conteúdo
    const contentType = response.headers.get('content-type') || 'application/octet-stream'
    
    // Obter o buffer do arquivo
    const buffer = await response.arrayBuffer()
    
    // Retornar o arquivo com headers corretos
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
  } catch (error) {
    console.error('Erro no proxy de arquivos:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
