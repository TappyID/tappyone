'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Paperclip, Camera, Mic, BarChart3, TrendingUp, Upload, Play, Pause, Square, Smile, Video, Phone, Image } from 'lucide-react'

interface MicroModalProps {
  isOpen: boolean
  onClose: () => void
  isDark?: boolean
}

// Modal Base Component
const ModalBase = ({ 
  isOpen, onClose, children, title, isDark = false 
}: { 
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  title: string
  isDark?: boolean
}) => (
  <AnimatePresence>
    {isOpen && (
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 max-w-[90vw] ${
            isDark 
              ? 'bg-gray-800/95 border-gray-700/50 text-white backdrop-blur-xl' 
              : 'bg-white/95 border-gray-200 text-gray-900 backdrop-blur-xl'
          } border rounded-2xl shadow-2xl z-50`}
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-200/20">
            <h3 className="text-lg font-semibold">{title}</h3>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className={`p-1 rounded-lg transition-colors ${
                isDark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-100'
              }`}
            >
              <X className="w-5 h-5" />
            </motion.button>
          </div>
          <div className="p-6">
            {children}
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
)

// File Upload Modal
export const FileUploadModal = ({ isOpen, onClose, isDark }: MicroModalProps) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} title="Anexar Arquivos" isDark={isDark}>
      <div className="space-y-4">
        <div className={`border-2 border-dashed rounded-xl p-8 text-center ${
          isDark ? 'border-gray-600 hover:border-gray-500' : 'border-gray-300 hover:border-gray-400'
        }`}>
          <Upload className={`w-8 h-8 mx-auto mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
          <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Arraste arquivos aqui ou clique para selecionar
          </p>
          <input type="file" multiple className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
        </div>
        <div className="flex gap-3 pt-4">
          <button onClick={onClose} className={`flex-1 px-4 py-2 rounded-xl font-medium ${
            isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
          }`}>Cancelar</button>
          <button className="flex-1 px-4 py-2 rounded-xl font-medium bg-gradient-to-r from-[#305e73] to-[#3a6d84] text-white">
            Enviar
          </button>
        </div>
      </div>
    </ModalBase>
  )
}

// Photo Modal
export const PhotoModal = ({ isOpen, onClose, isDark }: MicroModalProps) => (
  <ModalBase isOpen={isOpen} onClose={onClose} title="Enviar Foto" isDark={isDark}>
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <button className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-dashed ${
          isDark ? 'border-gray-600' : 'border-gray-300'
        }`}>
          <Camera className="w-6 h-6" />
          <span className="text-sm font-medium">Câmera</span>
        </button>
        <button className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-dashed ${
          isDark ? 'border-gray-600' : 'border-gray-300'
        }`}>
          <Image className="w-6 h-6" />
          <span className="text-sm font-medium">Galeria</span>
        </button>
      </div>
      <div className="flex gap-3 pt-4">
        <button onClick={onClose} className={`flex-1 px-4 py-2 rounded-xl font-medium ${
          isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
        }`}>Cancelar</button>
        <button className="flex-1 px-4 py-2 rounded-xl font-medium bg-gradient-to-r from-[#305e73] to-[#3a6d84] text-white">
          Enviar
        </button>
      </div>
    </div>
  </ModalBase>
)

// Audio Modal
export const AudioModal = ({ isOpen, onClose, isDark }: MicroModalProps) => {
  const [isRecording, setIsRecording] = useState(false)

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} title="Gravar Áudio" isDark={isDark}>
      <div className="space-y-6 text-center">
        <motion.div
          animate={{ scale: isRecording ? [1, 1.1, 1] : 1 }}
          transition={{ duration: 1, repeat: isRecording ? Infinity : 0 }}
          className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center ${
            isRecording ? 'bg-red-500' : isDark ? 'bg-gray-700' : 'bg-gray-200'
          }`}
        >
          <Mic className={`w-8 h-8 ${isRecording ? 'text-white' : isDark ? 'text-gray-400' : 'text-gray-500'}`} />
        </motion.div>
        <button
          onClick={() => setIsRecording(!isRecording)}
          className={`px-6 py-3 rounded-xl font-medium ${
            isRecording ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'
          }`}
        >
          {isRecording ? 'Parar' : 'Gravar'}
        </button>
        <div className="flex gap-3">
          <button onClick={onClose} className={`flex-1 px-4 py-2 rounded-xl font-medium ${
            isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
          }`}>Cancelar</button>
          <button className="flex-1 px-4 py-2 rounded-xl font-medium bg-gradient-to-r from-[#305e73] to-[#3a6d84] text-white">
            Enviar
          </button>
        </div>
      </div>
    </ModalBase>
  )
}

// Sales Modal
export const SalesModal = ({ isOpen, onClose, isDark }: MicroModalProps) => (
  <ModalBase isOpen={isOpen} onClose={onClose} title="Vendas" isDark={isDark}>
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Hoje', value: 'R$ 2.450', growth: '+12%' },
          { label: 'Semana', value: 'R$ 18.200', growth: '+8%' },
          { label: 'Mês', value: 'R$ 67.800', growth: '+15%' },
          { label: 'Trimestre', value: 'R$ 189.400', growth: '-3%' },
        ].map((item, i) => (
          <div key={i} className={`p-4 rounded-xl border ${
            isDark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'
          }`}>
            <div className="text-xs text-gray-500 mb-1">{item.label}</div>
            <div className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.value}</div>
            <div className={`text-sm ${item.growth.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
              {item.growth}
            </div>
          </div>
        ))}
      </div>
      <button onClick={onClose} className={`w-full px-4 py-2 rounded-xl font-medium ${
        isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
      }`}>Fechar</button>
    </div>
  </ModalBase>
)

