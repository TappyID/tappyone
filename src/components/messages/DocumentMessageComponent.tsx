interface DocumentMessageProps {
  message: any
  sender: 'agent' | 'user'
}

export default function DocumentMessageComponent({ message, sender }: DocumentMessageProps) {
  // Detectar se é documento
  const isDocument = (message.type === 'document' || message.type === 'file') || 
    message.mimetype?.includes('application/') || 
    message.mimetype?.includes('text/') ||
    // Documentos por extensão
    message.mediaUrl?.match(/\.(pdf|doc|docx|txt|rtf|xlsx|xls|csv|ppt|pptx|zip|rar|7z|json|xml|md|js|ts|html|css|py|java|epub|mobi)$/i)

  if (!isDocument || !message.mediaUrl) return null

  // Obter ícone baseado na extensão
  const getFileIcon = () => {
    const filename = message.filename || message.name || 'documento'
    const ext = filename.toLowerCase().split('.').pop()
    
    // Documentos
    if (ext === 'pdf') return '📄'
    if (['doc', 'docx'].includes(ext)) return '📝'
    if (ext === 'txt') return '📋'
    // Planilhas
    if (['xls', 'xlsx'].includes(ext)) return '📊'
    if (ext === 'csv') return '📈'
    // Apresentações
    if (['ppt', 'pptx'].includes(ext)) return '📊'
    // Compactados
    if (['zip', 'rar', '7z'].includes(ext)) return '🗜️'
    // Código
    if (['js', 'ts'].includes(ext)) return '🔧'
    if (ext === 'html') return '🌐'
    if (ext === 'css') return '🎨'
    if (ext === 'py') return '🐍'
    if (ext === 'java') return '☕'
    if (ext === 'json') return '📋'
    if (ext === 'xml') return '📄'
    // E-books
    if (['epub', 'mobi'].includes(ext)) return '📚'
    
    return '📁'
  }

  return (
    <div className="mb-2">
      <div className={`p-4 rounded-lg border-2 border-dashed ${
        sender === 'agent' ? 'border-white/20 bg-white/5 dark:bg-black/30 dark:border-slate-600/30 backdrop-blur-sm' : 'border-gray-300 bg-gray-50 dark:bg-gray-100 dark:border-gray-400'
      }`}>
        {/* Cabeçalho do arquivo */}
        <div className="flex items-center gap-3 mb-3">
          <div className={`text-2xl ${
            sender === 'agent' ? 'opacity-80' : ''
          }`}>
            {getFileIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <p className={`font-medium text-sm truncate ${
              sender === 'agent' ? 'text-white' : 'text-gray-800 dark:text-gray-800'
            }`}>
              {message.filename || message.name || 'arquivo.pdf'}
            </p>
          </div>
        </div>

        {/* Preview/Thumbnail area */}
        <div className={`mb-4 p-4 rounded-lg border-2 border-dashed ${
          sender === 'agent' ? 'border-white/20 bg-white/5 dark:bg-black/30 dark:border-slate-600/30 backdrop-blur-sm' : 'border-gray-300 bg-gray-50 dark:bg-gray-100 dark:border-gray-400'
        }`}>
          <div className="text-center">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-lg mb-3 ${
              sender === 'agent' ? 'bg-white/20 dark:bg-slate-700/60 backdrop-blur-sm' : 'bg-gray-200 dark:bg-gray-300'
            }`}>
              <div className="text-2xl">{getFileIcon()}</div>
            </div>
            <p className={`text-sm font-medium ${
              sender === 'agent' ? 'text-white/80' : 'text-gray-700 dark:text-gray-800'
            }`}>
              Preview não disponível
            </p>
            <p className={`text-xs ${
              sender === 'agent' ? 'text-white/60' : 'text-gray-500 dark:text-gray-600'
            }`}>
              Clique para baixar
            </p>
          </div>
        </div>

        {/* Botão de download */}
        <button
          onClick={() => window.open(message.mediaUrl, '_blank')}
          className={`w-full p-3 rounded-lg border-2 border-dashed transition-all duration-300 hover:scale-[0.98] ${
            sender === 'agent' 
              ? 'border-white/30 bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm' 
              : 'border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:border-blue-600/50 dark:text-blue-300 dark:hover:bg-blue-800/40'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-sm font-medium">Baixar Arquivo</span>
          </div>
        </button>

        {/* Caption se houver */}
        {(message.content || message.caption) && (
          <div className={`mt-3 p-2 rounded ${
            sender === 'agent' ? 'bg-white/10 text-white/90' : 'bg-gray-100 dark:bg-gray-200 text-gray-700 dark:text-gray-800'
          }`}>
            <p className="text-sm">
              {message.content || message.caption}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
