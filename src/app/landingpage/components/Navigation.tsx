'use client'

import { motion } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'
import { Zap, Menu, X, Sun, Moon } from 'lucide-react'
import { useState } from 'react'

export default function Navigation() {
  const { actualTheme, setTheme } = useTheme()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const navItems = [
    { name: 'Recursos', href: '#features' },
    { name: 'Preços', href: '#pricing' },
    { name: 'Sobre', href: '#about' },
    { name: 'Contato', href: '#contact' }
  ]

  const toggleTheme = () => {
    setTheme(actualTheme === 'dark' ? 'light' : 'dark')
  }

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 py-4 ${
        actualTheme === 'dark'
          ? 'bg-slate-900/80 border-purple-500/20'
          : 'bg-white/80 border-purple-200/30'
      } backdrop-blur-xl border-b`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <motion.div
          className="flex items-center gap-3"
          whileHover={{ scale: 1.05 }}
        >
          <motion.div
            className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 shadow-lg"
            whileHover={{ rotate: 5 }}
          >
            <Zap className="w-6 h-6 text-white" />
          </motion.div>
          <span className={`text-xl font-bold ${
            actualTheme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            TappyOne
          </span>
        </motion.div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item, index) => (
            <motion.a
              key={index}
              href={item.href}
              className={`text-sm font-medium transition-colors duration-300 ${
                actualTheme === 'dark'
                  ? 'text-gray-300 hover:text-purple-300'
                  : 'text-gray-600 hover:text-purple-600'
              }`}
              whileHover={{ y: -2 }}
              whileTap={{ y: 0 }}
            >
              {item.name}
            </motion.a>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          {/* Theme Toggle */}
          <motion.button
            onClick={toggleTheme}
            className={`p-2 rounded-xl border transition-all duration-300 ${
              actualTheme === 'dark'
                ? 'bg-slate-800/50 border-slate-600/50 text-white hover:bg-slate-700/50'
                : 'bg-white/70 border-gray-200/50 text-gray-900 hover:bg-white/90'
            } backdrop-blur-sm`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {actualTheme === 'dark' ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </motion.button>

          {/* CTA Button */}
          <motion.button
            className="hidden sm:block px-6 py-2 rounded-xl font-semibold bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Começar Grátis
          </motion.button>

          {/* Mobile Menu Toggle */}
          <motion.button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`md:hidden p-2 rounded-xl border transition-all duration-300 ${
              actualTheme === 'dark'
                ? 'bg-slate-800/50 border-slate-600/50 text-white'
                : 'bg-white/70 border-gray-200/50 text-gray-900'
            } backdrop-blur-sm`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isMenuOpen ? (
              <X className="w-4 h-4" />
            ) : (
              <Menu className="w-4 h-4" />
            )}
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      <motion.div
        className={`md:hidden mt-4 ${isMenuOpen ? 'block' : 'hidden'}`}
        initial={{ opacity: 0, height: 0 }}
        animate={{ 
          opacity: isMenuOpen ? 1 : 0, 
          height: isMenuOpen ? 'auto' : 0 
        }}
        transition={{ duration: 0.3 }}
      >
        <div className={`p-4 rounded-2xl border ${
          actualTheme === 'dark'
            ? 'bg-slate-800/50 border-slate-600/50'
            : 'bg-white/70 border-gray-200/50'
        } backdrop-blur-sm space-y-3`}>
          {navItems.map((item, index) => (
            <motion.a
              key={index}
              href={item.href}
              className={`block py-2 text-sm font-medium transition-colors duration-300 ${
                actualTheme === 'dark'
                  ? 'text-gray-300 hover:text-purple-300'
                  : 'text-gray-600 hover:text-purple-600'
              }`}
              onClick={() => setIsMenuOpen(false)}
              whileHover={{ x: 5 }}
            >
              {item.name}
            </motion.a>
          ))}
          <motion.button
            className="w-full mt-4 px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-lg"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Começar Grátis
          </motion.button>
        </div>
      </motion.div>
    </motion.nav>
  )
}
