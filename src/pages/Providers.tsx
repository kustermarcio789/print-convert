import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, MapPin, Shield, Printer, PenTool, Paintbrush, ArrowRight, Search, Lock, MessageSquare, CreditCard, Package, CheckCircle, Info } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

const serviceFilters = [
  { id: 'todos', label: 'Todos', icon: null },
  { id: 'impressao', label: 'Impressão 3D', icon: Printer },
  { id: 'modelagem', label: 'Modelagem 3D', icon: PenTool },
  { id: 'pintura', label: 'Pintura', icon: Paintbrush },
];

const providers = [
  {
    id: '1',
    nick: 'PrintMaster_SP',
    avatar: null,
    initials: 'PM',
    city: 'São Paulo, SP',
    rating: 4.9,
    reviews: 87,
    completedJobs: 234,
    services: ['impressao', 'modelagem'],
    serviceLabels: ['Impressão 3D', 'Modelagem 3D'],
    modelagemTipo: 'Paramétrica / Peças Técnicas',
    description: 'Especialista em impressão 3D FDM e SLA. Equipamentos de alta qualidade. Entrega rápida e peças com excelente acabamento.',
    responseTime: '< 2h',
    verified: true,
    memberSince: 'Jan 2025',
  },
  {
    id: '2',
    nick: 'Design3D_Ana',
    avatar: null,
    initials: 'D3',
    city: 'Curitiba, PR',
    rating: 5.0,
    reviews: 42,
    completedJobs: 128,
    services: ['modelagem'],
    serviceLabels: ['Modelagem 3D'],
    modelagemTipo: 'Orgânica e Paramétrica',
    description: 'Designer 3D profissional. Modelagem técnica e artística. Otimização para impressão 3D com entrega de arquivo pronto.',
    responseTime: '< 4h',
    verified: true,
    memberSince: 'Mar 2025',
  },
  {
    id: '3',
    nick: 'ArtPaint3D',
    avatar: null,
    initials: 'AP',
    city: 'Ourinhos, SP',
    rating: 4.8,
    reviews: 56,
    completedJobs: 189,
    services: ['pintura'],
    serviceLabels: ['Pintura Premium'],
    modelagemTipo: null,
    description: 'Pintura automotiva e aerografia em peças impressas em 3D. Acabamento profissional com verniz de proteção UV.',
    responseTime: '< 3h',
    verified: true,
    memberSince: 'Fev 2025',
  },
  {
    id: '4',
    nick: 'MakerFarm_LDA',
    avatar: null,
    initials: 'MF',
    city: 'Londrina, PR',
    rating: 4.7,
    reviews: 33,
    completedJobs: 95,
    services: ['impressao'],
    serviceLabels: ['Impressão 3D'],
    modelagemTipo: null,
    description: 'Farm com 8 impressoras FDM. Produção em escala, prototipagem rápida e peças funcionais. Vários materiais disponíveis.',
    responseTime: '< 1h',
    verified: true,
    memberSince: 'Abr 2025',
  },
  {
    id: '5',
    nick: 'JuPrint_BH',
    avatar: null,
    initials: 'JP',
    city: 'Belo Horizonte, MG',
    rating: 4.9,
    reviews: 61,
    completedJobs: 167,
    services: ['impressao', 'pintura'],
    serviceLabels: ['Impressão 3D', 'Pintura'],
    modelagemTipo: null,
    description: 'Serviço completo: impressão 3D + pintura e acabamento. Figuras, protótipos e peças funcionais com qualidade premium.',
    responseTime: '< 2h',
    verified: true,
    memberSince: 'Jan 2025',
  },
  {
    id: '6',
    nick: 'Sculptor3D_RJ',
    avatar: null,
    initials: 'S3',
    city: 'Rio de Janeiro, RJ',
    rating: 4.6,
    reviews: 28,
    completedJobs: 72,
    services: ['modelagem', 'impressao'],
    serviceLabels: ['Modelagem 3D', 'Impressão 3D'],
    modelagemTipo: 'Orgânica (Artística)',
    description: 'Modelagem orgânica e artística em ZBrush. Esculturas, figuras de ação, bustos e personagens. Impressão em resina de alta resolução.',
    responseTime: '< 3h',
    verified: false,
    memberSince: 'Mai 2025',
  },
];

