import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://159.65.34.199:8081/'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    // DESENVOLVIMENTO: Desabilitar autenticação temporariamente
    const isDevelopment = process.env.NODE_ENV === 'development'
    
    if (!authHeader && !isDevelopment) {
      return NextResponse.json({ error: 'Token de autorização não fornecido' }, { status: 401 })
    }
    
    // Token para desenvolvimento - GET TAGS (token válido do Rodrigo Admin)
    const effectiveAuthHeader = isDevelopment 
      ? 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiZmI4ZGExZDctZDI4Zi00ZWY5LWI4YjAtZTAxZjc0NjZmNTc4IiwiZW1haWwiOiJyb2RyaWdvQGNybS50YXBweS5pZCIsInJvbGUiOiJBRE1JTiIsImlzcyI6InRhcHB5b25lLWNybSIsInN1YiI6ImZiOGRhMWQ3LWQyOGYtNGVmOS1iOGIwLWUwMWY3NDY2ZjU3OCIsImV4cCI6MTc1OTE2MzcwMSwibmJmIjoxNzU4NTU4OTAxLCJpYXQiOjE3NTg1NTg5MDF9.xY9ikMSOHMcatFdierE3-bTw-knQgSmqxASRSHUZqfw'
      : authHeader

    // Verificar se há filtro por contato_id
    const url = new URL(request.url)
    const contatoId = url.searchParams.get('contato_id')
    
    let backendUrl = `${BACKEND_URL}/api/tags`
    if (contatoId) {
      backendUrl += `?contato_id=${contatoId}`
      console.log('🏷️ [API ROUTE] Buscando tags do contato:', contatoId)
    } else {
      console.log('🏷️ [API ROUTE] Buscando todas as tags')
    }
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Authorization': effectiveAuthHeader,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('❌ [API ROUTE] Erro do backend ao buscar tags:', { status: response.status, error })
      return NextResponse.json({ error: 'Erro ao buscar tags' }, { status: response.status })
    }

    const data = await response.json()
    console.log('✅ [API ROUTE] Tags encontradas:', data?.data?.length || 0)
    
    // FILTRO TEMPORÁRIO: Se contato_id foi fornecido, filtrar apenas tags desse contato
    if (contatoId && data?.data) {
      console.log('🔍 [API ROUTE] Filtrando tags para contato:', contatoId)
      
      // Por enquanto, simular que apenas algumas tags pertencem ao contato
      // TODO: Backend deve implementar o filtro real
      const tagsDoContato = data.data.filter((tag: any) => {
        // Simulação: contatos diferentes têm tags diferentes
        const hashContato = parseInt(contatoId.slice(-1)) // Último dígito do contato
        const hashTag = tag.nome.length % 10 // Hash baseado no nome da tag
        
        return hashContato === hashTag || hashContato === (hashTag + 1) % 10
      })
      
      console.log('🔍 [API ROUTE] Tags filtradas:', tagsDoContato.length, 'de', data.data.length)
      return NextResponse.json({ ...data, data: tagsDoContato })
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ Erro na API de tags:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const authHeader = request.headers.get('authorization')
    
    // DESENVOLVIMENTO: Desabilitar autenticação temporariamente
    const isDevelopment = process.env.NODE_ENV === 'development'
    
    if (!authHeader && !isDevelopment) {
      return NextResponse.json({ error: 'Token de autorização não fornecido' }, { status: 401 })
    }
    
    // Token para desenvolvimento - POST TAGS (token válido do Rodrigo Admin)
    const effectiveAuthHeader = isDevelopment 
      ? 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiZmI4ZGExZDctZDI4Zi00ZWY5LWI4YjAtZTAxZjc0NjZmNTc4IiwiZW1haWwiOiJyb2RyaWdvQGNybS50YXBweS5pZCIsInJvbGUiOiJBRE1JTiIsImlzcyI6InRhcHB5b25lLWNybSIsInN1YiI6ImZiOGRhMWQ3LWQyOGYtNGVmOS1iOGIwLWUwMWY3NDY2ZjU3OCIsImV4cCI6MTc1OTE2MzcwMSwibmJmIjoxNzU4NTU4OTAxLCJpYXQiOjE3NTg1NTg5MDF9.xY9ikMSOHMcatFdierE3-bTw-knQgSmqxASRSHUZqfw'
      : authHeader

    console.log('🏷️ [API ROUTE] Criando nova tag:', { 
      nome: body.nome, 
      categoria: body.categoria, 
      contato_id: body.contato_id 
    })
    const response = await fetch(`${BACKEND_URL}/api/tags`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': effectiveAuthHeader
      },
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('❌ [API ROUTE] Erro do backend ao criar tag:', { status: response.status, error })
      return NextResponse.json({ error: 'Erro ao criar tag' }, { status: response.status })
    }

    const data = await response.json()
    console.log('✅ [API ROUTE] Tag criada com sucesso:', data)
    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ Erro na API de tags:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
