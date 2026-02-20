import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, Plus, Edit, Trash2, Save, X, AlertCircle, 
  Search, Filter, TrendingUp, TrendingDown, AlertTriangle 
} from 'lucide-react';

interface Material {
  id: string;
  nome: string;
  tipo: 'filamento' | 'resina' | 'acessorio' | 'peca';
  marca?: string;
  cor?: string;
  peso?: number; // em kg
  quantidade: number;
  unidade: 'kg' | 'litro' | 'unidade';
  precoCompra: number;
  precoVenda: number;
  estoqueMinimo: number;
  fornecedor?: string;
  dataCompra?: string;
  observacoes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export default function AdminEstoque() {
  const navigate = useNavigate();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [filteredMaterials, setFilteredMaterials] = useState<Material[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<Material>>({
    nome: '',
    tipo: 'filamento',
    marca: '',
    cor: '',
    peso: 0,
    quantidade: 0,
    unidade: 'kg',
    precoCompra: 0,
    precoVenda: 0,
    estoqueMinimo: 0,
    fornecedor: '',
    dataCompra: new Date().toISOString().split('T')[0],
    observacoes: ''
  });

  // Carregar materiais
  useEffect(() => {
    loadMaterials();
  }, []);

  // Filtrar materiais
  useEffect(() => {
    let filtered = materials;

    // Filtro por tipo
    if (filterType !== 'all') {
      filtered = filtered.filter(m => m.tipo === filterType);
    }

    // Filtro por busca
    if (searchTerm) {
      filtered = filtered.filter(m => 
        m.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.marca?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.fornecedor?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredMaterials(filtered);
  }, [materials, searchTerm, filterType]);

  const loadMaterials = () => {
    const stored = localStorage.getItem('materials');
    if (stored) {
      setMaterials(JSON.parse(stored));
    }
  };

  const saveMaterials = (newMaterials: Material[]) => {
    localStorage.setItem('materials', JSON.stringify(newMaterials));
    setMaterials(newMaterials);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingMaterial) {
      // Atualizar material existente
      const updated = materials.map(m => 
        m.id === editingMaterial.id 
          ? { ...formData, id: m.id, updatedAt: new Date() } as Material
          : m
      );
      saveMaterials(updated);
    } else {
      // Criar novo material
      const newMaterial: Material = {
        ...formData,
        id: `mat_${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date()
      } as Material;
      saveMaterials([...materials, newMaterial]);
    }

    resetForm();
  };

  const handleEdit = (material: Material) => {
    setEditingMaterial(material);
    setFormData(material);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este material?')) {
      saveMaterials(materials.filter(m => m.id !== id));
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      tipo: 'filamento',
      marca: '',
      cor: '',
      peso: 0,
      quantidade: 0,
      unidade: 'kg',
      precoCompra: 0,
      precoVenda: 0,
      estoqueMinimo: 0,
      fornecedor: '',
      dataCompra: new Date().toISOString().split('T')[0],
      observacoes: ''
    });
    setEditingMaterial(null);
    setShowForm(false);
  };

  // Estatísticas
  const totalValue = materials.reduce((sum, m) => sum + (m.quantidade * m.precoCompra), 0);
  const lowStock = materials.filter(m => m.quantidade <= m.estoqueMinimo).length;
  const totalItems = materials.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gestão de Estoque</h1>
              <p className="text-sm text-gray-600">Materiais e insumos para produção</p>
            </div>
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="text-gray-600 hover:text-gray-900"
            >
              ← Voltar
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Valor Total em Estoque</p>
                <p className="text-2xl font-bold text-gray-900">
                  R$ {totalValue.toFixed(2)}
                </p>
              </div>
              <Package className="h-10 w-10 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Itens</p>
                <p className="text-2xl font-bold text-gray-900">{totalItems}</p>
              </div>
              <TrendingUp className="h-10 w-10 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Estoque Baixo</p>
                <p className="text-2xl font-bold text-red-600">{lowStock}</p>
              </div>
              <AlertTriangle className="h-10 w-10 text-red-600" />
            </div>
          </div>
        </div>

        {/* Filtros e Busca */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nome, marca ou fornecedor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todos os Tipos</option>
              <option value="filamento">Filamento</option>
              <option value="resina">Resina</option>
              <option value="acessorio">Acessório</option>
              <option value="peca">Peça</option>
            </select>

            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus className="h-5 w-5" />
              Novo Material
            </button>
          </div>
        </div>

        {/* Formulário */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    {editingMaterial ? 'Editar Material' : 'Novo Material'}
                  </h2>
                  <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nome do Material *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.nome}
                        onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ex: PLA Branco 1kg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo *
                      </label>
                      <select
                        required
                        value={formData.tipo}
                        onChange={(e) => setFormData({ ...formData, tipo: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="filamento">Filamento</option>
                        <option value="resina">Resina</option>
                        <option value="acessorio">Acessório</option>
                        <option value="peca">Peça</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Marca
                      </label>
                      <input
                        type="text"
                        value={formData.marca}
                        onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ex: Creality"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cor
                      </label>
                      <input
                        type="text"
                        value={formData.cor}
                        onChange={(e) => setFormData({ ...formData, cor: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ex: Branco"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Peso (kg)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.peso}
                        onChange={(e) => setFormData({ ...formData, peso: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quantidade *
                      </label>
                      <input
                        type="number"
                        required
                        step="0.01"
                        value={formData.quantidade}
                        onChange={(e) => setFormData({ ...formData, quantidade: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Unidade *
                      </label>
                      <select
                        required
                        value={formData.unidade}
                        onChange={(e) => setFormData({ ...formData, unidade: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="kg">Quilograma (kg)</option>
                        <option value="litro">Litro (L)</option>
                        <option value="unidade">Unidade</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Preço de Compra (R$) *
                      </label>
                      <input
                        type="number"
                        required
                        step="0.01"
                        value={formData.precoCompra}
                        onChange={(e) => setFormData({ ...formData, precoCompra: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Preço de Venda (R$) *
                      </label>
                      <input
                        type="number"
                        required
                        step="0.01"
                        value={formData.precoVenda}
                        onChange={(e) => setFormData({ ...formData, precoVenda: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Estoque Mínimo *
                      </label>
                      <input
                        type="number"
                        required
                        step="0.01"
                        value={formData.estoqueMinimo}
                        onChange={(e) => setFormData({ ...formData, estoqueMinimo: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fornecedor
                      </label>
                      <input
                        type="text"
                        value={formData.fornecedor}
                        onChange={(e) => setFormData({ ...formData, fornecedor: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Data da Compra
                      </label>
                      <input
                        type="date"
                        value={formData.dataCompra}
                        onChange={(e) => setFormData({ ...formData, dataCompra: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Observações
                      </label>
                      <textarea
                        value={formData.observacoes}
                        onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Informações adicionais..."
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      <Save className="h-5 w-5" />
                      {editingMaterial ? 'Atualizar' : 'Salvar'}
                    </button>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Lista de Materiais */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Material
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantidade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Preço Compra
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Preço Venda
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMaterials.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p>Nenhum material cadastrado</p>
                      <button
                        onClick={() => setShowForm(true)}
                        className="mt-4 text-blue-600 hover:text-blue-700"
                      >
                        Cadastrar primeiro material
                      </button>
                    </td>
                  </tr>
                ) : (
                  filteredMaterials.map((material) => (
                    <tr key={material.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{material.nome}</div>
                          {material.marca && (
                            <div className="text-sm text-gray-500">{material.marca}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                          {material.tipo}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {material.quantidade} {material.unidade}
                        </div>
                        {material.quantidade <= material.estoqueMinimo && (
                          <div className="flex items-center gap-1 text-xs text-red-600">
                            <AlertCircle className="h-3 w-3" />
                            Estoque baixo
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        R$ {material.precoCompra.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        R$ {material.precoVenda.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {material.quantidade > material.estoqueMinimo ? (
                          <span className="flex items-center gap-1 text-sm text-green-600">
                            <TrendingUp className="h-4 w-4" />
                            OK
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-sm text-red-600">
                            <TrendingDown className="h-4 w-4" />
                            Baixo
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(material)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(material.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
