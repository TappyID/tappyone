import { NextRequest, NextResponse } from 'next/server'

// Forçar rota dinâmica
export const dynamic = 'force-dynamic'

const WAHA_URL = process.env.NEXT_PUBLIC_WAHA_API_URL || 'http://159.65.34.199:8081'
const WAHA_API_KEY = process.env.NEXT_PUBLIC_WAHA_API_KEY || 'tappyone-waha-2024-secretkey'

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionName: string } }
) {
  try {
    const { sessionName } = params
    const wahaUrl = `${WAHA_URL}/api/sessions/${sessionName}`
    
    const response = await fetch(wahaUrl, {
      method: 'GET',
      headers: {
        'X-Api-Key': WAHA_API_KEY,
        'accept': 'application/json'
      }
    })

    if (!response.ok) {
      console.error(`❌ [SESSION ${sessionName}] Erro do WAHA:`, response.status)
      return NextResponse.json(
        { error: `Erro do WAHA: ${response.status}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error(`❌ [SESSION] Erro interno:`, error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { sessionName: string } }
) {
  try {
    const { sessionName } = params
    const body = await request.json()
    const wahaUrl = `${WAHA_URL}/api/sessions/${sessionName}`
    
    const response = await fetch(wahaUrl, {
      method: 'POST',
      headers: {
        'X-Api-Key': WAHA_API_KEY,
        'Content-Type': 'application/json',
        'accept': 'application/json'
      },
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      console.error(`❌ [SESSION ${sessionName} POST] Erro do WAHA:`, response.status)
      const errorText = await response.text()
      return NextResponse.json(
        { error: `Erro do WAHA: ${response.status}`, details: errorText },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error(`❌ [SESSION POST] Erro interno:`, error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { sessionName: string } }
) {
  try {
    const { sessionName } = params
    const wahaUrl = `${WAHA_URL}/api/sessions/${sessionName}`
    
    const response = await fetch(wahaUrl, {
      method: 'DELETE',
      headers: {
        'X-Api-Key': WAHA_API_KEY,
        'accept': 'application/json'
      }
    })

    if (!response.ok) {
      console.error(`❌ [SESSION ${sessionName} DELETE] Erro do WAHA:`, response.status)
      return NextResponse.json(
        { error: `Erro do WAHA: ${response.status}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error(`❌ [SESSION DELETE] Erro interno:`, error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
