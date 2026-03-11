import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShoppingCart, Trash2, Plus, Minus, CreditCard, Truck, Shield,
  ArrowLeft, ArrowRight, Lock, CheckCircle, Loader2
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { Payment, StatusScreen } from '@mercadopago/sdk-react';
import { useMercadoPago } from '@/contexts/MercadoPagoContext';

// Token de acesso para backend (em produção, isso deve estar no backend)
const MERCADO_PAGO_ACCESS_TOKEN = 'TEST-6480666910248677-031103-adea33b15ed2df02bd73893bd9cdec48-287681490';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { items, removeItem, updateQuantity, clearCart, totalPrice } = useCart();
  const { isReady: mpReady } = useMercadoPago();
  const [step, setStep] = useState(1);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [preferenceId, setPreferenceId] = useState<string | null>(null);
  const [loadingPreference, setLoadingPreference] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    cpf: '',
    cep: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
  });

  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCepSearch = async () => {
    const cep = formData.cep.replace(/\D/g, '');
    if (cep.length !== 8) return;

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();
      if (!data.erro) {
        setFormData(prev => ({
          ...prev,
          endereco: data.logradouro,
          bairro: data.bairro,
          cidade: data.localidade,
          estado: data.uf,
        }));
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
    }
  };

  // Criar preferência de pagamento no Mercado Pago
  const createPreference = async () => {
    setLoadingPreference(true);
    try {
      // Em produção, essa chamada deve ser feita para seu backend
      // Por questões de segurança, o access_token não deve estar no frontend
      const preference = {
        items: items.map(item => ({
          id: item.id,
          title: item.name,
          description: `${item.brand || '3DKPRINT'} - ${item.name}`,
          picture_url: item.image,
          category_id: 'electronics',
          quantity: item.quantity,
          currency_id: 'BRL',
          unit_price: item.price,
        })),
        payer: {
          name: formData.nome.split(' ')[0],
          surname: formData.nome.split(' ').slice(1).join(' ') || 'Cliente',
          email: formData.email || 'cliente@3dkprint.com.br',
          phone: {
            area_code: formData.telefone?.substring(1, 3) || '11',
            number: formData.telefone?.replace(/\D/g, '').substring(2) || '999999999',
          },
          identification: {
            type: 'CPF',
            number: formData.cpf?.replace(/\D/g, '') || '00000000000',
          },
          address: {
            zip_code: formData.cep?.replace(/\D/g, '') || '00000000',
            street_name: formData.endereco || 'Rua não informada',
            street_number: parseInt(formData.numero) || 0,
          },
        },
        back_urls: {
          success: `${window.location.origin}/checkout/success`,
          failure: `${window.location.origin}/checkout/failure`,
          pending: `${window.location.origin}/checkout/pending`,
        },
        auto_return: 'approved',
        statement_descriptor: '3DKPRINT',
        external_reference: `order_${Date.now()}`,
      };

      // Criar preferência via API do Mercado Pago
      const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${MERCADO_PAGO_ACCESS_TOKEN}`,
        },
        body: JSON.stringify(preference),
      });

      if (!response.ok) {
        throw new Error('Erro ao criar preferência');
      }

      const data = await response.json();
      setPreferenceId(data.id);
      console.log('Preferência criada:', data.id);
      return data.id;
    } catch (error) {
      console.error('Erro ao criar preferência:', error);
      toast({
        title: 'Erro ao processar pagamento',
        description: 'Não foi possível iniciar o pagamento. Tente novamente.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoadingPreference(false);
    }
  };

  const handleGoToPayment = async () => {
    const prefId = await createPreference();
    if (prefId) {
      setStep(3);
    }
  };

  const handlePaymentSuccess = (payment: any) => {
    console.log('Pagamento realizado:', payment);
    setPaymentId(payment.id);
    clearCart();
    toast({
      title: 'Pagamento realizado com sucesso!',
      description: `ID do pagamento: ${payment.id}`,
    });
    setStep(4);
  };

  const handlePaymentError = (error: any) => {
    console.error('Erro no pagamento:', error);
    toast({
      title: 'Erro no pagamento',
      description: 'Verifique os dados do cartão e tente novamente.',
      variant: 'destructive',
    });
  };

  const shippingCost = totalPrice >= 500 ? 0 : 49.90;
  const finalTotal = totalPrice + shippingCost;

  if (items.length === 0 && step !== 4) {
    return (
      <Layout>
        <section className="section-padding bg-background">
          <div className="container-custom text-center py-16">
            <ShoppingCart className="w-24 h-24 text-muted-foreground mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-foreground mb-4">Seu carrinho está vazio</h1>
            <p className="text-muted-foreground mb-8">Adicione produtos ao carrinho para continuar com a compra.</p>
            <Button onClick={() => navigate('/produtos')} size="lg">
              <ArrowLeft className="mr-2 w-5 h-5" />
              Ver Produtos
            </Button>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="section-padding bg-background">
        <div className="container-custom">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-foreground mb-2">Finalizar Compra</h1>
            <p className="text-muted-foreground">Pagamento seguro via Mercado Pago</p>
          </motion.div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            {[
              { num: 1, label: 'Carrinho' },
              { num: 2, label: 'Dados' },
              { num: 3, label: 'Pagamento' },
              { num: 4, label: 'Confirmação' },
            ].map((s, idx) => (
              <div key={s.num} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${
                    step >= s.num
                      ? 'bg-blue-500 text-white'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {step > s.num ? <CheckCircle className="w-5 h-5" /> : s.num}
                </div>
                <span className={`ml-2 text-sm font-medium ${step >= s.num ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {s.label}
                </span>
                {idx < 3 && (
                  <div className={`w-16 h-1 mx-4 rounded ${step > s.num ? 'bg-blue-500' : 'bg-muted'}`} />
                )}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Step 1: Cart Items */}
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 p-4 bg-background border border-border rounded-xl"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-24 h-24 object-contain bg-muted rounded-lg"
                      />
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground">{item.brand}</p>
                        <h3 className="font-semibold text-foreground">{item.name}</h3>
                        <p className="text-lg font-bold text-green-600">{formatPrice(item.price)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="w-8 text-center font-bold">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(item.id)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex justify-between pt-4">
                    <Button variant="outline" onClick={() => navigate('/produtos')}>
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Continuar Comprando
                    </Button>
                    <Button onClick={() => setStep(2)}>
                      Próximo Passo
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Customer Data */}
              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div className="bg-background border border-border rounded-xl p-6">
                    <h3 className="text-lg font-bold text-foreground mb-4">Dados Pessoais</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        name="nome"
                        placeholder="Nome Completo *"
                        value={formData.nome}
                        onChange={handleInputChange}
                        required
                      />
                      <Input
                        name="email"
                        type="email"
                        placeholder="E-mail *"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                      <Input
                        name="telefone"
                        placeholder="Telefone"
                        value={formData.telefone}
                        onChange={handleInputChange}
                      />
                      <Input
                        name="cpf"
                        placeholder="CPF *"
                        value={formData.cpf}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="bg-background border border-border rounded-xl p-6">
                    <h3 className="text-lg font-bold text-foreground mb-4">Endereço de Entrega</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex gap-2">
                        <Input
                          name="cep"
                          placeholder="CEP *"
                          value={formData.cep}
                          onChange={handleInputChange}
                          onBlur={handleCepSearch}
                          required
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Input
                          name="endereco"
                          placeholder="Endereço"
                          value={formData.endereco}
                          onChange={handleInputChange}
                        />
                      </div>
                      <Input
                        name="numero"
                        placeholder="Número"
                        value={formData.numero}
                        onChange={handleInputChange}
                      />
                      <Input
                        name="complemento"
                        placeholder="Complemento"
                        value={formData.complemento}
                        onChange={handleInputChange}
                      />
                      <Input
                        name="bairro"
                        placeholder="Bairro"
                        value={formData.bairro}
                        onChange={handleInputChange}
                      />
                      <Input
                        name="cidade"
                        placeholder="Cidade"
                        value={formData.cidade}
                        onChange={handleInputChange}
                      />
                      <Input
                        name="estado"
                        placeholder="Estado"
                        value={formData.estado}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button variant="outline" onClick={() => setStep(1)}>
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Voltar
                    </Button>
                    <Button 
                      onClick={handleGoToPayment}
                      disabled={!formData.nome || !formData.email || !formData.cpf || loadingPreference}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {loadingPreference ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Preparando...
                        </>
                      ) : (
                        <>
                          Ir para Pagamento
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Mercado Pago Payment */}
              {step === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div className="bg-background border border-border rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-foreground">Pagamento Seguro</h3>
                      <img 
                        src="https://www.mercadopago.com/org-img/Manual/ManualMP/imgs/isologoHorizontal.png" 
                        alt="Mercado Pago" 
                        className="h-8"
                      />
                    </div>
                    
                    {mpReady && preferenceId ? (
                      <div className="min-h-[400px]">
                        <Payment
                          initialization={{
                            amount: finalTotal,
                            preferenceId: preferenceId,
                          }}
                          customization={{
                            paymentMethods: {
                              creditCard: 'all',
                              debitCard: 'all',
                              ticket: 'all',
                              bankTransfer: 'all',
                              mercadoPago: 'all',
                            },
                            visual: {
                              style: {
                                theme: 'default',
                              },
                            },
                          }}
                          onSubmit={async (param) => {
                            console.log('Processando pagamento...', param);
                            // O pagamento é processado automaticamente pelo Mercado Pago
                          }}
                          onReady={() => {
                            console.log('Payment Brick pronto');
                          }}
                          onError={(error) => {
                            console.error('Erro no Payment Brick:', error);
                            handlePaymentError(error);
                          }}
                        />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                        <span className="ml-3 text-muted-foreground">Carregando formulário de pagamento...</span>
                      </div>
                    )}

                    <p className="text-xs text-muted-foreground mt-4 text-center">
                      Seus dados estão protegidos com criptografia SSL. Pagamento processado pelo Mercado Pago.
                    </p>
                  </div>

                  <div className="flex justify-start pt-4">
                    <Button variant="outline" onClick={() => setStep(2)}>
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Voltar
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Confirmation */}
              {step === 4 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Pedido Confirmado!</h2>
                  <p className="text-muted-foreground mb-6">
                    Obrigado pela sua compra. Você receberá um email com os detalhes.
                  </p>
                  {paymentId && (
                    <p className="text-sm text-muted-foreground mb-6">
                      ID do Pagamento: <span className="font-mono font-bold">{paymentId}</span>
                    </p>
                  )}
                  <Button onClick={() => navigate('/')} size="lg">
                    Voltar à Loja
                  </Button>
                </motion.div>
              )}
            </div>

            {/* Order Summary */}
            {step !== 4 && (
              <div className="lg:col-span-1">
                <div className="bg-background border border-border rounded-xl p-6 sticky top-20">
                  <h3 className="text-lg font-bold text-foreground mb-4">Resumo do Pedido</h3>
                  
                  <div className="space-y-3 mb-4 pb-4 border-b border-border">
                    {items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {item.quantity}x {item.name.slice(0, 20)}...
                        </span>
                        <span className="font-medium text-foreground">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2 mb-4 pb-4 border-b border-border">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium text-foreground">{formatPrice(totalPrice)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Frete</span>
                      <span className={`font-medium ${shippingCost === 0 ? 'text-green-600' : 'text-foreground'}`}>
                        {shippingCost === 0 ? 'Grátis' : formatPrice(shippingCost)}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mb-6">
                    <span className="text-lg font-bold text-foreground">Total</span>
                    <span className="text-2xl font-bold text-green-600">{formatPrice(finalTotal)}</span>
                  </div>

                  {/* Mercado Pago Badge */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <img 
                        src="https://www.mercadopago.com/org-img/Manual/ManualMP/imgs/isologoHorizontal.png" 
                        alt="Mercado Pago" 
                        className="h-5"
                      />
                    </div>
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      Pague com cartão, PIX, boleto ou saldo do Mercado Pago
                    </p>
                  </div>

                  {/* Trust Badges */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Shield className="w-4 h-4 text-green-500" />
                      <span>Compra 100% segura</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Truck className="w-4 h-4 text-blue-500" />
                      <span>Entrega em todo Brasil</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Lock className="w-4 h-4 text-purple-500" />
                      <span>Dados protegidos por SSL</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
}
