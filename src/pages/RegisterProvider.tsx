import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, User, Phone, MapPin, Briefcase, FileText, Check, Store } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const serviceOptions = [
  { id: 'impressao', label: 'Impressão 3D', desc: 'FDM, SLA, SLS' },
  { id: 'modelagem', label: 'Modelagem 3D', desc: 'Fusion 360, Blender, SolidWorks' },
  { id: 'pintura', label: 'Pintura e Acabamento', desc: 'Pintura automotiva, aerografia' },
  { id: 'manutencao', label: 'Manutenção de Impressoras', desc: 'Conserto, calibração, upgrades' },
];

const benefits = [
  'Receba pedidos de clientes de todo o Brasil',
  'Pagamento seguro com retenção até a entrega',
  'Perfil profissional com avaliações',
  'Suporte dedicado ao prestador',
  'Sem mensalidade — comissão apenas sobre vendas',
  'Dashboard com métricas e relatórios',
];

export default function RegisterProvider() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cpfCnpj: '',
    city: '',
    state: '',
    password: '',
    confirmPassword: '',
    bio: '',
    experience: '',
    portfolio: '',
  });

  const toggleService = (id: string) => {
    setSelectedServices(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handleNext = () => {
    if (step === 1) {
      if (!formData.name || !formData.email || !formData.phone || !formData.password) {
        toast({ title: 'Campos obrigatórios', description: 'Preencha todos os campos marcados com *.', variant: 'destructive' });
        return;
      }
      if (formData.password.length < 6) {
        toast({ title: 'Senha muito curta', description: 'A senha deve ter pelo menos 6 caracteres.', variant: 'destructive' });
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        toast({ title: 'Senhas não conferem', description: 'A senha e a confirmação devem ser iguais.', variant: 'destructive' });
        return;
      }
    }
    if (step === 2 && selectedServices.length === 0) {
      toast({ title: 'Selecione ao menos um serviço', description: 'Escolha os serviços que você oferece.', variant: 'destructive' });
      return;
    }
    setStep(step + 1);
  };

  const handleSubmit = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: 'Cadastro enviado com sucesso!',
        description: 'Analisaremos seu perfil e entraremos em contato em até 48 horas.',
      });
      navigate('/');
    }, 2000);
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-primary py-16">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <span className="inline-block text-accent font-semibold text-sm uppercase tracking-wider mb-4">
              Cadastro de Prestador
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-6">
              Ofereça seus serviços na 3DKPRINT
            </h1>
            <p className="text-xl text-primary-foreground/80">
              Faça parte da nossa plataforma e receba pedidos de clientes de todo o Brasil. 
              Impressão 3D, modelagem, pintura e manutenção.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Form */}
            <div className="lg:col-span-2">
              {/* Progress Steps */}
              <div className="flex items-center gap-4 mb-8">
                {[1, 2, 3].map((s) => (
                  <div key={s} className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                      step >= s ? 'bg-accent text-accent-foreground' : 'bg-secondary text-muted-foreground'
                    }`}>
                      {step > s ? <Check className="w-4 h-4" /> : s}
                    </div>
                    <span className={`text-sm font-medium hidden sm:inline ${step >= s ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {s === 1 ? 'Dados pessoais' : s === 2 ? 'Serviços' : 'Perfil profissional'}
                    </span>
                    {s < 3 && <div className={`w-8 h-0.5 ${step > s ? 'bg-accent' : 'bg-border'}`} />}
                  </div>
                ))}
              </div>

              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="card-elevated p-8"
              >
                {/* Step 1: Personal Data */}
                {step === 1 && (
                  <div className="space-y-5">
                    <div className="mb-6">
                      <h2 className="text-xl font-bold text-foreground">Dados pessoais</h2>
                      <p className="text-muted-foreground text-sm">Informações básicas da sua conta</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Nome completo *</Label>
                        <div className="relative mt-1">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input id="name" placeholder="Seu nome completo" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="pl-10" required />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="email">E-mail *</Label>
                        <div className="relative mt-1">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input id="email" type="email" placeholder="seu@email.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="pl-10" required />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="phone">WhatsApp *</Label>
                        <div className="relative mt-1">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input id="phone" type="tel" placeholder="(43) 99999-9999" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="pl-10" required />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="cpfCnpj">CPF ou CNPJ</Label>
                        <div className="relative mt-1">
                          <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input id="cpfCnpj" placeholder="000.000.000-00" value={formData.cpfCnpj} onChange={(e) => setFormData({ ...formData, cpfCnpj: e.target.value })} className="pl-10" />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="city">Cidade *</Label>
                        <div className="relative mt-1">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input id="city" placeholder="Sua cidade" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} className="pl-10" />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="state">Estado</Label>
                        <select id="state" value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm mt-1">
                          <option value="">Selecione</option>
                          {['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'].map(uf => (
                            <option key={uf} value={uf}>{uf}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="password">Senha *</Label>
                        <div className="relative mt-1">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="Mínimo 6 caracteres" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="pl-10 pr-10" required />
                          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="confirmPassword">Confirmar senha *</Label>
                        <div className="relative mt-1">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input id="confirmPassword" type="password" placeholder="Repita a senha" value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} className="pl-10" required />
                        </div>
                      </div>
                    </div>
                    <Button onClick={handleNext} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                      Próximo: Serviços <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                )}

                {/* Step 2: Services */}
                {step === 2 && (
                  <div className="space-y-5">
                    <div className="mb-6">
                      <h2 className="text-xl font-bold text-foreground">Serviços oferecidos</h2>
                      <p className="text-muted-foreground text-sm">Selecione os serviços que você oferece</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {serviceOptions.map((service) => (
                        <button
                          key={service.id}
                          type="button"
                          onClick={() => toggleService(service.id)}
                          className={`p-4 rounded-xl border-2 text-left transition-all ${
                            selectedServices.includes(service.id)
                              ? 'border-accent bg-accent/5'
                              : 'border-border hover:border-accent/30'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="font-semibold text-foreground">{service.label}</div>
                              <div className="text-sm text-muted-foreground mt-1">{service.desc}</div>
                            </div>
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                              selectedServices.includes(service.id)
                                ? 'border-accent bg-accent'
                                : 'border-border'
                            }`}>
                              {selectedServices.includes(service.id) && <Check className="w-3.5 h-3.5 text-accent-foreground" />}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-3">
                      <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                        Voltar
                      </Button>
                      <Button onClick={handleNext} className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90">
                        Próximo: Perfil <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 3: Professional Profile */}
                {step === 3 && (
                  <div className="space-y-5">
                    <div className="mb-6">
                      <h2 className="text-xl font-bold text-foreground">Perfil profissional</h2>
                      <p className="text-muted-foreground text-sm">Conte mais sobre sua experiência</p>
                    </div>
                    <div>
                      <Label htmlFor="bio">Sobre você / sua empresa</Label>
                      <textarea
                        id="bio"
                        rows={4}
                        placeholder="Descreva sua experiência, equipamentos, diferenciais..."
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm resize-none mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="experience">Tempo de experiência</Label>
                      <select
                        id="experience"
                        value={formData.experience}
                        onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                        className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm mt-1"
                      >
                        <option value="">Selecione</option>
                        <option value="menos1">Menos de 1 ano</option>
                        <option value="1-2">1 a 2 anos</option>
                        <option value="3-5">3 a 5 anos</option>
                        <option value="5+">Mais de 5 anos</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="portfolio">Link do portfólio / Instagram</Label>
                      <Input
                        id="portfolio"
                        placeholder="https://instagram.com/seu_perfil"
                        value={formData.portfolio}
                        onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div className="p-4 bg-accent/5 border border-accent/20 rounded-xl">
                      <p className="text-sm text-muted-foreground">
                        Ao se cadastrar, você concorda com os{' '}
                        <a href="#" className="text-accent hover:underline">Termos de Uso para Prestadores</a>{' '}
                        e a{' '}
                        <a href="#" className="text-accent hover:underline">Política de Comissões</a>.
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                        Voltar
                      </Button>
                      <Button onClick={handleSubmit} className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90" disabled={isLoading}>
                        {isLoading ? 'Enviando...' : 'Finalizar cadastro'}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Sidebar Benefits */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="card-elevated p-6"
              >
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                  <Store className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-4">
                  Por que ser um prestador 3DKPRINT?
                </h3>
                <ul className="space-y-3">
                  {benefits.map((benefit, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="card-elevated p-6"
              >
                <h3 className="text-lg font-bold text-foreground mb-3">Como funciona</h3>
                <div className="space-y-4">
                  {[
                    { step: '1', title: 'Cadastre-se', text: 'Preencha seus dados e selecione os serviços' },
                    { step: '2', title: 'Aprovação', text: 'Analisamos seu perfil em até 48h' },
                    { step: '3', title: 'Receba pedidos', text: 'Clientes contratam seus serviços' },
                    { step: '4', title: 'Pagamento seguro', text: 'Receba após a confirmação do cliente' },
                  ].map((item) => (
                    <div key={item.step} className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-accent">{item.step}</span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-foreground">{item.title}</div>
                        <div className="text-xs text-muted-foreground">{item.text}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="card-elevated p-6 text-center"
              >
                <p className="text-sm text-muted-foreground mb-3">Já tem uma conta?</p>
                <Link to="/login">
                  <Button variant="outline" className="w-full">
                    Fazer login
                  </Button>
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
