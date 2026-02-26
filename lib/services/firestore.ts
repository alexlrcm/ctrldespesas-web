import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  addDoc,
  setDoc,
  deleteDoc,
  Timestamp,
  orderBy,
  writeBatch,
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from '@/lib/firebase/config'
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
  ProjectStatus,
} from '@/lib/models/types'

const COLLECTION_REPORTS = 'expense_reports'
const COLLECTION_ADVANCES = 'advances'
const COLLECTION_EXPENSES = 'expenses'
const COLLECTION_USERS = 'users'
const COLLECTION_USER_PROFILES = 'user_profiles'
const COLLECTION_COMPANIES = 'companies'
const COLLECTION_PROJECTS = 'projects'
const COLLECTION_DELETED_RECORDS = 'deleted_records'

// ========== REPORTS ==========

/**
 * Busca relatórios para o perfil Financeiro:
 * - ANALISE_CONTABIL (para análise inicial)
 * - APROVADO_PARA_PAGAMENTO (para executar pagamento)
 * - Próprios relatórios do usuário (qualquer status)
 */
export async function getFinanceiroReports(
  userId: string,
  isAdmin: boolean = false
): Promise<ExpenseReport[]> {
  try {
    console.log('🔍 Buscando relatórios para Financeiro/Admin, userId:', userId, 'isAdmin:', isAdmin)

    let snapshots = []

    if (isAdmin) {
      // Admin vê todos os relatórios
      const allReportsQuery = query(collection(db, COLLECTION_REPORTS))
      const snapshot = await getDocs(allReportsQuery)
      snapshots = [snapshot]
    } else {
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

      snapshots = [analiseSnapshot, pagamentoSnapshot, ownReportsSnapshot]
    }

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

    snapshots.forEach(processSnapshot)

    // Filtrar relatórios deletados
    const deletedIds = await getDeletedRecordIds()
    const filteredReports = filterDeleted(reports, deletedIds)

    // Remover duplicatas por ID
    const uniqueReports = Array.from(
      new Map(filteredReports.map((r) => [r.id, r])).values()
    )

    // Ordenar por data (mais recente primeiro) em memória
    uniqueReports.sort((a, b) => {
      const dateA = new Date(a.date || a.createdAtDateTime || 0).getTime()
      const dateB = new Date(b.date || b.createdAtDateTime || 0).getTime()
      return dateB - dateA // Descendente
    })

    console.log('✅ Relatórios encontrados (após filtrar, remover duplicatas e ordenar):', uniqueReports.length)

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

    // Verificar se o relatório foi deletado localmente (tombstone)
    const deletedIds = await getDeletedRecordIds()
    if (deletedIds.has(reportId)) {
      console.log('🚫 Relatório ignorado pois consta como deletado:', reportId)
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

    // Filtrar despesas deletadas
    const deletedIds = await getDeletedRecordIds()
    const filteredExpenses = filterDeleted(expenses, deletedIds)

    // Ordenar por data DESC (mais recentes primeiro) - seguindo padrão do Android
    filteredExpenses.sort((a, b) => {
      const dateA = new Date(a.date || a.createdAtDateTime || 0).getTime()
      const dateB = new Date(b.date || b.createdAtDateTime || 0).getTime()
      return dateB - dateA // Descendente
    })

    console.log('✅ Total de despesas retornadas (após filtrar):', filteredExpenses.length)
    console.log('📋 IDs das despesas encontradas:', filteredExpenses.map(e => e.id))

    // DEBUG: Buscar todas as despesas esperadas pelo ID para verificar se existem
    const expectedExpenseIds = ['60', '53', '54', '55', '63']
    if (reportId === '52') {
      console.log('🔍 DEBUG: Verificando despesas esperadas para reportId 52...')
      const debugPromises = expectedExpenseIds.map(async (expenseId) => {
        try {
          if (deletedIds.has(expenseId)) {
            console.log(`🚫 Despesa ${expenseId} ignorada no debug pois consta como deletada`)
            return { id: expenseId, found: false, deleted: true }
          }
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
          if (!filteredExpenses.find(e => e.id === result.id)) {
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
        filteredExpenses.push(...missingExpenses)
        // Reordenar após adicionar
        filteredExpenses.sort((a, b) => {
          const dateA = new Date(a.date || a.createdAtDateTime || 0).getTime()
          const dateB = new Date(b.date || b.createdAtDateTime || 0).getTime()
          return dateB - dateA
        })
        console.log(`✅ Adicionadas ${missingExpenses.length} despesas que estavam faltando`)
      }
    }

    return filteredExpenses
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
export async function getFinanceiroAdvances(
  isAdmin: boolean = false
): Promise<Advance[]> {
  try {
    console.log('🔍 Buscando adiantamentos para Financeiro/Admin, isAdmin:', isAdmin)

    let snapshot
    if (isAdmin) {
      // Admin vê todos os adiantamentos
      snapshot = await getDocs(collection(db, COLLECTION_ADVANCES)).catch(err => {
        console.error('Erro ao buscar adiantamentos (Admin):', err)
        return { docs: [], size: 0, empty: true } as any
      })
    } else {
      const q = query(
        collection(db, COLLECTION_ADVANCES),
        where('status', '==', AdvanceStatus.PAGAMENTO_APROVADO)
      )
      snapshot = await getDocs(q).catch(err => {
        console.error('Erro ao buscar adiantamentos (Financeiro):', err)
        return { docs: [], size: 0, empty: true } as any
      })
    }

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

    // Filtrar adiantamentos deletados
    const deletedIds = await getDeletedRecordIds()
    const filteredAdvances = filterDeleted(advances, deletedIds)

    // Ordenar por data de criação (mais recente primeiro) em memória
    filteredAdvances.sort((a, b) => {
      const dateA = new Date(a.createdAtDateTime || 0).getTime()
      const dateB = new Date(b.createdAtDateTime || 0).getTime()
      return dateB - dateA // Descendente
    })

    console.log('✅ Adiantamentos encontrados (filtrados):', filteredAdvances.length)

    return filteredAdvances
  } catch (error) {
    console.error('❌ Erro ao buscar adiantamentos do Financeiro:', error)
    throw error
  }
}

/**
 * Busca todos os adiantamentos vinculados a um relatório por reportId
 */
export async function getAdvancesByReportId(reportId: string): Promise<Advance[]> {
  try {
    if (!reportId) {
      console.warn('⚠️ reportId não fornecido para busca de adiantamentos')
      return []
    }

    console.log('🔍 Buscando adiantamentos para reportId:', reportId)

    const advancesQuery = query(
      collection(db, COLLECTION_ADVANCES),
      where('reportId', '==', reportId)
    )

    const snapshot = await getDocs(advancesQuery)

    console.log('📊 Total de documentos encontrados:', snapshot.size)

    const advances: Advance[] = []

    snapshot.forEach((doc: any) => {
      const data = doc.data()
      console.log('📄 Adiantamento encontrado:', {
        id: doc.id,
        name: data.name,
        reportId: data.reportId,
        status: data.status
      })

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

    // Filtrar adiantamentos deletados
    const deletedIds = await getDeletedRecordIds()
    const filteredAdvances = filterDeleted(advances, deletedIds)

    // Ordenar por data de criação (mais recente primeiro) em memória
    filteredAdvances.sort((a, b) => {
      const dateA = new Date(a.createdAtDateTime || 0).getTime()
      const dateB = new Date(b.createdAtDateTime || 0).getTime()
      return dateB - dateA // Descendente
    })

    console.log('✅ Adiantamentos encontrados para reportId (filtrados):', filteredAdvances.length, filteredAdvances.map(a => ({ id: a.id, name: a.name })))

    return filteredAdvances
  } catch (error: any) {
    console.error('❌ Erro ao buscar adiantamentos por reportId:', error)
    console.error('Detalhes do erro:', {
      message: error.message,
      code: error.code,
      reportId
    })
    // Retornar array vazio em caso de erro para não quebrar a UI
    return []
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
 * Atualiza o perfil do usuário
 */
export async function updateUserProfile(
  userId: string,
  profile: Partial<UserProfile>
): Promise<void> {
  try {
    const profileRef = doc(db, COLLECTION_USER_PROFILES, userId)
    const profileDoc = await getDoc(profileRef)

    if (profileDoc.exists()) {
      await updateDoc(profileRef, profile as any)
    } else {
      await setDoc(profileRef, {
        ...profile,
        profileImageUrl: null,
      })
    }
  } catch (error) {
    console.error('Erro ao atualizar perfil do usuário:', error)
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

/**
 * Busca todos os usuários cadastrados (coleção users)
 */
export async function getAllUsers(): Promise<any[]> {
  try {
    const snapshot = await getDocs(collection(db, COLLECTION_USERS))
    return snapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Erro ao buscar todos os usuários:', error)
    throw error
  }
}

/**
 * Busca todos os perfis de usuários (coleção user_profiles)
 */
export async function getAllUserProfiles(): Promise<Record<string, UserProfile>> {
  try {
    const snapshot = await getDocs(collection(db, COLLECTION_USER_PROFILES))
    const profiles: Record<string, UserProfile> = {}
    snapshot.docs.forEach(doc => {
      profiles[doc.id] = doc.data() as UserProfile
    })
    return profiles
  } catch (error) {
    console.error('Erro ao buscar perfis:', error)
    throw error
  }
}

/**
 * Atualiza o papel de um usuário
 */
export async function updateUserRole(userId: string, newRole: UserRole): Promise<void> {
  try {
    // Tentar atualizar por ID do documento
    const userRef = doc(db, COLLECTION_USERS, userId)
    await updateDoc(userRef, { role: newRole })
  } catch (error) {
    console.error('Erro ao atualizar papel do usuário:', error)
    throw error
  }
}

// ========== COMPANIES ==========

/**
 * Busca uma empresa por ID
 */
export async function getCompanyById(companyId: string): Promise<Company | null> {
  try {
    const docRef = doc(db, COLLECTION_COMPANIES, companyId)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Company
    }
    return null
  } catch (error) {
    console.error('Erro ao buscar empresa por ID:', error)
    throw error
  }
}

/**
 * Cria uma nova empresa
 */
export async function createCompany(company: Omit<Company, 'id'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_COMPANIES), {
      ...company,
      createdAt: Timestamp.now(),
    })
    return docRef.id
  } catch (error) {
    console.error('Erro ao criar empresa:', error)
    throw error
  }
}

/**
 * Atualiza uma empresa existente
 */
export async function updateCompany(
  companyId: string,
  updates: Partial<Company>
): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_COMPANIES, companyId)
    await updateDoc(docRef, updates)
  } catch (error) {
    console.error('Erro ao atualizar empresa:', error)
    throw error
  }
}

/**
 * Deleta uma empresa
 */
export async function deleteCompany(companyId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, COLLECTION_COMPANIES, companyId))
  } catch (error) {
    console.error('Erro ao deletar empresa:', error)
    throw error
  }
}

// Busca um projeto por ID
export async function getProjectById(projectId: string): Promise<Project | null> {
  try {
    const docRef = doc(db, COLLECTION_PROJECTS, projectId)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const data = docSnap.data()
      // Obter status do Firestore, ou usar ATIVO como padrão para projetos existentes
      const statusString = data.status || 'ATIVO'
      let status: ProjectStatus
      try {
        status = statusString as ProjectStatus
        // Validar se o status é válido
        if (!Object.values(ProjectStatus).includes(status)) {
          status = ProjectStatus.ATIVO
        }
      } catch {
        status = ProjectStatus.ATIVO
      }
      return {
        id: docSnap.id,
        name: data.name || '',
        companyId: data.companyId || '',
        companyName: data.companyName || '',
        companyCnpj: data.companyCnpj || '',
        referenceNumber: data.referenceNumber || null,
        date: data.date || null,
        responsibleName: data.responsibleName || null,
        documentationLink: data.documentationLink || null,
        status: status,
        observation: data.observation || null,
      } as Project
    }
    return null
  } catch (error) {
    console.error('Erro ao buscar projeto por ID:', error)
    throw error
  }
}

/**
 * Cria um novo projeto
 */
export async function createProject(project: Omit<Project, 'id'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_PROJECTS), {
      ...project,
      createdAt: Timestamp.now(),
    })
    return docRef.id
  } catch (error) {
    console.error('Erro ao criar projeto:', error)
    throw error
  }
}

