import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, MapPin, Shield, Printer, PenTool, Paintbrush, ArrowRight, Search, Lock, MessageSquare, CreditCard, Package, CheckCircle, Info, Users } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { prestadoresAPI } from '@/lib/apiClient';

const serviceFilters = [
  { id: 'todos', label: 'Todos', icon: null },
  { id: 'impressao', label: 'Impressão 3D', icon: Printer },
  { id: 'modelagem', label: 'Modelagem 3D', icon: PenTool },
  { id: 'pintura', label: 'Pintura', icon: Paintbrush },
];

export default function Providers() {
  const { toast } = useToast();
  const [activeFilter, setActiveFilter] = useState('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProviders = async () => {
      try {
        setLoading(true);
        const data = await prestadoresAPI.getAll();
        setProviders(data || []);
      } catch (error) {
        console.error('Erro ao carregar prestadores:', error);
        setProviders([]);
      } finally {
        setLoading(false);
      }
    };
    loadProviders();
  }, []);

  const filteredProviders = providers.filter((p) => {
    const services = p.servicos || [];
    const matchesFilter = activeFilter === 'todos' || services.includes(activeFilter);
    const matchesSearch = searchQuery === '' ||
      (p.nome || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.cidade || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <Layout>
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

      <section className="section-padding bg-background">
        <div className="container-custom">
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
                    activeFilter === filter.id ? 'bg-accent text-accent-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  {filter.icon && <filter.icon className="w-3.5 h-3.5" />}
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => <div key={i} className="h-64 bg-muted animate-pulse rounded-xl" />)}
            </div>
          ) : filteredProviders.length > 0 ? (
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
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                      {provider.nome?.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold">{provider.nome}</h3>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {provider.cidade}, {provider.estado}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {(provider.servicos || []).map((s: string) => (
                      <span key={s} className="px-2 py-0.5 bg-secondary text-[10px] font-bold uppercase rounded">
                        {s}
                      </span>
                    ))}
                  </div>
                  <Button asChild className="w-full">
                    <Link to={`/prestadores/${provider.id}`}>Ver Perfil Completo</Link>
                  </Button>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-xl border border-dashed border-border">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
              <p className="text-muted-foreground font-medium">Ainda não há prestadores cadastrados.</p>
              <Button asChild variant="link" className="mt-2 text-accent">
                <Link to="/cadastro-prestador">Seja o primeiro prestador!</Link>
              </Button>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
