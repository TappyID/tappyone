import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://159.65.34.199:8081'

// 🔥 FILTRAR CHATS POR TAGS - GET
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tags = searchParams.get('tags')
    const filas = searchParams.get('filas')
    const atendente = searchParams.get('atendente')
    const quadro = searchParams.get('quadro')
    const coluna = searchParams.get('coluna')
    
    // Pegar token do header
    const token = request.headers.get('authorization')
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token não fornecido' },
        { status: 401 }
      )
    }
    
    // Determinar qual endpoint chamar baseado nos parâmetros
    let endpoint = ''
    let queryString = ''
    
    if (tags) {
      endpoint = '/api/chats/filter/tags'
      queryString = `?tags=${tags}`
    } else if (filas) {
      endpoint = '/api/chats/filter/filas'
      queryString = `?filas=${filas}`
    } else if (atendente) {
      endpoint = '/api/chats/filter/atendente'
      queryString = `?atendente=${atendente}`
    } else if (quadro) {
      endpoint = '/api/chats/filter/kanban'
      queryString = `?quadro=${quadro}${coluna ? `&coluna=${coluna}` : ''}`
    } else {
      return NextResponse.json(
        { success: false, error: 'Nenhum filtro especificado' },
        { status: 400 }
      )
    }
    
    console.log('🔥 [CHATS-FILTER] Buscando:', `${BACKEND_URL}${endpoint}${queryString}`)
    
    const response = await fetch(`${BACKEND_URL}${endpoint}${queryString}`, {
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      console.error('❌ [CHATS-FILTER] Erro do backend:', response.status)
      return NextResponse.json(
        { success: false, error: `Erro do backend: ${response.status}` },
        { status: response.status }
      )
    }
    
    const data = await response.json()
    console.log('✅ [CHATS-FILTER] Sucesso:', data.count || data.data?.length || 0, 'IDs')
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ [CHATS-FILTER] Erro:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar filtros' },
      { status: 500 }
    )
  }
}

// 🔥 FILTROS MÚLTIPLOS - POST
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token não fornecido' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    
    console.log('🔥 [CHATS-FILTER MULTI] Body:', body)
    
    const response = await fetch(`${BACKEND_URL}/api/chats/filter/multi`, {
      method: 'POST',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })
    
    if (!response.ok) {
      console.error('❌ [CHATS-FILTER MULTI] Erro do backend:', response.status)
      return NextResponse.json(
        { success: false, error: `Erro do backend: ${response.status}` },
        { status: response.status }
      )
    }
    
    const data = await response.json()
    console.log('✅ [CHATS-FILTER MULTI] Sucesso:', data.count || data.data?.length || 0, 'IDs')
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ [CHATS-FILTER MULTI] Erro:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar filtros' },
      { status: 500 }
    )
  }
}
