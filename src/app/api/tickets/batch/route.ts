import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { card_ids } = body

    if (!card_ids || !Array.isArray(card_ids)) {
      return NextResponse.json({ error: 'card_ids array is required' }, { status: 400 })
    }

    const authorization = request.headers.get('authorization')
    if (!authorization) {
      return NextResponse.json({ error: 'Authorization header is required' }, { status: 401 })
    }

    console.log('🎫 [TICKETS BATCH] Buscando tickets para cards:', card_ids)

    // Fazer requisição para o backend Go
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tickets/batch`, {
      method: 'POST',
      headers: {
        'Authorization': authorization,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ card_ids })
    })

    console.log('🎫 [TICKETS BATCH] Backend response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('🎫 [TICKETS BATCH] Backend error:', errorText)
      return NextResponse.json({ error: 'Failed to fetch tickets from backend' }, { status: response.status })
    }

    const data = await response.json()
    console.log('🎫 [TICKETS BATCH] Backend response data:', data)

    return NextResponse.json(data)
  } catch (error) {
    console.error('🎫 [TICKETS BATCH] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
