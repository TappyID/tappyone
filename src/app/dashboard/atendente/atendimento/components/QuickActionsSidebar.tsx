'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  X,
  MessageSquare,
  Zap,
  Send,
  Star,
  Clock,
  User,
  Tag
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface QuickAction {
  id: string
  title: string
  content: string
  type: 'text' | 'pix' | 'image' | 'audio' | 'video' | 'document'
  category: string
  tags: string[]
  usageCount: number
}

interface QuickActionsSidebarProps {
  isOpen: boolean
  onClose: () => void
  onSelectAction: (action: QuickAction) => void
  activeChatId?: string
}

// Mock data simplificado para atendente
const mockQuickActions: QuickAction[] = [
  {
    id: '1',
    title: 'Saudação',
    content: 'Olá! Como posso ajudá-lo hoje?',
    type: 'text',
    category: 'Atendimento',
    tags: ['saudação', 'início'],
    usageCount: 45
  },
  {
    id: '2',
    title: 'Aguarde um momento',
    content: 'Por favor, aguarde um momento enquanto verifico essas informações para você.',
    type: 'text',
    category: 'Atendimento',
    tags: ['aguardar', 'verificar'],
    usageCount: 32
  },
  {
    id: '3',
    title: 'Finalização',
    content: 'Foi um prazer ajudá-lo! Se precisar de mais alguma coisa, estarei aqui.',
    type: 'text',
    category: 'Atendimento',
    tags: ['finalizar', 'despedida'],
    usageCount: 28
  }
]

export default function QuickActionsSidebar({
  isOpen,
  onClose,
  onSelectAction,
  activeChatId
}: QuickActionsSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Todos')

  // Filtrar ações baseado na busca e categoria
  const filteredActions = mockQuickActions.filter(action => {
    const matchesSearch = action.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         action.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         action.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'Todos' || action.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  const categories = ['Todos', ...Array.from(new Set(mockQuickActions.map(a => a.category)))]

  const handleSelectAction = (action: QuickAction) => {
    onSelectAction(action)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-96 bg-background border-l border-border shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-border bg-muted/30">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Zap className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">Respostas Rápidas</h2>
                    <p className="text-sm text-muted-foreground">
                      {filteredActions.length} ações disponíveis
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="w-8 h-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar respostas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Categories */}
            <div className="p-4 border-b border-border">
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className="h-7 text-xs"
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>

            {/* Actions List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {filteredActions.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">
                    {searchQuery ? 'Nenhuma resposta encontrada' : 'Nenhuma resposta disponível'}
                  </p>
                </div>
              ) : (
                filteredActions.map((action) => (
                  <motion.div
                    key={action.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="p-4 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleSelectAction(action)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-sm">{action.title}</h3>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <User className="w-3 h-3" />
                        {action.usageCount}
                      </div>
                    </div>
                    
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                      {action.content}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {action.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/10 text-primary"
                          >
                            <Tag className="w-2 h-2 mr-1" />
                            {tag}
                          </span>
                        ))}
                        {action.tags.length > 2 && (
                          <span className="text-xs text-muted-foreground">
                            +{action.tags.length - 2}
                          </span>
                        )}
                      </div>
                      
                      <Button size="sm" variant="ghost" className="h-6 px-2">
                        <Send className="w-3 h-3" />
                      </Button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border bg-muted/30">
              <p className="text-xs text-muted-foreground text-center">
                Clique em uma resposta para enviá-la
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
