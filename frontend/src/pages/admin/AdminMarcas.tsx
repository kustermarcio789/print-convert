import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Tag, Plus, Trash2, Edit2, Save, X, Upload, Search,
  Package, ChevronDown, ChevronRight, Star, CheckCircle
} from 'lucide-react';
import Sidebar from '@/components/admin/Sidebar';

// Marcas padrão do sistema
const MARCAS_PADRAO = [
  { id: 'creality', nome: 'Creality', logo: '/images/brands/creality.png', ativa: true, modelos: ['K1 Max', 'Ender 3 V3', 'K2 Plus', 'Sermoon D3'] },
  { id: 'bambu-lab', nome: 'Bambu Lab', logo: '/images/brands/bambu-lab.png', ativa: true, modelos: ['X1 Carbon', 'P1S', 'A1 Mini', 'A1', 'H2D'] },
  { id: 'prusa', nome: 'Prusa', logo: '/images/brands/prusa.png', ativa: true, modelos: ['MK4S', 'XL', 'Mini+', 'Core One'] },
  { id: 'anycubic', nome: 'Anycubic', logo: '/images/brands/anycubic.png', ativa: true, modelos: ['Kobra 3', 'Photon Mono M7 Pro', 'Kobra 3 Max'] },
  { id: 'voron', nome: 'Voron', logo: '/images/brands/voron.png', ativa: true, modelos: ['Trident', 'V2.4', 'Switchwire', 'V0.2'] },
  { id: 'elegoo', nome: 'Elegoo', logo: '/images/brands/elegoo.png', ativa: true, modelos: ['Saturn 4 Ultra 16K', 'Saturn 4 Ultra 12K', 'Saturn 3 Ultra', 'Neptune 4 Max'] },
  { id: 'sovol', nome: 'Sovol', logo: '/images/brands/sovol.png', ativa: true, modelos: ['SV08 MAX', 'SV08', 'Zero', 'SV06 Plus'] },
  { id: 'flashforge', nome: 'Flashforge', logo: '/images/brands/flashforge.png', ativa: true, modelos: ['Adventurer 5M Pro', 'Creator 4S', 'Guider 3 Ultra'] },
];

interface Modelo {
  id: string;
  nome: string;
  categoria: 'FDM' | 'Resina' | 'Acessório';
  velocidade?: string;
  volume?: string;
  preco?: number;
  ativo: boolean;
}

interface Marca {
  id: string;
  nome: string;
  logo: string;
  logoBase64?: string;
  ativa: boolean;
  modelos: Modelo[];
  descricao?: string;
  website?: string;
  source: 'padrao' | 'custom';
}

