import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Clock, CheckCircle, AlertCircle, Truck, Search, Eye, Trash2, Mail, Phone, MapPin, UserCheck
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
import { prestadoresAPI } from '@/lib/apiClient';
import Sidebar from '@/components/admin/Sidebar';
import AdminHeader from '@/components/admin/AdminHeader';

interface Prestador {
  id: string;
  nome: string;
  apelido: string;
  email: string;
  telefone: string;
  cidade: string;
  estado: string;
  servicos: string[];
  experiencia: string;
  portfolio?: string;
  data_cadastro: string;
  status: 'pendente' | 'aprovado' | 'recusado';
  avaliacao?: number;
}

export default function AdminPrestadores() {
  const navigate = useNavigate();
  const [prestadores, setPrestadores] = useState<Prestador[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');

  useEffect(() => {
    const fetchPrestadores = async () => {
      try {
        setLoading(true);
        const data = await prestadoresAPI.getAll();
        setPrestadores(data || []);
      } catch (error) {
        console.error('Erro ao carregar prestadores:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPrestadores();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pendente':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-500/10 text-yellow-600 rounded-full text-xs font-medium">
            <Clock className="w-3 h-3" />
            Pendente
          </span>
        );
      case 'aprovado':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/10 text-green-600 rounded-full text-xs font-medium">
            <CheckCircle className="w-3 h-3" />
            Aprovado
          </span>
        );
      case 'recusado':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-500/10 text-red-600 rounded-full text-xs font-medium">
            <AlertCircle className="w-3 h-3" />
            Recusado
          </span>
        );
      default:
        return null;
    }
  };

  const filteredPrestadores = prestadores.filter((prest) => {
    const matchesSearch =
      (prest.nome || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (prest.apelido || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (prest.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (prest.id || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'todos' || prest.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este prestador?')) {
      try {
        await prestadoresAPI.delete(id);
        setPrestadores(prev => prev.filter(prest => prest.id !== id));
      } catch (error) {
        console.error(`Erro ao excluir prestador ${id}:`, error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        <AdminHeader title="Prestadores" />

        <div className="p-8 max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8"
          >
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Gestão de Prestadores</h1>
            <p className="text-gray-600">Visualize e gerencie todos os prestadores de serviço cadastrados.</p>
          </motion.div>

          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome, apelido, email ou ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os Status</SelectItem>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="aprovado">Aprovado</SelectItem>
                    <SelectItem value="recusado">Recusado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {loading ? (
            <div className="grid grid-cols-1 gap-4">
              {[1, 2, 3].map(i => (
                <Card key={i} className="animate-pulse h-48"></Card>
              ))}
            </div>
          ) : filteredPrestadores.length > 0 ? (
            <div className="space-y-4">
              {filteredPrestadores.map((prest, index) => (
                <motion.div
                  key={prest.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                            <UserCheck className="w-8 h-8 text-blue-600" />
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold">{prest.nome}</h3>
                              {getStatusBadge(prest.status)}
                            </div>

                            <p className="text-sm text-gray-600 mb-1">
                              <span className="font-medium">Apelido:</span> @{prest.apelido}
                            </p>

                            <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                              <Mail className="w-3 h-3" />
                              {prest.email}
                            </p>

                            <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                              <Phone className="w-3 h-3" />
                              {prest.telefone}
                            </p>

                            <p className="text-sm text-gray-600 mb-2 flex items-center gap-2">
                              <MapPin className="w-3 h-3" />
                              {prest.cidade} - {prest.estado}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/admin/prestadores/${prest.id}`)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Ver
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDelete(prest.id)}
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
              <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4 opacity-20" />
              <p className="text-gray-600 font-medium">Nenhum prestador encontrado.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
