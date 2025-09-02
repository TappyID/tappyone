import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const BACKEND_URL = process.env.BACKEND_URL || 'http://159.65.34.199:3001/'

export async function GET(request: NextRequest) {
  try {
    // Try Authorization header first, then fallback to cookies
    let token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      const cookieStore = cookies()
      token = cookieStore.get('auth_token')?.value
    }

    if (!token) {
      return NextResponse.json({ error: 'Token não encontrado' }, { status: 401 })
    }

    const url = new URL(request.url)
    const searchParams = url.searchParams
    let backendUrl = `${BACKEND_URL}/api/fluxos`
    
    if (searchParams.toString()) {
      backendUrl += `?${searchParams.toString()}`
    }

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const error = await response.text()
      return NextResponse.json({ error }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Erro ao buscar fluxos:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Try Authorization header first, then fallback to cookies
    let token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      const cookieStore = cookies()
      token = cookieStore.get('auth_token')?.value
    }

    if (!token) {
      return NextResponse.json({ error: 'Token não encontrado' }, { status: 401 })
    }

    const body = await request.json()

    const response = await fetch(`${BACKEND_URL}/api/fluxos`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const error = await response.text()
      return NextResponse.json({ error }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Erro ao criar fluxo:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
