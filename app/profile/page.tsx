'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useAuthContext } from '@/contexts/AuthContext'
import { useUserRole } from '@/hooks/useUserRole'
import { getUserProfile, updateUserProfile } from '@/lib/services/firestore'
import { AccountType, UserRole } from '@/lib/models/types'
import { toast } from 'react-toastify'

export default function ProfilePage() {
  const router = useRouter()
  const { user } = useAuthContext()
  const { role, loading: roleLoading } = useUserRole()

  const [displayName, setDisplayName] = useState('')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [cpf, setCpf] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [phone, setPhone] = useState('')
  const [bank, setBank] = useState('')
  const [agency, setAgency] = useState('')
  const [account, setAccount] = useState('')
  const [accountType, setAccountType] = useState<AccountType>(AccountType.CC)
  const [pixKey, setPixKey] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Carregar perfil
  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.uid) return

      try {
        setLoading(true)
        const profile = await getUserProfile(user.uid)
        
        if (profile) {
          setDisplayName(profile.displayName || '')
          setFullName(profile.fullName || '')
          setEmail(profile.email || user.email || '')
          setCpf(profile.cpf || '')
          setBirthDate(profile.birthDate || '')
          setPhone(profile.phone || '')
          setBank(profile.bank || '')
          setAgency(profile.agency || '')
          setAccount(profile.account || '')
          setAccountType(profile.accountType || AccountType.CC)
          setPixKey(profile.pixKey || '')
        } else {
          // Criar perfil vazio se não existir
          setEmail(user.email || '')
        }
      } catch (error: any) {
        console.error('Erro ao carregar perfil:', error)
        toast.error('Erro ao carregar perfil')
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [user?.uid, user?.email])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user?.uid) {
      toast.error('Usuário não autenticado')
      return
    }

    try {
      setSaving(true)

      const profileData = {
        displayName: displayName.trim(),
        fullName: fullName.trim(),
        email: email.trim() || user.email || '',
        cpf: cpf.trim(),
        birthDate: birthDate.trim(),
        phone: phone.trim(),
        bank: bank.trim(),
        agency: agency.trim(),
        account: account.trim(),
        accountType,
        pixKey: pixKey.trim(),
      }

      // Criar ou atualizar perfil
      await updateUserProfile(user.uid, profileData)

      toast.success('Perfil atualizado com sucesso!')
    } catch (error: any) {
      console.error('Erro ao salvar perfil:', error)
      toast.error(error.message || 'Erro ao salvar perfil')
    } finally {
      setSaving(false)
    }
  }

  if (roleLoading || loading) {
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
                Perfil do Usuário
              </h1>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
            <div className="space-y-6">
              {/* Dados Pessoais */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  1 - Dados Pessoais
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      1.1 - Nome para exibição
                    </label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      1.2 - Nome Completo
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      1.3 - Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      1.4 - CPF
                    </label>
                    <input
                      type="text"
                      value={cpf}
                      onChange={(e) => setCpf(e.target.value)}
                      placeholder="000.000.000-00"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      1.5 - Data de Nascimento
                    </label>
                    <input
                      type="date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      1.6 - Telefone
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(00) 00000-0000"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Dados Bancários */}
              <div className="pt-6 border-t">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  2 - Dados Bancários
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      2.1 - Banco
                    </label>
                    <input
                      type="text"
                      value={bank}
                      onChange={(e) => setBank(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      2.2 - Agência
                    </label>
                    <input
                      type="text"
                      value={agency}
                      onChange={(e) => setAgency(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      2.3 - Conta
                    </label>
                    <input
                      type="text"
                      value={account}
                      onChange={(e) => setAccount(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      2.4 - Tipo de Conta
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value={AccountType.CC}
                          checked={accountType === AccountType.CC}
                          onChange={(e) => setAccountType(e.target.value as AccountType)}
                          className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                        />
                        <span className="ml-2 text-sm text-gray-700">Conta Corrente</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value={AccountType.CP}
                          checked={accountType === AccountType.CP}
                          onChange={(e) => setAccountType(e.target.value as AccountType)}
                          className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                        />
                        <span className="ml-2 text-sm text-gray-700">Conta Poupança</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      2.5 - Chave PIX
                    </label>
                    <input
                      type="text"
                      value={pixKey}
                      onChange={(e) => setPixKey(e.target.value)}
                      placeholder="CPF, Email, Telefone ou Chave Aleatória"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Botões */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
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
