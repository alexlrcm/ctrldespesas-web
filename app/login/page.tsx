'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthContext } from '@/contexts/AuthContext'

export default function LoginPage() {
  const router = useRouter()
  const { login, user, loading: authLoading } = useAuthContext()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Redirecionar se já estiver logado
  useEffect(() => {
    if (user && !authLoading) {
      router.push('/dashboard')
    }
  }, [user, authLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      console.log('📝 Formulário enviado:', { email })
      await login(email, password)
      console.log('✅ Login concluído, redirecionando...')
      router.push('/dashboard')
    } catch (err: any) {
      console.error('❌ Erro no handleSubmit:', err)
      const errorMessage = err.message || 'Erro ao fazer login. Tente novamente.'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Mostrar loading enquanto verifica autenticação
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <img 
                src="/logo-giratech.png" 
                alt="Giratech Logo" 
                className="h-[168px] w-auto object-contain max-w-xs"
                onError={(e) => {
                  // Fallback caso o logo não exista - mostra texto
                  const target = e.currentTarget as HTMLImageElement
                  target.style.display = 'none'
                  if (!target.parentElement?.querySelector('.logo-fallback')) {
                    const fallback = document.createElement('div')
                    fallback.className = 'logo-fallback h-[168px] flex items-center justify-center text-primary text-2xl font-bold'
                    fallback.textContent = 'Giratech'
                    target.parentElement?.appendChild(fallback)
                  }
                }}
              />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Controle de Despesas</h1>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Senha
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Versão 1.6F - Web App</p>
          </div>
        </div>
      </div>
    </div>
  )
}
