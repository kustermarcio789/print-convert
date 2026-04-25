import { useRef, useState } from 'react';
import {
  Package, Trash2, Upload, Image as ImageIcon, Search, Edit3,
  ChevronUp, ChevronDown, Loader2, X
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import type { OrcamentoItem } from '@/types/orcamento';
import { uploadImage, uploadMultipleImages } from '@/lib/storageUpload';
import ProdutoSearchSelect from './ProdutoSearchSelect';
import PricingHelper from './PricingHelper';
import type { Product } from '@/lib/productStore';

interface Props {
  item: OrcamentoItem;
  index: number;
  total: number;
  orcamentoId?: string;
  onChange: (item: OrcamentoItem) => void;
  onRemove: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

const MATERIAIS = ['PLA', 'PETG', 'ABS', 'TPU', 'Nylon', 'ASA', 'Resina Standard', 'Resina ABS-Like', 'Resina Dental', 'Aço Carbono', 'Aço Inox', 'N/A'];
const CORES = ['Branco', 'Preto', 'Cinza', 'Vermelho', 'Azul', 'Verde', 'Amarelo', 'Laranja', 'Rosa', 'Roxo', 'Transparente', 'Outra'];

export default function OrcamentoItemCard({
  item, index, total, orcamentoId,
  onChange, onRemove, onMoveUp, onMoveDown,
}: Props) {
  const { toast } = useToast();
  const fileInputPrincipal = useRef<HTMLInputElement>(null);
  const fileInputGaleria = useRef<HTMLInputElement>(null);
  const [uploadingPrincipal, setUploadingPrincipal] = useState(false);
  const [uploadingGaleria, setUploadingGaleria] = useState(false);

  const update = (patch: Partial<OrcamentoItem>) => {
    const merged = { ...item, ...patch };
    merged.valor_total = (merged.valor_unitario || 0) * (merged.quantidade || 0);
    onChange(merged);
  };

  const handlePickProduto = (p: Product) => {
    update({
      origem: 'catalogo',
      produto_id: p.id,
      nome: p.nome,
      descricao: p.detalhes || p.descricao || '',
      imagem_principal: p.imagem,
      imagens: p.imagens && p.imagens.length > 1 ? p.imagens.slice(1) : [],
      valor_unitario: p.preco,
    });
    toast({ title: 'Produto do catálogo adicionado', description: p.nome });
  };

  const handleTrocarParaManual = () => {
    update({
      origem: 'manual',
      produto_id: undefined,
    });
  };

  const handleUploadPrincipal = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPrincipal(true);
    try {
      const uploaded = await uploadImage(file, { orcamentoId });
      update({ imagem_principal: uploaded.url });
      toast({ title: 'Imagem enviada' });
    } catch (err: any) {
      toast({ title: 'Erro no upload', description: err.message, variant: 'destructive' });
    } finally {
      setUploadingPrincipal(false);
      if (fileInputPrincipal.current) fileInputPrincipal.current.value = '';
    }
  };

  const handleUploadGaleria = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploadingGaleria(true);
    try {
      const uploaded = await uploadMultipleImages(files, { orcamentoId });
      const novas = uploaded.map(u => u.url);
      update({ imagens: [...(item.imagens || []), ...novas] });
      toast({ title: `${uploaded.length} imagem(ns) enviada(s)` });
    } catch (err: any) {
      toast({ title: 'Erro no upload', description: err.message, variant: 'destructive' });
    } finally {
      setUploadingGaleria(false);
      if (fileInputGaleria.current) fileInputGaleria.current.value = '';
    }
  };

  const removerImagemGaleria = (idx: number) => {
    const imagens = [...(item.imagens || [])];
    imagens.splice(idx, 1);
    update({ imagens });
  };

  const removerImagemPrincipal = () => {
    update({ imagem_principal: undefined });
  };

  return (
    <Card className="border border-gray-200">
      <CardContent className="p-5 space-y-4">
        {/* Cabeçalho do item */}
        <div className="flex items-center justify-between pb-3 border-b">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-blue-700">#{index + 1}</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Item {index + 1}</h3>
              <div className="flex items-center gap-2 mt-0.5">
                {item.origem === 'catalogo' ? (
                  <Badge variant="secondary" className="text-[10px] bg-purple-100 text-purple-700 hover:bg-purple-100">
                    <Package className="w-3 h-3 mr-1" /> Catálogo
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-[10px] bg-amber-100 text-amber-700 hover:bg-amber-100">
                    <Edit3 className="w-3 h-3 mr-1" /> Manual
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {onMoveUp && (
              <Button type="button" variant="ghost" size="icon" onClick={onMoveUp} className="h-8 w-8" title="Mover para cima">
                <ChevronUp className="w-4 h-4" />
              </Button>
            )}
            {onMoveDown && (
              <Button type="button" variant="ghost" size="icon" onClick={onMoveDown} className="h-8 w-8" title="Mover para baixo">
                <ChevronDown className="w-4 h-4" />
              </Button>
            )}
            {total > 1 && (
              <Button type="button" variant="ghost" size="icon" onClick={onRemove} className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50" title="Remover item">
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Toggle origem: catálogo ou manual */}
        <div className="flex flex-wrap gap-2">
          <ProdutoSearchSelect
            onSelect={handlePickProduto}
            triggerLabel={item.origem === 'catalogo' ? 'Trocar produto do catálogo' : 'Escolher do catálogo'}
            compact
          />
          {item.origem === 'catalogo' && (
            <Button type="button" variant="ghost" size="sm" onClick={handleTrocarParaManual} className="h-9">
              <Edit3 className="w-4 h-4 mr-2" /> Editar manualmente
            </Button>
          )}
        </div>

        {/* Nome + Descrição */}
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Nome do produto *</Label>
            <Input
              value={item.nome}
              onChange={(e) => update({ nome: e.target.value })}
              placeholder="Ex: Miniatura Soldado 28mm — Pintura Premium"
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-xs">Descrição</Label>
            <textarea
              value={item.descricao}
              onChange={(e) => update({ descricao: e.target.value })}
              placeholder="Detalhes técnicos, personalização, acabamento..."
              rows={3}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
            />
          </div>
        </div>

        {/* Imagem principal */}
        <div>
          <Label className="text-xs block mb-2">Imagem principal</Label>
          {item.imagem_principal ? (
            <div className="relative inline-block">
              <img
                src={item.imagem_principal}
                alt={item.nome}
                className="w-40 h-40 object-cover rounded-lg border border-gray-200"
              />
              <button
                type="button"
                onClick={removerImagemPrincipal}
                className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-md"
                title="Remover imagem"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputPrincipal.current?.click()}
              disabled={uploadingPrincipal}
              className="w-40 h-40 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-blue-400 hover:bg-blue-50 transition text-gray-500 disabled:opacity-50"
            >
              {uploadingPrincipal ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <ImageIcon className="w-8 h-8" />
                  <span className="text-xs">Adicionar foto</span>
                </>
              )}
            </button>
          )}
          <input
            ref={fileInputPrincipal}
            type="file"
            accept="image/*"
            onChange={handleUploadPrincipal}
            className="hidden"
          />
        </div>

        {/* Galeria */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-xs">Galeria de imagens ({(item.imagens || []).length})</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputGaleria.current?.click()}
              disabled={uploadingGaleria}
              className="h-7 text-xs"
            >
              {uploadingGaleria ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5 mr-1.5" /> Adicionar
                </>
              )}
            </Button>
          </div>
          {(item.imagens || []).length > 0 && (
            <div className="grid grid-cols-6 gap-2">
              {item.imagens!.map((url, i) => (
                <div key={i} className="relative group">
                  <img src={url} alt={`galeria-${i}`} className="w-full h-16 object-cover rounded border border-gray-200" />
                  <button
                    type="button"
                    onClick={() => removerImagemGaleria(i)}
                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded transition"
                  >
                    <Trash2 className="w-4 h-4 text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <input
            ref={fileInputGaleria}
            type="file"
            accept="image/*"
            multiple
            onChange={handleUploadGaleria}
            className="hidden"
          />
        </div>

        {/* Material + Cor + Acabamento */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <Label className="text-xs">Material</Label>
            <Select value={item.material || ''} onValueChange={(v) => update({ material: v })}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {MATERIAIS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Cor</Label>
            <Select value={item.cor || ''} onValueChange={(v) => update({ cor: v })}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {CORES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Acabamento</Label>
            <Input
              value={item.acabamento || ''}
              onChange={(e) => update({ acabamento: e.target.value })}
              placeholder="Ex: Pintura premium"
              className="mt-1"
            />
          </div>
        </div>

        {/* Dimensões + peso */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <Label className="text-xs">Largura (mm)</Label>
            <Input type="number" value={item.largura_mm ?? ''} onChange={(e) => update({ largura_mm: e.target.value ? parseFloat(e.target.value) : undefined })} className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">Altura (mm)</Label>
            <Input type="number" value={item.altura_mm ?? ''} onChange={(e) => update({ altura_mm: e.target.value ? parseFloat(e.target.value) : undefined })} className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">Profundidade (mm)</Label>
            <Input type="number" value={item.profundidade_mm ?? ''} onChange={(e) => update({ profundidade_mm: e.target.value ? parseFloat(e.target.value) : undefined })} className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">Peso (g)</Label>
            <Input type="number" value={item.peso_g ?? ''} onChange={(e) => update({ peso_g: e.target.value ? parseFloat(e.target.value) : undefined })} className="mt-1" />
          </div>
        </div>

        {/* Quantidade + Valor unitário + Valor total */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t">
          <div>
            <Label className="text-xs">Quantidade *</Label>
            <Input
              type="number"
              min={1}
              value={item.quantidade}
              onChange={(e) => update({ quantidade: parseInt(e.target.value) || 1 })}
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-xs">Valor unitário (R$) *</Label>
            <Input
              type="number"
              step="0.01"
              value={item.valor_unitario}
              onChange={(e) => update({ valor_unitario: parseFloat(e.target.value) || 0 })}
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-xs">Subtotal</Label>
            <div className="mt-1 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-md text-right font-bold text-emerald-700">
              R$ {item.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        <PricingHelper
          quantidade={item.quantidade}
          onApply={(unit) => update({ valor_unitario: unit })}
        />

        {/* Observações do item */}
        <div>
          <Label className="text-xs">Observações do item</Label>
          <textarea
            value={item.observacoes || ''}
            onChange={(e) => update({ observacoes: e.target.value })}
            placeholder="Notas internas ou específicas deste item..."
            rows={2}
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
          />
        </div>
      </CardContent>
    </Card>
  );
}
