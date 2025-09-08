import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('👥 [USER API] GET route foi chamado para ID:', params.id)
  
  try {
    // Extrair token do header Authorization
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      console.log('❌ [USER API] Token não encontrado no header')
      return NextResponse.json({ error: 'Token não encontrado' }, { status: 401 })
    }
    
    console.log('👥 [USER API] Token extraído do header')
    
    // Construir URL do backend
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/users/${params.id}`
    console.log('👥 [USER API] Enviando para backend:', backendUrl)
    
    // Fazer requisição para o backend
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    })
    
    console.log('📡 [USER API] Status da resposta do backend:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.log('❌ [USER API] Erro do backend:', errorText)
      return NextResponse.json(
        { error: 'Erro ao buscar usuário' }, 
        { status: response.status }
      )
    }
    
    const data = await response.json()
    console.log('✅ [USER API] Dados do usuário obtidos com sucesso')
    
    return NextResponse.json(data)
    
  } catch (error) {
    console.error('❌ [USER API] Erro interno:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' }, 
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('👥 [USER API] PUT route foi chamado para ID:', params.id)
  
  try {
    // Extrair token do header Authorization
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      console.log('❌ [USER API] Token não encontrado no header')
      return NextResponse.json({ error: 'Token não encontrado' }, { status: 401 })
    }
    
    const body = await request.json()
    console.log('👥 [USER API] Dados recebidos para atualizar usuário:', { ...body, senha: body.senha ? '[OCULTA]' : undefined })
    
    // Construir URL do backend
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/users/${params.id}`
    console.log('👥 [USER API] Enviando para backend:', backendUrl)
    
    // Fazer requisição para o backend
    const response = await fetch(backendUrl, {
      method: 'PUT',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
    
    console.log('📡 [USER API] Status da resposta do backend:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.log('❌ [USER API] Erro do backend:', errorText)
      return NextResponse.json(
        { error: 'Erro ao atualizar usuário' }, 
        { status: response.status }
      )
    }
    
    const data = await response.json()
    console.log('✅ [USER API] Usuário atualizado com sucesso')
    
    return NextResponse.json(data)
    
  } catch (error) {
    console.error('❌ [USER API] Erro interno:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' }, 
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('👥 [USER API] DELETE route foi chamado para ID:', params.id)
  
  try {
    // Extrair token do header Authorization
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      console.log('❌ [USER API] Token não encontrado no header')
      return NextResponse.json({ error: 'Token não encontrado' }, { status: 401 })
    }
    
    console.log('👥 [USER API] Token extraído do header')
    
    // Construir URL do backend
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/users/${params.id}`
    console.log('👥 [USER API] Enviando para backend:', backendUrl)
    
    // Fazer requisição para o backend
    const response = await fetch(backendUrl, {
      method: 'DELETE',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    })
    
    console.log('📡 [USER API] Status da resposta do backend:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.log('❌ [USER API] Erro do backend:', errorText)
      return NextResponse.json(
        { error: 'Erro ao excluir usuário' }, 
        { status: response.status }
      )
    }
    
    const data = await response.json()
    console.log('✅ [USER API] Usuário excluído com sucesso')
    
    return NextResponse.json(data)
    
  } catch (error) {
    console.error('❌ [USER API] Erro interno:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' }, 
      { status: 500 }
    )
  }
}
