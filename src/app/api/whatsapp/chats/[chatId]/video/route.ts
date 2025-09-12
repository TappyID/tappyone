import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export async function POST(
  request: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    console.log('🎥 [VIDEO API] Iniciando upload de vídeo para chat:', params.chatId);
    
    const formData = await request.formData();
    const file = formData.get('video') as File;
    
    if (!file) {
      console.log('❌ [VIDEO API] Nenhum arquivo de vídeo encontrado no FormData');
      return NextResponse.json({ error: 'Nenhum vídeo fornecido' }, { status: 400 });
    }

    console.log('📁 [VIDEO API] Arquivo recebido:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    // Upload do arquivo para Vercel Blob Storage
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split('.').pop();
    const fileName = `video/${timestamp}_${randomId}.${extension}`;

    console.log('☁️ [VIDEO API] Fazendo upload para Vercel Blob Storage...');
    
    const blob = await put(fileName, file, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    console.log('✅ [VIDEO API] Upload concluído:', {
      blobUrl: blob.url,
      fileName: fileName,
      size: file.size
    });

    // Enviar URL pública para o backend Go
    const backendUrl = process.env.BACKEND_URL || 'http://159.65.34.199:8081/';
    const authToken = request.headers.get('authorization');

    const response = await fetch(`${backendUrl}/api/whatsapp/chats/${params.chatId}/video`, {
      method: 'POST',
      headers: {
        'Authorization': authToken || '',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        videoUrl: blob.url,
        caption: formData.get('caption') || ''
      })
    });

    console.log('🎥 [VIDEO API] Resposta do backend Go:', {
      status: response.status,
      statusText: response.statusText
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ [VIDEO API] Erro do backend Go:', errorText);
      return NextResponse.json({ error: 'Erro ao enviar vídeo' }, { status: response.status });
    }

    const result = await response.json();
    return NextResponse.json({
      success: true,
      blobUrl: blob.url,
      ...result
    });
    
  } catch (error) {
    console.error('💥 [VIDEO API] Erro no upload de vídeo:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
