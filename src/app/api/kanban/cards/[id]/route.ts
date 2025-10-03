import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

// Função para verificar token
async function verifyToken(token: string) {
  try {
    const secret = process.env.JWT_SECRET || 'your-secret-key'
    const decoded = jwt.verify(token, secret) as any
    return decoded
  } catch (error) {
    return null
  }
}

// DELETE /api/kanban/cards/[id] - Deletar card do Kanban
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticação
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Token de autenticação não fornecido' },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const decoded = await verifyToken(token)

    if (!decoded || !decoded.user_id) {
      return NextResponse.json(
        { error: 'Token inválido ou expirado' },
        { status: 401 }
      )
    }

    const cardId = params.id
    console.log(`🗑️ [API] Deletando card do Kanban: ${cardId}`)

    // Buscar o card para pegar a conversaId
    const card = await prisma.kanbanCard.findUnique({
      where: { conversaId: cardId }
    })

    if (!card) {
      return NextResponse.json(
        { error: 'Card não encontrado' },
        { status: 404 }
      )
    }

    // Deletar o card
    await prisma.kanbanCard.delete({
      where: { conversaId: cardId }
    })

    console.log(`✅ [API] Card removido com sucesso: ${cardId}`)

    return NextResponse.json({
      success: true,
      message: 'Card removido do Kanban com sucesso'
    })
  } catch (error: any) {
    console.error('❌ [API] Erro ao deletar card:', error)
    return NextResponse.json(
      { error: 'Erro ao deletar card', details: error.message },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