// NCS Modal
export const NCSModal = ({ isOpen, onClose, isDark }: MicroModalProps) => (
  <ModalBase isOpen={isOpen} onClose={onClose} title="Índice NCS" isDark={isDark}>
    <div className="space-y-6 text-center">
      <div className="w-24 h-24 mx-auto rounded-full bg-green-500 flex items-center justify-center">
        <span className="text-2xl font-bold text-white">98.5</span>
      </div>
      <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
        Baseado em 247 respostas
      </div>
      <button onClick={onClose} className={`w-full px-4 py-2 rounded-xl font-medium ${
        isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
      }`}>Fechar</button>
    </div>
  </ModalBase>
)

// Video Call Modal
export const VideoCallModal = ({ isOpen, onClose, isDark }: MicroModalProps) => (
  <ModalBase isOpen={isOpen} onClose={onClose} title="Videochamada" isDark={isDark}>
    <div className="space-y-4 text-center">
      <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center ${
        isDark ? 'bg-blue-600' : 'bg-blue-500'
      }`}>
        <Video className="w-8 h-8 text-white" />
      </div>
      <div>
        <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Iniciar videochamada?
        </p>
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          Uma nova janela será aberta
        </p>
      </div>
      <div className="flex gap-3">
        <button onClick={onClose} className={`flex-1 px-4 py-2 rounded-xl font-medium ${
          isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
        }`}>Cancelar</button>
        <button className="flex-1 px-4 py-2 rounded-xl font-medium bg-blue-500 text-white">
          Iniciar
        </button>
      </div>
    </div>
  </ModalBase>
)

// Phone Call Modal
export const PhoneCallModal = ({ isOpen, onClose, isDark }: MicroModalProps) => (
  <ModalBase isOpen={isOpen} onClose={onClose} title="Ligação" isDark={isDark}>
    <div className="space-y-4 text-center">
      <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center ${
        isDark ? 'bg-green-600' : 'bg-green-500'
      }`}>
        <Phone className="w-8 h-8 text-white" />
      </div>
      <div>
        <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Iniciar ligação?
        </p>
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          Conectando via sistema de telefonia
        </p>
      </div>
      <div className="flex gap-3">
        <button onClick={onClose} className={`flex-1 px-4 py-2 rounded-xl font-medium ${
          isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
        }`}>Cancelar</button>
        <button className="flex-1 px-4 py-2 rounded-xl font-medium bg-green-500 text-white">
          Ligar
        </button>
      </div>
    </div>
  </ModalBase>
)

// Attendant Info Modal
export const AttendantInfoModal = ({ isOpen, onClose, isDark, atendente }: MicroModalProps & { atendente?: any }) => (
  <ModalBase isOpen={isOpen} onClose={onClose} title="Informações do Atendente" isDark={isDark}>
    {atendente && (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <img src={atendente.avatar} alt={atendente.nome} className="w-16 h-16 rounded-full" />
          <div>
            <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {atendente.nome}
            </h4>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {atendente.cargo}
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className={`p-3 rounded-lg border ${
            isDark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'
          }`}>
            <div className="text-xs text-gray-500 mb-1">Status</div>
            <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {atendente.status}
            </div>
          </div>
          
          {atendente.fila && (
            <div className={`p-3 rounded-lg border ${
              isDark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'
            }`}>
              <div className="text-xs text-gray-500 mb-1">Fila</div>
              <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {atendente.fila}
              </div>
            </div>
          )}
          
          {atendente.tag && (
            <div className={`p-3 rounded-lg border ${
              isDark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'
            }`}>
              <div className="text-xs text-gray-500 mb-1">Tag</div>
              <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {atendente.tag}
              </div>
            </div>
          )}
          
          {atendente.indiceNCS && (
            <div className={`p-3 rounded-lg border ${
              isDark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'
            }`}>
              <div className="text-xs text-gray-500 mb-1">NCS</div>
              <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {atendente.indiceNCS}
              </div>
            </div>
          )}
        </div>
        
        <button onClick={onClose} className={`w-full px-4 py-2 rounded-xl font-medium ${
          isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
        }`}>Fechar</button>
      </div>
    )}
  </ModalBase>
)
