import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  Timestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import {
  ExpenseReport,
  ReportStatus,
  Advance,
  AdvanceStatus,
  UserProfile,
  Expense,
  UserRole,
} from '@/lib/models/types'

const COLLECTION_REPORTS = 'expense_reports'
const COLLECTION_ADVANCES = 'advances'
const COLLECTION_EXPENSES = 'expenses'
const COLLECTION_USERS = 'users'
const COLLECTION_USER_PROFILES = 'user_profiles'

// ========== REPORTS ==========

/**
 * Busca relatórios para o perfil Financeiro:
 * - ANALISE_CONTABIL (para análise inicial)
 * - APROVADO_PARA_PAGAMENTO (para executar pagamento)
 * - Próprios relatórios do usuário (qualquer status)
 */
export async function getFinanceiroReports(
  userId: string
): Promise<ExpenseReport[]> {
  try {
    console.log('🔍 Buscando relatórios para Financeiro, userId:', userId)
    
    // Buscar relatórios em análise contábil (sem orderBy para evitar necessidade de índice)
    const analiseQuery = query(
      collection(db, COLLECTION_REPORTS),
      where('status', '==', ReportStatus.ANALISE_CONTABIL)
    )

    // Buscar relatórios aprovados para pagamento (sem orderBy)
    const pagamentoQuery = query(
      collection(db, COLLECTION_REPORTS),
      where('status', '==', ReportStatus.APROVADO_PARA_PAGAMENTO)
    )

    // Buscar próprios relatórios do usuário (sem orderBy)
    const ownReportsQuery = query(
      collection(db, COLLECTION_REPORTS),
      where('createdByUserId', '==', userId)
    )

    const [analiseSnapshot, pagamentoSnapshot, ownReportsSnapshot] =
      await Promise.all([
        getDocs(analiseQuery).catch(err => {
          console.error('Erro ao buscar ANALISE_CONTABIL:', err)
          return { docs: [], size: 0, empty: true } as any
        }),
        getDocs(pagamentoQuery).catch(err => {
          console.error('Erro ao buscar APROVADO_PARA_PAGAMENTO:', err)
          return { docs: [], size: 0, empty: true } as any
        }),
        getDocs(ownReportsQuery).catch(err => {
          console.error('Erro ao buscar próprios relatórios:', err)
          return { docs: [], size: 0, empty: true } as any
        }),
      ])
    
    console.log('📊 Resultados:', {
      analise: analiseSnapshot.size || 0,
      pagamento: pagamentoSnapshot.size || 0,
      proprios: ownReportsSnapshot.size || 0,
    })

    // Converter documentos para ExpenseReport
    const reports: ExpenseReport[] = []

    const processSnapshot = (snapshot: any) => {
      snapshot.forEach((doc: any) => {
        const data = doc.data()
        const report: ExpenseReport = {
          id: doc.id,
          name: data.name || '',
          projectId: data.projectId || null,
          projectName: data.projectName || null,
          advanceId: data.advanceId || null,
          advanceName: data.advanceName || null,
          observations: data.observations || '',
          status: data.status as ReportStatus,
          totalAmount: data.totalAmount || 0,
          date: data.date || '',
          expenses: data.expenses || [],
          createdByUserId: data.createdByUserId || null,
          createdByUserName: data.createdByUserName || null,
          approverObservations: data.approverObservations || '',
          approvalObservations: data.approvalObservations || '',
          approvedByUserId: data.approvedByUserId || null,
          approvedByUserName: data.approvedByUserName || null,
          statusHistory: data.statusHistory || [],
          createdAtDateTime: data.createdAtDateTime || null,
        }
        reports.push(report)
      })
    }

    processSnapshot(analiseSnapshot)
    processSnapshot(pagamentoSnapshot)
    processSnapshot(ownReportsSnapshot)

    // Remover duplicatas por ID
    const uniqueReports = Array.from(
      new Map(reports.map((r) => [r.id, r])).values()
    )

    // Ordenar por data (mais recente primeiro) em memória
    uniqueReports.sort((a, b) => {
      const dateA = new Date(a.date || a.createdAtDateTime || 0).getTime()
      const dateB = new Date(b.date || b.createdAtDateTime || 0).getTime()
      return dateB - dateA // Descendente
    })

    console.log('✅ Relatórios encontrados (após remover duplicatas e ordenar):', uniqueReports.length)
    
    return uniqueReports
  } catch (error) {
    console.error('❌ Erro ao buscar relatórios do Financeiro:', error)
    throw error
  }
}

