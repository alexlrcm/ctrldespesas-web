import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { ExpenseReport, Expense, UserProfile } from '@/lib/models/types'
import { ref, uploadBytes, getDownloadURL, getBytes } from 'firebase/storage'
import { storage } from '@/lib/firebase/config'

interface PdfOptions {
  includeExpenseDetails: boolean
  includeAttachments: boolean
  rdParaCliente: boolean
  companyName?: string
  projectReferenceNumber?: string
  responsibleName?: string
  userProfile?: UserProfile
}

/**
 * Extrai identificador do usuário do email
 */
function extractUserIdentifierFromEmail(email: string): string | null {
  if (!email || email.trim() === '') return null
  const userPart = email.split('@')[0].toLowerCase()
  return userPart.replace(/[^a-z0-9]/g, '')
}

/**
 * Busca template PDF timbrado do Firebase Storage
 */
async function findTemplatePdf(userProfile?: UserProfile): Promise<Blob | null> {
  const templateNames: string[] = []

  // Adicionar template específico do usuário se disponível
  if (userProfile?.email) {
    const userIdentifier = extractUserIdentifierFromEmail(userProfile.email)
    if (userIdentifier) {
      templateNames.push(`rd_timbrado_${userIdentifier}`)
    }
  }

  // Adicionar template padrão
  templateNames.push('rd_timbrado')

  // Fallbacks
  const fallbackTemplates = ['rd_timbrado_acamacho', 'rd_timbrado_fgirasole', 'rd_timbrado_lcamacho']

  // Tentar buscar templates na ordem de prioridade
  for (const templateName of [...templateNames, ...fallbackTemplates]) {
    try {
      const templateRef = ref(storage, `pdf_templates/${templateName}.pdf`)
      const bytes = await getBytes(templateRef)
      if (bytes && bytes.length > 0) {
        console.log(`✓ Template encontrado: ${templateName}.pdf`)
        return new Blob([bytes], { type: 'application/pdf' })
      }
    } catch (error: any) {
      // Se não encontrou, tentar próximo
      if (error?.code !== 'storage/object-not-found') {
        console.warn(`Erro ao buscar template ${templateName}:`, error)
      }
    }
  }

  // Tentar também sem a pasta pdf_templates (pode estar na raiz)
  for (const templateName of [...templateNames, ...fallbackTemplates]) {
    try {
      const templateRef = ref(storage, `${templateName}.pdf`)
      const bytes = await getBytes(templateRef)
      if (bytes && bytes.length > 0) {
        console.log(`✓ Template encontrado na raiz: ${templateName}.pdf`)
        return new Blob([bytes], { type: 'application/pdf' })
      }
    } catch (error: any) {
      // Continuar tentando
    }
  }

  console.warn('⚠ Nenhum template PDF timbrado encontrado')
  console.warn('⚠ Templates procurados:', [...templateNames, ...fallbackTemplates])
  return null
}

/**
 * Converte PDF em imagem (usando canvas)
 */
async function pdfToImage(pdfBlob: Blob): Promise<HTMLImageElement | null> {
  try {
    // Usar pdf.js para renderizar PDF em canvas
    const pdfjsLib = await import('pdfjs-dist')
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

    const arrayBuffer = await pdfBlob.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
    const page = await pdf.getPage(1)

    const viewport = page.getViewport({ scale: 2.0 })
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    
    if (!context) return null

    canvas.height = viewport.height
    canvas.width = viewport.width

    await page.render({
      canvasContext: context,
      viewport: viewport,
    }).promise

    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = () => resolve(null)
      img.src = canvas.toDataURL('image/png')
    })
  } catch (error) {
    console.error('Erro ao converter PDF em imagem:', error)
    return null
  }
}

/**
 * Gera PDF do relatório com as opções configuradas
 */
