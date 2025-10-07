'use client'

import { motion } from 'framer-motion'
import { Sparkles, Star, Zap } from 'lucide-react'

interface MessageSpecialProps {
  title: string
  description: string
  buttonText: string
  onButtonClick?: () => void
}

export default function MessageSpecial({
  title,
  description,
  buttonText,
  onButtonClick
}: MessageSpecialProps) {
  return (
    <div className="flex items-center justify-center min-h-[400px] py-12">
      <motion.div
        initial={{ scale: 0, rotate: -180, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{
          type: 'spring',
          stiffness: 260,
          damping: 20,
          duration: 0.8
        }}
        className="relative"
      >
        {/* Partículas explosivas de fundo */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0, x: 0, y: 0, opacity: 0 }}
            animate={{
              scale: [0, 1, 0],
              x: Math.cos((i * Math.PI) / 4) * 150,
              y: Math.sin((i * Math.PI) / 4) * 150,
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 1.5,
              delay: 0.2 + i * 0.1,
              repeat: Infinity,
              repeatDelay: 3
            }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
              {i % 3 === 0 ? (
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              ) : i % 3 === 1 ? (
                <Sparkles className="w-4 h-4 text-purple-400 fill-purple-400" />
              ) : (
                <Zap className="w-4 h-4 text-blue-400 fill-blue-400" />
              )}
            </motion.div>
          </motion.div>
        ))}

        {/* Card principal */}
        <motion.div
          className="relative z-10 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 p-[3px] rounded-3xl shadow-2xl"
          animate={{
            boxShadow: [
              '0 0 20px rgba(168, 85, 247, 0.4)',
              '0 0 60px rgba(236, 72, 153, 0.6)',
              '0 0 20px rgba(168, 85, 247, 0.4)'
            ]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="bg-white dark:bg-gray-900 rounded-3xl px-12 py-10 backdrop-blur-xl">
            {/* Ícone central animado */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: 'spring',
                stiffness: 200,
                damping: 15,
                delay: 0.3
              }}
              className="flex justify-center mb-6"
            >
              <motion.div
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.1, 1]
                }}
                transition={{
                  rotate: { duration: 20, repeat: Infinity, ease: 'linear' },
                  scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
                }}
                className="relative"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
                
                {/* Anéis pulsantes */}
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute inset-0 rounded-full border-2 border-purple-400"
                    initial={{ scale: 1, opacity: 0.8 }}
                    animate={{
                      scale: [1, 1.8, 2.5],
                      opacity: [0.8, 0.4, 0]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.6,
                      ease: 'easeOut'
                    }}
                  />
                ))}
              </motion.div>
            </motion.div>

            {/* Título explosivo */}
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-4xl font-black text-center mb-4 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent"
            >
              {title.split('').map((char, i) => (
                <motion.span
                  key={i}
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{
                    delay: 0.5 + i * 0.05,
                    type: 'spring',
                    stiffness: 200
                  }}
                  className="inline-block"
                >
                  {char === ' ' ? '\u00A0' : char}
                </motion.span>
              ))}
            </motion.h2>

            {/* Parágrafo */}
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="text-center text-gray-600 dark:text-gray-300 text-lg mb-8 max-w-md mx-auto leading-relaxed"
            >
              {description}
            </motion.p>

            {/* Botão explosivo */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: 'spring',
                stiffness: 200,
                damping: 15,
                delay: 1
              }}
              className="flex justify-center"
            >
              <motion.button
                onClick={onButtonClick}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative group px-8 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 text-white font-bold text-lg rounded-2xl shadow-xl overflow-hidden"
              >
                {/* Brilho animado */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
                  animate={{
                    x: [-200, 200]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 1,
                    ease: 'easeInOut'
                  }}
                />
                
                {/* Partículas do botão */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1 h-1 bg-white rounded-full"
                      style={{
                        left: `${20 + i * 15}%`,
                        top: '50%'
                      }}
                      animate={{
                        y: [-20, -40],
                        opacity: [1, 0],
                        scale: [1, 0.5]
                      }}
                      transition={{
                        duration: 0.8,
                        repeat: Infinity,
                        delay: i * 0.1
                      }}
                    />
                  ))}
                </div>

                <span className="relative z-10 flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  {buttonText}
                  <motion.span
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    →
                  </motion.span>
                </span>
              </motion.button>
            </motion.div>

            {/* Estrelas decorativas */}
            <div className="absolute top-4 left-4">
              <motion.div
                animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
              </motion.div>
            </div>
            <div className="absolute bottom-4 right-4">
              <motion.div
                animate={{ rotate: -360, scale: [1, 1.2, 1] }}
                transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
              >
                <Sparkles className="w-6 h-6 text-purple-400 fill-purple-400" />
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Orbs flutuantes de fundo */}
        <motion.div
          className="absolute -top-20 -right-20 w-40 h-40 bg-purple-400/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div
          className="absolute -bottom-20 -left-20 w-40 h-40 bg-pink-400/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 4, repeat: Infinity, delay: 1 }}
        />
      </motion.div>
    </div>
  )
}