/**
 * Atualiza um projeto existente
 */
export async function updateProject(
  projectId: string,
  updates: Partial<Project>
): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_PROJECTS, projectId)
    await updateDoc(docRef, updates)
  } catch (error) {
    console.error('Erro ao atualizar projeto:', error)
    throw error
  }
}

/**
 * Deleta um projeto
 */
export async function deleteProject(projectId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, COLLECTION_PROJECTS, projectId))
  } catch (error) {
    console.error('Erro ao deletar projeto:', error)
    throw error
  }
}

// ========== OPERADOR ==========

/**
 * Busca todas as empresas
 */
export async function getAllCompanies(): Promise<Company[]> {
  try {
    const snapshot = await getDocs(collection(db, COLLECTION_COMPANIES))
    return snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
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
    })
  } catch (error) {
    console.error('Erro ao buscar empresas:', error)
    throw error
  }
}

/**
 * Busca todos os projetos
 */
export async function getAllProjects(): Promise<Project[]> {
  try {
    const snapshot = await getDocs(collection(db, COLLECTION_PROJECTS))
    return snapshot.docs.map((doc) => {
      const data = doc.data()
      // Obter status do Firestore, ou usar ATIVO como padrão para projetos existentes
      const statusString = data.status || 'ATIVO'
      let status: ProjectStatus
      try {
        status = statusString as ProjectStatus
        // Validar se o status é válido
        if (!Object.values(ProjectStatus).includes(status)) {
          status = ProjectStatus.ATIVO
        }
      } catch {
        status = ProjectStatus.ATIVO
      }
      return {
        id: doc.id,
        name: data.name || '',
        companyId: data.companyId || '',
        companyName: data.companyName || '',
        companyCnpj: data.companyCnpj || '',
        referenceNumber: data.referenceNumber || null,
        date: data.date || null,
        responsibleName: data.responsibleName || null,
        documentationLink: data.documentationLink || null,
        status: status,
        observation: data.observation || null,
      }
    })
  } catch (error) {
    console.error('Erro ao buscar projetos:', error)
    throw error
  }
}

