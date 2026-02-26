'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useAuthContext } from '@/contexts/AuthContext'
import { useUserRole } from '@/hooks/useUserRole'
import { useOperador } from '@/hooks/useOperador'
import { ExpenseType, PaymentMethod, UserRole } from '@/lib/models/types'
import { toast } from 'react-toastify'
import { uploadFile, updateExpense } from '@/lib/services/firestore'

export default function NewExpensePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuthContext()
  const { role, isOperador, loading: roleLoading } = useUserRole()
  const { reports, createNewExpense, loading: operadorLoading } = useOperador()

  const [amount, setAmount] = useState('')
  const [expenseType, setExpenseType] = useState<ExpenseType | ''>('')
  const [date, setDate] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | ''>('')
  const [reimbursable, setReimbursable] = useState(true)
  const [reportId, setReportId] = useState<string>('')
  const [observations, setObservations] = useState('')
  const [attachments, setAttachments] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  // Preencher reportId a partir do query parameter
  useEffect(() => {
    const reportIdParam = searchParams.get('reportId')
    if (reportIdParam) {
      setReportId(reportIdParam)
    }
  }, [searchParams])

  // Verificar acesso
  useEffect(() => {
    if (!roleLoading && !isOperador && role !== UserRole.OPERADOR) {
      router.push('/dashboard')
    }
  }, [role, isOperador, roleLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!expenseType || !date || !paymentMethod || !amount) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    if (!user?.uid) {
      toast.error('Usuário não autenticado')
      return
    }

    try {
      setSaving(true)
      setUploading(true)

      const report = reports.find(r => r.id === reportId)

      // Criar despesa primeiro para obter o ID
      const expenseData = {
        amount: parseFloat(amount.replace(',', '.')),
        expenseType: expenseType as ExpenseType,
        date: date,
        paymentMethod: paymentMethod as PaymentMethod,
        reimbursable,
        projectId: null,
        projectName: null,
        reportId: reportId || null,
        reportName: report?.name || null,
        observations: observations.trim(),
        attachments: [],
        createdByUserId: user.uid,
        createdByUserName: user.email || null,
        createdAtDateTime: new Date().toISOString(),
      }

      const expenseId = await createNewExpense(expenseData)

      // Fazer upload dos arquivos
      const uploadedUrls: string[] = []
      if (attachments.length > 0 && expenseId) {
        for (const file of attachments) {
          try {
            const url = await uploadFile(file, expenseId)
            uploadedUrls.push(url)
          } catch (error: any) {
            console.error('Erro ao fazer upload do arquivo:', error)
            toast.warning(`Erro ao fazer upload de ${file.name}`)
          }
        }

        // Atualizar despesa com URLs dos arquivos
        if (uploadedUrls.length > 0) {
          await updateExpense(expenseId, {
            attachments: uploadedUrls,
          })
        }
      }

      toast.success('Despesa criada com sucesso!')
      router.push('/dashboard')
    } catch (error: any) {
      console.error('Erro ao criar despesa:', error)
      toast.error(error.message || 'Erro ao criar despesa')
    } finally {
      setSaving(false)
      setUploading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files)
      setAttachments(prev => [...prev, ...filesArray])
    }
  }

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  const formatCurrency = (value: string) => {
    // Remove tudo exceto números e vírgula/ponto
    const numericValue = value.replace(/[^\d,.-]/g, '')
    return numericValue
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setAmount(formatCurrency(value))
  }

  if (roleLoading || operadorLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'rgb(222, 222, 222)' }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando...</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen" style={{ backgroundColor: 'rgb(222, 222, 222)' }}>
        {/* Header */}
        <div className="bg-white shadow-sm border-b sticky top-0 z-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="text-gray-600 hover:text-gray-900"
              >
                ← Voltar
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                Nova Despesa
              </h1>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
            <div className="space-y-6">
              {/* Tipo de Despesa */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Despesa <span className="text-red-500">*</span>
                </label>
                <select
                  value={expenseType}
                  onChange={(e) => setExpenseType(e.target.value as ExpenseType)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                  required
                >
                  <option value="">Selecione...</option>
                  <option value={ExpenseType.ALIMENTACAO}>Alimentação</option>
                  <option value={ExpenseType.TRANSPORTE}>Transporte</option>
                  <option value={ExpenseType.ESTACIONAMENTO}>Estacionamento</option>
                  <option value={ExpenseType.HOSPEDAGEM}>Hospedagem</option>
                  <option value={ExpenseType.PASSAGEM_AEREA}>Passagem Aérea</option>
                  <option value={ExpenseType.OUTROS}>Outros</option>
                </select>
              </div>

              {/* Valor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valor (R$) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={amount}
                  onChange={handleAmountChange}
                  placeholder="0,00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                  required
                />
              </div>

              {/* Data */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                  required
                />
              </div>

              {/* Método de Pagamento */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Método de Pagamento <span className="text-red-500">*</span>
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                  required
                >
                  <option value="">Selecione...</option>
                  <option value={PaymentMethod.CARTAO_CORPORATIVO}>Cartão Corporativo</option>
                  <option value={PaymentMethod.CARTAO_PESSOAL}>Cartão Pessoal</option>
                  <option value={PaymentMethod.DINHEIRO}>Dinheiro</option>
                  <option value={PaymentMethod.PIX}>PIX</option>
                </select>
              </div>

              {/* Reembolsável */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="reimbursable"
                  checked={reimbursable}
                  onChange={(e) => setReimbursable(e.target.checked)}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="reimbursable" className="ml-2 block text-sm text-gray-700">
                  Reembolsável
                </label>
              </div>

              {/* Relatório */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Relatório
                </label>
                <select
                  value={reportId}
                  onChange={(e) => setReportId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                >
                  <option value="">Selecione um relatório...</option>
                  {reports.map((report) => (
                    <option key={report.id} value={report.id}>
                      {report.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Observações */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observações
                </label>
                <textarea
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                  placeholder="Digite observações sobre a despesa..."
                />
              </div>

              {/* Anexos */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Anexar Comprovantes
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                />
                {attachments.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {attachments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span className="text-sm text-gray-700">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeAttachment(index)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Remover
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Você pode anexar imagens (JPG, PNG) ou PDFs
                </p>
              </div>

              {/* Botões */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Enviando arquivos...' : saving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  )
}
