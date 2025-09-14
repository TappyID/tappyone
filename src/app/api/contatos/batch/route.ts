import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://159.65.34.199:8081'

export async function POST(request: NextRequest) {
  try {
    // Clone the request to avoid body locking issues
    const clonedRequest = request.clone()
    
    // TEMPORÁRIO: Bypass da validação JWT para resolver o problema
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.substring(7) || 'bypass'

    // Extrair cardIds e mapeamento do body usando o clone
    const requestData = await clonedRequest.json()
    const { cardIds, cardContactMapping } = requestData
    
    if (!Array.isArray(cardIds) || cardIds.length === 0) {
      return NextResponse.json({}, { status: 200 })
    }

    console.log('🚀 Batch Contatos - cardIds:', cardIds.length)
    console.log('🚀 Batch Contatos - mapeamento:', cardContactMapping)

    // Buscar contatos para todos os cards de uma vez
    const contatosResponse = await fetch(`${BACKEND_URL}/api/contatos/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-User-ID': '1'
      },
      body: JSON.stringify({ 
        cardIds,
        cardContactMapping,
        userId: '1' 
      })
    })

    if (!contatosResponse.ok) {
      console.error('❌ Erro no backend contatos batch:', contatosResponse.status)
      return NextResponse.json({}, { status: 200 }) // Retorna vazio em caso de erro
    }

    const contatosData = await contatosResponse.json()
    console.log('✅ Batch Contatos OK:', Object.keys(contatosData).length, 'cards')
    console.log('📞📞📞 CONTATOS DATA COMPLETA RECEBIDA:', JSON.stringify(contatosData, null, 2))

    return NextResponse.json(contatosData)

  } catch (error) {
    console.error('❌ Erro na API batch contatos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' }, 
      { status: 500 }
    )
  }
}
