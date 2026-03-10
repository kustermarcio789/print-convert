import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, User, Phone, Building2, MapPin, FileText, CheckCircle2, Printer } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function Register() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [tipoPessoa, setTipoPessoa] = useState<'fisica' | 'juridica'>('fisica');
  const [aceitouTermos, setAceitouTermos] = useState(false);
  const [showTermos, setShowTermos] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    cpf: '',
    rg: '',
    dataNascimento: '',
    razaoSocial: '',
    nomeFantasia: '',
    cnpj: '',
    inscricaoEstadual: '',
    cep: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
  });

  const handleCepBlur = async () => {
    const cepClean = formData.cep.replace(/\D/g, '');
    if (cepClean.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cepClean}/json/`);
        const data = await response.json();
        if (!data.erro) {
          setFormData({
            ...formData,
            endereco: data.logradouro,
            bairro: data.bairro,
            cidade: data.localidade,
            estado: data.uf,
          });
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
      }
    }
  };

  const formatCPF = (value: string) => {
    return value.replace(/\D/g, '').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})/, '$1-$2').replace(/(-\d{2})\d+?$/, '$1');
  };
  const formatCNPJ = (value: string) => {
    return value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1/$2').replace(/(\d{4})(\d)/, '$1-$2').replace(/(-\d{2})\d+?$/, '$1');
  };
  const formatPhone = (value: string) => {
    return value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2').replace(/(-\d{4})\d+?$/, '$1');
  };
  const formatCEP = (value: string) => {
    return value.replace(/\D/g, '').replace(/(\d{5})(\d)/, '$1-$2').replace(/(-\d{3})\d+?$/, '$1');
  };

  const handleSocialRegister = (provider: string) => {
    toast({
      title: `Cadastro com ${provider}`,
      description: `Redirecionando para autenticação ${provider}... (Em breve disponível)`,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password || !formData.phone) {
      toast({ title: "Campos obrigatórios", description: "Preencha todos os campos obrigatórios.", variant: "destructive" });
      return;
    }
    if (tipoPessoa === 'fisica' && !formData.cpf) {
      toast({ title: "CPF obrigatório", description: "Informe seu CPF.", variant: "destructive" });
      return;
    }
    if (tipoPessoa === 'juridica' && (!formData.cnpj || !formData.razaoSocial)) {
      toast({ title: "Dados da empresa obrigatórios", description: "Informe CNPJ e Razão Social.", variant: "destructive" });
      return;
    }
    if (formData.password.length < 6) {
      toast({ title: "Senha muito curta", description: "A senha deve ter pelo menos 6 caracteres.", variant: "destructive" });
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast({ title: "Senhas não conferem", description: "A senha e a confirmação devem ser iguais.", variant: "destructive" });
      return;
    }
    if (!aceitouTermos) {
      toast({ title: "Termos obrigatórios", description: "Você precisa aceitar os Termos de Uso e Diretrizes para continuar.", variant: "destructive" });
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const userData = {
        ...formData,
        tipoPessoa,
        id: `USER_${Date.now()}`,
        createdAt: new Date().toISOString(),
        emailConfirmado: false,
        ativo: false,
        aceitouTermos: true,
        dataAceitacaoTermos: new Date().toISOString(),
      };
      const users = JSON.parse(localStorage.getItem('usuarios') || '[]');
      users.push(userData);
      localStorage.setItem('usuarios', JSON.stringify(users));

      toast({
        title: "Cadastro realizado com sucesso!",
        description: "Enviamos um link de confirmação para seu e-mail. Confirme para ativar sua conta.",
      });
      navigate('/login?registered=true');
    }, 1500);
  };

  const estados = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];

  return (
    <Layout>
      <div className="min-h-[80vh] flex items-center justify-center py-16 bg-gradient-to-br from-background via-secondary/10 to-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-4xl px-4"
        >
          <div className="card-elevated p-8 shadow-2xl">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Printer className="w-8 h-8 text-accent" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">Criar sua conta</h1>
              <p className="text-muted-foreground text-sm">Cadastre-se para acompanhar seus pedidos e orçamentos</p>
            </div>

            {/* Social Register */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              <button type="button" onClick={() => handleSocialRegister('Google')} className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-border rounded-xl hover:bg-secondary/50 transition-all font-medium text-foreground text-sm">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </button>
              <button type="button" onClick={() => handleSocialRegister('Facebook')} className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-border rounded-xl hover:bg-secondary/50 transition-all font-medium text-foreground text-sm">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </button>
              <button type="button" onClick={() => handleSocialRegister('Apple')} className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-border rounded-xl hover:bg-secondary/50 transition-all font-medium text-foreground text-sm">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                Apple
              </button>
            </div>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border"></div></div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-3 text-muted-foreground font-medium">ou cadastre com e-mail</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Tipo de Pessoa */}
              <div>
                <Label className="mb-2 block font-semibold">Tipo de Cadastro *</Label>
                <div className="grid grid-cols-2 gap-4">
                  <button type="button" onClick={() => setTipoPessoa('fisica')} className={`p-4 border-2 rounded-xl transition-all ${tipoPessoa === 'fisica' ? 'border-accent bg-accent/10' : 'border-border hover:border-accent/50'}`}>
                    <User className="w-6 h-6 mx-auto mb-2 text-accent" />
                    <div className="font-semibold text-foreground">Pessoa Física</div>
                    <div className="text-xs text-muted-foreground">CPF</div>
                  </button>
                  <button type="button" onClick={() => setTipoPessoa('juridica')} className={`p-4 border-2 rounded-xl transition-all ${tipoPessoa === 'juridica' ? 'border-accent bg-accent/10' : 'border-border hover:border-accent/50'}`}>
                    <Building2 className="w-6 h-6 mx-auto mb-2 text-accent" />
                    <div className="font-semibold text-foreground">Pessoa Jurídica</div>
                    <div className="text-xs text-muted-foreground">CNPJ</div>
                  </button>
                </div>
              </div>

              {/* Dados Básicos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="mb-2 block">{tipoPessoa === 'fisica' ? 'Nome completo *' : 'Nome do responsável *'}</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Seu nome completo" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="pl-10" required />
                  </div>
                </div>
                <div>
                  <Label className="mb-2 block">E-mail *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input type="email" placeholder="seu@email.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="pl-10" required />
                  </div>
                </div>
              </div>

              {/* Dados PF */}
              {tipoPessoa === 'fisica' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="mb-2 block">CPF *</Label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="000.000.000-00" value={formData.cpf} onChange={(e) => setFormData({ ...formData, cpf: formatCPF(e.target.value) })} className="pl-10" maxLength={14} required />
                    </div>
                  </div>
                  <div>
                    <Label className="mb-2 block">RG</Label>
                    <Input placeholder="00.000.000-0" value={formData.rg} onChange={(e) => setFormData({ ...formData, rg: e.target.value })} />
                  </div>
                  <div>
                    <Label className="mb-2 block">Data de Nascimento</Label>
                    <Input type="date" value={formData.dataNascimento} onChange={(e) => setFormData({ ...formData, dataNascimento: e.target.value })} />
                  </div>
                </div>
              )}

              {/* Dados PJ */}
              {tipoPessoa === 'juridica' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="mb-2 block">Razão Social *</Label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Nome da empresa" value={formData.razaoSocial} onChange={(e) => setFormData({ ...formData, razaoSocial: e.target.value })} className="pl-10" required />
                      </div>
                    </div>
                    <div>
                      <Label className="mb-2 block">Nome Fantasia</Label>
                      <Input placeholder="Nome fantasia" value={formData.nomeFantasia} onChange={(e) => setFormData({ ...formData, nomeFantasia: e.target.value })} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="mb-2 block">CNPJ *</Label>
                      <div className="relative">
                        <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="00.000.000/0000-00" value={formData.cnpj} onChange={(e) => setFormData({ ...formData, cnpj: formatCNPJ(e.target.value) })} className="pl-10" maxLength={18} required />
                      </div>
                    </div>
                    <div>
                      <Label className="mb-2 block">Inscrição Estadual</Label>
                      <Input placeholder="000.000.000.000" value={formData.inscricaoEstadual} onChange={(e) => setFormData({ ...formData, inscricaoEstadual: e.target.value })} />
                    </div>
                  </div>
                </div>
              )}

              {/* Telefone */}
              <div>
                <Label className="mb-2 block">WhatsApp *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input type="tel" placeholder="(43) 99174-1518" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: formatPhone(e.target.value) })} className="pl-10" maxLength={15} required />
                </div>
              </div>

              {/* Endereço */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-foreground flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-accent" /> Endereço
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="mb-2 block">CEP</Label>
                    <Input placeholder="00000-000" value={formData.cep} onChange={(e) => setFormData({ ...formData, cep: formatCEP(e.target.value) })} onBlur={handleCepBlur} maxLength={9} />
                  </div>
                  <div className="md:col-span-2">
                    <Label className="mb-2 block">Endereço</Label>
                    <Input placeholder="Rua, Avenida..." value={formData.endereco} onChange={(e) => setFormData({ ...formData, endereco: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label className="mb-2 block">Número</Label>
                    <Input placeholder="123" value={formData.numero} onChange={(e) => setFormData({ ...formData, numero: e.target.value })} />
                  </div>
                  <div className="md:col-span-3">
                    <Label className="mb-2 block">Complemento</Label>
                    <Input placeholder="Apto, Sala..." value={formData.complemento} onChange={(e) => setFormData({ ...formData, complemento: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="mb-2 block">Bairro</Label>
                    <Input placeholder="Bairro" value={formData.bairro} onChange={(e) => setFormData({ ...formData, bairro: e.target.value })} />
                  </div>
                  <div>
                    <Label className="mb-2 block">Cidade</Label>
                    <Input placeholder="Cidade" value={formData.cidade} onChange={(e) => setFormData({ ...formData, cidade: e.target.value })} />
                  </div>
                  <div>
                    <Label className="mb-2 block">Estado</Label>
                    <Select value={formData.estado} onValueChange={(value) => setFormData({ ...formData, estado: value })}>
                      <SelectTrigger><SelectValue placeholder="UF" /></SelectTrigger>
                      <SelectContent>
                        {estados.map(uf => <SelectItem key={uf} value={uf}>{uf}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Senhas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="mb-2 block">Senha *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input type={showPassword ? 'text' : 'password'} placeholder="Mínimo 6 caracteres" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="pl-10 pr-10" required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <Label className="mb-2 block">Confirmar senha *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input type={showConfirmPassword ? 'text' : 'password'} placeholder="Repita a senha" value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} className="pl-10 pr-10" required />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Confirmação por E-mail Info */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-blue-900">Confirmação por e-mail obrigatória</p>
                    <p className="text-xs text-blue-700 mt-1">Após o cadastro, enviaremos um link de confirmação para o e-mail informado. Sua conta só será ativada após a confirmação.</p>
                  </div>
                </div>
              </div>

              {/* Termos de Uso - Accordion */}
              <div className="border-2 border-border rounded-xl overflow-hidden">
                <button type="button" onClick={() => setShowTermos(!showTermos)} className="w-full p-4 flex items-center justify-between bg-secondary/30 hover:bg-secondary/50 transition-colors">
                  <span className="font-semibold text-foreground text-sm">Termos de Uso, Diretrizes e Condições</span>
                  <span className="text-accent text-sm">{showTermos ? 'Fechar' : 'Ler termos'}</span>
                </button>
                {showTermos && (
                  <div className="p-6 max-h-96 overflow-y-auto text-sm text-muted-foreground space-y-4 bg-white">
                    <h4 className="font-bold text-foreground text-base">TERMOS DE USO E DIRETRIZES DA PLATAFORMA 3DKPRINT</h4>
                    <p className="text-xs text-muted-foreground">Última atualização: Março de 2026</p>
                    
                    <div>
                      <h5 className="font-semibold text-foreground mb-1">1. ACEITAÇÃO DOS TERMOS</h5>
                      <p>Ao criar uma conta na plataforma 3DKPRINT (3dkprint.com.br), o usuário declara ter lido, compreendido e aceito integralmente os presentes Termos de Uso, Diretrizes e Condições Gerais. O uso continuado da plataforma constitui aceitação vinculante destes termos.</p>
                    </div>

                    <div>
                      <h5 className="font-semibold text-foreground mb-1">2. ELEGIBILIDADE</h5>
                      <p>Para utilizar os serviços da plataforma, o usuário deve: (a) ter pelo menos 18 anos de idade ou possuir consentimento dos pais/responsáveis legais; (b) fornecer informações verdadeiras, precisas e atualizadas durante o cadastro; (c) possuir CPF ou CNPJ válido e ativo.</p>
                    </div>

                    <div>
                      <h5 className="font-semibold text-foreground mb-1">3. CADASTRO E CONTA</h5>
                      <p>O usuário é responsável por: manter a segurança de suas credenciais de acesso; todas as atividades realizadas em sua conta; notificar imediatamente a 3DKPRINT sobre qualquer uso não autorizado. A confirmação do e-mail é obrigatória para ativação da conta. Contas não confirmadas em 7 dias serão automaticamente excluídas.</p>
                    </div>

                    <div>
                      <h5 className="font-semibold text-foreground mb-1">4. SERVIÇOS OFERECIDOS</h5>
                      <p>A 3DKPRINT oferece: impressão 3D por FDM (Filamento) e Resina (SLA/DLP/LCD); modelagem 3D sob demanda; pintura e acabamento profissional; manutenção de impressoras 3D; consultoria técnica em impressão 3D; venda de peças e acessórios para impressoras 3D.</p>
                    </div>

                    <div>
                      <h5 className="font-semibold text-foreground mb-1">5. ORÇAMENTOS E PAGAMENTOS</h5>
                      <p>Todos os orçamentos são válidos por 7 (sete) dias corridos. Os preços estão em Reais (R$) e podem ser alterados sem aviso prévio. O pagamento deve ser realizado antes do início da produção. Aceitamos: PIX, cartão de crédito, boleto bancário e transferência. Pedidos podem ser cancelados sem custo antes do início da produção.</p>
                    </div>

                    <div>
                      <h5 className="font-semibold text-foreground mb-1">6. PROPRIEDADE INTELECTUAL</h5>
                      <p>O cliente é integralmente responsável por garantir que possui os direitos necessários sobre os arquivos enviados para impressão. A 3DKPRINT não se responsabiliza por violações de propriedade intelectual de terceiros. É expressamente proibido solicitar a impressão de itens protegidos por direitos autorais sem a devida autorização do detentor dos direitos.</p>
                    </div>

                    <div>
                      <h5 className="font-semibold text-foreground mb-1">7. GARANTIAS E DEVOLUÇÕES</h5>
                      <p>Produtos com defeito de fabricação serão substituídos sem custo adicional. Produtos personalizados não podem ser devolvidos, exceto em casos de defeito. O prazo para reclamação é de 7 dias após o recebimento. Os prazos informados são estimativas e podem variar conforme complexidade e disponibilidade.</p>
                    </div>

                    <div>
                      <h5 className="font-semibold text-foreground mb-1">8. CONDUTAS PROIBIDAS</h5>
                      <p>O usuário concorda em NÃO: violar qualquer lei vigente; transmitir material abusivo, difamatório ou ilegal; fazer uso comercial não autorizado; tentar obter acesso não autorizado ao sistema; usar robôs ou dispositivos automatizados; copiar ou distribuir conteúdo sem autorização; usar a plataforma para atividades fraudulentas.</p>
                    </div>

                    <div>
                      <h5 className="font-semibold text-foreground mb-1">9. PROTEÇÃO DE DADOS (LGPD)</h5>
                      <p>A 3DKPRINT está em conformidade com a Lei Geral de Proteção de Dados (Lei 13.709/2018). Os dados pessoais coletados são utilizados exclusivamente para: processamento de pedidos e orçamentos; comunicação sobre status de serviços; melhorias na experiência do usuário; cumprimento de obrigações legais. O usuário pode solicitar a exclusão de seus dados a qualquer momento.</p>
                    </div>

                    <div>
                      <h5 className="font-semibold text-foreground mb-1">10. LIMITAÇÃO DE RESPONSABILIDADE</h5>
                      <p>A 3DKPRINT não será responsável por: danos indiretos, incidentais ou consequenciais; perda de lucros, dados ou uso; problemas causados por arquivos fornecidos pelo cliente; atrasos causados por terceiros (correios, fornecedores); uso inadequado dos produtos impressos.</p>
                    </div>

                    <div>
                      <h5 className="font-semibold text-foreground mb-1">11. COMUNIDADE E GRUPOS</h5>
                      <p>A participação nos grupos de WhatsApp da 3DKPRINT está sujeita às regras específicas de cada grupo. É proibido divulgar links patrocinados/afiliados sem autorização. Conteúdo ofensivo, spam e assuntos fora do tema resultarão em remoção imediata.</p>
                    </div>

                    <div>
                      <h5 className="font-semibold text-foreground mb-1">12. FORO E LEGISLAÇÃO</h5>
                      <p>Estes Termos são regidos pelas leis da República Federativa do Brasil. Qualquer disputa será resolvida nos tribunais da comarca de Ourinhos, Estado de São Paulo.</p>
                    </div>

                    <div className="pt-4 border-t border-border">
                      <p className="text-xs text-muted-foreground">Ao marcar a caixa abaixo, você declara ter lido e concordado integralmente com todos os termos acima.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Checkbox Termos */}
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="termos"
                  checked={aceitouTermos}
                  onChange={(e) => setAceitouTermos(e.target.checked)}
                  className="mt-1 w-5 h-5 rounded border-border text-accent focus:ring-accent cursor-pointer"
                />
                <label htmlFor="termos" className="text-sm text-muted-foreground cursor-pointer">
                  Li e concordo com os{' '}
                  <Link to="/termos" className="text-accent hover:underline font-medium" target="_blank">Termos de Uso</Link>,{' '}
                  <span className="text-accent font-medium cursor-pointer" onClick={() => setShowTermos(true)}>Diretrizes da Plataforma</span>{' '}
                  e{' '}
                  <Link to="/privacidade" className="text-accent hover:underline font-medium" target="_blank">Política de Privacidade</Link>.{' '}
                  <span className="text-red-500 font-semibold">*</span>
                </label>
              </div>

              <Button
                type="submit"
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90 py-6 font-semibold"
                disabled={isLoading || !aceitouTermos}
              >
                {isLoading ? 'Criando conta...' : 'Criar conta'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-muted-foreground text-sm">
                Já tem uma conta?{' '}
                <Link to="/login" className="text-accent hover:underline font-medium">Fazer login</Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
