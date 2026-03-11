import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Package, Star, Box, ZoomIn, X, ChevronLeft, ChevronRight, Eye, ArrowRight } from 'lucide-react';
import type { ProjetoPortfolio } from './admin/AdminPortfolio';

const TECNOLOGIAS = [
  { value: 'todos', label: 'Todos' },
  { value: 'fdm', label: 'FDM', color: 'bg-blue-500/10 text-blue-500' },
  { value: 'resina', label: 'Resina', color: 'bg-purple-500/10 text-purple-500' },
  { value: 'modelagem', label: 'Modelagem 3D', color: 'bg-green-500/10 text-green-500' },
  { value: 'pintura', label: 'Pintura', color: 'bg-pink-500/10 text-pink-500' },
  { value: 'manutencao', label: 'Manutenção', color: 'bg-orange-500/10 text-orange-500' },
];

const CATEGORIAS_FILTER = [
  'Todos', 'Protótipos', 'Miniaturas', 'Peças Funcionais', 'Cosplay',
  'Decoração', 'Automotivo', 'Médico/Odonto', 'Educacional'
];

// Projetos de exemplo com placeholders
const PROJETOS_EXEMPLO: ProjetoPortfolio[] = [
  {
    id: '1',
    titulo: 'Protótipo de Drone Personalizado',
    descricao: 'Estrutura em PLA com acabamento premium para drone de corrida customizado.',
    categoria: 'Protótipos',
    tecnologia: 'fdm',
    fotos: [
      'https://images.unsplash.com/photo-1579783902614-e3fb5141b0cb?w=500&h=400&fit=crop',
      'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=500&h=400&fit=crop',
    ],
    material: 'PLA',
    tempoImpressao: '12h',
    dataCriacao: new Date('2024-01-15').toISOString(),
    destaque: true,
    visivel: true,
    tags: ['drone', 'prototipo', 'personalizado'],
    modelo3d: false,
  },
  {
    id: '2',
    titulo: 'Miniaturas de Cenário Warhammer',
    descricao: 'Conjunto de miniaturas em resina com pintura aerográfica profissional.',
    categoria: 'Miniaturas',
    tecnologia: 'resina',
    fotos: [
      'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=500&h=400&fit=crop',
      'https://images.unsplash.com/photo-1550258987-920cad8ef121?w=500&h=400&fit=crop',
    ],
    material: 'Resina Standard',
    tempoImpressao: '8h',
    dataCriacao: new Date('2024-01-10').toISOString(),
    destaque: true,
    visivel: true,
    tags: ['warhammer', 'miniaturas', 'pintura'],
    modelo3d: true,
  },
  {
    id: '3',
    titulo: 'Peça de Reposição Automotiva',
    descricao: 'Suporte de sensor em ABS para aplicação automotiva com tolerâncias precisas.',
    categoria: 'Peças Funcionais',
    tecnologia: 'fdm',
    fotos: [
      'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=500&h=400&fit=crop',
    ],
    material: 'ABS',
    tempoImpressao: '6h',
    dataCriacao: new Date('2024-01-05').toISOString(),
    destaque: true,
    visivel: true,
    tags: ['automotivo', 'funcional', 'precisao'],
    modelo3d: false,
  },
  {
    id: '4',
    titulo: 'Modelagem 3D de Produto',
    descricao: 'Desenvolvimento de modelo 3D a partir de sketch e especificações técnicas.',
    categoria: 'Protótipos',
    tecnologia: 'modelagem',
    fotos: [
      'https://images.unsplash.com/photo-1633356122544-f134324ef6db?w=500&h=400&fit=crop',
    ],
    material: 'Arquivo Digital',
    tempoImpressao: '3 dias',
    dataCriacao: new Date('2024-01-01').toISOString(),
    destaque: false,
    visivel: true,
    tags: ['modelagem', 'cad', 'design'],
    modelo3d: true,
  },
  {
    id: '5',
    titulo: 'Cosplay Capacete Halo',
    descricao: 'Capacete em escala 1:1 com pintura automotiva e acabamento profissional.',
    categoria: 'Cosplay',
    tecnologia: 'pintura',
    fotos: [
      'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=500&h=400&fit=crop',
    ],
    material: 'PLA + Pintura',
    tempoImpressao: '20h',
    dataCriacao: new Date('2023-12-20').toISOString(),
    destaque: false,
    visivel: true,
    tags: ['cosplay', 'halo', 'pintura'],
    modelo3d: false,
  },
  {
    id: '6',
    titulo: 'Peça Odontológica Customizada',
    descricao: 'Guia cirúrgico em resina para procedimento odontológico com precisão submilimétrica.',
    categoria: 'Médico/Odonto',
    tecnologia: 'resina',
    fotos: [
      'https://images.unsplash.com/photo-1576091160550-112173f7f869?w=500&h=400&fit=crop',
    ],
    material: 'Resina Tough',
    tempoImpressao: '4h',
    dataCriacao: new Date('2023-12-15').toISOString(),
    destaque: false,
    visivel: true,
    tags: ['odontologia', 'medico', 'precisao'],
    modelo3d: false,
  },
];

