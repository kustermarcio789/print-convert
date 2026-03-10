import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Image, Plus, Trash2, Edit, Save, X, Eye, EyeOff, Star, Box,
  Upload, Tag, Calendar, Package, ZoomIn, ChevronLeft, ChevronRight,
  ToggleLeft, ToggleRight, Search, Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Sidebar from '@/components/admin/Sidebar';
import AdminHeader from '@/components/admin/AdminHeader';

// ============ INTERFACES ============
export interface ProjetoPortfolio {
  id: string;
  titulo: string;
  descricao: string;
  categoria: string;
  material: string;
  cliente?: string;
  destaque: boolean;
  visivel: boolean;
  fotos: string[];
  modelo3d?: string;
  modelo3dNome?: string;
  tags: string[];
  dataCriacao: string;
  tempoImpressao?: string;
  tecnologia: 'fdm' | 'resina' | 'modelagem' | 'pintura' | 'manutencao';
}

const CATEGORIAS = [
  'Protótipos', 'Miniaturas', 'Peças Funcionais', 'Cosplay', 'Decoração',
  'Automotivo', 'Médico/Odonto', 'Educacional', 'Arquitetura', 'Jóias', 'Outro'
];

const TECNOLOGIAS = [
  { value: 'fdm', label: 'FDM (Filamento)', color: 'bg-blue-500/10 text-blue-500' },
  { value: 'resina', label: 'Resina (SLA)', color: 'bg-purple-500/10 text-purple-500' },
  { value: 'modelagem', label: 'Modelagem 3D', color: 'bg-green-500/10 text-green-500' },
  { value: 'pintura', label: 'Pintura Premium', color: 'bg-pink-500/10 text-pink-500' },
  { value: 'manutencao', label: 'Manutenção', color: 'bg-orange-500/10 text-orange-500' },
];

