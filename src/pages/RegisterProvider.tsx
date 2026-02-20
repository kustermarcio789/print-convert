import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  Wrench, 
  Cpu, 
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Zap,
  Check
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { salvarPrestador } from '@/lib/dataStore';

const helpDeskServices = [
  { id: 'manutencao_remota', label: 'Manutenção à Distância', desc: 'Suporte técnico remoto para calibração e ajustes.' },
  { id: 'desentupimento', label: 'Desentupimento de Bico', desc: 'Dicas e procedimentos para resolver entupimentos.' },
  { id: 'resfriamento', label: 'Dicas de Resfriamento', desc: 'Otimização de temperatura para diferentes materiais.' },
  { id: 'consultoria_resina', label: 'Consultoria em Resina', desc: 'Suporte para impressões SLA/DLP.' },
  { id: 'upgrade_hardware', label: 'Upgrades de Hardware', desc: 'Dicas de melhores componentes e instalação.' },
  { id: 'fatiamento', label: 'Otimização de Fatiamento', desc: 'Configurações ideais no Cura, PrusaSlicer, etc.' }
];

export default function RegisterProvider() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    state: '',
    password: '',
    confirmPassword: '',
    experience: '',
    portfolio: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const toggleService = (label: string) => {
    setSelectedServices(prev =>
      prev.includes(label) ? prev.filter(s => s !== label) : [...prev, label]
    );
  };

  const handleNext = () => {
    if (step === 1) {
      if (!formData.name || !formData.email || !formData.phone || !formData.password) {
        toast({ title: 'Campos obrigatórios', description: 'Preencha todos os campos marcados com *.', variant: 'destructive' });
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        toast({ title: 'Senhas não conferem', description: 'A senha e a confirmação devem ser iguais.', variant: 'destructive' });
        return;
      }
    }
    if (step === 2 && selectedServices.length === 0) {
      toast({ title: 'Selecione ao menos um serviço', description: 'Escolha os serviços de Help Desk que você oferece.', variant: 'destructive' });
      return;
    }
    setStep(step + 1);
  };

  const handleSubmit = () => {
    setIsLoading(true);
    setTimeout(() => {
      const prestadorId = salvarPrestador({
        nome: formData.name,
        apelido: formData.name.split(' ')[0] + Math.floor(Math.random() * 1000),
        email: formData.email,
        telefone: formData.phone,
        cidade: formData.city,
        estado: formData.state,
        servicos: selectedServices,
        experiencia: formData.experience,
        portfolio: formData.portfolio,
      });
      
      setIsLoading(false);
      toast({
        title: 'Cadastro enviado com sucesso!',
        description: `Seu cadastro #${prestadorId} foi registrado. Analisaremos seu perfil em até 48 horas.`,
      });
      navigate('/');
    }, 2000);
  };

  return (
    <Layout>
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
              Seja um Especialista 3DKPRINT
            </h1>
            <p className="text-xl text-primary-foreground/80">
              Ofereça suporte técnico, consultoria e serviços de Help Desk para a maior comunidade de impressão 3D.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-4 mb-8">
                {[1, 2, 3].map((s) => (
                  <div key={s} className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                      step >= s ? 'bg-accent text-accent-foreground' : 'bg-secondary text-muted-foreground'
                    }`}>
                      {step > s ? <Check className="w-4 h-4" /> : s}
                    </div>
                    <span className={`text-sm font-medium hidden sm:inline ${step >= s ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {s === 1 ? 'Dados pessoais' : s === 2 ? 'Help Desk' : 'Perfil profissional'}
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
                {step === 1 && (
                  <div className="space-y-5">
                    <div className="mb-6">
                      <h2 className="text-xl font-bold text-foreground">Dados pessoais</h2>
                      <p className="text-muted-foreground text-sm">Informações básicas da sua conta</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Nome completo *</Label>
                        <Input id="name" placeholder="Seu nome completo" value={formData.name} onChange={handleInputChange} required />
                      </div>
                      <div>
                        <Label htmlFor="email">E-mail *</Label>
                        <Input id="email" type="email" placeholder="seu@email.com" value={formData.email} onChange={handleInputChange} required />
                      </div>
                      <div>
                        <Label htmlFor="phone">WhatsApp *</Label>
                        <Input id="phone" type="tel" placeholder="(43) 9-9174-1518" value={formData.phone} onChange={handleInputChange} required />
                      </div>
                      <div>
                        <Label htmlFor="city">Cidade *</Label>
                        <Input id="city" placeholder="Sua cidade" value={formData.city} onChange={handleInputChange} />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="password">Senha *</Label>
                        <Input id="password" type="password" placeholder="Mínimo 6 caracteres" value={formData.password} onChange={handleInputChange} required />
                      </div>
                      <div>
                        <Label htmlFor="confirmPassword">Confirmar senha *</Label>
                        <Input id="confirmPassword" type="password" placeholder="Repita a senha" value={formData.confirmPassword} onChange={handleInputChange} required />
                      </div>
                    </div>
                    <Button onClick={handleNext} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                      Próximo: Serviços <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-5">
                    <div className="mb-6">
                      <h2 className="text-xl font-bold text-foreground">Serviços de Help Desk</h2>
                      <p className="text-muted-foreground text-sm">Selecione as áreas de suporte técnico que você oferece</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {helpDeskServices.map((service) => (
                        <button
                          key={service.id}
                          type="button"
                          onClick={() => toggleService(service.label)}
                          className={`p-4 rounded-xl border-2 text-left transition-all ${
                            selectedServices.includes(service.label)
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
                              selectedServices.includes(service.label)
                                ? 'border-accent bg-accent'
                                : 'border-border'
                            }`}>
                              {selectedServices.includes(service.label) && <Check className="w-3.5 h-3.5 text-accent-foreground" />}
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

                {step === 3 && (
                  <div className="space-y-5">
                    <div className="mb-6">
                      <h2 className="text-xl font-bold text-foreground">Perfil profissional</h2>
                      <p className="text-muted-foreground text-sm">Conte mais sobre sua experiência</p>
                    </div>
                    <div>
                      <Label htmlFor="experience">Resumo da sua experiência</Label>
                      <textarea
                        id="experience"
                        rows={4}
                        placeholder="Descreva sua experiência técnica, equipamentos que domina..."
                        value={formData.experience}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm resize-none mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="portfolio">Link do Portfólio / Instagram (Opcional)</Label>
                      <Input id="portfolio" placeholder="https://..." value={formData.portfolio} onChange={handleInputChange} />
                    </div>
                    <div className="flex gap-3">
                      <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                        Voltar
                      </Button>
                      <Button onClick={handleSubmit} disabled={isLoading} className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90">
                        {isLoading ? 'Processando...' : 'Finalizar Cadastro'}
                      </Button>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>

            <div className="space-y-6">
              <div className="card-elevated p-6 bg-primary text-primary-foreground">
                <h3 className="text-lg font-bold mb-4">Por que ser um parceiro?</h3>
                <ul className="space-y-4">
                  {['Receba pedidos de todo o Brasil', 'Pagamento seguro e garantido', 'Suporte técnico especializado', 'Dashboard de métricas'].map((benefit, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