/**
 * Busca despesas sem relatório do OPERADOR
 */
export async function getOperadorExpensesWithoutReport(
  userId: string,
  isAdmin: boolean = false
): Promise<Expense[]> {
  try {
    let expensesQuery
    if (isAdmin) {
      // Admin vê todas as despesas sem relatório
      expensesQuery = query(
        collection(db, COLLECTION_EXPENSES),
        where('reportId', '==', null)
      )
    } else {
      expensesQuery = query(
        collection(db, COLLECTION_EXPENSES),
        where('createdByUserId', '==', userId),
        where('reportId', '==', null)
      )
    }

    const snapshot = await getDocs(expensesQuery)
    const expenses = snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
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
      }
    })

    // Filtrar despesas deletadas
    const deletedIds = await getDeletedRecordIds()
    return filterDeleted(expenses, deletedIds)
  } catch (error) {
    console.error('Erro ao buscar despesas sem relatório:', error)
    throw error
  }
}

/**
 * Busca relatórios do OPERADOR
 */
export async function getOperadorReports(
  userId: string,
  isAdmin: boolean = false
): Promise<ExpenseReport[]> {
  try {
    let reportsQuery
    if (isAdmin) {
      // Admin vê todos os relatórios
      reportsQuery = query(collection(db, COLLECTION_REPORTS))
    } else {
      reportsQuery = query(
        collection(db, COLLECTION_REPORTS),
        where('createdByUserId', '==', userId)
      )
    }

    const snapshot = await getDocs(reportsQuery)
    const reports: ExpenseReport[] = []

    for (const doc of snapshot.docs) {
      const data = doc.data()
      const expenses = await getExpensesByReportId(doc.id)

      reports.push({
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
        expenses: expenses,
        createdByUserId: data.createdByUserId || null,
        createdByUserName: data.createdByUserName || null,
        approverObservations: data.approverObservations || '',
        approvalObservations: data.approvalObservations || '',
        approvedByUserId: data.approvedByUserId || null,
        approvedByUserName: data.approvedByUserName || null,
        statusHistory: (data.statusHistory || []).map((sh: any) => ({
          status: sh.status,
          date: sh.date,
          changedBy: sh.changedBy || null,
          observations: sh.observations || '',
        })),
        createdAtDateTime: data.createdAtDateTime || null,
        pdfUri: data.pdfUri || null,
      })
    }

    // Filtrar relatórios deletados
    const deletedIds = await getDeletedRecordIds()
    return filterDeleted(reports, deletedIds)
  } catch (error) {
    console.error('Erro ao buscar relatórios do OPERADOR:', error)
    throw error
  }
}