/**
 * Busca um relatório específico por ID
 */
export async function getReportById(
  reportId: string
): Promise<ExpenseReport | null> {
  try {
    const reportDoc = await getDoc(doc(db, COLLECTION_REPORTS, reportId))
    if (!reportDoc.exists()) {
      return null
    }

    const data = reportDoc.data()
    return {
      id: reportDoc.id,
      name: data.name || '',
      projectId: data.projectId || null,
      projectName: data.projectName || null,
      advanceId: data.advanceId || null,
      advanceName: data.advanceName || null,
      observations: data.observations || '',
      status: data.status as ReportStatus,
      totalAmount: data.totalAmount || 0,
      date: data.date || '',
      expenses: data.expenses || [],
      createdByUserId: data.createdByUserId || null,
      createdByUserName: data.createdByUserName || null,
      approverObservations: data.approverObservations || '',
      approvalObservations: data.approvalObservations || '',
      approvedByUserId: data.approvedByUserId || null,
      approvedByUserName: data.approvedByUserName || null,
      statusHistory: data.statusHistory || [],
      createdAtDateTime: data.createdAtDateTime || null,
    }
  } catch (error) {
    console.error('Erro ao buscar relatório:', error)
    throw error
  }
}

/**
 * Busca despesas de um relatório
 */
export async function getExpensesByReportId(
  reportId: string
): Promise<Expense[]> {
  try {
    const expensesQuery = query(
      collection(db, COLLECTION_EXPENSES),
      where('reportId', '==', reportId)
    )

    const snapshot = await getDocs(expensesQuery)
    const expenses: Expense[] = []

    snapshot.forEach((doc) => {
      const data = doc.data()
      expenses.push({
        id: doc.id,
        amount: data.amount || 0,
        expenseType: data.expenseType,
        date: data.date || '',
        paymentMethod: data.paymentMethod,
        reimbursable: data.reimbursable || false,
        projectId: data.projectId || null,
        projectName: data.projectName || null,
        reportId: data.reportId || null,
        reportName: data.reportName || null,
        observations: data.observations || '',
        receiptImageUri: data.receiptImageUri || null,
        receiptPdfUri: data.receiptPdfUri || null,
        attachments: data.attachments || [],
        createdByUserId: data.createdByUserId || null,
        createdByUserName: data.createdByUserName || null,
        createdAtDateTime: data.createdAtDateTime || null,
      })
    })

    return expenses
  } catch (error) {
    console.error('Erro ao buscar despesas:', error)
    throw error
  }
}

/**
 * Atualiza um relatório
 */
export async function updateReport(
  reportId: string,
  updates: Partial<ExpenseReport>
): Promise<void> {
  try {
    const reportRef = doc(db, COLLECTION_REPORTS, reportId)
    await updateDoc(reportRef, updates)
  } catch (error) {
    console.error('Erro ao atualizar relatório:', error)
    throw error
  }
}

// ========== ADVANCES ==========

/**
 * Busca adiantamentos para o perfil Financeiro:
 * - PAGAMENTO_APROVADO (para executar pagamento)
 */
