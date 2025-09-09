import React from 'react'

// Skeleton para cards do Kanban
export const KanbanCardSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-lg border p-4 animate-pulse">
    <div className="flex items-center gap-3 mb-3">
      <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
      <div className="flex-1">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
      </div>
    </div>
    <div className="flex gap-2 mb-3">
      <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
      <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
      <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
    </div>
    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-1"></div>
    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
  </div>
)

// Skeleton para lista de conversas
export const ConversationItemSkeleton = () => (
  <div className="flex items-center p-4 border-b animate-pulse">
    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full mr-3"></div>
    <div className="flex-1">
      <div className="flex justify-between items-start mb-2">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
      </div>
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-1"></div>
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
    </div>
  </div>
)

// Skeleton para múltiplos cards do Kanban
export const KanbanColumnSkeleton = ({ count = 3 }: { count?: number }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, index) => (
      <KanbanCardSkeleton key={index} />
    ))}
  </div>
)

// Skeleton para lista de conversas
export const ConversationListSkeleton = ({ count = 5 }: { count?: number }) => (
  <div className="divide-y divide-gray-200 dark:divide-gray-700">
    {Array.from({ length: count }).map((_, index) => (
      <ConversationItemSkeleton key={index} />
    ))}
  </div>
)

// Skeleton para área de chat
export const ChatAreaSkeleton = () => (
  <div className="flex-1 flex flex-col animate-pulse">
    {/* Header do chat */}
    <div className="border-b p-4 flex items-center gap-3">
      <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
      <div className="flex-1">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-1"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
      </div>
    </div>
    
    {/* Mensagens */}
    <div className="flex-1 p-4 space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className={`flex ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
          <div className={`max-w-xs p-3 rounded-lg ${
            index % 2 === 0 
              ? 'bg-gray-100 dark:bg-gray-700' 
              : 'bg-blue-100 dark:bg-blue-900'
          }`}>
            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-full mb-1"></div>
            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
          </div>
        </div>
      ))}
    </div>
    
    {/* Input area */}
    <div className="border-t p-4">
      <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
    </div>
  </div>
)

// Skeleton genérico
export const GenericSkeleton = ({ 
  lines = 3, 
  className = "" 
}: { 
  lines?: number
  className?: string 
}) => (
  <div className={`animate-pulse ${className}`}>
    {Array.from({ length: lines }).map((_, index) => (
      <div 
        key={index}
        className={`h-4 bg-gray-200 dark:bg-gray-700 rounded ${
          index < lines - 1 ? 'mb-2' : ''
        } ${
          index === lines - 1 ? 'w-2/3' : 'w-full'
        }`}
      ></div>
    ))}
  </div>
)
