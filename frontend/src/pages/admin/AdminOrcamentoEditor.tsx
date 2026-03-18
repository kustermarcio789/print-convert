/**
 * Página de Criação/Edição de Orçamento Profissional - 3DKPRINT
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Save, Send, FileDown, User, Building2, Mail, Phone,
  MapPin, Calendar, Clock, CreditCard, FileText, Printer, Box,
  Palette, Wrench, HelpCircle, Loader2, CheckCircle, AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import Sidebar from '@/components/admin/Sidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import QuotationItemsTable from '@/components/QuotationItemsTable';
import {
  QuotationItem,
  createEmptyQuotationItem,
  calculateQuotationTotals,
  formatCurrencyBRL,
  roundMoney,
  parseNumber,
} from '@/lib/quotePricingEngine';
import {
  Quotation,
  QuotationStatus,
  PaymentMethod,
  generateQuotationNumber,
  calculateValidityDate,
  SERVICE_TYPE_LABELS,
  PAYMENT_METHOD_LABELS,
} from '@/lib/quotationTypes';
import { downloadQuotationPdf, openQuotationPdf } from '@/lib/quotationPdfGenerator';
import { orcamentosAPI } from '@/lib/apiClient';

// Estados brasileiros
const ESTADOS_BR = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS',
  'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC',
  'SP', 'SE', 'TO'
];

export default function AdminOrcamentoEditor() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const isEditing = Boolean(id);

  // Estados do formulário
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  // Dados do orçamento
  const [quotationNumber, setQuotationNumber] = useState(generateQuotationNumber());
  const [status, setStatus] = useState<QuotationStatus>('rascunho');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [validityDays, setValidityDays] = useState(15);

  // Dados do cliente
  const [clientName, setClientName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientWhatsapp, setClientWhatsapp] = useState('');
  const [clientCpf, setClientCpf] = useState('');
  const [clientCnpj, setClientCnpj] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [clientCity, setClientCity] = useState('');
  const [clientState, setClientState] = useState('');
  const [clientZip, setClientZip] = useState('');

  // Tipo de serviço
  const [serviceType, setServiceType] = useState<Quotation['service_type']>('impressao');

  // Itens
  const [items, setItems] = useState<QuotationItem[]>([createEmptyQuotationItem()]);

  // Valores adicionais
  const [shippingCost, setShippingCost] = useState(0);

  // Condições comerciais
  const [productionLeadTime, setProductionLeadTime] = useState('7 dias úteis');
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(['pix', 'boleto']);
  const [paymentConditions, setPaymentConditions] = useState('À vista ou parcelado em até 3x');

  // Observações
  const [observations, setObservations] = useState('');
  const [internalNotes, setInternalNotes] = useState('');

  // Calcula totais
  const totals = calculateQuotationTotals(items);
  const finalTotal = roundMoney(totals.final_total + shippingCost);

  // Carrega orçamento existente
  useEffect(() => {
    if (isEditing && id) {
      loadQuotation(id);
    }
  }, [id, isEditing]);

  const loadQuotation = async (quotationId: string) => {
    setLoading(true);
    try {
      const data = await orcamentosAPI.getById(quotationId);
      if (data) {
        // Popula os campos com os dados existentes
        setQuotationNumber(data.quotation_number || data.id || '');
        setStatus(data.status || 'pendente');
        setClientName(data.client_name || data.cliente || '');
        setCompanyName(data.company_name || '');
        setClientEmail(data.client_email || data.email || '');
        setClientPhone(data.client_phone || data.telefone || '');
        setClientWhatsapp(data.client_whatsapp || data.whatsapp || '');
        setServiceType(data.service_type || data.tipo || 'impressao');
        setObservations(data.observations || data.observacoes || '');
        setInternalNotes(data.internal_notes || '');
        setProductionLeadTime(data.production_lead_time || data.prazo || '');
        setShippingCost(data.shipping_cost || 0);

        // Carrega itens se existirem
        if (data.items && Array.isArray(data.items) && data.items.length > 0) {
          setItems(data.items);
        } else if (data.descricao) {
          // Converte orçamento antigo (single item) para novo formato
          setItems([{
            id: `item_${Date.now()}`,
            product_id: null,
            name: data.descricao || 'Item do orçamento',
            description: data.material || '',
            quantity: data.quantidade || 1,
            unit_price: parseNumber(data.valor || data.total || 0) / (data.quantidade || 1),
            discount_amount: 0,
            total_price: parseNumber(data.valor || data.total || 0),
          }]);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar orçamento:', error);
      toast({
        title: 'Erro ao carregar',
        description: 'Não foi possível carregar o orçamento.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Monta objeto do orçamento
  const buildQuotation = useCallback((): Quotation => {
    const validityDate = new Date(issueDate);
    validityDate.setDate(validityDate.getDate() + validityDays);

    return {
      id: id || `orc_${Date.now()}`,
      quotation_number: quotationNumber,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      issue_date: issueDate,
      validity_date: validityDate.toISOString(),
      status,
      client_name: clientName,
      company_name: companyName || undefined,
      client_email: clientEmail,
      client_phone: clientPhone || undefined,
      client_whatsapp: clientWhatsapp || undefined,
      client_cpf: clientCpf || undefined,
      client_cnpj: clientCnpj || undefined,
      client_address: clientAddress || undefined,
      client_city: clientCity || undefined,
      client_state: clientState || undefined,
      client_zip: clientZip || undefined,
      service_type: serviceType,
      items,
      subtotal: totals.subtotal,
      total_discount: totals.total_discount,
      shipping_cost: shippingCost,
      final_total: finalTotal,
      production_lead_time: productionLeadTime || undefined,
      payment_methods: paymentMethods,
      payment_conditions: paymentConditions || undefined,
      observations: observations || undefined,
      internal_notes: internalNotes || undefined,
      origin: 'manual',
    };
  }, [
    id, quotationNumber, issueDate, validityDays, status, clientName, companyName,
    clientEmail, clientPhone, clientWhatsapp, clientCpf, clientCnpj,
    clientAddress, clientCity, clientState, clientZip, serviceType, items,
    totals, shippingCost, finalTotal, productionLeadTime, paymentMethods,
    paymentConditions, observations, internalNotes
  ]);

  // Salva orçamento
  const handleSave = async (sendAfterSave = false) => {
    // Validações
    if (!clientName.trim()) {
      toast({
        title: 'Campo obrigatório',
        description: 'O nome do cliente é obrigatório.',
        variant: 'destructive',
      });
      return;
    }

    if (items.length === 0 || !items.some(i => i.name.trim())) {
      toast({
        title: 'Adicione itens',
        description: 'O orçamento precisa ter pelo menos um item.',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      const quotation = buildQuotation();

      // Prepara dados para salvar no Supabase
      const dataToSave = {
        quotation_number: quotation.quotation_number,
        cliente: quotation.client_name,
        client_name: quotation.client_name,
        company_name: quotation.company_name,
        email: quotation.client_email,
        client_email: quotation.client_email,
        telefone: quotation.client_phone,
        whatsapp: quotation.client_whatsapp,
        tipo: quotation.service_type,
        service_type: quotation.service_type,
        status: sendAfterSave ? 'enviado' : quotation.status,
        valor: quotation.final_total,
        total: quotation.final_total,
        subtotal: quotation.subtotal,
        total_discount: quotation.total_discount,
        shipping_cost: quotation.shipping_cost,
        descricao: items.map(i => i.name).join(', '),
        items: JSON.stringify(quotation.items), // Salva itens como JSON
        prazo: quotation.production_lead_time,
        production_lead_time: quotation.production_lead_time,
        payment_methods: quotation.payment_methods,
        payment_conditions: quotation.payment_conditions,
        observacoes: quotation.observations,
        observations: quotation.observations,
        internal_notes: quotation.internal_notes,
        issue_date: quotation.issue_date,
        validity_date: quotation.validity_date,
        origem: 'manual',
        updated_at: new Date().toISOString(),
      };

      if (isEditing && id) {
        await orcamentosAPI.update(id, dataToSave);
      } else {
        await orcamentosAPI.create({
          ...dataToSave,
          created_at: new Date().toISOString(),
        });
      }

      toast({
        title: 'Sucesso!',
        description: isEditing ? 'Orçamento atualizado.' : 'Orçamento criado.',
      });

      if (!isEditing) {
        navigate('/admin/orcamentos');
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast({
        title: 'Erro ao salvar',
        description: 'Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  // Gera PDF
  const handleGeneratePdf = async (download = true) => {
    if (items.length === 0 || !items.some(i => i.name.trim())) {
      toast({
        title: 'Adicione itens',
        description: 'O orçamento precisa ter itens para gerar o PDF.',
        variant: 'destructive',
      });
      return;
    }

    setGeneratingPdf(true);
    try {
      const quotation = buildQuotation();
      if (download) {
        await downloadQuotationPdf(quotation);
      } else {
        await openQuotationPdf(quotation);
      }
      toast({
        title: 'PDF gerado!',
        description: download ? 'Download iniciado.' : 'PDF aberto em nova aba.',
      });
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast({
        title: 'Erro ao gerar PDF',
        description: 'Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setGeneratingPdf(false);
    }
  };

  // Toggle método de pagamento
  const togglePaymentMethod = (method: PaymentMethod) => {
    setPaymentMethods(prev =>
      prev.includes(method)
        ? prev.filter(m => m !== method)
        : [...prev, method]
    );
  };

  // Máscara de telefone
  const formatPhoneMask = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 2) return `(${digits}`;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        <AdminHeader title={isEditing ? 'Editar Orçamento' : 'Novo Orçamento'} />

        <div className="p-4 lg:p-6 max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => navigate('/admin/orcamentos')}>
                <ArrowLeft className="w-4 h-4 mr-1" />
                Voltar
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {isEditing ? `Orçamento ${quotationNumber}` : 'Novo Orçamento'}
                </h1>
                <p className="text-sm text-gray-500">
                  Preencha os dados do cliente e adicione os itens
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => handleGeneratePdf(false)}
                disabled={generatingPdf}
              >
                {generatingPdf ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <FileDown className="w-4 h-4 mr-2" />
                )}
                Visualizar PDF
              </Button>
              <Button
                variant="outline"
                onClick={() => handleGeneratePdf(true)}
                disabled={generatingPdf}
              >
                <FileDown className="w-4 h-4 mr-2" />
                Baixar PDF
              </Button>
              <Button
                onClick={() => handleSave(false)}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Salvar
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Coluna Principal */}
            <div className="lg:col-span-2 space-y-6">
              {/* Dados do Cliente */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-base flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-600" />
                    Dados do Cliente
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="clientName">Nome do Cliente *</Label>
                      <Input
                        id="clientName"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        placeholder="Nome completo"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Empresa / Razão Social</Label>
                      <Input
                        id="companyName"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Nome da empresa (se aplicável)"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="clientEmail">E-mail</Label>
                      <Input
                        id="clientEmail"
                        type="email"
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        placeholder="email@exemplo.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="clientPhone">Telefone / WhatsApp</Label>
                      <Input
                        id="clientPhone"
                        value={clientPhone}
                        onChange={(e) => setClientPhone(formatPhoneMask(e.target.value))}
                        placeholder="(00) 00000-0000"
                        maxLength={15}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="clientCpf">CPF</Label>
                      <Input
                        id="clientCpf"
                        value={clientCpf}
                        onChange={(e) => setClientCpf(e.target.value)}
                        placeholder="000.000.000-00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="clientCnpj">CNPJ</Label>
                      <Input
                        id="clientCnpj"
                        value={clientCnpj}
                        onChange={(e) => setClientCnpj(e.target.value)}
                        placeholder="00.000.000/0000-00"
                      />
                    </div>
                  </div>

                  {/* Endereço (colapsável) */}
                  <div className="pt-4 border-t">
                    <p className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Endereço (opcional)
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2 space-y-2">
                        <Input
                          value={clientAddress}
                          onChange={(e) => setClientAddress(e.target.value)}
                          placeholder="Endereço"
                        />
                      </div>
                      <div className="space-y-2">
                        <Input
                          value={clientZip}
                          onChange={(e) => setClientZip(e.target.value)}
                          placeholder="CEP"
                        />
                      </div>
                      <div className="space-y-2">
                        <Input
                          value={clientCity}
                          onChange={(e) => setClientCity(e.target.value)}
                          placeholder="Cidade"
                        />
                      </div>
                      <div className="space-y-2">
                        <Select value={clientState} onValueChange={setClientState}>
                          <SelectTrigger>
                            <SelectValue placeholder="Estado" />
                          </SelectTrigger>
                          <SelectContent>
                            {ESTADOS_BR.map(uf => (
                              <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tipo de Serviço */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Printer className="w-4 h-4 text-blue-600" />
                    Tipo de Serviço
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    {(Object.entries(SERVICE_TYPE_LABELS) as [Quotation['service_type'], string][]).map(([key, label]) => {
                      const icons: Record<string, React.ReactNode> = {
                        impressao: <Printer className="w-4 h-4" />,
                        modelagem: <Box className="w-4 h-4" />,
                        pintura: <Palette className="w-4 h-4" />,
                        manutencao: <Wrench className="w-4 h-4" />,
                        outro: <HelpCircle className="w-4 h-4" />,
                      };
                      return (
                        <button
                          key={key}
                          onClick={() => setServiceType(key)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                            serviceType === key
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300'
                          }`}
                        >
                          {icons[key]}
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Itens do Orçamento */}
              <Card>
                <CardContent className="pt-6">
                  <QuotationItemsTable
                    items={items}
                    onChange={setItems}
                  />
                </CardContent>
              </Card>

              {/* Observações */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    Observações
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="observations">Observações (visível no PDF)</Label>
                    <Textarea
                      id="observations"
                      value={observations}
                      onChange={(e) => setObservations(e.target.value)}
                      placeholder="Observações que aparecerão no orçamento do cliente..."
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="internalNotes">Notas Internas (não aparece no PDF)</Label>
                    <Textarea
                      id="internalNotes"
                      value={internalNotes}
                      onChange={(e) => setInternalNotes(e.target.value)}
                      placeholder="Anotações internas da equipe..."
                      rows={2}
                      className="bg-yellow-50 border-yellow-200"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Coluna Lateral */}
            <div className="space-y-6">
              {/* Status e Datas */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    Status e Datas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Número do Orçamento</Label>
                    <Input
                      value={quotationNumber}
                      onChange={(e) => setQuotationNumber(e.target.value)}
                      placeholder="ORC-2025-0001"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={status} onValueChange={(v) => setStatus(v as QuotationStatus)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rascunho">Rascunho</SelectItem>
                        <SelectItem value="pendente">Pendente</SelectItem>
                        <SelectItem value="enviado">Enviado</SelectItem>
                        <SelectItem value="aprovado">Aprovado</SelectItem>
                        <SelectItem value="convertido">Venda Fechada</SelectItem>
                        <SelectItem value="recusado">Recusado</SelectItem>
                        <SelectItem value="cancelado">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Data de Emissão</Label>
                    <Input
                      type="date"
                      value={issueDate}
                      onChange={(e) => setIssueDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Validade (dias)</Label>
                    <Input
                      type="number"
                      min="1"
                      value={validityDays}
                      onChange={(e) => setValidityDays(parseInt(e.target.value) || 15)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Condições Comerciais */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-base flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-blue-600" />
                    Condições Comerciais
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Prazo de Produção</Label>
                    <Input
                      value={productionLeadTime}
                      onChange={(e) => setProductionLeadTime(e.target.value)}
                      placeholder="Ex: 7 dias úteis"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Formas de Pagamento</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {(Object.entries(PAYMENT_METHOD_LABELS) as [PaymentMethod, string][]).map(([key, label]) => (
                        <label
                          key={key}
                          className="flex items-center gap-2 text-sm cursor-pointer"
                        >
                          <Checkbox
                            checked={paymentMethods.includes(key)}
                            onCheckedChange={() => togglePaymentMethod(key)}
                          />
                          {label}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Condições de Pagamento</Label>
                    <Input
                      value={paymentConditions}
                      onChange={(e) => setPaymentConditions(e.target.value)}
                      placeholder="Ex: 50% entrada + 50% na entrega"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Valor do Frete (R$)</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={shippingCost || ''}
                      onChange={(e) => setShippingCost(roundMoney(parseNumber(e.target.value)))}
                      placeholder="0,00"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Resumo de Valores */}
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-blue-800">Resumo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-700">Subtotal:</span>
                    <span className="font-medium">{formatCurrencyBRL(totals.subtotal)}</span>
                  </div>
                  {totals.total_discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-blue-700">Descontos:</span>
                      <span className="font-medium text-green-600">
                        -{formatCurrencyBRL(totals.total_discount)}
                      </span>
                    </div>
                  )}
                  {shippingCost > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-blue-700">Frete:</span>
                      <span className="font-medium">{formatCurrencyBRL(shippingCost)}</span>
                    </div>
                  )}
                  <div className="border-t border-blue-200 pt-3 flex justify-between">
                    <span className="font-semibold text-blue-800">Total:</span>
                    <span className="font-bold text-2xl text-blue-900">
                      {formatCurrencyBRL(finalTotal)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
