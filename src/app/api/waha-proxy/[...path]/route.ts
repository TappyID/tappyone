import { NextRequest, NextResponse } from 'next/server'

// Proxy para WAHA API - resolve Mixed Content em produção
export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const path = params.path.join('/')
    const searchParams = request.nextUrl.searchParams.toString()
    const wahaUrl = `http://159.65.34.199:3001/${path}${searchParams ? `?${searchParams}` : ''}`
    
    console.log(`🔄 [WAHA Proxy] GET ${wahaUrl}`)
    
    const response = await fetch(wahaUrl, {
      method: 'GET',
      headers: {
        'X-API-Key': 'tappyone-waha-2024-secretkey',
        'Content-Type': 'application/json',
      },
    })
    
    const data = await response.json()
    
    return NextResponse.json(data, { 
      status: response.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
      }
    })
  } catch (error: any) {
    console.error('❌ [WAHA Proxy] Error:', error)
    return NextResponse.json(
      { error: 'Proxy error', details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const path = params.path.join('/')
    const bodyText = await request.text()
    const bodyJson = bodyText ? JSON.parse(bodyText) : {}
    
    console.log(`🔄 [WAHA Proxy POST] Path: ${path}`)
    console.log(`📦 [WAHA Proxy POST] Body:`, bodyJson)
    
    // Buscar sessão ativa do banco
    const { getActiveSession } = await import('@/utils/getActiveSession')
    const authHeader = request.headers.get('authorization') || ''
    console.log(`🔑 [WAHA Proxy POST] Auth header:`, authHeader ? 'Presente' : 'AUSENTE')
    
    const sessionName = await getActiveSession(authHeader)
    console.log(`📋 [WAHA Proxy POST] Sessão encontrada:`, sessionName || 'NENHUMA')
    
    if (!sessionName) {
      console.error('❌ [WAHA Proxy] Nenhuma sessão ativa encontrada')
      return NextResponse.json(
        { error: 'No active session found' },
        { status: 422 }
      )
    }
    
    // Substituir session no body se existir
    if (bodyJson.session) {
      bodyJson.session = sessionName
    }
    
    const wahaUrl = `http://159.65.34.199:3001/${path}`
    
    console.log(`🔄 [WAHA Proxy] POST ${wahaUrl} com sessão: ${sessionName}`)
    
    const response = await fetch(wahaUrl, {
      method: 'POST',
      headers: {
        'X-API-Key': 'tappyone-waha-2024-secretkey',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bodyJson),
    })
    
    const data = await response.json()
    
    return NextResponse.json(data, { 
      status: response.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
      }
    })
  } catch (error: any) {
    console.error('❌ [WAHA Proxy] Error:', error)
    return NextResponse.json(
      { error: 'Proxy error', details: error.message },
      { status: 500 }
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
    },
  })
}
