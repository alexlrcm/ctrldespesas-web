import { useState, useEffect, useCallback } from 'react'
import { useAuthContext } from '@/contexts/AuthContext'
import {
  getOperadorExpensesWithoutReport,
  getOperadorReports,
  getOperadorAdvances,
  getAllProjects,
  getAllCompanies,
  getExpenseById,
  getAdvanceById,
  getReportById,
  createExpense,
  updateExpense,
  deleteExpense,
  createReport,
  updateReportOperador,
  createAdvance,
  updateAdvanceOperador,
  getProjectById,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
  createProject,
  updateProject,
  deleteProject,
} from '@/lib/services/firestore'
import { useUserRole } from './useUserRole'
import {
  Expense,
  ExpenseReport,
  Advance,
  Project,
  Company,
} from '@/lib/models/types'

export function useOperador() {
  const { user } = useAuthContext()
  const { isAdmin, loading: roleLoading } = useUserRole()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [reports, setReports] = useState<ExpenseReport[]>([])
  const [advances, setAdvances] = useState<Advance[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Carregar dados do OPERADOR
  useEffect(() => {
    if (!user?.uid || roleLoading) {
      console.log('⚠️ useOperador: user.uid ou role não disponíveis ainda')
      return
    }

    console.log('🔄 useOperador: Carregando dados para userId:', user.uid)

    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)

        console.log('📥 useOperador: Iniciando busca de dados...', { isAdmin })
        const results = await Promise.allSettled([
          getOperadorExpensesWithoutReport(user.uid, isAdmin),
          getOperadorReports(user.uid, isAdmin),
          getOperadorAdvances(user.uid, isAdmin),
          getAllProjects(),
          getAllCompanies(),
        ])

        const expensesData = results[0].status === 'fulfilled' ? results[0].value : []
        const reportsData = results[1].status === 'fulfilled' ? results[1].value : []
        const advancesData = results[2].status === 'fulfilled' ? results[2].value : []
        const projectsData = results[3].status === 'fulfilled' ? results[3].value : []
        const companiesData = results[4].status === 'fulfilled' ? results[4].value : []

        // Log erros se houver
        results.forEach((result, index) => {
          if (result.status === 'rejected') {
            const dataNames = ['expenses', 'reports', 'advances', 'projects', 'companies']
            console.warn(`⚠️ useOperador: Erro ao carregar ${dataNames[index]}:`, result.reason)
          }
        })

        console.log('✅ useOperador: Dados carregados:', {
          expenses: expensesData.length,
          reports: reportsData.length,
          advances: advancesData.length,
          projects: projectsData.length,
          companies: companiesData.length,
        })

        setExpenses(expensesData)
        setReports(reportsData)
        setAdvances(advancesData)
        setProjects(projectsData)
        setCompanies(companiesData)
      } catch (err: any) {
        console.error('❌ useOperador: Erro ao carregar dados:', err)
        setError(err.message || 'Erro ao carregar dados')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user?.uid, roleLoading, isAdmin])

  // Criar despesa
  const createNewExpense = useCallback(async (
    expense: Omit<Expense, 'id'>
  ): Promise<string> => {
    try {
      const expenseId = await createExpense({
        ...expense,
        createdByUserId: user?.uid || null,
        createdByUserName: user?.email || null,
      })

      // Recarregar despesas
      if (user?.uid) {
        const updatedExpenses = await getOperadorExpensesWithoutReport(user.uid, isAdmin)
        setExpenses(updatedExpenses)
      }

      return expenseId
    } catch (err: any) {
      console.error('Erro ao criar despesa:', err)
      throw err
    }
  }, [user?.uid, user?.email, isAdmin])

  // Atualizar despesa
  const updateExpenseData = useCallback(async (
    expenseId: string,
    expense: Partial<Expense>
  ): Promise<void> => {
    try {
      await updateExpense(expenseId, expense)

      // Recarregar despesas
      if (user?.uid) {
        const updatedExpenses = await getOperadorExpensesWithoutReport(user.uid, isAdmin)
        setExpenses(updatedExpenses)
      }
    } catch (err: any) {
      console.error('Erro ao atualizar despesa:', err)
      throw err
    }
  }, [user?.uid, isAdmin])

  // Deletar despesa
  const deleteExpenseData = useCallback(async (
    expenseId: string
  ): Promise<void> => {
    try {
      await deleteExpense(expenseId)

      // Recarregar despesas
      if (user?.uid) {
        const updatedExpenses = await getOperadorExpensesWithoutReport(user.uid, isAdmin)
        setExpenses(updatedExpenses)
      }
    } catch (err: any) {
      console.error('Erro ao deletar despesa:', err)
      throw err
    }
  }, [user?.uid, isAdmin])

  // Criar relatório
  const createNewReport = useCallback(async (
    report: Omit<ExpenseReport, 'id' | 'expenses'>
  ): Promise<string> => {
    try {
      const reportId = await createReport({
        ...report,
        expenses: [],
        createdByUserId: user?.uid || null,
        createdByUserName: user?.email || null,
      })

      // Recarregar relatórios
      if (user?.uid) {
        const updatedReports = await getOperadorReports(user.uid, isAdmin)
        setReports(updatedReports)
      }

      return reportId
    } catch (err: any) {
      console.error('Erro ao criar relatório:', err)
      throw err
    }
  }, [user?.uid, user?.email, isAdmin])

  // Atualizar relatório
  const updateReportData = useCallback(async (
    reportId: string,
    report: Partial<ExpenseReport>
  ): Promise<void> => {
    try {
      await updateReportOperador(reportId, report)

      // Recarregar relatórios
      if (user?.uid) {
        const updatedReports = await getOperadorReports(user.uid, isAdmin)
        setReports(updatedReports)
      }
    } catch (err: any) {
      console.error('Erro ao atualizar relatório:', err)
      throw err
    }
  }, [user?.uid, isAdmin])

  // Criar adiantamento
  const createNewAdvance = useCallback(async (
    advance: Omit<Advance, 'id'>
  ): Promise<string> => {
    try {
      const advanceId = await createAdvance({
        ...advance,
        createdByUserId: user?.uid || null,
        createdByUserName: user?.email || null,
      })

      // Recarregar adiantamentos
      if (user?.uid) {
        const updatedAdvances = await getOperadorAdvances(user.uid, isAdmin)
        setAdvances(updatedAdvances)
      }

      return advanceId
    } catch (err: any) {
      console.error('Erro ao criar adiantamento:', err)
      throw err
    }
  }, [user?.uid, user?.email, isAdmin])

  // Atualizar adiantamento
  const updateAdvanceData = useCallback(async (
    advanceId: string,
    advance: Partial<Advance>
  ): Promise<void> => {
    try {
      await updateAdvanceOperador(advanceId, advance)

      // Recarregar adiantamentos
      if (user?.uid) {
        const updatedAdvances = await getOperadorAdvances(user.uid, isAdmin)
        setAdvances(updatedAdvances)
      }
    } catch (err: any) {
      console.error('Erro ao atualizar adiantamento:', err)
      throw err
    }
  }, [user?.uid, isAdmin])

  // Buscar relatório completo com despesas
  const loadReportDetails = useCallback(async (
    reportId: string
  ): Promise<ExpenseReport | null> => {
    try {
      return await getReportById(reportId)
    } catch (err: any) {
      console.error('Erro ao buscar detalhes do relatório:', err)
      throw err
    }
  }, [])

  // Buscar despesa por ID
  const loadExpenseDetails = useCallback(async (
    expenseId: string
  ): Promise<Expense | null> => {
    try {
      return await getExpenseById(expenseId)
    } catch (err: any) {
      console.error('Erro ao buscar detalhes da despesa:', err)
      throw err
    }
  }, [])

  // Buscar adiantamento por ID
  const loadAdvanceDetails = useCallback(async (
    advanceId: string
  ): Promise<Advance | null> => {
    try {
      return await getAdvanceById(advanceId)
    } catch (err: any) {
      console.error('Erro ao buscar detalhes do adiantamento:', err)
      throw err
    }
  }, [])

  // ---------- Funções ADMIN (Empresas e Projetos) ----------

  const createCompanyData = useCallback(async (company: Omit<Company, 'id'>) => {
    const id = await createCompany(company)
    const updated = await getAllCompanies()
    setCompanies(updated)
    return id
  }, [])

  const updateCompanyData = useCallback(async (id: string, updates: Partial<Company>) => {
    await updateCompany(id, updates)
    const updated = await getAllCompanies()
    setCompanies(updated)
  }, [])

  const deleteCompanyData = useCallback(async (id: string) => {
    await deleteCompany(id)
    const updated = await getAllCompanies()
    setCompanies(updated)
  }, [])

  const createProjectData = useCallback(async (project: Omit<Project, 'id'>) => {
    const id = await createProject(project)
    const updated = await getAllProjects()
    setProjects(updated)
    return id
  }, [])

  const updateProjectData = useCallback(async (id: string, updates: Partial<Project>) => {
    await updateProject(id, updates)
    const updated = await getAllProjects()
    setProjects(updated)
  }, [])

  const deleteProjectData = useCallback(async (id: string) => {
    await deleteProject(id)
    const updated = await getAllProjects()
    setProjects(updated)
  }, [])

  return {
    expenses,
    reports,
    advances,
    projects,
    companies,
    loading,
    error,
    createNewExpense,
    updateExpenseData,
    deleteExpenseData,
    createNewReport,
    updateReportData,
    createNewAdvance,
    updateAdvanceData,
    loadReportDetails,
    loadExpenseDetails,
    loadAdvanceDetails,
    // Helpers para buscar por ID
    getProjectById,
    getCompanyById,
    // Admin CRUD
    createCompanyData,
    updateCompanyData,
    deleteCompanyData,
    createProjectData,
    updateProjectData,
    deleteProjectData,
  }
}
