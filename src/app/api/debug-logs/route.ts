import { NextRequest, NextResponse } from 'next/server'
import { writeFile, readFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

export async function POST(req: NextRequest) {
  try {
    const { component, action, data, timestamp, userId } = await req.json()
    
    const debugDir = path.join(process.cwd(), 'debug-logs')
    
    // Criar diretório se não existir
    if (!existsSync(debugDir)) {
      await mkdir(debugDir, { recursive: true })
    }
    
    const logEntry = {
      timestamp: timestamp || new Date().toISOString(),
      component,
      action,
      data,
      userId
    }
    
    const logFile = path.join(debugDir, `kanban-debug-${new Date().toISOString().split('T')[0]}.json`)
    
    let logs = []
    
    // Ler logs existentes se o arquivo existir
    if (existsSync(logFile)) {
      try {
        const existingData = await readFile(logFile, 'utf8')
        logs = JSON.parse(existingData)
      } catch (err) {
        // Se não conseguir ler, começar array vazio
        logs = []
      }
    }
    
    // Adicionar novo log
    logs.push(logEntry)
    
    // Manter apenas os últimos 100 logs para não ocupar muito espaço
    if (logs.length > 100) {
      logs = logs.slice(-100)
    }
    
    // Salvar arquivo
    await writeFile(logFile, JSON.stringify(logs, null, 2), 'utf8')
    
    return NextResponse.json({ success: true, message: 'Log salvo com sucesso' })
    
  } catch (error) {
    console.error('Erro ao salvar log:', error)
    return NextResponse.json({ success: false, error: 'Erro ao salvar log' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const debugDir = path.join(process.cwd(), 'debug-logs')
    const logFile = path.join(debugDir, `kanban-debug-${new Date().toISOString().split('T')[0]}.json`)
    
    if (!existsSync(logFile)) {
      return NextResponse.json({ logs: [] })
    }
    
    const data = await readFile(logFile, 'utf8')
    const logs = JSON.parse(data)
    
    return NextResponse.json({ logs })
    
  } catch (error) {
    console.error('Erro ao ler logs:', error)
    return NextResponse.json({ success: false, error: 'Erro ao ler logs' }, { status: 500 })
  }
}
