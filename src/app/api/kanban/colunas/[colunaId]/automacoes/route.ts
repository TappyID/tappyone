import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://159.65.34.199:8081'

export async function GET(
  request: NextRequest,
  { params }: { params: { colunaId: string } }
) {
  try {
    const { colunaId } = params
    const authHeader = request.headers.get('authorization')
    const searchParams = request.nextUrl.searchParams
    
    const backendUrl = `${BACKEND_URL}/api/kanban/colunas/${colunaId}/automacoes?${searchParams.toString()}`
    
    const response = await fetch(backendUrl, {
      headers: {
        'Authorization': authHeader || '',
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Erro ao buscar automações', details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { colunaId: string } }
) {
  try {
    const { colunaId } = params
    const authHeader = request.headers.get('authorization')
    const body = await request.json()
    
    const response = await fetch(`${BACKEND_URL}/api/kanban/colunas/${colunaId}/automacoes`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader || '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Erro ao criar automação', details: error.message },
      { status: 500 }
    )
  }
}
