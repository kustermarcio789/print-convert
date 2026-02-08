import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, MapPin, Shield, Printer, PenTool, Paintbrush, Wrench, ArrowRight, Filter, Search } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const serviceFilters = [
  { id: 'todos', label: 'Todos', icon: null },
  { id: 'impressao', label: 'Impressão 3D', icon: Printer },
  { id: 'modelagem', label: 'Modelagem 3D', icon: PenTool },
  { id: 'pintura', label: 'Pintura', icon: Paintbrush },
  { id: 'manutencao', label: 'Manutenção', icon: Wrench },
];

const providers = [
  {
    id: '1',
    name: 'Carlos Mendes',
    avatar: null,
    initials: 'CM',
    location: 'São Paulo, SP',
    rating: 4.9,
    reviews: 87,
    completedJobs: 234,
    services: ['impressao', 'modelagem'],
    serviceLabels: ['Impressão 3D', 'Modelagem 3D'],
    description: 'Especialista em impressão 3D FDM e SLA com mais de 5 anos de experiência. Equipamentos Bambu Lab X1C e Prusa MK4.',
    responseTime: '< 2h',
    verified: true,
    priceRange: 'R$ 15 - R$ 80 / peça',
  },
  {
    id: '2',
    name: 'Ana Oliveira',
    avatar: null,
    initials: 'AO',
    location: 'Curitiba, PR',
    rating: 5.0,
    reviews: 42,
    completedJobs: 128,
    services: ['modelagem'],
    serviceLabels: ['Modelagem 3D'],
    description: 'Designer 3D profissional. Modelagem técnica e artística em Fusion 360 e ZBrush. Otimização para impressão.',
    responseTime: '< 4h',
    verified: true,
    priceRange: 'R$ 50 - R$ 300 / modelo',
  },
  {
    id: '3',
    name: 'Roberto Silva',
    avatar: null,
    initials: 'RS',
    location: 'Ourinhos, SP',
    rating: 4.8,
    reviews: 56,
    completedJobs: 189,
    services: ['pintura'],
    serviceLabels: ['Pintura Premium'],
    description: 'Pintura automotiva e aerografia em peças impressas em 3D. Acabamento profissional com verniz de proteção.',
    responseTime: '< 3h',
    verified: true,
    priceRange: 'R$ 30 - R$ 200 / peça',
  },
  {
    id: '4',
    name: 'Marcos Ferreira',
    avatar: null,
    initials: 'MF',
    location: 'Londrina, PR',
    rating: 4.7,
    reviews: 33,
    completedJobs: 95,
    services: ['manutencao'],
    serviceLabels: ['Manutenção'],
    description: 'Técnico especializado em manutenção de impressoras 3D. Creality, Bambu Lab, Prusa e Voron. Diagnóstico gratuito.',
    responseTime: '< 6h',
    verified: true,
    priceRange: 'R$ 80 - R$ 400 / serviço',
  },
  {
    id: '5',
    name: 'Juliana Costa',
    avatar: null,
    initials: 'JC',
    location: 'Belo Horizonte, MG',
    rating: 4.9,
    reviews: 61,
    completedJobs: 167,
    services: ['impressao', 'pintura'],
    serviceLabels: ['Impressão 3D', 'Pintura'],
    description: 'Serviço completo: impressão 3D + pintura e acabamento. Figuras, protótipos e peças funcionais.',
    responseTime: '< 2h',
    verified: true,
    priceRange: 'R$ 25 - R$ 150 / peça',
  },
  {
    id: '6',
    name: 'Diego Nascimento',
    avatar: null,
    initials: 'DN',
    location: 'Rio de Janeiro, RJ',
    rating: 4.6,
    reviews: 28,
    completedJobs: 72,
    services: ['impressao', 'modelagem', 'manutencao'],
    serviceLabels: ['Impressão 3D', 'Modelagem', 'Manutenção'],
    description: 'Maker com farm de 8 impressoras. Produção em escala, modelagem e suporte técnico.',
    responseTime: '< 1h',
    verified: false,
    priceRange: 'R$ 10 - R$ 60 / peça',
  },
];

export default function Providers() {
  const [activeFilter, setActiveFilter] = useState('todos');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProviders = providers.filter((p) => {
    const matchesFilter = activeFilter === 'todos' || p.services.includes(activeFilter);
    const matchesSearch = searchQuery === '' || 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

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
              Marketplace
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-6">
              Encontre prestadores de serviço
            </h1>
            <p className="text-xl text-primary-foreground/80">
              Contrate profissionais verificados para impressão 3D, modelagem, pintura e manutenção. 
              Pagamento seguro com retenção até a entrega.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Trust Banner */}
      <section className="bg-accent/5 border-b border-accent/10 py-4">
        <div className="container-custom flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-accent" />
            <span>Pagamento seguro com retenção</span>
          </div>
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-accent" />
            <span>Prestadores avaliados</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-accent" />
            <span>Garantia de satisfação</span>
          </div>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container-custom">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, cidade ou serviço..."
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
                    activeFilter === filter.id
                      ? 'bg-accent text-accent-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  {filter.icon && <filter.icon className="w-3.5 h-3.5" />}
                  {filter.label}
                </button>
              ))}
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
                      <h3 className="text-base font-bold text-foreground truncate">{provider.name}</h3>
                      {provider.verified && (
                        <Shield className="w-4 h-4 text-accent flex-shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="w-3.5 h-3.5" />
                      {provider.location}
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
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {provider.description}
                </p>

                {/* Services */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {provider.serviceLabels.map((label) => (
                    <span key={label} className="px-2.5 py-1 bg-accent/10 text-accent text-xs font-medium rounded-full">
                      {label}
                    </span>
                  ))}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div>
                    <div className="text-xs text-muted-foreground">A partir de</div>
                    <div className="text-sm font-semibold text-foreground">{provider.priceRange}</div>
                  </div>
                  <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">
                    Contratar <ArrowRight className="ml-1 h-3.5 w-3.5" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 text-center"
          >
            <div className="card-elevated p-8 md:p-12 bg-primary/5">
              <h2 className="text-2xl font-bold text-foreground mb-3">
                Quer oferecer seus serviços?
              </h2>
              <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                Cadastre-se como prestador e receba pedidos de clientes de todo o Brasil. 
                Sem mensalidade, comissão apenas sobre vendas realizadas.
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
