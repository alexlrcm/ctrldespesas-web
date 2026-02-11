import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { UserRole } from '@/lib/models/types'

const COLLECTION_USERS = 'users'

export interface User {
  id: string
  email: string
  password: string
  role: UserRole
  mustChangePassword: boolean
}

/**
 * Login customizado usando Firestore (igual ao app Android)
 * Busca o usuário no Firestore e compara a senha
 */
export async function loginWithFirestore(
  email: string,
  password: string
): Promise<User | null> {
  try {
    console.log('🔐 Tentando fazer login customizado com:', email)

    // Normalizar email
    const normalizedEmail = email.trim().toLowerCase()

    // Buscar usuário por email no Firestore
    const usersQuery = query(
      collection(db, COLLECTION_USERS),
      where('email', '==', email) // Busca exata primeiro
    )

    let snapshot = await getDocs(usersQuery)

    // Se não encontrou com busca exata, tentar buscar todos e comparar
    if (snapshot.empty) {
      console.log('🔄 Busca exata não encontrou, tentando busca alternativa...')
      const allUsersSnapshot = await getDocs(collection(db, COLLECTION_USERS))
      
      for (const doc of allUsersSnapshot.docs) {
        const userData = doc.data()
        const userEmail = userData.email?.trim().toLowerCase()
        
        if (userEmail === normalizedEmail) {
          console.log('✅ Usuário encontrado na busca alternativa')
          
          // Verificar senha
          const storedPassword = userData.password || ''
          if (storedPassword === password) {
            console.log('✅ Senha correta!')
            return {
              id: doc.id,
              email: userData.email,
              password: storedPassword,
              role: userData.role as UserRole,
              mustChangePassword: userData.mustChangePassword || false,
            }
          } else {
            console.warn('❌ Senha incorreta')
            return null
          }
        }
      }
      
      console.warn('⚠️ Usuário não encontrado')
      return null
    }

    // Usuário encontrado com busca exata
    const userDoc = snapshot.docs[0]
    const userData = userDoc.data()

    console.log('📋 Dados do usuário encontrado:', {
      id: userDoc.id,
      email: userData.email,
      role: userData.role,
      passwordLength: userData.password?.length || 0,
    })

    // Verificar senha
    const storedPassword = userData.password || ''
    if (storedPassword !== password) {
      console.warn('❌ Senha incorreta', {
        storedLength: storedPassword.length,
        providedLength: password.length,
        stored: storedPassword.substring(0, 3) + '...',
        provided: password.substring(0, 3) + '...',
      })
      return null
    }

    console.log('✅ Login bem-sucedido!')
    return {
      id: userDoc.id,
      email: userData.email,
      password: storedPassword,
      role: userData.role as UserRole,
      mustChangePassword: userData.mustChangePassword || false,
    }
  } catch (error) {
    console.error('❌ Erro ao fazer login:', error)
    throw error
  }
}
