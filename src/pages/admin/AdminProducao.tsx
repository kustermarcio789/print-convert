import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, Plus, Save, X, AlertTriangle, TrendingDown, Factory,
  Calendar, Weight, Trash2, Search, Filter as FilterIcon
} from 'lucide-react';
import { inicializarMateriaisExemplo } from '@/lib/materiaisData';

interface Material {
  id: string;
  nome: string;
  fornecedor: string;
  tipo: string; // filamento, resina, etc
  quantidade: number; // em gramas ou ml
  unidade: string; // g, ml, kg
  precoCompra: number;
  precoVenda: number;
  estoqueMinimo: number;
  status: 'normal' | 'baixo' | 'critico';
}

interface RegistroProducao {
  id: string;
  data: string;
  nomePeca: string;
  cliente?: string;
  materialId: string;
  materialNome: string;
  quantidadeUsada: number; // gramas ou ml usados na peça
  quantidadeDesperdicio: number; // gramas ou ml de desperdício (suporte, etc)
  quantidadeTotal: number; // total consumido
  custoMaterial: number;
  observacoes?: string;
  operador: string;
}

export default function AdminProducao() {
  const navigate = useNavigate();
  const [materiais, setMateriais] = useState<Material[]>([]);
  const [registros, setRegistros] = useState<RegistroProducao[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Form state
  const [formData, setFormData] = useState({
    nomePeca: '',
    cliente: '',
    materialId: '',
    quantidadeUsada: 0,
    quantidadeDesperdicio: 0,
    observacoes: '',
    operador: 'Admin'
  });

  // Carregar dados do localStorage
  useEffect(() => {
    inicializarMateriaisExemplo();
    loadMateriais();
    loadRegistros();
  }, []);

  const loadMateriais = () => {
    const stored = localStorage.getItem('estoque_materiais');
    if (stored) {
      const materiaisData = JSON.parse(stored);
      // Atualizar status baseado no estoque
      const materiaisComStatus = materiaisData.map((m: Material) => ({
        ...m,
        status: m.quantidade <= 0 ? 'critico' : 
                m.quantidade <= m.estoqueMinimo ? 'baixo' : 'normal'
      }));
      setMateriais(materiaisComStatus);
    }
  };

  const loadRegistros = () => {
    const stored = localStorage.getItem('registros_producao');
    if (stored) {
      setRegistros(JSON.parse(stored));
    }
  };

  const saveRegistros = (newRegistros: RegistroProducao[]) => {
    localStorage.setItem('registros_producao', JSON.stringify(newRegistros));
    setRegistros(newRegistros);
  };

  const saveMateriais = (newMateriais: Material[]) => {
    localStorage.setItem('estoque_materiais', JSON.stringify(newMateriais));
    setMateriais(newMateriais);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const material = materiais.find(m => m.id === formData.materialId);
    if (!material) {
      alert('Material não encontrado!');
      return;
    }

    const quantidadeTotal = formData.quantidadeUsada + formData.quantidadeDesperdicio;

    // Verificar se há estoque suficiente
    if (material.quantidade < quantidadeTotal) {
      alert(`Estoque insuficiente! Disponível: ${material.quantidade}${material.unidade}`);
      return;
    }

    // Calcular custo do material usado
    const custoPorUnidade = material.precoCompra / material.quantidade;
    const custoMaterial = custoPorUnidade * quantidadeTotal;

    // Criar novo registro
    const novoRegistro: RegistroProducao = {
      id: `PROD-${Date.now()}`,
      data: new Date().toISOString(),
      nomePeca: formData.nomePeca,
      cliente: formData.cliente,
      materialId: material.id,
      materialNome: material.nome,
      quantidadeUsada: formData.quantidadeUsada,
      quantidadeDesperdicio: formData.quantidadeDesperdicio,
      quantidadeTotal,
      custoMaterial,
      observacoes: formData.observacoes,
      operador: formData.operador
    };

    // Atualizar estoque do material
    const materiaisAtualizados = materiais.map(m => {
      if (m.id === material.id) {
        const novaQuantidade = m.quantidade - quantidadeTotal;
        return {
          ...m,
          quantidade: novaQuantidade,
          status: novaQuantidade <= 0 ? 'critico' as const : 
                  novaQuantidade <= m.estoqueMinimo ? 'baixo' as const : 'normal' as const
        };
      }
      return m;
    });

    // Salvar
    saveRegistros([novoRegistro, ...registros]);
    saveMateriais(materiaisAtualizados);

    // Resetar formulário
    resetForm();
    alert('Produção registrada e estoque atualizado com sucesso!');
  };

  const resetForm = () => {
    setFormData({
      nomePeca: '',
      cliente: '',
      materialId: '',
      quantidadeUsada: 0,
      quantidadeDesperdicio: 0,
      observacoes: '',
      operador: 'Admin'
    });
    setShowForm(false);
  };

  const deleteRegistro = (id: string) => {
    if (confirm('Deseja realmente excluir este registro? Esta ação não pode ser desfeita.')) {
      const novosRegistros = registros.filter(r => r.id !== id);
      saveRegistros(novosRegistros);
    }
  };

  // Filtros
  const materiaisFiltrados = materiais.filter(m => {
    const matchSearch = m.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       m.fornecedor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'all' || m.status === filterStatus;
    return matchSearch && matchStatus;
  });

  // Estatísticas
  const materiaisEmBaixa = materiais.filter(m => m.status === 'baixo').length;
  const materiaisCriticos = materiais.filter(m => m.status === 'critico').length;
  const totalProducoes = registros.length;
  const custoTotalProducao = registros.reduce((sum, r) => sum + r.custoMaterial, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            ← Voltar
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Controle de Produção</h1>
          <p className="text-gray-600 mt-2">Gerencie a produção e consumo de materiais</p>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Produções</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{totalProducoes}</p>
              </div>
              <Factory className="h-10 w-10 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Custo Total Produção</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  R$ {custoTotalProducao.toFixed(2)}
                </p>
              </div>
              <TrendingDown className="h-10 w-10 text-green-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-yellow-200 bg-yellow-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-800">Estoque Baixo</p>
                <p className="text-2xl font-bold text-yellow-900 mt-1">{materiaisEmBaixa}</p>
              </div>
              <AlertTriangle className="h-10 w-10 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-red-200 bg-red-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-800">Estoque Crítico</p>
                <p className="text-2xl font-bold text-red-900 mt-1">{materiaisCriticos}</p>
              </div>
              <AlertTriangle className="h-10 w-10 text-red-600" />
            </div>
          </div>
        </div>

        {/* Alertas de Estoque */}
        {(materiaisEmBaixa > 0 || materiaisCriticos > 0) && (
          <div className="mb-8 space-y-4">
            {materiaisCriticos > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-red-900">Atenção: Materiais com Estoque Crítico!</h3>
                    <p className="text-sm text-red-800 mt-1">
                      {materiaisCriticos} {materiaisCriticos === 1 ? 'material está' : 'materiais estão'} com estoque zerado ou crítico. Providencie a compra urgente!
                    </p>
                  </div>
                </div>
              </div>
            )}
            {materiaisEmBaixa > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-yellow-900">Aviso: Materiais com Estoque Baixo</h3>
                    <p className="text-sm text-yellow-800 mt-1">
                      {materiaisEmBaixa} {materiaisEmBaixa === 1 ? 'material está' : 'materiais estão'} abaixo do estoque mínimo.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Ações */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            <div className="flex-1 w-full md:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Buscar materiais..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos os Status</option>
                <option value="normal">Normal</option>
                <option value="baixo">Estoque Baixo</option>
                <option value="critico">Crítico</option>
              </select>
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-5 w-5" />
                Registrar Produção
              </button>
            </div>
          </div>
        </div>

        {/* Formulário de Registro */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full my-8">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Registrar Nova Produção</h2>
                  <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nome da Peça *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.nomePeca}
                        onChange={(e) => setFormData({ ...formData, nomePeca: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ex: Suporte de Headset"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cliente (opcional)
                      </label>
                      <input
                        type="text"
                        value={formData.cliente}
                        onChange={(e) => setFormData({ ...formData, cliente: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Nome do cliente"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Operador
                      </label>
                      <input
                        type="text"
                        value={formData.operador}
                        onChange={(e) => setFormData({ ...formData, operador: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Material Utilizado *
                      </label>
                      <select
                        required
                        value={formData.materialId}
                        onChange={(e) => setFormData({ ...formData, materialId: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Selecione um material</option>
                        {materiais.map(m => (
                          <option key={m.id} value={m.id}>
                            {m.nome} - {m.fornecedor} (Disponível: {m.quantidade}{m.unidade})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quantidade Usada na Peça (g/ml) *
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.1"
                        value={formData.quantidadeUsada}
                        onChange={(e) => setFormData({ ...formData, quantidadeUsada: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ex: 500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Desperdício/Suporte (g/ml) *
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.1"
                        value={formData.quantidadeDesperdicio}
                        onChange={(e) => setFormData({ ...formData, quantidadeDesperdicio: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ex: 200"
                      />
                    </div>

                    <div className="col-span-2">
                      <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                        <p className="text-sm text-blue-900">
                          <strong>Total a ser consumido:</strong> {(formData.quantidadeUsada + formData.quantidadeDesperdicio).toFixed(1)}g/ml
                        </p>
                      </div>
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
                        placeholder="Observações sobre a produção..."
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4 border-t">
                    <button
                      type="submit"
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      <Save className="h-5 w-5" />
                      Registrar Produção
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

        {/* Tabela de Materiais */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">Status dos Materiais</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Material
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fornecedor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estoque Atual
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estoque Mínimo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {materiaisFiltrados.map((material) => (
                  <tr key={material.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Package className="h-5 w-5 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{material.nome}</div>
                          <div className="text-sm text-gray-500">{material.tipo}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {material.fornecedor}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Weight className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="text-sm font-medium text-gray-900">
                          {material.quantidade}{material.unidade}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {material.estoqueMinimo}{material.unidade}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {material.status === 'normal' && (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Normal
                        </span>
                      )}
                      {material.status === 'baixo' && (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Estoque Baixo
                        </span>
                      )}
                      {material.status === 'critico' && (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          Crítico
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Histórico de Produções */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">Histórico de Produções</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Peça
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Material
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Consumo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Custo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Operador
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {registros.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      <Factory className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p>Nenhuma produção registrada ainda.</p>
                      <p className="text-sm mt-1">Clique em "Registrar Produção" para começar.</p>
                    </td>
                  </tr>
                ) : (
                  registros.map((registro) => (
                    <tr key={registro.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                          {new Date(registro.data).toLocaleDateString('pt-BR')}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{registro.nomePeca}</div>
                        {registro.cliente && (
                          <div className="text-sm text-gray-500">Cliente: {registro.cliente}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {registro.materialNome}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          Peça: {registro.quantidadeUsada}g
                        </div>
                        <div className="text-sm text-gray-500">
                          Suporte: {registro.quantidadeDesperdicio}g
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          Total: {registro.quantidadeTotal}g
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        R$ {registro.custoMaterial.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {registro.operador}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => deleteRegistro(registro.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Excluir registro"
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
