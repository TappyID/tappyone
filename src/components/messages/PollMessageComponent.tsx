interface PollMessageProps {
  message: any
  sender: 'agent' | 'user'
}

export default function PollMessageComponent({ message, sender }: PollMessageProps) {
  // Detectar se é poll
  const isPoll = message.type === 'poll' || 
    message.poll || 
    message.pollData ||
    (message.content && (
      message.content.toLowerCase().includes('enquete') ||
      (message.content.includes('1️⃣') && message.content.includes('2️⃣')) ||
      (message.content.includes('Me conte:') && message.content.includes('?')) ||
      (message.content.includes('Qual ') && message.content.includes('?') && message.content.includes('\n'))
    ))

  if (!isPoll) return null

  // Extrair título da poll
  const getPollTitle = () => {
    if (message.poll?.name) return message.poll.name
    if (message.content) {
      const firstLine = message.content.split('\n')[0]
      return firstLine.length > 50 ? 'Formulário/Questionário' : firstLine
    }
    return 'Enquete'
  }

  // Extrair opções da poll
  const getPollOptions = () => {
    const pollOptions = message.poll?.options || []
    
    if (pollOptions.length === 0 && message.content) {
      // Extrair linhas que começam com emojis numerados
      const lines = message.content.split('\n')
      const extractedOptions: string[] = []
      
      lines.forEach(line => {
        const trimmed = line.trim()
        if (trimmed.match(/^[1-9]️⃣|^[1-9]\.|^[1-9]\)/)) {
          extractedOptions.push(trimmed)
        }
      })
      
      return extractedOptions.length > 0 ? extractedOptions : ['📋 ' + message.content]
    }
    
    return pollOptions
  }

  return (
    <div className="mb-2">
      <div className={`p-3 rounded-lg ${
        sender === 'agent' ? 'bg-white/10 dark:bg-black/30 backdrop-blur-sm border border-white/20 dark:border-slate-600/30' : 'bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700/30'
      }`}>
        <div className="flex items-center gap-2 mb-3">
          <div className={`p-2 rounded-full ${
            sender === 'agent' ? 'bg-white/20' : 'bg-purple-100 dark:bg-purple-800'
          }`}>
            <svg className={`w-4 h-4 ${sender === 'agent' ? 'text-white' : 'text-purple-600 dark:text-purple-300'}`} fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div className={`font-medium text-sm ${
            sender === 'agent' ? 'text-white' : 'text-purple-800 dark:text-purple-200'
          }`}>
            📊 {getPollTitle()}
          </div>
        </div>
        <div className="space-y-2">
          {getPollOptions().map((option: any, index: number) => (
            <div key={index} className={`flex items-center gap-2 p-2 rounded ${
              sender === 'agent' ? 'bg-white/10' : 'bg-white dark:bg-purple-800/30'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                sender === 'agent' ? 'bg-white/60' : 'bg-purple-400'
              }`} />
              <span className={`text-sm ${
                sender === 'agent' ? 'text-white/90' : 'text-purple-700 dark:text-purple-200'
              }`}>
                {typeof option === 'string' ? option : (option.name || option)}
              </span>
            </div>
          ))}
        </div>
        {message.poll?.multipleAnswers && (
          <div className={`text-xs mt-2 ${
            sender === 'agent' ? 'text-white/70' : 'text-purple-600 dark:text-purple-400'
          }`}>
            ✓ Múltiplas respostas permitidas
          </div>
        )}
      </div>
    </div>
  )
}
