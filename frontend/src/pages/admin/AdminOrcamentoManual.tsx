import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, User, Package, Truck, DollarSign, Plus, Save, Loader2,
  CheckCircle, MessageCircle, Mail, FileDown, Copy, UserCheck, X,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import Sidebar from '@/components/admin/Sidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { orcamentosAPI, clientesAPI } from '@/lib/apiClient';
import { useToast } from '@/hooks/use-toast';
import OrcamentoItemCard from '@/components/admin/orcamento/OrcamentoItemCard';
import EnderecoCorreios from '@/components/admin/orcamento/EnderecoCorreios';
import ClienteSearchSelect from '@/components/admin/orcamento/ClienteSearchSelect';
import {
  novoOrcamentoVazio, novoItemVazio, calcularSubtotal,
  type OrcamentoV2, type OrcamentoItem,
} from '@/types/orcamento';
import type { Cliente } from '@/types/cliente';
import { baixarOrcamentoPdf, formatarMensagemWhatsApp, enviarOrcamentoPorEmail } from '@/lib/orcamentoPdf';

function maskCPF(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 11);
  return d
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}
function maskCNPJ(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 14);
  return d
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');
}
function maskPhone(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

const STEPS = [
  { n: 1, label: 'Cliente', icon: User },
  { n: 2, label: 'Itens', icon: Package },
  { n: 3, label: 'Envio', icon: Truck },
  { n: 4, label: 'Total', icon: DollarSign },
];

export default function AdminOrcamentoManual() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [orcamento, setOrcamento] = useState<OrcamentoV2>(novoOrcamentoVazio());
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<OrcamentoV2 | null>(null);
  const [enviandoEmail, setEnviandoEmail] = useState(false);
  const [baixandoPdf, setBaixandoPdf] = useState(false);

  const subtotal = useMemo(() => calcularSubtotal(orcamento.itens), [orcamento.itens]);
  const frete = orcamento.envio.valor_frete || 0;
  const base = subtotal + frete;
  const descontoValor = base * ((orcamento.desconto_percentual || 0) / 100);
  const total = base - descontoValor;

  const update = <K extends keyof OrcamentoV2>(key: K, value: OrcamentoV2[K]) => {
    setOrcamento(prev => ({ ...prev, [key]: value }));
  };

  const updateItem = (idx: number, item: OrcamentoItem) => {
    setOrcamento(prev => ({
      ...prev,
      itens: prev.itens.map((it, i) => (i === idx ? item : it)),
    }));
  };
  const addItem = () => {
    setOrcamento(prev => ({
      ...prev,
      itens: [...prev.itens, novoItemVazio(prev.itens.length)],
    }));
  };
  const removeItem = (idx: number) => {
    setOrcamento(prev => ({
      ...prev,
      itens: prev.itens.filter((_, i) => i !== idx).map((it, i) => ({ ...it, ordem: i })),
    }));
  };
  const moveItem = (idx: number, dir: -1 | 1) => {
    setOrcamento(prev => {
      const next = [...prev.itens];
      const j = idx + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[idx], next[j]] = [next[j], next[idx]];
      return { ...prev, itens: next.map((it, i) => ({ ...it, ordem: i })) };
    });
  };

  const aplicarCliente = (c: Cliente) => {
    setOrcamento(prev => ({
      ...prev,
      cliente_id: c.id,
      cliente_tipo: c.tipo,
      cliente_nome: c.nome,
      cliente_email: c.email || '',
      cliente_whatsapp: c.whatsapp || '',
      cliente_telefone: c.telefone,
      cliente_cpf_cnpj: c.cpf_cnpj,
      endereco: c.endereco && Object.keys(c.endereco).length > 0 ? c.endereco : prev.endereco,
    }));
    toast({ title: 'Cliente aplicado', description: c.nome });
  };

  const desvincularCliente = () => {
    setOrcamento(prev => ({ ...prev, cliente_id: undefined }));
    toast({ title: 'Cliente desvinculado', description: 'Dados mantidos no orçamento.' });
  };

  const salvarComoCliente = async () => {
    if (!orcamento.cliente_nome.trim()) {
      toast({ title: 'Preencha o nome antes de cadastrar', variant: 'destructive' });
      return;
    }
    try {
      const novo = await clientesAPI.create({
        tipo: orcamento.cliente_tipo,
        nome: orcamento.cliente_nome,
        cpf_cnpj: orcamento.cliente_cpf_cnpj,
        email: orcamento.cliente_email,
        whatsapp: orcamento.cliente_whatsapp,
        telefone: orcamento.cliente_telefone,
        endereco: orcamento.endereco,
        origem: 'manual',
        ativo: true,
      });
      setOrcamento(prev => ({ ...prev, cliente_id: novo.id }));
      toast({ title: 'Cliente cadastrado', description: `Vinculado ao orçamento automaticamente.` });
    } catch (err: any) {
      toast({ title: 'Erro ao cadastrar cliente', description: err.message, variant: 'destructive' });
    }
  };

  const validar = (): string | null => {
    if (!orcamento.cliente_nome.trim()) return 'Informe o nome do cliente.';
    if (!orcamento.itens.length) return 'Adicione pelo menos um item.';
    for (const it of orcamento.itens) {
      if (!it.nome.trim()) return `Preencha o nome do item #${it.ordem + 1}.`;
      if (it.quantidade < 1) return `Quantidade inválida no item #${it.ordem + 1}.`;
      if (it.valor_unitario < 0) return `Valor inválido no item #${it.ordem + 1}.`;
    }
    return null;
  };

  const montarPayloadPersistido = (): OrcamentoV2 => ({
    ...orcamento,
    subtotal,
    desconto_valor: descontoValor,
    valor_total: total,
    origem: 'manual',
    created_at: orcamento.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  const handleSalvar = async () => {
    const erro = validar();
    if (erro) {
      toast({ title: 'Verificar campos', description: erro, variant: 'destructive' });
      return;
    }
    setSaving(true);
    const payload = montarPayloadPersistido();
    try {
      const salvo = await orcamentosAPI.create(payload as any);
      const comId = { ...payload, id: (salvo as any)?.id || (salvo as any)?.[0]?.id || payload.id };
      setSaved(comId);
      toast({ title: 'Orçamento salvo!', description: `Total: ${total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}` });
    } catch (err: any) {
      console.error(err);
      const fallback = { ...payload, id: `local-${Date.now()}` };
      const locais = JSON.parse(localStorage.getItem('orcamentos_offline') || '[]');
      locais.push(fallback);
      localStorage.setItem('orcamentos_offline', JSON.stringify(locais));
      setSaved(fallback);
      toast({
        title: 'Salvo localmente',
        description: 'Não consegui salvar no Supabase. Guardei no navegador como rascunho.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleBaixarPDF = async () => {
    const alvo = saved || montarPayloadPersistido();
    setBaixandoPdf(true);
    try {
      await baixarOrcamentoPdf(alvo);
      toast({ title: 'PDF baixado', description: 'Arquivo salvo na sua pasta de downloads.' });
    } catch (err: any) {
      toast({ title: 'Erro ao gerar PDF', description: err.message, variant: 'destructive' });
    } finally {
      setBaixandoPdf(false);
    }
  };

  const handleEnviarWhatsApp = () => {
    const alvo = saved || montarPayloadPersistido();
    const phone = (alvo.cliente_whatsapp || '').replace(/\D/g, '');
    if (!phone) {
      toast({ title: 'WhatsApp não informado', variant: 'destructive' });
      return;
    }
    const telCompleto = phone.length === 11 || phone.length === 10 ? `55${phone}` : phone;
    const msg = encodeURIComponent(formatarMensagemWhatsApp(alvo));
    window.open(`https://wa.me/${telCompleto}?text=${msg}`, '_blank');
  };

  const handleEnviarEmail = async () => {
    const alvo = saved || montarPayloadPersistido();
    if (!alvo.cliente_email) {
      toast({ title: 'E-mail do cliente não informado', variant: 'destructive' });
      return;
    }
    setEnviandoEmail(true);
    try {
      await enviarOrcamentoPorEmail(alvo);
      toast({
        title: 'PDF baixado, cliente de e-mail aberto',
        description: 'Só anexar o PDF (está na pasta Downloads) e clicar Enviar.',
      });
    } catch (err: any) {
      toast({
        title: 'Erro ao preparar e-mail',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setEnviandoEmail(false);
    }
  };

  const handleCopiarMensagem = async () => {
    const alvo = saved || montarPayloadPersistido();
    const msg = formatarMensagemWhatsApp(alvo);
    try {
      await navigator.clipboard.writeText(msg);
      toast({ title: 'Mensagem copiada', description: 'Cole no WhatsApp, e-mail ou onde preferir.' });
    } catch {
      toast({ title: 'Não consegui copiar', variant: 'destructive' });
    }
  };

  if (saved) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <AdminHeader title="Orçamento Criado" />
          <div className="p-4 lg:p-8 max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-lg p-8"
            >
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-10 h-10 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">Orçamento pronto!</h2>
                <p className="text-gray-500">Escolha como enviar — ou baixe o PDF e mande manualmente.</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-5 mb-6">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-gray-500">Cliente:</span> <span className="font-medium">{saved.cliente_nome}</span></div>
                  <div><span className="text-gray-500">Itens:</span> <span className="font-medium">{saved.itens.length}</span></div>
                  <div><span className="text-gray-500">Frete:</span> <span className="font-medium">{frete > 0 ? frete.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '—'}</span></div>
                  <div><span className="text-gray-500">Prazo:</span> <span className="font-medium">{saved.envio.prazo_dias ? `${saved.envio.prazo_dias} dias` : '—'}</span></div>
                  <div className="col-span-2 pt-3 mt-2 border-t">
                    <span className="text-gray-500">Valor Total:</span>{' '}
                    <span className="text-2xl font-bold text-emerald-600">
                      {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                <Button
                  onClick={handleBaixarPDF}
                  disabled={baixandoPdf}
                  className="bg-blue-600 hover:bg-blue-700 h-12"
                >
                  {baixandoPdf ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileDown className="w-4 h-4 mr-2" />}
                  Baixar PDF
                </Button>
                <Button
                  onClick={handleEnviarWhatsApp}
                  disabled={!saved.cliente_whatsapp}
                  className="bg-green-600 hover:bg-green-700 h-12"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Enviar WhatsApp
                </Button>
                <Button
                  onClick={handleEnviarEmail}
                  disabled={!saved.cliente_email || enviandoEmail}
                  variant="outline"
                  className="h-12"
                >
                  {enviandoEmail ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Mail className="w-4 h-4 mr-2" />}
                  Enviar E-mail
                </Button>
                <Button onClick={handleCopiarMensagem} variant="outline" className="h-12">
                  <Copy className="w-4 h-4 mr-2" />
                  Copiar mensagem
                </Button>
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <Button
                  variant="ghost"
                  onClick={() => { setSaved(null); setOrcamento(novoOrcamentoVazio()); setStep(1); }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Criar outro orçamento
                </Button>
                <Button variant="outline" onClick={() => navigate('/admin/orcamentos')}>
                  Ver lista de orçamentos
                </Button>
              </div>
            </motion.div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <AdminHeader title="Novo Orçamento" />
        <div className="p-4 lg:p-8 max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Button variant="outline" size="sm" onClick={() => navigate('/admin/orcamentos')}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Criar Orçamento</h1>
              <p className="text-sm text-gray-500">Multi-produto com fotos, dados do cliente e correios</p>
            </div>
          </div>

          {/* Steps */}
          <div className="flex items-center justify-center mb-8 flex-wrap gap-y-2">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              return (
                <React.Fragment key={s.n}>
                  <button
                    type="button"
                    onClick={() => setStep(s.n)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      step === s.n
                        ? 'bg-blue-600 text-white shadow-md'
                        : step > s.n
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{s.label}</span>
                    <span className="sm:hidden">{s.n}</span>
                  </button>
                  {i < STEPS.length - 1 && (
                    <div className={`w-6 h-0.5 mx-1 ${step > s.n ? 'bg-emerald-400' : 'bg-gray-200'}`}></div>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Step 1 — Cliente */}
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-600" />
                    Dados do Cliente
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Cliente existente (linkado) */}
                  {orcamento.cliente_id ? (
                    <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                      <div className="flex items-center gap-2 text-sm">
                        <UserCheck className="w-4 h-4 text-emerald-600" />
                        <span className="text-emerald-800 font-medium">Cliente vinculado:</span>
                        <span className="text-emerald-700">{orcamento.cliente_nome}</span>
                        <Badge variant="outline" className="text-[10px] border-emerald-300 text-emerald-700">
                          {orcamento.cliente_tipo}
                        </Badge>
                      </div>
                      <Button type="button" variant="ghost" size="sm" onClick={desvincularCliente} className="text-gray-500">
                        <X className="w-4 h-4 mr-1" /> Desvincular
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <ClienteSearchSelect
                        onSelect={aplicarCliente}
                        triggerLabel="Selecionar cliente cadastrado"
                        compact
                      />
                      <Button type="button" variant="ghost" size="sm" onClick={salvarComoCliente}
                              disabled={!orcamento.cliente_nome.trim()}
                              className="text-blue-700">
                        <Plus className="w-4 h-4 mr-1" /> Cadastrar este cliente
                      </Button>
                      <p className="text-xs text-blue-700 w-full mt-1">
                        💡 Selecione um cliente já cadastrado pra preencher tudo automaticamente, ou preencha abaixo e clique "Cadastrar este cliente" pra salvar no sistema.
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={orcamento.cliente_tipo === 'PF' ? 'default' : 'outline'}
                      onClick={() => update('cliente_tipo', 'PF')}
                      size="sm"
                    >Pessoa Física</Button>
                    <Button
                      type="button"
                      variant={orcamento.cliente_tipo === 'PJ' ? 'default' : 'outline'}
                      onClick={() => update('cliente_tipo', 'PJ')}
                      size="sm"
                    >Pessoa Jurídica</Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs">{orcamento.cliente_tipo === 'PJ' ? 'Razão social / Nome fantasia' : 'Nome completo'} *</Label>
                      <Input
                        value={orcamento.cliente_nome}
                        onChange={(e) => update('cliente_nome', e.target.value)}
                        placeholder={orcamento.cliente_tipo === 'PJ' ? 'Empresa LTDA' : 'Nome e sobrenome'}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">{orcamento.cliente_tipo === 'PJ' ? 'CNPJ' : 'CPF'}</Label>
                      <Input
                        value={orcamento.cliente_cpf_cnpj || ''}
                        onChange={(e) => update('cliente_cpf_cnpj', orcamento.cliente_tipo === 'PJ' ? maskCNPJ(e.target.value) : maskCPF(e.target.value))}
                        placeholder={orcamento.cliente_tipo === 'PJ' ? '00.000.000/0000-00' : '000.000.000-00'}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">E-mail</Label>
                      <Input
                        type="email"
                        value={orcamento.cliente_email}
                        onChange={(e) => update('cliente_email', e.target.value)}
                        placeholder="email@cliente.com"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">WhatsApp</Label>
                      <Input
                        value={orcamento.cliente_whatsapp}
                        onChange={(e) => update('cliente_whatsapp', maskPhone(e.target.value))}
                        placeholder="(00) 00000-0000"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Telefone fixo (opcional)</Label>
                      <Input
                        value={orcamento.cliente_telefone || ''}
                        onChange={(e) => update('cliente_telefone', maskPhone(e.target.value))}
                        placeholder="(00) 0000-0000"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button onClick={() => setStep(2)} className="bg-blue-600 hover:bg-blue-700">
                      Próximo: Itens →
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 2 — Itens */}
          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Package className="w-5 h-5 text-blue-600" />
                  Itens do Orçamento ({orcamento.itens.length})
                </h2>
                <Button onClick={addItem} size="sm" className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-1" /> Adicionar Item
                </Button>
              </div>

              {orcamento.itens.map((item, idx) => (
                <OrcamentoItemCard
                  key={item.id}
                  item={item}
                  index={idx}
                  total={orcamento.itens.length}
                  orcamentoId={orcamento.id}
                  onChange={(it) => updateItem(idx, it)}
                  onRemove={() => removeItem(idx)}
                  onMoveUp={idx > 0 ? () => moveItem(idx, -1) : undefined}
                  onMoveDown={idx < orcamento.itens.length - 1 ? () => moveItem(idx, 1) : undefined}
                />
              ))}

              <Button onClick={addItem} variant="outline" className="w-full border-dashed">
                <Plus className="w-4 h-4 mr-2" /> Adicionar mais um item
              </Button>

              <Card className="bg-emerald-50 border-emerald-200">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-emerald-700">Subtotal dos itens</p>
                    <p className="text-2xl font-bold text-emerald-700">
                      {subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                  </div>
                  <Button onClick={() => setStep(3)} className="bg-blue-600 hover:bg-blue-700">
                    Próximo: Envio →
                  </Button>
                </CardContent>
              </Card>

              <div className="flex justify-between pt-2">
                <Button variant="outline" onClick={() => setStep(1)}>← Voltar</Button>
              </div>
            </motion.div>
          )}

          {/* Step 3 — Envio */}
          {step === 3 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <EnderecoCorreios
                endereco={orcamento.endereco}
                envio={orcamento.envio}
                onChangeEndereco={(e) => update('endereco', e)}
                onChangeEnvio={(e) => update('envio', e)}
              />
              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setStep(2)}>← Voltar</Button>
                <Button onClick={() => setStep(4)} className="bg-blue-600 hover:bg-blue-700">
                  Próximo: Total →
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 4 — Total */}
          {step === 4 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-blue-600" />
                    Desconto, Validade e Observações
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-xs">Desconto (%)</Label>
                      <Input
                        type="number"
                        value={orcamento.desconto_percentual}
                        onChange={(e) => update('desconto_percentual', parseFloat(e.target.value) || 0)}
                        placeholder="0"
                        max={100}
                        min={0}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Validade (dias)</Label>
                      <Input
                        type="number"
                        value={orcamento.validade_dias}
                        onChange={(e) => update('validade_dias', parseInt(e.target.value) || 15)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Status inicial</Label>
                      <Select value={orcamento.status} onValueChange={(v) => update('status', v as any)}>
                        <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pendente">Pendente</SelectItem>
                          <SelectItem value="aprovado">Aprovado</SelectItem>
                          <SelectItem value="em_producao">Em Produção</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs">Observações para o cliente (aparece no PDF/WhatsApp)</Label>
                    <textarea
                      value={orcamento.observacoes_cliente || ''}
                      onChange={(e) => update('observacoes_cliente', e.target.value)}
                      placeholder="Condições de pagamento, forma de entrega, etc."
                      rows={3}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <Label className="text-xs">Observações internas (não aparecem para o cliente)</Label>
                    <textarea
                      value={orcamento.observacoes_internas || ''}
                      onChange={(e) => update('observacoes_internas', e.target.value)}
                      placeholder="Notas pra você mesmo."
                      rows={2}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Resumo */}
              <Card className="border-2 border-emerald-200">
                <CardContent className="p-6 space-y-2">
                  <h3 className="font-semibold text-gray-900 mb-3">Resumo financeiro</h3>
                  <div className="flex justify-between text-sm text-gray-700">
                    <span>Subtotal ({orcamento.itens.length} {orcamento.itens.length === 1 ? 'item' : 'itens'})</span>
                    <span className="font-medium">{subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                  </div>
                  {frete > 0 && (
                    <div className="flex justify-between text-sm text-gray-700">
                      <span>Frete ({orcamento.envio.modalidade || '—'})</span>
                      <span className="font-medium">{frete.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    </div>
                  )}
                  {descontoValor > 0 && (
                    <div className="flex justify-between text-sm text-red-600">
                      <span>Desconto ({orcamento.desconto_percentual}%)</span>
                      <span className="font-medium">− {descontoValor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-3 border-t text-lg font-bold text-emerald-700">
                    <span>TOTAL</span>
                    <span>{total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-between pt-2 gap-3 flex-wrap">
                <Button variant="outline" onClick={() => setStep(3)}>← Voltar</Button>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleBaixarPDF}
                    disabled={baixandoPdf}
                  >
                    {baixandoPdf ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileDown className="w-4 h-4 mr-2" />}
                    Pré-visualizar PDF
                  </Button>
                  <Button
                    onClick={handleSalvar}
                    disabled={saving}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    Salvar Orçamento
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
