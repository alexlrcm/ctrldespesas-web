'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useAuthContext } from '@/contexts/AuthContext'
import { useUserRole } from '@/hooks/useUserRole'
import { useOperador } from '@/hooks/useOperador'
import { UserRole, Project, Company, ProjectStatus } from '@/lib/models/types'
import { ProjectModal, CompanyModal } from '@/components/AdminModals'

export default function ProjectsPage() {
  const router = useRouter()
  const { user } = useAuthContext()
  const { role, isOperador, isAdmin, isFinanceiro, loading: roleLoading } = useUserRole()
  const {
    projects,
    companies,
    loading: operadorLoading,
    createProjectData,
    updateProjectData,
    deleteProjectData,
    createCompanyData,
    updateCompanyData,
    deleteCompanyData,
  } = useOperador()

  const [activeTab, setActiveTab] = useState<'projects' | 'companies'>('projects')
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false)
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [editingCompany, setEditingCompany] = useState<Company | null>(null)
  const [viewingCompany, setViewingCompany] = useState<Company | null>(null)

  // Verificar acesso: OPERADOR, ADMINISTRADOR ou FINANCEIRO
  useEffect(() => {
    if (!roleLoading && !isOperador && !isAdmin && !isFinanceiro) {
      router.push('/dashboard')
    }
  }, [role, isOperador, isAdmin, isFinanceiro, roleLoading, router])

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Não informado'
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

  const getStatusInfo = (status: ProjectStatus | undefined) => {
    switch (status) {
      case ProjectStatus.ATIVO:
        return { text: 'Ativo', color: 'bg-green-100 text-green-800 border-green-300' }
      case ProjectStatus.ORCAMENTO:
        return { text: 'Orçamento', color: 'bg-orange-100 text-orange-800 border-orange-300' }
      case ProjectStatus.ESPERA:
        return { text: 'Espera', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' }
      case ProjectStatus.FATURAMENTO:
        return { text: 'Faturamento', color: 'bg-purple-100 text-purple-800 border-purple-300' }
      case ProjectStatus.FINALIZADO:
        return { text: 'Finalizado', color: 'bg-gray-100 text-gray-800 border-gray-300' }
      default:
        return { text: 'Ativo', color: 'bg-green-100 text-green-800 border-green-300' }
    }
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

  const handleEditProject = (e: React.MouseEvent, project: Project) => {
    e.stopPropagation()
    setEditingProject(project)
    setIsProjectModalOpen(true)
  }

  const handleDeleteProject = async (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation()
    if (confirm('Tem certeza que deseja excluir este projeto?')) {
      try {
        await deleteProjectData(projectId)
      } catch (error) {
        alert('Erro ao excluir projeto')
      }
    }
  }

  const handleEditCompany = (company: Company) => {
    setEditingCompany(company)
    setIsCompanyModalOpen(true)
  }

  const handleDeleteCompany = async (companyId: string) => {
    if (confirm('Tem certeza que deseja excluir esta empresa? Todos os projetos vinculados serão afetados.')) {
      try {
        await deleteCompanyData(companyId)
      } catch (error) {
        alert('Erro ao excluir empresa')
      }
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen" style={{ backgroundColor: 'rgb(222, 222, 222)' }}>
        {/* Header */}
        <div className="bg-white shadow-sm border-b sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.back()}
                  className="text-gray-600 hover:text-gray-900"
                >
                  ← Voltar
                </button>
                <h1 className="text-2xl font-bold text-gray-900">
                  {activeTab === 'projects' ? `Projetos (${projects.length})` : `Empresas (${companies.length})`}
                </h1>
              </div>

              {isAdmin && (
                <button
                  onClick={() => {
                    if (activeTab === 'projects') {
                      setEditingProject(null)
                      setIsProjectModalOpen(true)
                    } else {
                      setEditingCompany(null)
                      setIsCompanyModalOpen(true)
                    }
                  }}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md"
                >
                  + {activeTab === 'projects' ? 'Novo Projeto' : 'Nova Empresa'}
                </button>
              )}
            </div>

            {/* Tabs (Only if Admin or if we want to show companies to Operador too) */}
            <div className="flex gap-8 mt-6 border-b">
              <button
                onClick={() => setActiveTab('projects')}
                className={`pb-2 px-1 font-medium transition-colors border-b-2 ${activeTab === 'projects'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
              >
                Projetos
              </button>
              <button
                onClick={() => setActiveTab('companies')}
                className={`pb-2 px-1 font-medium transition-colors border-b-2 ${activeTab === 'companies'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
              >
                Empresas
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'projects' ? (
            projects.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
                Nenhum projeto encontrado
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all border-l-4 border-blue-500 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 line-clamp-2">
                            {project.name}
                          </h3>
                          <span className={`inline-block mt-2 px-2 py-1 text-xs font-semibold rounded border ${getStatusInfo(project.status).color}`}>
                            {getStatusInfo(project.status).text}
                          </span>
                        </div>
                        {isAdmin && (
                          <div className="flex gap-2 ml-2">
                            <button
                              onClick={(e) => handleEditProject(e, project)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                              title="Editar"
                            >
                              ✎
                            </button>
                            <button
                              onClick={(e) => handleDeleteProject(e, project.id)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                              title="Excluir"
                            >
                              🗑
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="space-y-2 text-sm text-gray-600">
                        {project.observation && (
                          <p className="flex items-start gap-2">
                            <span className="font-bold text-gray-700">📝 Observação:</span> 
                            <span className="text-gray-600">{project.observation}</span>
                          </p>
                        )}
                        <p className="flex items-center gap-2">
                          <span className="font-bold text-gray-700">🏢 Empresa:</span> {project.companyName}
                        </p>
                        {project.referenceNumber && (
                          <p className="flex items-center gap-2">
                            <span className="font-bold text-gray-700"># Ref:</span> {project.referenceNumber}
                          </p>
                        )}
                        {project.date && (
                          <p className="flex items-center gap-2">
                            <span className="font-bold text-gray-700">📅 Data:</span> {formatDate(project.date)}
                          </p>
                        )}
                        {project.responsibleName && (
                          <p className="flex items-center gap-2">
                            <span className="font-bold text-gray-700">👤 Responsável:</span> {project.responsibleName}
                          </p>
                        )}
                      </div>
                    </div>
                    {project.documentationLink && (
                      <div className="mt-4 pt-4 border-t">
                        <a
                          href={project.documentationLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 font-semibold hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Ver Documentação →
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )
          ) : (
            /* Empresas Tab */
            companies.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
                Nenhuma empresa encontrada
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {companies.map((company) => (
                  <div
                    key={company.id}
                    className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500 cursor-pointer hover:shadow-lg transition-all"
                    onClick={() => setViewingCompany(company)}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-bold text-gray-900">{company.name}</h3>
                      {isAdmin && (
                        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEditCompany(company)
                            }}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                          >
                            ✎
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteCompany(company.id)
                            }}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                          >
                            🗑
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p><span className="font-bold text-gray-700">CNPJ:</span> {company.cnpj}</p>
                      {company.address && (
                        <p><span className="font-bold text-gray-700">Endereço:</span> {company.address}, {company.neighborhood}</p>
                      )}
                      {company.approvalResponsibleName && (
                        <p><span className="font-bold text-gray-700">Aprovador:</span> {company.approvalResponsibleName}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>

        {/* Modals */}
        <ProjectModal
          isOpen={isProjectModalOpen}
          onClose={() => setIsProjectModalOpen(false)}
          companies={companies}
          initialData={editingProject}
          onSave={async (data) => {
            if (editingProject) {
              await updateProjectData(editingProject.id, data)
            } else {
              await createProjectData(data)
            }
          }}
        />

        <CompanyModal
          isOpen={isCompanyModalOpen}
          onClose={() => setIsCompanyModalOpen(false)}
          initialData={editingCompany}
          onSave={async (data) => {
            if (editingCompany) {
              await updateCompanyData(editingCompany.id, data)
            } else {
              await createCompanyData(data)
            }
          }}
        />

        {/* Popup de Visualização de Empresa */}
        {viewingCompany && (
          <div 
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50"
            onClick={() => setViewingCompany(null)}
          >
            <div 
              className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b flex justify-between items-center bg-gray-50 rounded-t-xl sticky top-0">
                <h2 className="text-xl font-bold text-gray-800">
                  Informações da Empresa
                </h2>
                <button 
                  onClick={() => setViewingCompany(null)} 
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  &times;
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="space-y-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{viewingCompany.name}</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-1">CNPJ</p>
                      <p className="text-sm text-gray-600">{viewingCompany.cnpj || 'Não informado'}</p>
                    </div>

                    {viewingCompany.state && (
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-1">Estado</p>
                        <p className="text-sm text-gray-600">{viewingCompany.state}</p>
                      </div>
                    )}
                  </div>

                  {viewingCompany.address && (
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-1">Endereço</p>
                      <p className="text-sm text-gray-600">
                        {viewingCompany.address}
                        {viewingCompany.complement && `, ${viewingCompany.complement}`}
                        {viewingCompany.neighborhood && `, ${viewingCompany.neighborhood}`}
                        {viewingCompany.zipCode && ` - CEP: ${viewingCompany.zipCode}`}
                      </p>
                    </div>
                  )}

                  {viewingCompany.approvalResponsibleName && (
                    <div className="border-t pt-4">
                      <p className="text-sm font-semibold text-gray-700 mb-2">Aprovador</p>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">
                          <span className="font-semibold">Nome:</span> {viewingCompany.approvalResponsibleName}
                        </p>
                        {viewingCompany.approvalResponsibleRole && (
                          <p className="text-sm text-gray-600">
                            <span className="font-semibold">Cargo:</span> {viewingCompany.approvalResponsibleRole}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {(viewingCompany.responsible1Name || viewingCompany.responsible2Name) && (
                    <div className="border-t pt-4">
                      <p className="text-sm font-semibold text-gray-700 mb-2">Responsáveis</p>
                      <div className="space-y-3">
                        {viewingCompany.responsible1Name && (
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-sm font-semibold text-gray-700 mb-1">Responsável 1</p>
                            <p className="text-sm text-gray-600">
                              <span className="font-semibold">Nome:</span> {viewingCompany.responsible1Name}
                            </p>
                            {viewingCompany.responsible1Phone && (
                              <p className="text-sm text-gray-600">
                                <span className="font-semibold">Telefone:</span> {viewingCompany.responsible1Phone}
                              </p>
                            )}
                            {viewingCompany.responsible1Email && (
                              <p className="text-sm text-gray-600">
                                <span className="font-semibold">Email:</span> {viewingCompany.responsible1Email}
                              </p>
                            )}
                          </div>
                        )}

                        {viewingCompany.responsible2Name && (
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-sm font-semibold text-gray-700 mb-1">Responsável 2</p>
                            <p className="text-sm text-gray-600">
                              <span className="font-semibold">Nome:</span> {viewingCompany.responsible2Name}
                            </p>
                            {viewingCompany.responsible2Phone && (
                              <p className="text-sm text-gray-600">
                                <span className="font-semibold">Telefone:</span> {viewingCompany.responsible2Phone}
                              </p>
                            )}
                            {viewingCompany.responsible2Email && (
                              <p className="text-sm text-gray-600">
                                <span className="font-semibold">Email:</span> {viewingCompany.responsible2Email}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 border-t bg-gray-50 rounded-b-xl">
                <button
                  onClick={() => setViewingCompany(null)}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}
