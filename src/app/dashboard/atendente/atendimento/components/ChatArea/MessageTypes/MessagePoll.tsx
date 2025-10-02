'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, Users, Clock } from 'lucide-react'

interface PollOption {
  id: string
  text: string
  votes: number
}

interface MessagePollProps {
  question: string
  options: PollOption[]
  totalVotes: number
  isFromUser: boolean
  allowMultipleAnswers?: boolean
  hasVoted?: boolean
  userVote?: string[]
  caption?: string
  messageId?: string
  chatId?: string
  onVote?: (messageId: string, chatId: string, votes: string[]) => void
}

export default function MessagePoll({
  question,
  options,
  totalVotes,
  isFromUser,
  allowMultipleAnswers = false,
  hasVoted = false,
  userVote = [],
  caption,
  messageId,
  chatId,
  onVote
}: MessagePollProps) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>(userVote)
  const [isVoting, setIsVoting] = useState(false)

  const handleOptionSelect = (optionId: string) => {
    if (hasVoted) return // Não permitir votar novamente

    if (allowMultipleAnswers) {
      setSelectedOptions(prev =>
        prev.includes(optionId)
          ? prev.filter(id => id !== optionId)
          : [...prev, optionId]
      )
    } else {
      setSelectedOptions([optionId])
    }
  }

  const handleVote = async () => {
    if (!messageId || !chatId || !onVote || selectedOptions.length === 0 || hasVoted) return

    setIsVoting(true)
    try {
      // Converter IDs para nomes das opções para a API WAHA
      const selectedOptionNames = selectedOptions.map(id => {
        const option = options.find(opt => opt.id === id)
        return option?.text || ''
      }).filter(Boolean)

      await onVote(messageId, chatId, selectedOptionNames)
    } catch {} finally {
      setIsVoting(false)
    }
  }

  const getPercentage = (votes: number) => {
    return totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0
  }

  return (
    <div className="space-y-2">
      {/* Container da Enquete */}
      <div className="rounded-2xl overflow-hidden max-w-md bg-white dark:bg-gray-700 shadow-lg border border-gray-200 dark:border-gray-600">

        {/* Header da enquete */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-4 text-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold">Enquete</h3>
              <p className="text-sm opacity-90">
                {allowMultipleAnswers ? 'Múltiplas respostas' : 'Uma resposta'}
              </p>
            </div>
          </div>
          <p className="font-medium">{question}</p>
        </div>

        {/* Opções da enquete */}
        <div className="p-4 space-y-3">
          {options.map((option) => {
            const percentage = getPercentage(option.votes)
            const isSelected = selectedOptions.includes(option.id)
            const hasResults = totalVotes > 0

            return (
              <motion.div
                key={option.id}
                whileHover={{ scale: hasVoted ? 1 : 1.02 }}
                whileTap={{ scale: hasVoted ? 1 : 0.98 }}
                onClick={() => handleOptionSelect(option.id)}
                className={`relative p-3 rounded-lg border-2 transition-all cursor-pointer ${
                  hasVoted
                    ? 'cursor-default'
                    : isSelected
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
              >
                {/* Barra de progresso (mostrada após votação) */}
                {hasResults && (
                  <div
                    className="absolute left-0 top-0 bottom-0 bg-purple-500/20 rounded-lg transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                )}

                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Checkbox/Radio */}
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                      isSelected
                        ? 'border-purple-500 bg-purple-500'
                        : 'border-gray-300 dark:border-gray-600'
                    } ${allowMultipleAnswers ? 'rounded' : 'rounded-full'}`}>
                      {isSelected && (
                        <div className={`w-2 h-2 bg-white ${
                          allowMultipleAnswers ? 'rounded' : 'rounded-full'
                        }`} />
                      )}
                    </div>

                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {option.text}
                    </span>
                  </div>

                  {/* Resultados */}
                  {hasResults && (
                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                      <span>{option.votes} votos</span>
                      <span className="font-semibold">{percentage}%</span>
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}

          {/* Footer com estatísticas */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-600">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Users className="w-4 h-4" />
              <span>{totalVotes} votos</span>
            </div>

            {hasVoted ? (
              <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span>Você votou</span>
              </div>
            ) : selectedOptions.length > 0 && (
              <button
                onClick={handleVote}
                disabled={isVoting}
                className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isVoting ? 'Votando...' : 'Votar'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Caption opcional */}
      {caption && (
        <p className={`text-sm ${
          isFromUser ? 'text-gray-900 dark:text-white/90' : 'text-gray-700 dark:text-gray-300'
        }`}>
          {caption}
        </p>
      )}
    </div>
  )
}
