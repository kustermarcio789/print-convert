import { useMemo, useState } from 'react';
import { Search, Package, X, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getActiveProducts, type Product } from '@/lib/productStore';

interface Props {
  onSelect: (produto: Product) => void;
  triggerLabel?: string;
  compact?: boolean;
}

export default function ProdutoSearchSelect({ onSelect, triggerLabel = 'Buscar produto no catálogo', compact = false }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const todos = useMemo(() => getActiveProducts(), []);

  const filtrados = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return todos.slice(0, 30);
    return todos
      .filter(p =>
        p.nome.toLowerCase().includes(q) ||
        p.marca?.toLowerCase().includes(q) ||
        p.categoria?.toLowerCase().includes(q) ||
        p.descricao?.toLowerCase().includes(q)
      )
      .slice(0, 30);
  }, [query, todos]);

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
            {filtrados.length} produto(s) {query ? 'encontrado(s)' : 'disponíveis'}
          </p>
        </div>
        <ScrollArea className="h-[320px]">
          {filtrados.length === 0 ? (
            <div className="p-6 text-center text-sm text-gray-500">
              Nenhum produto encontrado para "{query}"
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
                      <img src={p.imagem} alt={p.nome} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
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
                      {p.precoLabel || `R$ ${p.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
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
