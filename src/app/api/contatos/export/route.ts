import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'

// Forçar rota dinâmica para permitir uso de headers
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const backendUrl = process.env.BACKEND_URL || 'http://159.65.34.199:3001/'
    const authorization = request.headers.get('authorization')
    
    if (!authorization) {
      return NextResponse.json({ error: 'Token de autorização necessário' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format')

    const response = await fetch(`${backendUrl}/api/contatos/export?format=${format}`, {
      method: 'GET',
      headers: {
        'Authorization': authorization,
      }
    })

    if (!response.ok) {
      const data = await response.json()
      return NextResponse.json(data, { status: response.status })
    }

    // For file downloads, we need to stream the response
    const contentType = response.headers.get('content-type')
    const contentDisposition = response.headers.get('content-disposition')
    
    return new NextResponse(response.body, {
      status: 200,
      headers: {
        'Content-Type': contentType || 'application/octet-stream',
        'Content-Disposition': contentDisposition || 'attachment'
      }
    })
  } catch (error) {
    console.error('Erro ao exportar contatos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
