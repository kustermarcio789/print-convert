import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Database, Search, Eye, Trash2, Plus, AlertTriangle, Edit } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import Sidebar from '@/components/admin/Sidebar';
import AdminHeader from '@/components/admin/AdminHeader';

export interface RawMaterial {
  id: string;
  name: string;
  type: string;
  quantity: number;
  unit: string;
  min_stock: number;
  cost_price?: number;
  created_at: string;
}

export default function AdminEstoque() {
  const navigate = useNavigate();
  const [materiais, setMateriais] = useState<RawMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('todos');

  useEffect(() => {
    fetchMateriais();
  }, []);

  const fetchMateriais = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('raw_materials')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setMateriais(data);
    } catch (error) {
      console.error('Erro ao carregar materiais do Supabase:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMateriais = materiais.filter((material) => {
    const matchesSearch =
      (material.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (material.type || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'todos' || material.type === filterType;

    return matchesSearch && matchesType;
  });

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este material do estoque?')) {
      try {
        const { error } = await supabase.from('raw_materials').delete().eq('id', id);
        if (error) throw error;
        setMateriais(prev => prev.filter(material => material.id !== id));
      } catch (error) {
        console.error(`Erro ao excluir material ${id}:`, error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        <AdminHeader title="Estoque" />

        <div className="p-8 max-w-7xl mx-auto">
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome ou tipo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Filtrar por Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os Tipos</SelectItem>
                    <SelectItem value="Filamento">Filamento</SelectItem>
                    <SelectItem value="Resina">Resina</SelectItem>
                    <SelectItem value="Acessorio">Acessório</SelectItem>
                    <SelectItem value="Peca">Peça</SelectItem>
                  </SelectContent>
                </Select>

                <Button onClick={() => navigate('/admin/estoque/novo')} className="w-full md:w-auto">
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Material
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
          ) : filteredMateriais.length > 0 ? (
            <div className="space-y-4">
              {filteredMateriais.map((material, index) => {
                const isCritical = material.quantity <= material.min_stock;
                
                return (
                  <motion.div
                    key={material.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className={isCritical ? "border-red-200" : ""}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4 flex-1">
                            <div className={`p-3 rounded-lg ${isCritical ? 'bg-red-100' : 'bg-purple-100'}`}>
                              <Database className={`w-6 h-6 ${isCritical ? 'text-red-600' : 'text-purple-600'}`} />
                            </div>

                            <div className="flex-1">
                              <h3 className="text-lg font-semibold mb-1">{material.name}</h3>
                              <p className="text-sm text-gray-600 mb-1">
                                <span className="font-medium">Tipo:</span> {material.type}
                              </p>
                              <p className="text-sm text-gray-600 mb-1">
                                <span className="font-medium">Quantidade:</span> {material.quantity} {material.unit}
                              </p>
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Estoque Mínimo:</span> {material.min_stock} {material.unit}
                              </p>
                              {isCritical && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-500/10 text-red-600 rounded-full text-xs font-medium mt-2">
                                  <AlertTriangle className="w-3 h-3" />
                                  Estoque Crítico / Baixo
                                </span>
                              )}
                              <p className="text-xs text-gray-500 mt-2">
                                Cadastrado em: {material.created_at ? new Date(material.created_at).toLocaleDateString('pt-BR') : 'N/A'}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <Button variant="outline" size="sm" onClick={() => navigate(`/admin/estoque/${material.id}`)}>
                              <Eye className="w-4 h-4 mr-2" /> Ver
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => navigate(`/admin/estoque/${material.id}/editar`)}>
                              <Edit className="w-4 h-4 mr-2" /> Editar
                            </Button>
                            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(material.id)}>
                              <Trash2 className="w-4 h-4 mr-2" /> Excluir
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-200">
              <Database className="h-12 w-12 text-gray-400 mx-auto mb-4 opacity-20" />
              <p className="text-gray-600 font-medium">Nenhum material em estoque encontrado.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
