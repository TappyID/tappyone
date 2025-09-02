import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://159.65.34.199:3001/'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('🚨 [ALERTAS] GET [id] route foi chamado!')
  
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ [ALERTAS] Token não encontrado no header')
      return NextResponse.json({ error: 'Token não encontrado' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const { id } = params
    
    console.log('📞 [ALERTAS] Buscando alerta:', `${BACKEND_URL}/api/alertas/${id}`)
    
    const response = await fetch(`${BACKEND_URL}/api/alertas/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      console.error('❌ [ALERTAS] Erro na resposta do backend:', response.status)
      return NextResponse.json({ error: 'Erro ao buscar alerta' }, { status: response.status })
    }

    const data = await response.json()
    console.log('✅ [ALERTAS] Alerta encontrado:', data)
    
    return NextResponse.json(data, { status: 200 })
    
  } catch (error) {
    console.error('❌ [ALERTAS] Erro na API proxy:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('🚨 [ALERTAS] PUT [id] route foi chamado!')
  
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ [ALERTAS] Token não encontrado no header')
      return NextResponse.json({ error: 'Token não encontrado' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const { id } = params
    const body = await request.json()
    
    console.log('📞 [ALERTAS] Atualizando alerta:', `${BACKEND_URL}/api/alertas/${id}`)
    
    const response = await fetch(`${BACKEND_URL}/api/alertas/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      console.error('❌ [ALERTAS] Erro na resposta do backend:', response.status)
      const errorData = await response.json()
      return NextResponse.json(errorData, { status: response.status })
    }

    const data = await response.json()
    console.log('✅ [ALERTAS] Alerta atualizado:', data)
    
    return NextResponse.json(data, { status: 200 })
    
  } catch (error) {
    console.error('❌ [ALERTAS] Erro na API proxy:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('🚨 [ALERTAS] DELETE [id] route foi chamado!')
  
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ [ALERTAS] Token não encontrado no header')
      return NextResponse.json({ error: 'Token não encontrado' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const { id } = params
    
    console.log('📞 [ALERTAS] Deletando alerta:', `${BACKEND_URL}/api/alertas/${id}`)
    
    const response = await fetch(`${BACKEND_URL}/api/alertas/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      console.error('❌ [ALERTAS] Erro na resposta do backend:', response.status)
      const errorData = await response.json()
      return NextResponse.json(errorData, { status: response.status })
    }

    const data = await response.json()
    console.log('✅ [ALERTAS] Alerta deletado:', data)
    
    return NextResponse.json(data, { status: 200 })
    
  } catch (error) {
    console.error('❌ [ALERTAS] Erro na API proxy:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
