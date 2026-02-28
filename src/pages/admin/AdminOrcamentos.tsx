import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Clock, CheckCircle, AlertCircle, Box, Search, Eye, Trash2,
  Printer, Wrench, Plus, FileText, Factory
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
import { orcamentosAPI } from '@/lib/apiClient';
import { useToast } from '@/hooks/use-toast';
import Sidebar from '@/components/admin/Sidebar';
import AdminHeader from '@/components/admin/AdminHeader';

interface Orcamento {
  id: string;
  tipo: string;
  cliente: string;
  email: string;
  telefone: string;
  data: string;
  status: 'pendente' | 'aprovado' | 'recusado';
  valor?: number;
  detalhes: any;
}

export default function AdminOrcamentos() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState('todos');
  const [filterStatus, setFilterStatus] = useState('todos');

  useEffect(() => {
    fetchOrcamentos();
  }, []);

  const fetchOrcamentos = async () => {
    try {
      setLoading(true);
      const data = await orcamentosAPI.getAll();
      setOrcamentos(data || []);
    } catch (error) {
      console.error('Erro ao carregar orçamentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'impressao': return Printer;
      case 'modelagem': return Box;
      case 'pintura': return Factory;
      case 'manutencao': return Wrench;
      default: return FileText;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pendente':
        return <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-500/10 text-yellow-600 rounded-full text-xs font-medium"><Clock className="w-3 h-3" /> Pendente</span>;
      case 'aprovado':
        return <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/10 text-green-600 rounded-full text-xs font-medium"><CheckCircle className="w-3 h-3" /> Aprovado</span>;
      case 'recusado':
        return <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-500/10 text-red-600 rounded-full text-xs font-medium"><AlertCircle className="w-3 h-3" /> Recusado</span>;
      default: return null;
    }
  };

  const filteredOrcamentos = orcamentos.filter((orc) => {
    const matchesSearch = 
      (orc.cliente || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (orc.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (orc.id || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTipo = filterTipo === 'todos' || orc.tipo === filterTipo;
    const matchesStatus = filterStatus === 'todos' || orc.status === filterStatus;
    return matchesSearch && matchesTipo && matchesStatus;
  });

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este orçamento?')) {
      try {
        await orcamentosAPI.delete(id);
        toast({ title: "Sucesso", description: "Orçamento excluído com sucesso!" });
        fetchOrcamentos();
      } catch (error) {
        console.error('Erro ao excluir orçamento:', error);
        toast({ title: "Erro", description: "Falha ao excluir orçamento.", variant: "destructive" });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        <AdminHeader title="Orçamentos" />

        <div className="p-8 max-w-7xl mx-auto">
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Buscar por cliente, email ou ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
                </div>
                <Select value={filterTipo} onValueChange={setFilterTipo}>
                  <SelectTrigger><SelectValue placeholder="Tipo de Orçamento" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os Tipos</SelectItem>
                    <SelectItem value="impressao">Impressão 3D</SelectItem>
                    <SelectItem value="modelagem">Modelagem 3D</SelectItem>
                    <SelectItem value="pintura">Pintura</SelectItem>
                    <SelectItem value="manutencao">Manutenção</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
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
            <div className="space-y-4">{[1,2,3].map(i => <Card key={i} className="animate-pulse h-32"></Card>)}</div>
          ) : filteredOrcamentos.length > 0 ? (
            <div className="space-y-4">
              {filteredOrcamentos.map((orc) => {
                const TipoIcon = getTipoIcon(orc.tipo);
                return (
                  <Card key={orc.id}>
                    <CardContent className="p-6 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-gray-100 rounded-lg"><TipoIcon className="w-6 h-6 text-gray-600" /></div>
                        <div>
                          <h3 className="font-bold text-gray-900">{orc.cliente}</h3>
                          <p className="text-sm text-gray-500">{orc.email} · {orc.id}</p>
                          <div className="mt-2">{getStatusBadge(orc.status)}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">R$ {(orc.valor || 0).toFixed(2).replace('.', ',')}</p>
                        <div className="flex gap-2 mt-2">
                          <Button variant="outline" size="sm" onClick={() => navigate(`/admin/orcamentos/${orc.id}`)}><Eye className="w-4 h-4" /></Button>
                          <Button variant="outline" size="sm" className="text-red-600" onClick={() => handleDelete(orc.id)}><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-200">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4 opacity-20" />
              <p className="text-gray-600 font-medium">Nenhum orçamento encontrado.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
