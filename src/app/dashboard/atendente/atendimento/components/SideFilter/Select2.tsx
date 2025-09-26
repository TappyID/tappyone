'use client'

import React from 'react'
import Select, { MultiValue, SingleValue, StylesConfig } from 'react-select'
import { useTheme } from '@/contexts/ThemeContext'

interface Option {
  value: string
  label: string
  icon?: string
  color?: string
}

interface Select2Props {
  value: string | string[]
  onChange: (value: string | string[]) => void
  options: any[]
  placeholder?: string
  isMulti?: boolean
  isLoading?: boolean
  isClearable?: boolean
  isSearchable?: boolean
  icon?: React.ComponentType<{ className?: string }>
  iconColor?: string
  label?: string
}

export default function Select2({
  value,
  onChange,
  options,
  placeholder = 'Selecione...',
  isMulti = false,
  isLoading = false,
  isClearable = true,
  isSearchable = true,
  icon: Icon,
  iconColor = 'blue',
  label
}: Select2Props) {
  const { actualTheme } = useTheme()
  const isDark = actualTheme === 'dark'
  
  // Converter opções para formato do react-select
  const formattedOptions: Option[] = options.map(opt => ({
    value: opt.id || opt.value || opt,
    label: opt.nome || opt.label || opt.name || opt,
    icon: opt.icon,
    color: opt.cor || opt.color
  }))

  // Encontrar valor selecionado
  const selectedValue = isMulti
    ? formattedOptions.filter(opt => (value as string[])?.includes(opt.value))
    : formattedOptions.find(opt => opt.value === value) || null
  
  // Valores atuais para multi-select
  const currentValues = value as string[]
  
  // Função para selecionar/desmarcar todos
  const handleToggleAll = () => {
    if (isMulti) {
      if (currentValues && currentValues.length === formattedOptions.length) {
        // Se todos estão selecionados, desmarcar todos
        onChange([])
      } else {
        // Caso contrário, selecionar todos
        const allValues = formattedOptions.map(opt => opt.value)
        onChange(allValues)
      }
    }
  }

  // Estilos customizados para dark/light mode
  const customStyles: StylesConfig<Option, any> = {
    control: (styles, { isFocused }) => ({
      ...styles,
      backgroundColor: isDark ? '#1f2937' : '#ffffff',
      borderColor: isFocused 
        ? iconColor === 'blue' ? '#3b82f6'
        : iconColor === 'purple' ? '#9333ea'
        : iconColor === 'green' ? '#10b981'
        : iconColor === 'indigo' ? '#6366f1'
        : iconColor === 'teal' ? '#14b8a6'
        : iconColor === 'orange' ? '#f97316'
        : iconColor === 'yellow' ? '#eab308'
        : '#3b82f6'
        : isDark ? '#4b5563' : '#d1d5db',
      borderWidth: '2px',
      borderRadius: '12px',
      padding: '4px 8px',
      minHeight: '44px',
      boxShadow: isFocused ? `0 0 0 3px ${isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.1)'}` : 'none',
      '&:hover': {
        borderColor: isFocused 
          ? iconColor === 'blue' ? '#3b82f6'
          : iconColor === 'purple' ? '#9333ea'
          : iconColor === 'green' ? '#10b981'
          : '#3b82f6'
          : isDark ? '#6b7280' : '#9ca3af'
      }
    }),
    menu: (styles) => ({
      ...styles,
      backgroundColor: isDark ? '#1f2937' : '#ffffff',
      borderRadius: '12px',
      border: `1px solid ${isDark ? '#4b5563' : '#d1d5db'}`,
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
      zIndex: 9999
    }),
    menuList: (styles) => ({
      ...styles,
      padding: '4px'
    }),
    option: (styles, { isSelected, isFocused }) => ({
      ...styles,
      backgroundColor: isSelected 
        ? iconColor === 'blue' ? '#3b82f6'
        : iconColor === 'purple' ? '#9333ea'
        : iconColor === 'green' ? '#10b981'
        : '#3b82f6'
        : isFocused 
          ? isDark ? '#374151' : '#f3f4f6'
          : 'transparent',
      color: isSelected 
        ? '#ffffff'
        : isDark ? '#d1d5db' : '#111827',
      padding: '10px 12px',
      borderRadius: '8px',
      cursor: 'pointer',
      '&:active': {
        backgroundColor: isSelected 
          ? iconColor === 'blue' ? '#2563eb'
          : iconColor === 'purple' ? '#7c3aed'
          : iconColor === 'green' ? '#059669'
          : '#2563eb'
          : isDark ? '#4b5563' : '#e5e7eb'
      }
    }),
    placeholder: (styles) => ({
      ...styles,
      color: isDark ? '#9ca3af' : '#6b7280'
    }),
    singleValue: (styles) => ({
      ...styles,
      color: isDark ? '#f3f4f6' : '#111827'
    }),
    multiValue: (styles) => ({
      ...styles,
      backgroundColor: isDark ? '#374151' : '#e5e7eb',
      borderRadius: '6px'
    }),
    multiValueLabel: (styles) => ({
      ...styles,
      color: isDark ? '#f3f4f6' : '#111827',
      padding: '2px 6px'
    }),
    multiValueRemove: (styles) => ({
      ...styles,
      color: isDark ? '#9ca3af' : '#6b7280',
      ':hover': {
        backgroundColor: isDark ? '#4b5563' : '#d1d5db',
        color: isDark ? '#f3f4f6' : '#111827'
      }
    }),
    input: (styles) => ({
      ...styles,
      color: isDark ? '#f3f4f6' : '#111827'
    }),
    indicatorSeparator: (styles) => ({
      ...styles,
      backgroundColor: isDark ? '#4b5563' : '#d1d5db'
    }),
    dropdownIndicator: (styles) => ({
      ...styles,
      color: isDark ? '#9ca3af' : '#6b7280',
      ':hover': {
        color: isDark ? '#d1d5db' : '#4b5563'
      }
    }),
    clearIndicator: (styles) => ({
      ...styles,
      color: isDark ? '#9ca3af' : '#6b7280',
      ':hover': {
        color: isDark ? '#ef4444' : '#ef4444'
      }
    }),
    loadingIndicator: (styles) => ({
      ...styles,
      color: isDark ? '#9ca3af' : '#6b7280'
    })
  }

  // Custom option component com ícones (SEM checkbox aqui pois já tem no componente Option)
  const formatOptionLabel = (option: Option) => (
    <div className="flex items-center gap-2">
      {option.icon && typeof option.icon === 'string' && <span>{option.icon}</span>}
      {option.color && (
        <div 
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: option.color }}
        />
      )}
      <span>{option.label}</span>
    </div>
  )

  const handleChange = (newValue: MultiValue<Option> | SingleValue<Option>) => {
    if (isMulti) {
      const values = (newValue as MultiValue<Option>)?.map(opt => opt.value) || []
      onChange(values)
    } else {
      const value = (newValue as SingleValue<Option>)?.value || ''
      onChange(value)
    }
  }

  return (
    <div>
      {label && (
        <div className="flex items-center justify-between mb-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white">
            {Icon && <Icon className={`w-4 h-4 text-${iconColor}-500`} />}
            {label}
          </label>
          {isMulti && (
            <button
              type="button"
              onClick={handleToggleAll}
              className="text-xs px-2 py-0.5 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-300 rounded transition-colors"
              title={currentValues && currentValues.length === formattedOptions.length ? "Desmarcar Todos" : "Selecionar Todos"}
            >
              {currentValues && currentValues.length === formattedOptions.length ? (
                <>✗ Desmarcar Todos</>
              ) : (
                <>✓ Selecionar Todos</>
              )}
            </button>
          )}
        </div>
      )}
      <Select
        value={selectedValue}
        onChange={handleChange}
        options={formattedOptions}
        isMulti={isMulti}
        isLoading={isLoading}
        isClearable={isClearable}
        isSearchable={isSearchable}
        placeholder={placeholder}
        styles={customStyles}
        formatOptionLabel={formatOptionLabel}
        className="react-select-container"
        classNamePrefix="react-select"
        noOptionsMessage={() => 'Nenhuma opção encontrada'}
        loadingMessage={() => 'Carregando...'}
        closeMenuOnSelect={!isMulti}
        hideSelectedOptions={false}
        backspaceRemovesValue={isMulti}
        components={{
          ...(isMulti ? {
            Option: ({ children, ...props }: any) => (
              <div
                ref={props.innerRef}
                {...props.innerProps}
                className={`flex items-center gap-2 p-2 cursor-pointer rounded-lg ${
                  props.isSelected ? 'bg-blue-100 dark:bg-blue-900' : ''
                } ${props.isFocused ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={props.isSelected}
                  readOnly
                  className="w-4 h-4 text-blue-500 rounded"
                />
                {children}
              </div>
            )
          } : {})
        }}
      />
    </div>
  )
}
