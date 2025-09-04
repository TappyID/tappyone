'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { FixedSizeList as List } from 'react-window'

interface VirtualizedListProps<T> {
  items: T[]
  height: number
  itemHeight: number
  renderItem: (props: { index: number; style: React.CSSProperties; data: T }) => React.ReactNode
  searchQuery?: string
  filterFn?: (item: T, query: string) => boolean
  className?: string
}

export function VirtualizedList<T>({
  items,
  height,
  itemHeight,
  renderItem,
  searchQuery = '',
  filterFn,
  className = ''
}: VirtualizedListProps<T>) {
  // Filtrar items baseado na busca
  const filteredItems = useMemo(() => {
    if (!searchQuery || !filterFn) return items
    return items.filter(item => filterFn(item, searchQuery))
  }, [items, searchQuery, filterFn])

  // Componente item otimizado
  const ItemRenderer = useCallback(({ index, style }: { index: number; style: React.CSSProperties }) => {
    const item = filteredItems[index]
    return (
      <div style={style}>
        {renderItem({ index, style, data: item })}
      </div>
    )
  }, [filteredItems, renderItem])

  return (
    <div className={className}>
      <List
        height={height}
        itemCount={filteredItems.length}
        itemSize={itemHeight}
        itemData={filteredItems}
        overscanCount={5} // Renderiza 5 items extras para scroll suave
      >
        {ItemRenderer}
      </List>
    </div>
  )
}
