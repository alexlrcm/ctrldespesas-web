import { useState, useEffect, useCallback } from 'react'
import { useAuthContext } from '@/contexts/AuthContext'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import {
  getFinanceiroReports,
  getFinanceiroAdvances,
  getReportById,
  getExpensesByReportId,
  updateReport,
  updateAdvance,
  getUserProfile,
} from '@/lib/services/firestore'
import {
  ExpenseReport,
  Advance,
  Expense,
  UserProfile,
  ReportStatus,
  AdvanceStatus,
} from '@/lib/models/types'

// Helper function para substringBefore
function substringBefore(str: string, char: string): string {
  const index = str.indexOf(char)
  return index === -1 ? str : str.substring(0, index)
}

export function useFinanceiro() {
  const { user } = useAuthContext()
  const [reports, setReports] = useState<ExpenseReport[]>([])
  const [advances, setAdvances] = useState<Advance[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Carregar relatórios e adiantamentos
  useEffect(() => {
    if (!user?.uid) {
      console.log('⚠️ useFinanceiro: user.uid não disponível ainda')
      return
    }

    console.log('🔄 useFinanceiro: Carregando dados para userId:', user.uid)

    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)

        console.log('📥 useFinanceiro: Iniciando busca de dados...')
        const [reportsData, advancesData] = await Promise.all([
          getFinanceiroReports(user.uid),
          getFinanceiroAdvances(),
        ])

        console.log('✅ useFinanceiro: Dados carregados:', {
          reports: reportsData.length,
          advances: advancesData.length,
        })

        setReports(reportsData)
        setAdvances(advancesData)
      } catch (err: any) {
        console.error('❌ useFinanceiro: Erro ao carregar dados:', err)
        setError(err.message || 'Erro ao carregar dados')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user?.uid])

  // Buscar relatório completo com despesas
  const loadReportDetails = useCallback(async (
    reportId: string
  ): Promise<ExpenseReport | null> => {
    try {
      console.log('🔄 loadReportDetails: Carregando relatório ID:', reportId)
      
      const report = await getReportById(reportId)
      if (!report) {
        console.warn('⚠️ Relatório não encontrado:', reportId)
        return null
      }

      console.log('📋 Relatório encontrado:', {
        id: report.id,
        name: report.name,
        expensesNoDocumento: report.expenses?.length || 0,
        tipoExpenses: Array.isArray(report.expenses) ? 'array' : typeof report.expenses,
      })

      // Buscar sempre da coleção para garantir dados atualizados e completos
      console.log('🔍 Buscando despesas da coleção (forçando atualização)...')
      const expensesFromCollection = await getExpensesByReportId(reportId)
      
      console.log('💰 Despesas da coleção:', {
        quantidade: expensesFromCollection.length,
        ids: expensesFromCollection.map(e => e.id),
      })

      return {
        ...report,
        expenses: expensesFromCollection,
      }
    } catch (err: any) {
      console.error('❌ Erro ao carregar detalhes do relatório:', err)
      throw err
    }
  }, [])

  // Aprovar relatório (ANALISE_CONTABIL -> FINANCEIRO_APROVADO)
  const approveReport = async (
    reportId: string,
    observations: string,
    sendEmail: boolean = false
  ): Promise<void> => {
    try {
      const report = await getReportById(reportId)
      if (!report) throw new Error('Relatório não encontrado')

      const dateFormat = new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
      const currentDate = dateFormat.format(new Date())
      const financeiroName = user?.email ? substringBefore(user.email, '@') : 'Financeiro'

      const newHistoryEntry = {
        status: ReportStatus.FINANCEIRO_APROVADO,
        date: currentDate,
        changedBy: financeiroName,
        observations: observations || '',
      }

      const updatedReport: Partial<ExpenseReport> = {
        status: ReportStatus.FINANCEIRO_APROVADO,
        approvalObservations: observations,
        approverObservations: '',
        approvedByUserId: user?.uid || null,
        approvedByUserName: financeiroName,
        statusHistory: [...(report.statusHistory || []), newHistoryEntry],
      }

      await updateReport(reportId, updatedReport)

      // Recarregar lista de relatórios
      if (user?.uid) {
        const updatedReports = await getFinanceiroReports(user.uid)
        setReports(updatedReports)
      }
    } catch (err: any) {
      console.error('Erro ao aprovar relatório:', err)
      throw err
    }
  }

  // Rejeitar relatório (ANALISE_CONTABIL -> REJEITADO)
  const rejectReport = async (
    reportId: string,
    observations: string,
    sendEmail: boolean = false
  ): Promise<void> => {
    try {
      const report = await getReportById(reportId)
      if (!report) throw new Error('Relatório não encontrado')

      const dateFormat = new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
      const currentDate = dateFormat.format(new Date())
      const financeiroName = user?.email ? substringBefore(user.email, '@') : 'Financeiro'

      const newHistoryEntry = {
        status: ReportStatus.REJEITADO,
        date: currentDate,
        changedBy: financeiroName,
        observations: observations || '',
      }

      const updatedReport: Partial<ExpenseReport> = {
        status: ReportStatus.REJEITADO,
        approverObservations: observations,
        approvalObservations: '',
        approvedByUserId: user?.uid || null,
        approvedByUserName: financeiroName,
        statusHistory: [...(report.statusHistory || []), newHistoryEntry],
      }

      await updateReport(reportId, updatedReport)

      // Recarregar lista de relatórios
      if (user?.uid) {
        const updatedReports = await getFinanceiroReports(user.uid)
        setReports(updatedReports)
      }
    } catch (err: any) {
      console.error('Erro ao rejeitar relatório:', err)
      throw err
    }
  }

  // Confirmar pagamento (APROVADO_PARA_PAGAMENTO -> PAGAMENTO_EFETUADO)
  const confirmPayment = async (
    reportId: string,
    observations: string,
    sendEmail: boolean = false
  ): Promise<void> => {
    try {
      const report = await getReportById(reportId)
      if (!report) throw new Error('Relatório não encontrado')

      const dateFormat = new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
      const currentDate = dateFormat.format(new Date())
      const financeiroName = user?.email ? substringBefore(user.email, '@') : 'Financeiro'

      const newHistoryEntry = {
        status: ReportStatus.PAGAMENTO_EFETUADO,
        date: currentDate,
        changedBy: financeiroName,
        observations: observations || '',
      }

      const updatedReport: Partial<ExpenseReport> = {
        status: ReportStatus.PAGAMENTO_EFETUADO,
        approvalObservations: observations,
        statusHistory: [...(report.statusHistory || []), newHistoryEntry],
      }

      await updateReport(reportId, updatedReport)

      // Recarregar lista de relatórios
      if (user?.uid) {
        const updatedReports = await getFinanceiroReports(user.uid)
        setReports(updatedReports)
      }
    } catch (err: any) {
      console.error('Erro ao confirmar pagamento:', err)
      throw err
    }
  }

  // Rejeitar pagamento (APROVADO_PARA_PAGAMENTO -> REJEITADO)
  const rejectPayment = async (
    reportId: string,
    observations: string,
    sendEmail: boolean = false
  ): Promise<void> => {
    try {
      const report = await getReportById(reportId)
      if (!report) throw new Error('Relatório não encontrado')

      const dateFormat = new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
      const currentDate = dateFormat.format(new Date())
      const financeiroName = user?.email ? substringBefore(user.email, '@') : 'Financeiro'

      const newHistoryEntry = {
        status: ReportStatus.REJEITADO,
        date: currentDate,
        changedBy: financeiroName,
        observations: observations || '',
      }

      const updatedReport: Partial<ExpenseReport> = {
        status: ReportStatus.REJEITADO,
        approverObservations: observations,
        approvalObservations: '',
        statusHistory: [...(report.statusHistory || []), newHistoryEntry],
      }

      await updateReport(reportId, updatedReport)

      // Recarregar lista de relatórios
      if (user?.uid) {
        const updatedReports = await getFinanceiroReports(user.uid)
        setReports(updatedReports)
      }
    } catch (err: any) {
      console.error('Erro ao rejeitar pagamento:', err)
      throw err
    }
  }

  // Marcar adiantamento como pago (PAGAMENTO_APROVADO -> PAGAMENTO_EFETUADO)
  const markAdvanceAsPaid = async (
    advanceId: string,
    observations: string
  ): Promise<void> => {
    try {
      const advanceDoc = await getDoc(doc(db, 'advances', advanceId))
      if (!advanceDoc.exists()) throw new Error('Adiantamento não encontrado')

      const advance = advanceDoc.data() as Advance
      const dateFormat = new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
      const currentDate = dateFormat.format(new Date())
      const financeiroName = user?.email ? substringBefore(user.email, '@') : 'Financeiro'

      const newHistoryEntry = {
        status: AdvanceStatus.PAGAMENTO_EFETUADO,
        date: currentDate,
        changedBy: financeiroName,
        observations: observations || '',
      }

      const updatedAdvance: Partial<Advance> = {
        status: AdvanceStatus.PAGAMENTO_EFETUADO,
        statusHistory: [...(advance.statusHistory || []), newHistoryEntry],
      }

      await updateAdvance(advanceId, updatedAdvance)

      // Recarregar lista de adiantamentos
      const updatedAdvances = await getFinanceiroAdvances()
      setAdvances(updatedAdvances)
    } catch (err: any) {
      console.error('Erro ao marcar adiantamento como pago:', err)
      throw err
    }
  }

  // Buscar perfil do criador do relatório
  const loadCreatorProfile = async (
    userId: string | null | undefined
  ): Promise<UserProfile | null> => {
    if (!userId) return null
    try {
      return await getUserProfile(userId)
    } catch (err: any) {
      console.error('Erro ao buscar perfil do criador:', err)
      return null
    }
  }

  return {
    reports,
    advances,
    loading,
    error,
    loadReportDetails,
    approveReport,
    rejectReport,
    confirmPayment,
    rejectPayment,
    markAdvanceAsPaid,
    loadCreatorProfile,
    refreshData: async () => {
      if (!user?.uid) return
      setLoading(true)
      try {
        const [reportsData, advancesData] = await Promise.all([
          getFinanceiroReports(user.uid),
          getFinanceiroAdvances(),
        ])
        setReports(reportsData)
        setAdvances(advancesData)
      } catch (err: any) {
        setError(err.message || 'Erro ao recarregar dados')
      } finally {
        setLoading(false)
      }
    },
  }
}

