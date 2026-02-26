'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useAuthContext } from '@/contexts/AuthContext'
import { useUserRole } from '@/hooks/useUserRole'
import { getAllUsers, getAllUserProfiles, updateUserRole } from '@/lib/services/firestore'
import { UserRole, UserProfile } from '@/lib/models/types'
import { toast } from 'react-toastify'

interface UserItem {
    uid: string
    email: string
    role: UserRole
    displayName?: string
    fullName?: string
}

export default function AdminUsersPage() {
    const router = useRouter()
    const { user } = useAuthContext()
    const { role, isAdmin, loading: roleLoading } = useUserRole()

    const [users, setUsers] = useState<UserItem[]>([])
    const [loading, setLoading] = useState(true)
    const [savingId, setSavingId] = useState<string | null>(null)

    useEffect(() => {
        // Verificar acesso
        if (!roleLoading && !isAdmin) {
            router.push('/dashboard')
            return
        }

        const loadUsers = async () => {
            try {
                setLoading(true)
                const [usersData, profilesMap] = await Promise.all([
                    getAllUsers(),
                    getAllUserProfiles()
                ])

                const combinedUsers: UserItem[] = usersData.map((u: any) => {
                    const profile = profilesMap[u.uid]
                    return {
                        uid: u.uid,
                        email: u.email || '',
                        role: u.role as UserRole,
                        displayName: profile?.displayName,
                        fullName: profile?.fullName,
                    }
                })

                setUsers(combinedUsers)
            } catch (error) {
                console.error('Erro ao carregar usuários:', error)
                toast.error('Erro ao carregar usuários')
            } finally {
                setLoading(false)
            }
        }

        if (isAdmin) {
            loadUsers()
        }
    }, [isAdmin, roleLoading, router])

    const handleRoleChange = async (userId: string, newRole: UserRole) => {
        try {
            setSavingId(userId)
            await updateUserRole(userId, newRole)

            setUsers(prev => prev.map(u =>
                u.uid === userId ? { ...u, role: newRole } : u
            ))

            toast.success('Papel atualizado com sucesso!')
        } catch (error) {
            console.error('Erro ao atualizar papel:', error)
            toast.error('Erro ao atualizar papel')
        } finally {
            setSavingId(null)
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
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => router.back()}
                                className="text-gray-600 hover:text-gray-900"
                            >
                                ← Voltar
                            </button>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Gestão de Usuários
                            </h1>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Usuário / Email
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Nome Completo
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Nível de Acesso
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {users.map((item) => (
                                        <tr key={item.uid}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{item.displayName || 'Sem nome'}</div>
                                                <div className="text-sm text-gray-500">{item.email}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{item.fullName || '-'}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <select
                                                        value={item.role}
                                                        onChange={(e) => handleRoleChange(item.uid, e.target.value as UserRole)}
                                                        disabled={savingId === item.uid || item.uid === user?.uid}
                                                        className="text-sm border rounded p-1 focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100"
                                                    >
                                                        {Object.values(UserRole).map(r => (
                                                            <option key={r} value={r}>{r}</option>
                                                        ))}
                                                    </select>
                                                    {savingId === item.uid && (
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                                    )}
                                                    {item.uid === user?.uid && (
                                                        <span className="text-[10px] text-gray-400 italic">(Você)</span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {users.length === 0 && (
                            <div className="p-8 text-center text-gray-500">
                                Nenhum usuário encontrado no Firestore.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    )
}