export async function getFinanceiroAdvances(): Promise<Advance[]> {
  try {
    console.log('🔍 Buscando adiantamentos para Financeiro')
    
    // Remover orderBy para evitar necessidade de índice composto
    const advancesQuery = query(
      collection(db, COLLECTION_ADVANCES),
      where('status', '==', AdvanceStatus.PAGAMENTO_APROVADO)
    )

    const snapshot = await getDocs(advancesQuery).catch(err => {
      console.error('Erro ao buscar adiantamentos:', err)
      return { docs: [], size: 0, empty: true } as any
    })
    
    const advances: Advance[] = []

    snapshot.forEach((doc: any) => {
      const data = doc.data()
      advances.push({
        id: doc.id,
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
    })

    // Ordenar por data de criação (mais recente primeiro) em memória
    advances.sort((a, b) => {
      const dateA = new Date(a.createdAtDateTime || 0).getTime()
      const dateB = new Date(b.createdAtDateTime || 0).getTime()
      return dateB - dateA // Descendente
    })

    console.log('✅ Adiantamentos encontrados:', advances.length)
    
    return advances
  } catch (error) {
    console.error('❌ Erro ao buscar adiantamentos do Financeiro:', error)
    throw error
  }
}

/**
 * Atualiza um adiantamento
 */
export async function updateAdvance(
  advanceId: string,
  updates: Partial<Advance>
): Promise<void> {
  try {
    const advanceRef = doc(db, COLLECTION_ADVANCES, advanceId)
    await updateDoc(advanceRef, updates)
  } catch (error) {
    console.error('Erro ao atualizar adiantamento:', error)
    throw error
  }
}

// ========== USER PROFILE ==========

/**
 * Busca perfil de usuário por ID
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const profileDoc = await getDoc(doc(db, COLLECTION_USER_PROFILES, userId))
    if (!profileDoc.exists()) {
      return null
    }

    const data = profileDoc.data()
    return {
      displayName: data.displayName || '',
      fullName: data.fullName || '',
      email: data.email || '',
      cpf: data.cpf || '',
      birthDate: data.birthDate || '',
      phone: data.phone || '',
      bank: data.bank || '',
      agency: data.agency || '',
      account: data.account || '',
      accountType: data.accountType,
      pixKey: data.pixKey || '',
      profileImageUrl: data.profileImageUrl || null,
    }
  } catch (error) {
    console.error('Erro ao buscar perfil do usuário:', error)
    throw error
  }
}

/**
 * Busca role do usuário por email
 */
export async function getUserRoleByEmail(email: string): Promise<UserRole | null> {
  try {
    console.log('🔍 Buscando role por email:', email)
    
    // Normalizar email (trim e lowercase para comparação)
    const normalizedEmail = email.trim().toLowerCase()
    
    const usersQuery = query(
      collection(db, COLLECTION_USERS),
      where('email', '==', email) // Firestore é case-sensitive, então busca exata primeiro
    )

    const snapshot = await getDocs(usersQuery)
    
    console.log('📊 Resultado da busca:', {
      emailBuscado: email,
      documentosEncontrados: snapshot.size,
      documentos: snapshot.docs.map(doc => ({
        id: doc.id,
        email: doc.data().email,
        role: doc.data().role
      }))
    })
    
    if (snapshot.empty) {
      console.warn('⚠️ Nenhum documento encontrado com email exato:', email)
      
      // Tentar buscar todos os usuários e comparar manualmente (fallback)
      console.log('🔄 Tentando busca alternativa (todos os usuários)...')
      const allUsersSnapshot = await getDocs(collection(db, COLLECTION_USERS))
      
      for (const doc of allUsersSnapshot.docs) {
        const userData = doc.data()
        const userEmail = userData.email?.trim().toLowerCase()
        
        if (userEmail === normalizedEmail) {
          console.log('✅ Usuário encontrado na busca alternativa:', {
            id: doc.id,
            email: userData.email,
            role: userData.role
          })
          const role = userData.role as string
          if (role) return role as UserRole
        }
      }
      
      return null
    }

    const userDoc = snapshot.docs[0]
    const userData = userDoc.data()
    const role = userData.role as string
    
    console.log('✅ Role encontrado:', {
      email: userData.email,
      role: role,
      documentoId: userDoc.id
    })
    
    if (!role) {
      console.warn('⚠️ Documento encontrado mas sem campo role')
      return null
    }
    
    return role as UserRole
  } catch (error) {
    console.error('❌ Erro ao buscar role do usuário:', error)
    return null
  }
}

/**
 * Busca role do usuário por ID (pode ser UID do Firebase Auth ou ID do documento)
 */
export async function getUserRoleById(userId: string): Promise<UserRole | null> {
  try {
    // Tentar buscar usando o userId como ID do documento
    const userDoc = await getDoc(doc(db, COLLECTION_USERS, userId))
    if (userDoc.exists()) {
      const role = userDoc.data().role as string
      if (role) return role as UserRole
    }

    // Se não encontrou, tentar buscar por campo 'id' igual ao userId
    const usersQuery = query(
      collection(db, COLLECTION_USERS),
      where('id', '==', userId)
    )
    const snapshot = await getDocs(usersQuery)
    if (!snapshot.empty) {
      const role = snapshot.docs[0].data().role as string
      if (role) return role as UserRole
    }

    return null
  } catch (error) {
    console.error('Erro ao buscar role do usuário:', error)
    return null
  }
}
