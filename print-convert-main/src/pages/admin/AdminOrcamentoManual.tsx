import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FilePlus, Save, ArrowLeft, User, Mail, Phone, MapPin,
  Package, Ruler, Hash, DollarSign, FileText, CheckCircle,
  Printer, Layers, Clock, Calculator
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
import Sidebar from '@/components/admin/Sidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { orcamentosAPI } from '@/lib/apiClient';
import { useToast } from '@/hooks/use-toast';

const materiais = [
  { id: 'pla', nome: 'PLA', preco_kg: 120 },
  { id: 'abs', nome: 'ABS', preco_kg: 130 },
  { id: 'petg', nome: 'PETG', preco_kg: 140 },
  { id: 'tpu', nome: 'TPU (Flexível)', preco_kg: 180 },
  { id: 'nylon', nome: 'Nylon', preco_kg: 200 },
  { id: 'asa', nome: 'ASA', preco_kg: 160 },
  { id: 'pc', nome: 'Policarbonato', preco_kg: 220 },
  { id: 'resina_std', nome: 'Resina Standard', preco_l: 150 },
  { id: 'resina_abs', nome: 'Resina ABS-Like', preco_l: 180 },
  { id: 'resina_flex', nome: 'Resina Flexível', preco_l: 200 },
  { id: 'resina_dental', nome: 'Resina Dental', preco_l: 350 },
  { id: 'resina_cast', nome: 'Resina Castable', preco_l: 400 },
];

const servicos = [
  'Impressão 3D FDM',
  'Impressão 3D Resina',
  'Modelagem 3D',
  'Pintura de Peça',
  'Manutenção de Impressora',
  'Prototipagem Rápida',
  'Produção em Série',
  'Digitalização 3D',
  'Consultoria Técnica',
];

const cores = [
  'Branco', 'Preto', 'Cinza', 'Vermelho', 'Azul', 'Verde',
  'Amarelo', 'Laranja', 'Rosa', 'Roxo', 'Transparente', 'Outra'
];

