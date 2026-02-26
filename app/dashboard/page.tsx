'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useAuthContext } from '@/contexts/AuthContext'
import { useUserRole } from '@/hooks/useUserRole'
import { useFinanceiro } from '@/hooks/useFinanceiro'
import { useOperador } from '@/hooks/useOperador'
import { ReportStatus, AdvanceStatus, UserRole } from '@/lib/models/types'
import { toast } from 'react-toastify'

export default function DashboardPage() {
  const router = useRouter()
  const { user, logout } = useAuthContext()
  const { role, isFinanceiro, isOperador, isAdmin, loading: roleLoading } = useUserRole()

  // Estados para expandir/minimizar seções
  const [expensesExpanded, setExpensesExpanded] = useState(false)
  const [reportsExpanded, setReportsExpanded] = useState(false)
  const [advancesExpanded, setAdvancesExpanded] = useState(false)

  // Dados do Financeiro (só carrega se for Financeiro)
  const financeiroData = useFinanceiro()

  // Dados do Operador (só carrega se for Operador)
  const operadorData = useOperador()

  // Selecionar dados baseado no perfil
  // Admin vê tudo: relatórios do financeiro e despesas do operador
  const reports = (isFinanceiro || isAdmin) ? financeiroData.reports : (isOperador ? operadorData.reports : [])
  const advances = (isFinanceiro || isAdmin) ? financeiroData.advances : (isOperador ? operadorData.advances : [])
  const expenses = (isOperador || isAdmin) ? operadorData.expenses : []
  const projects = (isOperador || isAdmin) ? operadorData.projects : []
  const dataLoading = isFinanceiro ? financeiroData.loading : (isOperador || isAdmin ? operadorData.loading : false)
  const error = isFinanceiro ? financeiroData.error : (isOperador || isAdmin ? operadorData.error : null)

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/login')
    } catch (err: any) {
      toast.error('Erro ao fazer logout')
    }
  }

  // Verificar se o usuário tem um perfil válido
  if (!roleLoading && role !== UserRole.FINANCEIRO && role !== UserRole.OPERADOR && role !== UserRole.ADMINISTRADOR && role !== null) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen p-8" style={{ backgroundColor: 'rgb(222, 222, 222)' }}>
          <div className="max-w-7xl mx-auto">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-yellow-800 mb-2">
                Acesso Restrito
              </h2>
              <p className="text-yellow-700 mb-4">
                Esta área é exclusiva para os perfis Financeiro ou Operador. Seu perfil atual: {role || 'Não definido'}
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

  // Filtrar dados baseado no perfil
  const analiseContabilReports = isFinanceiro
    ? reports.filter((r) => r.status === ReportStatus.ANALISE_CONTABIL)
    : []
  const aprovadoParaPagamentoReports = isFinanceiro
    ? reports.filter((r) => r.status === ReportStatus.APROVADO_PARA_PAGAMENTO)
    : []
  const pagamentoAprovadoAdvances = isFinanceiro
    ? advances.filter((a) => a.status === AdvanceStatus.PAGAMENTO_APROVADO)
    : []
  const allAdvances = isFinanceiro
    ? advances
    : []

  // Para OPERADOR/ADMIN: mostrar todas as despesas sem relatório e todos os seus relatórios e adiantamentos
  const expensesWithoutReport = (isOperador || isAdmin) ? expenses : []
  const operadorReportsRaw = (isOperador || isAdmin) ? reports : []
  // Ordenar relatórios por status: REJEITADO sempre no topo, depois PENDENTE, depois os outros em ordem
  const operadorReports = [...operadorReportsRaw].sort((a, b) => {
    const getStatusOrder = (status: ReportStatus): number => {
      switch (status) {
        case ReportStatus.REJEITADO:
          return 0
        case ReportStatus.PENDENTE:
          return 1
        case ReportStatus.ANALISE_CONTABIL:
          return 2
        case ReportStatus.APROVADO:
          return 3
        case ReportStatus.APROVADO_PARA_PAGAMENTO:
          return 4
        case ReportStatus.FINANCEIRO_APROVADO:
          return 5
        case ReportStatus.PAGAMENTO_EFETUADO:
          return 6
        default:
          return 7
      }
    }
    return getStatusOrder(a.status) - getStatusOrder(b.status)
  })
  const operadorAdvances = (isOperador || isAdmin) ? advances : []

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
      case ReportStatus.PENDENTE:
        return 'bg-yellow-100 text-yellow-800'
      case ReportStatus.ANALISE_CONTABIL:
        return 'bg-purple-100 text-purple-800'
      case ReportStatus.APROVADO:
        return 'bg-blue-100 text-blue-800'
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
      case ReportStatus.PENDENTE:
        return 'Pendente'
      case ReportStatus.ANALISE_CONTABIL:
        return 'Análise Contábil'
      case ReportStatus.APROVADO:
        return 'Aprovado'
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

  const getAdvanceStatusColor = (status: AdvanceStatus) => {
    switch (status) {
      case AdvanceStatus.PENDENTE:
        return 'bg-yellow-100 text-yellow-800'
      case AdvanceStatus.APROVACAO:
        return 'bg-blue-100 text-blue-800'
      case AdvanceStatus.PAGAMENTO_APROVADO:
        return 'bg-orange-100 text-orange-800'
      case AdvanceStatus.ANALISE_CONTABIL:
        return 'bg-purple-100 text-purple-800'
      case AdvanceStatus.APROVADO:
        return 'bg-green-100 text-green-800'
      case AdvanceStatus.REJEITADO:
        return 'bg-red-100 text-red-800'
      case AdvanceStatus.PAGAMENTO_EFETUADO:
        return 'bg-gray-100 text-gray-800'
      case AdvanceStatus.FINALIZADO:
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getAdvanceStatusLabel = (status: AdvanceStatus) => {
    switch (status) {
      case AdvanceStatus.PENDENTE:
        return 'Pendente'
      case AdvanceStatus.APROVACAO:
        return 'Aprovação'
      case AdvanceStatus.PAGAMENTO_APROVADO:
        return 'Pagamento Aprovado'
      case AdvanceStatus.ANALISE_CONTABIL:
        return 'Análise Contábil'
      case AdvanceStatus.APROVADO:
        return 'Aprovado'
      case AdvanceStatus.REJEITADO:
        return 'Rejeitado'
      case AdvanceStatus.PAGAMENTO_EFETUADO:
        return 'Pagamento Efetuado'
      case AdvanceStatus.FINALIZADO:
        return 'Finalizado'
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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-semibold text-lg shadow-md">
                  {getUserInitials()}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Controle de Despesas
                  </h1>
                  <p className="text-sm text-gray-600 mt-1">
                    {user?.email} ({role})
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {(isOperador || isFinanceiro) && (
                  <button
                    onClick={() => router.push('/profile')}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                  >
                    Perfil
                  </button>
                )}
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Sair
                </button>
              </div>
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

          {/* Botões de Ação para FINANCEIRO */}
          {isFinanceiro && (
            <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => router.push('/projects')}
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-colors flex items-center justify-center gap-2"
              >
                <span className="text-xl">🏢</span>
                <span>Projetos</span>
              </button>
            </div>
          )}

          {/* Botões de Ação para OPERADOR / ADMIN */}
          {(isOperador || isAdmin) && (
            <div className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-4">
              {isAdmin ? (
                <>
                  <button
                    onClick={() => router.push('/reports')}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-colors flex flex-col items-center justify-center gap-1"
                  >
                    <span className="text-xl">📋</span>
                    <span className="text-sm">Fluxo Aprovação</span>
                  </button>
                  <button
                    onClick={() => router.push('/projects')}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-colors flex flex-col items-center justify-center gap-1"
                  >
                    <span className="text-xl">🏢</span>
                    <span className="text-sm">Projetos/Empresas</span>
                  </button>
                  <button
                    onClick={() => router.push('/expenses/new')}
                    className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-colors flex flex-col items-center justify-center gap-1"
                  >
                    <span className="text-xl">+</span>
                    <span className="text-sm">Nova Despesa</span>
                  </button>
                  <button
                    onClick={() => router.push('/admin/users')}
                    className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-colors flex flex-col items-center justify-center gap-1"
                  >
                    <span className="text-xl">⚙️</span>
                    <span className="text-sm">Gestão Usuários</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => router.push('/reports/new')}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-colors flex items-center justify-center gap-2"
                  >
                    <span className="text-xl">+</span>
                    <span>Novo Relatório</span>
                  </button>
                  <button
                    onClick={() => router.push('/advances/new')}
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-colors flex items-center justify-center gap-2"
                  >
                    <span className="text-xl">+</span>
                    <span>Novo Adiantamento</span>
                  </button>
                  <button
                    onClick={() => router.push('/expenses/new')}
                    className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-colors flex items-center justify-center gap-2"
                  >
                    <span className="text-xl">+</span>
                    <span>Nova Despesa</span>
                  </button>
                  <button
                    onClick={() => router.push('/projects')}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-colors flex items-center justify-center gap-2"
                  >
                    <span className="text-xl">📁</span>
                    <span>Projetos</span>
                  </button>
                </>
              )}
            </div>
          )}

          {/* Cards de Resumo para FINANCEIRO / ADMIN */}
          {(isFinanceiro || isAdmin) && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6 hover:bg-gray-200 transition-colors cursor-default">
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

              <div className="bg-white rounded-lg shadow-md p-6 hover:bg-gray-200 transition-colors cursor-default">
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

              <div className="bg-white rounded-lg shadow-md p-6 hover:bg-gray-200 transition-colors cursor-default">
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
          )}

          {/* Cards de Resumo para OPERADOR / ADMIN */}
          {(isOperador || isAdmin) && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6 hover:bg-gray-200 transition-colors cursor-default">
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Despesas sem Relatório
                </h3>
                <p className="text-3xl font-bold text-orange-600">
                  {expensesWithoutReport.length}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  {formatCurrency(
                    expensesWithoutReport.reduce(
                      (sum, e) => sum + e.amount,
                      0
                    )
                  )}
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 hover:bg-gray-200 transition-colors cursor-default">
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Meus Relatórios
                </h3>
                <p className="text-3xl font-bold text-blue-600">
                  {operadorReports.length}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  {formatCurrency(
                    operadorReports.reduce(
                      (sum, r) => sum + r.totalAmount,
                      0
                    )
                  )}
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 hover:bg-gray-200 transition-colors cursor-default">
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Meus Adiantamentos
                </h3>
                <p className="text-3xl font-bold text-green-600">
                  {operadorAdvances.length}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  {formatCurrency(
                    operadorAdvances.reduce(
                      (sum, a) => sum + a.amount,
                      0
                    )
                  )}
                </p>
              </div>
            </div>
          )}

          {/* Despesas sem Relatório (OPERADOR / ADMIN) */}
          {(isOperador || isAdmin) && (
            <div className="mb-8">
              <div className="bg-white rounded-lg shadow-md mb-6 overflow-hidden">
                <div
                  className="px-6 py-4 cursor-pointer hover:opacity-90 transition-opacity flex items-center justify-between"
                  style={{ backgroundColor: 'rgb(0, 90, 90)' }}
                  onClick={() => setExpensesExpanded(!expensesExpanded)}
                >
                  <h2 className="text-xl font-semibold text-white">
                    Despesas sem Relatório ({expensesWithoutReport.length})
                  </h2>
                  {expensesWithoutReport.length > 0 && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-white transition-transform"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      {expensesExpanded ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      )}
                    </svg>
                  )}
                </div>
              </div>
              {expensesExpanded && (
                <>
                  {expensesWithoutReport.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
                      Nenhuma despesa sem relatório
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {expensesWithoutReport.map((expense) => (
                        <div
                          key={expense.id}
                          className="bg-white rounded-lg shadow-md p-6 hover:bg-gray-200 transition-colors cursor-pointer"
                          onClick={() => router.push(`/expenses/${expense.id}`)}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                {formatExpenseTypeName(expense.expenseType)}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {formatDate(expense.date)} • {expense.projectName || 'Sem projeto'}
                              </p>
                              {expense.observations && (
                                <p className="text-sm text-gray-500 mt-1">
                                  {expense.observations}
                                </p>
                              )}
                            </div>
                            <div className="text-right ml-4">
                              <p className="text-xl font-bold text-orange-600">
                                {formatCurrency(expense.amount)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Relatórios em Análise (FINANCEIRO) */}
          {isFinanceiro && analiseContabilReports.length > 0 && (
            <div className="bg-white rounded-lg shadow-md mb-8 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200" style={{ backgroundColor: 'rgb(0, 90, 90)' }}>
                <h2 className="text-xl font-semibold text-white">
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
                        className="px-6 py-4 hover:bg-gray-200 cursor-pointer transition-colors border-b last:border-b-0"
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
                              <div className="flex flex-col gap-y-1">
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
          )}

          {/* Meus Relatórios (OPERADOR / ADMIN) */}
          {(isOperador || isAdmin) && (
            <div className="mb-8">
              <div className="bg-white rounded-lg shadow-md mb-6 overflow-hidden">
                <div
                  className="px-6 py-4 cursor-pointer hover:opacity-90 transition-opacity flex items-center justify-between"
                  style={{ backgroundColor: 'rgb(0, 90, 90)' }}
                  onClick={() => setReportsExpanded(!reportsExpanded)}
                >
                  <h2 className="text-xl font-semibold text-white">
                    Meus Relatórios ({operadorReports.length})
                  </h2>
                  {operadorReports.length > 0 && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-white transition-transform"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      {reportsExpanded ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      )}
                    </svg>
                  )}
                </div>
              </div>
              {reportsExpanded && (
                <>
                  {operadorReports.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
                      Nenhum relatório criado
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {operadorReports.map((report) => {
                        const expenseTotals = getExpenseTypeTotals(report.expenses)
                        return (
                          <div
                            key={report.id}
                            className="bg-white rounded-lg shadow-md p-6 hover:bg-gray-200 transition-colors cursor-pointer"
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
                                {formatDate(report.date)} • {report.projectName || 'Sem projeto'}
                              </p>

                              {/* Subtotais por tipo de despesa */}
                              {Object.keys(expenseTotals).length > 0 && (
                                <div className="mt-3 pt-3 border-t border-gray-200">
                                  <div className="flex flex-col gap-y-1">
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
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Relatórios Aprovados para Pagamento (FINANCEIRO) */}
          {isFinanceiro && aprovadoParaPagamentoReports.length > 0 && (
            <div className="bg-white rounded-lg shadow-md mb-8 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200" style={{ backgroundColor: 'rgb(0, 90, 90)' }}>
                <h2 className="text-xl font-semibold text-white">
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
                        className="px-6 py-4 hover:bg-gray-200 cursor-pointer transition-colors border-b last:border-b-0"
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
                              <div className="flex flex-col gap-y-1">
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
          )}

          {/* Adiantamentos (FINANCEIRO) */}
          {isFinanceiro && (
            <div className="bg-white rounded-lg shadow-md mb-8 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200" style={{ backgroundColor: 'rgb(0, 90, 90)' }}>
                <h2 className="text-xl font-semibold text-white">
                  Adiantamentos
                </h2>
              </div>
              <div className="divide-y pt-2">
                {allAdvances.length === 0 ? (
                  <div className="px-6 py-8 text-center text-gray-500">
                    Nenhum adiantamento encontrado
                  </div>
                ) : (
                  allAdvances.map((advance) => (
                    <div
                      key={advance.id}
                      className="px-6 py-4 hover:bg-gray-200 cursor-pointer transition-colors border-b last:border-b-0"
                      onClick={() => router.push(`/advances/${advance.id}`)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {advance.name}
                          </h3>
                          <div className="flex items-center gap-2 flex-wrap mb-2">
                            <span className={`px-2 py-1 text-xs font-medium rounded ${getAdvanceStatusColor(advance.status)}`}>
                              {getAdvanceStatusLabel(advance.status)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            Período: {formatDate(advance.workPeriodStart)} até {formatDate(advance.workPeriodEnd)}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            Criado por: {advance.createdByUserName || 'N/A'}
                            {advance.reportName && ` • Relatório: ${advance.reportName}`}
                          </p>
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-xl font-bold text-green-600">
                            {formatCurrency(advance.amount)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Meus Adiantamentos (OPERADOR / ADMIN) */}
          {(isOperador || isAdmin) && (
            <div className="mb-8">
              <div className="bg-white rounded-lg shadow-md mb-6 overflow-hidden">
                <div
                  className="px-6 py-4 cursor-pointer hover:opacity-90 transition-opacity flex items-center justify-between"
                  style={{ backgroundColor: 'rgb(0, 90, 90)' }}
                  onClick={() => setAdvancesExpanded(!advancesExpanded)}
                >
                  <h2 className="text-xl font-semibold text-white">
                    Meus Adiantamentos ({operadorAdvances.length})
                  </h2>
                  {operadorAdvances.length > 0 && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-white transition-transform"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      {advancesExpanded ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      )}
                    </svg>
                  )}
                </div>
              </div>
              {advancesExpanded && (
                <>
                  {operadorAdvances.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
                      Nenhum adiantamento criado
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {operadorAdvances.map((advance) => (
                        <div
                          key={advance.id}
                          className="bg-white rounded-lg shadow-md p-6 hover:bg-gray-200 transition-colors cursor-pointer"
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
                                {advance.projectId ? (projects.find(p => p.id === advance.projectId)?.name || 'Sem projeto') : 'Sem projeto'}
                              </p>
                            </div>
                            <div className="text-right ml-4">
                              <p className="text-lg font-semibold text-gray-900">
                                {formatCurrency(advance.amount)}
                              </p>
                              <span className={`inline-block mt-1 px-2 py-1 text-xs font-medium rounded ${getAdvanceStatusColor(advance.status)}`}>
                                {getAdvanceStatusLabel(advance.status)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Adiantamentos Pendentes (FINANCEIRO) */}
          {isFinanceiro && pagamentoAprovadoAdvances.length > 0 && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200" style={{ backgroundColor: 'rgb(0, 90, 90)' }}>
                <h2 className="text-xl font-semibold text-white">
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
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}