/**
 * Busca adiantamentos do OPERADOR
 */
export async function getOperadorAdvances(
  userId: string,
  isAdmin: boolean = false
): Promise<Advance[]> {
  try {
    let advancesQuery
    if (isAdmin) {
      // Admin vê todos os adiantamentos
      advancesQuery = query(collection(db, COLLECTION_ADVANCES))
    } else {
      advancesQuery = query(
        collection(db, COLLECTION_ADVANCES),
        where('createdByUserId', '==', userId)
      )
    }

    const snapshot = await getDocs(advancesQuery)
    const advances = snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
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
        statusHistory: (data.statusHistory || []).map((sh: any) => ({
          status: sh.status,
          date: sh.date,
          changedBy: sh.changedBy || null,
          observations: sh.observations || '',
        })),
      }
    })

    // Filtrar adiantamentos deletados
    const deletedIds = await getDeletedRecordIds()
    return filterDeleted(advances, deletedIds)
  } catch (error) {
    console.error('Erro ao buscar adiantamentos do OPERADOR:', error)
    throw error
  }
}

/**
 * Cria uma nova despesa
 */
export async function createExpense(
  expense: Omit<Expense, 'id'>
): Promise<string> {
  try {
    const expenseData = {
      ...expense,
      createdAtDateTime: expense.createdAtDateTime || new Date().toISOString(),
    }

    const docRef = await addDoc(collection(db, COLLECTION_EXPENSES), expenseData)
    return docRef.id
  } catch (error) {
    console.error('Erro ao criar despesa:', error)
    throw error
  }
}

