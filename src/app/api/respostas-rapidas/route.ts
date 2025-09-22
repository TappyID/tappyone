import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://159.65.34.199:8081'

console.log('🔍 [RESPOSTAS-RAPIDAS] BACKEND_URL configurado:', BACKEND_URL)
console.log('🔍 [RESPOSTAS-RAPIDAS] NODE_ENV:', process.env.NODE_ENV)

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    // DESENVOLVIMENTO: Desabilitar autenticação temporariamente
    const isDevelopment = process.env.NODE_ENV === 'development'
    
    if (!authHeader && !isDevelopment) {
      return NextResponse.json({ error: 'Authorization header missing' }, { status: 401 })
    }
    
    // Token para desenvolvimento - GET (token válido do Rodrigo Admin)
    const effectiveAuthHeader = isDevelopment 
      ? 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiZmI4ZGExZDctZDI4Zi00ZWY5LWI4YjAtZTAxZjc0NjZmNTc4IiwiZW1haWwiOiJyb2RyaWdvQGNybS50YXBweS5pZCIsInJvbGUiOiJBRE1JTiIsImlzcyI6InRhcHB5b25lLWNybSIsInN1YiI6ImZiOGRhMWQ3LWQyOGYtNGVmOS1iOGIwLWUwMWY3NDY2ZjU3OCIsImV4cCI6MTc1OTE2MzcwMSwibmJmIjoxNzU4NTU4OTAxLCJpYXQiOjE3NTg1NTg5MDF9.xY9ikMSOHMcatFdierE3-bTw-knQgSmqxASRSHUZqfw'
      : authHeader
      
    console.log('🔍 [GET] isDevelopment:', isDevelopment)
    console.log('🔍 [GET] effectiveAuthHeader:', effectiveAuthHeader?.substring(0, 20) + '...')

    const url = new URL(request.url)
    const queryParams = url.searchParams.toString()
    
    // Forçar inclusão das ações no GET
    const includeActions = 'include_acoes=true'
    const finalQueryParams = queryParams 
      ? `${queryParams}&${includeActions}`
      : includeActions
    
    const backendUrl = `${BACKEND_URL}/api/respostas-rapidas/?${finalQueryParams}`
    
    console.log('🔍 [RESPOSTAS-RAPIDAS] GET - URL backend:', backendUrl)

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Authorization': effectiveAuthHeader,
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
    
    // DESENVOLVIMENTO: Desabilitar autenticação temporariamente
    const isDevelopment = process.env.NODE_ENV === 'development'
    
    if (!authHeader && !isDevelopment) {
      return NextResponse.json({ error: 'Authorization header missing' }, { status: 401 })
    }
    
    // Token para desenvolvimento - POST (token válido do Rodrigo Admin)
    const effectiveAuthHeader = isDevelopment 
      ? 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiZmI4ZGExZDctZDI4Zi00ZWY5LWI4YjAtZTAxZjc0NjZmNTc4IiwiZW1haWwiOiJyb2RyaWdvQGNybS50YXBweS5pZCIsInJvbGUiOiJBRE1JTiIsImlzcyI6InRhcHB5b25lLWNybSIsInN1YiI6ImZiOGRhMWQ3LWQyOGYtNGVmOS1iOGIwLWUwMWY3NDY2ZjU3OCIsImV4cCI6MTc1OTE2MzcwMSwibmJmIjoxNzU4NTU4OTAxLCJpYXQiOjE3NTg1NTg5MDF9.xY9ikMSOHMcatFdierE3-bTw-knQgSmqxASRSHUZqfw'
      : authHeader
      
    console.log('🔍 [POST] isDevelopment:', isDevelopment)
    console.log('🔍 [POST] effectiveAuthHeader:', effectiveAuthHeader?.substring(0, 20) + '...')

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
        'Authorization': effectiveAuthHeader,
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