export default function Providers() {
  const { toast } = useToast();
  const [activeFilter, setActiveFilter] = useState('todos');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProviders = providers.filter((p) => {
    const matchesFilter = activeFilter === 'todos' || p.services.includes(activeFilter);
    const matchesSearch = searchQuery === '' ||
      p.nick.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleSolicitar = (nick: string) => {
    toast({
      title: "Solicitação enviada!",
      description: `Sua solicitação foi enviada para ${nick}. A 3DKPRINT intermediará todo o processo. Você receberá uma proposta em breve.`,
    });
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-primary py-16">
        <div className="container-custom">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
            <span className="inline-block text-accent font-semibold text-sm uppercase tracking-wider mb-4">Marketplace 3DKPRINT</span>
            <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-6">Encontre prestadores de serviço</h1>
            <p className="text-xl text-primary-foreground/80">
              Contrate profissionais verificados com total segurança. A 3DKPRINT intermedia todo o processo: 
              comunicação, pagamento e entrega. Seu dinheiro fica retido até você confirmar o recebimento.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Trust Banner - How it works */}
      <section className="bg-accent/5 border-b border-accent/10 py-6">
        <div className="container-custom">
          <h3 className="text-center text-sm font-semibold text-foreground mb-4">Como funciona a intermediação 3DKPRINT</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex flex-col items-center text-center gap-2">
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground">1. Solicite o serviço</p>
                <p className="text-xs text-muted-foreground">Descreva o que precisa</p>
              </div>
            </div>
            <div className="flex flex-col items-center text-center gap-2">
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground">2. Pagamento seguro</p>
                <p className="text-xs text-muted-foreground">Valor fica retido na plataforma</p>
              </div>
            </div>
            <div className="flex flex-col items-center text-center gap-2">
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                <Package className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground">3. Receba o produto</p>
                <p className="text-xs text-muted-foreground">Entrega acompanhada</p>
              </div>
            </div>
            <div className="flex flex-col items-center text-center gap-2">
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground">4. Confirme e libere</p>
                <p className="text-xs text-muted-foreground">Pagamento liberado ao prestador</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Maintenance Notice */}
      <section className="bg-blue-50 dark:bg-blue-950/20 border-b border-blue-200 dark:border-blue-800 py-3">
        <div className="container-custom flex items-center justify-center gap-3 text-sm">
          <Info className="w-4 h-4 text-blue-600 flex-shrink-0" />
          <p className="text-blue-800 dark:text-blue-200">
            <strong>Manutenção de impressoras 3D</strong> é realizada exclusivamente pela equipe técnica da 3DKPRINT.{' '}
            <Link to="/servicos" className="underline font-semibold hover:text-blue-600">Solicitar manutenção aqui</Link>
          </p>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container-custom">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nick, cidade ou serviço..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {serviceFilters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                    activeFilter === filter.id ? 'bg-accent text-accent-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  {filter.icon && <filter.icon className="w-3.5 h-3.5" />}
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Security Notice */}
          <div className="mb-6 p-4 rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 flex items-start gap-3">
            <Lock className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-green-800 dark:text-green-200">Comunicação intermediada pela 3DKPRINT</p>
              <p className="text-xs text-green-700 dark:text-green-300">Para sua segurança, toda comunicação entre cliente e prestador é feita através da plataforma. Não é possível contato direto. O pagamento fica retido até a confirmação de recebimento pelo cliente.</p>
            </div>
          </div>

          {/* Results count */}
          <p className="text-sm text-muted-foreground mb-6">
            {filteredProviders.length} prestador{filteredProviders.length !== 1 ? 'es' : ''} encontrado{filteredProviders.length !== 1 ? 's' : ''}
          </p>

          {/* Provider Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProviders.map((provider, index) => (
              <motion.div
                key={provider.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="card-elevated p-6 group hover:border-accent/30 transition-all"
              >
                {/* Header */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center flex-shrink-0">
                    <span className="text-lg font-bold text-accent">{provider.initials}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-foreground truncate">{provider.nick}</h3>
                      {provider.verified && (
                        <Shield className="w-4 h-4 text-accent flex-shrink-0" title="Verificado pela 3DKPRINT" />
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="w-3.5 h-3.5" />
                      {provider.city}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Membro desde {provider.memberSince}
                    </div>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-4 mb-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold text-foreground">{provider.rating}</span>
                    <span className="text-muted-foreground">({provider.reviews})</span>
                  </div>
                  <span className="text-muted-foreground">{provider.completedJobs} trabalhos</span>
                </div>

                {/* Description */}
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{provider.description}</p>

                {/* Modelagem Type */}
                {provider.modelagemTipo && (
                  <div className="mb-3 p-2 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
                    <p className="text-xs text-purple-700 dark:text-purple-300">
                      <span className="font-semibold">Tipo de modelagem:</span> {provider.modelagemTipo}
                    </p>
                  </div>
                )}

                {/* Services */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {provider.serviceLabels.map((label) => (
                    <span key={label} className="px-2.5 py-1 bg-accent/10 text-accent text-xs font-medium rounded-full">{label}</span>
                  ))}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5" />
                    Responde em {provider.responseTime}
                  </div>
                  <Button
                    size="sm"
                    className="bg-accent text-accent-foreground hover:bg-accent/90"
                    onClick={() => handleSolicitar(provider.nick)}
                  >
                    Solicitar <ArrowRight className="ml-1 h-3.5 w-3.5" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-16 text-center">
            <div className="card-elevated p-8 md:p-12 bg-primary/5">
              <h2 className="text-2xl font-bold text-foreground mb-3">Quer oferecer seus serviços?</h2>
              <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                Cadastre-se como prestador e receba pedidos de clientes de todo o Brasil. 
                A 3DKPRINT cuida da intermediação, pagamento e logística. Sem mensalidade, comissão apenas sobre vendas realizadas.
              </p>
              <Link to="/cadastro-prestador">
                <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                  Cadastrar como prestador <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
