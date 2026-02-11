import { initializeApp, getApps, FirebaseApp } from 'firebase/app'
import { getFirestore, Firestore } from 'firebase/firestore'
import { getStorage, FirebaseStorage } from 'firebase/storage'
import { getAuth, Auth } from 'firebase/auth'

// Debug: verificar variáveis de ambiente
const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY
const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
const messagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID

const firebaseConfig = {
  apiKey: apiKey,
  authDomain: authDomain,
  projectId: projectId,
  storageBucket: storageBucket,
  messagingSenderId: messagingSenderId,
  appId: appId,
}

// Validar configuração
if (typeof window !== 'undefined') {
  // Debug detalhado: mostrar valores das variáveis de ambiente
  console.log('🔍 ========================================')
  console.log('🔍 DEBUG - Variáveis de Ambiente')
  console.log('🔍 ========================================')
  console.log('NEXT_PUBLIC_FIREBASE_API_KEY existe?', !!apiKey)
  console.log('NEXT_PUBLIC_FIREBASE_API_KEY valor:', apiKey ? `${apiKey.substring(0, 20)}...` : 'UNDEFINED')
  console.log('NEXT_PUBLIC_FIREBASE_API_KEY completo:', apiKey || 'UNDEFINED')
  console.log('NEXT_PUBLIC_FIREBASE_PROJECT_ID:', projectId || 'UNDEFINED')
  console.log('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:', authDomain || 'UNDEFINED')
  console.log('🔍 ========================================')
  
  const missingVars = Object.entries(firebaseConfig)
    .filter(([_, value]) => !value || value === 'undefined')
    .map(([key]) => key)
  
  if (missingVars.length > 0) {
    console.error('❌ Variáveis Firebase não configuradas:', missingVars)
    console.error('Verifique o arquivo .env.local')
    console.error('Valores atuais do firebaseConfig:', firebaseConfig)
    console.error('⚠️ IMPORTANTE: Reinicie o servidor após editar .env.local!')
    console.error('⚠️ Verifique se o arquivo .env.local está na pasta web-app/')
  } else {
    console.log('✅ Firebase configurado corretamente')
    console.log('📋 Config resumida:', {
      projectId: firebaseConfig.projectId,
      authDomain: firebaseConfig.authDomain,
      apiKey: firebaseConfig.apiKey ? `${firebaseConfig.apiKey.substring(0, 20)}...` : 'não configurado',
      apiKeyLength: firebaseConfig.apiKey?.length || 0
    })
    
    // Verificar se a API Key parece válida
    if (firebaseConfig.apiKey && !firebaseConfig.apiKey.startsWith('AIza')) {
      console.warn('⚠️ AVISO: API Key não começa com "AIza". Pode estar incorreta!')
    }
  }
}

let app: FirebaseApp
let db: Firestore
let storage: FirebaseStorage
let auth: Auth

if (typeof window !== 'undefined') {
  // Client-side
  try {
    if (!getApps().length) {
      console.log('🔧 Inicializando Firebase App...')
      app = initializeApp(firebaseConfig)
      console.log('✅ Firebase App inicializado com sucesso')
    } else {
      app = getApps()[0]
      console.log('✅ Firebase App já estava inicializado')
    }
    db = getFirestore(app)
    storage = getStorage(app)
    auth = getAuth(app)
    console.log('✅ Firebase Auth, Firestore e Storage configurados')
  } catch (error: any) {
    console.error('❌ Erro ao inicializar Firebase:', error)
    console.error('Config usada:', {
      projectId: firebaseConfig.projectId,
      authDomain: firebaseConfig.authDomain,
      apiKey: firebaseConfig.apiKey ? `${firebaseConfig.apiKey.substring(0, 20)}...` : 'UNDEFINED'
    })
    throw error
  }
} else {
  // Server-side - inicializar apenas o necessário
  if (!getApps().length) {
    app = initializeApp(firebaseConfig)
  } else {
    app = getApps()[0]
  }
  db = getFirestore(app)
  storage = getStorage(app)
  auth = getAuth(app)
}

export { db, storage, auth }
export default app
