import { NextRequest, NextResponse } from 'next/server'

const WAHA_API_URL = process.env.NEXT_PUBLIC_WAHA_API_URL || 'http://159.65.34.199:3001'
const WAHA_API_KEY = process.env.NEXT_PUBLIC_WAHA_API_KEY || 'tappyone-waha-2024-secretkey'

export async function GET(request: NextRequest, { params }: { params: { sessionName: string } }) {
  try {
    console.log(`📸 [WAHA PROXY] GET /${params.sessionName}/screenshot - Obtendo screenshot`)

    const response = await fetch(`${WAHA_API_URL}/api/${params.sessionName}/screenshot`, {
      method: 'GET',
      headers: {
        'X-Api-Key': WAHA_API_KEY,
        'Accept': 'image/png'
      }
    })

    console.log('📡 [WAHA PROXY] Status WAHA:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ [WAHA PROXY] Erro WAHA:', response.status, errorText)
      return NextResponse.json(
        { error: `Erro WAHA: ${response.status}` },
        { status: response.status }
      )
    }

    const imageBuffer = await response.arrayBuffer()
    console.log('✅ [WAHA PROXY] Screenshot obtido, tamanho:', imageBuffer.byteLength)

    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Content-Length': imageBuffer.byteLength.toString()
      }
    })
  } catch (error) {
    console.error('❌ [WAHA PROXY] Erro interno:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
