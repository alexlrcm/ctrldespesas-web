'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { ProcessingModal } from '@/components/ProcessingModal'
import { useAuthContext } from '@/contexts/AuthContext'
import { useFinanceiro } from '@/hooks/useFinanceiro'
import { useOperador } from '@/hooks/useOperador'
import { useUserRole } from '@/hooks/useUserRole'
import { ExpenseReport, ReportStatus, Expense, PaymentMethod, Advance, UserProfile, AccountType, AdvanceReason, AdvanceStatus, Company, Project, UserRole } from '@/lib/models/types'
import { doc, getDoc, collection, query, where, getDocs, updateDoc } from 'firebase/firestore'
import { db, storage } from '@/lib/firebase/config'
import { getUserProfile, getCompanyById, getProjectById, updateExpensesReportId, submitReport, getOperadorExpensesWithoutReport, getAdvancesByReportId, getAdvanceById } from '@/lib/services/firestore'
import { ref, getDownloadURL } from 'firebase/storage'
import { toast } from 'react-toastify'
import { generateReportPdf, uploadPdfToStorage } from '@/lib/utils/pdfGenerator'
import { prepareEmailForSending, openEmailClient, copyEmailToClipboard, prepareAttachmentsForEmail, downloadAllAttachments } from '@/lib/utils/emailService'

export const dynamicParams = true

