import { useState, useEffect } from 'react'
import { useAuthContext } from '@/contexts/AuthContext'
import { getUserRoleByEmail, getUserRoleById } from '@/lib/services/firestore'
import { UserRole } from '@/lib/models/types'

export function useUserRole() {
  const { user, loading: authLoading, getCustomUser } = useAuthContext()
  const [role, setRole] = useState<UserRole | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return

    const loadRole = async () => {
      if (!user?.uid || !user?.email) {
        setRole(null)
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        console.log('🔍 useUserRole: Buscando role para:', {
          uid: user.uid,
          email: user.email
        })
        
        // Tentar obter role do usuário customizado primeiro (já vem do login)
        const customUser = getCustomUser?.()
        if (customUser?.role) {
          console.log('✅ Role obtido do usuário customizado:', customUser.role)
          setRole(customUser.role)
          setLoading(false)
          return
        }
        
        // Fallback: buscar no Firestore
        console.log('🔄 Usuário customizado não disponível, buscando no Firestore...')
        
        // Tentar buscar por email primeiro (mais comum)
        let userRole = await getUserRoleByEmail(user.email)
        
        console.log('📋 Resultado busca por email:', userRole)
        
        // Se não encontrar por email, tentar por ID
        if (!userRole) {
          console.log('🔄 Tentando buscar por ID:', user.uid)
          userRole = await getUserRoleById(user.uid)
          console.log('📋 Resultado busca por ID:', userRole)
        }

        if (userRole) {
          console.log('✅ Role encontrado:', userRole)
        } else {
          console.warn('⚠️ Nenhum role encontrado para o usuário:', {
            uid: user.uid,
            email: user.email
          })
        }

        setRole(userRole)
      } catch (error) {
        console.error('❌ Erro ao buscar role do usuário:', error)
        setRole(null)
      } finally {
        setLoading(false)
      }
    }

    loadRole()
  }, [user?.uid, user?.email, authLoading, getCustomUser])

  const isFinanceiro = role === UserRole.FINANCEIRO
  const isAprovador = role === UserRole.APROVADOR
  const isOperador = role === UserRole.OPERADOR
  const isAdmin = role === UserRole.ADMINISTRADOR

  return {
    role,
    loading: loading || authLoading,
    isFinanceiro,
    isAprovador,
    isOperador,
    isAdmin,
  }
}
