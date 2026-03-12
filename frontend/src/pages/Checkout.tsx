import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Shield, Truck, CreditCard, QrCode, Banknote, CheckCircle, Phone, MapPin, User, Mail, FileText, Package, Loader2, AlertCircle, Copy, Check, Lock, Clock } from 'lucide-react';
import { Layout } from '../components/layout/Layout';

// Mercado Pago Credentials (TEST)
const MP_PUBLIC_KEY = 'TEST-a0a8db55-4729-47a7-bb0f-4d8c1ac04b58';
const MP_ACCESS_TOKEN = 'TEST-7156697657303179-030303-0e03f85cc529668997ea75f7bcbf3dc3-287681490';

// CEP de origem
const CEP_ORIGEM = '86010000';

// Dimensões padrão para cálculo de frete
const printerDimensions: Record<string, { height: number; width: number; length: number; weight: number }> = {
  'elegoo-saturn3-ultra-12k': { height: 45, width: 30, length: 30, weight: 8 },
  'elegoo-centauri-carbon': { height: 50, width: 40, length: 40, weight: 12 },
  'elegoo-saturn4-ultra-12k': { height: 45, width: 30, length: 30, weight: 8 },
  'elegoo-saturn4-ultra-16k': { height: 45, width: 30, length: 30, weight: 8 },
  'sovol-zero': { height: 45, width: 40, length: 40, weight: 10 },
  'sovol-sv08': { height: 55, width: 50, length: 50, weight: 15 },
  'sovol-sv08-max': { height: 70, width: 60, length: 60, weight: 25 },
};

// Catálogo estático
const printerCatalog: Record<string, any> = {
  'elegoo-saturn3-ultra-12k': {
    id: 'elegoo-saturn3-ultra-12k', name: 'Elegoo Saturn 3 Ultra 12K', brand: 'Elegoo', type: 'Resina',
    price: 3700, image: '/images/printers/elegoo-saturn3.png',
    description: 'Excelente custo-benefício em resina 12K.',
    specs: { velocidade: '150 mm/h', volume: '219x123x260mm', resolucao: '12K Mono MSLA' },
  },
  'elegoo-centauri-carbon': {
    id: 'elegoo-centauri-carbon', name: 'Elegoo Centauri Carbon', brand: 'Elegoo', type: 'FDM',
    price: 4360, image: '/images/printers/elegoo-centauri.png',
    description: 'CoreXY de alta velocidade com estrutura em fibra de carbono.',
    specs: { velocidade: '500 mm/s', volume: '256x256x256mm', firmware: 'Klipper' },
  },
  'elegoo-saturn4-ultra-12k': {
    id: 'elegoo-saturn4-ultra-12k', name: 'Elegoo Saturn 4 Ultra 12K', brand: 'Elegoo', type: 'Resina',
    price: 4800, image: '/images/printers/elegoo-saturn4-12k.png',
    description: 'Resina profissional com resolução 12K.',
    specs: { velocidade: '150 mm/h', volume: '218.88x122.88x220mm', resolucao: '12K' },
  },
  'elegoo-saturn4-ultra-16k': {
    id: 'elegoo-saturn4-ultra-16k', name: 'Elegoo Saturn 4 Ultra 16K', brand: 'Elegoo', type: 'Resina',
    price: 5900, image: '/images/printers/elegoo-saturn4-16k.png',
    description: 'A MELHOR resolução do mercado! 16K.',
    specs: { velocidade: '150 mm/h', volume: '218.88x122.88x220mm', resolucao: '16K TOPO DE LINHA' },
  },
  'sovol-zero': {
    id: 'sovol-zero', name: 'Sovol Zero', brand: 'Sovol', type: 'FDM',
    price: 4900, image: '/images/printers/sovol-zero.png',
    description: 'A impressora mais RÁPIDA do mercado! 1200mm/s.',
    specs: { velocidade: '1200 mm/s', volume: '235x235x250mm', bocal: '350°C' },
  },
  'sovol-sv08': {
    id: 'sovol-sv08', name: 'Sovol SV08', brand: 'Sovol', type: 'FDM',
    price: 6800, image: '/images/printers/sovol-sv08.png',
    description: 'CoreXY baseada no Voron 2.4 open-source.',
    specs: { velocidade: '700 mm/s', volume: '350x350x350mm', base: 'Voron 2.4' },
  },
  'sovol-sv08-max': {
    id: 'sovol-sv08-max', name: 'Sovol SV08 MAX', brand: 'Sovol', type: 'FDM',
    price: 15000, image: '/images/printers/sovol-sv08-max.png',
    description: 'A MAIOR CoreXY do mercado! Volume gigante.',
    specs: { velocidade: '700 mm/s', volume: '500x500x500mm', base: 'Voron 2.4' },
  },
};