export default function ReportDetailPage() {
  const router = useRouter()
  const params = useParams()
  const reportId = params?.id as string
  const { user } = useAuthContext()
  const { role, isOperador, isFinanceiro } = useUserRole()
  const { loadReportDetails, approveReport, rejectReport, confirmPayment, rejectPayment, loadCreatorProfile } = useFinanceiro()
  const operadorData = useOperador()

  const [report, setReport] = useState<ExpenseReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState(0) // 0: Despesas, 1: Adiantamentos, 2: Histórico, 3: Colaborador, 4: Dados do Cliente
  const [showApproveDialog, setShowApproveDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [showAddExpensesDialog, setShowAddExpensesDialog] = useState(false)
  const [showSubmitDialog, setShowSubmitDialog] = useState(false)
  const [observations, setObservations] = useState('')
  const [sendingEmail, setSendingEmail] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null)
  const [showReceiptModal, setShowReceiptModal] = useState(false)
  const [showExpenseDetailsModal, setShowExpenseDetailsModal] = useState(false)
  const [advances, setAdvances] = useState<Advance[]>([])
  const [creatorProfile, setCreatorProfile] = useState<UserProfile | null>(null)
  const [company, setCompany] = useState<Company | null>(null)
  const [project, setProject] = useState<Project | null>(null)
  const [loadingAdvance, setLoadingAdvance] = useState(false)
  const [loadingProfile, setLoadingProfile] = useState(false)
  const [loadingCompany, setLoadingCompany] = useState(false)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [loadingPdf, setLoadingPdf] = useState(false)
  const [pdfError, setPdfError] = useState<string | null>(null)
  const [selectedExpensesToAdd, setSelectedExpensesToAdd] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  
  // Estados para opções de envio
  const [sendEmailDetails, setSendEmailDetails] = useState(false)
  const [sendPdfByEmail, setSendPdfByEmail] = useState(false)
  
  // Estados para diálogo de PDF
  const [showPdfDialog, setShowPdfDialog] = useState(false)
  const [includeExpenseDetails, setIncludeExpenseDetails] = useState(true)
  const [includeAttachments, setIncludeAttachments] = useState(false)
  const [rdParaCliente, setRdParaCliente] = useState(false)
  const [generatingPdf, setGeneratingPdf] = useState(false)
  
  // Estados para modal de processamento
  const [showProcessingModal, setShowProcessingModal] = useState(false)
  const [processingStep, setProcessingStep] = useState('')
  const [processingProgress, setProcessingProgress] = useState(0)

  useEffect(() => {
    if (!reportId) return

    let cancelled = false

    const loadReport = async () => {
      try {
        setLoading(true)
        const reportData = await loadReportDetails(reportId)
        if (!cancelled) {
          setReport(reportData)
          
          // Carregar todos os adiantamentos vinculados ao relatório
          setLoadingAdvance(true)
          try {
            console.log('🔄 Carregando adiantamentos para reportId:', reportId)
            const reportAdvances = await getAdvancesByReportId(reportId)
            console.log('📋 Adiantamentos encontrados por reportId:', reportAdvances.length, reportAdvances)
            
            // Também buscar por advanceId se o relatório tiver um advanceId
            let allAdvances = [...reportAdvances]
            if (reportData?.advanceId) {
              console.log('🔍 Relatório tem advanceId:', reportData.advanceId)
              try {
                const advanceById = await getAdvanceById(reportData.advanceId)
                if (advanceById && !allAdvances.find(a => a.id === advanceById.id)) {
                  console.log('➕ Adicionando adiantamento encontrado por advanceId:', advanceById.id)
                  allAdvances.push(advanceById)
                }
              } catch (err: any) {
                console.warn('⚠️ Erro ao buscar adiantamento por advanceId:', err)
              }
            }
            
            console.log('✅ Total de adiantamentos carregados:', allAdvances.length, allAdvances)
            if (!cancelled) {
              setAdvances(allAdvances)
            }
          } catch (err: any) {
            console.error('❌ Erro ao carregar adiantamentos:', err)
            if (!cancelled) {
              setAdvances([])
            }
          } finally {
            if (!cancelled) {
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

          // Carregar dados do projeto e empresa vinculada
          if (reportData?.projectId) {
            setLoadingCompany(true)
            try {
              const projectData = await getProjectById(reportData.projectId)
              if (projectData) {
                if (!cancelled) {
                  setProject(projectData as Project)
                }
                if (projectData.companyId) {
                  const companyData = await getCompanyById(projectData.companyId)
                  if (!cancelled) {
                    setCompany(companyData)
                  }
                }
              }
            } catch (err: any) {
              console.error('Erro ao carregar dados do projeto/empresa:', err)
            } finally {
              setLoadingCompany(false)
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

  // Carregar URL do PDF quando o relatório tiver pdfUri
  useEffect(() => {
    if (!report?.pdfUri) {
      setPdfUrl(null)
      setPdfError(null)
      return
    }

    let cancelled = false

    const loadPdfUrl = async () => {
      try {
        setLoadingPdf(true)
        setPdfError(null)
        // pdfUri é o nome do arquivo (ex: "relatorio_123.pdf")
        // O arquivo está em pdf_reports/ no Firebase Storage
        const pdfPath = `pdf_reports/${report.pdfUri}`
        const pdfRef = ref(storage, pdfPath)
        const url = await getDownloadURL(pdfRef)
        if (!cancelled) {
          setPdfUrl(url)
        }
      } catch (error: any) {
        console.error('Erro ao carregar URL do PDF:', error)
        if (!cancelled) {
          setPdfUrl(null)
          // Mostrar erro apenas se não for erro de arquivo não encontrado
          if (error?.code !== 'storage/object-not-found') {
            setPdfError('Erro ao carregar PDF')
          } else {
            setPdfError('PDF não encontrado')
          }
        }
      } finally {
        if (!cancelled) {
          setLoadingPdf(false)
        }
      }
    }

    loadPdfUrl()

    return () => {
      cancelled = true
    }
  }, [report?.pdfUri])

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
      case ReportStatus.PENDENTE:
        return 'bg-orange-100 text-orange-800' // Laranja
      case ReportStatus.ANALISE_CONTABIL:
        return 'bg-purple-100 text-purple-800' // Roxo
      case ReportStatus.FINANCEIRO_APROVADO:
        return 'bg-blue-100 text-blue-800' // Azul
      case ReportStatus.APROVADO_PARA_PAGAMENTO:
        return 'bg-blue-100 text-blue-500' // Azul Claro
      case ReportStatus.PAGAMENTO_EFETUADO:
        return 'bg-green-100 text-green-800' // Verde
      case ReportStatus.REJEITADO:
        return 'bg-red-100 text-red-800' // Vermelho
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Função para obter cor de fundo do histórico (com alpha)
  const getHistoryStatusBgColor = (status: ReportStatus) => {
    switch (status) {
      case ReportStatus.PENDENTE:
        return 'bg-orange-50 border-orange-300' // Laranja
      case ReportStatus.ANALISE_CONTABIL:
        return 'bg-purple-50 border-purple-300' // Roxo
      case ReportStatus.FINANCEIRO_APROVADO:
        return 'bg-blue-50 border-blue-400' // Azul
      case ReportStatus.APROVADO_PARA_PAGAMENTO:
        return 'bg-blue-50 border-blue-300' // Azul Claro
      case ReportStatus.PAGAMENTO_EFETUADO:
        return 'bg-green-50 border-green-300' // Verde
      case ReportStatus.REJEITADO:
        return 'bg-red-50 border-red-300' // Vermelho
      default:
        return 'bg-gray-50 border-gray-300'
    }
  }

  // Função para obter cor do texto do histórico
  const getHistoryStatusTextColor = (status: ReportStatus) => {
    switch (status) {
      case ReportStatus.PENDENTE:
        return 'text-orange-800' // Laranja
      case ReportStatus.ANALISE_CONTABIL:
        return 'text-purple-800' // Roxo
      case ReportStatus.FINANCEIRO_APROVADO:
        return 'text-blue-800' // Azul
      case ReportStatus.APROVADO_PARA_PAGAMENTO:
        return 'text-blue-500' // Azul Claro
      case ReportStatus.PAGAMENTO_EFETUADO:
        return 'text-green-800' // Verde
      case ReportStatus.REJEITADO:
        return 'text-red-800' // Vermelho
      default:
        return 'text-gray-800'
    }
  }

  const getStatusLabel = (status: ReportStatus) => {
    switch (status) {
      case ReportStatus.PENDENTE:
        return 'Pendente'
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

  // Funções auxiliares para extrair informações específicas das observações
  const parseExpenseDetails = (expense: Expense) => {
    const observations = expense.observations || ''
    const lines = observations.split('\n').map(line => line.trim()).filter(line => line)
    
    const isQuilometragem = expense.expenseType === 'TRANSPORTE' && 
                            observations.includes('Tipo: Transporte - Quilometragem')
    
    const transportSubtype = expense.expenseType === 'TRANSPORTE' && !isQuilometragem
      ? lines.find(line => line.startsWith('Tipo: Transporte - '))?.substring('Tipo: Transporte - '.length).trim() || null
      : null
    
    const details: {
      transportSubtype?: string | null
      originAddress?: string
      destinationAddress?: string
      initialKm?: string
      finalKm?: string
      totalKm?: string
      kmValue?: string
      travelPurpose?: string
      hotelName?: string
      checkIn?: string
      checkOut?: string
      cleanedObservations: string
    } = {
      cleanedObservations: observations
    }
    
    if (isQuilometragem) {
      // Extrair informações de quilometragem
      lines.forEach(line => {
        if (line.startsWith('Local Origem:')) {
          details.originAddress = line.substring('Local Origem:'.length).trim()
        } else if (line.startsWith('Local Destino:')) {
          details.destinationAddress = line.substring('Local Destino:'.length).trim()
        } else if (line.startsWith('KM Inicial:')) {
          details.initialKm = line.substring('KM Inicial:'.length).trim()
        } else if (line.startsWith('KM Destino:')) {
          details.finalKm = line.substring('KM Destino:'.length).trim()
        } else if (line.startsWith('KM Total:')) {
          details.totalKm = line.substring('KM Total:'.length).trim()
        } else if (line.startsWith('Valor por KM:')) {
          details.kmValue = line.substring('Valor por KM:'.length).trim()
        } else if (line.startsWith('Objetivo:')) {
          details.travelPurpose = line.substring('Objetivo:'.length).trim()
        }
      })
    } else if (transportSubtype) {
      // Atribuir subtipo de transporte
      details.transportSubtype = transportSubtype
    }
    
    if (expense.expenseType === 'HOSPEDAGEM') {
      // Extrair informações de hospedagem
      lines.forEach(line => {
        if (line.startsWith('Hotel:')) {
          details.hotelName = line.substring('Hotel:'.length).trim()
        } else if (line.startsWith('Check-in:')) {
          details.checkIn = line.substring('Check-in:'.length).trim()
        } else if (line.startsWith('Check-out:')) {
          details.checkOut = line.substring('Check-out:'.length).trim()
        }
      })
    }
    
    // Remover todas as linhas específicas das observações
    details.cleanedObservations = lines
      .filter(line => 
        !line.startsWith('Tipo: Transporte -') &&
        !line.startsWith('Local Origem:') &&
        !line.startsWith('Local Destino:') &&
        !line.startsWith('KM ') &&
        !line.startsWith('Valor por KM:') &&
        !line.startsWith('Objetivo:') &&
        !line.startsWith('Hotel:') &&
        !line.startsWith('Check-in:') &&
        !line.startsWith('Check-out:')
      )
      .join('\n')
    
    return details
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

  const handleAddExpenses = async () => {
    if (!report || selectedExpensesToAdd.length === 0) return

    try {
      setSubmitting(true)
      await updateExpensesReportId(selectedExpensesToAdd, report.id, report.name)
      
      // Recarregar relatório
      const updatedReport = await loadReportDetails(report.id)
      setReport(updatedReport)
      setShowAddExpensesDialog(false)
      setSelectedExpensesToAdd([])
      toast.success('Despesas adicionadas ao relatório!')
    } catch (error: any) {
      console.error('Erro ao adicionar despesas:', error)
      toast.error('Erro ao adicionar despesas: ' + error.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmitReport = async () => {
    if (!report || !user) return

    try {
      setSubmitting(true)
      setShowSubmitDialog(false)
      
      // Se PDF está marcado para envio (com ou sem detalhes), abrir diálogo de PDF primeiro
      if (sendPdfByEmail) {
        setShowPdfDialog(true)
        setSubmitting(false) // Resetar submitting para permitir que o diálogo de PDF funcione
        return
      }
      
      // Mostrar modal de processamento
      setShowProcessingModal(true)
      setProcessingProgress(0)
      setProcessingStep('Preparando envio do relatório...')
      
      const userName = creatorProfile?.fullName || creatorProfile?.displayName || user.email?.split('@')[0] || 'Operador'
      
      // Enviar relatório
      setProcessingStep('Atualizando status do relatório...')
      setProcessingProgress(20)
      await submitReport(report.id, userName)
      
      // Enviar email com detalhes se solicitado
      if (sendEmailDetails) {
        setProcessingStep('Preparando email com detalhes...')
        setProcessingProgress(40)
        
        // Buscar emails dos usuários FINANCEIRO
        const financeiroQuery = query(
          collection(db, 'users'),
          where('role', '==', UserRole.FINANCEIRO)
        )
        const financeiroSnapshot = await getDocs(financeiroQuery)
        const financeiroEmails = financeiroSnapshot.docs
          .map((doc) => doc.data().email)
          .filter((email): email is string => Boolean(email))
        
        if (financeiroEmails.length > 0) {
          setProcessingStep('Gerando links de comprovantes...')
          setProcessingProgress(60)
          
          // Gerar links de comprovantes
          const emailData = await prepareEmailForSending(report, report.expenses, {
            sendEmailDetails: true,
            attachReceipts: true, // Gerar links de comprovantes
            sendPdfByEmail: false,
            recipientEmails: financeiroEmails,
            companyName: company?.name,
          })
          
          setProcessingStep('Abrindo cliente de email...')
          setProcessingProgress(90)
          
          // Copiar conteúdo HTML para área de transferência
          await copyEmailToClipboard(emailData.htmlBody, emailData.body)
          
          // Abrir cliente de email
          const mailtoLink = `mailto:${financeiroEmails.join(',')}?subject=${encodeURIComponent(emailData.subject)}&body=${encodeURIComponent(emailData.body)}`
          const link = document.createElement('a')
          link.href = mailtoLink
          link.style.display = 'none'
          document.body.appendChild(link)
          link.click()
          setTimeout(() => {
            if (document.body.contains(link)) {
              document.body.removeChild(link)
            }
          }, 100)
          
          toast.info('Conteúdo do email copiado para área de transferência!')
          await new Promise(resolve => setTimeout(resolve, 500))
        }
      }
      
      setProcessingStep('Finalizando...')
      setProcessingProgress(100)
      
      // Recarregar relatório
      const updatedReport = await loadReportDetails(report.id)
      setReport(updatedReport)
      
      // Resetar estados
      setSendEmailDetails(false)
      setSendPdfByEmail(false)
      
      // Fechar modal após um breve delay
      setTimeout(() => {
        setShowProcessingModal(false)
        toast.success('Relatório enviado para análise contábil!')
      }, 1000)
    } catch (error: any) {
      console.error('Erro ao enviar relatório:', error)
      setShowProcessingModal(false)
      toast.error('Erro ao enviar relatório: ' + error.message)
    } finally {
      setSubmitting(false)
      setProcessingProgress(0)
    }
  }
  
  const handleGeneratePdfAndSubmit = async () => {
    if (!report || !user) return

    try {
      setGeneratingPdf(true)
      setShowPdfDialog(false)
      
      // Mostrar modal de processamento
      setShowProcessingModal(true)
      setProcessingProgress(0)
      setProcessingStep('Iniciando processamento...')
      
      let pdfBlob: Blob | undefined
      let pdfFileName: string | undefined
      let pdfUrl: string | undefined
      
      // Debug: verificar estados
      console.log('🔍 Estados:', { sendPdfByEmail, sendEmailDetails })
      
      // Gerar PDF se solicitado
      if (sendPdfByEmail) {
        setProcessingStep('Buscando template PDF timbrado...')
        setProcessingProgress(10)
        
        setProcessingStep('Gerando PDF do relatório...')
        setProcessingProgress(20)
        
        const pdfResult = await generateReportPdf(report, report.expenses, {
          includeExpenseDetails,
          includeAttachments,
          rdParaCliente,
          companyName: company?.name || undefined,
          projectReferenceNumber: project?.referenceNumber || undefined,
          responsibleName: project?.responsibleName || undefined,
          userProfile: creatorProfile || undefined,
        })
        
        pdfBlob = pdfResult.blob
        pdfFileName = pdfResult.fileName
        
        setProcessingStep('Fazendo upload do PDF...')
        setProcessingProgress(50)
        
        // Fazer upload do PDF para Firebase Storage
        pdfUrl = await uploadPdfToStorage(pdfBlob, pdfFileName)
        
        setProcessingStep('Atualizando relatório...')
        setProcessingProgress(60)
        
        // Atualizar relatório com pdfUri
        const reportRef = doc(db, 'expense_reports', report.id)
        await updateDoc(reportRef, {
          pdfUri: pdfFileName,
        })
      }
      
      setProcessingStep('Enviando relatório para análise...')
      setProcessingProgress(70)
      
      // Enviar relatório
      const userName = creatorProfile?.fullName || creatorProfile?.displayName || user.email?.split('@')[0] || 'Operador'
      await submitReport(report.id, userName)
      
      // Preparar e enviar email
      // Se apenas PDF está selecionado (sem detalhes), abrir email apenas com link do PDF
      // IMPORTANTE: Verificar se sendEmailDetails está definido e é false
      const isOnlyPdfSelected = sendPdfByEmail && pdfUrl && (sendEmailDetails === false || sendEmailDetails === undefined)
      
      console.log('🔍 Verificando envio de email:', { 
        sendPdfByEmail, 
        sendEmailDetails, 
        pdfUrl: !!pdfUrl,
        isOnlyPdfSelected 
      })
      
      if (isOnlyPdfSelected) {
        setProcessingStep('Preparando email com link do PDF...')
        setProcessingProgress(75)
        
        // Buscar emails dos usuários FINANCEIRO
        const financeiroQuery = query(
          collection(db, 'users'),
          where('role', '==', UserRole.FINANCEIRO)
        )
        const financeiroSnapshot = await getDocs(financeiroQuery)
        const financeiroEmails = financeiroSnapshot.docs
          .map((doc) => doc.data().email)
          .filter((email): email is string => Boolean(email))
        
        if (financeiroEmails.length > 0) {
          setProcessingStep('Abrindo cliente de email...')
          setProcessingProgress(90)
          
          // Criar email simples apenas com link do PDF
          const subject = `Relatório de Despesas - ${report.name} - Análise Contábil`
          const emailBody = `Relatório de Despesas\n\nID: ${report.id.slice(-9).padStart(9, '0')}\nNome: ${report.name}\n\n📄 PDF do Relatório:\n${pdfUrl}\n\nClique no link acima para baixar o relatório em PDF.`
          const emailHtml = `<html><body style="font-family: Arial, sans-serif;"><h2>Relatório de Despesas</h2><p><strong>ID:</strong> ${report.id.slice(-9).padStart(9, '0')}</p><p><strong>Nome:</strong> ${report.name}</p><div style="margin-top: 20px; padding: 15px; background-color: #f0f7ff; border-left: 4px solid #4285F4; border-radius: 4px;"><p style="margin: 0 0 10px 0;"><strong>📄 PDF do Relatório</strong></p><p style="margin: 0;"><a href="${pdfUrl}" target="_blank" style="color: #4285F4; text-decoration: none; font-weight: bold; font-size: 16px;">⬇️ Download Relatório em PDF</a></p></div></body></html>`
          
          // Copiar conteúdo HTML para área de transferência
          await copyEmailToClipboard(emailHtml, emailBody)
          
          // Abrir cliente de email
          const mailtoLink = `mailto:${financeiroEmails.join(',')}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`
          const link = document.createElement('a')
          link.href = mailtoLink
          link.style.display = 'none'
          document.body.appendChild(link)
          link.click()
          setTimeout(() => {
            if (document.body.contains(link)) {
              document.body.removeChild(link)
            }
          }, 100)
          
          toast.info('Conteúdo do email copiado para área de transferência!')
          await new Promise(resolve => setTimeout(resolve, 500))
        }
      }
      
      // Se ambas opções estão selecionadas (PDF + detalhes)
      if (sendEmailDetails && sendPdfByEmail) {
        setProcessingStep('Preparando email com detalhes e PDF...')
        setProcessingProgress(75)
        
        // Buscar emails dos usuários FINANCEIRO
        const financeiroQuery = query(
          collection(db, 'users'),
          where('role', '==', UserRole.FINANCEIRO)
        )
        const financeiroSnapshot = await getDocs(financeiroQuery)
        const financeiroEmails = financeiroSnapshot.docs
          .map((doc) => doc.data().email)
          .filter((email): email is string => Boolean(email))
        
        if (financeiroEmails.length > 0) {
          setProcessingStep('Gerando conteúdo do email...')
          setProcessingProgress(80)
          
          const emailData = await prepareEmailForSending(report, report.expenses, {
            sendEmailDetails: true,
            attachReceipts: false,
            sendPdfByEmail: true,
            pdfBlob,
            pdfFileName: pdfFileName || undefined,
            pdfDownloadUrl: pdfUrl,
            recipientEmails: financeiroEmails,
            companyName: company?.name || undefined,
          })
          
          setProcessingStep('Abrindo cliente de email...')
          setProcessingProgress(95)
          
          // Copiar conteúdo HTML para área de transferência
          await copyEmailToClipboard(emailData.htmlBody, emailData.body)
          
          // Abrir cliente de email
          const mailtoLink = `mailto:${financeiroEmails.join(',')}?subject=${encodeURIComponent(emailData.subject)}&body=${encodeURIComponent(emailData.body)}`
          const link = document.createElement('a')
          link.href = mailtoLink
          link.style.display = 'none'
          document.body.appendChild(link)
          link.click()
          setTimeout(() => {
            if (document.body.contains(link)) {
              document.body.removeChild(link)
            }
          }, 100)
          
          toast.info('Conteúdo do email copiado para área de transferência!')
          await new Promise(resolve => setTimeout(resolve, 500))
        }
      }
      
      setProcessingStep('Finalizando...')
      setProcessingProgress(100)
      
      // Recarregar relatório
      const updatedReport = await loadReportDetails(report.id)
      setReport(updatedReport)
      
      // Resetar estados
      setSendEmailDetails(false)
      setSendPdfByEmail(false)
      setIncludeExpenseDetails(true)
      setIncludeAttachments(false)
      setRdParaCliente(false)
      
      // Fechar modal após um breve delay
      setTimeout(() => {
        setShowProcessingModal(false)
        toast.success('Relatório enviado para análise contábil!')
      }, 1500)
    } catch (error: any) {
      console.error('Erro ao gerar PDF e enviar relatório:', error)
      setShowProcessingModal(false)
      toast.error('Erro ao gerar PDF e enviar relatório: ' + error.message)
    } finally {
      setGeneratingPdf(false)
      setProcessingProgress(0)
    }
  }

  const toggleExpenseSelection = (expenseId: string) => {
    setSelectedExpensesToAdd(prev =>
      prev.includes(expenseId)
        ? prev.filter(id => id !== expenseId)
        : [...prev, expenseId]
    )
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'rgb(222, 222, 222)' }}>
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
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'rgb(222, 222, 222)' }}>
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

  const canApprove = report.status === ReportStatus.ANALISE_CONTABIL && isFinanceiro
  const canReject = report.status === ReportStatus.ANALISE_CONTABIL && isFinanceiro
  const canConfirmPayment = report.status === ReportStatus.APROVADO_PARA_PAGAMENTO
  const canRejectPayment = report.status === ReportStatus.APROVADO_PARA_PAGAMENTO
  
  // Verificar se o usuário é o criador do relatório (OPERADOR)
  const isCreator = isOperador && user?.uid === report.createdByUserId
  const canEdit = isCreator && report.status === ReportStatus.PENDENTE
  const canSubmit = isCreator && report.status === ReportStatus.PENDENTE && report.expenses.length > 0
  
  // Filtrar despesas disponíveis (sem relatório)
  const expensesWithoutReport = isOperador ? operadorData.expenses.filter(e => !e.reportId) : []

  return (
    <ProtectedRoute>
      <div className="min-h-screen" style={{ backgroundColor: 'rgb(222, 222, 222)' }}>
        {/* Header */}
        <div className="bg-white shadow-sm border-b sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <div>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="text-primary hover:text-primary-dark mb-2"
                >
                  ← Voltar
                </button>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-gray-900">{report.name}</h1>
                  {report.pdfUri && (
                    <div className="flex items-center gap-1">
                      {loadingPdf ? (
                        <span className="text-sm text-gray-500">Carregando PDF...</span>
                      ) : pdfUrl ? (
                        <a
                          href={pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                          title="Visualizar PDF"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                            />
                          </svg>
                          <span className="text-sm">PDF Disponivel</span>
                        </a>
                      ) : pdfError ? (
                        <span className="text-sm text-red-500" title={pdfError}>
                          PDF não disponível
                        </span>
                      ) : (
                        <span className="text-sm text-gray-500">PDF em processamento...</span>
                      )}
                    </div>
                  )}
                </div>
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
          {/* Botões de Ação para OPERADOR */}
          {canEdit && (
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <div className="flex gap-4">
                <button
                  onClick={() => router.push(`/expenses/new?reportId=${reportId}`)}
                  className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
                >
                  + Nova Despesa
                </button>
              </div>
            </div>
          )}
          
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
                  Colaborador
                </button>
                <button
                  onClick={() => setActiveTab(4)}
                  className={`px-6 py-3 text-sm font-medium ${
                    activeTab === 4
                      ? 'border-b-2 border-primary text-primary'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Dados do Cliente
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
                      <p className="mt-4 text-gray-600">Carregando adiantamentos...</p>
                    </div>
                  ) : advances.length > 0 ? (
                    <div className="space-y-6">
                      {advances.map((advance) => (
                        <div key={advance.id} className="bg-gray-50 rounded-lg p-6">
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

                          {advance.statusHistory && advance.statusHistory.length > 0 && (
                            <div className="mt-6">
                              <h5 className="text-sm font-semibold text-gray-900 mb-3">
                                Histórico do Adiantamento
                              </h5>
                              <div className="space-y-3">
                                {advance.statusHistory.map((entry, index) => (
                                  <div key={index} className="border-l-4 border-primary pl-4 py-2 bg-white rounded">
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
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <p>Este relatório não está associado a nenhum adiantamento.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Aba Histórico */}
              {activeTab === 2 && (
                <div>
                  {/* Detalhes do Relatório - Layout em duas colunas */}
                  <div className="bg-white rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-4 border-b border-gray-200">Detalhes do Relatório</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                      {/* Coluna Esquerda */}
                      <div className="space-y-4">
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Total</dt>
                          <dd className="mt-1 text-lg font-semibold text-orange-600">{formatCurrency(report.totalAmount)}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Projeto</dt>
                          <dd className="mt-1 text-sm text-gray-900">{report.projectName || 'Sem projeto'}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Referência</dt>
                          <dd className="mt-1 text-sm text-gray-900">{project?.referenceNumber || 'Não informado'}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Link Docs Projeto:</dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            {project?.documentationLink ? (
                              <a
                                href={project.documentationLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 underline"
                              >
                                Abrir Documentação
                              </a>
                            ) : (
                              'Não informado'
                            )}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Cliente</dt>
                          <dd className="mt-1 text-sm text-gray-900">{company?.name || project?.companyName || 'Não informado'}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Responsável</dt>
                          <dd className="mt-1 text-sm text-gray-900">{project?.responsibleName || 'Não informado'}</dd>
                        </div>
                      </div>

                      {/* Coluna Direita */}
                      <div className="space-y-4">
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
                          <dt className="text-sm font-medium text-gray-500">Data</dt>
                          <dd className="mt-1 text-sm text-gray-900">{formatDate(report.date)}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Criado por</dt>
                          <dd className="mt-1 text-sm text-gray-900">{report.createdByUserName || 'N/A'}</dd>
                        </div>
                      </div>
                    </div>

                    {/* Observações */}
                    {(report.observations || report.approverObservations || report.approvalObservations) && (
                      <div className="mt-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 pt-4 border-t border-gray-200">Observações</h3>
                        <div className="space-y-2">
                          {report.observations && (
                            <p className="text-sm text-gray-900 whitespace-pre-wrap">{report.observations}</p>
                          )}
                          {report.approverObservations && (
                            <p className="text-sm text-gray-900 whitespace-pre-wrap">{report.approverObservations}</p>
                          )}
                          {report.approvalObservations && (
                            <p className="text-sm text-gray-900 whitespace-pre-wrap">{report.approvalObservations}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Histórico de Status */}
                  <div className="bg-white rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Histórico de Status
                    </h3>
                    {report.statusHistory.length === 0 ? (
                      <p className="text-gray-500">Nenhum histórico disponível</p>
                    ) : (
                      <div className="space-y-3">
                        {report.statusHistory.map((entry, index) => (
                          <div 
                            key={index} 
                            className={`border-l-4 pl-4 py-3 rounded-r ${getHistoryStatusBgColor(entry.status)}`}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <p className={`text-sm font-medium ${getHistoryStatusTextColor(entry.status)}`}>
                                  {getStatusLabel(entry.status)}
                                </p>
                                <p className="text-xs text-gray-600 mt-1">
                                  {entry.changedBy && `Alterado por: ${entry.changedBy}`}
                                </p>
                                {entry.observations && (
                                  <p className="text-sm text-gray-700 mt-2">
                                    {entry.observations}
                                  </p>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 ml-4">
                                {formatDateTime(entry.date)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Ações */}
                  <div className="bg-white rounded-lg p-6 border-t">
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

              {/* Aba Colaborador */}
              {activeTab === 3 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Colaborador
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

              {/* Aba Dados do Cliente */}
              {activeTab === 4 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Dados do Cliente
                  </h3>
                  {loadingCompany ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                      <p className="mt-4 text-gray-600">Carregando dados do cliente...</p>
                    </div>
                  ) : company ? (
                    <div className="space-y-6">
                      {/* Informações da Empresa */}
                      <div className="bg-gray-50 rounded-lg p-6">
                        <h4 className="text-md font-semibold text-gray-900 mb-4">
                          Informações da Empresa
                        </h4>
                        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Nome da Empresa</dt>
                            <dd className="mt-1 text-sm text-gray-900">{company.name || 'Não informado'}</dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">CNPJ</dt>
                            <dd className="mt-1 text-sm text-gray-900">{company.cnpj || 'Não informado'}</dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Endereço</dt>
                            <dd className="mt-1 text-sm text-gray-900">{company.address || 'Não informado'}</dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Complemento</dt>
                            <dd className="mt-1 text-sm text-gray-900">{company.complement || 'Não informado'}</dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Bairro</dt>
                            <dd className="mt-1 text-sm text-gray-900">{company.neighborhood || 'Não informado'}</dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">CEP</dt>
                            <dd className="mt-1 text-sm text-gray-900">{company.zipCode || 'Não informado'}</dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Estado</dt>
                            <dd className="mt-1 text-sm text-gray-900">{company.state || 'Não informado'}</dd>
                          </div>
                        </dl>
                      </div>

                      {/* Responsável pela Aprovação */}
                      <div className="bg-gray-50 rounded-lg p-6">
                        <h4 className="text-md font-semibold text-gray-900 mb-4">
                          Responsável pela Aprovação
                        </h4>
                        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Nome</dt>
                            <dd className="mt-1 text-sm text-gray-900">{project?.responsibleName || 'Não informado'}</dd>
                          </div>
                        </dl>
                      </div>

                      {/* Responsáveis Técnico/Comercial */}
                      <div className="bg-gray-50 rounded-lg p-6">
                        <h4 className="text-md font-semibold text-gray-900 mb-4">
                          Responsáveis Técnico/Comercial
                        </h4>
                        <div className="space-y-4">
                          <div className="border-l-4 border-primary pl-4">
                            <h5 className="text-sm font-medium text-gray-900 mb-2">Responsável 1</h5>
                            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <dt className="text-sm font-medium text-gray-500">Nome</dt>
                                <dd className="mt-1 text-sm text-gray-900">{company.responsible1Name || 'Não informado'}</dd>
                              </div>
                              <div>
                                <dt className="text-sm font-medium text-gray-500">Telefone</dt>
                                <dd className="mt-1 text-sm text-gray-900">{company.responsible1Phone || 'Não informado'}</dd>
                              </div>
                              <div className="md:col-span-2">
                                <dt className="text-sm font-medium text-gray-500">Email</dt>
                                <dd className="mt-1 text-sm text-gray-900">{company.responsible1Email || 'Não informado'}</dd>
                              </div>
                            </dl>
                          </div>
                          <div className="border-l-4 border-primary pl-4">
                            <h5 className="text-sm font-medium text-gray-900 mb-2">Responsável 2</h5>
                            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <dt className="text-sm font-medium text-gray-500">Nome</dt>
                                <dd className="mt-1 text-sm text-gray-900">{company.responsible2Name || 'Não informado'}</dd>
                              </div>
                              <div>
                                <dt className="text-sm font-medium text-gray-500">Telefone</dt>
                                <dd className="mt-1 text-sm text-gray-900">{company.responsible2Phone || 'Não informado'}</dd>
                              </div>
                              <div className="md:col-span-2">
                                <dt className="text-sm font-medium text-gray-500">Email</dt>
                                <dd className="mt-1 text-sm text-gray-900">{company.responsible2Email || 'Não informado'}</dd>
                              </div>
                            </dl>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <p>Este relatório não está associado a um projeto com empresa cadastrada.</p>
                      {!report.projectId && (
                        <p className="text-sm mt-2">Nenhum projeto vinculado a este relatório.</p>
                      )}
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
                {(() => {
                  const details = parseExpenseDetails(selectedExpense)
                  const isQuilometragem = selectedExpense.expenseType === 'TRANSPORTE' && 
                                          selectedExpense.observations?.includes('Tipo: Transporte - Quilometragem')
                  
                  return (
                    <>
                      <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Tipo de Despesa</dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            {isQuilometragem 
                              ? 'Transporte - Quilometragem'
                              : details.transportSubtype 
                                ? `Transporte - ${details.transportSubtype}`
                                : selectedExpense.expenseType}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Data</dt>
                          <dd className="mt-1 text-sm text-gray-900">{formatDate(selectedExpense.date)}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Valor</dt>
                          <dd className="mt-1 text-sm font-semibold text-gray-900">{formatCurrency(selectedExpense.amount)}</dd>
                        </div>
                        {!isQuilometragem && (
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Forma de Pagamento</dt>
                            <dd className="mt-1 text-sm text-gray-900">{getPaymentMethodLabel(selectedExpense.paymentMethod)}</dd>
                          </div>
                        )}
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

                      {/* Campos específicos para Quilometragem */}
                      {isQuilometragem && (
                        <div className="mt-6 pt-6 border-t">
                          <h4 className="text-sm font-medium text-gray-700 mb-4">Detalhes da Quilometragem</h4>
                          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {details.originAddress && (
                              <div>
                                <dt className="text-sm font-medium text-gray-500">Local Origem</dt>
                                <dd className="mt-1 text-sm text-gray-900">{details.originAddress}</dd>
                              </div>
                            )}
                            {details.destinationAddress && (
                              <div>
                                <dt className="text-sm font-medium text-gray-500">Local Destino</dt>
                                <dd className="mt-1 text-sm text-gray-900">{details.destinationAddress}</dd>
                              </div>
                            )}
                            {details.initialKm && (
                              <div>
                                <dt className="text-sm font-medium text-gray-500">KM Inicial</dt>
                                <dd className="mt-1 text-sm text-gray-900">{details.initialKm}</dd>
                              </div>
                            )}
                            {details.finalKm && (
                              <div>
                                <dt className="text-sm font-medium text-gray-500">KM Destino</dt>
                                <dd className="mt-1 text-sm text-gray-900">{details.finalKm}</dd>
                              </div>
                            )}
                            {details.totalKm && (
                              <div>
                                <dt className="text-sm font-medium text-gray-500">KM Total</dt>
                                <dd className="mt-1 text-sm text-gray-900">{details.totalKm}</dd>
                              </div>
                            )}
                            {details.kmValue && (
                              <div>
                                <dt className="text-sm font-medium text-gray-500">Valor por KM</dt>
                                <dd className="mt-1 text-sm text-gray-900">{details.kmValue}</dd>
                              </div>
                            )}
                            {details.travelPurpose && (
                              <div className="md:col-span-2">
                                <dt className="text-sm font-medium text-gray-500">Objetivo</dt>
                                <dd className="mt-1 text-sm text-gray-900">{details.travelPurpose}</dd>
                              </div>
                            )}
                          </dl>
                        </div>
                      )}

                      {/* Campos específicos para Hospedagem */}
                      {selectedExpense.expenseType === 'HOSPEDAGEM' && (
                        <div className="mt-6 pt-6 border-t">
                          <h4 className="text-sm font-medium text-gray-700 mb-4">Detalhes da Hospedagem</h4>
                          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {details.hotelName && (
                              <div>
                                <dt className="text-sm font-medium text-gray-500">Hotel</dt>
                                <dd className="mt-1 text-sm text-gray-900">{details.hotelName}</dd>
                              </div>
                            )}
                            {details.checkIn && (
                              <div>
                                <dt className="text-sm font-medium text-gray-500">Check-in</dt>
                                <dd className="mt-1 text-sm text-gray-900">{details.checkIn}</dd>
                              </div>
                            )}
                            {details.checkOut && (
                              <div>
                                <dt className="text-sm font-medium text-gray-500">Check-out</dt>
                                <dd className="mt-1 text-sm text-gray-900">{details.checkOut}</dd>
                              </div>
                            )}
                          </dl>
                        </div>
                      )}

                      {/* Observações (apenas as observações reais, sem os campos específicos) */}
                      {details.cleanedObservations && details.cleanedObservations.trim() && (
                        <div className="mt-6 pt-6 border-t">
                          <dt className="text-sm font-medium text-gray-500 mb-2">Observações</dt>
                          <dd className="text-sm text-gray-900 whitespace-pre-wrap bg-gray-50 p-3 rounded-md">
                            {details.cleanedObservations}
                          </dd>
                        </div>
                      )}
                    </>
                  )
                })()}

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

        {/* Dialog: Adicionar Despesas */}
        {showAddExpensesDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b">
                <h2 className="text-xl font-semibold text-gray-900">Adicionar Despesas ao Relatório</h2>
              </div>
              <div className="px-6 py-4 overflow-y-auto flex-1">
                {expensesWithoutReport.length === 0 ? (
                  <p className="text-gray-500">Nenhuma despesa disponível para adicionar.</p>
                ) : (
                  <div className="space-y-2">
                    {expensesWithoutReport.map((expense) => (
                      <div
                        key={expense.id}
                        className="flex items-center p-3 border rounded hover:bg-gray-50 cursor-pointer"
                        onClick={() => toggleExpenseSelection(expense.id)}
                      >
                        <input
                          type="checkbox"
                          checked={selectedExpensesToAdd.includes(expense.id)}
                          onChange={() => toggleExpenseSelection(expense.id)}
                          className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                        />
                        <div className="ml-3 flex-1">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-900">
                              {expense.expenseType} - {formatDate(expense.date)}
                            </span>
                            <span className="text-sm font-semibold text-gray-900">
                              {formatCurrency(expense.amount)}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {expense.projectName || 'Sem projeto'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="px-6 py-4 border-t flex gap-4">
                <button
                  onClick={() => {
                    setShowAddExpensesDialog(false)
                    setSelectedExpensesToAdd([])
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddExpenses}
                  disabled={selectedExpensesToAdd.length === 0 || submitting}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Adicionando...' : `Adicionar (${selectedExpensesToAdd.length})`}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Dialog: Enviar Relatório */}
        {showSubmitDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-4 border-b">
                <h2 className="text-xl font-semibold text-gray-900">Enviar Relatório</h2>
              </div>
              <div className="px-6 py-4">
                <p className="text-gray-700 mb-4">
                  Tem certeza que deseja enviar este relatório para análise contábil?
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  O relatório será enviado para o setor financeiro e não poderá mais ser editado.
                </p>
                
                {/* Opções de envio */}
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={sendEmailDetails}
                      onChange={(e) => setSendEmailDetails(e.target.checked)}
                      className="mr-2 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">Enviar detalhes por email</span>
                  </label>
                  
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={sendPdfByEmail}
                      onChange={(e) => {
                        setSendPdfByEmail(e.target.checked)
                        if (e.target.checked) {
                          // Ao marcar PDF, fechar este diálogo e abrir diálogo de PDF
                          setShowSubmitDialog(false)
                          setShowPdfDialog(true)
                        }
                      }}
                      className="mr-2 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">Enviar relatório PDF por email</span>
                  </label>
                </div>
              </div>
              <div className="px-6 py-4 border-t flex gap-4">
                <button
                  onClick={() => {
                    setShowSubmitDialog(false)
                    setSendEmailDetails(false)
                    setSendPdfByEmail(false)
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmitReport}
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Enviando...' : 'Enviar'}
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Dialog: Configurar PDF */}
        {showPdfDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-4 border-b">
                <h2 className="text-xl font-semibold text-gray-900">Gerar Relatório em PDF para Email</h2>
              </div>
              <div className="px-6 py-4">
                <p className="text-gray-700 mb-4">
                  Configure as opções do PDF que será anexado ao email:
                </p>
                
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={includeExpenseDetails}
                      onChange={(e) => {
                        setIncludeExpenseDetails(e.target.checked)
                        if (!e.target.checked) {
                          setIncludeAttachments(false)
                        }
                      }}
                      className="mr-2 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">Incluir Detalhes das Despesas</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={includeAttachments}
                      onChange={(e) => setIncludeAttachments(e.target.checked)}
                      disabled={!includeExpenseDetails}
                      className="mr-2 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <span className={`text-sm ${!includeExpenseDetails ? 'text-gray-400' : 'text-gray-700'}`}>
                      Incluir anexo(s)
                    </span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={rdParaCliente}
                      onChange={(e) => setRdParaCliente(e.target.checked)}
                      className="mr-2 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">RD para Cliente</span>
                  </label>
                </div>
              </div>
              <div className="px-6 py-4 border-t flex gap-4">
                <button
                  onClick={() => {
                    setShowPdfDialog(false)
                    setSendPdfByEmail(false)
                    setIncludeExpenseDetails(true)
                    setIncludeAttachments(false)
                    setRdParaCliente(false)
                    // Voltar ao diálogo de envio
                    setShowSubmitDialog(true)
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleGeneratePdfAndSubmit}
                  disabled={generatingPdf}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {generatingPdf ? 'Gerando PDF...' : 'Gerar e Enviar'}
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Modal de Processamento */}
        <ProcessingModal
          isOpen={showProcessingModal}
          currentStep={processingStep}
          progress={processingProgress}
        />
      </div>
    </ProtectedRoute>
  )
}