export default function AdminMarcas() {
  const [marcas, setMarcas] = useState<Marca[]>(() => {
    const saved = localStorage.getItem('admin_marcas_custom');
    const customMarcas: Marca[] = saved ? JSON.parse(saved) : [];
    
    // Combinar marcas padrão com customizadas
    const padrao: Marca[] = MARCAS_PADRAO.map(m => ({
      id: m.id,
      nome: m.nome,
      logo: m.logo,
      ativa: m.ativa,
      source: 'padrao' as const,
      modelos: m.modelos.map((nome, i) => ({
        id: `${m.id}-modelo-${i}`,
        nome,
        categoria: 'FDM' as const,
        ativo: true,
      })),
    }));
    
    return [...padrao, ...customMarcas];
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [expandedMarca, setExpandedMarca] = useState<string | null>(null);
  const [showAddMarca, setShowAddMarca] = useState(false);
  const [editingMarca, setEditingMarca] = useState<string | null>(null);
  const [showAddModelo, setShowAddModelo] = useState<string | null>(null);

  const [newMarca, setNewMarca] = useState({
    nome: '', descricao: '', website: '', logoBase64: ''
  });

  const [newModelo, setNewModelo] = useState({
    nome: '', categoria: 'FDM' as 'FDM' | 'Resina' | 'Acessório',
    velocidade: '', volume: '', preco: ''
  });

  const saveCustomMarcas = (updated: Marca[]) => {
    const custom = updated.filter(m => m.source === 'custom');
    localStorage.setItem('admin_marcas_custom', JSON.stringify(custom));
  };

  const handleAddMarca = () => {
    if (!newMarca.nome) return;
    const marca: Marca = {
      id: `custom-marca-${Date.now()}`,
      nome: newMarca.nome,
      logo: newMarca.logoBase64 || '',
      logoBase64: newMarca.logoBase64,
      ativa: true,
      source: 'custom',
      modelos: [],
      descricao: newMarca.descricao,
      website: newMarca.website,
    };
    const updated = [...marcas, marca];
    setMarcas(updated);
    saveCustomMarcas(updated);
    setNewMarca({ nome: '', descricao: '', website: '', logoBase64: '' });
    setShowAddMarca(false);
  };

  const handleDeleteMarca = (id: string) => {
    if (!window.confirm('Excluir esta marca?')) return;
    const updated = marcas.filter(m => m.id !== id);
    setMarcas(updated);
    saveCustomMarcas(updated);
  };

  const handleToggleMarca = (id: string) => {
    const updated = marcas.map(m => m.id === id ? { ...m, ativa: !m.ativa } : m);
    setMarcas(updated);
    saveCustomMarcas(updated);
  };

  const handleAddModelo = (marcaId: string) => {
    if (!newModelo.nome) return;
    const modelo: Modelo = {
      id: `modelo-${Date.now()}`,
      nome: newModelo.nome,
      categoria: newModelo.categoria,
      velocidade: newModelo.velocidade || undefined,
      volume: newModelo.volume || undefined,
      preco: newModelo.preco ? parseFloat(newModelo.preco) : undefined,
      ativo: true,
    };
    const updated = marcas.map(m => 
      m.id === marcaId ? { ...m, modelos: [...m.modelos, modelo] } : m
    );
    setMarcas(updated);
    saveCustomMarcas(updated);
    setNewModelo({ nome: '', categoria: 'FDM', velocidade: '', volume: '', preco: '' });
    setShowAddModelo(null);
  };

  const handleDeleteModelo = (marcaId: string, modeloId: string) => {
    const updated = marcas.map(m =>
      m.id === marcaId ? { ...m, modelos: m.modelos.filter(mo => mo.id !== modeloId) } : m
    );
    setMarcas(updated);
    saveCustomMarcas(updated);
  };

  const handleToggleModelo = (marcaId: string, modeloId: string) => {
    const updated = marcas.map(m =>
      m.id === marcaId ? {
        ...m,
        modelos: m.modelos.map(mo => mo.id === modeloId ? { ...mo, ativo: !mo.ativo } : mo)
      } : m
    );
    setMarcas(updated);
    saveCustomMarcas(updated);
  };

  const filteredMarcas = marcas.filter(m =>
    m.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalModelos = marcas.reduce((acc, m) => acc + m.modelos.length, 0);
  const marcasAtivas = marcas.filter(m => m.ativa).length;

  return (
    <div className="flex min-h-screen bg-[#0d1117]">
      <Sidebar />
      <main className="flex-1 p-6 overflow-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-1">Marcas & Modelos</h1>
          <p className="text-gray-400 text-sm">Gerencie as marcas e modelos de impressoras 3D do catálogo</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total de Marcas', value: marcas.length, color: 'blue', icon: Tag },
            { label: 'Marcas Ativas', value: marcasAtivas, color: 'green', icon: CheckCircle },
            { label: 'Total de Modelos', value: totalModelos, color: 'purple', icon: Package },
            { label: 'Marcas Customizadas', value: marcas.filter(m => m.source === 'custom').length, color: 'amber', icon: Star },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-[#161923] rounded-xl border border-white/10 p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400">{stat.label}</span>
                <stat.icon size={16} className={`text-${stat.color}-400`} />
              </div>
              <p className={`text-2xl font-bold text-${stat.color}-400`}>{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1 max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar marca..."
              className="w-full pl-9 pr-4 py-2.5 bg-[#161923] border border-white/10 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>
          <button
            onClick={() => setShowAddMarca(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm font-medium transition-colors"
          >
            <Plus size={16} />
            Nova Marca
          </button>
        </div>

        {/* Formulário Nova Marca */}
        {showAddMarca && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#161923] border border-blue-500/30 rounded-xl p-5 mb-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Plus size={16} className="text-blue-400" />
                Adicionar Nova Marca
              </h3>
              <button onClick={() => setShowAddMarca(false)} className="text-gray-400 hover:text-white">
                <X size={18} />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-300 mb-1 block">Nome da Marca *</label>
                <input
                  value={newMarca.nome}
                  onChange={(e) => setNewMarca({ ...newMarca, nome: e.target.value })}
                  placeholder="Ex: Bambu Lab"
                  className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-sm text-gray-300 mb-1 block">Website</label>
                <input
                  value={newMarca.website}
                  onChange={(e) => setNewMarca({ ...newMarca, website: e.target.value })}
                  placeholder="https://bambulab.com"
                  className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm text-gray-300 mb-1 block">Descrição</label>
                <input
                  value={newMarca.descricao}
                  onChange={(e) => setNewMarca({ ...newMarca, descricao: e.target.value })}
                  placeholder="Breve descrição da marca..."
                  className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm text-gray-300 mb-2 block">Logo da Marca</label>
                <div className="flex items-center gap-3">
                  {newMarca.logoBase64 && (
                    <div className="w-16 h-16 bg-white rounded-lg p-2 flex items-center justify-center">
                      <img src={newMarca.logoBase64} alt="Logo" className="max-w-full max-h-full object-contain" />
                    </div>
                  )}
                  <label className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm cursor-pointer transition-colors">
                    <Upload size={16} />
                    {newMarca.logoBase64 ? 'Trocar Logo' : 'Upload Logo'}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            setNewMarca(prev => ({ ...prev, logoBase64: ev.target?.result as string }));
                          };
                          reader.readAsDataURL(file);
                        }
                        e.target.value = '';
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setShowAddMarca(false)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddMarca}
                disabled={!newMarca.nome}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded-lg text-white text-sm font-medium transition-colors"
              >
                <Save size={16} />
                Salvar Marca
              </button>
            </div>
          </motion.div>
        )}

        {/* Lista de Marcas */}
        <div className="space-y-3">
          {filteredMarcas.map((marca, index) => (
            <motion.div
              key={marca.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className={`bg-[#161923] rounded-xl border transition-all ${
                marca.ativa ? 'border-white/10' : 'border-white/5 opacity-60'
              }`}
            >
              {/* Marca Header */}
              <div className="flex items-center gap-4 p-4">
                {/* Logo */}
                <div className="w-12 h-12 bg-white rounded-lg p-1.5 flex items-center justify-center flex-shrink-0">
                  {(marca.logoBase64 || marca.logo) ? (
                    <img
                      src={marca.logoBase64 || marca.logo}
                      alt={marca.nome}
                      className="max-w-full max-h-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <Tag size={20} className="text-gray-400" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-semibold">{marca.nome}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      marca.source === 'padrao' ? 'bg-blue-500/20 text-blue-400' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {marca.source === 'padrao' ? 'Padrão' : 'Customizada'}
                    </span>
                    {!marca.ativa && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-400">
                        Inativa
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {marca.modelos.length} modelo{marca.modelos.length !== 1 ? 's' : ''}
                    {marca.website && (
                      <> · <a href={marca.website} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{marca.website}</a></>
                    )}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleMarca(marca.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      marca.ativa
                        ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                        : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'
                    }`}
                  >
                    {marca.ativa ? 'Ativa' : 'Inativa'}
                  </button>
                  {marca.source === 'custom' && (
                    <button
                      onClick={() => handleDeleteMarca(marca.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                  <button
                    onClick={() => setExpandedMarca(expandedMarca === marca.id ? null : marca.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 transition-colors"
                  >
                    {expandedMarca === marca.id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </button>
                </div>
              </div>

              {/* Modelos Expandidos */}
              {expandedMarca === marca.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="border-t border-white/10 p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-gray-300">Modelos Cadastrados</h4>
                    <button
                      onClick={() => setShowAddModelo(showAddModelo === marca.id ? null : marca.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg text-xs font-medium transition-colors"
                    >
                      <Plus size={12} />
                      Adicionar Modelo
                    </button>
                  </div>

                  {/* Formulário Novo Modelo */}
                  {showAddModelo === marca.id && (
                    <div className="bg-white/5 rounded-lg p-4 mb-3 border border-white/10">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                        <div className="md:col-span-2">
                          <label className="text-xs text-gray-400 mb-1 block">Nome do Modelo *</label>
                          <input
                            value={newModelo.nome}
                            onChange={(e) => setNewModelo({ ...newModelo, nome: e.target.value })}
                            placeholder="Ex: X1 Carbon"
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-400 mb-1 block">Categoria</label>
                          <select
                            value={newModelo.categoria}
                            onChange={(e) => setNewModelo({ ...newModelo, categoria: e.target.value as 'FDM' | 'Resina' | 'Acessório' })}
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                          >
                            <option value="FDM">FDM</option>
                            <option value="Resina">Resina</option>
                            <option value="Acessório">Acessório</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-gray-400 mb-1 block">Velocidade</label>
                          <input
                            value={newModelo.velocidade}
                            onChange={(e) => setNewModelo({ ...newModelo, velocidade: e.target.value })}
                            placeholder="500 mm/s"
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-400 mb-1 block">Volume</label>
                          <input
                            value={newModelo.volume}
                            onChange={(e) => setNewModelo({ ...newModelo, volume: e.target.value })}
                            placeholder="256×256×256mm"
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-400 mb-1 block">Preço (R$)</label>
                          <input
                            value={newModelo.preco}
                            onChange={(e) => setNewModelo({ ...newModelo, preco: e.target.value })}
                            placeholder="4360"
                            type="number"
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setShowAddModelo(null)}
                          className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white text-xs transition-colors"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => handleAddModelo(marca.id)}
                          disabled={!newModelo.nome}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded-lg text-white text-xs font-medium transition-colors"
                        >
                          <Save size={12} />
                          Salvar Modelo
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Lista de Modelos */}
                  {marca.modelos.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-4">Nenhum modelo cadastrado</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {marca.modelos.map((modelo) => (
                        <div
                          key={modelo.id}
                          className={`flex items-center justify-between px-3 py-2.5 rounded-lg border transition-all ${
                            modelo.ativo ? 'bg-white/5 border-white/10' : 'bg-white/2 border-white/5 opacity-50'
                          }`}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white font-medium truncate">{modelo.nome}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                                modelo.categoria === 'FDM' ? 'bg-blue-500/20 text-blue-400' :
                                modelo.categoria === 'Resina' ? 'bg-purple-500/20 text-purple-400' :
                                'bg-gray-500/20 text-gray-400'
                              }`}>
                                {modelo.categoria}
                              </span>
                              {modelo.velocidade && (
                                <span className="text-[10px] text-gray-500">{modelo.velocidade}</span>
                              )}
                              {modelo.preco && (
                                <span className="text-[10px] text-green-400">R$ {modelo.preco.toLocaleString('pt-BR')}</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 ml-2">
                            <button
                              onClick={() => handleToggleModelo(marca.id, modelo.id)}
                              className={`w-6 h-6 flex items-center justify-center rounded transition-colors ${
                                modelo.ativo ? 'text-green-400 hover:text-green-300' : 'text-gray-500 hover:text-gray-400'
                              }`}
                            >
                              <CheckCircle size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteModelo(marca.id, modelo.id)}
                              className="w-6 h-6 flex items-center justify-center rounded text-red-400 hover:text-red-300 transition-colors"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        {filteredMarcas.length === 0 && (
          <div className="text-center py-16 text-gray-500">
            <Tag size={40} className="mx-auto mb-3 opacity-30" />
            <p>Nenhuma marca encontrada</p>
          </div>
        )}
      </main>
    </div>
  );
}
