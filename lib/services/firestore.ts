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
  Company,
  Project,
} from '@/lib/models/types'

const COLLECTION_REPORTS = 'expense_reports'
const COLLECTION_ADVANCES = 'advances'
const COLLECTION_EXPENSES = 'expenses'
const COLLECTION_USERS = 'users'
const COLLECTION_USER_PROFILES = 'user_profiles'
const COLLECTION_COMPANIES = 'companies'
const COLLECTION_PROJECTS = 'projects'

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
          pdfUri: data.pdfUri || null,
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
    
    // Verificar se há despesas embutidas no documento (como o app Android pode usar)
    const embeddedExpenses = data.expenses || []
    console.log('📋 Despesas no documento do relatório:', {
      reportId,
      quantidade: Array.isArray(embeddedExpenses) ? embeddedExpenses.length : 0,
      tipo: Array.isArray(embeddedExpenses) ? 'array' : typeof embeddedExpenses,
      primeirosIds: Array.isArray(embeddedExpenses) ? embeddedExpenses.slice(0, 10).map((e: any) => {
        if (typeof e === 'string') return e
        if (e && typeof e === 'object') return e.id || e.reportId || 'sem-id'
        return 'tipo-desconhecido'
      }) : null,
      estrutura: Array.isArray(embeddedExpenses) && embeddedExpenses.length > 0 ? 
        (typeof embeddedExpenses[0] === 'object' ? 'objetos' : 'strings/ids') : 'vazio',
      todasAsChaves: Object.keys(data), // Mostrar todas as chaves do documento
      dadosCompletos: data, // Mostrar todos os dados do documento
    })
    
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
      expenses: embeddedExpenses,
      createdByUserId: data.createdByUserId || null,
      createdByUserName: data.createdByUserName || null,
      approverObservations: data.approverObservations || '',
      approvalObservations: data.approvalObservations || '',
      approvedByUserId: data.approvedByUserId || null,
      approvedByUserName: data.approvedByUserName || null,
      statusHistory: data.statusHistory || [],
      createdAtDateTime: data.createdAtDateTime || null,
      pdfUri: data.pdfUri || null,
    }
  } catch (error) {
    console.error('Erro ao buscar relatório:', error)
    throw error
  }
}

/**
 * Busca despesas de um relatório
 * 
 * Segue o padrão do Android: busca por reportId exato usando WHERE reportId = :reportId
 * Tenta variações do reportId como fallback (ex: '52', '00052') caso algumas despesas
 * tenham sido sincronizadas com formato diferente
 * Ordena por data DESC (mais recentes primeiro)
 */
