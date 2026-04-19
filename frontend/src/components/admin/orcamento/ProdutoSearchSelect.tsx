import { useEffect, useMemo, useState } from 'react';
import { Search, Package, X, Check, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { produtosAPI } from '@/lib/apiClient';
import type { Product } from '@/lib/productStore';

interface SupabaseProduct {
  id: string;
  name: string;
  brand?: string;
  category_name?: string;
  description?: string;
  price?: number;
  stock?: number;
  active?: boolean;
  images?: string[];
  specifications?: any;
}

// Converte shape do Supabase para o shape Product que o OrcamentoItemCard espera
function toProduct(p: SupabaseProduct): Product {
  return {
    id: p.id,
    nome: p.name,
    marca: p.brand || '',
    categoria: (p.category_name as any) || 'Outro',
    preco: Number(p.price) || 0,
    precoLabel: `R$ ${(Number(p.price) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
    estoque: p.stock ?? 0,
    ativo: p.active !== false,
    imagem: p.images?.[0] || '',
    imagens: p.images || [],
    descricao: p.description || '',
    detalhes: p.description || '',
    specs: p.specifications?.specs,
    velocidade: p.specifications?.velocidade,
    volume: p.specifications?.volume,
    tipo: p.specifications?.tipo,
  };
}

interface Props {
  onSelect: (produto: Product) => void;
  triggerLabel?: string;
  compact?: boolean;
}

export default function ProdutoSearchSelect({
  onSelect,
  triggerLabel = 'Buscar produto no catálogo',
  compact = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [produtos, setProdutos] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    produtosAPI
      .getAll()
      .then((data) => setProdutos((data || []).map(toProduct)))
      .finally(() => setLoading(false));
  }, [open]);

  const filtrados = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return produtos.slice(0, 40);
    return produtos
      .filter(
        (p) =>
          p.nome.toLowerCase().includes(q) ||
          p.marca?.toLowerCase().includes(q) ||
          p.categoria?.toLowerCase().includes(q) ||
          p.descricao?.toLowerCase().includes(q)
      )
      .slice(0, 40);
  }, [query, produtos]);

  const handlePick = (p: Product) => {
    onSelect(p);
    setOpen(false);
    setQuery('');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" className={compact ? 'h-9' : 'w-full justify-start'}>
          <Search className="w-4 h-4 mr-2" />
          {triggerLabel}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[420px] p-0" align="start">
        <div className="p-3 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Nome, marca, categoria..."
              className="pl-9"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {loading
              ? 'Carregando catálogo...'
              : `${filtrados.length} produto(s) ${query ? 'encontrado(s)' : 'disponíveis'}`}
          </p>
        </div>
        <ScrollArea className="h-[320px]">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
            </div>
          ) : filtrados.length === 0 ? (
            <div className="p-6 text-center text-sm text-gray-500">
              {produtos.length === 0
                ? 'Nenhum produto cadastrado. Vá em Produtos → Novo Produto.'
                : `Nenhum produto encontrado para "${query}"`}
            </div>
          ) : (
            <div className="py-1">
              {filtrados.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handlePick(p)}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 transition text-left"
                >
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {p.imagem ? (
                      <img
                        src={p.imagem}
                        alt={p.nome}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <Package className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{p.nome}</p>
                    <p className="text-xs text-gray-500 truncate">
                      {p.marca} • {p.categoria}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-emerald-600">
                      {p.precoLabel ||
                        `R$ ${p.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                    </p>
                    {p.estoque > 0 ? (
                      <p className="text-[10px] text-gray-500">{p.estoque} em estoque</p>
                    ) : (
                      <p className="text-[10px] text-red-500">sem estoque</p>
                    )}
                  </div>
                  <Check className="w-4 h-4 text-gray-300 flex-shrink-0" />
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
