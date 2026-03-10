import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Package, Edit, Trash2, Star, Eye, EyeOff, Save, X,
  Tag, Layers, Zap, Box, DollarSign, Warehouse, GitBranch,
  ChevronLeft, ChevronRight, Upload, Image as ImageIcon, Plus
} from 'lucide-react';
import Sidebar from '@/components/admin/Sidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Catálogo base de produtos (mesmo do AdminProdutos)
const catalogoImpressoras = [
  {
    id: 'elegoo-centauri',
    nome: 'Elegoo Centauri Carbon',
    marca: 'Elegoo',
    categoria: 'FDM',
    tipo: 'CoreXY',
    preco: 4360,
    velocidade: '500 mm/s',
    volume: '256×256×256mm',
    imagem: '/images/printers/elegoo-centauri.png',
    destaque: true,
    ativo: true,
    estoque: 3,
    descricao: 'Impressora 3D de carbono CoreXY com impressão de alta velocidade e nivelamento automático.',
    especificacoes: {
      'Tecnologia': 'FDM',
      'Arquitetura': 'CoreXY',
      'Velocidade Máxima': '500 mm/s',
      'Volume de Impressão': '256×256×256mm',
      'Resolução de Camada': '0.05-0.35mm',
      'Diâmetro do Bico': '0.4mm (padrão)',
      'Temperatura do Bico': 'até 300°C',
      'Temperatura da Mesa': 'até 110°C',
      'Nivelamento': 'Automático',
      'Conectividade': 'WiFi, USB, SD Card',
      'Peso': '13.5 kg',
    }
  },
  {
    id: 'elegoo-orangestorm-giga',
    nome: 'Elegoo OrangeStorm Giga',
    marca: 'Elegoo',
    categoria: 'FDM',
    tipo: 'Cartesiana',
    preco: 18900,
    velocidade: '300 mm/s',
    volume: '800×800×1000mm',
    imagem: '/images/printers/elegoo-orangestorm-giga.png',
    destaque: true,
    ativo: true,
    estoque: 1,
    descricao: 'Impressora 3D FDM de nível industrial com volume gigante de 800×800×1000mm. Ideal para peças de grande escala.',
    especificacoes: {
      'Tecnologia': 'FDM',
      'Arquitetura': 'Cartesiana',
      'Velocidade Máxima': '300 mm/s',
      'Volume de Impressão': '800×800×1000mm',
      'Resolução de Camada': '0.1-0.4mm',
      'Diâmetro do Bico': '0.6mm (padrão)',
      'Temperatura do Bico': 'até 300°C',
      'Temperatura da Mesa': 'até 100°C',
      'Estrutura': 'Alumínio industrial',
      'Peso': '85 kg',
    }
  },
  {
    id: 'sovol-sv08-max',
    nome: 'Sovol SV08 MAX',
    marca: 'Sovol',
    categoria: 'FDM',
    tipo: 'CoreXY',
    preco: 15000,
    velocidade: '700 mm/s',
    volume: '500×500×500mm',
    imagem: '/images/printers/sovol-sv08-max.png',
    destaque: true,
    ativo: true,
    estoque: 1,
    descricao: 'CoreXY de código aberto Voron 2.4 com volume de construção profissional.',
    especificacoes: {
      'Tecnologia': 'FDM',
      'Arquitetura': 'CoreXY (Voron 2.4)',
      'Velocidade Máxima': '700 mm/s',
      'Volume de Impressão': '500×500×500mm',
      'Open Source': 'Sim (Klipper)',
      'Nivelamento': 'Automático com Eddy',
      'Conectividade': 'WiFi, Ethernet',
    }
  },
  {
    id: 'sovol-sv08',
    nome: 'Sovol SV08',
    marca: 'Sovol',
    categoria: 'FDM',
    tipo: 'CoreXY',
    preco: 6800,
    velocidade: '700 mm/s',
    volume: '350×350×350mm',
    imagem: '/images/printers/sovol-sv08.png',
    destaque: false,
    ativo: true,
    estoque: 2,
    descricao: 'CoreXY de código aberto Voron 2.4 com impressão de alta velocidade.',
    especificacoes: {
      'Tecnologia': 'FDM',
      'Arquitetura': 'CoreXY (Voron 2.4)',
      'Velocidade Máxima': '700 mm/s',
      'Volume de Impressão': '350×350×350mm',
      'Open Source': 'Sim (Klipper)',
    }
  },
  {
    id: 'elegoo-saturn4-ultra-12k',
    nome: 'Elegoo Saturn 4 Ultra 12K',
    marca: 'Elegoo',
    categoria: 'Resina',
    tipo: 'MSLA',
    preco: 4800,
    velocidade: '150 mm/h',
    volume: '218.88×122.88×220mm',
    imagem: '/images/printers/elegoo-saturn4-ultra-12k.png',
    destaque: true,
    ativo: true,
    estoque: 2,
    descricao: 'Impressora 3D de resina profissional SLA com resolução 12K.',
    especificacoes: {
      'Tecnologia': 'MSLA (Resina)',
      'Resolução': '12K (11520×5120)',
      'Velocidade de Cura': '150 mm/h',
      'Volume de Impressão': '218.88×122.88×220mm',
      'Tamanho do Pixel': '19μm',
      'Sistema de Inclinação': 'Sim',
      'Câmera IA': 'Sim',
    }
  },
  {
    id: 'elegoo-saturn4-ultra-16k',
    nome: 'Elegoo Saturn 4 Ultra 16K',
    marca: 'Elegoo',
    categoria: 'Resina',
    tipo: 'MSLA',
    preco: 5900,
    velocidade: '150 mm/h',
    volume: '218.88×122.88×220mm',
    imagem: '/images/printers/elegoo-saturn4-ultra-16k.png',
    destaque: true,
    ativo: true,
    estoque: 1,
    descricao: 'Impressora 3D de resina profissional SLA com resolução 16K - máxima qualidade.',
    especificacoes: {
      'Tecnologia': 'MSLA (Resina)',
      'Resolução': '16K (15360×8640)',
      'Velocidade de Cura': '150 mm/h',
      'Volume de Impressão': '218.88×122.88×220mm',
      'Tamanho do Pixel': '14μm',
      'Sistema de Inclinação': 'Sim',
      'Câmera IA': 'Sim',
    }
  },
  {
    id: 'sovol-zero',
    nome: 'Sovol Zero',
    marca: 'Sovol',
    categoria: 'FDM',
    tipo: 'CoreXY',
    preco: 4900,
    velocidade: '1200 mm/s',
    volume: '235×235×250mm',
    imagem: '/images/printers/sovol-zero.png',
    destaque: true,
    ativo: true,
    estoque: 2,
    descricao: 'CoreXY ultra-rápida com digitalização Eddy, detecção de pressão, bocal 350°C.',
    especificacoes: {
      'Tecnologia': 'FDM',
      'Arquitetura': 'CoreXY',
      'Velocidade Máxima': '1200 mm/s',
      'Aceleração': '25000 mm/s²',
      'Volume de Impressão': '235×235×250mm',
      'Temperatura do Bico': 'até 350°C',
      'Sensores': 'Eddy, Pressão',
    }
  },
  {
    id: 'elegoo-mars5-ultra',
    nome: 'Elegoo Mars 5 Ultra 9K',
    marca: 'Elegoo',
    categoria: 'Resina',
    tipo: 'MSLA',
    preco: 2900,
    velocidade: '150 mm/h',
    volume: '153.36×77.76×165mm',
    imagem: '/images/products/mars-5-ultra-9k.jpg',
    destaque: false,
    ativo: true,
    estoque: 3,
    descricao: 'Resina compacta 9K ideal para iniciantes. Tecnologia de inclinação, câmera IA e impressão via WiFi.',
    especificacoes: {
      'Tecnologia': 'MSLA (Resina)',
      'Resolução': '9K',
      'Velocidade de Cura': '150 mm/h',
      'Volume de Impressão': '153.36×77.76×165mm',
      'Conectividade': 'WiFi',
      'Câmera IA': 'Sim',
    }
  },
  {
    id: 'elegoo-saturn3-ultra-12k',
    nome: 'Elegoo Saturn 3 Ultra 12K',
    marca: 'Elegoo',
    categoria: 'Resina',
    tipo: 'MSLA',
    preco: 3700,
    velocidade: '150 mm/h',
    volume: '219×123×260mm',
    imagem: '/images/printers/elegoo-saturn3-ultra.png',
    destaque: false,
    ativo: true,
    estoque: 3,
    descricao: 'Mono MSLA 12K com LCD de 10 polegadas e alta velocidade de impressão.',
    especificacoes: {
      'Tecnologia': 'MSLA (Resina)',
      'Resolução': '12K',
      'LCD': '10 polegadas',
      'Velocidade de Cura': '150 mm/h',
      'Volume de Impressão': '219×123×260mm',
    }
  },
];