/**
 * Atualiza uma despesa existente
 */
export async function updateExpense(
  expenseId: string,
  expense: Partial<Expense>
): Promise<void> {
  try {
    const expenseRef = doc(db, COLLECTION_EXPENSES, expenseId)
    await updateDoc(expenseRef, expense as any)
  } catch (error) {
    console.error('Erro ao atualizar despesa:', error)
    throw error
  }
}

/**
 * Deleta uma despesa e rastreia a exclusão
 */
export async function deleteExpense(expenseId: string): Promise<void> {
  try {
    await trackDeletedRecord(expenseId, 'EXPENSE')
    await deleteDoc(doc(db, COLLECTION_EXPENSES, expenseId))
  } catch (error) {
    console.error('Erro ao deletar despesa:', error)
    throw error
  }
}

/**
 * Registra o ID de um registro excluído para evitar que reapareça (tombstone)
 */
export async function trackDeletedRecord(id: string, type: string): Promise<void> {
  try {
    await setDoc(doc(db, COLLECTION_DELETED_RECORDS, id), {
      id,
      type,
      deletedAt: Timestamp.now()
    })
  } catch (error) {
    console.error('Erro ao rastrear registro deletado:', error)
  }
}

/**
 * Busca todos os IDs de registros deletados
 */
export async function getDeletedRecordIds(): Promise<Set<string>> {
  try {
    const snapshot = await getDocs(collection(db, COLLECTION_DELETED_RECORDS))
    return new Set(snapshot.docs.map((doc) => doc.id))
  } catch (error) {
    console.error('Erro ao buscar IDs deletados:', error)
    return new Set()
  }
}

