import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = 'http://159.65.34.199:8081'

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params, 'GET')
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params, 'POST')
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params, 'PUT')
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params, 'DELETE')
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params, 'PATCH')
}

async function handleRequest(
  request: NextRequest,
  params: { path: string[] },
  method: string
) {
  try {
    const { path } = params
    const backendPath = path.join('/')
    
    // Construir URL do backend
    const url = new URL(request.url)
    const backendUrl = `${BACKEND_URL}/${backendPath}${url.search}`
    
    console.log(`🔄 [PROXY] ${method} ${backendUrl}`)
    
    // Preparar headers
    const headers: Record<string, string> = {}
    
    // Copiar headers importantes do request original
    const allowedHeaders = [
      'authorization',
      'content-type',
      'accept',
      'user-agent',
      'x-api-key'
    ]
    
    allowedHeaders.forEach(header => {
      const value = request.headers.get(header)
      if (value) {
        headers[header] = value
      }
    })
    
    // Preparar body se necessário
    let body = undefined
    if (method !== 'GET' && method !== 'HEAD') {
      try {
        const requestClone = request.clone()
        body = await requestClone.text()
      } catch (error) {
        console.log('⚠️ [PROXY] Erro ao ler body:', error)
      }
    }
    
    // Fazer requisição para o backend
    const response = await fetch(backendUrl, {
      method,
      headers,
      body: body || undefined,
    })
    
    // Ler resposta
    const responseText = await response.text()
    
    console.log(`📡 [PROXY] Response: ${response.status} - ${responseText.substring(0, 200)}`)
    
    // Preparar headers de resposta
    const responseHeaders = new Headers()
    
    // Copiar headers importantes da resposta
    const responseHeadersToKeep = [
      'content-type',
      'cache-control',
      'expires',
      'last-modified',
      'etag'
    ]
    
    responseHeadersToKeep.forEach(header => {
      const value = response.headers.get(header)
      if (value) {
        responseHeaders.set(header, value)
      }
    })
    
    // Adicionar CORS headers
    responseHeaders.set('Access-Control-Allow-Origin', '*')
    responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
    responseHeaders.set('Access-Control-Allow-Headers', 'Authorization, Content-Type, Accept, X-API-Key')
    
    return new NextResponse(responseText, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders
    })
    
  } catch (error) {
    console.error('💥 [PROXY] Erro:', error)
    return NextResponse.json(
      { error: 'Proxy error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Authorization, Content-Type, Accept, X-API-Key',
      'Access-Control-Max-Age': '86400',
    },
  })
}
