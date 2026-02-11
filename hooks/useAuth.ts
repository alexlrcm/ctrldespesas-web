import { useState, useEffect } from 'react'
import { 
  User as FirebaseUser, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
} from 'firebase/auth'
import { auth } from '@/lib/firebase/config'
import { loginWithFirestore, User as CustomUser } from '@/lib/services/auth'

export interface AuthUser {
  uid: string
  email: string | null
  displayName?: string | null
}

// Estado customizado para armazenar usuário do Firestore
let customUserState: CustomUser | null = null

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Verificar se há usuário customizado salvo no sessionStorage
    const savedUser = sessionStorage.getItem('customUser')
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser) as CustomUser
        customUserState = parsedUser
        setUser({
          uid: parsedUser.id,
          email: parsedUser.email,
          displayName: null,
        })
      } catch (e) {
        console.error('Erro ao restaurar usuário:', e)
        sessionStorage.removeItem('customUser')
      }
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    try {
      setError(null)
      setLoading(true)
      
      console.log('🔐 Tentando fazer login customizado com:', email)
      const customUser = await loginWithFirestore(email, password)
      
      if (!customUser) {
        throw new Error('Credenciais inválidas.')
      }

      // Salvar usuário no estado e sessionStorage
      customUserState = customUser
      sessionStorage.setItem('customUser', JSON.stringify(customUser))
      
      setUser({
        uid: customUser.id,
        email: customUser.email,
        displayName: null,
      })
      
      console.log('✅ Login bem-sucedido:', customUser.email)
      return customUser
    } catch (err: any) {
      console.error('❌ Erro no login:', err)
      const errorMessage = err.message || 'Credenciais inválidas.'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      setError(null)
      customUserState = null
      sessionStorage.removeItem('customUser')
      setUser(null)
      
      // Tentar fazer logout do Firebase Auth também (caso tenha sido usado antes)
      if (auth) {
        try {
          await firebaseSignOut(auth)
        } catch (e) {
          // Ignorar erro se não houver usuário no Firebase Auth
        }
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao fazer logout'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  const register = async (email: string, password: string) => {
    throw new Error('Registro não implementado. Use o Firebase Console para criar usuários.')
  }

  const changePassword = async (newPassword: string) => {
    throw new Error('Alteração de senha não implementada.')
  }

  const resetPassword = async (email: string) => {
    throw new Error('Recuperação de senha não implementada.')
  }
  
  // Função auxiliar para obter o usuário customizado
  const getCustomUser = (): CustomUser | null => {
    return customUserState
  }

  return {
    user,
    loading,
    error,
    login,
    logout,
    register,
    changePassword,
    resetPassword,
    getCustomUser,
  }
}

function getAuthErrorMessage(errorCode: string): string {
  const errorMessages: { [key: string]: string } = {
    'auth/user-not-found': 'Usuário não encontrado.',
    'auth/wrong-password': 'Senha incorreta.',
    'auth/invalid-email': 'Email inválido.',
    'auth/user-disabled': 'Usuário desabilitado.',
    'auth/email-already-in-use': 'Este email já está em uso.',
    'auth/weak-password': 'Senha muito fraca. Use pelo menos 6 caracteres.',
    'auth/operation-not-allowed': 'Operação não permitida. Contate o administrador.',
    'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde.',
    'auth/network-request-failed': 'Erro de conexão. Verifique sua internet.',
    'auth/invalid-credential': 'Credenciais inválidas.',
    'auth/api-key-not-valid': 'API Key do Firebase inválida. Verifique o arquivo .env.local e reinicie o servidor.',
    'auth/api-key-not-valid.-please-pass-a-valid-api-key': 'API Key do Firebase inválida. Verifique o arquivo .env.local e reinicie o servidor.',
  }

  return errorMessages[errorCode] || `Erro ao autenticar: ${errorCode}. Verifique o console para mais detalhes.`
}
