'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { User, Phone, Mail, MessageCircle, UserPlus } from 'lucide-react'

interface MessageContactProps {
  name: string
  phoneNumber?: string
  email?: string
  organization?: string
  isFromUser: boolean
  caption?: string
}

export default function MessageContact({
  name,
  phoneNumber,
  email,
  organization,
  isFromUser,
  caption
}: MessageContactProps) {

  const handleCall = () => {
    if (phoneNumber) {
      window.open(`tel:${phoneNumber}`, '_self')
    }
  }

  const handleWhatsApp = () => {
    if (phoneNumber) {
      const cleanPhone = phoneNumber.replace(/\D/g, '')
      window.open(`https://wa.me/${cleanPhone}`, '_blank')
    }
  }

  const handleEmail = () => {
    if (email) {
      window.open(`mailto:${email}`, '_self')
    }
  }

  const handleAddContact = () => {
    // Criar vCard para download
    const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${name}
${organization ? `ORG:${organization}` : ''}
${phoneNumber ? `TEL:${phoneNumber}` : ''}
${email ? `EMAIL:${email}` : ''}
END:VCARD`

    const blob = new Blob([vcard], { type: 'text/vcard' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${name}.vcf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-2">
      {/* Container do Contato */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="rounded-2xl overflow-hidden max-w-sm bg-white dark:bg-gray-700 shadow-lg border border-gray-200 dark:border-gray-600"
      >
        {/* Header do card */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{name}</h3>
              {organization && (
                <p className="text-sm opacity-90">{organization}</p>
              )}
            </div>
          </div>
        </div>

        {/* Informações do contato */}
        <div className="p-4 space-y-3">
          {phoneNumber && (
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700 dark:text-gray-300 font-mono">
                {phoneNumber}
              </span>
            </div>
          )}

          {email && (
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {email}
              </span>
            </div>
          )}

          {/* Botões de ação */}
          <div className="flex flex-wrap gap-2 pt-2">
            {phoneNumber && (
              <>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCall}
                  className="flex items-center gap-2 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs font-medium transition-colors"
                >
                  <Phone className="w-3 h-3" />
                  Ligar
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleWhatsApp}
                  className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-medium transition-colors"
                >
                  <MessageCircle className="w-3 h-3" />
                  WhatsApp
                </motion.button>
              </>
            )}

            {email && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleEmail}
                className="flex items-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs font-medium transition-colors"
              >
                <Mail className="w-3 h-3" />
                E-mail
              </motion.button>
            )}

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAddContact}
              className="flex items-center gap-2 px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-xs font-medium transition-colors"
            >
              <UserPlus className="w-3 h-3" />
              Adicionar
            </motion.button>
          </div>
        </div>
      </motion.div>

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
