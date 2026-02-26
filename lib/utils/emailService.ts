import { ExpenseReport, Expense } from '@/lib/models/types'
import { ref, getDownloadURL, getBytes } from 'firebase/storage'
import { storage } from '@/lib/firebase/config'

interface EmailOptions {
  sendEmailDetails: boolean
  attachReceipts: boolean
  sendPdfByEmail: boolean
  pdfBlob?: Blob
  pdfFileName?: string
  pdfDownloadUrl?: string
  recipientEmails: string[]
  companyName?: string
}

/**
 * Prepara conteúdo do email com detalhes do relatório
 */
export function generateEmailContent(
  report: ExpenseReport,
  expenses: Expense[],
  options: EmailOptions
): { subject: string; body: string; htmlBody: string } {
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

  const subject = `Relatório de Despesas - ${report.name} - Análise Contábil`

  let body = `Relatório de Despesas\n\n`
  body += `ID: ${report.id.slice(-9).padStart(9, '0')}\n`
  body += `Nome: ${report.name}\n`
  body += `Data: ${formatDate(report.date)}\n`
  
  if (options.companyName) {
    body += `Empresa: ${options.companyName}\n`
  }
  
  if (report.projectName) {
    body += `Projeto: ${report.projectName}\n`
  }
  
  body += `\nValor Total: ${formatCurrency(report.totalAmount)}\n\n`

  if (options.sendEmailDetails && expenses.length > 0) {
    body += `Detalhes das Despesas:\n`
    body += `${'='.repeat(50)}\n\n`
    
    expenses.forEach((expense, index) => {
      body += `${index + 1}. ${expense.expenseType}\n`
      body += `   Data: ${formatDate(expense.date)}\n`
      body += `   Valor: ${formatCurrency(expense.amount)}\n`
      if (expense.observations) {
        body += `   Observações: ${expense.observations}\n`
      }
      body += `\n`
    })
  }

  // Versão HTML
  let htmlBody = `<html><body style="font-family: Arial, sans-serif;">`
  htmlBody += `<h2>Relatório de Despesas</h2>`
  htmlBody += `<p><strong>ID:</strong> ${report.id.slice(-9).padStart(9, '0')}</p>`
  htmlBody += `<p><strong>Nome:</strong> ${report.name}</p>`
  htmlBody += `<p><strong>Data:</strong> ${formatDate(report.date)}</p>`
  
  if (options.companyName) {
    htmlBody += `<p><strong>Empresa:</strong> ${options.companyName}</p>`
  }
  
  if (report.projectName) {
    htmlBody += `<p><strong>Projeto:</strong> ${report.projectName}</p>`
  }
  
  htmlBody += `<p><strong>Valor Total:</strong> ${formatCurrency(report.totalAmount)}</p>`

  if (options.sendEmailDetails && expenses.length > 0) {
    htmlBody += `<h3>Detalhes das Despesas</h3>`
    htmlBody += `<table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%;">`
    htmlBody += `<tr style="background-color: #4285F4; color: white;">`
    htmlBody += `<th>Tipo</th><th>Data</th><th>Valor</th><th>Observações</th></tr>`
    
    expenses.forEach((expense) => {
      htmlBody += `<tr>`
      htmlBody += `<td>${expense.expenseType}</td>`
      htmlBody += `<td>${formatDate(expense.date)}</td>`
      htmlBody += `<td>${formatCurrency(expense.amount)}</td>`
      htmlBody += `<td>${expense.observations || '-'}</td>`
      htmlBody += `</tr>`
    })
    
    htmlBody += `</table>`
  }

  htmlBody += `</body></html>`

  return { subject, body, htmlBody }
}

/**
 * Baixa arquivo do Firebase Storage e retorna como Blob
 */
async function downloadFileAsBlob(uri: string, fileName: string): Promise<{ blob: Blob; fileName: string } | null> {
  try {
    let storageRef
    
    if (uri.startsWith('http')) {
      // Se já é uma URL completa, extrair o path
      const urlWithoutQuery = uri.split('?')[0]
      const pathMatch = urlWithoutQuery.match(/\/o\/(.+)$/)
      if (pathMatch) {
        const encodedPath = pathMatch[1]
        const decodedPath = decodeURIComponent(encodedPath)
        storageRef = ref(storage, decodedPath)
      } else {
        // Tentar usar como path direto
        storageRef = ref(storage, uri)
      }
    } else {
      // Usar como path direto
      storageRef = ref(storage, uri)
    }
    
    const bytes = await getBytes(storageRef)
    const blob = new Blob([bytes])
    
    return { blob, fileName }
  } catch (error) {
    console.warn(`Erro ao baixar arquivo ${uri}:`, error)
    return null
  }
}