// ============ MODAL PROJETO ============
function ModalProjeto({
  projeto, onSave, onClose
}: {
  projeto?: ProjetoPortfolio | null;
  onSave: (data: ProjetoPortfolio) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<ProjetoPortfolio>(projeto || {
    id: `proj_${Date.now()}`,
    titulo: '', descricao: '', categoria: 'Protótipos', material: '',
    cliente: '', destaque: false, visivel: true, fotos: [],
    modelo3d: '', modelo3dNome: '', tags: [],
    dataCriacao: new Date().toISOString().split('T')[0],
    tempoImpressao: '', tecnologia: 'fdm',
  });
  const [tagInput, setTagInput] = useState('');
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  const set = (field: keyof ProjetoPortfolio, value: unknown) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleFotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => {
        setForm(prev => ({ ...prev, fotos: [...prev.fotos, ev.target?.result as string] }));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleModelo3D = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      setForm(prev => ({ ...prev, modelo3d: ev.target?.result as string, modelo3dNome: file.name }));
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = (idx: number) => {
    setForm(prev => ({ ...prev, fotos: prev.fotos.filter((_, i) => i !== idx) }));
  };

  const addTag = () => {
    if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
      set('tags', [...form.tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    set('tags', form.tags.filter(t => t !== tag));
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-card border border-border rounded-2xl w-full max-w-3xl my-4">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Image className="w-5 h-5 text-primary" />
            {projeto ? 'Editar Projeto' : 'Novo Projeto no Portfólio'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Informações Básicas */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-muted-foreground mb-1">Título do Projeto *</label>
              <Input value={form.titulo} onChange={e => set('titulo', e.target.value)} placeholder="Ex: Miniatura Dragão 75mm — Resina 12K" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Categoria</label>
              <select value={form.categoria} onChange={e => set('categoria', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground">
                {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Tecnologia</label>
              <select value={form.tecnologia} onChange={e => set('tecnologia', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground">
                {TECNOLOGIAS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Material</label>
              <Input value={form.material} onChange={e => set('material', e.target.value)} placeholder="Ex: Resina 12K, PLA CF..." />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Cliente (opcional)</label>
              <Input value={form.cliente} onChange={e => set('cliente', e.target.value)} placeholder="Nome do cliente" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Tempo de Impressão</label>
              <Input value={form.tempoImpressao} onChange={e => set('tempoImpressao', e.target.value)} placeholder="Ex: 8h 30min" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Data</label>
              <Input type="date" value={form.dataCriacao} onChange={e => set('dataCriacao', e.target.value)} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Descrição</label>
            <textarea value={form.descricao} onChange={e => set('descricao', e.target.value)}
              rows={3} placeholder="Descreva o projeto, desafios, técnicas utilizadas..."
              className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground resize-none focus:ring-2 focus:ring-primary" />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Tags</label>
            <div className="flex gap-2 mb-2">
              <Input value={tagInput} onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Ex: voron, miniatura, alta-resolução..." className="flex-1" />
              <Button size="sm" onClick={addTag} variant="outline">+ Adicionar</Button>
            </div>
            {form.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {form.tags.map(tag => (
                  <span key={tag} className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                    #{tag}
                    <button onClick={() => removeTag(tag)} className="hover:text-red-500 transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Visibilidade e Destaque */}
          <div className="flex gap-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <div onClick={() => set('visivel', !form.visivel)}
                className={`w-10 h-6 rounded-full transition-colors flex items-center px-1 ${form.visivel ? 'bg-green-500' : 'bg-secondary'}`}>
                <div className={`w-4 h-4 bg-white rounded-full transition-transform ${form.visivel ? 'translate-x-4' : 'translate-x-0'}`} />
              </div>
              <span className="text-sm font-medium text-foreground">Visível no site</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <div onClick={() => set('destaque', !form.destaque)}
                className={`w-10 h-6 rounded-full transition-colors flex items-center px-1 ${form.destaque ? 'bg-yellow-500' : 'bg-secondary'}`}>
                <div className={`w-4 h-4 bg-white rounded-full transition-transform ${form.destaque ? 'translate-x-4' : 'translate-x-0'}`} />
              </div>
              <span className="text-sm font-medium text-foreground flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-yellow-500" /> Destaque
              </span>
            </label>
          </div>

          {/* Upload de Fotos */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-2 flex items-center gap-2">
              <Image className="w-4 h-4" /> Fotos do Projeto (múltiplas)
            </label>
            <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all">
              <Upload className="w-6 h-6 text-muted-foreground mb-1" />
              <span className="text-sm text-muted-foreground">Clique para selecionar fotos</span>
              <span className="text-xs text-muted-foreground">JPG, PNG, WebP — múltiplos arquivos</span>
              <input type="file" accept="image/*" multiple onChange={handleFotos} className="hidden" />
            </label>
            {form.fotos.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mt-3">
                {form.fotos.map((foto, idx) => (
                  <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-border">
                    <img src={foto} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button onClick={() => setLightboxIdx(idx)} className="p-1.5 bg-white/20 rounded-lg hover:bg-white/30">
                        <ZoomIn className="w-4 h-4 text-white" />
                      </button>
                      <button onClick={() => removePhoto(idx)} className="p-1.5 bg-red-500/80 rounded-lg hover:bg-red-500">
                        <Trash2 className="w-4 h-4 text-white" />
                      </button>
                    </div>
                    {idx === 0 && (
                      <span className="absolute top-1 left-1 text-xs bg-primary text-white px-1.5 py-0.5 rounded font-medium">Principal</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upload Modelo 3D */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-2 flex items-center gap-2">
              <Box className="w-4 h-4" /> Modelo 3D (opcional — STL, OBJ, 3MF)
            </label>
            <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-purple-500/50 hover:bg-purple-500/5 transition-all">
              <Box className="w-5 h-5 text-muted-foreground mb-1" />
              <span className="text-sm text-muted-foreground">
                {form.modelo3dNome ? `✓ ${form.modelo3dNome}` : 'Clique para selecionar modelo 3D'}
              </span>
              <input type="file" accept=".stl,.obj,.3mf" onChange={handleModelo3D} className="hidden" />
            </label>
            {form.modelo3d && (
              <div className="mt-2 flex items-center justify-between bg-purple-500/10 border border-purple-500/20 rounded-lg px-3 py-2">
                <span className="text-sm text-purple-500 font-medium flex items-center gap-2">
                  <Box className="w-4 h-4" /> {form.modelo3dNome}
                </span>
                <button onClick={() => setForm(prev => ({ ...prev, modelo3d: '', modelo3dNome: '' }))}
                  className="text-muted-foreground hover:text-red-500 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 p-5 border-t border-border">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancelar</Button>
          <Button onClick={() => {
            if (!form.titulo) { alert('Informe o título do projeto'); return; }
            onSave(form);
          }} className="flex-1 gap-2">
            <Save className="w-4 h-4" /> Salvar Projeto
          </Button>
        </div>
      </motion.div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIdx !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-[60] flex items-center justify-center p-4"
            onClick={() => setLightboxIdx(null)}>
            <button className="absolute top-4 right-4 text-white p-2 hover:bg-white/10 rounded-full">
              <X className="w-6 h-6" />
            </button>
            {lightboxIdx > 0 && (
              <button onClick={e => { e.stopPropagation(); setLightboxIdx(lightboxIdx - 1); }}
                className="absolute left-4 text-white p-2 hover:bg-white/10 rounded-full">
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}
            {lightboxIdx < form.fotos.length - 1 && (
              <button onClick={e => { e.stopPropagation(); setLightboxIdx(lightboxIdx + 1); }}
                className="absolute right-4 text-white p-2 hover:bg-white/10 rounded-full">
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
            <img src={form.fotos[lightboxIdx]} alt="Preview" className="max-w-full max-h-full object-contain rounded-xl"
              onClick={e => e.stopPropagation()} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============ COMPONENTE PRINCIPAL ============
export default function AdminPortfolio() {
  const [projetos, setProjetos] = useState<ProjetoPortfolio[]>([]);
  const [modal, setModal] = useState<ProjetoPortfolio | null | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCat, setFilterCat] = useState('todos');
  const [filterTec, setFilterTec] = useState('todos');
  const [lightboxProjeto, setLightboxProjeto] = useState<{ projeto: ProjetoPortfolio; idx: number } | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('admin_portfolio');
    if (saved) setProjetos(JSON.parse(saved));
  }, []);

  const save = (data: ProjetoPortfolio[]) => {
    setProjetos(data);
    localStorage.setItem('admin_portfolio', JSON.stringify(data));
  };

  const handleSave = (proj: ProjetoPortfolio) => {
    const existing = projetos.find(p => p.id === proj.id);
    if (existing) {
      save(projetos.map(p => p.id === proj.id ? proj : p));
    } else {
      save([proj, ...projetos]);
    }
    setModal(undefined);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Excluir este projeto do portfólio?')) {
      save(projetos.filter(p => p.id !== id));
    }
  };

  const toggleVisivel = (id: string) => {
    save(projetos.map(p => p.id === id ? { ...p, visivel: !p.visivel } : p));
  };

  const toggleDestaque = (id: string) => {
    save(projetos.map(p => p.id === id ? { ...p, destaque: !p.destaque } : p));
  };

  const filtered = projetos.filter(p => {
    const matchSearch = p.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchCat = filterCat === 'todos' || p.categoria === filterCat;
    const matchTec = filterTec === 'todos' || p.tecnologia === filterTec;
    return matchSearch && matchCat && matchTec;
  });

  const stats = {
    total: projetos.length,
    visiveis: projetos.filter(p => p.visivel).length,
    destaques: projetos.filter(p => p.destaque).length,
    com3d: projetos.filter(p => p.modelo3d).length,
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <AdminHeader title="Portfólio" />
        <div className="p-6 max-w-7xl mx-auto space-y-6">

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total de Projetos', value: stats.total, color: 'text-foreground', icon: <Package className="w-4 h-4" /> },
              { label: 'Visíveis no Site', value: stats.visiveis, color: 'text-green-500', icon: <Eye className="w-4 h-4" /> },
              { label: 'Em Destaque', value: stats.destaques, color: 'text-yellow-500', icon: <Star className="w-4 h-4" /> },
              { label: 'Com Modelo 3D', value: stats.com3d, color: 'text-purple-500', icon: <Box className="w-4 h-4" /> },
            ].map((s, i) => (
              <div key={i} className="bg-card border border-border rounded-xl p-4">
                <div className={`flex items-center gap-2 ${s.color} mb-1`}>{s.icon}<span className="text-xs font-medium">{s.label}</span></div>
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Filtros e botão */}
          <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
            <div className="flex flex-wrap gap-2 flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Buscar projetos..." value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)} className="pl-10 w-48" />
              </div>
              <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
                className="px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground">
                <option value="todos">Todas as Categorias</option>
                {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select value={filterTec} onChange={e => setFilterTec(e.target.value)}
                className="px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground">
                <option value="todos">Todas as Tecnologias</option>
                {TECNOLOGIAS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <Button onClick={() => setModal(null)} className="gap-2 flex-shrink-0">
              <Plus className="w-4 h-4" /> Novo Projeto
            </Button>
          </div>

          {/* Info */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-start gap-3">
            <Eye className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-600">
              Projetos marcados como <strong>Visíveis</strong> aparecem automaticamente na página pública <strong>/portfolio</strong>.
              Projetos em <strong>Destaque</strong> aparecem primeiro e com badge especial.
            </p>
          </div>

          {/* Lista de projetos */}
          {filtered.length === 0 ? (
            <div className="text-center py-20 bg-card border border-dashed border-border rounded-xl">
              <Image className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-30" />
              <p className="text-muted-foreground font-medium">Nenhum projeto no portfólio.</p>
              <p className="text-sm text-muted-foreground mt-1">Adicione fotos e modelos 3D dos seus trabalhos para mostrar aos clientes.</p>
              <Button onClick={() => setModal(null)} className="mt-4 gap-2">
                <Plus className="w-4 h-4" /> Adicionar Primeiro Projeto
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((proj, idx) => {
                const tecInfo = TECNOLOGIAS.find(t => t.value === proj.tecnologia);
                return (
                  <motion.div key={proj.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }}
                    className={`bg-card border rounded-xl overflow-hidden transition-all hover:shadow-lg ${
                      !proj.visivel ? 'opacity-60 border-dashed' : proj.destaque ? 'border-yellow-500/50' : 'border-border'
                    }`}>
                    {/* Imagem principal */}
                    <div className="relative aspect-[4/3] bg-secondary/30 overflow-hidden cursor-pointer"
                      onClick={() => proj.fotos.length > 0 && setLightboxProjeto({ projeto: proj, idx: 0 })}>
                      {proj.fotos.length > 0 ? (
                        <img src={proj.fotos[0]} alt={proj.titulo} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Image className="w-12 h-12 text-muted-foreground opacity-30" />
                        </div>
                      )}
                      {/* Badges */}
                      <div className="absolute top-2 left-2 flex flex-col gap-1">
                        {proj.destaque && (
                          <span className="flex items-center gap-1 px-2 py-1 bg-yellow-500 text-white text-xs font-bold rounded-full">
                            <Star className="w-3 h-3 fill-white" /> DESTAQUE
                          </span>
                        )}
                        {!proj.visivel && (
                          <span className="flex items-center gap-1 px-2 py-1 bg-gray-500 text-white text-xs font-bold rounded-full">
                            <EyeOff className="w-3 h-3" /> OCULTO
                          </span>
                        )}
                      </div>
                      {/* Contador de fotos */}
                      {proj.fotos.length > 1 && (
                        <span className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 text-white text-xs rounded-full">
                          {proj.fotos.length} fotos
                        </span>
                      )}
                      {proj.modelo3d && (
                        <span className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-1 bg-purple-600/80 text-white text-xs rounded-full">
                          <Box className="w-3 h-3" /> 3D
                        </span>
                      )}
                    </div>

                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            {tecInfo && (
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${tecInfo.color}`}>
                                {tecInfo.label}
                              </span>
                            )}
                            <span className="text-xs text-muted-foreground">{proj.categoria}</span>
                          </div>
                          <h3 className="font-semibold text-foreground text-sm line-clamp-2">{proj.titulo}</h3>
                        </div>
                      </div>

                      {proj.descricao && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{proj.descricao}</p>
                      )}

                      <div className="flex flex-wrap gap-1 mb-3">
                        {proj.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="text-xs px-1.5 py-0.5 bg-secondary text-muted-foreground rounded">#{tag}</span>
                        ))}
                        {proj.tags.length > 3 && (
                          <span className="text-xs px-1.5 py-0.5 bg-secondary text-muted-foreground rounded">+{proj.tags.length - 3}</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                        {proj.material && <span>🧵 {proj.material}</span>}
                        {proj.tempoImpressao && <span>⏱️ {proj.tempoImpressao}</span>}
                        <span className="ml-auto">{new Date(proj.dataCriacao).toLocaleDateString('pt-BR')}</span>
                      </div>

                      {/* Ações */}
                      <div className="flex items-center gap-2 pt-3 border-t border-border">
                        <button onClick={() => toggleVisivel(proj.id)}
                          className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors flex-1 justify-center ${
                            proj.visivel ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20' : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                          }`}>
                          {proj.visivel ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                          {proj.visivel ? 'Visível' : 'Oculto'}
                        </button>
                        <button onClick={() => toggleDestaque(proj.id)}
                          className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors flex-1 justify-center ${
                            proj.destaque ? 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20' : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                          }`}>
                          <Star className={`w-3.5 h-3.5 ${proj.destaque ? 'fill-yellow-500' : ''}`} />
                          {proj.destaque ? 'Destaque' : 'Normal'}
                        </button>
                        <button onClick={() => setModal(proj)}
                          className="p-1.5 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-foreground">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(proj.id)}
                          className="p-1.5 hover:bg-red-500/10 rounded-lg transition-colors text-muted-foreground hover:text-red-500">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Modal Projeto */}
      <AnimatePresence>
        {modal !== undefined && (
          <ModalProjeto projeto={modal} onSave={handleSave} onClose={() => setModal(undefined)} />
        )}
      </AnimatePresence>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxProjeto && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
            onClick={() => setLightboxProjeto(null)}>
            <button className="absolute top-4 right-4 text-white p-2 hover:bg-white/10 rounded-full">
              <X className="w-6 h-6" />
            </button>
            {lightboxProjeto.idx > 0 && (
              <button onClick={e => { e.stopPropagation(); setLightboxProjeto(prev => prev ? { ...prev, idx: prev.idx - 1 } : null); }}
                className="absolute left-4 text-white p-2 hover:bg-white/10 rounded-full">
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}
            {lightboxProjeto.idx < lightboxProjeto.projeto.fotos.length - 1 && (
              <button onClick={e => { e.stopPropagation(); setLightboxProjeto(prev => prev ? { ...prev, idx: prev.idx + 1 } : null); }}
                className="absolute right-4 text-white p-2 hover:bg-white/10 rounded-full">
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
            <img src={lightboxProjeto.projeto.fotos[lightboxProjeto.idx]} alt="Preview"
              className="max-w-full max-h-full object-contain rounded-xl" onClick={e => e.stopPropagation()} />
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-4 py-2 rounded-full">
              {lightboxProjeto.projeto.titulo} — {lightboxProjeto.idx + 1}/{lightboxProjeto.projeto.fotos.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
