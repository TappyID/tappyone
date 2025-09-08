import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://159.65.34.199:8081/'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Authorization header missing' }, { status: 401 })
    }

    const url = new URL(request.url)
    const queryParams = url.searchParams.toString()
    const backendUrl = queryParams 
      ? `${BACKEND_URL}/api/respostas-rapidas/?${queryParams}`
      : `${BACKEND_URL}/api/respostas-rapidas/`

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        { error: errorText || 'Failed to fetch respostas rapidas' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching respostas rapidas:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Authorization header missing' }, { status: 401 })
    }

    const body = await request.json()
    
    // DEBUG: Log do payload interceptado
    console.log('🚨 [RESPOSTAS-RAPIDAS] POST - INTERCEPTADO!')
    console.log('🔍 [RESPOSTAS-RAPIDAS] POST - Payload recebido:', JSON.stringify(body, null, 2))
    console.log('🔍 [RESPOSTAS-RAPIDAS] POST - categoria_id original:', body.categoria_id)
    
    // FORÇAR categoria_id para null - backend vai criar/usar categoria Geral
    const modifiedBody = { ...body }
    delete modifiedBody.categoria_id // REMOVER categoria_id - backend resolve
    
    console.log('🔧 [RESPOSTAS-RAPIDAS] POST - categoria_id REMOVIDO - backend vai usar Geral')
    console.log('🔍 [RESPOSTAS-RAPIDAS] POST - Payload modificado:', JSON.stringify(modifiedBody, null, 2))
    
    console.log('📡 [RESPOSTAS-RAPIDAS] Enviando para backend:', `${BACKEND_URL}/api/respostas-rapidas/`)
    
    const response = await fetch(`${BACKEND_URL}/api/respostas-rapidas/`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(modifiedBody),
    })

    console.log('📡 [RESPOSTAS-RAPIDAS] Status do backend:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.log('❌ [RESPOSTAS-RAPIDAS] Erro do backend:', errorText)
      return NextResponse.json(
        { error: errorText || 'Failed to create resposta rapida' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error creating resposta rapida:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