export default function AdminOrcamentoManual() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    // Cliente
    nome: '',
    email: '',
    whatsapp: '',
    cidade: '',
    estado: '',
    // Serviço
    servico: 'Impressão 3D FDM',
    material: 'pla',
    cor: 'Branco',
    acabamento: 'normal',
    // Dimensões
    largura: '',
    altura: '',
    profundidade: '',
    peso_estimado: '',
    quantidade: '1',
    // Financeiro
    valor_material: '',
    valor_mao_obra: '',
    valor_frete: '',
    desconto: '0',
    valor_total: '',
    // Observações
    observacoes: '',
    prazo_estimado: '7',
    prioridade: 'normal',
    status: 'pendente',
  });

  const updateForm = (field: string, value: string) => {
    setForm(prev => {
      const updated = { ...prev, [field]: value };
      // Auto-calcular valor total
      const material = parseFloat(updated.valor_material) || 0;
      const maoObra = parseFloat(updated.valor_mao_obra) || 0;
      const frete = parseFloat(updated.valor_frete) || 0;
      const desconto = parseFloat(updated.desconto) || 0;
      const qty = parseInt(updated.quantidade) || 1;
      const subtotal = (material + maoObra) * qty + frete;
      const total = subtotal - (subtotal * desconto / 100);
      updated.valor_total = total.toFixed(2);
      return updated;
    });
  };

  const handleWhatsappMask = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 2) return `(${digits}`;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
  };

  const handleSave = async () => {
    if (!form.nome || !form.servico) {
      toast({ title: 'Erro', description: 'Preencha pelo menos o nome do cliente e o serviço.', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      const orcamentoData = {
        nome: form.nome,
        email: form.email,
        whatsapp: form.whatsapp,
        cidade: form.cidade,
        estado: form.estado,
        servico: form.servico,
        material: form.material,
        cor: form.cor,
        acabamento: form.acabamento,
        dimensoes: `${form.largura}x${form.altura}x${form.profundidade}mm`,
        peso_estimado: form.peso_estimado,
        quantidade: parseInt(form.quantidade) || 1,
        valor_material: parseFloat(form.valor_material) || 0,
        valor_mao_obra: parseFloat(form.valor_mao_obra) || 0,
        valor_frete: parseFloat(form.valor_frete) || 0,
        desconto: parseFloat(form.desconto) || 0,
        valor_total: parseFloat(form.valor_total) || 0,
        observacoes: form.observacoes,
        prazo_estimado: `${form.prazo_estimado} dias`,
        prioridade: form.prioridade,
        status: form.status,
        origem: 'manual',
        created_at: new Date().toISOString(),
      };

      await orcamentosAPI.create(orcamentoData);
      
      // Também salvar no localStorage como backup
      const savedOrcamentos = JSON.parse(localStorage.getItem('admin_orcamentos_manuais') || '[]');
      savedOrcamentos.push({ ...orcamentoData, id: `ORC-${Date.now()}` });
      localStorage.setItem('admin_orcamentos_manuais', JSON.stringify(savedOrcamentos));

      setSaved(true);
      toast({ title: 'Sucesso!', description: 'Orçamento criado com sucesso.' });
    } catch (error) {
      console.error('Erro ao salvar orçamento:', error);
      // Salvar localmente mesmo se falhar no Supabase
      const savedOrcamentos = JSON.parse(localStorage.getItem('admin_orcamentos_manuais') || '[]');
      savedOrcamentos.push({
        ...form,
        id: `ORC-${Date.now()}`,
        origem: 'manual',
        created_at: new Date().toISOString(),
      });
      localStorage.setItem('admin_orcamentos_manuais', JSON.stringify(savedOrcamentos));
      setSaved(true);
      toast({ title: 'Salvo localmente', description: 'Orçamento salvo no armazenamento local.' });
    } finally {
      setSaving(false);
    }
  };

  const handleWhatsAppSend = () => {
    const msg = encodeURIComponent(
      `*ORÇAMENTO 3DKPRINT*\n\n` +
      `Cliente: ${form.nome}\n` +
      `Serviço: ${form.servico}\n` +
      `Material: ${materiais.find(m => m.id === form.material)?.nome || form.material}\n` +
      `Cor: ${form.cor}\n` +
      `Quantidade: ${form.quantidade}\n` +
      `Dimensões: ${form.largura}x${form.altura}x${form.profundidade}mm\n` +
      `Prazo: ${form.prazo_estimado} dias\n\n` +
      `*Valor Total: R$ ${parseFloat(form.valor_total || '0').toLocaleString('pt-BR', { minimumFractionDigits: 2 })}*\n\n` +
      `Observações: ${form.observacoes || 'Nenhuma'}`
    );
    const phone = form.whatsapp.replace(/\D/g, '');
    window.open(`https://wa.me/55${phone}?text=${msg}`, '_blank');
  };

  if (saved) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <AdminHeader title="Orçamento Manual" />
          <div className="p-4 lg:p-8 max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-lg p-8 text-center"
            >
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Orçamento Criado!</h2>
              <p className="text-gray-500 mb-6">O orçamento foi salvo com sucesso.</p>
              
              <div className="bg-gray-50 rounded-xl p-5 mb-6 text-left">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-gray-500">Cliente:</span> <span className="font-medium">{form.nome}</span></div>
                  <div><span className="text-gray-500">Serviço:</span> <span className="font-medium">{form.servico}</span></div>
                  <div><span className="text-gray-500">Quantidade:</span> <span className="font-medium">{form.quantidade}</span></div>
                  <div><span className="text-gray-500">Prazo:</span> <span className="font-medium">{form.prazo_estimado} dias</span></div>
                  <div className="col-span-2 pt-2 border-t">
                    <span className="text-gray-500">Valor Total:</span>{' '}
                    <span className="text-xl font-bold text-emerald-600">
                      R$ {parseFloat(form.valor_total || '0').toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {form.whatsapp && (
                  <Button onClick={handleWhatsAppSend} className="bg-green-600 hover:bg-green-700">
                    <Phone className="w-4 h-4 mr-2" />
                    Enviar via WhatsApp
                  </Button>
                )}
                <Button variant="outline" onClick={() => { setSaved(false); setForm({ nome: '', email: '', whatsapp: '', cidade: '', estado: '', servico: 'Impressão 3D FDM', material: 'pla', cor: 'Branco', acabamento: 'normal', largura: '', altura: '', profundidade: '', peso_estimado: '', quantidade: '1', valor_material: '', valor_mao_obra: '', valor_frete: '', desconto: '0', valor_total: '', observacoes: '', prazo_estimado: '7', prioridade: 'normal', status: 'pendente' }); setStep(1); }}>
                  <FilePlus className="w-4 h-4 mr-2" />
                  Novo Orçamento
                </Button>
                <Button variant="outline" onClick={() => navigate('/admin/orcamentos')}>
                  Ver Orçamentos
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
        <AdminHeader title="Orçamento Manual" />

        <div className="p-4 lg:p-8 max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => navigate('/admin/dashboard')}>
                <ArrowLeft className="w-4 h-4 mr-1" />
                Voltar
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Criar Orçamento Manual</h1>
                <p className="text-sm text-gray-500">Preencha os dados para gerar um orçamento</p>
              </div>
            </div>
          </div>

          {/* Steps Indicator */}
          <div className="flex items-center justify-center mb-8">
            {[
              { num: 1, label: 'Cliente', icon: User },
              { num: 2, label: 'Serviço', icon: Printer },
              { num: 3, label: 'Dimensões', icon: Ruler },
              { num: 4, label: 'Valores', icon: DollarSign },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <React.Fragment key={s.num}>
                  <button
                    onClick={() => setStep(s.num)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      step === s.num
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                        : step > s.num
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{s.label}</span>
                    <span className="sm:hidden">{s.num}</span>
                  </button>
                  {i < 3 && (
                    <div className={`w-8 h-0.5 mx-1 ${step > s.num ? 'bg-emerald-400' : 'bg-gray-200'}`}></div>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Step 1: Cliente */}
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Nome Completo *</label>
                      <Input value={form.nome} onChange={(e) => updateForm('nome', e.target.value)} placeholder="Nome do cliente" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">E-mail</label>
                      <Input type="email" value={form.email} onChange={(e) => updateForm('email', e.target.value)} placeholder="email@exemplo.com" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">WhatsApp</label>
                      <Input value={form.whatsapp} onChange={(e) => updateForm('whatsapp', handleWhatsappMask(e.target.value))} placeholder="(00) 00000-0000" maxLength={15} />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Cidade</label>
                      <Input value={form.cidade} onChange={(e) => updateForm('cidade', e.target.value)} placeholder="Cidade" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Estado</label>
                      <Select value={form.estado} onValueChange={(v) => updateForm('estado', v)}>
                        <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                        <SelectContent>
                          {['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'].map(uf => (
                            <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex justify-end pt-4">
                    <Button onClick={() => setStep(2)} className="bg-blue-600 hover:bg-blue-700">
                      Próximo: Serviço
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 2: Serviço */}
          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Printer className="w-4 h-4 text-blue-600" />
                    Detalhes do Serviço
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Tipo de Serviço *</label>
                      <Select value={form.servico} onValueChange={(v) => updateForm('servico', v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {servicos.map(s => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Material</label>
                      <Select value={form.material} onValueChange={(v) => updateForm('material', v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {materiais.map(m => (
                            <SelectItem key={m.id} value={m.id}>{m.nome}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Cor</label>
                      <Select value={form.cor} onValueChange={(v) => updateForm('cor', v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {cores.map(c => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Acabamento</label>
                      <Select value={form.acabamento} onValueChange={(v) => updateForm('acabamento', v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="lixado">Lixado</SelectItem>
                          <SelectItem value="pintado">Pintado</SelectItem>
                          <SelectItem value="acetona">Acetona (ABS)</SelectItem>
                          <SelectItem value="verniz">Verniz</SelectItem>
                          <SelectItem value="premium">Premium (Lixado + Pintado)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Prioridade</label>
                      <Select value={form.prioridade} onValueChange={(v) => updateForm('prioridade', v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="baixa">Baixa</SelectItem>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="alta">Alta</SelectItem>
                          <SelectItem value="urgente">Urgente</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex justify-between pt-4">
                    <Button variant="outline" onClick={() => setStep(1)}>Voltar</Button>
                    <Button onClick={() => setStep(3)} className="bg-blue-600 hover:bg-blue-700">
                      Próximo: Dimensões
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 3: Dimensões */}
          {step === 3 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Ruler className="w-4 h-4 text-blue-600" />
                    Dimensões e Quantidade
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Largura (mm)</label>
                      <Input type="number" value={form.largura} onChange={(e) => updateForm('largura', e.target.value)} placeholder="0" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Altura (mm)</label>
                      <Input type="number" value={form.altura} onChange={(e) => updateForm('altura', e.target.value)} placeholder="0" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Profundidade (mm)</label>
                      <Input type="number" value={form.profundidade} onChange={(e) => updateForm('profundidade', e.target.value)} placeholder="0" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Peso Estimado (g)</label>
                      <Input type="number" value={form.peso_estimado} onChange={(e) => updateForm('peso_estimado', e.target.value)} placeholder="0" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Quantidade</label>
                      <Input type="number" value={form.quantidade} onChange={(e) => updateForm('quantidade', e.target.value)} placeholder="1" min="1" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Prazo Estimado (dias)</label>
                    <Input type="number" value={form.prazo_estimado} onChange={(e) => updateForm('prazo_estimado', e.target.value)} placeholder="7" />
                  </div>
                  <div className="flex justify-between pt-4">
                    <Button variant="outline" onClick={() => setStep(2)}>Voltar</Button>
                    <Button onClick={() => setStep(4)} className="bg-blue-600 hover:bg-blue-700">
                      Próximo: Valores
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 4: Valores */}
          {step === 4 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-blue-600" />
                    Valores e Finalização
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Valor Material (R$)</label>
                      <Input type="number" step="0.01" value={form.valor_material} onChange={(e) => updateForm('valor_material', e.target.value)} placeholder="0.00" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Valor Mão de Obra (R$)</label>
                      <Input type="number" step="0.01" value={form.valor_mao_obra} onChange={(e) => updateForm('valor_mao_obra', e.target.value)} placeholder="0.00" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Valor Frete (R$)</label>
                      <Input type="number" step="0.01" value={form.valor_frete} onChange={(e) => updateForm('valor_frete', e.target.value)} placeholder="0.00" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Desconto (%)</label>
                      <Input type="number" value={form.desconto} onChange={(e) => updateForm('desconto', e.target.value)} placeholder="0" max="100" />
                    </div>
                  </div>

                  {/* Total */}
                  <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-xl p-5 border border-emerald-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-emerald-700 font-medium">Valor Total</p>
                        <p className="text-xs text-emerald-600">
                          ({form.quantidade}x) Material + Mão de Obra + Frete - {form.desconto}% desconto
                        </p>
                      </div>
                      <p className="text-3xl font-bold text-emerald-700">
                        R$ {parseFloat(form.valor_total || '0').toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Observações</label>
                    <textarea
                      value={form.observacoes}
                      onChange={(e) => updateForm('observacoes', e.target.value)}
                      placeholder="Observações adicionais sobre o orçamento..."
                      className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Status Inicial</label>
                    <Select value={form.status} onValueChange={(v) => updateForm('status', v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pendente">Pendente</SelectItem>
                        <SelectItem value="aprovado">Aprovado</SelectItem>
                        <SelectItem value="em_producao">Em Produção</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button variant="outline" onClick={() => setStep(3)}>Voltar</Button>
                    <Button
                      onClick={handleSave}
                      disabled={saving}
                      className="bg-emerald-600 hover:bg-emerald-700 px-8"
                    >
                      {saving ? (
                        <>
                          <Clock className="w-4 h-4 mr-2 animate-spin" />
                          Salvando...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Criar Orçamento
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
