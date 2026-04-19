import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package, Search, Eye, EyeOff, Trash2, Plus, Save, X,
  Layers, CheckCircle, DollarSign, Upload, RotateCw,
  Scissors, Image as ImageIcon, FlipHorizontal, FlipVertical,
  Pencil, ChevronDown, ChevronUp, GitBranch, Star, ToggleLeft, ToggleRight, Check, Loader2
} from 'lucide-react';
import Sidebar from '@/components/admin/Sidebar';
import { supabase } from '@/lib/supabase';
import { fmtBRL } from '@/lib/formatters';

// ==================== CATÁLOGO BASE ====================
// ==================== TIPOS ====================
interface Variacao {
  id: string;
  nome: string;       // ex: "12K", "16K", "Preto", "Branco"
  preco: number;
  estoque: number;
  imagem?: string;
  descricao?: string;
}

interface ProdutoAdmin {
  id: string;
  nome: string;
  marca: string;
  categoria: string;
  tipo?: string;
  preco: number;
  valorPago?: number;
  estoque: number;
  ativo: boolean;
  destaque: boolean;
  descricao: string;
  imagem: string;
  imagemBase64?: string;
  imagens?: string[];
  modelo3d?: string;
  modelo3dNome?: string;
  velocidade?: string;
  volume?: string;
  variacoes?: Variacao[];
  source?: 'catalogo' | 'custom';
}