/**
 * Remove itens cujos IDs constam na lista de deletados (tombstones)
 */
function filterDeleted<T extends { id: string }>(
  items: T[],
  deletedIds: Set<string>
): T[] {
  return items.filter((item) => !deletedIds.has(item.id))
}

/**
 * Cria um novo relatório
 */
export async function createReport(
  report: Omit<ExpenseReport, 'id'>
): Promise<string> {
  try {
    const reportData = {
      ...report,
      expenses: [], // Expenses são armazenados separadamente
      statusHistory: report.statusHistory || [],
      createdAtDateTime: report.createdAtDateTime || new Date().toISOString(),
    }

    const docRef = await addDoc(collection(db, COLLECTION_REPORTS), reportData)
    return docRef.id
  } catch (error) {
    console.error('Erro ao criar relatório:', error)
    throw error
  }
}

/**
 * Atualiza um relatório existente
 */
export async function updateReportOperador(
  reportId: string,
  report: Partial<ExpenseReport>
): Promise<void> {
  try {
    const reportRef = doc(db, COLLECTION_REPORTS, reportId)
    const updateData: any = { ...report }
    // Não atualizar expenses diretamente (são armazenados separadamente)
    delete updateData.expenses
    await updateDoc(reportRef, updateData)
  } catch (error) {
    console.error('Erro ao atualizar relatório:', error)
    throw error
  }
}

/**
 * Cria um novo adiantamento
 */
export async function createAdvance(
  advance: Omit<Advance, 'id'>
): Promise<string> {
  try {
    const advanceData = {
      ...advance,
      statusHistory: advance.statusHistory || [],
      createdAtDateTime: advance.createdAtDateTime || new Date().toISOString(),
    }

    const docRef = await addDoc(collection(db, COLLECTION_ADVANCES), advanceData)
    return docRef.id
  } catch (error) {
    console.error('Erro ao criar adiantamento:', error)
    throw error
  }
}

/**
 * Atualiza um adiantamento existente
 */
export async function updateAdvanceOperador(
  advanceId: string,
  advance: Partial<Advance>
): Promise<void> {
  try {
    const advanceRef = doc(db, COLLECTION_ADVANCES, advanceId)
    await updateDoc(advanceRef, advance as any)
  } catch (error) {
    console.error('Erro ao atualizar adiantamento:', error)
    throw error
  }
}

/**
 * Busca uma despesa por ID
 */
export async function getExpenseById(expenseId: string): Promise<Expense | null> {
  try {
    const expenseDoc = await getDoc(doc(db, COLLECTION_EXPENSES, expenseId))
    if (!expenseDoc.exists()) {
      return null
    }

    // Verificar se a despesa foi deletada localmente (tombstone)
    const deletedIds = await getDeletedRecordIds()
    if (deletedIds.has(expenseId)) {
      console.log('🚫 Despesa ignorada pois consta como deletada:', expenseId)
      return null
    }

    const data = expenseDoc.data()
    return {
      id: expenseDoc.id,
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
    }
  } catch (error) {
    console.error('Erro ao buscar despesa:', error)
    throw error
  }
}

