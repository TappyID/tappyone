'use client'

import React from 'react'
import { Search, X } from 'lucide-react'

interface SearchInputProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  placeholder?: string
}

export default function SearchInput({ 
  searchQuery, 
  onSearchChange, 
  placeholder = "Pesquisar conversas..." 
}: SearchInputProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
      <input
        type="text"
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                   bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                   focus:ring-2 focus:ring-blue-500 focus:border-transparent
                   placeholder-gray-500 dark:placeholder-gray-400
                   transition-all duration-200"
      />
      {searchQuery && (
        <button
          onClick={() => onSearchChange('')}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 
                     text-gray-400 hover:text-gray-600 dark:hover:text-gray-300
                     transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
