'use client'

import { useRouter } from 'next/navigation'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useAuthContext } from '@/contexts/AuthContext'
import { useUserRole } from '@/hooks/useUserRole'
import { useFinanceiro } from '@/hooks/useFinanceiro'
import { ReportStatus, AdvanceStatus, UserRole } from '@/lib/models/types'
import { toast } from 'react-toastify'

export default function DashboardPage() {
  const router = useRouter()
  const { user, logout } = useAuthContext()
  const { role, isFinanceiro, loading: roleLoading } = useUserRole()
  const {
    reports,
    advances,
    loading: dataLoading,
    error,
  } = useFinanceiro()

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/login')
    } catch (err: any) {
      toast.error('Erro ao fazer logout')
    }
  }

  // Se não for Financeiro, redirecionar ou mostrar mensagem
  if (!roleLoading && !isFinanceiro && role !== UserRole.FINANCEIRO && role !== null) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-yellow-800 mb-2">
                Acesso Restrito
              </h2>
              <p className="text-yellow-700 mb-4">
                Esta área é exclusiva para o perfil Financeiro. Seu perfil atual: {role || 'Não definido'}
              </p>
              {!role && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-red-800">
                    ⚠️ Seu usuário não possui um perfil definido no Firestore. 
                    Verifique se existe um documento na collection <strong>users</strong> com seu email ({user?.email}) 
                    e o campo <strong>role</strong> definido.
                  </p>
                </div>
              )}
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Sair e Fazer Login com Outro Usuário
              </button>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  const analiseContabilReports = reports.filter(
    (r) => r.status === ReportStatus.ANALISE_CONTABIL
  )
  const aprovadoParaPagamentoReports = reports.filter(
    (r) => r.status === ReportStatus.APROVADO_PARA_PAGAMENTO
  )
  const pagamentoAprovadoAdvances = advances.filter(
    (a) => a.status === AdvanceStatus.PAGAMENTO_APROVADO
  )

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

  const getStatusColor = (status: ReportStatus) => {
    switch (status) {
      case ReportStatus.ANALISE_CONTABIL:
        return 'bg-purple-100 text-purple-800'
      case ReportStatus.APROVADO_PARA_PAGAMENTO:
        return 'bg-green-100 text-green-800'
      case ReportStatus.FINANCEIRO_APROVADO:
        return 'bg-purple-100 text-purple-800'
      case ReportStatus.PAGAMENTO_EFETUADO:
        return 'bg-gray-100 text-gray-800'
      case ReportStatus.REJEITADO:
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: ReportStatus) => {
    switch (status) {
      case ReportStatus.ANALISE_CONTABIL:
        return 'Análise Contábil'
      case ReportStatus.APROVADO_PARA_PAGAMENTO:
        return 'Aprovado para Pagamento'
      case ReportStatus.FINANCEIRO_APROVADO:
        return 'Financeiro Aprovado'
      case ReportStatus.PAGAMENTO_EFETUADO:
        return 'Pagamento Efetuado'
      case ReportStatus.REJEITADO:
        return 'Rejeitado'
      default:
        return status
    }
  }

  // Função para calcular subtotais por tipo de despesa
  const getExpenseTypeTotals = (expenses: any[]) => {
    const totals: { [key: string]: number } = {}
    expenses.forEach((expense) => {
      const type = expense.expenseType || 'OUTROS'
      totals[type] = (totals[type] || 0) + expense.amount
    })
    return totals
  }

  // Função para formatar nome do tipo de despesa
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

  // Função para obter iniciais do usuário
  const getUserInitials = () => {
    if (!user?.email) return 'U'
    const emailParts = user.email.split('@')[0]
    const parts = emailParts.split('.')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return emailParts.substring(0, 2).toUpperCase()
  }

  if (roleLoading || dataLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
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
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-semibold text-lg shadow-md">
                  {getUserInitials()}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Controle de Despesas - Financeiro
                  </h1>
                  <p className="text-sm text-gray-600 mt-1">
                    {user?.email} ({role})
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Sair
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Cards de Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                Relatórios em Análise
              </h3>
              <p className="text-3xl font-bold text-blue-600">
                {analiseContabilReports.length}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                {formatCurrency(
                  analiseContabilReports.reduce(
                    (sum, r) => sum + r.totalAmount,
                    0
                  )
                )}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                Aprovados para Pagamento
              </h3>
              <p className="text-3xl font-bold text-green-600">
                {aprovadoParaPagamentoReports.length}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                {formatCurrency(
                  aprovadoParaPagamentoReports.reduce(
                    (sum, r) => sum + r.totalAmount,
                    0
                  )
                )}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                Adiantamentos Pendentes
              </h3>
              <p className="text-3xl font-bold text-orange-600">
                {pagamentoAprovadoAdvances.length}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                {formatCurrency(
                  pagamentoAprovadoAdvances.reduce(
                    (sum, a) => sum + a.amount,
                    0
                  )
                )}
              </p>
            </div>
          </div>

          {/* Relatórios em Análise */}
          <div className="bg-white rounded-lg shadow-md mb-8 overflow-hidden">
            <div className="px-6 py-4 bg-gray-100 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Relatórios em Análise Contábil
              </h2>
            </div>
            <div className="divide-y pt-2">
              {analiseContabilReports.length === 0 ? (
                <div className="px-6 py-8 text-center text-gray-500">
                  Nenhum relatório em análise
                </div>
              ) : (
                analiseContabilReports.map((report) => {
                  const expenseTotals = getExpenseTypeTotals(report.expenses)
                  return (
                    <div
                      key={report.id}
                      className="px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors border-b last:border-b-0"
                      onClick={() => router.push(`/reports/${report.id}`)}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {report.name}
                          </h3>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(report.status)}`}>
                              {getStatusLabel(report.status)}
                            </span>
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-xl font-bold text-orange-600">
                            Total: {formatCurrency(report.totalAmount)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-2 space-y-1">
                        <p className="text-sm text-gray-600">
                          Criado por: {report.createdByUserName || 'N/A'} • {formatDate(report.date)}
                        </p>
                        
                        {/* Subtotais por tipo de despesa */}
                        {Object.keys(expenseTotals).length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="flex flex-wrap gap-x-4 gap-y-1">
                              {Object.entries(expenseTotals).map(([type, amount]) => (
                                <div key={type} className="text-sm">
                                  <span className="text-gray-600">{formatExpenseTypeName(type)}:</span>{' '}
                                  <span className="font-medium text-gray-900">{formatCurrency(amount)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Relatórios Aprovados para Pagamento */}
          <div className="bg-white rounded-lg shadow-md mb-8 overflow-hidden">
            <div className="px-6 py-4 bg-gray-100 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Relatórios Aprovados para Pagamento
              </h2>
            </div>
            <div className="divide-y pt-2">
              {aprovadoParaPagamentoReports.length === 0 ? (
                <div className="px-6 py-8 text-center text-gray-500">
                  Nenhum relatório aprovado para pagamento
                </div>
              ) : (
                aprovadoParaPagamentoReports.map((report) => {
                  const expenseTotals = getExpenseTypeTotals(report.expenses)
                  return (
                    <div
                      key={report.id}
                      className="px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors border-b last:border-b-0"
                      onClick={() => router.push(`/reports/${report.id}`)}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {report.name}
                          </h3>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(report.status)}`}>
                              {getStatusLabel(report.status)}
                            </span>
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-xl font-bold text-orange-600">
                            Total: {formatCurrency(report.totalAmount)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-2 space-y-1">
                        <p className="text-sm text-gray-600">
                          Criado por: {report.createdByUserName || 'N/A'} • {formatDate(report.date)}
                        </p>
                        
                        {/* Subtotais por tipo de despesa */}
                        {Object.keys(expenseTotals).length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="flex flex-wrap gap-x-4 gap-y-1">
                              {Object.entries(expenseTotals).map(([type, amount]) => (
                                <div key={type} className="text-sm">
                                  <span className="text-gray-600">{formatExpenseTypeName(type)}:</span>{' '}
                                  <span className="font-medium text-gray-900">{formatCurrency(amount)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Adiantamentos Pendentes */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 bg-gray-100 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Adiantamentos Pendentes de Pagamento
              </h2>
            </div>
            <div className="divide-y pt-2">
              {pagamentoAprovadoAdvances.length === 0 ? (
                <div className="px-6 py-8 text-center text-gray-500">
                  Nenhum adiantamento pendente
                </div>
              ) : (
                pagamentoAprovadoAdvances.map((advance) => (
                  <div
                    key={advance.id}
                    className="px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => router.push(`/advances/${advance.id}`)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900">
                          {advance.name}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Período: {formatDate(advance.workPeriodStart)} até{' '}
                          {formatDate(advance.workPeriodEnd)}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Criado por: {advance.createdByUserName || 'N/A'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-gray-900">
                          {formatCurrency(advance.amount)}
                        </p>
                        <span className="inline-block mt-1 px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded">
                          Pagamento Aprovado
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
