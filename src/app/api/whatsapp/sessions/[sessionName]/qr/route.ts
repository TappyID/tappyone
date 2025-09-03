import { NextRequest, NextResponse } from 'next/server'

// Forçar rota dinâmica
export const dynamic = 'force-dynamic'

const WAHA_URL = process.env.NEXT_PUBLIC_WAHA_API_URL || 'http://159.65.34.199:3001'
const WAHA_API_KEY = process.env.NEXT_PUBLIC_WAHA_API_KEY || 'tappyone-waha-2024-secretkey'

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionName: string } }
) {
  try {
    const { sessionName } = params
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'image'
    
    // Tentar diferentes endpoints para obter QR Code
    const endpoints = [
      `${WAHA_URL}/api/${sessionName}/auth/qr?format=${format}`,
      `${WAHA_URL}/api/${sessionName}/qr`,
      `${WAHA_URL}/api/${sessionName}/screenshot`
    ]
    
    for (const wahaUrl of endpoints) {
      console.log(`🔍 [QR ${sessionName}] Tentando:`, wahaUrl)
      
      const response = await fetch(wahaUrl, {
        method: 'GET',
        headers: {
          'X-Api-Key': WAHA_API_KEY,
          'accept': format === 'image' ? 'image/png' : 'application/json'
        }
      })

      if (response.ok) {
        const contentType = response.headers.get('content-type')
        
        if (contentType?.includes('image')) {
          // Retornar a imagem diretamente
          console.log(`✅ [QR ${sessionName}] QR Code obtido como imagem`)
          const imageBuffer = await response.arrayBuffer()
          return new NextResponse(imageBuffer, {
            headers: {
              'Content-Type': 'image/png',
              'Cache-Control': 'no-cache, no-store, must-revalidate'
            }
          })
        } else {
          // Tentar obter dados JSON com QR code
          const data = await response.json()
          if (data.qr || data.qrCode || data.base64) {
            console.log(`✅ [QR ${sessionName}] QR Code obtido como JSON`)
            return NextResponse.json(data)
          }
        }
        
        console.log(`⚠️ [QR ${sessionName}] Endpoint retornou dados inesperados:`, contentType)
      } else {
        console.log(`❌ [QR ${sessionName}] Endpoint falhou:`, response.status)
      }
    }

    // Se nenhum endpoint funcionou
    return NextResponse.json(
      { error: 'QR Code não disponível. Verifique se a sessão está no estado SCAN_QR_CODE.' },
      { status: 404 }
    )
    
  } catch (error) {
    console.error(`❌ [QR] Erro interno:`, error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