export async function getExpensesByReportId(
  reportId: string
): Promise<Expense[]> {
  try {
    console.log('🔍 Buscando despesas para reportId:', reportId)
    
    // Normalizar reportId para tentar diferentes formatos
    const reportIdVariations: string[] = []
    
    // Adicionar o reportId original
    reportIdVariations.push(reportId)
    
    // Tentar variações numéricas (ex: '52' -> ['52', '00052'])
    const reportIdAsNumber = parseInt(reportId, 10)
    if (!isNaN(reportIdAsNumber)) {
      // Formato sem zeros à esquerda: '52'
      reportIdVariations.push(reportIdAsNumber.toString())
      // Formato com zeros à esquerda (5 dígitos): '00052'
      reportIdVariations.push(reportIdAsNumber.toString().padStart(5, '0'))
    }
    
    // Remover duplicatas
    const uniqueVariations = [...new Set(reportIdVariations)]
    
    console.log('🔍 Tentando variações do reportId:', uniqueVariations)
    
    // Buscar despesas com cada variação do reportId
    const expensesMap = new Map<string, Expense>()
    
    for (const variation of uniqueVariations) {
      try {
        const expensesQuery = query(
          collection(db, COLLECTION_EXPENSES),
          where('reportId', '==', variation)
        )
        
        const snapshot = await getDocs(expensesQuery)
        console.log(`📊 Despesas encontradas com reportId "${variation}":`, snapshot.size)
        
        snapshot.forEach((doc) => {
          const data = doc.data()
          
          // Verificar se já não adicionamos esta despesa
          if (!expensesMap.has(doc.id)) {
            expensesMap.set(doc.id, {
              id: doc.id,
              amount: data.amount || 0,
              expenseType: data.expenseType,
              date: data.date || '',
              paymentMethod: data.paymentMethod,
              reimbursable: data.reimbursable || false,
              projectId: data.projectId || null,
              projectName: data.projectName || null,
              reportId: reportId, // Normalizar para o reportId original
              reportName: data.reportName || null,
              observations: data.observations || '',
              receiptImageUri: data.receiptImageUri || null,
              receiptPdfUri: data.receiptPdfUri || null,
              attachments: data.attachments || [],
              createdByUserId: data.createdByUserId || null,
              createdByUserName: data.createdByUserName || null,
              createdAtDateTime: data.createdAtDateTime || null,
            })
          }
        })
      } catch (err) {
        console.warn(`⚠️ Erro ao buscar com reportId "${variation}":`, err)
      }
    }
    
    // Converter Map para Array
    const expenses = Array.from(expensesMap.values())
    
    // Ordenar por data DESC (mais recentes primeiro) - seguindo padrão do Android
    expenses.sort((a, b) => {
      const dateA = new Date(a.date || a.createdAtDateTime || 0).getTime()
      const dateB = new Date(b.date || b.createdAtDateTime || 0).getTime()
      return dateB - dateA // Descendente
    })
    
    console.log('✅ Total de despesas retornadas:', expenses.length)
    console.log('📋 IDs das despesas encontradas:', expenses.map(e => e.id))
    
    // DEBUG: Buscar todas as despesas esperadas pelo ID para verificar se existem
    const expectedExpenseIds = ['60', '53', '54', '55', '63']
    if (reportId === '52') {
      console.log('🔍 DEBUG: Verificando despesas esperadas para reportId 52...')
      const debugPromises = expectedExpenseIds.map(async (expenseId) => {
        try {
          const expenseDoc = await getDoc(doc(db, COLLECTION_EXPENSES, expenseId))
          if (expenseDoc.exists()) {
            const data = expenseDoc.data()
            console.log(`📋 Despesa ${expenseId}:`, {
              id: expenseDoc.id,
              reportId: data.reportId,
              reportName: data.reportName,
              date: data.date,
              amount: data.amount,
              expenseType: data.expenseType,
            })
            return { id: expenseId, found: true, reportId: data.reportId }
          } else {
            console.log(`❌ Despesa ${expenseId} não encontrada no Firestore`)
            return { id: expenseId, found: false }
          }
        } catch (err) {
          console.error(`❌ Erro ao buscar despesa ${expenseId}:`, err)
          return { id: expenseId, found: false, error: err }
        }
      })
      
      const debugResults = await Promise.all(debugPromises)
      console.log('🔍 DEBUG: Resultados da verificação:', debugResults)
      
      // Se encontramos despesas que não foram incluídas, adicioná-las
      const missingExpenses: Expense[] = []
      for (const result of debugResults) {
        if (result.found && result.reportId) {
          // Verificar se a despesa já está na lista
          if (!expenses.find(e => e.id === result.id)) {
            try {
              const expenseDoc = await getDoc(doc(db, COLLECTION_EXPENSES, result.id))
              if (expenseDoc.exists()) {
                const data = expenseDoc.data()
                missingExpenses.push({
                  id: expenseDoc.id,
                  amount: data.amount || 0,
                  expenseType: data.expenseType,
                  date: data.date || '',
                  paymentMethod: data.paymentMethod,
                  reimbursable: data.reimbursable || false,
                  projectId: data.projectId || null,
                  projectName: data.projectName || null,
                  reportId: reportId, // Normalizar para o reportId original
                  reportName: data.reportName || null,
                  observations: data.observations || '',
                  receiptImageUri: data.receiptImageUri || null,
                  receiptPdfUri: data.receiptPdfUri || null,
                  attachments: data.attachments || [],
                  createdByUserId: data.createdByUserId || null,
                  createdByUserName: data.createdByUserName || null,
                  createdAtDateTime: data.createdAtDateTime || null,
                })
                console.log(`✅ Adicionando despesa ${result.id} que estava faltando`)
              }
            } catch (err) {
              console.error(`❌ Erro ao adicionar despesa ${result.id}:`, err)
            }
          }
        }
      }
      
      if (missingExpenses.length > 0) {
        expenses.push(...missingExpenses)
        // Reordenar após adicionar
        expenses.sort((a, b) => {
          const dateA = new Date(a.date || a.createdAtDateTime || 0).getTime()
          const dateB = new Date(b.date || b.createdAtDateTime || 0).getTime()
          return dateB - dateA
        })
        console.log(`✅ Adicionadas ${missingExpenses.length} despesas que estavam faltando`)
      }
    }
    
    return expenses
  } catch (error) {
    console.error('❌ Erro ao buscar despesas:', error)
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

// ========== COMPANIES ==========

/**
 * Busca uma empresa por ID
 */
export async function getCompanyById(companyId: string): Promise<Company | null> {
  try {
    const companyDoc = await getDoc(doc(db, COLLECTION_COMPANIES, companyId))
    if (!companyDoc.exists()) {
      return null
    }

    const data = companyDoc.data()
    return {
      id: companyDoc.id,
      name: data.name || '',
      cnpj: data.cnpj || '',
      address: data.address || null,
      complement: data.complement || null,
      neighborhood: data.neighborhood || null,
      zipCode: data.zipCode || null,
      state: data.state || null,
      approvalResponsibleName: data.approvalResponsibleName || null,
      approvalResponsibleRole: data.approvalResponsibleRole || null,
      responsible1Name: data.responsible1Name || null,
      responsible1Phone: data.responsible1Phone || null,
      responsible1Email: data.responsible1Email || null,
      responsible2Name: data.responsible2Name || null,
      responsible2Phone: data.responsible2Phone || null,
      responsible2Email: data.responsible2Email || null,
    }
  } catch (error) {
    console.error('Erro ao buscar empresa:', error)
    throw error
  }
}

/**
 * Busca um projeto por ID
 */
export async function getProjectById(projectId: string): Promise<Project | null> {
  try {
    const projectDoc = await getDoc(doc(db, COLLECTION_PROJECTS, projectId))
    if (!projectDoc.exists()) {
      return null
    }

    const data = projectDoc.data()
    return {
      id: projectDoc.id,
      name: data.name || '',
      companyId: data.companyId || '',
      companyName: data.companyName || '',
      companyCnpj: data.companyCnpj || '',
      referenceNumber: data.referenceNumber || null,
      date: data.date || null,
      responsibleName: data.responsibleName || null,
      documentationLink: data.documentationLink || null,
    }
  } catch (error) {
    console.error('Erro ao buscar projeto:', error)
    throw error
  }
}
