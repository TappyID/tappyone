export interface LogEntry {
  component: string
  action: string
  data: any
  timestamp?: string
  userId?: string
}

export const fileLogger = {
  async log(entry: LogEntry) {
    try {
      await fetch('/api/debug-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...entry,
          timestamp: new Date().toISOString()
        })
      })
    } catch (error) {
      // Silenciar erros de logging para não interferir no funcionamento
      console.warn('Erro ao salvar log em arquivo:', error)
    }
  },

  async getLogs() {
    try {
      const response = await fetch('/api/debug-logs')
      const result = await response.json()
      return result.logs || []
    } catch (error) {
      console.error('Erro ao buscar logs:', error)
      return []
    }
  }
}
