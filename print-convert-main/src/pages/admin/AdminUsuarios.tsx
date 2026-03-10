import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users, Search, Eye, Trash2, Mail, Phone, MapPin, Calendar, Clock
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { usuariosAPI } from '@/lib/apiClient';
import Sidebar from '@/components/admin/Sidebar';
import AdminHeader from '@/components/admin/AdminHeader';

interface Usuario {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  cidade?: string;
  estado?: string;
  data_cadastro: string;
  ultimo_acesso?: string;
  orcamentos_realizados: number;
  compras_realizadas: number;
}

export default function AdminUsuarios() {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        setLoading(true);
        const data = await usuariosAPI.getAll();
        setUsuarios(data || []);
      } catch (error) {
        console.error('Erro ao carregar usuários:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsuarios();
  }, []);

  const filteredUsuarios = usuarios.filter((user) => {
    const matchesSearch =
      (user.nome || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.id || '').toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
      try {
        await usuariosAPI.delete(id);
        setUsuarios(prev => prev.filter(user => user.id !== id));
      } catch (error) {
        console.error(`Erro ao excluir usuário ${id}:`, error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        <AdminHeader title="Usuários" />

        <div className="p-8 max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8"
          >
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Gestão de Usuários</h1>
            <p className="text-gray-600">Visualize e gerencie todos os usuários cadastrados no sistema.</p>
          </motion.div>

          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, email ou ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {loading ? (
            <div className="grid grid-cols-1 gap-4">
              {[1, 2, 3].map(i => (
                <Card key={i} className="animate-pulse h-48"></Card>
              ))}
            </div>
          ) : filteredUsuarios.length > 0 ? (
            <div className="space-y-4">
              {filteredUsuarios.map((user, index) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                            <Users className="w-8 h-8 text-blue-600" />
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold">{user.nome}</h3>
                              <span className="text-xs text-gray-500">
                                {user.id}
                              </span>
                            </div>

                            <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                              <Mail className="w-3 h-3" />
                              {user.email}
                            </p>

                            <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                              <Phone className="w-3 h-3" />
                              {user.telefone}
                            </p>

                            {user.cidade && user.estado && (
                              <p className="text-sm text-gray-600 mb-2 flex items-center gap-2">
                                <MapPin className="w-3 h-3" />
                                {user.cidade} - {user.estado}
                              </p>
                            )}

                            <div className="grid grid-cols-2 gap-4 mt-3">
                              <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-xs text-gray-500">Orçamentos</p>
                                <p className="text-lg font-semibold">
                                  {user.orcamentos_realizados || 0}
                                </p>
                              </div>

                              <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-xs text-gray-500">Compras</p>
                                <p className="text-lg font-semibold">
                                  {user.compras_realizadas || 0}
                                </p>
                              </div>
                            </div>

                            <div className="mt-3 pt-3 border-t border-gray-100">
                              <p className="text-xs text-gray-500 flex items-center gap-2">
                                <Calendar className="w-3 h-3" />
                                Cadastrado em: {' '}
                                {user.data_cadastro ? new Date(user.data_cadastro).toLocaleDateString('pt-BR') : 'N/A'}
                              </p>
                              {user.ultimo_acesso && (
                                <p className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                                  <Clock className="w-3 h-3" />
                                  Último acesso: {' '}
                                  {new Date(user.ultimo_acesso).toLocaleDateString('pt-BR')}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/admin/usuarios/${user.id}`)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Ver
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDelete(user.id)}
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
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4 opacity-20" />
              <p className="text-gray-600 font-medium">Nenhum usuário encontrado com os filtros selecionados.</p>
              <Button variant="link" onClick={() => setSearchTerm('')} className="mt-2 text-blue-600">
                Limpar filtros
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
