import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingCart, Search, Eye, Trash2, Plus, Image as ImageIcon,
  Edit, ExternalLink, Package, CheckCircle, XCircle, Star
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Sidebar from '@/components/admin/Sidebar';

// Catálogo local de produtos do site
const catalogoProdutosSite = [
  {
    id: 'elegoo-saturn-3-ultra',
    nome: 'Elegoo Saturn 3 Ultra 12K',
    marca: 'Elegoo',
    categoria: 'Resina',
    preco: 3700,
    estoque: 3,
    active: true,
    featured: true,
    imagem: '/images/printers/elegoo-saturn-3-ultra.png',
    descricao: 'Impressora 3D de resina 12K com velocidade de até 150mm/h',
  },
  {
    id: 'elegoo-centauri-carbon',
    nome: 'Elegoo Centauri Carbon CoreXY',
    marca: 'Elegoo',
    categoria: 'FDM',
    preco: 4360,
    estoque: 2,
    active: true,
    featured: false,
    imagem: '/images/printers/elegoo-centauri.png',
    descricao: 'CoreXY de carbono com 500mm/s de velocidade',
  },
  {
    id: 'elegoo-saturn-4-ultra-12k',
    nome: 'Elegoo Saturn 4 Ultra 12K',
    marca: 'Elegoo',
    categoria: 'Resina',
    preco: 4800,
    estoque: 2,
    active: true,
    featured: false,
    imagem: '/images/printers/elegoo-saturn-4-ultra-12k.png',
    descricao: 'Impressora SLA profissional com volume 218x122x220mm',
  },
  {
    id: 'elegoo-saturn-4-ultra-16k',
    nome: 'Elegoo Saturn 4 Ultra 16K',
    marca: 'Elegoo',
    categoria: 'Resina',
    preco: 5900,
    estoque: 1,
    active: true,
    featured: true,
    imagem: '/images/printers/elegoo-saturn-4-ultra-16k.png',
    descricao: 'Resolução 16K profissional com volume 218x122x220mm',
  },
  {
    id: 'sovol-zero',
    nome: 'Sovol Zero 1200mm/s',
    marca: 'Sovol',
    categoria: 'FDM',
    preco: 4900,
    estoque: 2,
    active: true,
    featured: false,
    imagem: '/images/printers/sovol-zero.png',
    descricao: 'CoreXY de alta velocidade com Eddy scan e bocal 350°C',
  },
  {
    id: 'sovol-sv08',
    nome: 'Sovol SV08 CoreXY 700mm/s',
    marca: 'Sovol',
    categoria: 'FDM',
    preco: 6800,
    estoque: 2,
    active: true,
    featured: true,
    imagem: '/images/printers/sovol-sv08.png',
    descricao: 'Open-source Voron 2.4 com 700mm/s de velocidade',
  },
  {
    id: 'sovol-sv08-max',
    nome: 'Sovol SV08 MAX CoreXY',
    marca: 'Sovol',
    categoria: 'FDM',
    preco: 15000,
    estoque: 1,
    active: true,
    featured: true,
    imagem: '/images/printers/sovol-sv08-max.png',
    descricao: 'Volume gigante 19.7x19.7x19.7 pol com 700mm/s',
  },
];

