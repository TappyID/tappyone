'use client'

import React from 'react'
import OrcamentosBadge from './components/OrcamentosBadge'
import TagsBadge from './components/TagsBadge'
import OrcamentosExpandido from './components/OrcamentosExpandido'
import OrcamentosTotalColuna from './components/OrcamentosTotalColuna'

export default function TestComponents() {
  // Card de teste
  const testCard = {
    id: '5518996064455@c.us',
    nome: 'Willian'
  }
  
  // Cards para teste do total da coluna
  const testCards = [
    { id: '5518996064455@c.us', nome: 'Willian' },
    { id: '5511999999999@c.us', nome: 'Teste' }
  ]

  return (
    <div className="p-8 space-y-4 bg-gray-100 dark:bg-gray-900 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Teste dos Componentes Isolados</h1>
      
      {/* Teste OrcamentosBadge */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">OrcamentosBadge</h2>
        <OrcamentosBadge 
          cardId={testCard.id}
          columnColor="#3b82f6"
          theme="light"
          onClick={() => console.log('Clicou no badge de orçamentos')}
        />
      </div>
      
      {/* Teste TagsBadge */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">TagsBadge</h2>
        <TagsBadge 
          cardId={testCard.id}
          theme="light"
        />
      </div>
      
      {/* Teste OrcamentosExpandido */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">OrcamentosExpandido</h2>
        <OrcamentosExpandido 
          cardId={testCard.id}
          columnColor="#3b82f6"
          theme="light"
          onOpenOrcamento={() => console.log('Abrir modal de orçamento')}
        />
      </div>
      
      {/* Teste OrcamentosTotalColuna */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">OrcamentosTotalColuna</h2>
        <OrcamentosTotalColuna 
          cards={testCards}
          columnColor="#3b82f6"
          theme="light"
        />
      </div>
    </div>
  )
}
