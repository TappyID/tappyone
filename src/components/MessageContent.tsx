'use client'

import { detectLinks, hasLinks } from '@/utils/linkDetector'
import LinkPreview from './LinkPreview'

interface MessageContentProps {
  content: string
  className?: string
}

export default function MessageContent({ content, className = '' }: MessageContentProps) {
  // Se não há links, renderizar texto simples
  if (!hasLinks(content)) {
    return <p className={`text-sm leading-relaxed mb-1 ${className}`}>{content}</p>
  }

  const links = detectLinks(content)
  
  // Se há apenas um link e é o conteúdo inteiro, mostrar apenas o preview
  if (links.length === 1 && links[0].start === 0 && links[0].end >= content.trim().length) {
    return (
      <div className="space-y-2">
        <LinkPreview url={links[0].url} />
      </div>
    )
  }

  // Se há links misturados com texto, renderizar texto + previews
  return (
    <div className="space-y-2">
      <p className={`text-sm leading-relaxed mb-1 ${className}`}>{content}</p>
      {links.map((link, index) => (
        <LinkPreview key={`${link.url}-${index}`} url={link.url} />
      ))}
    </div>
  )
}
