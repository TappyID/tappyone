import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    const chatId = params.chatId;
    const body = await request.json();
    
    const { contactId, contactName } = body;

    if (!contactId) {
      return NextResponse.json({ error: 'Contact ID é obrigatório' }, { status: 400 });
    }

    // Enviar para o backend Go
    const backendUrl = process.env.BACKEND_URL || 'http://159.65.34.199:8081/';
    const token = request.headers.get('authorization');

    const response = await fetch(`${backendUrl}/api/whatsapp/chats/${chatId}/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token || '',
      },
      body: JSON.stringify({
        contactId,
        contactName: contactName || contactId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Backend response:', errorData);
      return NextResponse.json(
        { error: 'Erro ao enviar contato' },
        { status: response.status }
      );
    }

    const result = await response.json();
    return NextResponse.json(result);

  } catch (error) {
    console.error('Erro no envio de contato:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
