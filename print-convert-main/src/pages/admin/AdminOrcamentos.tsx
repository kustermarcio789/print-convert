import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Clock, CheckCircle, AlertCircle, Box, Search, Eye, Trash2,
  Printer, Wrench, Plus, FileText, Factory, ShoppingCart
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

// Interface atualizada para suportar os campos antigos e os novos (do Supabase)
interface Orcamento {
  id: string;
  tipo?: string;
  service_type?: string;
  cliente?: string;
  client_name?: string;
  email?: string;
  client_email?: string;
  telefone?: string;
  data?: string;
  status?: string;
  valor?: number | string;
  total?: number | string;
  detalhes?: any;
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
      // Garante que é sempre um array, evitando crash no .map
      setOrcamentos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erro ao carregar orçamentos:', error);
      setOrcamentos([]);
    } finally {
      setLoading(false);
    }
  };

  const getTipoIcon = (tipo: string) => {
    const tipoLower = String(tipo || '').toLowerCase();
    if (tipoLower.includes('impressao')) return Printer;
    if (tipoLower.includes('modelagem')) return Box;
    if (tipoLower.includes('pintura')) return Factory;
    if (tipoLower.includes('manutencao')) return Wrench;
    return FileText;
  };

  const getStatusBadge = (status: string) => {
    const statusLower = String(status || 'pendente').toLowerCase();
    switch (statusLower) {
      case 'pendente':
        return <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-500/10 text-yellow-600 rounded-full text-xs font-medium"><Clock className="w-3 h-3" /> Pendente</span>;
      case 'aprovado':
        return <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/10 text-blue-600 rounded-full text-xs font-medium"><CheckCircle className="w-3 h-3" /> Aprovado</span>;
      case 'convertido':
        return <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/10 text-green-600 rounded-full text-xs font-medium"><ShoppingCart className="w-3 h-3" /> Venda Fechada</span>;
      case 'recusado':
        return <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-500/10 text-red-600 rounded-full text-xs font-medium"><AlertCircle className="w-3 h-3" /> Recusado</span>;
      default: 
        return <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-500/10 text-gray-600 rounded-full text-xs font-medium">{status}</span>;
    }
  };

  const filteredOrcamentos = orcamentos.filter((orc) => {
    // Normalização segura dos dados para evitar que o .toLowerCase() quebre o ecrã
    const nomeCliente = String(orc.cliente || orc.client_name || '').toLowerCase();
    const emailCliente = String(orc.email || orc.client_email || '').toLowerCase();
    const idOrc = String(orc.id || '').toLowerCase();
    const tipoOrc = String(orc.tipo || orc.service_type || '').toLowerCase();
    const statusOrc = String(orc.status || 'pendente').toLowerCase();

    const searchLower = searchTerm.toLowerCase();

    const matchesSearch = 
      nomeCliente.includes(searchLower) ||
      emailCliente.includes(searchLower) ||
      idOrc.includes(searchLower);
      
    const matchesTipo = filterTipo === 'todos' || tipoOrc.includes(filterTipo);
    const matchesStatus = filterStatus === 'todos' || statusOrc === filterStatus;
    
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
                    <SelectItem value="convertido">Venda Fechada</SelectItem>
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
                const tipoServico = String(orc.tipo || orc.service_type || 'Desconhecido');
                const TipoIcon = getTipoIcon(tipoServico);
                const nomeCliente = String(orc.cliente || orc.client_name || 'Sem Nome');
                const emailCliente = String(orc.email || orc.client_email || '');
                // A correção vital para o problema do .toFixed
                const valorMoeda = Number(orc.valor || orc.total || 0);

                return (
                  <Card key={orc.id}>
                    <CardContent className="p-6 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-gray-100 rounded-lg"><TipoIcon className="w-6 h-6 text-gray-600" /></div>
                        <div>
                          <h3 className="font-bold text-gray-900">{nomeCliente}</h3>
                          <p className="text-sm text-gray-500">{emailCliente} · {orc.id.substring(0, 8)}...</p>
                          <div className="mt-2">{getStatusBadge(orc.status || 'pendente')}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">R$ {valorMoeda.toFixed(2).replace('.', ',')}</p>
                        <div className="flex gap-2 mt-2 justify-end">
                          <Button variant="outline" size="sm" onClick={() => navigate(`/admin/orcamentos/${orc.id}`)}><Eye className="w-4 h-4" /></Button>
                          <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => handleDelete(orc.id)}><Trash2 className="w-4 h-4" /></Button>
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
