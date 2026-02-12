'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useFinanceiro } from '@/hooks/useFinanceiro'
import { Advance, AdvanceStatus } from '@/lib/models/types'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { toast } from 'react-toastify'

export default function AdvanceDetailPage() {
  const router = useRouter()
  const params = useParams()
  const advanceId = params?.id as string
  const { markAdvanceAsPaid } = useFinanceiro()

  const [advance, setAdvance] = useState<Advance | null>(null)
  const [loading, setLoading] = useState(true)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [observations, setObservations] = useState('')

  useEffect(() => {
    if (!advanceId) return

    const loadAdvance = async () => {
      try {
        setLoading(true)
        const advanceDoc = await getDoc(doc(db, 'advances', advanceId))
        if (!advanceDoc.exists()) {
          toast.error('Adiantamento não encontrado')
          router.push('/dashboard')
          return
        }

        const data = advanceDoc.data()
        const advanceData: Advance = {
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
        }
        setAdvance(advanceData)
      } catch (error: any) {
        toast.error('Erro ao carregar adiantamento: ' + error.message)
        router.push('/dashboard')
      } finally {
        setLoading(false)
      }
    }

    loadAdvance()
  }, [advanceId, router])

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

  const getReasonLabel = (reason: string) => {
    switch (reason) {
      case 'VIAGEM':
        return 'Viagem'
      case 'COMPRA_MATERIAL':
        return 'Compra de Material'
      case 'SERVICO_TERCEIRO':
        return 'Serviço de Terceiro'
      case 'OUTROS':
        return 'Outros'
      default:
        return reason
    }
  }

  const getStatusLabel = (status: AdvanceStatus) => {
    switch (status) {
      case AdvanceStatus.PAGAMENTO_APROVADO:
        return 'Pagamento Aprovado'
      case AdvanceStatus.PAGAMENTO_EFETUADO:
        return 'Pagamento Efetuado'
      case AdvanceStatus.REJEITADO:
        return 'Rejeitado'
      default:
        return status
    }
  }

  const handleMarkAsPaid = async () => {
    if (!advance) return

    try {
      await markAdvanceAsPaid(advance.id, observations)
      toast.success('Adiantamento marcado como pago!')
      router.push('/dashboard')
    } catch (error: any) {
      toast.error('Erro ao marcar como pago: ' + error.message)
    }
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando adiantamento...</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (!advance) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <p className="text-gray-600">Adiantamento não encontrado</p>
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

  const canMarkAsPaid = advance.status === AdvanceStatus.PAGAMENTO_APROVADO

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
                <h1 className="text-2xl font-bold text-gray-900">{advance.name}</h1>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded">
                    {getStatusLabel(advance.status)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Informações do Adiantamento
            </h3>

            <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <dt className="text-sm font-medium text-gray-500">Valor</dt>
                <dd className="mt-1 text-lg font-semibold text-gray-900">
                  {formatCurrency(advance.amount)}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Motivo</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {getReasonLabel(advance.reason)}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Período de Trabalho - Início</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {formatDate(advance.workPeriodStart)}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Período de Trabalho - Fim</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {formatDate(advance.workPeriodEnd)}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Criado por</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {advance.createdByUserName || 'N/A'}
                </dd>
              </div>
              {advance.reportName && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Relatório Associado</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {advance.reportName}
                  </dd>
                </div>
              )}
            </dl>

            {advance.observations && (
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-500 mb-2">
                  Observações
                </h4>
                <p className="text-sm text-gray-900 whitespace-pre-wrap">
                  {advance.observations}
                </p>
              </div>
            )}

            {/* Histórico */}
            {advance.statusHistory.length > 0 && (
              <div className="mt-8 pt-6 border-t">
                <h4 className="text-sm font-medium text-gray-900 mb-4">
                  Histórico de Status
                </h4>
                <div className="space-y-4">
                  {advance.statusHistory.map((entry, index) => (
                    <div key={index} className="border-l-4 border-primary pl-4 py-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {getStatusLabel(entry.status)}
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

            {/* Ações */}
            {canMarkAsPaid && (
              <div className="mt-8 pt-6 border-t">
                <button
                  onClick={() => setShowPaymentDialog(true)}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Marcar como Pago
                </button>
              </div>
            )}
          </div>
        </div>

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
              <div className="flex gap-4">
                <button
                  onClick={handleMarkAsPaid}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Confirmar Pagamento
                </button>
                <button
                  onClick={() => {
                    setShowPaymentDialog(false)
                    setObservations('')
                  }}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}
