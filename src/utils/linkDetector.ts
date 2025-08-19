// Detecta URLs em texto e retorna informações sobre elas
export interface DetectedLink {
  url: string
  start: number
  end: number
  displayText: string
}

export function detectLinks(text: string): DetectedLink[] {
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}[^\s]*)/gi
  const links: DetectedLink[] = []
  let match

  while ((match = urlRegex.exec(text)) !== null) {
    let url = match[0]
    
    // Adicionar protocolo se necessário
    if (!url.startsWith('http')) {
      url = url.startsWith('www.') ? `https://${url}` : `https://${url}`
    }

    // Remover pontuação no final
    url = url.replace(/[.,;:!?]+$/, '')

    links.push({
      url,
      start: match.index,
      end: match.index + match[0].length,
      displayText: match[0]
    })
  }

  return links
}

export function hasLinks(text: string): boolean {
  return detectLinks(text).length > 0
}

export function isValidUrl(string: string): boolean {
  try {
    new URL(string)
    return true
  } catch (_) {
    return false
  }
}