export default function AdminProdutosSite() {
  const navigate = useNavigate();
  const [produtos, setProdutos] = useState(catalogoProdutosSite);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBrand, setFilterBrand] = useState('todos');
  const [filterCategory, setFilterCategory] = useState('todos');

  const filteredProdutos = produtos.filter((produto) => {
    const matchesSearch =
      produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      produto.marca.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBrand = filterBrand === 'todos' || produto.marca === filterBrand;
    const matchesCategory = filterCategory === 'todos' || produto.categoria === filterCategory;
    return matchesSearch && matchesBrand && matchesCategory;
  });

  const totalEstoque = produtos.reduce((acc, p) => acc + p.estoque, 0);
  const valorEstoque = produtos.reduce((acc, p) => acc + (p.preco * p.estoque), 0);
  const ativos = produtos.filter(p => p.active).length;
  const destaques = produtos.filter(p => p.featured).length;

  return (
    <div className="min-h-screen bg-[#0f1117] flex">
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-[#161923] border-b border-white/10 p-4 sticky top-0 z-10">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <ShoppingCart className="text-indigo-400" size={22} />
                Produtos do Site
              </h2>
              <p className="text-sm text-gray-400 mt-1">Gerenciar produtos exibidos na loja</p>
            </div>
            <div className="flex items-center gap-3">
              <a href="/produtos" target="_blank" className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1">
                Ver Loja <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* Cards de métricas */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#161923] rounded-xl border border-white/10 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Package className="text-blue-400" size={18} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{produtos.length}</p>
                  <p className="text-xs text-gray-400">Total Produtos</p>
                </div>
              </div>
            </div>
            <div className="bg-[#161923] rounded-xl border border-white/10 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <CheckCircle className="text-green-400" size={18} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{ativos}</p>
                  <p className="text-xs text-gray-400">Ativos</p>
                </div>
              </div>
            </div>
            <div className="bg-[#161923] rounded-xl border border-white/10 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                  <Star className="text-amber-400" size={18} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{destaques}</p>
                  <p className="text-xs text-gray-400">Destaques</p>
                </div>
              </div>
            </div>
            <div className="bg-[#161923] rounded-xl border border-white/10 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <ShoppingCart className="text-purple-400" size={18} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{fmtBRL(valorEstoque)}</p>
                  <p className="text-xs text-gray-400">Valor Estoque</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filtros */}
          <div className="bg-[#161923] rounded-xl border border-white/10 p-4">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  placeholder="Buscar por nome ou marca..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <select
                value={filterBrand}
                onChange={(e) => setFilterBrand(e.target.value)}
                className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="todos">Todas Marcas</option>
                <option value="Elegoo">Elegoo</option>
                <option value="Sovol">Sovol</option>
              </select>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="todos">Todas Categorias</option>
                <option value="FDM">FDM</option>
                <option value="Resina">Resina</option>
              </select>
            </div>
          </div>

          {/* Lista de produtos */}
          <div className="space-y-3">
            {filteredProdutos.map((produto) => (
              <div key={produto.id} className="bg-[#161923] rounded-xl border border-white/10 p-4 hover:border-white/20 transition-colors">
                <div className="flex items-center gap-4">
                  {/* Imagem */}
                  <div className="w-20 h-20 flex-shrink-0 bg-white/5 rounded-lg overflow-hidden border border-white/10">
                    <img
                      src={produto.imagem}
                      alt={produto.nome}
                      className="w-full h-full object-contain p-1"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-white truncate">{produto.nome}</h3>
                      {produto.featured && (
                        <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-[10px] font-bold rounded-full">DESTAQUE</span>
                      )}
                      {produto.active ? (
                        <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-[10px] font-bold rounded-full">ATIVO</span>
                      ) : (
                        <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-[10px] font-bold rounded-full">INATIVO</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mb-1">{produto.descricao}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Marca: <span className="text-gray-300">{produto.marca}</span></span>
                      <span>Tipo: <span className="text-gray-300">{produto.categoria}</span></span>
                      <span>Estoque: <span className="text-gray-300">{produto.estoque} un.</span></span>
                    </div>
                  </div>

                  {/* Preço */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-lg font-bold text-green-400">{fmtBRL(produto.preco)}</p>
                    <p className="text-xs text-gray-500">+ frete</p>
                  </div>

                  {/* Ações */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => window.open(`/checkout/${produto.id}`, '_blank')}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-blue-400 transition-colors"
                      title="Ver no site"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-amber-400 transition-colors"
                      title="Editar"
                    >
                      <Edit size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredProdutos.length === 0 && (
            <div className="text-center py-20 bg-[#161923] rounded-xl border border-white/10">
              <ShoppingCart className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 font-medium">Nenhum produto encontrado</p>
              <p className="text-sm text-gray-500 mt-1">Tente ajustar os filtros de busca</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