interface Variacao {
  id: string;
  nome: string;
  preco: number;
  estoque: number;
  imagem?: string;
  descricao?: string;
}

interface ProdutoAdmin {
  id: string;
  nome: string;
  marca: string;
  categoria: string;
  tipo?: string;
  preco: number;
  valorPago?: number;
  estoque: number;
  ativo: boolean;
  destaque: boolean;
  descricao: string;
  imagem: string;
  imagemBase64?: string;
  imagens?: string[];
  modelo3d?: string;
  modelo3dNome?: string;
  velocidade?: string;
  volume?: string;
  variacoes?: Variacao[];
  especificacoes?: Record<string, string>;
  source?: 'catalogo' | 'custom';
}

export default function AdminProdutoDetalhe() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [produto, setProduto] = useState<ProdutoAdmin | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [formData, setFormData] = useState<Partial<ProdutoAdmin>>({});

  useEffect(() => {
    if (!id) return;

    // Buscar produto do catálogo ou localStorage
    const catalogOverrides = JSON.parse(localStorage.getItem('admin_catalog_overrides') || '{}');
    const customProdutos = JSON.parse(localStorage.getItem('admin_custom_produtos') || '[]');
    const deletedCatalogIds = JSON.parse(localStorage.getItem('admin_deleted_catalog_ids') || '[]');

    // Buscar no catálogo base
    let foundProduct = catalogoImpressoras.find(p => p.id === id);
    
    if (foundProduct && !deletedCatalogIds.includes(id)) {
      const overrides = catalogOverrides[id] || {};
      setProduto({
        ...foundProduct,
        ...overrides,
        source: 'catalogo' as const,
        imagens: foundProduct.imagem ? [foundProduct.imagem] : [],
      });
    } else {
      // Buscar em produtos customizados
      const customProduct = customProdutos.find((p: ProdutoAdmin) => p.id === id);
      if (customProduct) {
        setProduto({
          ...customProduct,
          source: 'custom' as const,
        });
      }
    }

    setLoading(false);
  }, [id]);

  useEffect(() => {
    if (produto) {
      setFormData({ ...produto });
    }
  }, [produto]);

  const handleSave = () => {
    if (!produto || !formData) return;

    if (produto.source === 'catalogo') {
      const catalogOverrides = JSON.parse(localStorage.getItem('admin_catalog_overrides') || '{}');
      catalogOverrides[produto.id] = { ...formData };
      localStorage.setItem('admin_catalog_overrides', JSON.stringify(catalogOverrides));
    } else {
      const customProdutos = JSON.parse(localStorage.getItem('admin_custom_produtos') || '[]');
      const updatedCustom = customProdutos.map((p: ProdutoAdmin) => 
        p.id === produto.id ? { ...p, ...formData } : p
      );
      localStorage.setItem('admin_custom_produtos', JSON.stringify(updatedCustom));
    }

    setProduto({ ...produto, ...formData } as ProdutoAdmin);
    setEditMode(false);
  };

  const handleDelete = () => {
    if (!produto) return;
    if (!window.confirm(`Tem certeza que deseja excluir "${produto.nome}"?`)) return;

    if (produto.source === 'catalogo') {
      const deletedIds = JSON.parse(localStorage.getItem('admin_deleted_catalog_ids') || '[]');
      deletedIds.push(produto.id);
      localStorage.setItem('admin_deleted_catalog_ids', JSON.stringify(deletedIds));
    } else {
      const customProdutos = JSON.parse(localStorage.getItem('admin_custom_produtos') || '[]');
      const updated = customProdutos.filter((p: ProdutoAdmin) => p.id !== produto.id);
      localStorage.setItem('admin_custom_produtos', JSON.stringify(updated));
    }

    navigate('/admin/produtos');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f1117] flex">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </main>
      </div>
    );
  }

  if (!produto) {
    return (
      <div className="min-h-screen bg-[#0f1117] flex">
        <Sidebar />
        <main className="flex-1 flex flex-col items-center justify-center">
          <Package className="w-16 h-16 text-gray-600 mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Produto não encontrado</h2>
          <p className="text-gray-400 mb-4">O produto com ID "{id}" não existe.</p>
          <Button onClick={() => navigate('/admin/produtos')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar aos Produtos
          </Button>
        </main>
      </div>
    );
  }

  const images = produto.imagens && produto.imagens.length > 0 
    ? produto.imagens 
    : (produto.imagem ? [produto.imagem] : []);

  return (
    <div className="min-h-screen bg-[#0f1117] flex">
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-[#161923] border-b border-white/10 p-4 sticky top-0 z-10">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin/produtos')}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                title="Voltar aos Produtos"
                data-testid="back-to-products"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Package className="text-blue-400" size={22} />
                  Detalhes do Produto
                </h2>
                <p className="text-sm text-gray-400 mt-0.5">{produto.nome}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!editMode ? (
                <>
                  <Button
                    onClick={() => setEditMode(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleDelete}
                    className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Excluir
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={() => setEditMode(false)}
                    variant="outline"
                    className="border-white/10"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSave}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Salvar
                  </Button>
                </>
              )}
            </div>
          </div>
        </header>

        <div className="p-6 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Coluna Esquerda - Imagens */}
            <div className="space-y-4">
              {/* Imagem Principal */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative aspect-square bg-[#161923] rounded-2xl border border-white/10 overflow-hidden"
              >
                {images.length > 0 ? (
                  <img
                    src={produto.imagemBase64 || images[selectedImageIndex]}
                    alt={produto.nome}
                    className="w-full h-full object-contain p-8"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-24 h-24 text-gray-600" />
                  </div>
                )}

                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    produto.categoria === 'FDM' ? 'bg-blue-500/80 text-white' : 'bg-purple-500/80 text-white'
                  }`}>
                    {produto.categoria}
                  </span>
                  {produto.destaque && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-amber-500/80 text-white flex items-center gap-1">
                      <Star size={10} /> Destaque
                    </span>
                  )}
                  {!produto.ativo && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-red-500/80 text-white flex items-center gap-1">
                      <EyeOff size={10} /> Inativo
                    </span>
                  )}
                </div>

                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    produto.source === 'catalogo' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {produto.source === 'catalogo' ? 'Catálogo' : 'Manual'}
                  </span>
                </div>

                {/* Navegação de imagens */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setSelectedImageIndex(i => i > 0 ? i - 1 : images.length - 1)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setSelectedImageIndex(i => i < images.length - 1 ? i + 1 : 0)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </motion.div>

              {/* Miniaturas */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImageIndex === idx ? 'border-blue-500' : 'border-white/10 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-contain bg-[#161923] p-2" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Coluna Direita - Informações */}
            <div className="space-y-6">
              {/* Informações Básicas */}
              <div className="bg-[#161923] rounded-xl border border-white/10 p-6">
                <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Tag size={16} />
                  Informações Básicas
                </h3>

                {editMode ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-400 mb-1 block">Nome do Produto</label>
                      <Input
                        value={formData.nome || ''}
                        onChange={e => setFormData({ ...formData, nome: e.target.value })}
                        className="bg-white/5 border-white/10"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-400 mb-1 block">Marca</label>
                        <Input
                          value={formData.marca || ''}
                          onChange={e => setFormData({ ...formData, marca: e.target.value })}
                          className="bg-white/5 border-white/10"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-gray-400 mb-1 block">Categoria</label>
                        <select
                          value={formData.categoria || 'FDM'}
                          onChange={e => setFormData({ ...formData, categoria: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-lg text-white text-sm"
                        >
                          <option value="FDM">FDM</option>
                          <option value="Resina">Resina</option>
                          <option value="Filamento">Filamento</option>
                          <option value="Acessório">Acessório</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 mb-1 block">Tipo / Arquitetura</label>
                      <Input
                        value={formData.tipo || ''}
                        onChange={e => setFormData({ ...formData, tipo: e.target.value })}
                        className="bg-white/5 border-white/10"
                        placeholder="Ex: CoreXY, MSLA"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 mb-1 block">Descrição</label>
                      <textarea
                        value={formData.descricao || ''}
                        onChange={e => setFormData({ ...formData, descricao: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm resize-none"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <h1 className="text-2xl font-bold text-white">{produto.nome}</h1>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-gray-400">Marca: <span className="text-white font-medium">{produto.marca}</span></span>
                      <span className="text-gray-400">Categoria: <span className="text-white font-medium">{produto.categoria}</span></span>
                      {produto.tipo && (
                        <span className="text-gray-400">Tipo: <span className="text-white font-medium">{produto.tipo}</span></span>
                      )}
                    </div>
                    <p className="text-gray-300 leading-relaxed">{produto.descricao}</p>
                  </div>
                )}
              </div>

              {/* Preço e Estoque */}
              <div className="bg-[#161923] rounded-xl border border-white/10 p-6">
                <h3 className="text-sm font-bold text-green-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <DollarSign size={16} />
                  Preço e Estoque
                </h3>

                {editMode ? (
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm text-gray-400 mb-1 block">Preço de Venda (R$)</label>
                      <Input
                        type="number"
                        value={formData.preco || ''}
                        onChange={e => setFormData({ ...formData, preco: parseFloat(e.target.value) || 0 })}
                        className="bg-white/5 border-white/10"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 mb-1 block">Custo (R$)</label>
                      <Input
                        type="number"
                        value={formData.valorPago || ''}
                        onChange={e => setFormData({ ...formData, valorPago: parseFloat(e.target.value) || undefined })}
                        className="bg-white/5 border-white/10"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 mb-1 block">Estoque</label>
                      <Input
                        type="number"
                        value={formData.estoque || ''}
                        onChange={e => setFormData({ ...formData, estoque: parseInt(e.target.value) || 0 })}
                        className="bg-white/5 border-white/10"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-white/5 rounded-xl">
                      <p className="text-xs text-gray-500 mb-1">Preço de Venda</p>
                      <p className="text-2xl font-bold text-green-400">R$ {produto.preco.toLocaleString('pt-BR')}</p>
                    </div>
                    {produto.valorPago && (
                      <div className="text-center p-4 bg-white/5 rounded-xl">
                        <p className="text-xs text-gray-500 mb-1">Custo</p>
                        <p className="text-2xl font-bold text-red-400">R$ {produto.valorPago.toLocaleString('pt-BR')}</p>
                      </div>
                    )}
                    <div className="text-center p-4 bg-white/5 rounded-xl">
                      <p className="text-xs text-gray-500 mb-1">Em Estoque</p>
                      <p className={`text-2xl font-bold ${produto.estoque > 0 ? 'text-blue-400' : 'text-red-400'}`}>
                        {produto.estoque} un.
                      </p>
                    </div>
                  </div>
                )}

                {produto.valorPago && produto.preco > 0 && !editMode && (
                  <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-center">
                    <p className="text-sm text-emerald-400">
                      Margem de Lucro: R$ {(produto.preco - produto.valorPago).toLocaleString('pt-BR')} ({Math.round(((produto.preco - produto.valorPago) / produto.preco) * 100)}%)
                    </p>
                  </div>
                )}
              </div>

              {/* Status */}
              <div className="bg-[#161923] rounded-xl border border-white/10 p-6">
                <h3 className="text-sm font-bold text-purple-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Eye size={16} />
                  Status e Visibilidade
                </h3>

                {editMode ? (
                  <div className="flex gap-4">
                    <button
                      onClick={() => setFormData({ ...formData, ativo: !formData.ativo })}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border text-sm font-medium transition-colors ${
                        formData.ativo ? 'bg-green-500/20 border-green-500/40 text-green-400' : 'bg-white/5 border-white/10 text-gray-400'
                      }`}
                    >
                      {formData.ativo ? <Eye size={18} /> : <EyeOff size={18} />}
                      {formData.ativo ? 'Produto Ativo' : 'Produto Inativo'}
                    </button>
                    <button
                      onClick={() => setFormData({ ...formData, destaque: !formData.destaque })}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border text-sm font-medium transition-colors ${
                        formData.destaque ? 'bg-amber-500/20 border-amber-500/40 text-amber-400' : 'bg-white/5 border-white/10 text-gray-400'
                      }`}
                    >
                      <Star size={18} fill={formData.destaque ? 'currentColor' : 'none'} />
                      {formData.destaque ? 'Em Destaque' : 'Sem Destaque'}
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-4">
                    <div className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg ${
                      produto.ativo ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                    }`}>
                      {produto.ativo ? <Eye size={18} /> : <EyeOff size={18} />}
                      <span className="font-medium">{produto.ativo ? 'Ativo no Site' : 'Oculto do Site'}</span>
                    </div>
                    <div className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg ${
                      produto.destaque ? 'bg-amber-500/10 text-amber-400' : 'bg-white/5 text-gray-400'
                    }`}>
                      <Star size={18} fill={produto.destaque ? 'currentColor' : 'none'} />
                      <span className="font-medium">{produto.destaque ? 'Em Destaque' : 'Normal'}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Especificações Técnicas */}
              {produto.especificacoes && Object.keys(produto.especificacoes).length > 0 && (
                <div className="bg-[#161923] rounded-xl border border-white/10 p-6">
                  <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Layers size={16} />
                    Especificações Técnicas
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(produto.especificacoes).map(([key, value]) => (
                      <div key={key} className="flex justify-between py-2 px-3 bg-white/5 rounded-lg">
                        <span className="text-gray-400 text-sm">{key}</span>
                        <span className="text-white text-sm font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Variações */}
              {produto.variacoes && produto.variacoes.length > 0 && (
                <div className="bg-[#161923] rounded-xl border border-white/10 p-6">
                  <h3 className="text-sm font-bold text-orange-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <GitBranch size={16} />
                    Variações do Produto
                  </h3>
                  <div className="space-y-2">
                    {produto.variacoes.map(v => (
                      <div key={v.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div>
                          <p className="text-white font-medium">{v.nome}</p>
                          {v.descricao && <p className="text-gray-400 text-xs">{v.descricao}</p>}
                        </div>
                        <div className="text-right">
                          <p className="text-green-400 font-bold">R$ {v.preco.toLocaleString('pt-BR')}</p>
                          <p className="text-gray-500 text-xs">Estoque: {v.estoque} un.</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Detalhes Técnicos */}
              <div className="bg-[#161923] rounded-xl border border-white/10 p-6">
                <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Zap size={16} />
                  Detalhes Técnicos
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {produto.velocidade && (
                    <div className="p-3 bg-white/5 rounded-lg">
                      <p className="text-gray-400 text-xs mb-1">Velocidade</p>
                      <p className="text-white font-medium">{produto.velocidade}</p>
                    </div>
                  )}
                  {produto.volume && (
                    <div className="p-3 bg-white/5 rounded-lg">
                      <p className="text-gray-400 text-xs mb-1">Volume de Impressão</p>
                      <p className="text-white font-medium">{produto.volume}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
