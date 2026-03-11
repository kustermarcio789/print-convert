import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShoppingCart, Trash2, Plus, Minus, CreditCard, Truck, Shield,
  ArrowLeft, ArrowRight, Lock, CheckCircle
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { items, removeItem, updateQuantity, clearCart, totalPrice } = useCart();
  const [step, setStep] = useState(1);
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
  const [loading, setLoading] = useState(false);

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

  const handleSubmitOrder = async () => {
    setLoading(true);
    // Simular processamento do pedido
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    clearCart();
    toast({
      title: 'Pedido realizado com sucesso!',
      description: 'Você receberá um email com os detalhes do pedido.',
    });
    navigate('/');
    setLoading(false);
  };

  const shippingCost = totalPrice >= 500 ? 0 : 49.90;
  const finalTotal = totalPrice + shippingCost;

  if (items.length === 0) {
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
            <p className="text-muted-foreground">Revise seus itens e complete o pedido</p>
          </motion.div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            {[
              { num: 1, label: 'Carrinho' },
              { num: 2, label: 'Dados' },
              { num: 3, label: 'Pagamento' },
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
                {idx < 2 && (
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
                        placeholder="Nome Completo"
                        value={formData.nome}
                        onChange={handleInputChange}
                      />
                      <Input
                        name="email"
                        type="email"
                        placeholder="E-mail"
                        value={formData.email}
                        onChange={handleInputChange}
                      />
                      <Input
                        name="telefone"
                        placeholder="Telefone"
                        value={formData.telefone}
                        onChange={handleInputChange}
                      />
                      <Input
                        name="cpf"
                        placeholder="CPF"
                        value={formData.cpf}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="bg-background border border-border rounded-xl p-6">
                    <h3 className="text-lg font-bold text-foreground mb-4">Endereço de Entrega</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex gap-2">
                        <Input
                          name="cep"
                          placeholder="CEP"
                          value={formData.cep}
                          onChange={handleInputChange}
                          onBlur={handleCepSearch}
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
                    <Button onClick={() => setStep(3)}>
                      Próximo Passo
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Payment */}
              {step === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div className="bg-background border border-border rounded-xl p-6">
                    <h3 className="text-lg font-bold text-foreground mb-4">Forma de Pagamento</h3>
                    <div className="space-y-4">
                      <label className="flex items-center gap-4 p-4 border border-border rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                        <input type="radio" name="payment" defaultChecked className="w-4 h-4 text-blue-500" />
                        <CreditCard className="w-6 h-6 text-muted-foreground" />
                        <div>
                          <p className="font-semibold text-foreground">Cartão de Crédito</p>
                          <p className="text-sm text-muted-foreground">Em até 12x sem juros</p>
                        </div>
                      </label>
                      <label className="flex items-center gap-4 p-4 border border-border rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                        <input type="radio" name="payment" className="w-4 h-4 text-blue-500" />
                        <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center text-white text-xs font-bold">
                          PIX
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">PIX</p>
                          <p className="text-sm text-muted-foreground">5% de desconto</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button variant="outline" onClick={() => setStep(2)}>
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Voltar
                    </Button>
                    <Button
                      onClick={handleSubmitOrder}
                      disabled={loading}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Processando...
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4 mr-2" />
                          Finalizar Pedido
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Order Summary */}
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
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
