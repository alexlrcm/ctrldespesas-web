'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useAuthContext } from '@/contexts/AuthContext'
import { useUserRole } from '@/hooks/useUserRole'
import { useOperador } from '@/hooks/useOperador'
import { ReportStatus, UserRole } from '@/lib/models/types'
import { toast } from 'react-toastify'

export default function NewReportPage() {
  const router = useRouter()
  const { user } = useAuthContext()
  const { role, isOperador, loading: roleLoading } = useUserRole()
  const { projects, advances, expenses, createNewReport, loading: operadorLoading } = useOperador()

  const [name, setName] = useState('')
  const [date, setDate] = useState('')
  const [projectId, setProjectId] = useState<string>('')
  const [advanceId, setAdvanceId] = useState<string>('')
  const [observations, setObservations] = useState('')
  const [selectedExpenses, setSelectedExpenses] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  // Verificar acesso
  useEffect(() => {
    if (!roleLoading && !isOperador && role !== UserRole.OPERADOR) {
      router.push('/dashboard')
    }
  }, [role, isOperador, roleLoading, router])

  // Filtrar despesas sem relatório
  const availableExpenses = expenses.filter(e => !e.reportId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !date) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    if (!user?.uid) {
      toast.error('Usuário não autenticado')
      return
    }

    try {
      setSaving(true)

      const project = projects.find(p => p.id === projectId)
      const advance = advances.find(a => a.id === advanceId)

      // Calcular total das despesas selecionadas
      const selectedExpensesData = availableExpenses.filter(e => selectedExpenses.includes(e.id))
      const totalAmount = selectedExpensesData.reduce((sum, e) => sum + e.amount, 0)

      const reportData = {
        name: name.trim(),
        date: date,
        projectId: projectId || null,
        projectName: project?.name || null,
        advanceId: advanceId || null,
        advanceName: advance?.name || null,
        observations: observations.trim(),
        status: ReportStatus.PENDENTE,
        totalAmount,
        expenses: [],
        createdByUserId: user.uid,
        createdByUserName: user.email || null,
        approverObservations: '',
        approvalObservations: '',
        statusHistory: [],
        createdAtDateTime: new Date().toISOString(),
      }

      const reportId = await createNewReport(reportData)
      
      // Atualizar despesas selecionadas para associá-las ao relatório
      // Isso será feito em uma próxima etapa quando implementarmos a atualização de despesas em lote
      
      toast.success('Relatório criado com sucesso!')
      router.push(`/reports/${reportId}`)
    } catch (error: any) {
      console.error('Erro ao criar relatório:', error)
      toast.error(error.message || 'Erro ao criar relatório')
    } finally {
      setSaving(false)
    }
  }

  const toggleExpense = (expenseId: string) => {
    setSelectedExpenses(prev =>
      prev.includes(expenseId)
        ? prev.filter(id => id !== expenseId)
        : [...prev, expenseId]
    )
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).format(date)
    } catch {
      return dateString
    }
  }

  const formatExpenseTypeName = (type: string) => {
    const typeMap: { [key: string]: string } = {
      'ALIMENTACAO': 'Alimentação',
      'TRANSPORTE': 'Transporte',
      'ESTACIONAMENTO': 'Estacionamento',
      'HOSPEDAGEM': 'Hospedagem',
      'PASSAGEM_AEREA': 'Passagem Aérea',
      'OUTROS': 'Outros',
    }
    return typeMap[type] || type
  }

  const selectedTotal = availableExpenses
    .filter(e => selectedExpenses.includes(e.id))
    .reduce((sum, e) => sum + e.amount, 0)

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
                Novo Relatório
              </h1>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
            <div className="space-y-6">
              {/* Nome do Relatório */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Relatório <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Relatório de Viagem - Janeiro 2024"
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

              {/* Adiantamento */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adiantamento
                </label>
                <select
                  value={advanceId}
                  onChange={(e) => setAdvanceId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                >
                  <option value="">Selecione um adiantamento...</option>
                  {advances.map((advance) => (
                    <option key={advance.id} value={advance.id}>
                      {advance.name} - {formatCurrency(advance.amount)}
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
                  placeholder="Digite observações sobre o relatório..."
                />
              </div>

              {/* Despesas Disponíveis */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Despesas sem Relatório ({availableExpenses.length})
                </label>
                {availableExpenses.length === 0 ? (
                  <p className="text-sm text-gray-500 py-4">
                    Nenhuma despesa disponível. Crie despesas primeiro.
                  </p>
                ) : (
                  <div className="border border-gray-300 rounded-md max-h-64 overflow-y-auto">
                    {availableExpenses.map((expense) => (
                      <div
                        key={expense.id}
                        className="flex items-center p-3 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer"
                        onClick={() => toggleExpense(expense.id)}
                      >
                        <input
                          type="checkbox"
                          checked={selectedExpenses.includes(expense.id)}
                          onChange={() => toggleExpense(expense.id)}
                          className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                        />
                        <div className="ml-3 flex-1">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-900">
                              {formatExpenseTypeName(expense.expenseType)}
                            </span>
                            <span className="text-sm font-semibold text-gray-900">
                              {formatCurrency(expense.amount)}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">
                            {formatDate(expense.date)} • {expense.projectName || 'Sem projeto'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {selectedExpenses.length > 0 && (
                  <div className="mt-2 p-3 bg-blue-50 rounded-md">
                    <p className="text-sm font-medium text-blue-900">
                      Total selecionado: {formatCurrency(selectedTotal)}
                    </p>
                  </div>
                )}
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
