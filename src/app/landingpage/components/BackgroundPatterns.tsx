'use client'

import { motion } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'

export default function BackgroundPatterns() {
  const { actualTheme } = useTheme()

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Animated Gradient Orbs */}
      <motion.div
        className={`absolute -top-40 -right-40 w-80 h-80 rounded-full ${
          actualTheme === 'dark'
            ? 'bg-gradient-to-br from-purple-500/20 to-violet-600/20'
            : 'bg-gradient-to-br from-purple-300/30 to-blue-400/30'
        } blur-3xl`}
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <motion.div
        className={`absolute -bottom-40 -left-40 w-96 h-96 rounded-full ${
          actualTheme === 'dark'
            ? 'bg-gradient-to-tr from-indigo-500/20 to-purple-600/20'
            : 'bg-gradient-to-tr from-blue-300/30 to-purple-400/30'
        } blur-3xl`}
        animate={{
          scale: [1.2, 1, 1.2],
          rotate: [360, 180, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <motion.div
        className={`absolute top-1/2 left-1/2 w-64 h-64 rounded-full ${
          actualTheme === 'dark'
            ? 'bg-gradient-to-br from-violet-500/15 to-purple-600/15'
            : 'bg-gradient-to-br from-purple-200/40 to-indigo-300/40'
        } blur-2xl`}
        animate={{
          x: [-100, 100, -100],
          y: [-50, 50, -50],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Geometric Patterns */}
      <div className="absolute inset-0">
        {/* Grid Pattern */}
        <div 
          className={`absolute inset-0 opacity-10 ${
            actualTheme === 'dark' ? 'opacity-5' : 'opacity-10'
          }`}
          style={{
            backgroundImage: `
              linear-gradient(${actualTheme === 'dark' ? 'rgba(139, 92, 246, 0.1)' : 'rgba(139, 92, 246, 0.15)'} 1px, transparent 1px),
              linear-gradient(90deg, ${actualTheme === 'dark' ? 'rgba(139, 92, 246, 0.1)' : 'rgba(139, 92, 246, 0.15)'} 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        />

        {/* Floating Particles */}
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className={`absolute w-2 h-2 rounded-full ${
              actualTheme === 'dark'
                ? 'bg-purple-400/20'
                : 'bg-purple-500/30'
            }`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 1, 0.3],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Noise Texture Overlay */}
      <div 
        className={`absolute inset-0 opacity-30 mix-blend-overlay ${
          actualTheme === 'dark' ? 'opacity-20' : 'opacity-10'
        }`}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  )
}
