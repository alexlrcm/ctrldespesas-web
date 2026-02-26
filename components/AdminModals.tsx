'use client'

import { useState, useEffect } from 'react'
import { Company, Project, ProjectStatus } from '@/lib/models/types'

interface CompanyModalProps {
    isOpen: boolean
    onClose: () => void
    onSave: (company: Omit<Company, 'id'>) => Promise<void>
    initialData?: Company | null
}

export function CompanyModal({ isOpen, onClose, onSave, initialData }: CompanyModalProps) {
    const [formData, setFormData] = useState<Omit<Company, 'id'>>({
        name: '',
        cnpj: '',
        address: '',
        complement: '',
        neighborhood: '',
        zipCode: '',
        state: '',
        approvalResponsibleName: '',
        approvalResponsibleRole: '',
        responsible1Name: '',
        responsible1Phone: '',
        responsible1Email: '',
        responsible2Name: '',
        responsible2Phone: '',
        responsible2Email: '',
    })
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || '',
                cnpj: initialData.cnpj || '',
                address: initialData.address || '',
                complement: initialData.complement || '',
                neighborhood: initialData.neighborhood || '',
                zipCode: initialData.zipCode || '',
                state: initialData.state || '',
                approvalResponsibleName: initialData.approvalResponsibleName || '',
                approvalResponsibleRole: initialData.approvalResponsibleRole || '',
                responsible1Name: initialData.responsible1Name || '',
                responsible1Phone: initialData.responsible1Phone || '',
                responsible1Email: initialData.responsible1Email || '',
                responsible2Name: initialData.responsible2Name || '',
                responsible2Phone: initialData.responsible2Phone || '',
                responsible2Email: initialData.responsible2Email || '',
            })
        } else {
            setFormData({
                name: '',
                cnpj: '',
                address: '',
                complement: '',
                neighborhood: '',
                zipCode: '',
                state: '',
                approvalResponsibleName: '',
                approvalResponsibleRole: '',
                responsible1Name: '',
                responsible1Phone: '',
                responsible1Email: '',
                responsible2Name: '',
                responsible2Phone: '',
                responsible2Email: '',
            })
        }
    }, [initialData, isOpen])

    if (!isOpen) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            await onSave(formData)
            onClose()
        } catch (error) {
            console.error('Erro ao salvar empresa:', error)
            alert('Erro ao salvar empresa')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <div className="p-6 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
                    <h2 className="text-xl font-bold text-gray-800">
                        {initialData ? 'Editar Empresa' : 'Nova Empresa'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Nome da Empresa *</label>
                            <input
                                required
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Ex: Minha Empresa LTDA"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">CNPJ *</label>
                            <input
                                required
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                value={formData.cnpj}
                                onChange={e => setFormData({ ...formData, cnpj: e.target.value })}
                                placeholder="00.000.000/0000-00"
                            />
                        </div>
                    </div>

                    <div className="border-t pt-4">
                        <h3 className="text-md font-bold text-gray-800 mb-4">Endereço</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Rua / Logradouro</label>
                                <input
                                    className="w-full p-3 border rounded-lg"
                                    value={formData.address || ''}
                                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">CEP</label>
                                <input
                                    className="w-full p-3 border rounded-lg"
                                    value={formData.zipCode || ''}
                                    onChange={e => setFormData({ ...formData, zipCode: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Bairro</label>
                                <input
                                    className="w-full p-3 border rounded-lg"
                                    value={formData.neighborhood || ''}
                                    onChange={e => setFormData({ ...formData, neighborhood: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Estado</label>
                                <input
                                    className="w-full p-3 border rounded-lg"
                                    value={formData.state || ''}
                                    onChange={e => setFormData({ ...formData, state: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Complemento</label>
                                <input
                                    className="w-full p-3 border rounded-lg"
                                    value={formData.complement || ''}
                                    onChange={e => setFormData({ ...formData, complement: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="border-t pt-4">
                        <h3 className="text-md font-bold text-gray-800 mb-4">Responsável pela Aprovação</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Nome</label>
                                <input
                                    className="w-full p-3 border rounded-lg"
                                    value={formData.approvalResponsibleName || ''}
                                    onChange={e => setFormData({ ...formData, approvalResponsibleName: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Cargo</label>
                                <input
                                    className="w-full p-3 border rounded-lg"
                                    value={formData.approvalResponsibleRole || ''}
                                    onChange={e => setFormData({ ...formData, approvalResponsibleRole: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="border rounded-xl p-4 bg-blue-50/30">
                            <h3 className="text-md font-bold text-gray-800 mb-4">Responsável 1</h3>
                            <div className="space-y-3">
                                <input
                                    placeholder="Nome"
                                    className="w-full p-2 border rounded-lg bg-white"
                                    value={formData.responsible1Name || ''}
                                    onChange={e => setFormData({ ...formData, responsible1Name: e.target.value })}
                                />
                                <input
                                    placeholder="Telefone"
                                    className="w-full p-2 border rounded-lg bg-white"
                                    value={formData.responsible1Phone || ''}
                                    onChange={e => setFormData({ ...formData, responsible1Phone: e.target.value })}
                                />
                                <input
                                    placeholder="Email"
                                    className="w-full p-2 border rounded-lg bg-white"
                                    value={formData.responsible1Email || ''}
                                    onChange={e => setFormData({ ...formData, responsible1Email: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="border rounded-xl p-4 bg-blue-50/30">
                            <h3 className="text-md font-bold text-gray-800 mb-4">Responsável 2</h3>
                            <div className="space-y-3">
                                <input
                                    placeholder="Nome"
                                    className="w-full p-2 border rounded-lg bg-white"
                                    value={formData.responsible2Name || ''}
                                    onChange={e => setFormData({ ...formData, responsible2Name: e.target.value })}
                                />
                                <input
                                    placeholder="Telefone"
                                    className="w-full p-2 border rounded-lg bg-white"
                                    value={formData.responsible2Phone || ''}
                                    onChange={e => setFormData({ ...formData, responsible2Phone: e.target.value })}
                                />
                                <input
                                    placeholder="Email"
                                    className="w-full p-2 border rounded-lg bg-white"
                                    value={formData.responsible2Email || ''}
                                    onChange={e => setFormData({ ...formData, responsible2Email: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t flex gap-3 justify-end sticky bottom-0 bg-white">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 border rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg disabled:opacity-50"
                        >
                            {loading ? 'Salvando...' : 'Salvar Empresa'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

interface ProjectModalProps {
    isOpen: boolean
    onClose: () => void
    onSave: (project: Omit<Project, 'id'>) => Promise<void>
    companies: Company[]
    initialData?: Project | null
}

export function ProjectModal({ isOpen, onClose, onSave, companies, initialData }: ProjectModalProps) {
    const [formData, setFormData] = useState<Omit<Project, 'id'>>({
        name: '',
        companyId: '',
        companyName: '',
        companyCnpj: '',
        referenceNumber: '',
        date: '',
        responsibleName: '',
        documentationLink: '',
        status: ProjectStatus.ATIVO,
        observation: '',
    })
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || '',
                companyId: initialData.companyId || '',
                companyName: initialData.companyName || '',
                companyCnpj: initialData.companyCnpj || '',
                referenceNumber: initialData.referenceNumber || '',
                date: initialData.date || '',
                responsibleName: initialData.responsibleName || '',
                documentationLink: initialData.documentationLink || '',
                status: initialData.status || ProjectStatus.ATIVO,
                observation: initialData.observation || '',
            })
        } else {
            setFormData({
                name: '',
                companyId: '',
                companyName: '',
                companyCnpj: '',
                referenceNumber: '',
                date: '',
                responsibleName: '',
                documentationLink: '',
                status: ProjectStatus.ATIVO,
                observation: '',
            })
        }
    }, [initialData, isOpen])

    if (!isOpen) return null

    const handleCompanyChange = (companyId: string) => {
        const selected = companies.find(c => c.id === companyId)
        if (selected) {
            setFormData({
                ...formData,
                companyId: selected.id,
                companyName: selected.name,
                companyCnpj: selected.cnpj,
            })
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            await onSave(formData)
            onClose()
        } catch (error) {
            console.error('Erro ao salvar projeto:', error)
            alert('Erro ao salvar projeto')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col">
                <div className="p-6 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
                    <h2 className="text-xl font-bold text-gray-800">
                        {initialData ? 'Editar Projeto' : 'Novo Projeto'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Nome do Projeto *</label>
                        <input
                            required
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Ex: Reforma Escritório Central"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Empresa Vinculada *</label>
                        <select
                            required
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                            value={formData.companyId}
                            onChange={e => handleCompanyChange(e.target.value)}
                        >
                            <option value="">Selecione uma empresa...</option>
                            {companies.map(c => (
                                <option key={c.id} value={c.id}>{c.name} ({c.cnpj})</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Número de Referência</label>
                            <input
                                className="w-full p-3 border rounded-lg"
                                value={formData.referenceNumber || ''}
                                onChange={e => setFormData({ ...formData, referenceNumber: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Data</label>
                            <input
                                type="date"
                                className="w-full p-3 border rounded-lg"
                                value={formData.date || ''}
                                onChange={e => setFormData({ ...formData, date: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Responsável</label>
                        <input
                            className="w-full p-3 border rounded-lg"
                            value={formData.responsibleName || ''}
                            onChange={e => setFormData({ ...formData, responsibleName: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Link da Documentação</label>
                        <input
                            className="w-full p-3 border rounded-lg"
                            value={formData.documentationLink || ''}
                            onChange={e => setFormData({ ...formData, documentationLink: e.target.value })}
                            placeholder="https://..."
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Status</label>
                        <select
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                            value={formData.status || ProjectStatus.ATIVO}
                            onChange={e => setFormData({ ...formData, status: e.target.value as ProjectStatus })}
                        >
                            <option value={ProjectStatus.ATIVO}>Ativo</option>
                            <option value={ProjectStatus.ORCAMENTO}>Orçamento</option>
                            <option value={ProjectStatus.ESPERA}>Espera</option>
                            <option value={ProjectStatus.FATURAMENTO}>Faturamento</option>
                            <option value={ProjectStatus.FINALIZADO}>Finalizado</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Observação</label>
                        <textarea
                            className="w-full p-3 border rounded-lg"
                            value={formData.observation || ''}
                            onChange={e => setFormData({ ...formData, observation: e.target.value })}
                            rows={3}
                            placeholder="Observações sobre o projeto..."
                        />
                    </div>

                    <div className="pt-6 border-t flex gap-3 justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 border rounded-lg text-gray-600 hover:bg-gray-100"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-lg disabled:opacity-50"
                        >
                            {loading ? 'Salvando...' : 'Salvar Projeto'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
