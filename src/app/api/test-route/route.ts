import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  console.log('🧪 [TEST] Rota de teste executada')
  return NextResponse.json({ message: 'Rota funcionando!' })
}

export async function POST(request: NextRequest) {
  console.log('🧪 [TEST] POST na rota de teste')
  const body = await request.json()
  console.log('📋 [TEST] Body:', body)
  return NextResponse.json({ message: 'POST funcionando!', received: body })
}
