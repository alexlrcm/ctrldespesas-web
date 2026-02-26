'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useAuthContext } from '@/contexts/AuthContext'
import { useUserRole } from '@/hooks/useUserRole'
import { useOperador } from '@/hooks/useOperador'
import { AdvanceStatus, AdvanceReason, UserRole } from '@/lib/models/types'
import { toast } from 'react-toastify'

export default function NewAdvancePage() {
  const router = useRouter()
  const { user } = useAuthContext()
  const { role, isOperador, loading: roleLoading } = useUserRole()
  const { projects, createNewAdvance, loading: operadorLoading } = useOperador()

  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [workPeriodStart, setWorkPeriodStart] = useState('')
  const [workPeriodEnd, setWorkPeriodEnd] = useState('')
  const [reason, setReason] = useState<AdvanceReason | ''>('')
  const [projectId, setProjectId] = useState<string>('')
  const [observations, setObservations] = useState('')
  const [saving, setSaving] = useState(false)

  // Verificar acesso
  useEffect(() => {
    if (!roleLoading && !isOperador && role !== UserRole.OPERADOR) {
      router.push('/dashboard')
    }
  }, [role, isOperador, roleLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !amount || !workPeriodStart || !workPeriodEnd || !reason) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    if (!user?.uid) {
      toast.error('Usuário não autenticado')
      return
    }

    try {
      setSaving(true)

      const project = projects.find(p => p.id === projectId)

      const advanceData = {
        name: name.trim(),
        amount: parseFloat(amount.replace(',', '.')),
        workPeriodStart: workPeriodStart,
        workPeriodEnd: workPeriodEnd,
        reason: reason as AdvanceReason,
        projectId: projectId || null,
        reportId: null,
        reportName: null,
        observations: observations.trim(),
        createdByUserId: user.uid,
        createdByUserName: user.email || null,
        createdAtDateTime: new Date().toISOString(),
        status: AdvanceStatus.PENDENTE,
        statusHistory: [],
      }

      const advanceId = await createNewAdvance(advanceData)
      toast.success('Adiantamento criado com sucesso!')
      router.push(`/advances/${advanceId}`)
    } catch (error: any) {
      console.error('Erro ao criar adiantamento:', error)
      toast.error(error.message || 'Erro ao criar adiantamento')
    } finally {
      setSaving(false)
    }
  }

  const formatCurrency = (value: string) => {
    const numericValue = value.replace(/[^\d,.-]/g, '')
    return numericValue
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setAmount(formatCurrency(value))
  }

  if (roleLoading || operadorLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'rgb(222, 222, 222)' }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando...</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen" style={{ backgroundColor: 'rgb(222, 222, 222)' }}>
        {/* Header */}
        <div className="bg-white shadow-sm border-b sticky top-0 z-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="text-gray-600 hover:text-gray-900"
              >
                ← Voltar
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                Novo Adiantamento
              </h1>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
            <div className="space-y-6">
              {/* Nome */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Adiantamento Viagem - Janeiro 2024"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                  required
                />
              </div>

              {/* Valor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valor (R$) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={amount}
                  onChange={handleAmountChange}
                  placeholder="0,00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                  required
                />
              </div>

              {/* Período de Trabalho */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data Início <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={workPeriodStart}
                    onChange={(e) => setWorkPeriodStart(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data Fim <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={workPeriodEnd}
                    onChange={(e) => setWorkPeriodEnd(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                    required
                  />
                </div>
              </div>

              {/* Motivo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Motivo <span className="text-red-500">*</span>
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value as AdvanceReason)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                  required
                >
                  <option value="">Selecione...</option>
                  <option value={AdvanceReason.VIAGEM}>Viagem</option>
                  <option value={AdvanceReason.COMPRA_MATERIAL}>Compra de Material</option>
                  <option value={AdvanceReason.SERVICO_TERCEIRO}>Serviço de Terceiro</option>
                  <option value={AdvanceReason.OUTROS}>Outros</option>
                </select>
              </div>

              {/* Projeto */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Projeto
                </label>
                <select
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                >
                  <option value="">Selecione um projeto...</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name} - {project.companyName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Observações */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observações
                </label>
                <textarea
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                  placeholder="Digite observações sobre o adiantamento..."
                />
              </div>

              {/* Botões */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  )
}
