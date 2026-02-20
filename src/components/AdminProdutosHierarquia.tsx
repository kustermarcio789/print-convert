import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus, Filter, Loader, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  getMarcas,
  getModelos,
  getTiposProdutos,
  getProdutosV2,
  deleteProdutoV2,
} from '@/lib/produtosClient';

interface Produto {
  id: string;
  nome: string;
  preco: number;
  estoque: number;
  marca?: { nome: string };
  modelo?: { nome: string };
  tipo?: { nome: string };
  rating: number;
  total_vendas: number;
}

interface Filtros {
  marcaId: string;
  modeloId: string;
  tipoId: string;
}

export function AdminProdutosHierarquia() {
  const { toast } = useToast();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [marcas, setMarcas] = useState<any[]>([]);
  const [modelos, setModelos] = useState<any[]>([]);
  const [tipos, setTipos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [filtros, setFiltros] = useState<Filtros>({
    marcaId: '',
    modeloId: '',
    tipoId: '',
  });

  // Carregar dados iniciais
  useEffect(() => {
    carregarDados();
  }, []);

  // Recarregar modelos quando marca muda
  useEffect(() => {
    if (filtros.marcaId) {
      carregarModelos(filtros.marcaId);
    } else {
      setModelos([]);
      setFiltros(prev => ({ ...prev, modeloId: '' }));
    }
  }, [filtros.marcaId]);

  // Recarregar produtos quando filtros mudam
  useEffect(() => {
    carregarProdutos();
  }, [filtros]);

  const carregarDados = async () => {
    try {
      setIsLoading(true);
      const [marcasData, tiposData] = await Promise.all([getMarcas(), getTiposProdutos()]);
      setMarcas(marcasData);
      setTipos(tiposData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: 'Erro ao carregar dados',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const carregarModelos = async (marcaId: string) => {
    try {
      const modelosData = await getModelos(marcaId);
      setModelos(modelosData);
    } catch (error) {
      console.error('Erro ao carregar modelos:', error);
    }
  };

  const carregarProdutos = async () => {
    try {
      const produtosData = await getProdutosV2({
        marcaId: filtros.marcaId || undefined,
        modeloId: filtros.modeloId || undefined,
        tipoId: filtros.tipoId || undefined,
      });
      setProdutos(produtosData);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      toast({
        title: 'Erro ao carregar produtos',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este produto?')) {
      return;
    }

    setDeletingIds(prev => new Set(prev).add(id));

    try {
      const result = await deleteProdutoV2(id);

      if (result.success) {
        setProdutos(prev => prev.filter(p => p.id !== id));
        toast({
          title: 'Produto excluído',
          description: 'O produto foi removido com sucesso.',
        });
      } else {
        throw new Error('Falha ao excluir');
      }
    } catch (error) {
      console.error('Erro ao excluir:', error);
      toast({
        title: 'Erro ao excluir',
        description: 'Não foi possível remover o produto.',
        variant: 'destructive',
      });
    } finally {
      setDeletingIds(prev => {
        const novo = new Set(prev);
        novo.delete(id);
        return novo;
      });
    }
  };

  const handleLimparFiltros = () => {
    setFiltros({ marcaId: '', modeloId: '', tipoId: '' });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin mx-auto mb-2 text-accent" />
          <p className="text-muted-foreground">Carregando produtos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Gerenciar Produtos</h2>
        <Button className="bg-accent hover:bg-accent/90 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Novo Produto
        </Button>
      </div>

      {/* Filtros */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-accent" />
          <h3 className="font-semibold text-foreground">Filtros</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Marca */}
          <div className="space-y-2">
            <Label>Marca</Label>
            <Select value={filtros.marcaId} onValueChange={(value) =>
              setFiltros(prev => ({ ...prev, marcaId: value }))
            }>
              <SelectTrigger>
                <SelectValue placeholder="Todas as marcas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas as marcas</SelectItem>
                {marcas.map(marca => (
                  <SelectItem key={marca.id} value={marca.id}>
                    {marca.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Modelo */}
          <div className="space-y-2">
            <Label>Modelo</Label>
            <Select
              value={filtros.modeloId}
              onValueChange={(value) =>
                setFiltros(prev => ({ ...prev, modeloId: value }))
              }
              disabled={!filtros.marcaId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos os modelos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os modelos</SelectItem>
                {modelos.map(modelo => (
                  <SelectItem key={modelo.id} value={modelo.id}>
                    {modelo.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tipo */}
          <div className="space-y-2">
            <Label>Tipo de Produto</Label>
            <Select value={filtros.tipoId} onValueChange={(value) =>
              setFiltros(prev => ({ ...prev, tipoId: value }))
            }>
              <SelectTrigger>
                <SelectValue placeholder="Todos os tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os tipos</SelectItem>
                {tipos.map(tipo => (
                  <SelectItem key={tipo.id} value={tipo.id}>
                    {tipo.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Botão Limpar */}
          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={handleLimparFiltros}
              className="w-full"
            >
              Limpar Filtros
            </Button>
          </div>
        </div>
      </Card>

      {/* Lista de Produtos */}
      {produtos.length === 0 ? (
        <Card className="p-12 text-center">
          <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
          <p className="text-muted-foreground">Nenhum produto encontrado</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {produtos.map((produto, index) => (
              <motion.div
                key={produto.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="p-4 hover:shadow-md transition-shadow h-full flex flex-col">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-2 line-clamp-2">
                      {produto.nome}
                    </h3>

                    <div className="space-y-2 text-sm mb-4">
                      {produto.marca && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Marca:</span>
                          <span className="font-medium">{produto.marca.nome}</span>
                        </div>
                      )}
                      {produto.modelo && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Modelo:</span>
                          <span className="font-medium">{produto.modelo.nome}</span>
                        </div>
                      )}
                      {produto.tipo && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Tipo:</span>
                          <span className="font-medium">{produto.tipo.nome}</span>
                        </div>
                      )}
                      <div className="flex justify-between pt-2 border-t border-border">
                        <span className="text-muted-foreground">Preço:</span>
                        <span className="font-bold text-accent">
                          R$ {produto.preco.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Estoque:</span>
                        <span className={produto.estoque > 0 ? 'text-green-600' : 'text-red-600'}>
                          {produto.estoque} un.
                        </span>
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-2 text-sm mb-4">
                      <span className="text-yellow-500">★</span>
                      <span className="font-medium">{produto.rating.toFixed(1)}</span>
                      <span className="text-muted-foreground">
                        ({produto.total_vendas} vendas)
                      </span>
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex gap-2 pt-4 border-t border-border">
                    <Button size="sm" variant="outline" className="flex-1">
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(produto.id)}
                      disabled={deletingIds.has(produto.id)}
                    >
                      {deletingIds.has(produto.id) ? (
                        <Loader className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Contador */}
      <div className="text-sm text-muted-foreground text-center">
        Exibindo {produtos.length} produto(s)
      </div>
    </div>
  );
}