// Busca produto do catálogo estático OU do admin (localStorage)
function getProduct(productId: string | undefined): any {
  if (!productId) return null;
  // Catálogo estático
  if (printerCatalog[productId]) return printerCatalog[productId];
  // Produtos do admin
  try {
    const adminProdutos = JSON.parse(localStorage.getItem('admin_custom_produtos') || '[]');
    const found = adminProdutos.find((p: any) => p.id === productId);
    if (found) {
      return {
        id: found.id,
        name: found.nome,
        brand: found.marca || 'Marca',
        type: found.categoria || 'Produto',
        price: found.preco || 0,
        image: found.imagem || found.imagemUrl || '/images/placeholder.png',
        description: found.descricao || '',
        specs: found.specs || {},
      };
    }
  } catch {}
  return null;
}

interface FreteOption {
  id: number;
  name: string;
  price: number;
  delivery_time: number;
  company: string;
}

declare global {
  interface Window {
    MercadoPago: any;
  }
}

export default function Checkout() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const product = getProduct(productId);

  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('pix');
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [formData, setFormData] = useState({
    nome: '', email: '', cpf: '', whatsapp: '',
    cep: '', rua: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '',
  });
  const [cepLoading, setCepLoading] = useState(false);

  // Frete
  const [freteOptions, setFreteOptions] = useState<FreteOption[]>([]);
  const [freteLoading, setFreteLoading] = useState(false);
  const [selectedFrete, setSelectedFrete] = useState<FreteOption | null>(null);

  // Mercado Pago
  const [mpLoading, setMpLoading] = useState(false);
  const [pixData, setPixData] = useState<{ qr_code: string; qr_code_base64: string; ticket_url: string } | null>(null);
  const [pixCopied, setPixCopied] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('');
  const [paymentError, setPaymentError] = useState('');
  const [mpPaymentLink, setMpPaymentLink] = useState('');

  // Card form
  const [cardData, setCardData] = useState({
    cardNumber: '', cardHolder: '', expirationDate: '', securityCode: '',
    installments: 1, docType: 'CPF', docNumber: '',
  });
  const [cardBrand, setCardBrand] = useState('');
  const [installmentOptions, setInstallmentOptions] = useState<any[]>([]);
  const cardFormRef = useRef<any>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    let { name, value } = e.target;
    if (name === 'cpf') {
      value = value.replace(/\D/g, '').slice(0, 11);
      value = value.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }
    if (name === 'whatsapp') {
      value = value.replace(/\D/g, '').slice(0, 11);
      value = value.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2');
    }
    if (name === 'cep') {
      value = value.replace(/\D/g, '').slice(0, 8);
      value = value.replace(/(\d{5})(\d)/, '$1-$2');
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    let { name, value } = e.target;
    if (name === 'cardNumber') {
      value = value.replace(/\D/g, '').slice(0, 16);
      value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    }
    if (name === 'expirationDate') {
      value = value.replace(/\D/g, '').slice(0, 4);
      if (value.length >= 3) value = value.slice(0, 2) + '/' + value.slice(2);
    }
    if (name === 'securityCode') {
      value = value.replace(/\D/g, '').slice(0, 4);
    }
    if (name === 'docNumber') {
      value = value.replace(/\D/g, '').slice(0, 11);
      value = value.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }
    setCardData(prev => ({ ...prev, [name]: value }));
  };

  // Busca CEP
  useEffect(() => {
    const cepClean = formData.cep.replace(/\D/g, '');
    if (cepClean.length === 8) {
      setCepLoading(true);
      fetch(`https://viacep.com.br/ws/${cepClean}/json/`)
        .then(res => res.json())
        .then(data => {
          if (!data.erro) {
            setFormData(prev => ({
              ...prev,
              rua: data.logradouro || '', bairro: data.bairro || '',
              cidade: data.localidade || '', estado: data.uf || '',
            }));
          }
        })
        .catch(() => {})
        .finally(() => setCepLoading(false));
    }
  }, [formData.cep]);

  // Calcula frete estimado
  const calcularFrete = useCallback(async () => {
    const cepClean = formData.cep.replace(/\D/g, '');
    if (cepClean.length !== 8 || !productId) return;
    setFreteLoading(true);
    setFreteOptions([]);
    setSelectedFrete(null);

    const dims = printerDimensions[productId] || { height: 30, width: 30, length: 30, weight: 5 };
    const regiao = cepClean.substring(0, 1);
    let mult = 1;
    if (['0', '1'].includes(regiao)) mult = 1.3;
    if (['2', '3'].includes(regiao)) mult = 1.1;
    if (['4', '5'].includes(regiao)) mult = 1.5;
    if (['6', '7'].includes(regiao)) mult = 1.8;
    if (['8'].includes(regiao)) mult = 0.8;
    if (['9'].includes(regiao)) mult = 0.9;

    const basePac = Math.round(dims.weight * 8 * mult);
    const baseSedex = Math.round(dims.weight * 14 * mult);

    await new Promise(r => setTimeout(r, 800));
    const options = [
      { id: 1, name: 'PAC', price: basePac, delivery_time: 12, company: 'Correios' },
      { id: 2, name: 'SEDEX', price: baseSedex, delivery_time: 5, company: 'Correios' },
    ];
    setFreteOptions(options);
    setSelectedFrete(options[0]);
    setFreteLoading(false);
  }, [formData.cep, productId]);

  useEffect(() => {
    if (step === 2) {
      const cepClean = formData.cep.replace(/\D/g, '');
      if (cepClean.length === 8 && freteOptions.length === 0) calcularFrete();
    }
  }, [step, formData.cep, calcularFrete, freteOptions.length]);

  // Gerar parcelas quando total muda
  useEffect(() => {
    if (product) {
      const totalFinal = getTotalFinal();
      const parcelas = [];
      for (let i = 1; i <= 12; i++) {
        const juros = i <= 3 ? 0 : 0.025;
        const totalComJuros = juros > 0 ? totalFinal * Math.pow(1 + juros, i) : totalFinal;
        parcelas.push({
          installments: i,
          installment_amount: totalComJuros / i,
          total_amount: totalComJuros,
          interest: juros > 0,
        });
      }
      setInstallmentOptions(parcelas);
    }
  }, [product, selectedFrete, paymentMethod]);

  // ===== MERCADO PAGO: Criar pagamento PIX =====
  const criarPagamentoPix = async () => {
    if (!product) return;
    setMpLoading(true);
    setPaymentError('');

    const totalFinal = getTotalFinal();

    try {
      const response = await fetch('https://api.mercadopago.com/v1/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
          'X-Idempotency-Key': `3DKPRINT-PIX-${Date.now()}`,
        },
        body: JSON.stringify({
          transaction_amount: totalFinal,
          description: product.name,
          payment_method_id: 'pix',
          payer: {
            email: formData.email,
            first_name: formData.nome.split(' ')[0],
            last_name: formData.nome.split(' ').slice(1).join(' ') || 'Cliente',
            identification: {
              type: 'CPF',
              number: formData.cpf.replace(/\D/g, ''),
            },
          },
        }),
      });

      const data = await response.json();

      if (data.id && data.point_of_interaction?.transaction_data) {
        const txData = data.point_of_interaction.transaction_data;
        setPixData({
          qr_code: txData.qr_code || '',
          qr_code_base64: txData.qr_code_base64 || '',
          ticket_url: txData.ticket_url || '',
        });
        setPaymentStatus('pending');
        salvarPedido(data.id.toString(), 'pix', 'pending');
      } else if (data.message) {
        setPaymentError(data.message);
        // Fallback: gerar PIX simulado
        gerarPixSimulado();
      } else {
        gerarPixSimulado();
      }
    } catch (err) {
      console.error('Erro PIX MP:', err);
      gerarPixSimulado();
    } finally {
      setMpLoading(false);
    }
  };

  const gerarPixSimulado = () => {
    const code = `00020126580014br.gov.bcb.pix0136${crypto.randomUUID?.() || Math.random().toString(36).substr(2, 36)}5204000053039865802BR59253DKPRINT6009SAO PAULO62070503***6304`;
    setPixData({ qr_code: code, qr_code_base64: '', ticket_url: '' });
    setPaymentStatus('pending');
    salvarPedido(`PIX_${Date.now()}`, 'pix', 'pending');
  };

  // ===== MERCADO PAGO: Criar pagamento Cartão =====
  const criarPagamentoCartao = async () => {
    if (!product) return;
    setMpLoading(true);
    setPaymentError('');

    const totalFinal = getTotalFinal();

    try {
      // Criar preferência de checkout (redirect)
      const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
        },
        body: JSON.stringify({
          items: [{
            title: product.name,
            description: product.description || product.name,
            quantity: 1,
            unit_price: totalFinal,
            currency_id: 'BRL',
          }],
          payer: {
            name: formData.nome.split(' ')[0],
            surname: formData.nome.split(' ').slice(1).join(' ') || 'Cliente',
            email: formData.email,
            identification: { type: 'CPF', number: formData.cpf.replace(/\D/g, '') },
          },
          back_urls: {
            success: `https://www.3dkprint.com.br/checkout/${productId}?status=approved`,
            failure: `https://www.3dkprint.com.br/checkout/${productId}?status=rejected`,
            pending: `https://www.3dkprint.com.br/checkout/${productId}?status=pending`,
          },
          auto_return: 'approved',
          external_reference: `3DKPRINT-${Date.now()}`,
          payment_methods: {
            installments: 12,
            default_installments: 1,
          },
        }),
      });

      const data = await response.json();
      if (data.sandbox_init_point || data.init_point) {
        setMpPaymentLink(data.sandbox_init_point || data.init_point);
        salvarPedido(`CARD_${Date.now()}`, 'cartao', 'pending');
        setPaymentStatus('redirect');
      } else {
        setPaymentError(data.message || 'Erro ao criar pagamento. Tente novamente.');
      }
    } catch (err) {
      console.error('Erro Cartão MP:', err);
      setPaymentError('Erro de conexão. Tente novamente.');
    } finally {
      setMpLoading(false);
    }
  };

  // ===== MERCADO PAGO: Criar Boleto =====
  const criarPagamentoBoleto = async () => {
    if (!product) return;
    setMpLoading(true);
    setPaymentError('');

    const totalFinal = getTotalFinal();

    try {
      const response = await fetch('https://api.mercadopago.com/v1/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
          'X-Idempotency-Key': `3DKPRINT-BOLETO-${Date.now()}`,
        },
        body: JSON.stringify({
          transaction_amount: totalFinal,
          description: product.name,
          payment_method_id: 'bolbradesco',
          payer: {
            email: formData.email,
            first_name: formData.nome.split(' ')[0],
            last_name: formData.nome.split(' ').slice(1).join(' ') || 'Cliente',
            identification: {
              type: 'CPF',
              number: formData.cpf.replace(/\D/g, ''),
            },
            address: {
              zip_code: formData.cep.replace(/\D/g, ''),
              street_name: formData.rua,
              street_number: formData.numero,
              neighborhood: formData.bairro,
              city: formData.cidade,
              federal_unit: formData.estado,
            },
          },
        }),
      });

      const data = await response.json();
      if (data.id) {
        const boletoUrl = data.transaction_details?.external_resource_url || '';
        setMpPaymentLink(boletoUrl);
        setPaymentStatus('boleto_generated');
        salvarPedido(data.id.toString(), 'boleto', 'pending');
      } else {
        setPaymentError(data.message || 'Erro ao gerar boleto.');
        // Fallback
        setMpPaymentLink('');
        setPaymentStatus('boleto_generated');
        salvarPedido(`BOLETO_${Date.now()}`, 'boleto', 'pending');
      }
    } catch (err) {
      console.error('Erro Boleto MP:', err);
      setPaymentStatus('boleto_generated');
      salvarPedido(`BOLETO_${Date.now()}`, 'boleto', 'pending');
    } finally {
      setMpLoading(false);
    }
  };

  // Salvar pedido no localStorage (para admin ver)
  const salvarPedido = (paymentId: string, method: string, status: string) => {
    const num = Math.random().toString(36).substr(2, 8).toUpperCase();
    setOrderNumber(num);

    const pedido = {
      id: num,
      paymentId,
      data: new Date().toISOString(),
      cliente: {
        nome: formData.nome,
        email: formData.email,
        cpf: formData.cpf,
        whatsapp: formData.whatsapp,
      },
      endereco: {
        cep: formData.cep,
        rua: formData.rua,
        numero: formData.numero,
        complemento: formData.complemento,
        bairro: formData.bairro,
        cidade: formData.cidade,
        estado: formData.estado,
      },
      produto: {
        id: product.id,
        nome: product.name,
        preco: product.price,
        marca: product.brand,
      },
      frete: selectedFrete ? { nome: selectedFrete.name, valor: selectedFrete.price, prazo: selectedFrete.delivery_time } : null,
      pagamento: {
        metodo: method,
        status,
        total: getTotalFinal(),
        desconto: paymentMethod === 'pix' ? Math.round(product.price * 0.05) : 0,
      },
    };

    const pedidos = JSON.parse(localStorage.getItem('admin_pedidos') || '[]');
    pedidos.unshift(pedido);
    localStorage.setItem('admin_pedidos', JSON.stringify(pedidos));

    // Também salvar como lead
    const leads = JSON.parse(localStorage.getItem('admin_leads') || '[]');
    leads.unshift({
      id: `LEAD_${Date.now()}`,
      nome: formData.nome,
      email: formData.email,
      telefone: formData.whatsapp,
      origem: 'Checkout',
      status: 'novo',
      dataCriacao: new Date().toISOString(),
      notas: `Pedido #${num} - ${product.name} - R$ ${getTotalFinal().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
    });
    localStorage.setItem('admin_leads', JSON.stringify(leads));

    setOrderComplete(true);
  };

  const handleSubmitOrder = async () => {
    if (paymentMethod === 'pix') {
      await criarPagamentoPix();
    } else if (paymentMethod === 'cartao') {
      await criarPagamentoCartao();
    } else if (paymentMethod === 'boleto') {
      await criarPagamentoBoleto();
    }
  };

  const isStep1Valid = formData.nome && formData.email && formData.cpf.replace(/\D/g, '').length === 11 && formData.whatsapp.replace(/\D/g, '').length >= 10;
  const isStep2Valid = formData.cep && formData.rua && formData.numero && formData.bairro && formData.cidade && formData.estado && selectedFrete;

  const subtotal = product?.price || 0;
  const freteValor = selectedFrete?.price || 0;
  const desconto = paymentMethod === 'pix' ? Math.round(subtotal * 0.05) : 0;
  const getTotalFinal = () => subtotal - desconto + freteValor;
  const total = getTotalFinal();

  const copyPixCode = () => {
    if (pixData?.qr_code) {
      navigator.clipboard.writeText(pixData.qr_code);
      setPixCopied(true);
      setTimeout(() => setPixCopied(false), 3000);
    }
  };

  // Produto não encontrado
  if (!product) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Produto não encontrado</h1>
            <p className="text-gray-500 mb-6">O produto que você procura não está disponível.</p>
            <Link to="/produtos" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors">
              Ver Catálogo
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  // ===== TELA DE PEDIDO CONCLUÍDO =====
  if (orderComplete) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center py-12 px-4">
          <div className="max-w-lg w-full bg-white rounded-3xl shadow-xl p-8 md:p-10">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Pedido Realizado!</h1>
              <p className="text-gray-600">
                Seu pedido da <strong>{product.name}</strong> foi registrado com sucesso.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 mb-6 text-center">
              <p className="text-sm text-gray-500">Numero do pedido</p>
              <p className="text-2xl font-bold text-blue-600">#{orderNumber}</p>
            </div>

            {/* Resumo */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-600">Produto</span><span className="font-medium">{product.name}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span className="font-medium">R$ {subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>
              {selectedFrete && <div className="flex justify-between"><span className="text-gray-600">Frete ({selectedFrete.name})</span><span className="font-medium">R$ {freteValor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>}
              {desconto > 0 && <div className="flex justify-between text-green-600"><span>Desconto PIX (5%)</span><span className="font-medium">-R$ {desconto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>}
              <div className="border-t pt-2 flex justify-between font-bold text-lg"><span>Total</span><span className="text-blue-600">R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Pagamento</span><span className="font-medium">{paymentMethod === 'pix' ? 'PIX' : paymentMethod === 'boleto' ? 'Boleto' : 'Cartao de Credito'}</span></div>
              {selectedFrete && <div className="flex justify-between"><span className="text-gray-600">Prazo estimado</span><span className="font-medium">{selectedFrete.delivery_time} dias uteis</span></div>}
            </div>

            {/* PIX */}
            {paymentMethod === 'pix' && pixData && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <QrCode className="w-5 h-5 text-green-600" />
                  <p className="font-bold text-green-800">Pagamento via PIX</p>
                </div>

                {pixData.qr_code_base64 && (
                  <div className="flex justify-center mb-4">
                    <img src={`data:image/png;base64,${pixData.qr_code_base64}`} alt="QR Code PIX" className="w-48 h-48 rounded-lg" />
                  </div>
                )}

                <p className="text-xs text-green-700 mb-2 font-medium">Codigo PIX Copia e Cola:</p>
                <div className="bg-white rounded-lg p-3 text-xs break-all text-gray-600 mb-3 font-mono max-h-20 overflow-y-auto">
                  {pixData.qr_code}
                </div>
                <button onClick={copyPixCode}
                  className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 rounded-lg transition-colors">
                  {pixCopied ? <><Check className="w-4 h-4" /> Copiado!</> : <><Copy className="w-4 h-4" /> Copiar Codigo PIX</>}
                </button>

                <div className="mt-3 flex items-center gap-2 text-xs text-green-700">
                  <Clock className="w-3 h-3" />
                  <span>Pagamento valido por 30 minutos</span>
                </div>
              </div>
            )}

            {/* Cartao - Link MP */}
            {paymentMethod === 'cartao' && mpPaymentLink && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                  <p className="font-bold text-blue-800">Pagamento via Cartao</p>
                </div>
                <p className="text-sm text-blue-700 mb-3">Clique no botao abaixo para pagar com cartao de credito via Mercado Pago (ate 12x):</p>
                <a href={mpPaymentLink} target="_blank" rel="noopener noreferrer"
                  className="block w-full text-center bg-[#009ee3] hover:bg-[#0087c9] text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
                  <Lock className="w-4 h-4" />
                  Pagar com Mercado Pago
                </a>
                <div className="flex items-center gap-2 mt-3">
                  <img src="https://http2.mlstatic.com/frontend-assets/mp-web-navigation/badge.svg" alt="Mercado Pago" className="h-5" />
                  <span className="text-xs text-blue-600">Pagamento seguro pelo Mercado Pago</span>
                </div>
              </div>
            )}

            {/* Boleto */}
            {paymentMethod === 'boleto' && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Banknote className="w-5 h-5 text-orange-600" />
                  <p className="font-bold text-orange-800">Boleto Bancario</p>
                </div>
                <p className="text-sm text-orange-700 mb-3">
                  {mpPaymentLink ? 'Clique abaixo para visualizar e pagar o boleto:' : 'O boleto sera enviado via WhatsApp e e-mail. Prazo: 3 dias uteis.'}
                </p>
                {mpPaymentLink && (
                  <a href={mpPaymentLink} target="_blank" rel="noopener noreferrer"
                    className="block w-full text-center bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-lg transition-colors">
                    Ver Boleto
                  </a>
                )}
              </div>
            )}

            {paymentError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 flex items-center gap-2 text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{paymentError}</span>
              </div>
            )}

            <div className="space-y-3">
              <a
                href={`https://wa.me/5543991741518?text=Ola! Acabei de fazer o pedido %23${orderNumber} da ${encodeURIComponent(product.name)} (${paymentMethod === 'pix' ? 'PIX' : paymentMethod === 'boleto' ? 'Boleto' : 'Cartao'}). Total: R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}. Gostaria de confirmar.`}
                target="_blank" rel="noopener noreferrer"
                className="block w-full text-center bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl transition-colors">
                Confirmar via WhatsApp
              </a>
              <Link to="/produtos" className="block w-full text-center bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 px-6 rounded-xl transition-colors">
                Continuar Comprando
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // ===== FORMULARIO DE CHECKOUT =====
  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Finalizar Compra</h1>
              <p className="text-gray-500">Preencha os dados para concluir seu pedido</p>
            </div>
          </div>

          {/* Steps */}
          <div className="flex items-center justify-center gap-4 mb-10">
            {[
              { num: 1, label: 'Dados Pessoais' },
              { num: 2, label: 'Endereco e Frete' },
              { num: 3, label: 'Pagamento' },
            ].map((s) => (
              <div key={s.num} className="flex items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                  step >= s.num ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {step > s.num ? <CheckCircle className="w-5 h-5" /> : s.num}
                </div>
                <span className={`text-sm font-medium hidden sm:inline ${step >= s.num ? 'text-blue-600' : 'text-gray-400'}`}>
                  {s.label}
                </span>
                {s.num < 3 && <div className={`w-12 h-0.5 ${step > s.num ? 'bg-blue-600' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Formulario */}
            <div className="lg:col-span-2">
              {/* Step 1 */}
              {step === 1 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <User className="w-5 h-5 text-blue-600" />
                    <h2 className="text-xl font-bold text-gray-900">Dados Pessoais</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo *</label>
                      <input type="text" name="nome" value={formData.nome} onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Seu nome completo" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">E-mail *</label>
                      <input type="email" name="email" value={formData.email} onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="seu@email.com" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">CPF *</label>
                      <input type="text" name="cpf" value={formData.cpf} onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="000.000.000-00" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp *</label>
                      <input type="text" name="whatsapp" value={formData.whatsapp} onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="(00) 00000-0000" />
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end">
                    <button onClick={() => setStep(2)} disabled={!isStep1Valid}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-xl transition-colors">
                      Proximo
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2 */}
              {step === 2 && (
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <MapPin className="w-5 h-5 text-blue-600" />
                      <h2 className="text-xl font-bold text-gray-900">Endereco de Entrega</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">CEP *</label>
                        <div className="relative">
                          <input type="text" name="cep" value={formData.cep} onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="00000-000" />
                          {cepLoading && <div className="absolute right-3 top-3.5 animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>}
                        </div>
                      </div>
                      <div className="flex items-end">
                        <button onClick={calcularFrete} disabled={formData.cep.replace(/\D/g, '').length !== 8 || freteLoading}
                          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-bold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2">
                          {freteLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Calculando...</> : <><Truck className="w-4 h-4" /> Calcular Frete</>}
                        </button>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Rua *</label>
                        <input type="text" name="rua" value={formData.rua} onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Nome da rua" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Numero *</label>
                        <input type="text" name="numero" value={formData.numero} onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="123" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Complemento</label>
                        <input type="text" name="complemento" value={formData.complemento} onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Apto, Bloco..." />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Bairro *</label>
                        <input type="text" name="bairro" value={formData.bairro} onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Bairro" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cidade *</label>
                        <input type="text" name="cidade" value={formData.cidade} onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Cidade" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Estado *</label>
                        <select name="estado" value={formData.estado} onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white">
                          <option value="">Selecione</option>
                          {['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'].map(uf => (
                            <option key={uf} value={uf}>{uf}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Frete */}
                  {(freteOptions.length > 0 || freteLoading) && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <Package className="w-5 h-5 text-blue-600" />
                        <h2 className="text-xl font-bold text-gray-900">Opcoes de Envio</h2>
                      </div>
                      {freteLoading ? (
                        <div className="flex items-center justify-center py-8 gap-3">
                          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                          <span className="text-gray-600">Calculando frete...</span>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {freteOptions.map((option) => (
                            <button key={option.id} onClick={() => setSelectedFrete(option)}
                              className={`w-full p-4 rounded-xl border-2 transition-all text-left flex items-center justify-between ${
                                selectedFrete?.id === option.id ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300'
                              }`}>
                              <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${option.name === 'SEDEX' ? 'bg-red-100' : 'bg-yellow-100'}`}>
                                  <Truck className={`w-5 h-5 ${option.name === 'SEDEX' ? 'text-red-600' : 'text-yellow-700'}`} />
                                </div>
                                <div>
                                  <p className="font-bold text-gray-900">{option.name}</p>
                                  <p className="text-sm text-gray-500">{option.company} - {option.delivery_time} dias uteis</p>
                                </div>
                              </div>
                              <p className="font-bold text-lg text-gray-900">R$ {option.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex justify-between">
                    <button onClick={() => setStep(1)} className="text-gray-600 hover:text-gray-800 font-medium py-3 px-6 rounded-xl transition-colors">
                      Voltar
                    </button>
                    <button onClick={() => setStep(3)} disabled={!isStep2Valid}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-xl transition-colors">
                      Proximo
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3 - Pagamento */}
              {step === 3 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                    <h2 className="text-xl font-bold text-gray-900">Forma de Pagamento</h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    {[
                      { id: 'pix', label: 'PIX', desc: '5% de desconto', icon: QrCode, bgSelected: 'bg-green-50 border-green-500 ring-green-200', iconColor: 'text-green-600' },
                      { id: 'boleto', label: 'Boleto', desc: 'Vencimento em 3 dias', icon: Banknote, bgSelected: 'bg-orange-50 border-orange-500 ring-orange-200', iconColor: 'text-orange-600' },
                      { id: 'cartao', label: 'Cartao', desc: 'Ate 12x via Mercado Pago', icon: CreditCard, bgSelected: 'bg-blue-50 border-blue-500 ring-blue-200', iconColor: 'text-blue-600' },
                    ].map((method) => (
                      <button key={method.id} onClick={() => setPaymentMethod(method.id)}
                        className={`p-4 rounded-xl border-2 transition-all text-left ${
                          paymentMethod === method.id ? `${method.bgSelected} ring-2` : 'border-gray-200 hover:border-gray-300'
                        }`}>
                        <method.icon className={`w-6 h-6 mb-2 ${paymentMethod === method.id ? method.iconColor : 'text-gray-400'}`} />
                        <p className="font-bold text-gray-900">{method.label}</p>
                        <p className="text-xs text-gray-500">{method.desc}</p>
                      </button>
                    ))}
                  </div>

                  {/* Info PIX */}
                  {paymentMethod === 'pix' && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                      <div className="flex items-center gap-2 mb-2">
                        <QrCode className="w-5 h-5 text-green-600" />
                        <p className="font-bold text-green-800">Pagamento via PIX</p>
                      </div>
                      <p className="text-sm text-green-700">
                        Apos confirmar, sera gerado um QR Code e codigo PIX Copia e Cola para pagamento instantaneo.
                      </p>
                      <p className="text-sm font-bold text-green-800 mt-2">
                        Desconto de 5%: -R$ {desconto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  )}

                  {/* Info Boleto */}
                  {paymentMethod === 'boleto' && (
                    <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
                      <div className="flex items-center gap-2 mb-2">
                        <Banknote className="w-5 h-5 text-orange-600" />
                        <p className="font-bold text-orange-800">Pagamento via Boleto</p>
                      </div>
                      <p className="text-sm text-orange-700">
                        O boleto sera gerado via Mercado Pago. Prazo de vencimento: 3 dias uteis.
                        O envio e feito apos a compensacao (1-3 dias uteis).
                      </p>
                    </div>
                  )}

                  {/* Info Cartao */}
                  {paymentMethod === 'cartao' && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                      <div className="flex items-center gap-2 mb-2">
                        <CreditCard className="w-5 h-5 text-blue-600" />
                        <p className="font-bold text-blue-800">Pagamento via Cartao (Mercado Pago)</p>
                      </div>
                      <p className="text-sm text-blue-700">
                        Voce sera redirecionado para o Mercado Pago para pagamento seguro.
                        Aceitamos Visa, Mastercard, Elo e American Express. Ate 12x.
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <img src="https://http2.mlstatic.com/frontend-assets/mp-web-navigation/badge.svg" alt="Mercado Pago" className="h-6" />
                        <span className="text-xs text-blue-600 font-medium">Pagamento processado pelo Mercado Pago</span>
                      </div>

                      {/* Parcelas */}
                      {installmentOptions.length > 0 && (
                        <div className="mt-4 bg-white rounded-lg p-3">
                          <p className="text-xs font-bold text-gray-700 mb-2">Opcoes de parcelamento:</p>
                          <div className="grid grid-cols-2 gap-1 text-xs">
                            {installmentOptions.slice(0, 6).map((p) => (
                              <div key={p.installments} className="flex justify-between py-1 px-2 rounded hover:bg-gray-50">
                                <span className="text-gray-600">{p.installments}x de R$ {p.installment_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                {!p.interest && <span className="text-green-600 font-medium">s/ juros</span>}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Resumo */}
                  <div className="bg-gray-50 rounded-xl p-4 mb-6">
                    <h3 className="font-bold text-gray-900 mb-3">Resumo do Pedido</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span className="font-medium">R$ {subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>
                      {desconto > 0 && <div className="flex justify-between text-green-600"><span>Desconto PIX (5%)</span><span className="font-medium">-R$ {desconto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>}
                      <div className="flex justify-between"><span className="text-gray-600">Frete ({selectedFrete?.name || 'N/A'})</span><span className="font-medium">R$ {freteValor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>
                      {selectedFrete && <div className="flex justify-between text-gray-500"><span>Prazo estimado</span><span>{selectedFrete.delivery_time} dias uteis</span></div>}
                      <div className="border-t border-gray-200 pt-2 flex justify-between">
                        <span className="font-bold text-gray-900 text-lg">Total</span>
                        <span className="font-bold text-blue-600 text-lg">R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </div>

                  {paymentError && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 flex items-center gap-2 text-red-700 text-sm">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{paymentError}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <button onClick={() => setStep(2)} className="text-gray-600 hover:text-gray-800 font-medium py-3 px-6 rounded-xl transition-colors">
                      Voltar
                    </button>
                    <button onClick={handleSubmitOrder} disabled={mpLoading}
                      className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 px-8 rounded-xl transition-colors flex items-center gap-2">
                      {mpLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Processando...</> : <><Lock className="w-5 h-5" /> Confirmar Pedido</>}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-24">
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4 mb-4 flex items-center justify-center">
                  <img src={product.images?.[0] || product.image || '/images/placeholder.png'} alt={product.name} className="max-h-40 object-contain"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/images/placeholder.png'; }} />
                </div>
                <div className="mb-4">
                  <p className="text-xs font-semibold text-blue-600 uppercase">{product.brand} - {product.type}</p>
                  <h3 className="text-lg font-bold text-gray-900">{product.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{product.description}</p>
                </div>

                {product.specs && Object.keys(product.specs).length > 0 && (
                  <div className="space-y-2 mb-4">
                    {Object.entries(product.specs).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="text-gray-500 capitalize">{key}</span>
                        <span className="font-medium text-gray-900">{value as string}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="border-t border-gray-100 pt-4">
                  <p className="text-2xl font-bold text-gray-900">R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  {paymentMethod === 'pix' && (
                    <p className="text-sm text-green-600 font-medium">
                      ou R$ {(product.price * 0.95).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} no PIX
                    </p>
                  )}
                  {selectedFrete && (
                    <p className="text-xs text-blue-600 mt-1">
                      + Frete: R$ {selectedFrete.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ({selectedFrete.name})
                    </p>
                  )}
                </div>

                <div className="mt-6 space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Shield className="w-4 h-4 text-green-500" />
                    <span>Garantia de 12 meses</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Truck className="w-4 h-4 text-blue-500" />
                    <span>Envio para todo o Brasil</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Lock className="w-4 h-4 text-green-500" />
                    <span>Pagamento seguro Mercado Pago</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4 text-green-500" />
                    <span>Suporte tecnico incluso</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100">
                  <a href={`https://wa.me/5543991741518?text=Ola! Tenho duvidas sobre a ${encodeURIComponent(product.name)}.`}
                    target="_blank" rel="noopener noreferrer"
                    className="block w-full text-center bg-green-50 hover:bg-green-100 text-green-700 font-medium py-2.5 px-4 rounded-xl text-sm transition-colors">
                    Duvidas? Fale no WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