// ==================== DIALOG DE CONFIRMAÇÃO DE EXCLUSÃO ====================
function DeleteConfirmDialog({ produto, onConfirm, onCancel }: {
  produto: ProdutoAdmin | null;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!produto) return null;
  const imgSrc = produto.imagemBase64 || produto.imagem;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#1a1d2e] rounded-2xl w-full max-w-sm border border-red-500/20"
      >
        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center flex-shrink-0">
              <Trash2 size={18} className="text-red-400" />
            </div>
            <h3 className="text-base font-bold text-white">Excluir produto</h3>
          </div>
          <p className="text-sm text-gray-400 mt-3 pl-[52px]">
            Tem certeza que deseja excluir{' '}
            <span className="text-white font-medium">"{produto.nome}"</span>?
            {produto.source === 'catalogo' && (
              <span className="block mt-1 text-amber-400/80 text-xs">
                Este produto faz parte do catálogo e ficará oculto.
              </span>
            )}
            {produto.source === 'custom' && (
              <span className="block mt-1 text-red-400/80 text-xs">
                Esta ação <strong>não pode ser desfeita</strong>.
              </span>
            )}
          </p>
        </div>

        {/* Preview */}
        {imgSrc && (
          <div className="mx-6 mb-4 flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
            <img src={imgSrc} alt={produto.nome} className="w-12 h-12 object-contain rounded-lg bg-white/5 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{produto.nome}</p>
              <p className="text-xs text-gray-400">
                {fmtBRL(produto.preco)} · Estoque: {produto.estoque} un.
              </p>
            </div>
          </div>
        )}

        {/* Ações */}
        <div className="p-6 pt-0 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-medium flex items-center justify-center gap-2 transition-colors"
          >
            <Trash2 size={14} />
            Excluir
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ==================== EDITOR DE IMAGEM ====================
function ImageEditor({ imageData, onSave, onCancel }: {
  imageData: string;
  onSave: (data: string) => void;
  onCancel: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [removingBg, setRemovingBg] = useState(false);
  const [currentImage, setCurrentImage] = useState(imageData);

  const applyTransform = useCallback((imgSrc: string, rot: number, fh: boolean, fv: boolean) => {
    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const isRotated = rot % 180 !== 0;
      canvas.width = isRotated ? img.height : img.width;
      canvas.height = isRotated ? img.width : img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rot * Math.PI) / 180);
      ctx.scale(fh ? -1 : 1, fv ? -1 : 1);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      ctx.restore();
    };
    img.src = imgSrc;
  }, []);

  const handleRotate = () => {
    const newRot = (rotation + 90) % 360;
    setRotation(newRot);
    applyTransform(currentImage, newRot, flipH, flipV);
  };

  const handleFlipH = () => {
    const newFlip = !flipH;
    setFlipH(newFlip);
    applyTransform(currentImage, rotation, newFlip, flipV);
  };

  const handleFlipV = () => {
    const newFlip = !flipV;
    setFlipV(newFlip);
    applyTransform(currentImage, rotation, flipH, newFlip);
  };

  const handleRemoveBg = async () => {
    setRemovingBg(true);
    try {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const corners = [
          { x: 0, y: 0 }, { x: canvas.width - 1, y: 0 },
          { x: 0, y: canvas.height - 1 }, { x: canvas.width - 1, y: canvas.height - 1 },
        ];
        let bgR = 0, bgG = 0, bgB = 0;
        corners.forEach(c => {
          const idx = (c.y * canvas.width + c.x) * 4;
          bgR += data[idx]; bgG += data[idx + 1]; bgB += data[idx + 2];
        });
        bgR = Math.round(bgR / 4); bgG = Math.round(bgG / 4); bgB = Math.round(bgB / 4);
        const threshold = 60;
        for (let i = 0; i < data.length; i += 4) {
          const dr = Math.abs(data[i] - bgR);
          const dg = Math.abs(data[i + 1] - bgG);
          const db = Math.abs(data[i + 2] - bgB);
          const dist = Math.sqrt(dr * dr + dg * dg + db * db);
          if (dist < threshold) data[i + 3] = 0;
          else if (dist < threshold * 1.5) data[i + 3] = Math.round(255 * ((dist - threshold) / (threshold * 0.5)));
        }
        ctx.putImageData(imageData, 0, 0);
        const newSrc = canvas.toDataURL('image/png');
        setCurrentImage(newSrc);
        applyTransform(newSrc, rotation, flipH, flipV);
        setRemovingBg(false);
      };
      img.src = currentImage;
    } catch { setRemovingBg(false); }
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    onSave(canvas ? canvas.toDataURL('image/png') : currentImage);
  };

  useState(() => { setTimeout(() => applyTransform(imageData, 0, false, false), 100); });

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1a1d2e] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <ImageIcon className="text-blue-400" size={20} />Editor de Imagem
          </h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-white"><X size={20} /></button>
        </div>
        <div className="p-6">
          <div className="bg-[#0f1117] rounded-xl p-4 mb-4 flex items-center justify-center min-h-[300px]">
            <canvas ref={canvasRef} className="max-w-full max-h-[300px] object-contain" />
          </div>
          <div className="flex flex-wrap gap-2 mb-6">
            <button onClick={handleRotate} className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition-colors">
              <RotateCw size={16} />Girar 90°
            </button>
            <button onClick={handleFlipH} className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition-colors">
              <FlipHorizontal size={16} />Espelhar H
            </button>
            <button onClick={handleFlipV} className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition-colors">
              <FlipVertical size={16} />Espelhar V
            </button>
            <button onClick={handleRemoveBg} disabled={removingBg} className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 rounded-lg text-white text-sm transition-colors disabled:opacity-50">
              <Scissors size={16} />{removingBg ? 'Removendo...' : 'Remover Fundo'}
            </button>
          </div>
          <div className="flex gap-3">
            <button onClick={onCancel} className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-colors">Cancelar</button>
            <button onClick={handleSave} className="flex-1 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-medium flex items-center justify-center gap-2 transition-colors">
              <Save size={16} />Salvar Imagem
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== MODAL DE EDIÇÃO ====================
function EditModal({ produto, onSave, onClose, marcasDisponiveis }: {
  produto: ProdutoAdmin;
  onSave: (updated: ProdutoAdmin) => void;
  onClose: () => void;
  marcasDisponiveis: string[];
}) {
  const [form, setForm] = useState<ProdutoAdmin>({ ...produto });
  const [variacoes, setVariacoes] = useState<Variacao[]>(produto.variacoes || []);
  const [showAddVariacao, setShowAddVariacao] = useState(false);
  const [novaVariacao, setNovaVariacao] = useState<Variacao>({
    id: '', nome: '', preco: 0, estoque: 0, imagem: '', descricao: ''
  });
  const [editingVariacaoIdx, setEditingVariacaoIdx] = useState<number | null>(null);

  const handleSave = () => {
    onSave({ ...form, variacoes: variacoes.length > 0 ? variacoes : undefined });
  };

  const addVariacao = () => {
    if (!novaVariacao.nome || !novaVariacao.preco) return;
    const v: Variacao = {
      ...novaVariacao,
      id: `var-${Date.now()}`,
      preco: Number(novaVariacao.preco),
      estoque: Number(novaVariacao.estoque) || 0,
    };
    setVariacoes([...variacoes, v]);
    setNovaVariacao({ id: '', nome: '', preco: 0, estoque: 0, imagem: '', descricao: '' });
    setShowAddVariacao(false);
  };

  const removeVariacao = (idx: number) => {
    setVariacoes(variacoes.filter((_, i) => i !== idx));
  };

  const updateVariacao = (idx: number, field: keyof Variacao, value: any) => {
    const updated = [...variacoes];
    updated[idx] = { ...updated[idx], [field]: value };
    setVariacoes(updated);
  };

  const inputClass = "w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500";
  const labelClass = "text-sm font-medium text-gray-300 mb-1 block";

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#1a1d2e] rounded-2xl w-full max-w-3xl my-4">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between sticky top-0 bg-[#1a1d2e] rounded-t-2xl z-10">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Pencil className="text-blue-400" size={20} />
            Editar Produto
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={20} /></button>
        </div>

        <div className="p-6 space-y-6">
          {/* Informações Básicas */}
          <div>
            <h4 className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-3">Informações Básicas</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className={labelClass}>Nome do Produto *</label>
                <input value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} className={inputClass} placeholder="Nome completo do produto" />
              </div>
              <div>
                <label className={labelClass}>Marca</label>
                <select value={form.marca} onChange={e => setForm({ ...form, marca: e.target.value })} className="w-full px-3 py-2.5 bg-slate-800 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500">
                  {marcasDisponiveis.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Categoria</label>
                <select value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value })} className="w-full px-3 py-2.5 bg-slate-800 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500">
                  <option value="FDM">FDM</option>
                  <option value="Resina">Resina</option>
                  <option value="Filamento">Filamento</option>
                  <option value="Acessório">Acessório</option>
                  <option value="Peça de Reposição">Peça de Reposição</option>
                  <option value="Upgrade">Upgrade</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Tipo / Arquitetura</label>
                <input value={form.tipo || ''} onChange={e => setForm({ ...form, tipo: e.target.value })} className={inputClass} placeholder="Ex: CoreXY, MSLA, Cartesiana" />
              </div>
              <div>
                <label className={labelClass}>Velocidade</label>
                <input value={form.velocidade || ''} onChange={e => setForm({ ...form, velocidade: e.target.value })} className={inputClass} placeholder="Ex: 500 mm/s" />
              </div>
              <div>
                <label className={labelClass}>Volume de Construção</label>
                <input value={form.volume || ''} onChange={e => setForm({ ...form, volume: e.target.value })} className={inputClass} placeholder="Ex: 256×256×256mm" />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Descrição</label>
                <textarea value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} rows={3} className={`${inputClass} resize-none`} placeholder="Descrição do produto" />
              </div>
            </div>
          </div>

          {/* Preço e Estoque */}
          <div>
            <h4 className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-3">Preço e Estoque</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Preço de Venda (R$) *</label>
                <input type="number" value={form.preco} onChange={e => setForm({ ...form, preco: parseFloat(e.target.value) || 0 })} className={inputClass} placeholder="0.00" />
              </div>
              <div>
                <label className={labelClass}>Valor Pago / Custo (R$)</label>
                <input type="number" value={form.valorPago || ''} onChange={e => setForm({ ...form, valorPago: parseFloat(e.target.value) || undefined })} className={inputClass} placeholder="Custo de aquisição" />
              </div>
              <div>
                <label className={labelClass}>Estoque (unidades)</label>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setForm(prev => ({ ...prev, estoque: Math.max(0, prev.estoque - 1) }))} className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-lg text-white font-bold text-lg flex items-center justify-center transition-colors">-</button>
                  <input type="number" min="0" value={form.estoque} onChange={e => setForm({ ...form, estoque: parseInt(e.target.value) || 0 })} className={`${inputClass} text-center`} placeholder="0" />
                  <button type="button" onClick={() => setForm(prev => ({ ...prev, estoque: prev.estoque + 1 }))} className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-lg text-white font-bold text-lg flex items-center justify-center transition-colors">+</button>
                </div>
              </div>
            </div>
            {form.valorPago && form.preco > 0 && (
              <div className="mt-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                <p className="text-sm text-emerald-400">
                  Margem: {fmtBRL((form.preco - form.valorPago))} 
                  ({Math.round(((form.preco - form.valorPago) / form.preco) * 100)}%)
                </p>
              </div>
            )}
          </div>

          {/* Status */}
          <div>
            <h4 className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-3">Status e Visibilidade</h4>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => setForm({ ...form, ativo: !form.ativo })}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors ${form.ativo ? 'bg-green-500/20 border-green-500/40 text-green-400' : 'bg-white/5 border-white/10 text-gray-400'}`}
              >
                {form.ativo ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                {form.ativo ? 'Produto Ativo' : 'Produto Inativo'}
              </button>
              <button
                onClick={() => setForm({ ...form, destaque: !form.destaque })}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors ${form.destaque ? 'bg-amber-500/20 border-amber-500/40 text-amber-400' : 'bg-white/5 border-white/10 text-gray-400'}`}
              >
                <Star size={18} fill={form.destaque ? 'currentColor' : 'none'} />
                {form.destaque ? 'Em Destaque' : 'Sem Destaque'}
              </button>
            </div>
          </div>

          {/* Modelo 3D (Opcional) */}
          <div>
            <h4 className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-3">Modelo 3D (Opcional)</h4>
            <p className="text-xs text-gray-500 mb-3">Upload de arquivo .stl, .obj ou .glb para visualização 3D no site</p>
            {form.modelo3d ? (
              <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <Check size={18} className="text-green-400" />
                <span className="text-sm text-green-400 flex-1">{form.modelo3dNome || 'Modelo 3D carregado'}</span>
                <button onClick={() => setForm({ ...form, modelo3d: undefined, modelo3dNome: undefined })} className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs rounded-lg transition-colors">
                  Remover
                </button>
              </div>
            ) : (
              <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-400 rounded-lg cursor-pointer transition-colors">
                <Upload size={16} />
                <span className="text-sm">Carregar Modelo 3D</span>
                <input type="file" accept=".stl,.obj,.glb,.gltf" className="hidden" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      const base64 = ev.target?.result as string;
                      setForm(prev => ({ ...prev, modelo3d: base64, modelo3dNome: file.name }));
                    };
                    reader.readAsDataURL(file);
                  }
                  if (e.target) e.target.value = '';
                }} />
              </label>
            )}
          </div>

          {/* Variações */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-sm font-semibold text-blue-400 uppercase tracking-wider flex items-center gap-2">
                  <GitBranch size={16} />Variações do Produto
                </h4>
                <p className="text-xs text-gray-500 mt-0.5">Ex: mesmo produto com resolução 12K e 16K, ou cores diferentes, cada um com preço próprio</p>
              </div>
              <button
                onClick={() => setShowAddVariacao(true)}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <Plus size={14} />Adicionar Variação
              </button>
            </div>

            {/* Lista de variações existentes */}
            {variacoes.length > 0 && (
              <div className="space-y-2 mb-3">
                {variacoes.map((v, idx) => (
                  <div key={v.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                    {editingVariacaoIdx === idx ? (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="col-span-2 md:col-span-1">
                          <label className="text-xs text-gray-400 mb-1 block">Nome da Variação</label>
                          <input value={v.nome} onChange={e => updateVariacao(idx, 'nome', e.target.value)} className="w-full px-2 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:border-blue-500" placeholder="Ex: 12K, Preto" />
                        </div>
                        <div>
                          <label className="text-xs text-gray-400 mb-1 block">Preço (R$)</label>
                          <input type="number" value={v.preco} onChange={e => updateVariacao(idx, 'preco', parseFloat(e.target.value) || 0)} className="w-full px-2 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:border-blue-500" />
                        </div>
                        <div>
                          <label className="text-xs text-gray-400 mb-1 block">Estoque</label>
                          <input type="number" value={v.estoque} onChange={e => updateVariacao(idx, 'estoque', parseInt(e.target.value) || 0)} className="w-full px-2 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:border-blue-500" />
                        </div>
                        <div className="flex items-end gap-2">
                          <button onClick={() => setEditingVariacaoIdx(null)} className="flex-1 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs rounded-lg transition-colors">
                            <CheckCircle size={12} className="inline mr-1" />OK
                          </button>
                        </div>
                        <div className="col-span-2 md:col-span-4">
                          <label className="text-xs text-gray-400 mb-1 block">Descrição da Variação</label>
                          <input value={v.descricao || ''} onChange={e => updateVariacao(idx, 'descricao', e.target.value)} className="w-full px-2 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:border-blue-500" placeholder="Diferencial desta variação" />
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                            <GitBranch size={14} className="text-blue-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{v.nome}</p>
                            <p className="text-xs text-gray-400">
                              {fmtBRL(v.preco)} &bull; Estoque: {v.estoque} un.
                              {v.descricao && ` • ${v.descricao}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-1.5">
                          <button onClick={() => setEditingVariacaoIdx(idx)} className="h-7 w-7 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors">
                            <Pencil size={12} />
                          </button>
                          <button onClick={() => removeVariacao(idx)} className="h-7 w-7 flex items-center justify-center rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Formulário nova variação */}
            <AnimatePresence>
              {showAddVariacao && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4"
                >
                  <p className="text-xs font-semibold text-blue-400 mb-3">Nova Variação</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="col-span-2 md:col-span-2">
                      <label className="text-xs text-gray-400 mb-1 block">Nome da Variação *</label>
                      <input
                        value={novaVariacao.nome}
                        onChange={e => setNovaVariacao({ ...novaVariacao, nome: e.target.value })}
                        className="w-full px-2 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:border-blue-500"
                        placeholder="Ex: 12K, 16K, Preto, Branco, 256mm, 350mm..."
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Preço (R$) *</label>
                      <input
                        type="number"
                        value={novaVariacao.preco || ''}
                        onChange={e => setNovaVariacao({ ...novaVariacao, preco: parseFloat(e.target.value) || 0 })}
                        className="w-full px-2 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:border-blue-500"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Estoque</label>
                      <input
                        type="number"
                        value={novaVariacao.estoque || ''}
                        onChange={e => setNovaVariacao({ ...novaVariacao, estoque: parseInt(e.target.value) || 0 })}
                        className="w-full px-2 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:border-blue-500"
                        placeholder="0"
                      />
                    </div>
                    <div className="col-span-2 md:col-span-4">
                      <label className="text-xs text-gray-400 mb-1 block">Descrição (opcional)</label>
                      <input
                        value={novaVariacao.descricao || ''}
                        onChange={e => setNovaVariacao({ ...novaVariacao, descricao: e.target.value })}
                        className="w-full px-2 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:border-blue-500"
                        placeholder="O que diferencia esta variação?"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => setShowAddVariacao(false)} className="px-4 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs rounded-lg transition-colors">Cancelar</button>
                    <button onClick={addVariacao} className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg flex items-center gap-1.5 transition-colors">
                      <Plus size={12} />Adicionar
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {variacoes.length === 0 && !showAddVariacao && (
              <div className="text-center py-6 bg-white/[0.02] border border-dashed border-white/10 rounded-xl">
                <GitBranch size={24} className="text-gray-600 mx-auto mb-2" />
                <p className="text-xs text-gray-500">Nenhuma variação cadastrada.</p>
                <p className="text-xs text-gray-600 mt-0.5">Clique em "Adicionar Variação" para criar versões com preços diferentes.</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 flex gap-3 sticky bottom-0 bg-[#1a1d2e] rounded-b-2xl">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-colors">
            Cancelar
          </button>
          <button onClick={handleSave} className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium flex items-center justify-center gap-2 transition-colors">
            <Save size={16} />Salvar Alterações
          </button>
        </div>
      </div>
    </div>
  );
}

// ==================== COMPONENTE PRINCIPAL ====================
export default function AdminProdutos() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMarca, setFilterMarca] = useState('todos');
  const [filterCategoria, setFilterCategoria] = useState('todos');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingImage, setEditingImage] = useState<{ productId: string; data: string } | null>(null);
  const [editingProduct, setEditingProduct] = useState<ProdutoAdmin | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadTarget, setUploadTarget] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Produtos carregados do Supabase
  const [produtos, setProdutos] = useState<ProdutoAdmin[]>([]);

  const [newProduct, setNewProduct] = useState({
    nome: '', marca: '', categoria: 'FDM', preco: '', valorPago: '', estoque: '', descricao: '',
    imagem: '', imagens: [] as string[], modelo3d: '', modelo3dNome: '',
    velocidade: '', volume: '', tipo: '', destaque: false
  });

  const [novaMarca, setNovaMarca] = useState('');
  const [showNovaMarca, setShowNovaMarca] = useState(false);
  const marcasDisponiveis = ['Elegoo', 'Sovol', 'Creality', 'Bambu Lab', 'Prusa', 'Anycubic', 'Voron', 'Flashforge'];

  // Produto pendente de exclusão
  const [deletingProduct, setDeletingProduct] = useState<ProdutoAdmin | null>(null);

  // ==================== CARREGAR DO SUPABASE ====================
  const loadProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('products').select('*').order('name');
      if (error) throw error;
      if (data) {
        const mapped: ProdutoAdmin[] = data.map((p: any) => ({
          id: p.id,
          nome: p.name,
          marca: p.brand || '',
          categoria: p.category_name || 'FDM',
          tipo: p.specifications?.tipo || '',
          preco: p.price || 0,
          valorPago: p.cost_price || undefined,
          estoque: p.stock || 0,
          ativo: p.active !== false,
          destaque: p.featured || false,
          descricao: p.description || '',
          imagem: p.images?.[0] || '',
          imagens: p.images || [],
          modelo3d: p.modelo_3d || undefined,
          velocidade: p.specifications?.velocidade || '',
          volume: p.specifications?.volume || '',
          source: 'catalogo' as const,
        }));
        setProdutos(mapped);
      }
    } catch (e) {
      console.error('Erro ao carregar produtos:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProducts(); }, []);

  const filteredProdutos = produtos.filter((produto) => {
    const matchesSearch =
      produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      produto.marca.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMarca = filterMarca === 'todos' || produto.marca === filterMarca;
    const matchesCategoria = filterCategoria === 'todos' || produto.categoria === filterCategoria;
    return matchesSearch && matchesMarca && matchesCategoria;
  });

  // ==================== SALVAR NO SUPABASE ====================
  const handleSaveEdit = async (updated: ProdutoAdmin) => {
    setSaving(true);
    try {
      const updateData: any = {
        name: updated.nome,
        brand: updated.marca,
        category_name: updated.categoria,
        description: updated.descricao,
        price: updated.preco,
        cost_price: updated.valorPago || 0,
        stock: updated.estoque,
        active: updated.ativo,
        featured: updated.destaque,
        modelo_3d: updated.modelo3d || null,
        specifications: {
          tipo: updated.tipo || updated.categoria,
          velocidade: updated.velocidade || '',
          volume: updated.volume || '',
        },
        updated_at: new Date().toISOString(),
      };

      // Se tem imagem base64 nova, salvar
      if (updated.imagemBase64) {
        updateData.images = [updated.imagemBase64, ...(updated.imagens || []).slice(1)];
      } else if (updated.imagem) {
        updateData.images = [updated.imagem, ...(updated.imagens || []).slice(1)];
      }

      const { error } = await supabase.from('products').update(updateData).eq('id', updated.id);
      if (error) throw error;

      // Atualizar estado local
      setProdutos(prev => prev.map(p => p.id === updated.id ? { ...updated } : p));
      setEditingProduct(null);
    } catch (e: any) {
      console.error('Erro ao salvar:', e);
      alert('Erro ao salvar: ' + (e.message || 'Tente novamente'));
    } finally {
      setSaving(false);
    }
  };

  // ==================== ADICIONAR NOVO PRODUTO ====================
  const handleAddProduct = async () => {
    if (!newProduct.nome || !newProduct.marca || !newProduct.preco) return;
    setSaving(true);
    try {
      const mainImage = newProduct.imagem || (newProduct.imagens[0] || '');
      const allImages = newProduct.imagens.length > 0 ? newProduct.imagens : (mainImage ? [mainImage] : []);

      const insertData: any = {
        name: newProduct.nome,
        brand: newProduct.marca,
        category_name: newProduct.categoria,
        description: newProduct.descricao,
        price: parseFloat(newProduct.preco),
        cost_price: newProduct.valorPago ? parseFloat(newProduct.valorPago) : 0,
        stock: parseInt(newProduct.estoque) || 0,
        active: true,
        featured: newProduct.destaque,
        images: allImages,
        modelo_3d: newProduct.modelo3d || null,
        specifications: {
          tipo: newProduct.tipo || newProduct.categoria,
          velocidade: newProduct.velocidade || '',
          volume: newProduct.volume || '',
        },
      };

      const { data, error } = await supabase.from('products').insert(insertData).select().single();
      if (error) throw error;

      // Recarregar produtos
      await loadProducts();
      setShowAddForm(false);
      setNewProduct({ nome: '', marca: '', categoria: 'FDM', preco: '', valorPago: '', estoque: '', descricao: '', imagem: '', imagens: [], modelo3d: '', modelo3dNome: '', velocidade: '', volume: '', tipo: '', destaque: false });
    } catch (e: any) {
      console.error('Erro ao adicionar:', e);
      alert('Erro ao adicionar: ' + (e.message || 'Tente novamente'));
    } finally {
      setSaving(false);
    }
  };

  // ==================== EXCLUIR PRODUTO ====================
  const handleConfirmDelete = async () => {
    if (!deletingProduct) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('products').update({ active: false }).eq('id', deletingProduct.id);
      if (error) throw error;
      setProdutos(prev => prev.filter(p => p.id !== deletingProduct.id));
      setDeletingProduct(null);
    } catch (e: any) {
      console.error('Erro ao excluir:', e);
      alert('Erro ao excluir: ' + (e.message || 'Tente novamente'));
    } finally {
      setSaving(false);
    }
  };

  // ==================== TOGGLE ATIVO/INATIVO ====================
  const handleToggleActive = async (produto: ProdutoAdmin) => {
    const novoStatus = !produto.ativo;
    try {
      const { error } = await supabase.from('products').update({
        active: novoStatus,
        updated_at: new Date().toISOString(),
      }).eq('id', produto.id);
      if (error) throw error;
      setProdutos(prev => prev.map(p => p.id === produto.id ? { ...p, ativo: novoStatus } : p));
    } catch (e: any) {
      console.error('Erro ao alterar status:', e);
      alert('Erro ao alterar status: ' + (e.message || 'Tente novamente'));
    }
  };

  // ==================== ATIVAR TODOS ====================
  const handleActivateAll = async () => {
    const inativos = produtos.filter(p => !p.ativo);
    if (inativos.length === 0) return;
    if (!confirm(`Ativar todos os ${inativos.length} produtos inativos? Eles aparecerão na loja.`)) return;
    setSaving(true);
    try {
      const ids = inativos.map(p => p.id);
      const { error } = await supabase.from('products').update({
        active: true,
        updated_at: new Date().toISOString(),
      }).in('id', ids);
      if (error) throw error;
      setProdutos(prev => prev.map(p => ({ ...p, ativo: true })));
    } catch (e: any) {
      console.error('Erro ao ativar todos:', e);
      alert('Erro ao ativar todos: ' + (e.message || 'Tente novamente'));
    } finally {
      setSaving(false);
    }
  };

  // ==================== UPLOAD E EDITOR DE IMAGEM ====================
  const handleImageUpload = (productId: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setEditingImage({ productId, data: base64 });
    };
    reader.readAsDataURL(file);
  };

  const handleImageEditorSave = async (base64: string) => {
    if (!editingImage) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('products').update({
        images: [base64],
        updated_at: new Date().toISOString(),
      }).eq('id', editingImage.productId);
      if (error) throw error;

      setProdutos(prev => prev.map(p =>
        p.id === editingImage.productId ? { ...p, imagem: base64, imagemBase64: base64 } : p
      ));
      setEditingImage(null);
    } catch (e: any) {
      console.error('Erro ao salvar imagem:', e);
      alert('Erro ao salvar imagem: ' + (e.message || 'Tente novamente'));
    } finally {
      setSaving(false);
    }
  };
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, targetId: string | null) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target?.result as string;
      if (targetId === 'new-product') {
        setNewProduct(prev => ({ ...prev, imagem: prev.imagem || base64, imagens: [...(prev.imagens || []), base64] }));
      } else if (targetId) {
        setEditingImage({ productId: targetId, data: base64 });
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const getProductImage = (produto: ProdutoAdmin) => {
    if (produto.imagemBase64) return produto.imagemBase64;
    return produto.imagem;
  };

  const totalProdutos = produtos.length;
  const totalAtivos = produtos.filter(p => p.ativo !== false).length;
  const totalEstoque = produtos.reduce((sum, p) => sum + (p.estoque || 0), 0);
  const valorTotal = produtos.reduce((sum, p) => sum + (p.preco * (p.estoque || 0)), 0);

  const inputClass = "w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500";
  const labelClass = "text-sm font-medium text-gray-300 mb-1 block";

  return (
    <div className="min-h-screen bg-[#0f1117] flex">
      <Sidebar />

      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, uploadTarget)} />

      {editingImage && (
        <ImageEditor imageData={editingImage.data} onSave={handleImageEditorSave} onCancel={() => setEditingImage(null)} />
      )}

      {editingProduct && (
        <EditModal
          produto={editingProduct}
          onSave={handleSaveEdit}
          onClose={() => setEditingProduct(null)}
          marcasDisponiveis={marcasDisponiveis}
        />
      )}

      <AnimatePresence>
        {deletingProduct && (
          <DeleteConfirmDialog
            produto={deletingProduct}
            onConfirm={handleConfirmDelete}
            onCancel={() => setDeletingProduct(null)}
          />
        )}
      </AnimatePresence>

      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-[#161923] border-b border-white/10 p-4 sticky top-0 z-10">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Package className="text-blue-400" size={22} />Gestão de Produtos
              </h2>
              <p className="text-sm text-gray-400 mt-1">Edite preços, estoque, variações e fotos</p>
            </div>
            <a href="/produtos" target="_blank" className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm flex items-center gap-2 transition-colors">
              <Eye size={16} />Ver Loja
            </a>
          </div>
        </header>

        <div className="p-4 lg:p-6">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total Produtos', value: totalProdutos, icon: Package, color: 'text-blue-400', bg: 'bg-blue-500/20' },
              { label: 'Ativos', value: totalAtivos, icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/20' },
              { label: 'Em Estoque', value: totalEstoque, icon: Layers, color: 'text-purple-400', bg: 'bg-purple-500/20' },
              { label: 'Valor Estoque', value: `R$ ${valorTotal.toLocaleString('pt-BR')}`, icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="bg-[#161923] rounded-xl border border-white/10 p-4 flex items-center gap-3">
                  <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-white">{stat.value}</p>
                    <p className="text-xs text-gray-400">{stat.label}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Filters */}
          <div className="bg-[#161923] rounded-xl border border-white/10 p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-3 items-center">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input placeholder="Buscar por nome ou marca..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm" />
              </div>
              <select value={filterMarca} onChange={(e) => setFilterMarca(e.target.value)} className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500">
                <option value="todos">Todas Marcas</option>
                <option value="Elegoo">Elegoo</option>
                <option value="Sovol">Sovol</option>
              </select>
              <select value={filterCategoria} onChange={(e) => setFilterCategoria(e.target.value)} className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500">
                <option value="todos">Todas Categorias</option>
                <option value="FDM">FDM</option>
                <option value="Resina">Resina</option>
              </select>
              <button onClick={() => setShowAddForm(true)} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors whitespace-nowrap">
                <Plus size={16} />Novo Produto
              </button>
              {produtos.filter(p => !p.ativo).length > 0 && (
                <button
                  onClick={handleActivateAll}
                  disabled={saving}
                  className="px-5 py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors whitespace-nowrap"
                  title={`${produtos.filter(p => !p.ativo).length} produtos inativos — nenhum aparece na loja`}
                >
                  <CheckCircle size={16} />Ativar Todos ({produtos.filter(p => !p.ativo).length})
                </button>
              )}
            </div>
          </div>

          {/* Add Product Form */}
          <AnimatePresence>
            {showAddForm && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-[#161923] rounded-xl border-2 border-blue-500/30 p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2"><Plus className="text-blue-400" size={18} />Adicionar Novo Produto</h3>
                  <button onClick={() => setShowAddForm(false)} className="text-gray-400 hover:text-white"><X size={18} /></button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className={labelClass}>Nome do Produto *</label>
                    <input value={newProduct.nome} onChange={(e) => setNewProduct({ ...newProduct, nome: e.target.value })} placeholder="Ex: Impressora 3D XYZ" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Marca *</label>
                    {!showNovaMarca ? (
                      <div className="flex gap-2">
                        <select value={newProduct.marca} onChange={(e) => setNewProduct({ ...newProduct, marca: e.target.value })} className="flex-1 px-3 py-2.5 bg-slate-800 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500">
                          <option value="">Selecione...</option>
                          {marcasDisponiveis.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                        <button type="button" onClick={() => setShowNovaMarca(true)} className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg whitespace-nowrap">+ Nova</button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input value={novaMarca} onChange={(e) => setNovaMarca(e.target.value)} placeholder="Nome da nova marca" className={inputClass} />
                        <button type="button" onClick={() => { if (novaMarca.trim()) { const saved = JSON.parse(localStorage.getItem('admin_marcas_custom') || '[]'); saved.push(novaMarca.trim()); localStorage.setItem('admin_marcas_custom', JSON.stringify(saved)); setNewProduct({ ...newProduct, marca: novaMarca.trim() }); setNovaMarca(''); setShowNovaMarca(false); } }} className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-xs rounded-lg">Salvar</button>
                        <button type="button" onClick={() => { setShowNovaMarca(false); setNovaMarca(''); }} className="px-3 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 text-xs rounded-lg">X</button>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className={labelClass}>Categoria</label>
                    <select value={newProduct.categoria} onChange={(e) => setNewProduct({ ...newProduct, categoria: e.target.value })} className="w-full px-3 py-2.5 bg-slate-800 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500">
                      <option value="FDM">FDM</option>
                      <option value="Resina">Resina</option>
                      <option value="Filamento">Filamento</option>
                      <option value="Acessório">Acessório</option>
                      <option value="Peça de Reposição">Peça de Reposição</option>
                      <option value="Upgrade">Upgrade</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Preço de Venda (R$) *</label>
                    <input type="number" value={newProduct.preco} onChange={(e) => setNewProduct({ ...newProduct, preco: e.target.value })} placeholder="0.00" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Valor Pago (R$)</label>
                    <input type="number" value={newProduct.valorPago} onChange={(e) => setNewProduct({ ...newProduct, valorPago: e.target.value })} placeholder="Custo de aquisição" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Estoque</label>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => setNewProduct(prev => ({ ...prev, estoque: String(Math.max(0, (parseInt(prev.estoque) || 0) - 1)) }))} className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-lg text-white font-bold text-lg flex items-center justify-center transition-colors">-</button>
                      <input type="number" min="0" value={newProduct.estoque} onChange={(e) => setNewProduct({ ...newProduct, estoque: e.target.value })} placeholder="0" className={`${inputClass} text-center`} />
                      <button type="button" onClick={() => setNewProduct(prev => ({ ...prev, estoque: String((parseInt(prev.estoque) || 0) + 1) }))} className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-lg text-white font-bold text-lg flex items-center justify-center transition-colors">+</button>
                    </div>
                  </div>
                  <div className="md:col-span-2 lg:col-span-3">
                    <label className={labelClass}>Descrição</label>
                    <input value={newProduct.descricao} onChange={(e) => setNewProduct({ ...newProduct, descricao: e.target.value })} placeholder="Descrição breve do produto" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Tipo / Arquitetura</label>
                    <input value={newProduct.tipo} onChange={(e) => setNewProduct({ ...newProduct, tipo: e.target.value })} placeholder="Ex: CoreXY, MSLA" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Velocidade</label>
                    <input value={newProduct.velocidade} onChange={(e) => setNewProduct({ ...newProduct, velocidade: e.target.value })} placeholder="Ex: 500 mm/s" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Volume de Construção</label>
                    <input value={newProduct.volume} onChange={(e) => setNewProduct({ ...newProduct, volume: e.target.value })} placeholder="Ex: 256×256×256mm" className={inputClass} />
                  </div>
                </div>
                {/* Modelo 3D */}
                <div className="mt-4">
                  <label className={labelClass}>Modelo 3D (Opcional)</label>
                  <p className="text-xs text-gray-500 mb-2">Faça upload de um arquivo .stl, .obj ou .glb para visualização 3D no site</p>
                  <div className="flex items-center gap-3">
                    {newProduct.modelo3d ? (
                      <div className="flex items-center gap-2 px-3 py-2 bg-green-500/20 border border-green-500/30 rounded-lg">
                        <Check size={16} className="text-green-400" />
                        <span className="text-sm text-green-400">{newProduct.modelo3dNome || 'Modelo carregado'}</span>
                        <button onClick={() => setNewProduct(prev => ({ ...prev, modelo3d: '', modelo3dNome: '' }))} className="ml-2 text-red-400 hover:text-red-300">
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <label className="flex items-center gap-2 px-4 py-2.5 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-400 rounded-lg cursor-pointer transition-colors">
                        <Upload size={16} />
                        <span className="text-sm">Carregar Modelo 3D</span>
                        <input type="file" accept=".stl,.obj,.glb,.gltf" className="hidden" onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (ev) => {
                              const base64 = ev.target?.result as string;
                              setNewProduct(prev => ({ ...prev, modelo3d: base64, modelo3dNome: file.name }));
                            };
                            reader.readAsDataURL(file);
                          }
                          e.target.value = '';
                        }} />
                      </label>
                    )}
                  </div>
                </div>
                {/* Fotos */}
                <div className="mt-4">
                  <label className={labelClass}>Fotos do Produto (múltiplas)</label>
                  <div className="flex flex-wrap items-center gap-3">
                    {newProduct.imagens.map((img, idx) => (
                      <div key={idx} className="relative w-20 h-20 bg-white/5 rounded-lg overflow-hidden border border-white/10">
                        <img src={img} alt={`Foto ${idx + 1}`} className="w-full h-full object-contain p-1" />
                        <button onClick={() => setNewProduct(prev => ({ ...prev, imagens: prev.imagens.filter((_, i) => i !== idx), imagem: idx === 0 ? (prev.imagens[1] || '') : prev.imagem }))} className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                          <X size={10} className="text-white" />
                        </button>
                        {idx === 0 && <span className="absolute bottom-0 left-0 right-0 bg-blue-600/80 text-white text-[9px] text-center py-0.5">Principal</span>}
                      </div>
                    ))}
                    <label className="flex flex-col items-center justify-center w-20 h-20 bg-white/5 hover:bg-white/10 border border-dashed border-white/20 rounded-lg text-gray-400 cursor-pointer transition-colors">
                      <Upload size={18} />
                      <span className="text-[10px] mt-1">Adicionar</span>
                      <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => { const files = Array.from(e.target.files || []); files.forEach(file => { const reader = new FileReader(); reader.onload = (ev) => { const base64 = ev.target?.result as string; setNewProduct(prev => ({ ...prev, imagem: prev.imagem || base64, imagens: [...prev.imagens, base64] })); }; reader.readAsDataURL(file); }); e.target.value = ''; }} />
                    </label>
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-5">
                  <button onClick={() => setShowAddForm(false)} className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm transition-colors">Cancelar</button>
                  <button onClick={handleAddProduct} className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
                    <Save size={16} />Salvar Produto
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProdutos.map((produto, index) => {
              const imgSrc = getProductImage(produto);
              const hasVariacoes = produto.variacoes && produto.variacoes.length > 0;
              return (
                <motion.div key={produto.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }}>
                  <div className={`bg-[#161923] rounded-xl border overflow-hidden hover:border-white/20 transition-all group ${produto.ativo === false ? 'border-red-500/20 opacity-60' : 'border-white/10'}`}>
                    {/* Image */}
                    <div className="relative h-48 bg-gradient-to-br from-white/5 to-white/[0.02] flex items-center justify-center overflow-hidden">
                      {imgSrc ? (
                        <img src={imgSrc} alt={produto.nome} className="h-full w-full object-contain p-4 group-hover:scale-110 transition-transform duration-300" />
                      ) : (
                        <Package className="w-16 h-16 text-gray-600" />
                      )}
                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${produto.categoria === 'FDM' ? 'bg-blue-500/80 text-white' : 'bg-purple-500/80 text-white'}`}>
                          {produto.categoria}
                        </span>
                        {produto.destaque && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500/80 text-white">Destaque</span>}
                        {produto.ativo === false && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-red-500/80 text-white">Inativo</span>}
                      </div>
                      <div className="absolute top-3 right-3 flex flex-col gap-1 items-end">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${produto.source === 'catalogo' ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-gray-400'}`}>
                          {produto.source === 'catalogo' ? 'Catálogo' : 'Manual'}
                        </span>
                        {hasVariacoes && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-400 flex items-center gap-1">
                            <GitBranch size={9} />{produto.variacoes!.length} var.
                          </span>
                        )}
                      </div>
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button onClick={() => { setUploadTarget(produto.id); fileInputRef.current?.click(); }} className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-xs font-medium flex items-center gap-1.5 transition-colors">
                          <Upload size={14} />Foto
                        </button>
                        {imgSrc && (
                          <button onClick={() => setEditingImage({ productId: produto.id, data: imgSrc })} className="px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white text-xs font-medium flex items-center gap-1.5 transition-colors">
                            <Scissors size={14} />Editar
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="mb-2">
                        <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">{produto.marca}</p>
                        <h3 className="text-sm font-bold text-white leading-tight">{produto.nome}</h3>
                      </div>
                      {produto.tipo && (
                        <p className="text-xs text-gray-500 mb-2">{produto.tipo} {produto.velocidade && `• ${produto.velocidade}`} {produto.volume && `• ${produto.volume}`}</p>
                      )}

                      {/* Variações preview */}
                      {hasVariacoes && (
                        <div className="mb-2 flex flex-wrap gap-1">
                          {produto.variacoes!.slice(0, 3).map(v => (
                            <span key={v.id} className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-[10px] text-blue-400">
                              {v.nome} — {fmtBRL(v.preco)}
                            </span>
                          ))}
                          {produto.variacoes!.length > 3 && (
                            <span className="px-2 py-0.5 bg-white/5 rounded-full text-[10px] text-gray-400">+{produto.variacoes!.length - 3}</span>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
                        <div>
                          <p className="text-lg font-bold text-green-400">{fmtBRL(produto.preco)}</p>
                          <p className="text-[10px] text-gray-500">Estoque: {produto.estoque || 0} un.</p>
                        </div>
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => handleToggleActive(produto)}
                            className={`h-8 w-8 flex items-center justify-center rounded-lg transition-colors ${
                              produto.ativo !== false
                                ? 'bg-green-500/20 hover:bg-red-500/20 text-green-400 hover:text-red-400'
                                : 'bg-red-500/20 hover:bg-green-500/20 text-red-400 hover:text-green-400'
                            }`}
                            title={produto.ativo !== false ? 'Clique para desativar (ocultar da loja)' : 'Clique para ativar (exibir na loja)'}
                          >
                            {produto.ativo !== false ? <Eye size={14} /> : <EyeOff size={14} />}
                          </button>
                          <button onClick={() => setEditingProduct(produto)} className="h-8 w-8 flex items-center justify-center rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 transition-colors" title="Editar produto">
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => setDeletingProduct(produto)} className="h-8 w-8 flex items-center justify-center rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors" title="Excluir produto">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {filteredProdutos.length === 0 && (
            <div className="text-center py-20 bg-[#161923] rounded-xl border border-dashed border-white/10">
              <Package className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 font-medium">Nenhum produto encontrado.</p>
              <button onClick={() => { setSearchTerm(''); setFilterMarca('todos'); setFilterCategoria('todos'); }} className="mt-2 text-blue-400 hover:text-blue-300 text-sm">Limpar filtros</button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
