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
    
    // Primeiro verificar o status da sessão
    const statusResponse = await fetch(`${WAHA_URL}/api/sessions/${sessionName}`, {
      method: 'GET',
      headers: {
        'X-Api-Key': WAHA_API_KEY,
        'accept': 'application/json'
      }
    })
    
    if (statusResponse.ok) {
      const sessionData = await statusResponse.json()
      console.log(`🔍 [QR ${sessionName}] Status da sessão:`, sessionData.status)
      
      // Se a sessão não está no estado correto, tentar iniciar sessão
      if (sessionData.status !== 'SCAN_QR_CODE' && sessionData.status !== 'WORKING') {
        console.log(`🔄 [QR ${sessionName}] Sessão está ${sessionData.status}, iniciando...`)
        
        const startResponse = await fetch(`${WAHA_URL}/api/sessions/${sessionName}/start`, {
          method: 'POST',
          headers: {
            'X-Api-Key': WAHA_API_KEY,
            'Content-Type': 'application/json'
          }
        })
        
        if (startResponse.ok) {
          console.log(`✅ [QR ${sessionName}] Sessão iniciada com sucesso`)
          // Aguardar um pouco para a sessão entrar no estado SCAN_QR_CODE
          await new Promise(resolve => setTimeout(resolve, 2000))
        } else {
          console.log(`❌ [QR ${sessionName}] Falha ao iniciar sessão:`, startResponse.status)
        }
      }
    } else {
      console.log(`❌ [QR ${sessionName}] Falha ao obter status da sessão`)
      
      // Sessão não existe, tentar criar primeiro
      console.log(`🔄 [QR ${sessionName}] Sessão não existe, criando...`)
      
      const createResponse = await fetch(`${WAHA_URL}/api/sessions`, {
        method: 'POST',
        headers: {
          'X-Api-Key': WAHA_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: sessionName,
          config: {
            proxy: null,
            webhooks: []
          }
        })
      })
      
      if (createResponse.ok) {
        console.log(`✅ [QR ${sessionName}] Sessão criada com sucesso`)
        // Aguardar um pouco para a sessão ser criada
        await new Promise(resolve => setTimeout(resolve, 3000))
      } else {
        const errorText = await createResponse.text()
        console.log(`❌ [QR ${sessionName}] Falha ao criar sessão:`, createResponse.status, errorText)
      }
    }
    
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