export default function Portfolio() {
  const [projetos, setProjetos] = useState<ProjetoPortfolio[]>([]);
  const [filterTec, setFilterTec] = useState('todos');
  const [filterCat, setFilterCat] = useState('Todos');
  const [lightbox, setLightbox] = useState<{ projeto: ProjetoPortfolio; idx: number } | null>(null);
  const [hasCustomProjects, setHasCustomProjects] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('admin_portfolio');
    if (saved) {
      const all: ProjetoPortfolio[] = JSON.parse(saved);
      const visiveis = all.filter(p => p.visivel).sort((a, b) => {
        if (a.destaque && !b.destaque) return -1;
        if (!a.destaque && b.destaque) return 1;
        return new Date(b.dataCriacao).getTime() - new Date(a.dataCriacao).getTime();
      });
      setProjetos(visiveis);
      setHasCustomProjects(visiveis.length > 0);
    } else {
      // Página zerada - sem projetos de exemplo
      setProjetos([]);
      setHasCustomProjects(false);
    }
  }, []);

  const filtered = projetos.filter(p => {
    const matchTec = filterTec === 'todos' || p.tecnologia === filterTec;
    const matchCat = filterCat === 'Todos' || p.categoria === filterCat;
    return matchTec && matchCat;
  });

  const getTecInfo = (tec: string) => TECNOLOGIAS.find(t => t.value === tec);

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary via-primary/95 to-primary/90 py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }} />
        
        <div className="container-custom relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-block text-accent font-semibold text-sm uppercase tracking-wider mb-4">
              Portfólio
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
              Nossos Projetos
            </h1>
            <p className="text-xl text-primary-foreground/80 max-w-2xl mb-8">
              Confira os projetos realizados pela nossa equipe. Transformamos ideias em objetos reais com alta precisão e qualidade premium.
            </p>
            {projetos.length > 0 && (
              <div className="flex gap-6 mt-6 flex-wrap">
                <div className="text-center">
                  <p className="text-3xl font-black text-white">{projetos.length}+</p>
                  <p className="text-sm text-primary-foreground/70">Projetos</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-black text-white">{projetos.filter(p => p.modelo3d).length}</p>
                  <p className="text-sm text-primary-foreground/70">Com 3D</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-black text-white">{projetos.filter(p => p.destaque).length}</p>
                  <p className="text-sm text-primary-foreground/70">Destaques</p>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Filtros */}
      {projetos.length > 0 && (
        <section className="bg-background border-b border-border sticky top-16 z-10">
          <div className="container-custom py-4 overflow-x-auto">
            <div className="flex gap-2 min-w-max">
              {TECNOLOGIAS.map(t => (
                <button key={t.value} onClick={() => setFilterTec(t.value)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                    filterTec === t.value
                      ? 'bg-primary text-white shadow-md'
                      : 'bg-secondary text-muted-foreground hover:text-foreground'
                  }`}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Galeria */}
      <section className="section-padding bg-background min-h-[400px]">
        <div className="container-custom">
          {projetos.length === 0 ? (
            <div className="text-center py-20 bg-card rounded-2xl border border-dashed border-border">
              <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-20" />
              <h3 className="text-xl font-bold text-foreground mb-2">Novos projetos em breve</h3>
              <p className="text-muted-foreground mb-6">Estamos atualizando nossa galeria com os trabalhos mais recentes.</p>
              <Link to="/orcamento">
                <Button size="lg">Iniciar meu projeto agora</Button>
              </Link>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground">Nenhum projeto nesta categoria.</p>
              <button onClick={() => { setFilterTec('todos'); setFilterCat('Todos'); }}
                className="mt-3 text-primary text-sm hover:underline">Limpar filtros</button>
            </div>
          ) : (
            <>
              {/* Destaques */}
              {filtered.some(p => p.destaque) && filterTec === 'todos' && filterCat === 'Todos' && (
                <div className="mb-12">
                  <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                    <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" /> Projetos em Destaque
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.filter(p => p.destaque).map((proj, i) => (
                      <ProjetoCard key={proj.id} projeto={proj} index={i} onLightbox={(idx) => setLightbox({ projeto: proj, idx })} />
                    ))}
                  </div>
                </div>
              )}

              {/* Todos */}
              <div>
                {filtered.some(p => p.destaque) && filterTec === 'todos' && filterCat === 'Todos' && (
                  <h2 className="text-2xl font-bold text-foreground mb-6">Todos os Projetos</h2>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filtered.map((proj, i) => (
                    <ProjetoCard key={proj.id} projeto={proj} index={i} onLightbox={(idx) => setLightbox({ projeto: proj, idx })} />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-blue-600 to-cyan-500 py-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }} />
        
        <div className="container-custom text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Quer um projeto como esses?</h2>
            <p className="text-white/90 mb-8 max-w-xl mx-auto text-lg">
              Entre em contato e transforme sua ideia em realidade com a qualidade 3DKPRINT.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link to="/orcamento">
                <Button size="lg" variant="secondary" className="text-lg px-10 py-6">
                  Solicitar Orçamento
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <a href="https://wa.me/5543991741518" target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="bg-green-500 hover:bg-green-600 text-white text-lg px-10 py-6">
                  Falar no WhatsApp
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
            onClick={() => setLightbox(null)}>
            <button className="absolute top-4 right-4 text-white p-2 hover:bg-white/10 rounded-full z-10">
              <X className="w-6 h-6" />
            </button>
            {lightbox.idx > 0 && (
              <button onClick={e => { e.stopPropagation(); setLightbox(prev => prev ? { ...prev, idx: prev.idx - 1 } : null); }}
                className="absolute left-4 text-white p-3 hover:bg-white/10 rounded-full z-10">
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}
            {lightbox.idx < lightbox.projeto.fotos.length - 1 && (
              <button onClick={e => { e.stopPropagation(); setLightbox(prev => prev ? { ...prev, idx: prev.idx + 1 } : null); }}
                className="absolute right-4 text-white p-3 hover:bg-white/10 rounded-full z-10">
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
            <img src={lightbox.projeto.fotos[lightbox.idx]} alt={lightbox.projeto.titulo}
              className="max-w-full max-h-[85vh] object-contain rounded-xl" onClick={e => e.stopPropagation()} />
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black/60 px-4 py-2 rounded-full text-center">
              <p className="font-semibold">{lightbox.projeto.titulo}</p>
              <p className="text-xs opacity-70">{lightbox.idx + 1}/{lightbox.projeto.fotos.length}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}

// ============ CARD DE PROJETO ============
function ProjetoCard({ projeto, index, onLightbox }: {
  projeto: ProjetoPortfolio;
  index: number;
  onLightbox: (idx: number) => void;
}) {
  const [currentImg, setCurrentImg] = useState(0);
  const tecInfo = TECNOLOGIAS.find(t => t.value === projeto.tecnologia);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      className="group bg-card border border-border rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
    >
      {/* Imagem */}
      <div className="relative aspect-[4/3] overflow-hidden bg-secondary/20 cursor-pointer"
        onClick={() => projeto.fotos.length > 0 && onLightbox(currentImg)}>
        {projeto.fotos.length > 0 ? (
          <img src={projeto.fotos[currentImg]} alt={projeto.titulo}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-12 h-12 text-muted-foreground opacity-30" />
          </div>
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
            <Link to="/orcamento" onClick={e => e.stopPropagation()}>
              <Button size="sm" className="bg-white text-black hover:bg-white/90 text-xs">
                Quero algo parecido
              </Button>
            </Link>
            {projeto.fotos.length > 0 && (
              <button className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors">
                <ZoomIn className="w-4 h-4 text-white" />
              </button>
            )}
          </div>
        </div>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {projeto.destaque && (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-yellow-500 text-white text-xs font-bold rounded-full">
              <Star className="w-3 h-3 fill-white" /> DESTAQUE
            </span>
          )}
        </div>

        {/* Indicadores de fotos */}
        {projeto.fotos.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {projeto.fotos.slice(0, 5).map((_, i) => (
              <button key={i} onClick={e => { e.stopPropagation(); setCurrentImg(i); }}
                className={`w-1.5 h-1.5 rounded-full transition-all ${i === currentImg ? 'bg-white w-3' : 'bg-white/50'}`} />
            ))}
          </div>
        )}

        {/* Badge 3D */}
        {projeto.modelo3d && (
          <span className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 bg-purple-600/90 text-white text-xs rounded-full">
            <Box className="w-3 h-3" /> 3D
          </span>
        )}
      </div>

      {/* Conteúdo */}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          {tecInfo && tecInfo.value !== 'todos' && (
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${tecInfo.color}`}>
              {tecInfo.label}
            </span>
          )}
          <span className="text-xs text-muted-foreground">{projeto.categoria}</span>
        </div>

        <h3 className="font-bold text-foreground text-base mb-2 line-clamp-2">{projeto.titulo}</h3>

        {projeto.descricao && (
          <p className="text-sm text-muted-foreground line-clamp-3 mb-3">{projeto.descricao}</p>
        )}

        <div className="flex flex-wrap gap-1 mb-3">
          {projeto.tags.slice(0, 4).map(tag => (
            <span key={tag} className="text-xs px-2 py-0.5 bg-secondary text-muted-foreground rounded-full">#{tag}</span>
          ))}
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground pt-3 border-t border-border">
          {projeto.material && <span>🧵 {projeto.material}</span>}
          {projeto.tempoImpressao && <span>⏱️ {projeto.tempoImpressao}</span>}
          <span className="ml-auto">{new Date(projeto.dataCriacao).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}</span>
        </div>
      </div>
    </motion.div>
  );
}
