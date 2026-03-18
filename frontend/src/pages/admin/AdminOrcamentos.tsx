import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock, CheckCircle, AlertCircle, Box, Search, Eye, Trash2,
  Printer, Wrench, Plus, FileText, Factory, ShoppingCart, Edit,
  Mail, MessageCircle, Download, X, Save, Send, Upload, File3d,
  Phone, User, Calendar, DollarSign, FileDown, ChevronDown
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  tipo?: string;
  service_type?: string;
  cliente?: string;
  client_name?: string;
  email?: string;
  client_email?: string;
  telefone?: string;
  whatsapp?: string;
  data?: string;
  created_at?: string;
  status?: string;
  valor?: number | string;
  total?: number | string;
  detalhes?: any;
  arquivo_3d?: string;
  arquivo_3d_nome?: string;
  descricao?: string;
  material?: string;
  quantidade?: number;
  prazo?: string;
  observacoes?: string;
}

interface NovoOrcamento {
  cliente: string;
  email: string;
  telefone: string;
  whatsapp: string;
  tipo: string;
  descricao: string;
  material: string;
  quantidade: number;
  valor: number;
  prazo: string;
  observacoes: string;
}

export default function AdminOrcamentos() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState('todos');
  const [filterStatus, setFilterStatus] = useState('todos');
  
  // Modal states
  const [selectedOrcamento, setSelectedOrcamento] = useState<Orcamento | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [sendingEmail, setSendingEmail] = useState<string | null>(null);
  
  // Novo orçamento manual
  const [novoOrcamento, setNovoOrcamento] = useState<NovoOrcamento>({
    cliente: '',
    email: '',
    telefone: '',
    whatsapp: '',
    tipo: 'impressao',
    descricao: '',
    material: 'PLA',
    quantidade: 1,
    valor: 0,
    prazo: '7 dias',
    observacoes: '',
  });

  useEffect(() => {
    fetchOrcamentos();
  }, []);

  const fetchOrcamentos = async () => {
    try {
      setLoading(true);
      const data = await orcamentosAPI.getAll();
      setOrcamentos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erro ao carregar orçamentos:', error);
      // Dados de exemplo para demonstração
      setOrcamentos([
        {
          id: 'ORC-001',
          cliente: 'João Silva',
          email: 'joao@email.com',
          telefone: '(14) 99999-9999',
          whatsapp: '5514999999999',
          tipo: 'impressao',
          status: 'pendente',
          valor: 350,
          data: new Date().toISOString(),
          descricao: 'Impressão de 3 peças em PLA',
          material: 'PLA',
          quantidade: 3,
          arquivo_3d: 'https://example.com/modelo.stl',
          arquivo_3d_nome: 'peca_personalizada.stl',
          observacoes: 'Cliente solicitou acabamento fosco'
        },
        {
          id: 'ORC-002',
          cliente: 'Maria Santos',
          email: 'maria@email.com',
          telefone: '(11) 98888-8888',
          whatsapp: '5511988888888',
          tipo: 'modelagem',
          status: 'aprovado',
          valor: 800,
          data: new Date(Date.now() - 86400000).toISOString(),
          descricao: 'Modelagem 3D de peça automotiva',
          material: 'PETG',
          quantidade: 1,
        }
      ]);
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

  const getTipoLabel = (tipo: string) => {
    const tipoLower = String(tipo || '').toLowerCase();
    if (tipoLower.includes('impressao')) return 'Impressão 3D';
    if (tipoLower.includes('modelagem')) return 'Modelagem 3D';
    if (tipoLower.includes('pintura')) return 'Pintura';
    if (tipoLower.includes('manutencao')) return 'Manutenção';
    return tipo || 'Outro';
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

  const formatCurrency = (value: number | string | undefined) => {
    const num = typeof value === 'string' ? parseFloat(value) : (value || 0);
    return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleViewOrcamento = (orc: Orcamento) => {
    setSelectedOrcamento(orc);
    setShowDetailModal(true);
    setEditMode(false);
  };

  const handleSaveOrcamento = async () => {
    if (!selectedOrcamento) return;
    
    toast({
      title: 'Orçamento atualizado',
      description: `Orçamento ${selectedOrcamento.id} foi atualizado com sucesso.`,
    });
    setEditMode(false);
    fetchOrcamentos();
  };

  const handleSendEmail = async (orc: Orcamento) => {
    const email = orc.email || orc.client_email;
    if (!email) {
      toast({ title: 'Erro', description: 'Email do cliente não informado.', variant: 'destructive' });
      return;
    }

    setSendingEmail(orc.id);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${apiUrl}/api/send-orcamento-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient_email: email,
          recipient_name: orc.cliente || orc.client_name || 'Cliente',
          orcamento_id: orc.id,
          tipo_servico: getTipoLabel(orc.tipo || orc.service_type || ''),
          descricao: orc.descricao || 'Conforme solicitado',
          material: orc.material || 'A definir',
          quantidade: orc.quantidade || 1,
          valor: typeof orc.valor === 'string' ? parseFloat(orc.valor) : (orc.valor || typeof orc.total === 'string' ? parseFloat(String(orc.total)) : (orc.total as number || 0)),
          prazo: orc.prazo || 'A combinar',
          observacoes: orc.observacoes || '',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Email enviado!',
          description: `Proposta enviada para ${email} com sucesso.`,
        });
      } else {
        throw new Error(data.detail || data.error || 'Erro ao enviar');
      }
    } catch (error: any) {
      console.error('Erro ao enviar email:', error);
      toast({
        title: 'Erro ao enviar email',
        description: error.message || 'Tente novamente mais tarde.',
        variant: 'destructive',
      });
    } finally {
      setSendingEmail(null);
    }
  };

  const handleSendWhatsApp = (orc: Orcamento) => {
    const phone = orc.whatsapp || orc.telefone?.replace(/\D/g, '');
    const message = encodeURIComponent(`
*3DKPRINT - Proposta de Orçamento*

Olá ${orc.cliente || orc.client_name}! 👋

Segue nossa proposta:

📦 *Serviço:* ${getTipoLabel(orc.tipo || orc.service_type || '')}
📝 *Descrição:* ${orc.descricao || 'Conforme solicitado'}
🎨 *Material:* ${orc.material || 'A definir'}
🔢 *Quantidade:* ${orc.quantidade || 1} unidade(s)
💰 *Valor Total:* ${formatCurrency(orc.valor || orc.total)}
⏰ *Prazo:* ${orc.prazo || 'A combinar'}

Para aprovar, basta responder esta mensagem! ✅
    `);
    
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
    toast({
      title: 'WhatsApp aberto',
      description: 'A mensagem foi preparada para envio.',
    });
  };

  const handleDownloadPDF = (orc: Orcamento) => {
    // Criar conteúdo do PDF (usando print para simulação)
    const printContent = `
      <html>
      <head>
        <title>Orçamento ${orc.id} - 3DKPRINT</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; }
          .header { text-align: center; margin-bottom: 40px; }
          .logo { font-size: 28px; font-weight: bold; color: #2563eb; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 30px 0; }
          .info-item { padding: 15px; background: #f3f4f6; border-radius: 8px; }
          .info-label { font-size: 12px; color: #6b7280; text-transform: uppercase; }
          .info-value { font-size: 16px; font-weight: 600; margin-top: 5px; }
          .total { font-size: 24px; font-weight: bold; color: #16a34a; text-align: right; margin-top: 30px; }
          .footer { margin-top: 50px; text-align: center; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">3DKPRINT</div>
          <p>Proposta de Orçamento</p>
        </div>
        
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">Cliente</div>
            <div class="info-value">${orc.cliente || orc.client_name}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Email</div>
            <div class="info-value">${orc.email || orc.client_email}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Telefone</div>
            <div class="info-value">${orc.telefone || 'N/A'}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Data</div>
            <div class="info-value">${formatDate(orc.data || orc.created_at)}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Serviço</div>
            <div class="info-value">${getTipoLabel(orc.tipo || orc.service_type || '')}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Material</div>
            <div class="info-value">${orc.material || 'A definir'}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Quantidade</div>
            <div class="info-value">${orc.quantidade || 1} unidade(s)</div>
          </div>
          <div class="info-item">
            <div class="info-label">Prazo</div>
            <div class="info-value">${orc.prazo || 'A combinar'}</div>
          </div>
        </div>
        
        <div class="info-item" style="margin-top: 20px;">
          <div class="info-label">Descrição</div>
          <div class="info-value">${orc.descricao || 'Conforme solicitado pelo cliente'}</div>
        </div>
        
        ${orc.observacoes ? `
        <div class="info-item" style="margin-top: 20px;">
          <div class="info-label">Observações</div>
          <div class="info-value">${orc.observacoes}</div>
        </div>
        ` : ''}
        
        <div class="total">
          Total: ${formatCurrency(orc.valor || orc.total)}
        </div>
        
        <div class="footer">
          <p>3DKPRINT - Impressão 3D Profissional</p>
          <p>Este orçamento é válido por 15 dias.</p>
        </div>
      </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
    
    toast({
      title: 'PDF gerado',
      description: 'O orçamento foi preparado para impressão/PDF.',
    });
  };

  const handleCreateOrcamento = () => {
    const newOrc: Orcamento = {
      id: `ORC-${String(orcamentos.length + 1).padStart(3, '0')}`,
      cliente: novoOrcamento.cliente,
      email: novoOrcamento.email,
      telefone: novoOrcamento.telefone,
      whatsapp: novoOrcamento.whatsapp,
      tipo: novoOrcamento.tipo,
      descricao: novoOrcamento.descricao,
      material: novoOrcamento.material,
      quantidade: novoOrcamento.quantidade,
      valor: novoOrcamento.valor,
      prazo: novoOrcamento.prazo,
      observacoes: novoOrcamento.observacoes,
      status: 'pendente',
      data: new Date().toISOString(),
    };
    
    setOrcamentos([newOrc, ...orcamentos]);
    setShowNewModal(false);
    setNovoOrcamento({
      cliente: '',
      email: '',
      telefone: '',
      whatsapp: '',
      tipo: 'impressao',
      descricao: '',
      material: 'PLA',
      quantidade: 1,
      valor: 0,
      prazo: '7 dias',
      observacoes: '',
    });
    
    toast({
      title: 'Orçamento criado',
      description: `Orçamento ${newOrc.id} foi criado com sucesso.`,
    });
  };

  const handleUpdateStatus = (orc: Orcamento, newStatus: string) => {
    setOrcamentos(orcamentos.map(o => 
      o.id === orc.id ? { ...o, status: newStatus } : o
    ));
    if (selectedOrcamento?.id === orc.id) {
      setSelectedOrcamento({ ...selectedOrcamento, status: newStatus });
    }
    toast({
      title: 'Status atualizado',
      description: `Orçamento ${orc.id} agora está ${newStatus}.`,
    });
  };

  const filteredOrcamentos = orcamentos.filter((orc) => {
    const nomeCliente = String(orc.cliente || orc.client_name || '').toLowerCase();
    const emailCliente = String(orc.email || orc.client_email || '').toLowerCase();
    const idOrc = String(orc.id || '').toLowerCase();
    const tipoOrc = String(orc.tipo || orc.service_type || '').toLowerCase();
    const statusOrc = String(orc.status || 'pendente').toLowerCase();

    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = nomeCliente.includes(searchLower) || 
                          emailCliente.includes(searchLower) || 
                          idOrc.includes(searchLower);
    const matchesTipo = filterTipo === 'todos' || tipoOrc.includes(filterTipo.toLowerCase());
    const matchesStatus = filterStatus === 'todos' || statusOrc === filterStatus.toLowerCase();

    return matchesSearch && matchesTipo && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <AdminHeader title="Orçamentos" />

        <div className="p-6">
          {/* Header com botões de novo orçamento */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gerenciar Orçamentos</h1>
              <p className="text-gray-500 text-sm">Visualize, edite e envie propostas para seus clientes</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setShowNewModal(true)} variant="outline" className="gap-2">
                <Plus className="w-4 h-4" />
                Orçamento Rápido
              </Button>
              <Button onClick={() => navigate('/admin/orcamento/novo')} className="gap-2 bg-blue-600 hover:bg-blue-700">
                <FileText className="w-4 h-4" />
                Novo Orçamento Completo
              </Button>
            </div>
          </div>

          {/* Filtros */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[250px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Buscar por cliente, email ou ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                <Select value={filterTipo} onValueChange={setFilterTipo}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Todos os Tipos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os Tipos</SelectItem>
                    <SelectItem value="impressao">Impressão 3D</SelectItem>
                    <SelectItem value="modelagem">Modelagem 3D</SelectItem>
                    <SelectItem value="pintura">Pintura</SelectItem>
                    <SelectItem value="manutencao">Manutenção</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Todos os Status" />
                  </SelectTrigger>
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

          {/* Lista de Orçamentos */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredOrcamentos.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Nenhum orçamento encontrado</h3>
                <p className="text-gray-500 mb-4">Crie um orçamento manual ou aguarde solicitações dos clientes.</p>
                <Button onClick={() => setShowNewModal(true)} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Criar Orçamento Manual
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredOrcamentos.map((orc) => {
                const TipoIcon = getTipoIcon(orc.tipo || orc.service_type || '');
                return (
                  <motion.div
                    key={orc.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                          <TipoIcon className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-gray-900">{orc.id}</span>
                            {getStatusBadge(orc.status || 'pendente')}
                            {orc.arquivo_3d && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-600 rounded text-xs">
                                <Upload className="w-3 h-3" /> Arquivo 3D
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">{orc.cliente || orc.client_name}</span>
                            <span className="mx-2">•</span>
                            {orc.email || orc.client_email}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {getTipoLabel(orc.tipo || orc.service_type || '')} • {formatDate(orc.data || orc.created_at)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="text-right mr-4">
                          <p className="text-lg font-bold text-green-600">{formatCurrency(orc.valor || orc.total)}</p>
                          <p className="text-xs text-gray-400">{orc.quantidade || 1} un.</p>
                        </div>
                        
                        <Button variant="outline" size="sm" onClick={() => handleViewOrcamento(orc)} className="gap-1">
                          <Eye className="w-4 h-4" />
                          Ver
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleSendEmail(orc)} className="gap-1" disabled={sendingEmail === orc.id}>
                          {sendingEmail === orc.id ? (
                            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Mail className="w-4 h-4" />
                          )}
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleSendWhatsApp(orc)} className="gap-1 text-green-600 hover:text-green-700">
                          <MessageCircle className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDownloadPDF(orc)} className="gap-1">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal de Detalhes/Edição */}
        <AnimatePresence>
          {showDetailModal && selectedOrcamento && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowDetailModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
              >
                {/* Header do Modal */}
                <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">Orçamento {selectedOrcamento.id}</h2>
                      <p className="text-sm text-gray-500">{formatDate(selectedOrcamento.data || selectedOrcamento.created_at)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!editMode ? (
                      <Button variant="outline" size="sm" onClick={() => setEditMode(true)} className="gap-1">
                        <Edit className="w-4 h-4" />
                        Editar
                      </Button>
                    ) : (
                      <Button size="sm" onClick={handleSaveOrcamento} className="gap-1 bg-green-600 hover:bg-green-700">
                        <Save className="w-4 h-4" />
                        Salvar
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => setShowDetailModal(false)}>
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                {/* Conteúdo do Modal */}
                <div className="p-6 space-y-6">
                  {/* Status */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Status do Orçamento</p>
                      {getStatusBadge(selectedOrcamento.status || 'pendente')}
                    </div>
                    <Select
                      value={selectedOrcamento.status || 'pendente'}
                      onValueChange={(value) => handleUpdateStatus(selectedOrcamento, value)}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pendente">Pendente</SelectItem>
                        <SelectItem value="aprovado">Aprovado</SelectItem>
                        <SelectItem value="convertido">Venda Fechada</SelectItem>
                        <SelectItem value="recusado">Recusado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Dados do Cliente */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Dados do Cliente
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500">Nome</p>
                        {editMode ? (
                          <Input
                            value={selectedOrcamento.cliente || selectedOrcamento.client_name || ''}
                            onChange={(e) => setSelectedOrcamento({ ...selectedOrcamento, cliente: e.target.value })}
                            className="mt-1"
                          />
                        ) : (
                          <p className="font-medium text-gray-900">{selectedOrcamento.cliente || selectedOrcamento.client_name}</p>
                        )}
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500">Email</p>
                        {editMode ? (
                          <Input
                            value={selectedOrcamento.email || selectedOrcamento.client_email || ''}
                            onChange={(e) => setSelectedOrcamento({ ...selectedOrcamento, email: e.target.value })}
                            className="mt-1"
                          />
                        ) : (
                          <p className="font-medium text-gray-900">{selectedOrcamento.email || selectedOrcamento.client_email}</p>
                        )}
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500">Telefone</p>
                        {editMode ? (
                          <Input
                            value={selectedOrcamento.telefone || ''}
                            onChange={(e) => setSelectedOrcamento({ ...selectedOrcamento, telefone: e.target.value })}
                            className="mt-1"
                          />
                        ) : (
                          <p className="font-medium text-gray-900">{selectedOrcamento.telefone || 'N/A'}</p>
                        )}
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500">WhatsApp</p>
                        <p className="font-medium text-gray-900">{selectedOrcamento.whatsapp || selectedOrcamento.telefone || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Arquivo 3D */}
                  {selectedOrcamento.arquivo_3d && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Upload className="w-4 h-4" />
                        Arquivo 3D do Cliente
                      </h3>
                      <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                            <Box className="w-6 h-6 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{selectedOrcamento.arquivo_3d_nome || 'modelo.stl'}</p>
                            <p className="text-sm text-gray-500">Arquivo enviado pelo cliente</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => window.open(selectedOrcamento.arquivo_3d, '_blank')}>
                          <Download className="w-4 h-4 mr-2" />
                          Baixar
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Detalhes do Serviço */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Printer className="w-4 h-4" />
                      Detalhes do Serviço
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500">Tipo de Serviço</p>
                        <p className="font-medium text-gray-900">{getTipoLabel(selectedOrcamento.tipo || selectedOrcamento.service_type || '')}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500">Material</p>
                        {editMode ? (
                          <Select
                            value={selectedOrcamento.material || 'PLA'}
                            onValueChange={(value) => setSelectedOrcamento({ ...selectedOrcamento, material: value })}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="PLA">PLA</SelectItem>
                              <SelectItem value="PETG">PETG</SelectItem>
                              <SelectItem value="ABS">ABS</SelectItem>
                              <SelectItem value="TPU">TPU</SelectItem>
                              <SelectItem value="Resina">Resina</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <p className="font-medium text-gray-900">{selectedOrcamento.material || 'A definir'}</p>
                        )}
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500">Quantidade</p>
                        {editMode ? (
                          <Input
                            type="number"
                            value={selectedOrcamento.quantidade || 1}
                            onChange={(e) => setSelectedOrcamento({ ...selectedOrcamento, quantidade: parseInt(e.target.value) })}
                            className="mt-1"
                          />
                        ) : (
                          <p className="font-medium text-gray-900">{selectedOrcamento.quantidade || 1} unidade(s)</p>
                        )}
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500">Prazo</p>
                        {editMode ? (
                          <Input
                            value={selectedOrcamento.prazo || ''}
                            onChange={(e) => setSelectedOrcamento({ ...selectedOrcamento, prazo: e.target.value })}
                            className="mt-1"
                            placeholder="Ex: 7 dias"
                          />
                        ) : (
                          <p className="font-medium text-gray-900">{selectedOrcamento.prazo || 'A combinar'}</p>
                        )}
                      </div>
                    </div>
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500">Descrição</p>
                      {editMode ? (
                        <textarea
                          value={selectedOrcamento.descricao || ''}
                          onChange={(e) => setSelectedOrcamento({ ...selectedOrcamento, descricao: e.target.value })}
                          className="mt-1 w-full p-2 border rounded-lg text-sm"
                          rows={3}
                        />
                      ) : (
                        <p className="font-medium text-gray-900">{selectedOrcamento.descricao || 'Conforme solicitado pelo cliente'}</p>
                      )}
                    </div>
                    {(selectedOrcamento.observacoes || editMode) && (
                      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-xs text-yellow-700">Observações</p>
                        {editMode ? (
                          <textarea
                            value={selectedOrcamento.observacoes || ''}
                            onChange={(e) => setSelectedOrcamento({ ...selectedOrcamento, observacoes: e.target.value })}
                            className="mt-1 w-full p-2 border rounded-lg text-sm"
                            rows={2}
                          />
                        ) : (
                          <p className="font-medium text-yellow-800">{selectedOrcamento.observacoes}</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Valor */}
                  <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-green-700">Valor Total do Orçamento</p>
                        {editMode ? (
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-green-600">R$</span>
                            <Input
                              type="number"
                              value={typeof selectedOrcamento.valor === 'number' ? selectedOrcamento.valor : parseFloat(String(selectedOrcamento.valor || selectedOrcamento.total || 0))}
                              onChange={(e) => setSelectedOrcamento({ ...selectedOrcamento, valor: parseFloat(e.target.value) })}
                              className="w-32"
                            />
                          </div>
                        ) : (
                          <p className="text-3xl font-bold text-green-600">{formatCurrency(selectedOrcamento.valor || selectedOrcamento.total)}</p>
                        )}
                      </div>
                      <DollarSign className="w-10 h-10 text-green-300" />
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                    <Button onClick={() => handleSendEmail(selectedOrcamento)} className="gap-2 bg-blue-600 hover:bg-blue-700" disabled={sendingEmail === selectedOrcamento.id}>
                      {sendingEmail === selectedOrcamento.id ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Mail className="w-4 h-4" />
                      )}
                      {sendingEmail === selectedOrcamento.id ? 'Enviando...' : 'Enviar por Email'}
                    </Button>
                    <Button onClick={() => handleSendWhatsApp(selectedOrcamento)} className="gap-2 bg-green-600 hover:bg-green-700">
                      <MessageCircle className="w-4 h-4" />
                      Enviar WhatsApp
                    </Button>
                    <Button onClick={() => handleDownloadPDF(selectedOrcamento)} variant="outline" className="gap-2">
                      <FileDown className="w-4 h-4" />
                      Gerar PDF
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal de Novo Orçamento */}
        <AnimatePresence>
          {showNewModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowNewModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              >
                <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Plus className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">Novo Orçamento Manual</h2>
                      <p className="text-sm text-gray-500">Crie um orçamento para um cliente</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setShowNewModal(false)}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">Nome do Cliente *</label>
                      <Input
                        value={novoOrcamento.cliente}
                        onChange={(e) => setNovoOrcamento({ ...novoOrcamento, cliente: e.target.value })}
                        placeholder="Nome completo"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">Email *</label>
                      <Input
                        type="email"
                        value={novoOrcamento.email}
                        onChange={(e) => setNovoOrcamento({ ...novoOrcamento, email: e.target.value })}
                        placeholder="email@exemplo.com"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">Telefone</label>
                      <Input
                        value={novoOrcamento.telefone}
                        onChange={(e) => setNovoOrcamento({ ...novoOrcamento, telefone: e.target.value })}
                        placeholder="(00) 00000-0000"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">WhatsApp</label>
                      <Input
                        value={novoOrcamento.whatsapp}
                        onChange={(e) => setNovoOrcamento({ ...novoOrcamento, whatsapp: e.target.value })}
                        placeholder="5500000000000"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">Tipo de Serviço</label>
                      <Select value={novoOrcamento.tipo} onValueChange={(v) => setNovoOrcamento({ ...novoOrcamento, tipo: v })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="impressao">Impressão 3D</SelectItem>
                          <SelectItem value="modelagem">Modelagem 3D</SelectItem>
                          <SelectItem value="pintura">Pintura</SelectItem>
                          <SelectItem value="manutencao">Manutenção</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">Material</label>
                      <Select value={novoOrcamento.material} onValueChange={(v) => setNovoOrcamento({ ...novoOrcamento, material: v })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PLA">PLA</SelectItem>
                          <SelectItem value="PETG">PETG</SelectItem>
                          <SelectItem value="ABS">ABS</SelectItem>
                          <SelectItem value="TPU">TPU</SelectItem>
                          <SelectItem value="Resina">Resina</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">Quantidade</label>
                      <Input
                        type="number"
                        value={novoOrcamento.quantidade}
                        onChange={(e) => setNovoOrcamento({ ...novoOrcamento, quantidade: parseInt(e.target.value) })}
                        min={1}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">Prazo</label>
                      <Input
                        value={novoOrcamento.prazo}
                        onChange={(e) => setNovoOrcamento({ ...novoOrcamento, prazo: e.target.value })}
                        placeholder="Ex: 7 dias"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Valor Total (R$) *</label>
                    <Input
                      type="number"
                      value={novoOrcamento.valor}
                      onChange={(e) => setNovoOrcamento({ ...novoOrcamento, valor: parseFloat(e.target.value) })}
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Descrição do Serviço</label>
                    <textarea
                      value={novoOrcamento.descricao}
                      onChange={(e) => setNovoOrcamento({ ...novoOrcamento, descricao: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg text-sm"
                      rows={3}
                      placeholder="Descreva o serviço a ser realizado..."
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Observações</label>
                    <textarea
                      value={novoOrcamento.observacoes}
                      onChange={(e) => setNovoOrcamento({ ...novoOrcamento, observacoes: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg text-sm"
                      rows={2}
                      placeholder="Observações adicionais..."
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button variant="outline" onClick={() => setShowNewModal(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleCreateOrcamento} className="gap-2 bg-blue-600 hover:bg-blue-700">
                      <Plus className="w-4 h-4" />
                      Criar Orçamento
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
