import { put, del } from '@vercel/blob'

export interface UploadResult {
  url: string
  fileName: string
  size: number
  type: string
}

export async function uploadToBlob(file: File): Promise<UploadResult> {
  // Gerar nome único para o arquivo
  const timestamp = Date.now()
  const randomId = Math.random().toString(36).substring(2, 15)
  const extension = file.name.split('.').pop()
  const fileName = `media/${timestamp}_${randomId}.${extension}`

  // Upload para Vercel Blob
  const blob = await put(fileName, file, {
    access: 'public',
    token: process.env.BLOB_READ_WRITE_TOKEN,
  })

  return {
    url: blob.url,
    fileName: fileName,
    size: file.size,
    type: file.type
  }
}

export async function deleteFromBlob(url: string): Promise<void> {
  await del(url, {
    token: process.env.BLOB_READ_WRITE_TOKEN,
  })
}

export function getBlobUrl(fileName: string): string {
  // Se já for uma URL completa, retorna como está
  if (fileName.startsWith('http')) {
    return fileName
  }
  
  // Caso contrário, constrói a URL do blob
  return `https://blob.vercel-storage.com/${fileName}`
}
