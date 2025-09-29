export interface NormalizedTag {
  id: string
  nome: string
  cor: string
}

const DEFAULT_TAG_COLOR = '#9333ea'

const possibleNameKeys = [
  'nome',
  'name',
  'label',
  'titulo',
  'title',
  'descricao',
  'description',
  'tag',
  'tag_nome',
  'tagName',
  'tag_name'
]

const possibleColorKeys = [
  'cor',
  'color',
  'hex',
  'hexColor'
]

const possibleIdKeys = [
  'id',
  'tagId',
  'tag_id',
  'value',
  'uuid'
]

function extractFromNested(source: any, key: string): any {
  if (!source) return undefined
  if (Object.prototype.hasOwnProperty.call(source, key)) {
    return source[key]
  }
  return undefined
}

export function normalizeTag(raw: any, index = 0): NormalizedTag | null {
  if (!raw) return null

  if (typeof raw === 'string') {
    const nome = raw.trim()
    if (!nome) return null
    return {
      id: `${nome}-${index}`,
      nome,
      cor: DEFAULT_TAG_COLOR
    }
  }

  if (typeof raw !== 'object') return null

  let nome: string | undefined

  for (const key of possibleNameKeys) {
    const value = extractFromNested(raw, key)
    if (typeof value === 'string' && value.trim()) {
      nome = value.trim()
      break
    }
  }

  if (!nome && typeof raw.tag === 'object') {
    for (const key of possibleNameKeys) {
      const value = extractFromNested(raw.tag, key)
      if (typeof value === 'string' && value.trim()) {
        nome = value.trim()
        break
      }
    }
  }

  if (!nome) return null

  let cor: string | undefined
  for (const key of possibleColorKeys) {
    const value = extractFromNested(raw, key) ?? extractFromNested(raw.tag, key)
    if (typeof value === 'string' && value.trim()) {
      cor = value.trim()
      break
    }
  }

  let id: string | undefined
  for (const key of possibleIdKeys) {
    const value = extractFromNested(raw, key) ?? extractFromNested(raw.tag, key)
    if (typeof value === 'string' && value.trim()) {
      id = value.trim()
      break
    }
  }

  const fallbackId = id || `${nome.toLowerCase().replace(/\s+/g, '-') || 'tag'}-${index}`

  return {
    id: fallbackId,
    nome,
    cor: cor || DEFAULT_TAG_COLOR
  }
}

export function normalizeTags(rawTags: any[]): NormalizedTag[] {
  if (!Array.isArray(rawTags)) return []

  const seen = new Set<string>()
  const result: NormalizedTag[] = []

  rawTags.forEach((raw, index) => {
    const normalized = normalizeTag(raw, index)
    if (!normalized) return

    const key = `${normalized.id}`
    if (seen.has(key)) return
    seen.add(key)
    result.push(normalized)
  })

  return result
}
