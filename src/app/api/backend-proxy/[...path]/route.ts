import { NextRequest, NextResponse } from 'next/server'

// Proxy para Backend API - resolve Mixed Content em produção
export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const path = params.path.join('/')
    const searchParams = request.nextUrl.searchParams.toString()
    const backendUrl = `http://159.65.34.199:8081/${path}${searchParams ? `?${searchParams}` : ''}`
    
    console.log(`🔄 [Backend Proxy] GET ${backendUrl}`)
    
    const token = request.headers.get('Authorization')
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': token }),
      },
    })
    
    const data = await response.json()
    
    return NextResponse.json(data, { 
      status: response.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    })
  } catch (error: any) {
    console.error('❌ [Backend Proxy] Error:', error)
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
    const body = await request.text()
    const backendUrl = `http://159.65.34.199:8081/${path}`
    
    console.log(`🔄 [Backend Proxy] POST ${backendUrl}`)
    
    const token = request.headers.get('Authorization')
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': token }),
      },
      body,
    })
    
    const data = await response.json()
    
    return NextResponse.json(data, { 
      status: response.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    })
  } catch (error: any) {
    console.error('❌ [Backend Proxy] Error:', error)
    return NextResponse.json(
      { error: 'Proxy error', details: error.message },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const path = params.path.join('/')
    const body = await request.text()
    const backendUrl = `http://159.65.34.199:8081/${path}`
    
    console.log(`🔄 [Backend Proxy] PUT ${backendUrl}`)
    
    const token = request.headers.get('Authorization')
    
    const response = await fetch(backendUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': token }),
      },
      body,
    })
    
    const data = await response.json()
    
    return NextResponse.json(data, { 
      status: response.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    })
  } catch (error: any) {
    console.error('❌ [Backend Proxy] Error:', error)
    return NextResponse.json(
      { error: 'Proxy error', details: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const path = params.path.join('/')
    const backendUrl = `http://159.65.34.199:8081/${path}`
    
    console.log(`🔄 [Backend Proxy] DELETE ${backendUrl}`)
    
    const token = request.headers.get('Authorization')
    
    const response = await fetch(backendUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': token }),
      },
    })
    
    const data = await response.json()
    
    return NextResponse.json(data, { 
      status: response.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    })
  } catch (error: any) {
    console.error('❌ [Backend Proxy] Error:', error)
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
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
