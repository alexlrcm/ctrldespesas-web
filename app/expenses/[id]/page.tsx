'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useAuthContext } from '@/contexts/AuthContext'
import { useUserRole } from '@/hooks/useUserRole'
import { useOperador } from '@/hooks/useOperador'
import { ExpenseType, PaymentMethod, UserRole } from '@/lib/models/types'
import { toast } from 'react-toastify'

export default function EditExpensePage() {
  const router = useRouter()
  const params = useParams()
  const expenseId = params.id as string
  const { user } = useAuthContext()
  const { role, isOperador, loading: roleLoading } = useUserRole()
  const { projects, reports, loadExpenseDetails, updateExpenseData, deleteExpenseData, loading: operadorLoading } = useOperador()

  const [expense, setExpense] = useState<any>(null)
  const [amount, setAmount] = useState('')
  const [expenseType, setExpenseType] = useState<ExpenseType | ''>('')
  const [date, setDate] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | ''>('')
  const [reimbursable, setReimbursable] = useState(true)
  const [projectId, setProjectId] = useState<string>('')
  const [reportId, setReportId] = useState<string>('')
  const [observations, setObservations] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [loading, setLoading] = useState(true)

  // Verificar acesso
  useEffect(() => {
    if (!roleLoading && !isOperador && role !== UserRole.OPERADOR) {
      router.push('/dashboard')
    }
  }, [role, isOperador, roleLoading, router])

  // Carregar despesa
  useEffect(() => {
    const loadExpense = async () => {
      if (!expenseId) return

      try {
        setLoading(true)
        const expenseData = await loadExpenseDetails(expenseId)
        
        if (!expenseData) {
          toast.error('Despesa não encontrada')
          router.push('/dashboard')
          return
        }

        setExpense(expenseData)
        setAmount(expenseData.amount.toString().replace('.', ','))
        setExpenseType(expenseData.expenseType)
        setDate(expenseData.date)
        setPaymentMethod(expenseData.paymentMethod)
        setReimbursable(expenseData.reimbursable)
        setProjectId(expenseData.projectId || '')
        setReportId(expenseData.reportId || '')
        setObservations(expenseData.observations || '')
      } catch (error: any) {
        console.error('Erro ao carregar despesa:', error)
        toast.error('Erro ao carregar despesa')
        router.push('/dashboard')
      } finally {
        setLoading(false)
      }
    }

    loadExpense()
  }, [expenseId, loadExpenseDetails, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!expenseType || !date || !paymentMethod || !amount) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    try {
      setSaving(true)

      const project = projects.find(p => p.id === projectId)
      const report = reports.find(r => r.id === reportId)

      const expenseData = {
        amount: parseFloat(amount.replace(',', '.')),
        expenseType: expenseType as ExpenseType,
        date: date,
        paymentMethod: paymentMethod as PaymentMethod,
        reimbursable,
        projectId: projectId || null,
        projectName: project?.name || null,
        reportId: reportId || null,
        reportName: report?.name || null,
        observations: observations.trim(),
      }

      await updateExpenseData(expenseId, expenseData)
      toast.success('Despesa atualizada com sucesso!')
      router.push('/dashboard')
    } catch (error: any) {
      console.error('Erro ao atualizar despesa:', error)
      toast.error(error.message || 'Erro ao atualizar despesa')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir esta despesa?')) {
      return
    }

    try {
      setDeleting(true)
      await deleteExpenseData(expenseId)
      toast.success('Despesa excluída com sucesso!')
      router.push('/dashboard')
    } catch (error: any) {
      console.error('Erro ao excluir despesa:', error)
      toast.error(error.message || 'Erro ao excluir despesa')
    } finally {
      setDeleting(false)
    }
  }

  const formatCurrency = (value: string) => {
    const numericValue = value.replace(/[^\d,.-]/g, '')
    return numericValue
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setAmount(formatCurrency(value))
  }

  if (roleLoading || operadorLoading || loading) {
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

  if (!expense) {
    return null
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
                Editar Despesa
              </h1>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
            <div className="space-y-6">
              {/* ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ID
                </label>
                <input
                  type="text"
                  value={expense.id}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-500 cursor-not-allowed"
                />
              </div>

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

              {/* Projeto */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Projeto
                </label>
                <select
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                >
                  <option value="">Selecione um projeto...</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name} - {project.companyName}
                    </option>
                  ))}
                </select>
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

              {/* Botões */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleting ? 'Excluindo...' : 'Excluir'}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  )
}
