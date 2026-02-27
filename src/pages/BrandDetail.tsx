import React, {
  useState,
  useEffect
} from 'react';
import {
  useParams,
  Link
} from 'react-router-dom';
import {
  ArrowLeft,
  ShoppingCart
} from 'lucide-react';
import {
  produtosAPI
} from '../lib/apiClient';
import { Layout } from '../components/layout/Layout';

const actualBrandsData: Record < string, {
  name: string;
  description: string;
  longDescription: string;
  categories: string[];
} > = {
  creality: {
    name: 'Creality',
    description: 'Líder mundial em impressoras 3D acessíveis',
    longDescription: 'A Creality é uma das maiores fabricantes de impressoras 3D do mundo, conhecida por modelos como Ender 3, CR-10 e a nova série K1. Oferecemos peças de reposição, upgrades e acessórios originais e compatíveis.',
    categories: ['Todos', 'PEI', 'Hotends', 'Motores', 'Correias', 'Bicos', 'Extrusoras'],
  },
  'bambu-lab': {
    name: 'Bambu Lab',
    description: 'Inovação em 3D com alta velocidade',        
    longDescription: 'A Bambu Lab revolucionou o mercado com impressoras CoreXY de alta velocidade. Oferecemos peças originais e compatíveis para as séries X1, P1 e A1.',
    categories: ['Todos', 'AMS', 'Hotends', 'Bicos', 'PEI', 'Peças'],
  },
  prusa: {
    name: 'Prusa',
    description: 'Referência em qualidade open-source',
    longDescription: 'A Prusa Research é referência em qualidade e confiabilidade. Oferecemos peças originais e compatíveis para MK4, MK3S+, Mini e impressoras SLA.',
    categories: ['Todos', 'Hotends', 'PEI', 'Extrusoras', 'Peças', 'Eletrônica'],
  },
  anycubic: {
    name: 'Anycubic',
    description: 'Especialista em 3D de resina e FDM',
    longDescription: 'A Anycubic é conhecida por suas impressoras de resina Photon e FDM Kobra. Oferecemos resinas, FEP e peças de reposição.',
    categories: ['Todos', 'Resinas', 'FEP', 'Peças', 'Acessórios'],
  },
  voron: {
    name: 'Voron',
    description: 'Alta performance em DIY 3D printing',
    longDescription: 'O projeto Voron é referência em impressoras CoreXY de alto desempenho. Oferecemos kits completos e peças individuais para Voron 0, Trident e 2.4.',
    categories: ['Todos', 'Kits', 'Rails Lineares', 'Motores', 'Hotends', 'Eletrônica'],
  },
  elegoo: {
    name: 'Elegoo',
    description: 'Excelente custo-benefício em resina',
    longDescription: 'A Elegoo é conhecida por impressoras de resina acessíveis como Mars e Saturn. Oferecemos resinas, FEP e acessórios.',
    categories: ['Todos', 'Resinas', 'FEP', 'Acessórios', 'Peças'],
  },
  flashforge: {
    name: 'Flashforge',
    description: 'Soluções profissionais e educacionais',
    longDescription: 'A Flashforge oferece impressoras 3D confiáveis para uso profissional e educacional. Oferecemos peças e acessórios para as linhas Adventurer e Guider.',
    categories: ['Todos', 'Peças', 'Bicos', 'Acessórios'],
  }
};

export default function BrandDetail() {
  const {
    brandId
  } = useParams < {
    brandId: string
  } > ();
  const [products, setProducts] = useState < any[] > ([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!brandId) return;
      setLoading(true);
      try {
        const brandName = (brandId === 'bambu-lab') ? 'Bambu Lab' :
          brandId.charAt(0).toUpperCase() + brandId.slice(1);
        
        // Buscar diretamente por marca no Supabase
        const data = await produtosAPI.getByBrand(brandName);
        setProducts(data || []);
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [brandId]);

  const internalBrand = brandId ? actualBrandsData[brandId] : null;

  if (!internalBrand) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Marca não encontrada</h1>
            <Link to="/" className="text-blue-600 hover:underline">Voltar para a home</Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <div className="flex items-center gap-4 mb-4">
              <Link to="/marcas" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </Link>
              <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight">{internalBrand.name}</h1>
            </div>
            <p className="text-xl text-gray-600 max-w-3xl leading-relaxed">{internalBrand.longDescription}</p>
            <p className="mt-4 text-sm font-medium text-gray-500">
              {products.length} {products.length === 1 ? 'produto encontrado' : 'produtos encontrados'}
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-8">
            <aside className="w-full md:w-1/4">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Categorias</h3>
                <ul className="space-y-2">
                  {internalBrand.categories.map((cat) => (
                    <li key={cat} className="text-gray-600 hover:text-blue-600 cursor-pointer transition-all flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                      {cat}
                    </li>
                  ))}
                </ul>
              </div>
            </aside>

            <main className="flex-1">
              {loading ? (
                <div className="flex justify-center items-center h-64">
                   <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : products.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {products.map((product: any) => (
                    <div key={product.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group">
                      <div className="aspect-w-1 aspect-h-1 bg-gray-100 relative h-64">
                        <img 
                          src={product.images && product.images.length > 0 ? product.images[0] : '/placeholder-product.svg'} 
                          alt={product.name} 
                          className="w-full h-full object-center object-contain group-hover:scale-105 transition-transform duration-500" 
                        />
                      </div>
                      <div className="p-6">
                        <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">{product.category_name || product.category}</div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">{product.name}</h3>
                        <p className="text-gray-600 text-sm line-clamp-2 mb-4">{product.description}</p>
                        <div className="flex items-center justify-between mt-4">
                          <div>
                            <p className="text-xl font-bold text-gray-900">R$ {Number(product.price).toFixed(2).replace('.', ',')}</p>
                            {product.original_price && (
                              <p className="text-sm text-gray-400 line-through">R$ {Number(product.original_price).toFixed(2).replace('.', ',')}</p>
                            )}
                          </div>
                          <Link to={`/produtos/${product.id}`} className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors">
                            <ShoppingCart className="w-5 h-5" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                  <p className="text-gray-500 text-lg font-medium">Nenhum produto encontrado para esta marca.</p>
                  <p className="text-gray-400 text-sm mt-1">Os produtos cadastrados no painel aparecerão aqui.</p>
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    </Layout>
  );
}
