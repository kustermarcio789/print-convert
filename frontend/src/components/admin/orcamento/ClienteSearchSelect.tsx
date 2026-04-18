import { useEffect, useMemo, useState } from 'react';
import { Search, User, Building2, X, Check, UserPlus, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { clientesAPI } from '@/lib/apiClient';
import type { Cliente } from '@/types/cliente';

interface Props {
  onSelect: (cliente: Cliente) => void;
  onCreateNew?: () => void;
  triggerLabel?: string;
  compact?: boolean;
}

export default function ClienteSearchSelect({
  onSelect, onCreateNew,
  triggerLabel = 'Buscar cliente existente',
  compact = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    clientesAPI.getAll({ ativo: true }).then((data) => {
      setClientes(data);
    }).finally(() => setLoading(false));
  }, [open]);

  const filtrados = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return clientes.slice(0, 40);
    return clientes
      .filter(c =>
        c.nome?.toLowerCase().includes(q) ||
        c.nome_fantasia?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.cpf_cnpj?.replace(/\D/g, '').includes(q.replace(/\D/g, '')) ||
        c.whatsapp?.replace(/\D/g, '').includes(q.replace(/\D/g, ''))
      )
      .slice(0, 40);
  }, [query, clientes]);

  const handlePick = (c: Cliente) => {
    onSelect(c);
    setOpen(false);
    setQuery('');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" className={compact ? 'h-9 gap-2' : 'w-full justify-start gap-2'}>
          <Search className="w-4 h-4" />
          {triggerLabel}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[440px] p-0" align="start">
        <div className="p-3 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Nome, e-mail, CPF/CNPJ, WhatsApp..."
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
            {loading ? 'Carregando...' : `${filtrados.length} cliente(s) ${query ? 'encontrado(s)' : 'cadastrado(s)'}`}
          </p>
        </div>
        <ScrollArea className="h-[340px]">
          {loading ? (
            <div className="flex items-center justify-center py-8 text-gray-400">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          ) : filtrados.length === 0 ? (
            <div className="p-6 text-center space-y-3">
              <p className="text-sm text-gray-500">
                {query ? `Nenhum cliente encontrado para "${query}"` : 'Nenhum cliente cadastrado ainda.'}
              </p>
              {onCreateNew && (
                <Button type="button" size="sm" onClick={() => { setOpen(false); onCreateNew(); }} className="gap-2">
                  <UserPlus className="w-4 h-4" /> Cadastrar novo cliente
                </Button>
              )}
            </div>
          ) : (
            <div className="py-1">
              {filtrados.map((c) => {
                const Icon = c.tipo === 'PJ' ? Building2 : User;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handlePick(c)}
                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 transition text-left"
                  >
                    <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{c.nome}</p>
                      {c.nome_fantasia && (
                        <p className="text-xs text-gray-500 truncate">{c.nome_fantasia}</p>
                      )}
                      <div className="text-xs text-gray-400 truncate">
                        {[c.email, c.whatsapp, c.cpf_cnpj].filter(Boolean).join(' • ')}
                      </div>
                    </div>
                    <Check className="w-4 h-4 text-gray-300 flex-shrink-0" />
                  </button>
                );
              })}
            </div>
          )}
        </ScrollArea>
        {onCreateNew && filtrados.length > 0 && (
          <div className="border-t p-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => { setOpen(false); onCreateNew(); }}
              className="w-full gap-2 text-blue-600"
            >
              <UserPlus className="w-4 h-4" /> Cadastrar novo cliente
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