/**
 * Baixa todos os anexos das despesas e retorna como Blobs
 */
export async function downloadAllAttachments(expenses: Expense[]): Promise<Array<{ blob: Blob; fileName: string }>> {
  const attachments: Array<{ blob: Blob; fileName: string }> = []
  
  for (const expense of expenses) {
    let attachmentIndex = 1
    
    if (expense.receiptImageUri) {
      const fileName = `Comprovante_${expense.expenseType}_${attachmentIndex}.jpg`
      const file = await downloadFileAsBlob(expense.receiptImageUri, fileName)
      if (file) attachments.push(file)
      attachmentIndex++
    }
    
    if (expense.receiptPdfUri) {
      const fileName = `Comprovante_${expense.expenseType}_${attachmentIndex}.pdf`
      const file = await downloadFileAsBlob(expense.receiptPdfUri, fileName)
      if (file) attachments.push(file)
      attachmentIndex++
    }
    
    if (expense.attachments && expense.attachments.length > 0) {
      for (const attachmentUri of expense.attachments) {
        const extension = attachmentUri.split('.').pop() || 'jpg'
        const fileName = `Comprovante_${expense.expenseType}_${attachmentIndex}.${extension}`
        const file = await downloadFileAsBlob(attachmentUri, fileName)
        if (file) attachments.push(file)
        attachmentIndex++
      }
    }
  }
  
  return attachments
}

/**
 * Gera links de download para anexos (fallback)
 */
async function generateAttachmentLinks(expenses: Expense[]): Promise<string[]> {
  const links: string[] = []
  
  for (const expense of expenses) {
    if (expense.receiptImageUri) {
      try {
        if (expense.receiptImageUri.startsWith('http')) {
          links.push(expense.receiptImageUri)
        } else {
          const imageRef = ref(storage, expense.receiptImageUri)
          const url = await getDownloadURL(imageRef)
          links.push(url)
        }
      } catch (error) {
        console.warn(`Erro ao gerar link para imagem: ${expense.receiptImageUri}`, error)
      }
    }
    
    if (expense.receiptPdfUri) {
      try {
        if (expense.receiptPdfUri.startsWith('http')) {
          links.push(expense.receiptPdfUri)
        } else {
          const pdfRef = ref(storage, expense.receiptPdfUri)
          const url = await getDownloadURL(pdfRef)
          links.push(url)
        }
      } catch (error) {
        console.warn(`Erro ao gerar link para PDF: ${expense.receiptPdfUri}`, error)
      }
    }
    
    if (expense.attachments && expense.attachments.length > 0) {
      for (const attachmentUri of expense.attachments) {
        try {
          if (attachmentUri.startsWith('http')) {
            links.push(attachmentUri)
          } else {
            const attachmentRef = ref(storage, attachmentUri)
            const url = await getDownloadURL(attachmentRef)
            links.push(url)
          }
        } catch (error) {
          console.warn(`Erro ao gerar link para anexo: ${attachmentUri}`, error)
        }
      }
    }
  }
  
  return links
}

/**
 * Prepara email para envio
 * 
 * NOTA: Esta função prepara o email, mas o envio real precisa ser feito através de:
 * 1. Um serviço backend (ex: Firebase Functions, API própria)
 * 2. Um serviço de email (ex: SendGrid, Mailgun, AWS SES)
 * 3. mailto: link (limitado, não suporta anexos grandes)
 */
