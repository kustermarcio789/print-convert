import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Package, Search, Eye, Edit, Trash2, Plus
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { produtosAPI } from '@/lib/apiClient';
import Sidebar from '@/components/admin/Sidebar';
import AdminHeader from '@/components/admin/AdminHeader';

interface Produto {
  id: string;
  nome: string;
  categoria: string;
  preco: number;
  estoque: number;
  created_at: string;
}

export default function AdminProdutos() {
  const navigate = useNavigate();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('todos');

  useEffect(() => {
    const fetchProdutos = async () => {
      try {
        setLoading(true);
        const data = await produtosAPI.getAll().catch(err => {
          console.error('Falha na API de produtos:', err);
          return [];
        });
        setProdutos(data || []);
      } catch (error) {
        console.error('Erro ao carregar produtos:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProdutos();
  }, []);

  const filteredProdutos = produtos.filter((produto) => {
    const nome = produto.nome || '';
    const categoria = produto.categoria || '';
    
    const matchesSearch =
      nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      categoria.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === 'todos' || categoria === filterCategory;

    return matchesSearch && matchesCategory;
  });

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      try {
        await produtosAPI.delete(id);
        setProdutos(prev => prev.filter(produto => produto.id !== id));
      } catch (error) {
        console.error(`Erro ao excluir produto ${id}:`, error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        <AdminHeader title="Produtos" />

        <div className="p-8 max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8"
          >
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Gestão de Produtos</h1>
            <p className="text-gray-600">Visualize e gerencie todos os produtos internos.</p>
          </motion.div>

          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome ou categoria..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Filtrar por Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todas as Categorias</SelectItem>
                    <SelectItem value="Filamento">Filamento</SelectItem>
                    <SelectItem value="Resina">Resina</SelectItem>
                    <SelectItem value="Peças">Peças</SelectItem>
                    <SelectItem value="Impressora">Impressora</SelectItem>
                  </SelectContent>
                </Select>

                <Button onClick={() => navigate('/admin/produtos/novo')} className="w-full md:w-auto">
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Produto
                </Button>
              </div>
            </CardContent>
          </Card>

          {loading ? (
            <div className="grid grid-cols-1 gap-4">
              {[1, 2, 3].map(i => (
                <Card key={i} className="animate-pulse h-48"></Card>
              ))}
            </div>
          ) : filteredProdutos.length > 0 ? (
            <div className="space-y-4">
              {filteredProdutos.map((produto, index) => (
                <motion.div
                  key={produto.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="p-3 bg-green-100 rounded-lg">
                            <Package className="w-6 h-6 text-green-600" />
                          </div>

                          <div className="flex-1">
                            <h3 className="text-lg font-semibold mb-1">{produto.nome}</h3>
                            <p className="text-sm text-gray-600 mb-1">
                              <span className="font-medium">Categoria:</span> {produto.categoria}
                            </p>
                            <p className="text-sm text-gray-600 mb-1">
                              <span className="font-medium">Preço:</span> R$ {Number(produto.preco || 0).toFixed(2).replace('.', ',')}
                            </p>
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Estoque:</span> {produto.estoque || 0}
                            </p>
                            <p className="text-xs text-gray-500 mt-2">
                              Cadastrado em: {produto.created_at ? new Date(produto.created_at).toLocaleDateString('pt-BR') : 'N/A'}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/admin/produtos/${produto.id}`)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Ver
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/admin/produtos/${produto.id}/editar`)}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Editar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDelete(produto.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Excluir
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-200">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4 opacity-20" />
              <p className="text-gray-600 font-medium">Nenhum produto encontrado com os filtros selecionados.</p>
              <Button variant="link" onClick={() => { setSearchTerm(''); setFilterCategory('todos'); }} className="mt-2 text-blue-600">
                Limpar todos os filtros
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
