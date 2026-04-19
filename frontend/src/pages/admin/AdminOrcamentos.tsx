import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock, CheckCircle, AlertCircle, Search, Eye, Plus, FileText,
  ShoppingCart, Mail, MessageCircle, Download, X, Image as ImageIcon,
  Package, Loader2, Copy,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { orcamentosAPI } from '@/lib/apiClient';
import { useToast } from '@/hooks/use-toast';
import Sidebar from '@/components/admin/Sidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import type { OrcamentoV2, OrcamentoItem } from '@/types/orcamento';
import { baixarOrcamentoPdf, formatarMensagemWhatsApp, enviarOrcamentoPorEmail, visualizarOrcamentoPdf } from '@/lib/orcamentoPdf';

function fmtCurrency(v: number | string | undefined | null): string {
  const n = typeof v === 'string' ? parseFloat(v) : (v || 0);
  return (isNaN(n as number) ? 0 : (n as number)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
function fmtDate(iso: string | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

/**
 * Normaliza um registro (seja v2 ou legacy single-product) para a shape OrcamentoV2.
 * Permite que a UI trate tudo do mesmo jeito.
 */
function normalizar(raw: any): OrcamentoV2 {
  if (Array.isArray(raw?.itens) && raw.itens.length > 0) {
    return {
      id: raw.id,
      numero: raw.numero,
      cliente_tipo: raw.cliente_tipo || 'PF',
      cliente_nome: raw.cliente_nome || raw.cliente || raw.client_name || '',
      cliente_email: raw.cliente_email || raw.email || raw.client_email || '',
      cliente_whatsapp: raw.cliente_whatsapp || raw.whatsapp || raw.telefone || '',
      cliente_telefone: raw.cliente_telefone || raw.telefone,
      cliente_cpf_cnpj: raw.cliente_cpf_cnpj,
      endereco: raw.endereco || {},
      envio: raw.envio || {},
      itens: raw.itens,
      subtotal: raw.subtotal ?? raw.itens.reduce((a: number, it: any) => a + (it.valor_total || 0), 0),
      desconto_percentual: raw.desconto_percentual || 0,
      desconto_valor: raw.desconto_valor || 0,
      valor_total: raw.valor_total || raw.total || 0,
      status: raw.status || 'pendente',
      prazo_producao_dias: raw.prazo_producao_dias,
      observacoes_internas: raw.observacoes_internas || raw.observacoes,
      observacoes_cliente: raw.observacoes_cliente,
      validade_dias: raw.validade_dias || 15,
      created_at: raw.created_at || raw.data,
      updated_at: raw.updated_at,
      origem: raw.origem,
    };
  }

  const unicoItem: OrcamentoItem = {
    id: raw.id || crypto.randomUUID(),
    ordem: 0,
    origem: 'manual',
    nome: raw.servico || raw.tipo || raw.service_type || raw.descricao || 'Item',
    descricao: raw.descricao || '',
    imagem_principal: raw.imagem_produto || raw.imagem,
    material: raw.material,
    cor: raw.cor,
    quantidade: raw.quantidade || 1,
    valor_unitario: typeof raw.valor === 'string' ? parseFloat(raw.valor) : (raw.valor || raw.total || 0),
    valor_total: typeof raw.valor === 'string' ? parseFloat(raw.valor) : (raw.valor || raw.total || 0),
    largura_mm: raw.largura,
    altura_mm: raw.altura,
    profundidade_mm: raw.profundidade,
    peso_g: raw.peso_estimado,
    acabamento: raw.acabamento,
  };

  return {
    id: raw.id,
    cliente_tipo: 'PF',
    cliente_nome: raw.cliente || raw.client_name || raw.nome || '',
    cliente_email: raw.email || raw.client_email || '',
    cliente_whatsapp: raw.whatsapp || raw.telefone || '',
    cliente_telefone: raw.telefone,
    endereco: {
      cidade: raw.cidade,
      estado: raw.estado,
    },
    envio: {
      valor_frete: raw.valor_frete,
      prazo_dias: raw.prazo ? parseInt(String(raw.prazo)) : raw.prazo_estimado ? parseInt(String(raw.prazo_estimado)) : undefined,
    },
    itens: [unicoItem],
    subtotal: unicoItem.valor_total,
    desconto_percentual: raw.desconto || 0,
    desconto_valor: 0,
    valor_total: typeof raw.valor === 'string' ? parseFloat(raw.valor) : (raw.valor || raw.total || 0),
    status: raw.status || 'pendente',
    observacoes_internas: raw.observacoes,
    validade_dias: 15,
    created_at: raw.created_at || raw.data,
    origem: raw.origem,
  };
}

function getStatusBadge(status: string) {
  const s = status.toLowerCase();
  if (s === 'aprovado') return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100"><CheckCircle className="w-3 h-3 mr-1" />Aprovado</Badge>;
  if (s === 'convertido') return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100"><ShoppingCart className="w-3 h-3 mr-1" />Venda Fechada</Badge>;
  if (s === 'em_producao') return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100"><Package className="w-3 h-3 mr-1" />Em Produção</Badge>;
  if (s === 'recusado' || s === 'cancelado') return <Badge className="bg-red-100 text-red-700 hover:bg-red-100"><AlertCircle className="w-3 h-3 mr-1" />Recusado</Badge>;
  return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100"><Clock className="w-3 h-3 mr-1" />Pendente</Badge>;
}

export default function AdminOrcamentos() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const [brutos, setBrutos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [selecionado, setSelecionado] = useState<OrcamentoV2 | null>(null);
  const [acao, setAcao] = useState<{ id: string | undefined; tipo: 'pdf' | 'email' | 'view' | null }>({ id: undefined, tipo: null });

  useEffect(() => {
    carregar();
  }, []);

  // Auto-abre modal se URL tem ?id=XXX (vem do dashboard ou link direto)
  useEffect(() => {
    const idParam = searchParams.get('id');
    if (!idParam || loading) return;
    const encontrado = brutos.map(normalizar).find((o) => o.id === idParam || o.numero === idParam);
    if (encontrado) {
      setSelecionado(encontrado);
    }
  }, [searchParams, brutos, loading]);

  const fecharModal = () => {
    setSelecionado(null);
    if (searchParams.get('id')) {
      const next = new URLSearchParams(searchParams);
      next.delete('id');
      setSearchParams(next, { replace: true });
    }
  };

  const carregar = async () => {
    try {
      setLoading(true);
      const dados = await orcamentosAPI.getAll();
      setBrutos(Array.isArray(dados) ? dados : []);
    } catch (err) {
      console.error(err);
      setBrutos([]);
    } finally {
      setLoading(false);
    }
  };

  const orcamentos = useMemo(() => brutos.map(normalizar), [brutos]);

  const filtrados = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return orcamentos.filter(o => {
      const matchStatus = filterStatus === 'todos' || (o.status || '').toLowerCase() === filterStatus;
      if (!q) return matchStatus;
      const blob = [
        o.cliente_nome, o.cliente_email, o.cliente_whatsapp, o.id, o.numero,
        ...o.itens.map(i => i.nome),
      ].filter(Boolean).join(' ').toLowerCase();
      return matchStatus && blob.includes(q);
    });
  }, [orcamentos, searchTerm, filterStatus]);

  const handleStatus = async (orc: OrcamentoV2, status: string) => {
    try {
      await orcamentosAPI.updateStatus(orc.id!, status);
      toast({ title: 'Status atualizado' });
      carregar();
    } catch (err: any) {
      toast({ title: 'Erro ao atualizar status', description: err.message, variant: 'destructive' });
    }
  };

  const handleBaixarPDF = async (orc: OrcamentoV2) => {
    setAcao({ id: orc.id, tipo: 'pdf' });
    try {
      await baixarOrcamentoPdf(orc);
    } catch (err: any) {
      toast({ title: 'Erro ao gerar PDF', description: err.message, variant: 'destructive' });
    } finally {
      setAcao({ id: undefined, tipo: null });
    }
  };

  const handleVisualizarPDF = async (orc: OrcamentoV2) => {
    setAcao({ id: orc.id, tipo: 'view' });
    try {
      await visualizarOrcamentoPdf(orc);
    } catch (err: any) {
      toast({ title: 'Erro ao abrir PDF', description: err.message, variant: 'destructive' });
    } finally {
      setAcao({ id: undefined, tipo: null });
    }
  };

  const handleWhatsApp = (orc: OrcamentoV2) => {
    const phone = (orc.cliente_whatsapp || '').replace(/\D/g, '');
    if (!phone) {
      toast({ title: 'WhatsApp não informado', variant: 'destructive' });
      return;
    }
    const tel = phone.length === 11 || phone.length === 10 ? `55${phone}` : phone;
    const msg = encodeURIComponent(formatarMensagemWhatsApp(orc));
    window.open(`https://wa.me/${tel}?text=${msg}`, '_blank');
  };

  const handleCopiarMensagem = async (orc: OrcamentoV2) => {
    try {
      await navigator.clipboard.writeText(formatarMensagemWhatsApp(orc));
      toast({ title: 'Mensagem copiada' });
    } catch {
      toast({ title: 'Falha ao copiar', variant: 'destructive' });
    }
  };

  const handleEnviarEmail = async (orc: OrcamentoV2) => {
    if (!orc.cliente_email) {
      toast({ title: 'E-mail não informado', variant: 'destructive' });
      return;
    }
    setAcao({ id: orc.id, tipo: 'email' });
    try {
      await enviarOrcamentoPorEmail(orc);
      toast({
        title: 'PDF baixado, cliente de e-mail aberto',
        description: 'Só anexar o PDF (está na pasta Downloads) e enviar.',
      });
    } catch (err: any) {
      toast({
        title: 'Erro ao preparar e-mail',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setAcao({ id: undefined, tipo: null });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <AdminHeader title="Orçamentos" />
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Orçamentos</h1>
              <p className="text-gray-500 text-sm">{orcamentos.length} orçamento(s) no total</p>
            </div>
            <Button onClick={() => navigate('/admin/orcamento/novo')} className="bg-blue-600 hover:bg-blue-700 gap-2">
              <Plus className="w-4 h-4" /> Novo Orçamento
            </Button>
          </div>

          {/* Filtros */}
          <Card className="mb-4">
            <CardContent className="p-3">
              <div className="flex flex-wrap gap-3 items-center">
                <div className="flex-1 min-w-[240px] relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Buscar por cliente, e-mail, ID ou item..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os status</SelectItem>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="aprovado">Aprovado</SelectItem>
                    <SelectItem value="em_producao">Em Produção</SelectItem>
                    <SelectItem value="convertido">Venda Fechada</SelectItem>
                    <SelectItem value="recusado">Recusado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Lista */}
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          ) : filtrados.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Nenhum orçamento encontrado</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm ? 'Tente outra busca, ou ' : ''}crie um orçamento manual.
                </p>
                <Button onClick={() => navigate('/admin/orcamento/novo')} className="gap-2">
                  <Plus className="w-4 h-4" /> Criar primeiro orçamento
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filtrados.map((orc) => {
                const miniatura = orc.itens[0]?.imagem_principal;
                const isLoading = acao.id === orc.id;
                return (
                  <motion.div
                    key={orc.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow overflow-hidden"
                  >
                    <div className="flex items-stretch">
                      {/* Miniatura */}
                      <div className="w-24 h-24 bg-gray-100 flex-shrink-0 flex items-center justify-center border-r">
                        {miniatura ? (
                          <img
                            src={miniatura}
                            alt={orc.itens[0].nome}
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                        ) : (
                          <ImageIcon className="w-8 h-8 text-gray-300" />
                        )}
                      </div>

                      {/* Conteúdo */}
                      <div className="flex-1 p-4 flex flex-col md:flex-row md:items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="font-bold text-gray-900 text-sm">
                              {orc.numero || (orc.id ? `#${orc.id.slice(0, 8)}` : '—')}
                            </span>
                            {getStatusBadge(orc.status)}
                            {orc.itens.length > 1 && (
                              <Badge variant="secondary" className="bg-purple-100 text-purple-700 hover:bg-purple-100">
                                <Package className="w-3 h-3 mr-1" /> {orc.itens.length} itens
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm font-medium text-gray-900 truncate">{orc.cliente_nome || '— sem nome —'}</p>
                          <p className="text-xs text-gray-500 truncate">
                            {orc.itens.map(i => i.nome).filter(Boolean).join(' • ') || 'sem itens'}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">{fmtDate(orc.created_at)}</p>
                        </div>

                        <div className="text-right flex-shrink-0">
                          <p className="text-lg font-bold text-emerald-600">{fmtCurrency(orc.valor_total)}</p>
                        </div>

                        <div className="flex items-center gap-1 flex-shrink-0 flex-wrap">
                          <Button variant="outline" size="sm" onClick={() => setSelecionado(orc)} title="Ver detalhes">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleVisualizarPDF(orc)} disabled={isLoading && acao.tipo === 'view'} title="Visualizar PDF" className="text-indigo-600">
                            {isLoading && acao.tipo === 'view' ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleBaixarPDF(orc)} disabled={isLoading && acao.tipo === 'pdf'} title="Baixar PDF">
                            {isLoading && acao.tipo === 'pdf' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleWhatsApp(orc)} className="text-green-600" title="Enviar WhatsApp">
                            <MessageCircle className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleEnviarEmail(orc)} disabled={isLoading && acao.tipo === 'email'} title="Enviar e-mail">
                            {isLoading && acao.tipo === 'email' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal de detalhes */}
        <AnimatePresence>
          {selecionado && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => fecharModal()}
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
              >
                <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between z-10">
                  <div>
                    <h2 className="text-lg font-bold">{selecionado.numero || (selecionado.id ? `#${selecionado.id.slice(0, 8)}` : 'Orçamento')}</h2>
                    <p className="text-xs text-gray-500">{fmtDate(selecionado.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select value={selecionado.status} onValueChange={(v) => handleStatus(selecionado, v)}>
                      <SelectTrigger className="w-[160px] h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pendente">Pendente</SelectItem>
                        <SelectItem value="aprovado">Aprovado</SelectItem>
                        <SelectItem value="em_producao">Em Produção</SelectItem>
                        <SelectItem value="convertido">Venda Fechada</SelectItem>
                        <SelectItem value="recusado">Recusado</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="ghost" size="icon" onClick={() => fecharModal()}>
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Cliente */}
                  <section>
                    <h3 className="font-semibold text-sm text-gray-700 uppercase mb-2">Cliente</h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div><span className="text-gray-500">Nome:</span> <span className="font-medium">{selecionado.cliente_nome}</span></div>
                      <div><span className="text-gray-500">{selecionado.cliente_tipo === 'PJ' ? 'CNPJ' : 'CPF'}:</span> <span className="font-medium">{selecionado.cliente_cpf_cnpj || '—'}</span></div>
                      <div><span className="text-gray-500">E-mail:</span> <span className="font-medium break-all">{selecionado.cliente_email || '—'}</span></div>
                      <div><span className="text-gray-500">WhatsApp:</span> <span className="font-medium">{selecionado.cliente_whatsapp || '—'}</span></div>
                    </div>
                  </section>

                  {/* Endereço */}
                  {(selecionado.endereco.cep || selecionado.endereco.cidade) && (
                    <section>
                      <h3 className="font-semibold text-sm text-gray-700 uppercase mb-2">Endereço</h3>
                      <p className="text-sm">
                        {[
                          selecionado.endereco.logradouro,
                          selecionado.endereco.numero,
                          selecionado.endereco.complemento,
                          selecionado.endereco.bairro,
                          selecionado.endereco.cidade,
                          selecionado.endereco.estado,
                          selecionado.endereco.cep,
                        ].filter(Boolean).join(', ')}
                      </p>
                      {selecionado.endereco.ponto_referencia && (
                        <p className="text-xs text-gray-500 mt-1">Ref: {selecionado.endereco.ponto_referencia}</p>
                      )}
                    </section>
                  )}

                  {/* Itens */}
                  <section>
                    <h3 className="font-semibold text-sm text-gray-700 uppercase mb-3">Itens ({selecionado.itens.length})</h3>
                    <div className="space-y-3">
                      {selecionado.itens.map((it, i) => (
                        <div key={it.id} className="flex gap-3 p-3 bg-gray-50 rounded-lg border">
                          <div className="w-20 h-20 bg-white rounded border flex-shrink-0 flex items-center justify-center overflow-hidden">
                            {it.imagem_principal ? (
                              <img src={it.imagem_principal} alt={it.nome} className="w-full h-full object-cover" />
                            ) : (
                              <ImageIcon className="w-6 h-6 text-gray-300" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 text-sm">{i + 1}. {it.nome}</p>
                            {it.descricao && <p className="text-xs text-gray-600 mt-1 line-clamp-2">{it.descricao}</p>}
                            <div className="flex flex-wrap gap-2 mt-1 text-xs text-gray-500">
                              {it.material && <span>🎨 {it.material}</span>}
                              {it.cor && <span>• {it.cor}</span>}
                              {it.quantidade > 1 && <span>• Qtd: {it.quantidade}</span>}
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-xs text-gray-500">{it.quantidade}× {fmtCurrency(it.valor_unitario)}</p>
                            <p className="font-bold text-emerald-600">{fmtCurrency(it.valor_total)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Envio + Totais */}
                  <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="text-xs font-semibold text-gray-600 uppercase mb-2">Envio</h4>
                      <p className="text-sm"><span className="text-gray-500">Modalidade:</span> {selecionado.envio.modalidade || '—'}</p>
                      <p className="text-sm"><span className="text-gray-500">Frete:</span> {fmtCurrency(selecionado.envio.valor_frete || 0)}</p>
                      <p className="text-sm"><span className="text-gray-500">Prazo:</span> {selecionado.envio.prazo_dias ? `${selecionado.envio.prazo_dias} dias` : '—'}</p>
                      {selecionado.envio.codigo_rastreio && (
                        <p className="text-sm"><span className="text-gray-500">Rastreio:</span> {selecionado.envio.codigo_rastreio}</p>
                      )}
                    </div>
                    <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                      <h4 className="text-xs font-semibold text-emerald-700 uppercase mb-2">Totais</h4>
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between"><span>Subtotal</span><span>{fmtCurrency(selecionado.subtotal)}</span></div>
                        {(selecionado.envio.valor_frete || 0) > 0 && (
                          <div className="flex justify-between"><span>Frete</span><span>{fmtCurrency(selecionado.envio.valor_frete)}</span></div>
                        )}
                        {selecionado.desconto_percentual > 0 && (
                          <div className="flex justify-between text-red-600"><span>Desconto ({selecionado.desconto_percentual}%)</span><span>− {fmtCurrency(selecionado.desconto_valor)}</span></div>
                        )}
                        <div className="flex justify-between pt-2 border-t border-emerald-200 font-bold text-emerald-700 text-lg">
                          <span>TOTAL</span><span>{fmtCurrency(selecionado.valor_total)}</span>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Observações */}
                  {selecionado.observacoes_cliente && (
                    <section className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <h4 className="text-xs font-semibold text-yellow-800 uppercase mb-1">Observações (cliente)</h4>
                      <p className="text-sm text-yellow-900">{selecionado.observacoes_cliente}</p>
                    </section>
                  )}

                  {/* Ações */}
                  <section className="flex flex-wrap gap-2 pt-4 border-t">
                    <Button onClick={() => handleVisualizarPDF(selecionado)} disabled={acao.id === selecionado.id && acao.tipo === 'view'} className="bg-indigo-600 hover:bg-indigo-700 gap-2">
                      {acao.id === selecionado.id && acao.tipo === 'view' ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                      Visualizar PDF
                    </Button>
                    <Button onClick={() => handleBaixarPDF(selecionado)} disabled={acao.id === selecionado.id && acao.tipo === 'pdf'} className="bg-blue-600 hover:bg-blue-700 gap-2">
                      {acao.id === selecionado.id && acao.tipo === 'pdf' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                      Baixar PDF
                    </Button>
                    <Button onClick={() => handleWhatsApp(selecionado)} className="bg-green-600 hover:bg-green-700 gap-2">
                      <MessageCircle className="w-4 h-4" /> WhatsApp
                    </Button>
                    <Button onClick={() => handleEnviarEmail(selecionado)} variant="outline" className="gap-2">
                      <Mail className="w-4 h-4" /> E-mail
                    </Button>
                    <Button onClick={() => handleCopiarMensagem(selecionado)} variant="outline" className="gap-2">
                      <Copy className="w-4 h-4" /> Copiar mensagem
                    </Button>
                  </section>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
