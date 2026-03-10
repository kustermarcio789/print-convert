import { useState, useEffect } from 'react';
import { Package, AlertTriangle, Trash2, RefreshCw, Database, AlertCircle, CheckCircle, Plus, Edit2, Save, X, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import Sidebar from '@/components/admin/Sidebar';

interface Material {
  id: string;
  nome: string;
  tipo: string;
  fornecedor?: string;
  quantidade: number;
  unidade: string;
  precoCompra: number;
  precoVenda: number;
  estoqueMinimo: number;
  status: 'normal' | 'baixo' | 'critico';
  movimentacoes?: { data: string; tipo: 'entrada' | 'saida'; qtd: number; obs?: string }[];
}

function calcStatus(qtd: number, min: number): 'normal' | 'baixo' | 'critico' {
  if (qtd <= 0) return 'critico';
  if (qtd <= min) return 'baixo';
  return 'normal';
}

export default function AdminEstoque() {
  const { toast } = useToast();
  const [materiais, setMateriais] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [movModal, setMovModal] = useState<{ id: string; tipo: 'entrada' | 'saida' } | null>(null);
  const [movQtd, setMovQtd] = useState('');
  const [movObs, setMovObs] = useState('');
  const [newItem, setNewItem] = useState({
    nome: '', tipo: 'filamento', fornecedor: '', quantidade: '', unidade: 'g',
    precoCompra: '', precoVenda: '', estoqueMinimo: ''
  });

  const salvar = (lista: Material[]) => {
    localStorage.setItem('estoque_materiais', JSON.stringify(lista));
    setMateriais(lista);
  };

  const fetchMateriais = () => {
    try {
      setLoading(true);
      const dados = localStorage.getItem('estoque_materiais');
      setMateriais(dados ? JSON.parse(dados) : []);
    } catch {
      setMateriais([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMateriais(); }, []);

  const handleAdd = () => {
    if (!newItem.nome) { toast({ title: 'Informe o nome do item', variant: 'destructive' }); return; }
    const qtd = parseFloat(newItem.quantidade) || 0;
    const min = parseFloat(newItem.estoqueMinimo) || 0;
    const item: Material = {
      id: `MAT-${Date.now()}`,
      nome: newItem.nome,
      tipo: newItem.tipo,
      fornecedor: newItem.fornecedor || undefined,
      quantidade: qtd,
      unidade: newItem.unidade,
      precoCompra: parseFloat(newItem.precoCompra) || 0,
      precoVenda: parseFloat(newItem.precoVenda) || 0,
      estoqueMinimo: min,
      status: calcStatus(qtd, min),
      movimentacoes: qtd > 0 ? [{ data: new Date().toISOString(), tipo: 'entrada', qtd, obs: 'Estoque inicial' }] : [],
    };
    salvar([...materiais, item]);
    setNewItem({ nome: '', tipo: 'filamento', fornecedor: '', quantidade: '', unidade: 'g', precoCompra: '', precoVenda: '', estoqueMinimo: '' });
    setShowAddForm(false);
    toast({ title: 'Item adicionado ao estoque!' });
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('Excluir este item do estoque?')) return;
    salvar(materiais.filter(m => m.id !== id));
    toast({ title: 'Item removido do estoque.' });
  };

  const handleMovimentacao = () => {
    if (!movModal || !movQtd) return;
    const qtd = parseFloat(movQtd);
    if (qtd <= 0) return;
    const updated = materiais.map(m => {
      if (m.id !== movModal.id) return m;
      const novaQtd = movModal.tipo === 'entrada' ? m.quantidade + qtd : Math.max(0, m.quantidade - qtd);
      const movs = [...(m.movimentacoes || []), { data: new Date().toISOString(), tipo: movModal.tipo, qtd, obs: movObs || undefined }];
      return { ...m, quantidade: novaQtd, status: calcStatus(novaQtd, m.estoqueMinimo), movimentacoes: movs };
    });
    salvar(updated);
    setMovModal(null);
    setMovQtd('');
    setMovObs('');
    toast({ title: movModal.tipo === 'entrada' ? 'Entrada registrada!' : 'Saída registrada!' });
  };

  const normais = materiais.filter(m => m.status === 'normal').length;
  const baixos = materiais.filter(m => m.status === 'baixo').length;
  const criticos = materiais.filter(m => m.status === 'critico').length;
  const valorTotal = materiais.reduce((s, m) => s + m.quantidade * (m.precoCompra / (m.unidade === 'g' ? 1000 : m.unidade === 'ml' ? 1000 : 1)), 0);

  const statusConfig: Record<string, { cor: string; bg: string; icon: any }> = {
    normal: { cor: 'text-green-400', bg: 'bg-green-500/20', icon: CheckCircle },
    baixo: { cor: 'text-amber-400', bg: 'bg-amber-500/20', icon: AlertTriangle },
    critico: { cor: 'text-red-400', bg: 'bg-red-500/20', icon: AlertCircle },
  };

  return (
    <div className="min-h-screen bg-[#0f1117] flex">
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        <header className="bg-[#161923] border-b border-white/10 p-4 sticky top-0 z-10">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Database className="text-purple-400" size={22} />
                Gestão de Estoque
              </h2>
              <p className="text-sm text-gray-400 mt-1">Controle de materiais e filamentos</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={fetchMateriais} className="bg-white/10 hover:bg-white/20 text-white border-0">
                <RefreshCw className="w-4 h-4 mr-2" />Atualizar
              </Button>
              <Button onClick={() => setShowAddForm(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="w-4 h-4 mr-2" />Novo Item
              </Button>
            </div>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* Cards de status */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#161923] rounded-xl border border-white/10 p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Package className="text-blue-400" size={18} />
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">{materiais.length}</p>
                  <p className="text-xs text-gray-400">Total Itens</p>
                </div>
              </div>
            </div>
            <div className="bg-[#161923] rounded-xl border border-white/10 p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <CheckCircle className="text-green-400" size={18} />
                </div>
                <div>
                  <p className="text-3xl font-bold text-green-400">{normais}</p>
                  <p className="text-xs text-gray-400">Normal</p>
                </div>
              </div>
            </div>
            <div className="bg-[#161923] rounded-xl border border-white/10 p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                  <AlertTriangle className="text-amber-400" size={18} />
                </div>
                <div>
                  <p className="text-3xl font-bold text-amber-400">{baixos}</p>
                  <p className="text-xs text-gray-400">Baixo</p>
                </div>
              </div>
            </div>
            <div className="bg-[#161923] rounded-xl border border-white/10 p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                  <AlertCircle className="text-red-400" size={18} />
                </div>
                <div>
                  <p className="text-3xl font-bold text-red-400">{criticos}</p>
                  <p className="text-xs text-gray-400">Crítico</p>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Novo Item */}
          {showAddForm && (
            <div className="bg-[#161923] rounded-xl border border-blue-500/30 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Plus size={18} className="text-blue-400" /> Adicionar Item ao Estoque
                </h3>
                <button onClick={() => setShowAddForm(false)} className="text-gray-400 hover:text-white"><X size={18} /></button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-1 block">Nome *</label>
                  <input value={newItem.nome} onChange={e => setNewItem({ ...newItem, nome: e.target.value })}
                    placeholder="Ex: PLA Preto" className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 text-sm" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-1 block">Tipo</label>
                  <select value={newItem.tipo} onChange={e => setNewItem({ ...newItem, tipo: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-800 border border-white/10 rounded-lg text-white text-sm [&>option]:bg-slate-800">
                    <option value="filamento">Filamento</option>
                    <option value="resina">Resina</option>
                    <option value="acessorio">Acessório</option>
                    <option value="peca">Peça de Reposição</option>
                    <option value="outro">Outro</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-1 block">Fornecedor</label>
                  <input value={newItem.fornecedor} onChange={e => setNewItem({ ...newItem, fornecedor: e.target.value })}
                    placeholder="Ex: 3DVALE" className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 text-sm" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-1 block">Quantidade Inicial</label>
                  <input type="number" value={newItem.quantidade} onChange={e => setNewItem({ ...newItem, quantidade: e.target.value })}
                    placeholder="0" className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 text-sm" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-1 block">Unidade</label>
                  <select value={newItem.unidade} onChange={e => setNewItem({ ...newItem, unidade: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-800 border border-white/10 rounded-lg text-white text-sm [&>option]:bg-slate-800">
                    <option value="g">Gramas (g)</option>
                    <option value="ml">Mililitros (ml)</option>
                    <option value="un">Unidades (un)</option>
                    <option value="m">Metros (m)</option>
                    <option value="kg">Quilogramas (kg)</option>
                    <option value="L">Litros (L)</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-1 block">Estoque Mínimo</label>
                  <input type="number" value={newItem.estoqueMinimo} onChange={e => setNewItem({ ...newItem, estoqueMinimo: e.target.value })}
                    placeholder="200" className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 text-sm" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-1 block">Preço Compra (R$)</label>
                  <input type="number" value={newItem.precoCompra} onChange={e => setNewItem({ ...newItem, precoCompra: e.target.value })}
                    placeholder="80.00" className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 text-sm" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-1 block">Preço Venda (R$)</label>
                  <input type="number" value={newItem.precoVenda} onChange={e => setNewItem({ ...newItem, precoVenda: e.target.value })}
                    placeholder="200.00" className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 text-sm" />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <Button onClick={() => setShowAddForm(false)} variant="ghost" className="text-gray-400 hover:text-white">Cancelar</Button>
                <Button onClick={handleAdd} className="bg-green-600 hover:bg-green-700 text-white">
                  <Save className="w-4 h-4 mr-2" />Salvar Item
                </Button>
              </div>
            </div>
          )}

          {/* Modal Movimentação */}
          {movModal && (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
              <div className="bg-[#1a1d2e] rounded-xl border border-white/10 p-6 w-full max-w-md">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  {movModal.tipo === 'entrada' ? <ArrowDown className="text-green-400" size={18} /> : <ArrowUp className="text-red-400" size={18} />}
                  {movModal.tipo === 'entrada' ? 'Entrada de Estoque' : 'Saída de Estoque'}
                </h3>
                <p className="text-sm text-gray-400 mb-3">
                  Item: <span className="text-white font-medium">{materiais.find(m => m.id === movModal.id)?.nome}</span>
                </p>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-300 mb-1 block">Quantidade</label>
                    <input type="number" value={movQtd} onChange={e => setMovQtd(e.target.value)}
                      placeholder="0" className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm" autoFocus />
                  </div>
                  <div>
                    <label className="text-sm text-gray-300 mb-1 block">Observação (opcional)</label>
                    <input value={movObs} onChange={e => setMovObs(e.target.value)}
                      placeholder="Ex: Compra fornecedor X" className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 text-sm" />
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-5">
                  <Button onClick={() => { setMovModal(null); setMovQtd(''); setMovObs(''); }} variant="ghost" className="text-gray-400">Cancelar</Button>
                  <Button onClick={handleMovimentacao}
                    className={movModal.tipo === 'entrada' ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}>
                    Confirmar {movModal.tipo === 'entrada' ? 'Entrada' : 'Saída'}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Lista de materiais */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-400" />
            </div>
          ) : materiais.length === 0 ? (
            <div className="text-center py-20 bg-[#161923] rounded-xl border border-white/10">
              <Package className="w-12 h-12 mx-auto text-gray-600 mb-4" />
              <p className="text-gray-400 font-medium mb-2">Nenhum material cadastrado.</p>
              <p className="text-sm text-gray-500 mb-4">Clique em "Novo Item" para adicionar materiais ao estoque.</p>
              <Button onClick={() => setShowAddForm(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="w-4 h-4 mr-2" />Adicionar Primeiro Item
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {materiais.map(material => {
                const cfg = statusConfig[material.status] || statusConfig.normal;
                const StatusIcon = cfg.icon;
                return (
                  <div key={material.id} className="bg-[#161923] rounded-xl border border-white/10 p-5 hover:border-white/20 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-white">{material.nome}</h3>
                        <p className="text-sm text-gray-400">{material.tipo}</p>
                      </div>
                      <div className={`px-2.5 py-1 rounded-full ${cfg.bg} flex items-center gap-1`}>
                        <StatusIcon size={12} className={cfg.cor} />
                        <span className={`text-xs font-medium capitalize ${cfg.cor}`}>{material.status}</span>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Estoque:</span>
                        <span className="font-medium text-white">{material.quantidade} {material.unidade}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Mínimo:</span>
                        <span className="text-gray-300">{material.estoqueMinimo} {material.unidade}</span>
                      </div>
                      {material.fornecedor && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Fornecedor:</span>
                          <span className="text-gray-300">{material.fornecedor}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-500">Preço Compra:</span>
                        <span className="text-gray-300">R$ {material.precoCompra.toFixed(2).replace('.', ',')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Preço Venda:</span>
                        <span className="text-green-400 font-medium">R$ {material.precoVenda.toFixed(2).replace('.', ',')}</span>
                      </div>
                    </div>
                    {/* Barra de nível */}
                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden mb-3">
                      <div
                        className={`h-full rounded-full ${material.status === 'critico' ? 'bg-red-500' : material.status === 'baixo' ? 'bg-amber-500' : 'bg-green-500'}`}
                        style={{ width: `${Math.min(100, material.estoqueMinimo > 0 ? (material.quantidade / (material.estoqueMinimo * 3)) * 100 : 100)}%` }}
                      />
                    </div>
                    {/* Botões de ação */}
                    <div className="grid grid-cols-3 gap-2">
                      <button onClick={() => setMovModal({ id: material.id, tipo: 'entrada' })}
                        className="py-2 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 text-xs font-medium flex items-center justify-center gap-1 transition-colors">
                        <ArrowDown size={12} />Entrada
                      </button>
                      <button onClick={() => setMovModal({ id: material.id, tipo: 'saida' })}
                        className="py-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-medium flex items-center justify-center gap-1 transition-colors">
                        <ArrowUp size={12} />Saída
                      </button>
                      <button onClick={() => handleDelete(material.id)}
                        className="py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-medium flex items-center justify-center gap-1 transition-colors">
                        <Trash2 size={12} />Excluir
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
