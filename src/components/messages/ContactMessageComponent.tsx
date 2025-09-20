interface ContactMessageProps {
  message: any
  sender: 'agent' | 'user'
}

export default function ContactMessageComponent({ message, sender }: ContactMessageProps) {
  // Detectar se é contato/vcard
  const isContact = message.type === 'contact' || 
    message.type === 'vcard' ||
    message.contact || 
    message.vcard || 
    message.mediaUrl?.includes('.vcf') ||
    message.mimetype?.includes('text/vcard') ||
    (message.content && (
      message.content.includes('BEGIN:VCARD') || 
      message.content.includes('FN:') ||
      message.content.includes('TEL:')
    ))

  if (!isContact) return null

  // Extrair nome do contato
  const getName = () => {
    if (message.contact?.formattedName) return message.contact.formattedName
    if (message.vcard?.fn) return message.vcard.fn
    if (message.content?.includes('FN:')) {
      const fnMatch = message.content.match(/FN:(.+)/)
      return fnMatch ? fnMatch[1].trim() : 'Contato'
    }
    return 'Contato Compartilhado'
  }

  // Extrair telefone do contato
  const getPhone = () => {
    if (message.contact?.phoneNumbers?.[0]) return message.contact.phoneNumbers[0]
    if (message.vcard?.tel) return message.vcard.tel
    if (message.content?.includes('TEL:')) {
      const telMatch = message.content.match(/TEL:(.+)/)
      return telMatch ? telMatch[1].trim() : 'Telefone não disponível'
    }
    return 'Informações de contato'
  }

  const handleDownload = () => {
    if (message.mediaUrl) {
      window.open(message.mediaUrl, '_blank')
    } else if (message.content?.includes('BEGIN:VCARD')) {
      // Criar blob do vCard e baixar
      const blob = new Blob([message.content], { type: 'text/vcard' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'contato.vcf'
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  return (
    <div className="mb-2">
      <div className={`flex items-center gap-3 p-4 rounded-lg border ${
        sender === 'agent' ? 'bg-white/10 dark:bg-black/30 backdrop-blur-sm border-white/20 dark:border-slate-600/30' : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700/30'
      }`}>
        <div className={`p-3 rounded-full ${
          sender === 'agent' ? 'bg-white/20 dark:bg-slate-700/60 backdrop-blur-sm' : 'bg-blue-100 dark:bg-blue-800'
        }`}>
          <svg className={`w-6 h-6 ${
            sender === 'agent' ? 'text-white' : 'text-blue-600 dark:text-blue-300'
          }`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
          </svg>
        </div>
        <div className="flex-1">
          <div className={`font-medium text-sm ${
            sender === 'agent' ? 'text-white' : 'text-blue-800 dark:text-blue-200'
          }`}>
            👤 {getName()}
          </div>
          <div className={`text-xs mt-1 ${
            sender === 'agent' ? 'text-white/70' : 'text-blue-600 dark:text-blue-400'
          }`}>
            {getPhone()}
          </div>
        </div>
        <button
          onClick={handleDownload}
          className={`p-2 rounded-full hover:bg-opacity-80 transition-colors ${
            sender === 'agent' ? 'bg-white/20 hover:bg-white/30' : 'bg-blue-100 hover:bg-blue-200 dark:bg-blue-800 dark:hover:bg-blue-700'
          }`}
        >
          <svg className={`w-4 h-4 ${
            sender === 'agent' ? 'text-white' : 'text-blue-600 dark:text-blue-300'
          }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </button>
      </div>
    </div>
  )
}
