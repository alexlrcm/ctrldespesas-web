'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useAuthContext } from '@/contexts/AuthContext'
import { useFinanceiro } from '@/hooks/useFinanceiro'
import { ExpenseReport, ReportStatus, Expense, PaymentMethod, Advance, UserProfile, AccountType, AdvanceReason, AdvanceStatus } from '@/lib/models/types'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { getUserProfile } from '@/lib/services/firestore'
import { toast } from 'react-toastify'

export const dynamicParams = true

export default function ReportDetailPage() {
  const router = useRouter()
  const params = useParams()
  const reportId = params?.id as string
  const { user } = useAuthContext()
  const { loadReportDetails, approveReport, rejectReport, confirmPayment, rejectPayment, loadCreatorProfile } = useFinanceiro()

  const [report, setReport] = useState<ExpenseReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState(0) // 0: Despesas, 1: Adiantamentos, 2: Detalhes+Histórico, 3: Perfil
  const [showApproveDialog, setShowApproveDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [observations, setObservations] = useState('')
  const [sendingEmail, setSendingEmail] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null)
  const [showReceiptModal, setShowReceiptModal] = useState(false)
  const [showExpenseDetailsModal, setShowExpenseDetailsModal] = useState(false)
  const [advance, setAdvance] = useState<Advance | null>(null)
  const [creatorProfile, setCreatorProfile] = useState<UserProfile | null>(null)
  const [loadingAdvance, setLoadingAdvance] = useState(false)
  const [loadingProfile, setLoadingProfile] = useState(false)

  useEffect(() => {
    if (!reportId) return

    let cancelled = false

    const loadReport = async () => {
      try {
        setLoading(true)
        const reportData = await loadReportDetails(reportId)
        if (!cancelled) {
          setReport(reportData)
          
          // Carregar adiantamento se houver
          if (reportData?.advanceId) {
            setLoadingAdvance(true)
            try {
              const advanceDoc = await getDoc(doc(db, 'advances', reportData.advanceId))
              if (advanceDoc.exists()) {
                const data = advanceDoc.data()
                setAdvance({
                  id: advanceDoc.id,
                  name: data.name || '',
                  amount: data.amount || 0,
                  workPeriodStart: data.workPeriodStart || '',
                  workPeriodEnd: data.workPeriodEnd || '',
                  reason: data.reason,
                  projectId: data.projectId || null,
                  reportId: data.reportId || null,
                  reportName: data.reportName || null,
                  observations: data.observations || '',
                  createdByUserId: data.createdByUserId || null,
                  createdByUserName: data.createdByUserName || null,
                  createdAtDateTime: data.createdAtDateTime || null,
                  status: data.status as AdvanceStatus,
                  statusHistory: data.statusHistory || [],
                })
              }
            } catch (err: any) {
              console.error('Erro ao carregar adiantamento:', err)
            } finally {
              setLoadingAdvance(false)
            }
          }

          // Carregar perfil do criador
          if (reportData?.createdByUserId) {
            setLoadingProfile(true)
            try {
              const profile = await getUserProfile(reportData.createdByUserId)
              if (!cancelled) {
                setCreatorProfile(profile)
              }
            } catch (err: any) {
              console.error('Erro ao carregar perfil do criador:', err)
            } finally {
              setLoadingProfile(false)
            }
          }
        }
      } catch (error: any) {
        if (!cancelled) {
          toast.error('Erro ao carregar relatório: ' + error.message)
          router.push('/dashboard')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadReport()

    return () => {
      cancelled = true
    }
  }, [reportId, loadReportDetails, router])

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

  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date)
    } catch {
      return dateString
    }
  }

  const getStatusColor = (status: ReportStatus) => {
    switch (status) {
      case ReportStatus.ANALISE_CONTABIL:
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

  const getPaymentMethodLabel = (method: PaymentMethod) => {
    switch (method) {
      case PaymentMethod.CARTAO_CORPORATIVO:
        return 'Cartão Corporativo'
      case PaymentMethod.CARTAO_PESSOAL:
        return 'Cartão Pessoal'
      case PaymentMethod.DINHEIRO:
        return 'Dinheiro'
      case PaymentMethod.PIX:
        return 'PIX'
      default:
        return method
    }
  }

  const getAdvanceReasonLabel = (reason: AdvanceReason) => {
    switch (reason) {
      case AdvanceReason.VIAGEM:
        return 'Viagem'
      case AdvanceReason.COMPRA_MATERIAL:
        return 'Compra de Material'
      case AdvanceReason.SERVICO_TERCEIRO:
        return 'Serviço de Terceiro'
      case AdvanceReason.OUTROS:
        return 'Outros'
      default:
        return reason
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

  const getAdvanceStatusColor = (status: AdvanceStatus) => {
    switch (status) {
      case AdvanceStatus.PAGAMENTO_APROVADO:
        return 'bg-orange-100 text-orange-800'
      case AdvanceStatus.APROVADO:
        return 'bg-green-100 text-green-800'
      case AdvanceStatus.REJEITADO:
        return 'bg-red-100 text-red-800'
      case AdvanceStatus.PAGAMENTO_EFETUADO:
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-blue-100 text-blue-800'
    }
  }

  const getAccountTypeLabel = (type: AccountType) => {
    switch (type) {
      case AccountType.CC:
        return 'Conta Corrente'
      case AccountType.CP:
        return 'Conta Poupança'
      default:
        return type
    }
  }

  const handleViewReceipts = (expense: Expense) => {
    setSelectedExpense(expense)
    setShowReceiptModal(true)
  }

  const handleViewDetails = (expense: Expense) => {
    setSelectedExpense(expense)
    setShowExpenseDetailsModal(true)
  }

  const handleApprove = async () => {
    if (!report) return

    try {
      await approveReport(report.id, observations, sendingEmail)
      toast.success('Relatório aprovado com sucesso!')
      router.push('/dashboard')
    } catch (error: any) {
      toast.error('Erro ao aprovar relatório: ' + error.message)
    }
  }

  const handleReject = async () => {
    if (!report) return

    try {
      await rejectReport(report.id, observations, sendingEmail)
      toast.success('Relatório rejeitado')
      router.push('/dashboard')
    } catch (error: any) {
      toast.error('Erro ao rejeitar relatório: ' + error.message)
    }
  }

  const handleConfirmPayment = async () => {
    if (!report) return

    try {
      await confirmPayment(report.id, observations, sendingEmail)
      toast.success('Pagamento confirmado!')
      router.push('/dashboard')
    } catch (error: any) {
      toast.error('Erro ao confirmar pagamento: ' + error.message)
    }
  }

  const handleRejectPayment = async () => {
    if (!report) return

    try {
      await rejectPayment(report.id, observations, sendingEmail)
      toast.success('Pagamento rejeitado')
      router.push('/dashboard')
    } catch (error: any) {
      toast.error('Erro ao rejeitar pagamento: ' + error.message)
    }
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando relatório...</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (!report) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <p className="text-gray-600">Relatório não encontrado</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
            >
              Voltar ao Dashboard
            </button>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  const canApprove = report.status === ReportStatus.ANALISE_CONTABIL
  const canReject = report.status === ReportStatus.ANALISE_CONTABIL
  const canConfirmPayment = report.status === ReportStatus.APROVADO_PARA_PAGAMENTO
  const canRejectPayment = report.status === ReportStatus.APROVADO_PARA_PAGAMENTO

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <div>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="text-primary hover:text-primary-dark mb-2"
                >
                  ← Voltar
                </button>
                <h1 className="text-2xl font-bold text-gray-900">{report.name}</h1>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(report.status)}`}>
                    {getStatusLabel(report.status)}
                  </span>
                  <span className="text-sm text-gray-600">
                    {formatDate(report.date)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-md mb-6">
            <div className="border-b">
              <nav className="flex -mb-px">
                <button
                  onClick={() => setActiveTab(0)}
                  className={`px-6 py-3 text-sm font-medium ${
                    activeTab === 0
                      ? 'border-b-2 border-primary text-primary'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Despesas ({report.expenses.length})
                </button>
                <button
                  onClick={() => setActiveTab(1)}
                  className={`px-6 py-3 text-sm font-medium ${
                    activeTab === 1
                      ? 'border-b-2 border-primary text-primary'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Adiantamentos
                </button>
                <button
                  onClick={() => setActiveTab(2)}
                  className={`px-6 py-3 text-sm font-medium ${
                    activeTab === 2
                      ? 'border-b-2 border-primary text-primary'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Histórico
                </button>
                <button
                  onClick={() => setActiveTab(3)}
                  className={`px-6 py-3 text-sm font-medium ${
                    activeTab === 3
                      ? 'border-b-2 border-primary text-primary'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Perfil
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {/* Aba Despesas */}
              {activeTab === 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Despesas ({report.expenses.length})
                  </h3>
                  {report.expenses.length === 0 ? (
                    <p className="text-gray-500">Nenhuma despesa encontrada</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Tipo
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Data
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Valor
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Observações
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Ações
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {report.expenses.map((expense) => (
                            <tr key={expense.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {expense.expenseType}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatDate(expense.date)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {formatCurrency(expense.amount)}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500">
                                <div className="max-w-xs truncate" title={expense.observations || '-'}>
                                  {expense.observations || '-'}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleViewDetails(expense)}
                                    className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-xs"
                                  >
                                    Detalhes
                                  </button>
                                  {(expense.receiptImageUri || expense.receiptPdfUri || (expense.attachments && expense.attachments.length > 0)) && (
                                    <button
                                      onClick={() => handleViewReceipts(expense)}
                                      className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-xs"
                                    >
                                      Comprovantes
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Aba Adiantamentos */}
              {activeTab === 1 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Adiantamentos
                  </h3>
                  {loadingAdvance ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                      <p className="mt-4 text-gray-600">Carregando adiantamento...</p>
                    </div>
                  ) : advance ? (
                    <div className="space-y-6">
                      <div className="bg-gray-50 rounded-lg p-6">
                        <h4 className="text-md font-semibold text-gray-900 mb-4">
                          Informações do Adiantamento
                        </h4>
                        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Nome</dt>
                            <dd className="mt-1 text-sm text-gray-900">{advance.name}</dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Valor</dt>
                            <dd className="mt-1 text-sm font-semibold text-gray-900">{formatCurrency(advance.amount)}</dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Motivo</dt>
                            <dd className="mt-1 text-sm text-gray-900">{getAdvanceReasonLabel(advance.reason)}</dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Status</dt>
                            <dd className="mt-1">
                              <span className={`px-2 py-1 text-xs font-medium rounded ${getAdvanceStatusColor(advance.status)}`}>
                                {getAdvanceStatusLabel(advance.status)}
                              </span>
                            </dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Período de Trabalho - Início</dt>
                            <dd className="mt-1 text-sm text-gray-900">{formatDate(advance.workPeriodStart)}</dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Período de Trabalho - Fim</dt>
                            <dd className="mt-1 text-sm text-gray-900">{formatDate(advance.workPeriodEnd)}</dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Criado por</dt>
                            <dd className="mt-1 text-sm text-gray-900">{advance.createdByUserName || 'N/A'}</dd>
                          </div>
                          {advance.createdAtDateTime && (
                            <div>
                              <dt className="text-sm font-medium text-gray-500">Data de Criação</dt>
                              <dd className="mt-1 text-sm text-gray-900">{formatDateTime(advance.createdAtDateTime)}</dd>
                            </div>
                          )}
                        </dl>
                        {advance.observations && (
                          <div className="mt-4">
                            <dt className="text-sm font-medium text-gray-500 mb-2">Observações</dt>
                            <dd className="text-sm text-gray-900 whitespace-pre-wrap bg-white p-3 rounded-md">
                              {advance.observations}
                            </dd>
                          </div>
                        )}
                      </div>

                      {advance.statusHistory && advance.statusHistory.length > 0 && (
                        <div className="bg-gray-50 rounded-lg p-6">
                          <h4 className="text-md font-semibold text-gray-900 mb-4">
                            Histórico do Adiantamento
                          </h4>
                          <div className="space-y-4">
                            {advance.statusHistory.map((entry, index) => (
                              <div key={index} className="border-l-4 border-primary pl-4 py-2">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">
                                      {getAdvanceStatusLabel(entry.status)}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                      {entry.changedBy && `Por: ${entry.changedBy}`}
                                    </p>
                                    {entry.observations && (
                                      <p className="text-sm text-gray-700 mt-2">
                                        {entry.observations}
                                      </p>
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-500">
                                    {formatDateTime(entry.date)}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <p>Este relatório não está associado a nenhum adiantamento.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Aba Histórico + Detalhes */}
              {activeTab === 2 && (
                <div className="space-y-6">
                  {/* Detalhes do Relatório */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Detalhes do Relatório
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-6">
                      <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <dt className="text-sm font-medium text-gray-500">ID</dt>
                          <dd className="mt-1 text-sm text-gray-900 font-mono">{report.id}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Status</dt>
                          <dd className="mt-1">
                            <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(report.status)}`}>
                              {getStatusLabel(report.status)}
                            </span>
                          </dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Total</dt>
                          <dd className="mt-1 text-sm font-semibold text-gray-900">{formatCurrency(report.totalAmount)}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Data</dt>
                          <dd className="mt-1 text-sm text-gray-900">{formatDate(report.date)}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Projeto</dt>
                          <dd className="mt-1 text-sm text-gray-900">{report.projectName || 'Sem projeto'}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Criado por</dt>
                          <dd className="mt-1 text-sm text-gray-900">{report.createdByUserName || 'N/A'}</dd>
                        </div>
                      </dl>

                      {report.observations && (
                        <div className="mt-4">
                          <dt className="text-sm font-medium text-gray-500 mb-2">Observações</dt>
                          <dd className="text-sm text-gray-900 whitespace-pre-wrap bg-white p-3 rounded-md">
                            {report.observations}
                          </dd>
                        </div>
                      )}

                      {report.approverObservations && (
                        <div className="mt-4">
                          <dt className="text-sm font-medium text-gray-500 mb-2">Observações Públicas</dt>
                          <dd className="text-sm text-gray-900 whitespace-pre-wrap bg-white p-3 rounded-md">
                            {report.approverObservations}
                          </dd>
                        </div>
                      )}

                      {report.approvalObservations && (
                        <div className="mt-4">
                          <dt className="text-sm font-medium text-gray-500 mb-2">Observações do Financeiro</dt>
                          <dd className="text-sm text-gray-900 whitespace-pre-wrap bg-white p-3 rounded-md">
                            {report.approvalObservations}
                          </dd>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Histórico de Status */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Histórico de Status
                    </h3>
                    {report.statusHistory.length === 0 ? (
                      <p className="text-gray-500">Nenhum histórico disponível</p>
                    ) : (
                      <div className="space-y-4">
                        {report.statusHistory.map((entry, index) => (
                          <div key={index} className="border-l-4 border-primary pl-4 py-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {getStatusLabel(entry.status)}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {entry.changedBy && `Alterado por: ${entry.changedBy}`}
                                </p>
                                {entry.observations && (
                                  <p className="text-sm text-gray-700 mt-2">
                                    {entry.observations}
                                  </p>
                                )}
                              </div>
                              <p className="text-xs text-gray-500">
                                {formatDateTime(entry.date)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Ações */}
                  <div className="pt-6 border-t">
                    <h4 className="text-sm font-medium text-gray-900 mb-4">Ações</h4>
                    <div className="flex flex-wrap gap-4">
                      {canApprove && (
                        <button
                          onClick={() => setShowApproveDialog(true)}
                          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                        >
                          Aprovar
                        </button>
                      )}
                      {canReject && (
                        <button
                          onClick={() => setShowRejectDialog(true)}
                          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                        >
                          Rejeitar
                        </button>
                      )}
                      {canConfirmPayment && (
                        <button
                          onClick={() => setShowPaymentDialog(true)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                          Confirmar Pagamento
                        </button>
                      )}
                      {canRejectPayment && (
                        <button
                          onClick={() => setShowRejectDialog(true)}
                          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                        >
                          Rejeitar Pagamento
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Aba Perfil */}
              {activeTab === 3 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Perfil do Criador
                  </h3>
                  {loadingProfile ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                      <p className="mt-4 text-gray-600">Carregando perfil...</p>
                    </div>
                  ) : creatorProfile ? (
                    <div className="space-y-6">
                      {/* Foto de Perfil */}
                      {creatorProfile.profileImageUrl && (
                        <div className="flex justify-center">
                          <img
                            src={creatorProfile.profileImageUrl}
                            alt="Foto de perfil"
                            className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                        </div>
                      )}

                      {/* Informações Pessoais */}
                      <div className="bg-gray-50 rounded-lg p-6">
                        <h4 className="text-md font-semibold text-gray-900 mb-4">
                          Informações Pessoais
                        </h4>
                        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Nome Completo</dt>
                            <dd className="mt-1 text-sm text-gray-900">{creatorProfile.fullName}</dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Nome de Exibição</dt>
                            <dd className="mt-1 text-sm text-gray-900">{creatorProfile.displayName}</dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Email</dt>
                            <dd className="mt-1 text-sm text-gray-900">{creatorProfile.email}</dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">CPF</dt>
                            <dd className="mt-1 text-sm text-gray-900">{creatorProfile.cpf || 'Não informado'}</dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Data de Nascimento</dt>
                            <dd className="mt-1 text-sm text-gray-900">
                              {creatorProfile.birthDate ? formatDate(creatorProfile.birthDate) : 'Não informado'}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Telefone</dt>
                            <dd className="mt-1 text-sm text-gray-900">{creatorProfile.phone || 'Não informado'}</dd>
                          </div>
                        </dl>
                      </div>

                      {/* Informações Bancárias */}
                      <div className="bg-gray-50 rounded-lg p-6">
                        <h4 className="text-md font-semibold text-gray-900 mb-4">
                          Informações Bancárias
                        </h4>
                        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Banco</dt>
                            <dd className="mt-1 text-sm text-gray-900">{creatorProfile.bank || 'Não informado'}</dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Agência</dt>
                            <dd className="mt-1 text-sm text-gray-900">{creatorProfile.agency || 'Não informado'}</dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Conta</dt>
                            <dd className="mt-1 text-sm text-gray-900">{creatorProfile.account || 'Não informado'}</dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Tipo de Conta</dt>
                            <dd className="mt-1 text-sm text-gray-900">
                              {creatorProfile.accountType ? getAccountTypeLabel(creatorProfile.accountType) : 'Não informado'}
                            </dd>
                          </div>
                          <div className="md:col-span-2">
                            <dt className="text-sm font-medium text-gray-500">Chave PIX</dt>
                            <dd className="mt-1 text-sm text-gray-900">{creatorProfile.pixKey || 'Não informado'}</dd>
                          </div>
                        </dl>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <p>Perfil do criador não encontrado.</p>
                      <p className="text-sm mt-2">O perfil do criador ainda não foi configurado no sistema.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Dialog de Aprovação */}
        {showApproveDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Aprovar Relatório</h3>
              <textarea
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                placeholder="Observações (opcional)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
                rows={4}
              />
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="sendEmail"
                  checked={sendingEmail}
                  onChange={(e) => setSendingEmail(e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="sendEmail" className="text-sm text-gray-700">
                  Enviar email de notificação
                </label>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={handleApprove}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Confirmar
                </button>
                <button
                  onClick={() => {
                    setShowApproveDialog(false)
                    setObservations('')
                    setSendingEmail(false)
                  }}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Dialog de Rejeição */}
        {showRejectDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">
                {canRejectPayment ? 'Rejeitar Pagamento' : 'Rejeitar Relatório'}
              </h3>
              <textarea
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                placeholder="Motivo da rejeição"
                className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
                rows={4}
                required
              />
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="sendEmailReject"
                  checked={sendingEmail}
                  onChange={(e) => setSendingEmail(e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="sendEmailReject" className="text-sm text-gray-700">
                  Enviar email de notificação
                </label>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={canRejectPayment ? handleRejectPayment : handleReject}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Confirmar
                </button>
                <button
                  onClick={() => {
                    setShowRejectDialog(false)
                    setObservations('')
                    setSendingEmail(false)
                  }}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Dialog de Confirmação de Pagamento */}
        {showPaymentDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Confirmar Pagamento</h3>
              <textarea
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                placeholder="Observações sobre o pagamento (opcional)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
                rows={4}
              />
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="sendEmailPayment"
                  checked={sendingEmail}
                  onChange={(e) => setSendingEmail(e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="sendEmailPayment" className="text-sm text-gray-700">
                  Enviar email de notificação
                </label>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={handleConfirmPayment}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Confirmar Pagamento
                </button>
                <button
                  onClick={() => {
                    setShowPaymentDialog(false)
                    setObservations('')
                    setSendingEmail(false)
                  }}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Comprovantes */}
        {showReceiptModal && selectedExpense && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                <h3 className="text-lg font-semibold">Comprovantes - {selectedExpense.expenseType}</h3>
                <button
                  onClick={() => {
                    setShowReceiptModal(false)
                    setSelectedExpense(null)
                  }}
                  className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                >
                  ×
                </button>
              </div>
              <div className="p-6">
                {selectedExpense.receiptImageUri && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Imagem do Comprovante</h4>
                    <div className="border rounded-lg overflow-hidden">
                      <img
                        src={selectedExpense.receiptImageUri}
                        alt="Comprovante"
                        className="w-full h-auto max-h-96 object-contain"
                        onError={(e) => {
                          e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3EErro ao carregar imagem%3C/text%3E%3C/svg%3E'
                        }}
                      />
                    </div>
                    <a
                      href={selectedExpense.receiptImageUri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-block text-sm text-blue-600 hover:text-blue-800"
                    >
                      Abrir em nova aba →
                    </a>
                  </div>
                )}

                {selectedExpense.receiptPdfUri && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">PDF do Comprovante</h4>
                    <div className="border rounded-lg p-4 bg-gray-50">
                      <iframe
                        src={selectedExpense.receiptPdfUri}
                        className="w-full h-96 border-0"
                        title="PDF do Comprovante"
                      />
                    </div>
                    <a
                      href={selectedExpense.receiptPdfUri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-block text-sm text-blue-600 hover:text-blue-800"
                    >
                      Abrir PDF em nova aba →
                    </a>
                  </div>
                )}

                {selectedExpense.attachments && selectedExpense.attachments.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Anexos Adicionais</h4>
                    <div className="space-y-2">
                      {selectedExpense.attachments.map((attachment, index) => (
                        <div key={index} className="border rounded-lg p-3 flex items-center justify-between">
                          <span className="text-sm text-gray-700">Anexo {index + 1}</span>
                          <a
                            href={attachment}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                          >
                            Abrir
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!selectedExpense.receiptImageUri && !selectedExpense.receiptPdfUri && (!selectedExpense.attachments || selectedExpense.attachments.length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    <p>Nenhum comprovante disponível para esta despesa.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal de Detalhes da Despesa */}
        {showExpenseDetailsModal && selectedExpense && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                <h3 className="text-lg font-semibold">Detalhes da Despesa</h3>
                <button
                  onClick={() => {
                    setShowExpenseDetailsModal(false)
                    setSelectedExpense(null)
                  }}
                  className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                >
                  ×
                </button>
              </div>
              <div className="p-6">
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Tipo de Despesa</dt>
                    <dd className="mt-1 text-sm text-gray-900">{selectedExpense.expenseType}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Data</dt>
                    <dd className="mt-1 text-sm text-gray-900">{formatDate(selectedExpense.date)}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Valor</dt>
                    <dd className="mt-1 text-sm font-semibold text-gray-900">{formatCurrency(selectedExpense.amount)}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Forma de Pagamento</dt>
                    <dd className="mt-1 text-sm text-gray-900">{getPaymentMethodLabel(selectedExpense.paymentMethod)}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Reembolsável</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${selectedExpense.reimbursable ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {selectedExpense.reimbursable ? 'Sim' : 'Não'}
                      </span>
                    </dd>
                  </div>
                  {selectedExpense.projectName && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Projeto</dt>
                      <dd className="mt-1 text-sm text-gray-900">{selectedExpense.projectName}</dd>
                    </div>
                  )}
                  {selectedExpense.createdByUserName && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Criado por</dt>
                      <dd className="mt-1 text-sm text-gray-900">{selectedExpense.createdByUserName}</dd>
                    </div>
                  )}
                  {selectedExpense.createdAtDateTime && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Data de Criação</dt>
                      <dd className="mt-1 text-sm text-gray-900">{formatDateTime(selectedExpense.createdAtDateTime)}</dd>
                    </div>
                  )}
                </dl>

                {selectedExpense.observations && (
                  <div className="mt-6">
                    <dt className="text-sm font-medium text-gray-500 mb-2">Observações</dt>
                    <dd className="text-sm text-gray-900 whitespace-pre-wrap bg-gray-50 p-3 rounded-md">
                      {selectedExpense.observations}
                    </dd>
                  </div>
                )}

                <div className="mt-6 pt-6 border-t">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Comprovantes Disponíveis</h4>
                  <div className="flex gap-2">
                    {selectedExpense.receiptImageUri && (
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-md text-xs">
                        Imagem
                      </span>
                    )}
                    {selectedExpense.receiptPdfUri && (
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-md text-xs">
                        PDF
                      </span>
                    )}
                    {selectedExpense.attachments && selectedExpense.attachments.length > 0 && (
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-md text-xs">
                        {selectedExpense.attachments.length} Anexo(s)
                      </span>
                    )}
                    {!selectedExpense.receiptImageUri && !selectedExpense.receiptPdfUri && (!selectedExpense.attachments || selectedExpense.attachments.length === 0) && (
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-md text-xs">
                        Nenhum comprovante
                      </span>
                    )}
                  </div>
                  {(selectedExpense.receiptImageUri || selectedExpense.receiptPdfUri || (selectedExpense.attachments && selectedExpense.attachments.length > 0)) && (
                    <button
                      onClick={() => {
                        setShowExpenseDetailsModal(false)
                        setShowReceiptModal(true)
                      }}
                      className="mt-3 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                    >
                      Ver Comprovantes
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}