/**
 * Busca um adiantamento por ID
 */
export async function getAdvanceById(advanceId: string): Promise<Advance | null> {
  try {
    const advanceDoc = await getDoc(doc(db, COLLECTION_ADVANCES, advanceId))
    if (!advanceDoc.exists()) {
      return null
    }

    // Verificar se o adiantamento foi deletado localmente (tombstone)
    const deletedIds = await getDeletedRecordIds()
    if (deletedIds.has(advanceId)) {
      console.log('🚫 Adiantamento ignorado pois consta como deletado:', advanceId)
      return null
    }

    const data = advanceDoc.data()
    return {
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
      statusHistory: (data.statusHistory || []).map((sh: any) => ({
        status: sh.status,
        date: sh.date,
        changedBy: sh.changedBy || null,
        observations: sh.observations || '',
      })),
    }
  } catch (error) {
    console.error('Erro ao buscar adiantamento:', error)
    throw error
  }
}

// ========== FILE UPLOAD ==========

/**
 * Faz upload de um arquivo para Firebase Storage
 */
export async function uploadFile(
  file: File,
  expenseId: string,
  fileName?: string
): Promise<string> {
  try {
    const finalFileName = fileName || file.name
    const storageRef = ref(storage, `expense_receipts/${expenseId}/${finalFileName}`)

    await uploadBytes(storageRef, file)
    const downloadURL = await getDownloadURL(storageRef)

    return downloadURL
  } catch (error) {
    console.error('Erro ao fazer upload do arquivo:', error)
    throw error
  }
}

/**
 * Atualiza o reportId de múltiplas despesas
 */
export async function updateExpensesReportId(
  expenseIds: string[],
  reportId: string,
  reportName: string
): Promise<void> {
  try {
    const batch = writeBatch(db)

    for (const expenseId of expenseIds) {
      const expenseRef = doc(db, COLLECTION_EXPENSES, expenseId)
      batch.update(expenseRef, {
        reportId,
        reportName,
      })
    }

    await batch.commit()
  } catch (error) {
    console.error('Erro ao atualizar reportId das despesas:', error)
    throw error
  }
}

/**
 * Remove despesas de um relatório (limpa reportId)
 */
export async function removeExpensesFromReport(
  expenseIds: string[]
): Promise<void> {
  try {
    const batch = writeBatch(db)

    for (const expenseId of expenseIds) {
      const expenseRef = doc(db, COLLECTION_EXPENSES, expenseId)
      batch.update(expenseRef, {
        reportId: null,
        reportName: null,
      })
    }

    await batch.commit()
  } catch (error) {
    console.error('Erro ao remover despesas do relatório:', error)
    throw error
  }
}

/**
 * Envia relatório para análise (muda status para ANALISE_CONTABIL)
 */
export async function submitReport(
  reportId: string,
  changedBy: string
): Promise<void> {
  try {
    const reportRef = doc(db, COLLECTION_REPORTS, reportId)
    const reportDoc = await getDoc(reportRef)

    if (!reportDoc.exists()) {
      throw new Error('Relatório não encontrado')
    }

    const currentData = reportDoc.data()
    const currentHistory = currentData.statusHistory || []

    const dateFormat = new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

    const newHistoryEntry = {
      status: ReportStatus.ANALISE_CONTABIL,
      date: dateFormat.format(new Date()),
      changedBy,
      observations: '',
    }

    await updateDoc(reportRef, {
      status: ReportStatus.ANALISE_CONTABIL,
      statusHistory: [...currentHistory, newHistoryEntry],
    })
  } catch (error) {
    console.error('Erro ao enviar relatório:', error)
    throw error
  }
}
