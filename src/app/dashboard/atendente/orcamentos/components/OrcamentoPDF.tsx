'use client'

import { motion } from 'framer-motion'
import { 
  Download, 
  Share2, 
  Printer, 
  FileText,
  Calendar,
  User,
  Phone,
  Mail,
  MapPin,
  DollarSign
} from 'lucide-react'

interface OrcamentoPDFProps {
  orcamento: {
    id: string
    titulo: string
    cliente: string
    telefone?: string
    email?: string
    endereco?: string
    data: string
    data_validade: string
    tipo: 'venda' | 'assinatura' | 'orcamento' | 'cobranca'
    status: string
    itens: Array<{
      id: string
      nome: string
      descricao?: string
      valor: number
      quantidade: number
    }>
    observacao?: string
    condicoes_pagamento?: string
    prazo_entrega?: string
    desconto?: number
    taxa_adicional?: number
    total: number
  }
  empresa?: {
    nome: string
    cnpj?: string
    endereco?: string
    telefone?: string
    email?: string
    website?: string
  }
}

export default function OrcamentoPDF({ orcamento, empresa }: OrcamentoPDFProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const calcularSubtotal = () => {
    return orcamento.itens.reduce((total, item) => total + (item.valor * item.quantidade), 0)
  }

  const handleDownload = () => {
    // Implementar download do PDF
    console.log('Download PDF:', orcamento.id)
  }

  const handleShare = () => {
    // Implementar compartilhamento
    console.log('Share PDF:', orcamento.id)
  }

  const handlePrint = () => {
    window.print()
  }

  const tipoLabels = {
    orcamento: 'Orçamento',
    venda: 'Proposta de Venda',
    assinatura: 'Proposta de Assinatura',
    cobranca: 'Cobrança'
  }

  const statusColors = {
    pendente: 'bg-yellow-100 text-yellow-800',
    aprovado: 'bg-green-100 text-green-800',
    rejeitado: 'bg-red-100 text-red-800',
    expirado: 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="bg-white">
      {/* Toolbar - Não aparece na impressão */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 print:hidden">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {tipoLabels[orcamento.tipo]} #{orcamento.id}
            </h2>
            <p className="text-gray-600">
              {orcamento.cliente} • {formatDate(orcamento.data)}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Printer className="w-4 h-4" />
              Imprimir
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              Compartilhar
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#305e73] to-[#3a6d84] text-white rounded-lg hover:shadow-lg transition-all"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </motion.button>
          </div>
        </div>
      </div>

      {/* Conteúdo do PDF */}
      <div className="max-w-4xl mx-auto p-8 print:p-0 print:max-w-none">
        {/* Header da Empresa */}
        <div className="mb-8 pb-6 border-b-2 border-[#305e73]">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#305e73] mb-2">
                {empresa?.nome || 'TappyOne'}
              </h1>
              {empresa?.cnpj && (
                <p className="text-gray-600">CNPJ: {empresa.cnpj}</p>
              )}
              {empresa?.endereco && (
                <p className="text-gray-600 flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {empresa.endereco}
                </p>
              )}
              <div className="flex items-center gap-4 mt-2">
                {empresa?.telefone && (
                  <p className="text-gray-600 flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    {empresa.telefone}
                  </p>
                )}
                {empresa?.email && (
                  <p className="text-gray-600 flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    {empresa.email}
                  </p>
                )}
              </div>
            </div>
            
            <div className="text-right">
              <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                statusColors[orcamento.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'
              }`}>
                {orcamento.status.charAt(0).toUpperCase() + orcamento.status.slice(1)}
              </div>
            </div>
          </div>
        </div>

        {/* Informações do Orçamento */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Dados do Cliente */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-[#305e73]" />
              Dados do Cliente
            </h3>
            <div className="space-y-2">
              <p><strong>Nome:</strong> {orcamento.cliente}</p>
              {orcamento.telefone && (
                <p><strong>Telefone:</strong> {orcamento.telefone}</p>
              )}
              {orcamento.email && (
                <p><strong>E-mail:</strong> {orcamento.email}</p>
              )}
              {orcamento.endereco && (
                <p><strong>Endereço:</strong> {orcamento.endereco}</p>
              )}
            </div>
          </div>

          {/* Dados do Orçamento */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#305e73]" />
              Informações do {tipoLabels[orcamento.tipo]}
            </h3>
            <div className="space-y-2">
              <p><strong>Número:</strong> #{orcamento.id}</p>
              <p><strong>Título:</strong> {orcamento.titulo}</p>
              <p><strong>Data de Emissão:</strong> {formatDate(orcamento.data)}</p>
              <p><strong>Válido até:</strong> {formatDate(orcamento.data_validade)}</p>
              <p><strong>Tipo:</strong> {tipoLabels[orcamento.tipo]}</p>
            </div>
          </div>
        </div>

        {/* Itens do Orçamento */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-[#305e73]" />
            Itens do {tipoLabels[orcamento.tipo]}
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-[#305e73] text-white">
                  <th className="border border-gray-300 px-4 py-3 text-left">Item</th>
                  <th className="border border-gray-300 px-4 py-3 text-left">Descrição</th>
                  <th className="border border-gray-300 px-4 py-3 text-center">Qtd</th>
                  <th className="border border-gray-300 px-4 py-3 text-right">Valor Unit.</th>
                  <th className="border border-gray-300 px-4 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {orcamento.itens.map((item, index) => (
                  <tr key={item.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="border border-gray-300 px-4 py-3 font-medium">
                      {item.nome}
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-600">
                      {item.descricao || '-'}
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-center">
                      {item.quantidade}
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-right">
                      {formatCurrency(item.valor)}
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-right font-medium">
                      {formatCurrency(item.valor * item.quantidade)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totais */}
          <div className="mt-6 flex justify-end">
            <div className="w-full max-w-sm">
              <div className="space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(calcularSubtotal())}</span>
                </div>
                
                {(orcamento.desconto || 0) > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Desconto ({orcamento.desconto}%):</span>
                    <span>-{formatCurrency((orcamento.desconto || 0) / 100 * calcularSubtotal())}</span>
                  </div>
                )}
                
                {(orcamento.taxa_adicional || 0) > 0 && (
                  <div className="flex justify-between text-blue-600">
                    <span>Taxa Adicional:</span>
                    <span>+{formatCurrency(orcamento.taxa_adicional || 0)}</span>
                  </div>
                )}
                
                <div className="border-t border-gray-300 pt-2">
                  <div className="flex justify-between text-xl font-bold text-[#305e73]">
                    <span>Total Geral:</span>
                    <span>{formatCurrency(orcamento.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Condições e Observações */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {orcamento.condicoes_pagamento && (
            <div>
              <h4 className="font-bold text-gray-900 mb-2">Condições de Pagamento:</h4>
              <p className="text-gray-700 text-sm leading-relaxed">
                {orcamento.condicoes_pagamento}
              </p>
            </div>
          )}

          {orcamento.prazo_entrega && (
            <div>
              <h4 className="font-bold text-gray-900 mb-2">Prazo de Entrega:</h4>
              <p className="text-gray-700 text-sm">
                {orcamento.prazo_entrega}
              </p>
            </div>
          )}
        </div>

        {orcamento.observacao && (
          <div className="mb-8">
            <h4 className="font-bold text-gray-900 mb-2">Observações:</h4>
            <p className="text-gray-700 text-sm leading-relaxed">
              {orcamento.observacao}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-gray-300 pt-6 mt-8">
          <div className="text-center text-gray-600 text-sm">
            <p>
              Este {tipoLabels[orcamento.tipo].toLowerCase()} é válido até {formatDate(orcamento.data_validade)}.
            </p>
            <p className="mt-2">
              Para dúvidas ou esclarecimentos, entre em contato conosco.
            </p>
            {empresa?.website && (
              <p className="mt-2">
                <strong>Website:</strong> {empresa.website}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