export async function prepareEmailForSending(
  report: ExpenseReport,
  expenses: Expense[],
  options: EmailOptions
): Promise<{
  to: string[]
  subject: string
  body: string
  htmlBody: string
  pdfDownloadUrl?: string
  attachmentLinks?: string[]
  attachments?: Array<{ name: string; blob: Blob }>
}> {
  let { subject, body, htmlBody } = generateEmailContent(report, expenses, options)

  const attachments: Array<{ name: string; blob: Blob }> = []
  let pdfDownloadUrl: string | undefined
  let attachmentLinks: string[] | undefined

  // Adicionar PDF se solicitado (apenas link, não baixar)
  if (options.sendPdfByEmail && options.pdfDownloadUrl) {
    pdfDownloadUrl = options.pdfDownloadUrl
    
    body += `\n\n📄 PDF do Relatório:\n${pdfDownloadUrl}\n`
    
    htmlBody += `<div style="margin-top: 20px; padding: 15px; background-color: #f0f7ff; border-left: 4px solid #4285F4; border-radius: 4px;">`
    htmlBody += `<p style="margin: 0 0 10px 0;"><strong>📄 PDF do Relatório</strong></p>`
    htmlBody += `<p style="margin: 0;"><a href="${pdfDownloadUrl}" target="_blank" style="color: #4285F4; text-decoration: none; font-weight: bold; font-size: 16px;">⬇️ Download PDF do Relatório</a></p>`
    htmlBody += `</div>`
  }

  // Gerar links para comprovantes (não baixar, apenas gerar links)
  if (options.attachReceipts) {
    attachmentLinks = await generateAttachmentLinks(expenses)
    
    if (attachmentLinks.length > 0) {
      body += `\n\n📎 Comprovantes:\n`
      body += `Clique no link "Download Comprovantes" no email HTML para baixar todos os comprovantes.\n`
      
      htmlBody += `<div style="margin-top: 20px; padding: 15px; background-color: #f0fff4; border-left: 4px solid #10b981; border-radius: 4px;">`
      htmlBody += `<p style="margin: 0 0 10px 0;"><strong>📎 Comprovantes</strong></p>`
      if (attachmentLinks.length === 1) {
        htmlBody += `<p style="margin: 0;"><a href="${attachmentLinks[0]}" target="_blank" style="color: #10b981; text-decoration: none; font-weight: bold; font-size: 16px;">⬇️ Download Comprovantes</a></p>`
      } else {
        htmlBody += `<p style="margin: 0 0 10px 0;"><a href="${attachmentLinks[0]}" target="_blank" style="color: #10b981; text-decoration: none; font-weight: bold; font-size: 16px;">⬇️ Download Comprovantes (${attachmentLinks.length} arquivos)</a></p>`
        htmlBody += `<details style="margin-top: 10px;">`
        htmlBody += `<summary style="cursor: pointer; color: #666; font-size: 14px;">Ver links individuais</summary>`
        htmlBody += `<ul style="margin-top: 10px; padding-left: 20px;">`
        attachmentLinks.forEach((link, index) => {
          htmlBody += `<li style="margin-bottom: 5px;"><a href="${link}" target="_blank" style="color: #10b981; text-decoration: none;">Comprovante ${index + 1}</a></li>`
        })
        htmlBody += `</ul></details>`
      }
      htmlBody += `</div>`
    }
  }

  return {
    to: options.recipientEmails,
    subject,
    body,
    htmlBody,
    pdfDownloadUrl,
    attachmentLinks,
    attachments: attachments.length > 0 ? attachments : undefined,
  }
}

/**
 * Abre cliente de email padrão com mailto: link
 * Limitação: Não suporta anexos grandes, apenas texto
 */
export function openEmailClient(
  report: ExpenseReport,
  expenses: Expense[],
  options: EmailOptions
): void {
  const { subject, body } = generateEmailContent(report, expenses, options)
  
  const emailTo = options.recipientEmails.join(',')
  const mailtoLink = `mailto:${emailTo}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  
  window.open(mailtoLink)
}

/**
 * Copia conteúdo HTML para área de transferência
 */
export async function copyEmailToClipboard(htmlBody: string, plainBody: string): Promise<boolean> {
  try {
    // Tentar copiar HTML primeiro (suportado em navegadores modernos)
    if (navigator.clipboard && navigator.clipboard.write) {
      const blob = new Blob([htmlBody], { type: 'text/html' })
      const clipboardItem = new ClipboardItem({ 'text/html': blob })
      await navigator.clipboard.write([clipboardItem])
      return true
    } else {
      // Fallback: copiar texto simples
      await navigator.clipboard.writeText(plainBody)
      return true
    }
  } catch (error) {
    console.error('Erro ao copiar para área de transferência:', error)
    return false
  }
}

/**
 * Cria um objeto File a partir de um Blob para anexar ao email
 */
function createFileFromBlob(blob: Blob, fileName: string): File {
  return new File([blob], fileName, { type: blob.type })
}

/**
 * Prepara anexos para envio via Web Share API ou download
 */
export async function prepareAttachmentsForEmail(
  pdfBlob?: Blob,
  pdfFileName?: string,
  receiptAttachments?: Array<{ blob: Blob; fileName: string }>
): Promise<File[]> {
  const files: File[] = []
  
  // Adicionar PDF se disponível
  if (pdfBlob && pdfFileName) {
    files.push(createFileFromBlob(pdfBlob, pdfFileName))
  }
  
  // Adicionar comprovantes se disponíveis
  if (receiptAttachments) {
    receiptAttachments.forEach((attachment) => {
      files.push(createFileFromBlob(attachment.blob, attachment.fileName))
    })
  }
  
  return files
}