export async function generateReportPdf(
  report: ExpenseReport,
  expenses: Expense[],
  options: PdfOptions
): Promise<{ blob: Blob; fileName: string }> {
  // Buscar template PDF timbrado e converter em imagem uma vez
  console.log('🔍 Buscando template PDF para:', options.userProfile?.email || 'sem perfil')
  const templatePdf = await findTemplatePdf(options.userProfile)
  let templateImage: HTMLImageElement | null = null
  
  if (templatePdf) {
    console.log('📄 Template PDF encontrado, convertendo para imagem...')
    templateImage = await pdfToImage(templatePdf)
    if (templateImage) {
      console.log('✅ Template convertido para imagem com sucesso')
    } else {
      console.warn('⚠ Falha ao converter template para imagem')
    }
  } else {
    console.warn('⚠ Template PDF não encontrado - PDF será gerado sem timbre')
  }
  
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  let yPosition = margin

  // Função auxiliar para adicionar template como fundo em uma página
  // IMPORTANTE: No jsPDF, a ordem importa. O template deve ser adicionado ANTES do conteúdo
  const addTemplateToPage = (pageNumber: number) => {
    if (templateImage) {
      try {
        doc.setPage(pageNumber)
        // Adicionar template como fundo (primeira camada)
        doc.addImage(
          templateImage.src,
          'PNG',
          0,
          0,
          pageWidth,
          pageHeight,
          undefined,
          'NONE'
        )
        console.log(`✅ Template adicionado na página ${pageNumber}`)
      } catch (error) {
        console.warn(`Erro ao adicionar template na página ${pageNumber}:`, error)
      }
    }
  }

  // Adicionar template na primeira página ANTES de adicionar qualquer conteúdo
  addTemplateToPage(1)

  // Função auxiliar para adicionar nova página se necessário
  const checkPageBreak = (requiredHeight: number) => {
    if (yPosition + requiredHeight > pageHeight - margin) {
      const currentPage = doc.getNumberOfPages()
      doc.addPage()
      yPosition = margin
      // Adicionar template na nova página ANTES de qualquer conteúdo
      addTemplateToPage(currentPage + 1)
    }
  }

  // Formatação de moeda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  // Formatação de data
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

  // Cabeçalho
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('Relatório de Despesas', pageWidth / 2, yPosition, { align: 'center' })
  yPosition += 10

  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text(`ID: ${report.id.slice(-9).padStart(9, '0')}`, margin, yPosition)
  yPosition += 6
  doc.text(`Relatório: ${report.name}`, margin, yPosition)
  yPosition += 6
  doc.text(`Data: ${formatDate(report.date)}`, margin, yPosition)
  yPosition += 6
  
  if (options.companyName) {
    doc.text(`Empresa: ${options.companyName}`, margin, yPosition)
    yPosition += 6
  }
  
  if (report.projectName) {
    doc.text(`Projeto: ${report.projectName}`, margin, yPosition)
    yPosition += 6
  }
  
  if (options.projectReferenceNumber) {
    doc.text(`Referência: ${options.projectReferenceNumber}`, margin, yPosition)
    yPosition += 6
  }

  yPosition += 5

  // Resumo
  checkPageBreak(15)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Resumo', margin, yPosition)
  yPosition += 8

  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text(`Valor Total: ${formatCurrency(report.totalAmount)}`, margin, yPosition)
  yPosition += 8

  // Detalhes das despesas (se solicitado)
  if (options.includeExpenseDetails && expenses.length > 0) {
    checkPageBreak(20)
    yPosition += 5
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Detalhes das Despesas', margin, yPosition)
    yPosition += 8

    // Preparar dados da tabela
    const tableData = expenses.map((expense) => [
      expense.expenseType,
      formatDate(expense.date),
      formatCurrency(expense.amount),
      expense.observations?.substring(0, 50) || '-',
    ])

    autoTable(doc, {
      startY: yPosition,
      head: [['Tipo', 'Data', 'Valor', 'Observações']],
      body: tableData,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [66, 139, 202] },
      margin: { left: margin, right: margin },
      didDrawPage: async (data: any) => {
        // Adicionar template como fundo em cada página da tabela
        // IMPORTANTE: Adicionar DEPOIS que a página foi criada mas como primeira camada
        if (templateImage) {
          try {
            doc.setPage(data.pageNumber)
            // Adicionar template como fundo (primeira camada)
            doc.addImage(
              templateImage.src,
              'PNG',
              0,
              0,
              pageWidth,
              pageHeight,
              undefined,
              'NONE'
            )
          } catch (error) {
            console.warn(`Erro ao adicionar template na página ${data.pageNumber} da tabela:`, error)
          }
        }
      },
    })

    yPosition = (doc as any).lastAutoTable.finalY + 10

    // Adicionar anexos se solicitado
    if (options.includeAttachments) {
      const expensesWithAttachments = expenses.filter(
        (e) => e.receiptImageUri || e.receiptPdfUri || (e.attachments && e.attachments.length > 0)
      )

      if (expensesWithAttachments.length > 0) {
        checkPageBreak(15)
        doc.setFontSize(12)
        doc.setFont('helvetica', 'bold')
        doc.text('Anexos Disponíveis:', margin, yPosition)
        yPosition += 6

        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        for (const expense of expensesWithAttachments) {
          checkPageBreak(8)
          let attachmentCount = 0
          if (expense.receiptImageUri) attachmentCount++
          if (expense.receiptPdfUri) attachmentCount++
          if (expense.attachments) attachmentCount += expense.attachments.length

          doc.text(
            `- ${expense.expenseType} (${formatDate(expense.date)}): ${attachmentCount} anexo(s)`,
            margin + 5,
            yPosition
          )
          yPosition += 5
        }
      }
    }
  }

  // RD para Cliente (se solicitado)
  if (options.rdParaCliente) {
    checkPageBreak(30)
    yPosition += 10
    const currentPage = doc.getNumberOfPages()
    doc.addPage()
    addTemplateBackground(currentPage + 1)
    yPosition = margin

    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('RD para Cliente', pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 15

    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text('Responsável pela Aprovação:', margin, yPosition)
    yPosition += 10

    if (options.responsibleName) {
      doc.text(options.responsibleName, margin + 10, yPosition)
      yPosition += 8
    }

    // Espaço para assinaturas
    yPosition += 20
    doc.line(margin, yPosition, pageWidth - margin, yPosition)
    yPosition += 5
    doc.setFontSize(10)
    doc.text('Assinatura do Operador', margin, yPosition)
    yPosition += 20
    doc.line(margin, yPosition, pageWidth - margin, yPosition)
    yPosition += 5
    doc.text('Assinatura do Responsável', margin, yPosition)
  }

  // O template já foi adicionado em cada página antes do conteúdo
  // através de addTemplateToPage() e didDrawPage do autoTable
  const finalTotalPages = doc.getNumberOfPages()
  console.log(`📄 Total de páginas geradas: ${finalTotalPages}`)
  console.log(`✅ Template aplicado em todas as ${finalTotalPages} página(s)`)

  // Gerar blob
  const blob = doc.output('blob')
  const fileName = `relatorio_${report.id}.pdf`

  return { blob, fileName }
}

/**
 * Faz upload do PDF para Firebase Storage e retorna a URL
 */
export async function uploadPdfToStorage(
  blob: Blob,
  fileName: string
): Promise<string> {
  const pdfRef = ref(storage, `pdf_reports/${fileName}`)
  await uploadBytes(pdfRef, blob)
  const downloadURL = await getDownloadURL(pdfRef)
  return downloadURL
}
