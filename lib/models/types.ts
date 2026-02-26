// Enums
export enum UserRole {
  ADMINISTRADOR = 'ADMINISTRADOR',
  OPERADOR = 'OPERADOR',
  APROVADOR = 'APROVADOR',
  FINANCEIRO = 'FINANCEIRO',
}

export enum AccountType {
  CC = 'CC', // Conta Corrente
  CP = 'CP', // Conta Poupança
}

export enum ReportStatus {
  PENDENTE = 'PENDENTE',
  ANALISE_CONTABIL = 'ANALISE_CONTABIL',
  APROVADO = 'APROVADO',
  APROVADO_PARA_PAGAMENTO = 'APROVADO_PARA_PAGAMENTO',
  FINANCEIRO_APROVADO = 'FINANCEIRO_APROVADO',
  PAGAMENTO_EFETUADO = 'PAGAMENTO_EFETUADO',
  REJEITADO = 'REJEITADO',
}

export enum ExpenseType {
  TRANSPORTE = 'TRANSPORTE',
  ALIMENTACAO = 'ALIMENTACAO',
  ESTACIONAMENTO = 'ESTACIONAMENTO',
  HOSPEDAGEM = 'HOSPEDAGEM',
  PASSAGEM_AEREA = 'PASSAGEM_AEREA',
  OUTROS = 'OUTROS',
}

export enum TransportSubtype {
  TAXI = 'TAXI',
  UBER = 'UBER',
  ONIBUS = 'ONIBUS',
  CARRO_ALUGADO = 'CARRO_ALUGADO',
  QUILOMETRAGEM = 'QUILOMETRAGEM',
  PEDAGIO = 'PEDAGIO',
  COMBUSTIVEL = 'COMBUSTIVEL',
}

export enum TravelPurpose {
  VISITA = 'VISITA',
  ENTREGA = 'ENTREGA',
  REUNIAO = 'REUNIAO',
  INTEGRACAO = 'INTEGRACAO',
  COMISSIONAMENTO = 'COMISSIONAMENTO',
  STARTUP = 'STARTUP',
  TAF = 'TAF',
  TAC = 'TAC',
  OUTROS = 'OUTROS',
}

export enum PaymentMethod {
  CARTAO_CORPORATIVO = 'CARTAO_CORPORATIVO',
  CARTAO_PESSOAL = 'CARTAO_PESSOAL',
  DINHEIRO = 'DINHEIRO',
  PIX = 'PIX',
}

export enum AdvanceStatus {
  PENDENTE = 'PENDENTE',
  APROVACAO = 'APROVACAO',
  PAGAMENTO_APROVADO = 'PAGAMENTO_APROVADO',
  ANALISE_CONTABIL = 'ANALISE_CONTABIL',
  APROVADO = 'APROVADO',
  REJEITADO = 'REJEITADO',
  PAGAMENTO_EFETUADO = 'PAGAMENTO_EFETUADO',
  FINALIZADO = 'FINALIZADO',
}

export enum AdvanceReason {
  VIAGEM = 'VIAGEM',
  COMPRA_MATERIAL = 'COMPRA_MATERIAL',
  SERVICO_TERCEIRO = 'SERVICO_TERCEIRO',
  OUTROS = 'OUTROS',
}

// Models
export interface User {
  id: string
  email: string
  password: string // Hash em produção
  role: UserRole
  mustChangePassword: boolean
}

export interface UserProfile {
  displayName: string
  fullName: string
  email: string
  cpf: string
  birthDate: string
  phone: string
  bank: string
  agency: string
  account: string
  accountType: AccountType
  pixKey: string
  profileImageUrl?: string | null
}

export interface Company {
  id: string
  name: string
  cnpj: string
  address?: string | null
  complement?: string | null
  neighborhood?: string | null
  zipCode?: string | null
  state?: string | null
  approvalResponsibleName?: string | null
  approvalResponsibleRole?: string | null
  responsible1Name?: string | null
  responsible1Phone?: string | null
  responsible1Email?: string | null
  responsible2Name?: string | null
  responsible2Phone?: string | null
  responsible2Email?: string | null
}

export enum ProjectStatus {
  ATIVO = 'ATIVO',
  ORCAMENTO = 'ORCAMENTO',
  ESPERA = 'ESPERA',
  FATURAMENTO = 'FATURAMENTO',
  FINALIZADO = 'FINALIZADO',
}

export interface Project {
  id: string
  name: string
  referenceNumber?: string | null
  companyId: string
  companyName: string
  companyCnpj: string
  date?: string | null
  responsibleName?: string | null
  documentationLink?: string | null
  status?: ProjectStatus
  observation?: string | null
}

export interface Expense {
  id: string
  amount: number
  expenseType: ExpenseType
  date: string
  paymentMethod: PaymentMethod
  reimbursable: boolean
  projectId?: string | null
  projectName?: string | null
  reportId?: string | null
  reportName?: string | null
  observations: string
  receiptImageUri?: string | null
  receiptPdfUri?: string | null
  attachments: string[]
  createdByUserId?: string | null
  createdByUserName?: string | null
  createdAtDateTime?: string | null
}

export interface StatusHistory {
  status: ReportStatus
  date: string
  changedBy?: string | null
  observations: string
}

export interface ExpenseReport {
  id: string
  name: string
  projectId?: string | null
  projectName?: string | null
  advanceId?: string | null
  advanceName?: string | null
  observations: string
  status: ReportStatus
  totalAmount: number
  date: string
  expenses: Expense[]
  createdByUserId?: string | null
  createdByUserName?: string | null
  approverObservations: string
  approvalObservations: string
  approvedByUserId?: string | null
  approvedByUserName?: string | null
  statusHistory: StatusHistory[]
  createdAtDateTime?: string | null
  pdfUri?: string | null
}

export interface AdvanceStatusHistory {
  status: AdvanceStatus
  date: string
  changedBy?: string | null
  observations: string
}

export interface Advance {
  id: string
  name: string
  amount: number
  workPeriodStart: string
  workPeriodEnd: string
  reason: AdvanceReason
  projectId?: string | null
  reportId?: string | null
  reportName?: string | null
  observations: string
  createdByUserId?: string | null
  createdByUserName?: string | null
  createdAtDateTime?: string | null
  status: AdvanceStatus
  statusHistory: AdvanceStatusHistory[]
}
