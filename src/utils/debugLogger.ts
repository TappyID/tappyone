// Debug Logger para salvar logs em arquivo
export class DebugLogger {
  private logs: string[] = []
  private isEnabled = process.env.NODE_ENV === 'development'

  log(message: string, data?: any) {
    if (!this.isEnabled) return
    
    const timestamp = new Date().toISOString()
    const logEntry = `[${timestamp}] ${message}${data ? ` | Data: ${JSON.stringify(data, null, 2)}` : ''}`
    
    console.log(logEntry)
    this.logs.push(logEntry)
    
    // Salvar no localStorage para persistir entre reloads
    this.saveLogs()
  }

  error(message: string, error?: any) {
    if (!this.isEnabled) return
    
    const timestamp = new Date().toISOString()
    const logEntry = `[${timestamp}] ERROR: ${message}${error ? ` | Error: ${error.toString()}` : ''}`
    
    console.error(logEntry)
    this.logs.push(logEntry)
    
    this.saveLogs()
  }

  private saveLogs() {
    try {
      localStorage.setItem('debug_logs', JSON.stringify(this.logs))
    } catch (e) {
      console.warn('Failed to save logs to localStorage')
    }
  }

  exportLogs(): string {
    return this.logs.join('\n')
  }

  downloadLogs() {
    const logsText = this.exportLogs()
    const blob = new Blob([logsText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = `debug-logs-${new Date().toISOString().slice(0, 19)}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    
    URL.revokeObjectURL(url)
  }

  clearLogs() {
    this.logs = []
    localStorage.removeItem('debug_logs')
  }

  // Carregar logs salvos do localStorage
  loadSavedLogs() {
    try {
      const saved = localStorage.getItem('debug_logs')
      if (saved) {
        this.logs = JSON.parse(saved)
      }
    } catch (e) {
      console.warn('Failed to load logs from localStorage')
    }
  }
}

// Instância global do logger
export const debugLogger = new DebugLogger()

// Carregar logs salvos na inicialização
if (typeof window !== 'undefined') {
  debugLogger.loadSavedLogs()
}
