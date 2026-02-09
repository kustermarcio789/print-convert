import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, Plus, Edit, Trash2, Save, X, Upload, Image as ImageIcon,
  Search, Filter, Eye, DollarSign, Tag, Copy
} from 'lucide-react';
import { getProducts, saveProducts, deleteProduct, duplicateProduct, type Product } from '@/data/products';

interface SiteProduct {
  id: string;
  name: string;
  brand: string;
  category: string;
  description: string;
  price: number;
  originalPrice?: number;
  stock: number;
  images: string[];
  modelo3D?: string; // URL do arquivo GLB/GLTF
  specifications: { [key: string]: string };
  tags: string[];
  featured: boolean;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export default function AdminProdutosSite() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<SiteProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<SiteProduct[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBrand, setFilterBrand] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<SiteProduct | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<SiteProduct>>({
    name: '',
    brand: '',
    category: '',
    description: '',
    price: 0,
    originalPrice: 0,
    stock: 0,
    images: [],
    specifications: {},
    tags: [],
    featured: false,
    active: true
  });

  const [newSpec, setNewSpec] = useState({ key: '', value: '' });
  const [newTag, setNewTag] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [modelo3DFile, setModelo3DFile] = useState<File | null>(null);

  // Carregar produtos
  useEffect(() => {
    loadProducts();
  }, []);

  // Filtrar produtos
  useEffect(() => {
    let filtered = products;

    // Filtro por marca
    if (filterBrand !== 'all') {
      filtered = filtered.filter(p => p.brand === filterBrand);
    }

    // Filtro por busca
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  }, [products, searchTerm, filterBrand]);

  const loadProducts = () => {
    const allProducts = getProducts();
    setProducts(allProducts as any);
  };

  const saveProductsToStorage = (newProducts: SiteProduct[]) => {
    saveProducts(newProducts as any);
    setProducts(newProducts);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingProduct) {
      // Atualizar produto existente
      const updated = products.map(p => 
        p.id === editingProduct.id 
          ? { ...formData, id: p.id, updatedAt: new Date() } as SiteProduct
          : p
      );
      saveProductsToStorage(updated);
    } else {
      // Criar novo produto
      const newProduct: SiteProduct = {
        ...formData,
        id: `prod_${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date()
      } as SiteProduct;
      saveProductsToStorage([...products, newProduct]);
    }

    resetForm();
  };

  const handleEdit = (product: SiteProduct) => {
    setEditingProduct(product);
    setFormData(product);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      saveProductsToStorage(products.filter(p => p.id !== id));
    }
  };

  const handleToggleActive = (id: string) => {
    const updated = products.map(p => 
      p.id === id ? { ...p, active: !p.active, updatedAt: new Date() } : p
    );
    saveProductsToStorage(updated);
  };

  const handleToggleFeatured = (id: string) => {
    const updated = products.map(p => 
      p.id === id ? { ...p, featured: !p.featured, updatedAt: new Date() } : p
    );
    saveProductsToStorage(updated);
  };

  const handleDuplicate = (id: string) => {
    const duplicated = duplicateProduct(id);
    if (duplicated) {
      loadProducts();
    }
  };

  const addSpecification = () => {
    if (newSpec.key && newSpec.value) {
      setFormData({
        ...formData,
        specifications: {
          ...formData.specifications,
          [newSpec.key]: newSpec.value
        }
      });
      setNewSpec({ key: '', value: '' });
    }
  };

  const removeSpecification = (key: string) => {
    const specs = { ...formData.specifications };
    delete specs[key];
    setFormData({ ...formData, specifications: specs });
  };

  const addTag = () => {
    if (newTag && !formData.tags?.includes(newTag)) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), newTag]
      });
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter(t => t !== tag) || []
    });
  };

  const addImage = () => {
    if (imageUrl) {
      setFormData({
        ...formData,
        images: [...(formData.images || []), imageUrl]
      });
      setImageUrl('');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData({
            ...formData,
            images: [...(formData.images || []), reader.result as string]
          });
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleModelo3DUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          modelo3D: reader.result as string
        });
        setModelo3DFile(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images?.filter((_, i) => i !== index) || []
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      brand: '',
      category: '',
      description: '',
      price: 0,
      originalPrice: 0,
      stock: 0,
      images: [],
      specifications: {},
      tags: [],
      featured: false,
      active: true
    });
    setEditingProduct(null);
    setShowForm(false);
  };

  // Estatísticas
  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.active).length;
  const featuredProducts = products.filter(p => p.featured).length;
  const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);

  // Marcas únicas
  const brands = Array.from(new Set(products.map(p => p.brand)));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Produtos do Site</h1>
              <p className="text-sm text-gray-600">Gerencie os produtos exibidos no e-commerce</p>
            </div>
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="text-gray-600 hover:text-gray-900"
            >
              ← Voltar
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Produtos</p>
                <p className="text-2xl font-bold text-gray-900">{totalProducts}</p>
              </div>
              <Package className="h-10 w-10 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Produtos Ativos</p>
                <p className="text-2xl font-bold text-green-600">{activeProducts}</p>
              </div>
              <Eye className="h-10 w-10 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Em Destaque</p>
                <p className="text-2xl font-bold text-yellow-600">{featuredProducts}</p>
              </div>
              <Tag className="h-10 w-10 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Valor em Estoque</p>
                <p className="text-2xl font-bold text-gray-900">
                  R$ {totalValue.toFixed(2)}
                </p>
              </div>
              <DollarSign className="h-10 w-10 text-green-600" />
            </div>
          </div>
        </div>

        {/* Filtros e Busca */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar produtos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <select
              value={filterBrand}
              onChange={(e) => setFilterBrand(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todas as Marcas</option>
              {brands.map(brand => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>

            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus className="h-5 w-5" />
              Novo Produto
            </button>
          </div>
        </div>

        {/* Formulário */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full my-8">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    {editingProduct ? 'Editar Produto' : 'Novo Produto'}
                  </h2>
                  <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Informações Básicas */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Informações Básicas</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nome do Produto *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Marca *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.brand}
                          onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Categoria *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Descrição *
                        </label>
                        <textarea
                          required
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Preço (R$) *
                        </label>
                        <input
                          type="number"
                          required
                          step="0.01"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Preço Original (R$)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.originalPrice}
                          onChange={(e) => setFormData({ ...formData, originalPrice: Number(e.target.value) })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Estoque *
                        </label>
                        <input
                          type="number"
                          required
                          value={formData.stock}
                          onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={formData.featured}
                            onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">Produto em Destaque</span>
                        </label>

                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={formData.active}
                            onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">Produto Ativo</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Imagens */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Imagens</h3>
                    <div className="space-y-4">
                      <div className="flex flex-col gap-4">
                        {/* Upload de Arquivo */}
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 transition-colors bg-gray-50">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-8 h-8 mb-2 text-gray-400" />
                            <p className="text-sm text-gray-500 font-medium">Clique para fazer upload de imagens</p>
                            <p className="text-xs text-gray-400">PNG, JPG, WEBP (Máx. 5MB cada)</p>
                          </div>
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            multiple
                            onChange={handleImageUpload}
                          />
                        </label>

                        {/* Ou adicionar por URL */}
                        <div className="flex gap-2">
                          <input
                            type="url"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            placeholder="Ou cole a URL da imagem"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          />
                          <button
                            type="button"
                            onClick={addImage}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                          >
                            <Plus className="h-5 w-5" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-4">
                        {formData.images?.map((img, index) => (
                          <div key={index} className="relative group">
                            <img 
                              src={img} 
                              alt={`Produto ${index + 1}`}
                              className="w-full h-32 object-cover rounded-md"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Modelo 3D */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Modelo 3D (GLB/GLTF)</h3>
                    <div className="space-y-4">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 transition-colors bg-gray-50">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Package className="w-8 h-8 mb-2 text-gray-400" />
                          <p className="text-sm text-gray-500 font-medium">Clique para fazer upload do modelo 3D</p>
                          <p className="text-xs text-gray-400">GLB, GLTF (Máx. 50MB)</p>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept=".glb,.gltf"
                          onChange={handleModelo3DUpload}
                        />
                      </label>
                      {formData.modelo3D && (
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Package className="w-5 h-5 text-green-600" />
                            <span className="text-sm text-green-700 font-medium">
                              {modelo3DFile?.name || 'Modelo 3D carregado'}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, modelo3D: undefined });
                              setModelo3DFile(null);
                            }}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Especificações */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Especificações</h3>
                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newSpec.key}
                          onChange={(e) => setNewSpec({ ...newSpec, key: e.target.value })}
                          placeholder="Nome (ex: Dimensões)"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                        <input
                          type="text"
                          value={newSpec.value}
                          onChange={(e) => setNewSpec({ ...newSpec, value: e.target.value })}
                          placeholder="Valor (ex: 220x220x250mm)"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                        <button
                          type="button"
                          onClick={addSpecification}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                          <Plus className="h-5 w-5" />
                        </button>
                      </div>

                      <div className="space-y-2">
                        {Object.entries(formData.specifications || {}).map(([key, value]) => (
                          <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                            <div>
                              <span className="font-medium text-gray-900">{key}:</span>
                              <span className="ml-2 text-gray-700">{value}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeSpecification(key)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <X className="h-5 w-5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Tags</h3>
                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          placeholder="Nova tag"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                        <button
                          type="button"
                          onClick={addTag}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                          <Plus className="h-5 w-5" />
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {formData.tags?.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => removeTag(tag)}
                              className="hover:text-blue-900"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      <Save className="h-5 w-5" />
                      {editingProduct ? 'Atualizar' : 'Salvar'}
                    </button>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Lista de Produtos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">Nenhum produto encontrado</p>
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 text-blue-600 hover:text-blue-700"
              >
                Cadastrar primeiro produto
              </button>
            </div>
          ) : (
            filteredProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow overflow-hidden">
                {product.images && product.images.length > 0 && (
                  <img 
                    src={product.images[0]} 
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                    {product.featured && (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                        Destaque
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{product.brand}</p>
                  <p className="text-lg font-bold text-gray-900 mb-4">
                    R$ {product.price.toFixed(2)}
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="ml-2 text-sm text-gray-500 line-through">
                        R$ {product.originalPrice.toFixed(2)}
                      </span>
                    )}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <span>Estoque: {product.stock}</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      product.active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {product.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                    >
                      <Edit className="h-4 w-4" />
                      Editar
                    </button>
                    <button
                      onClick={() => handleDuplicate(product.id)}
                      className="px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm"
                      title="Duplicar"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleToggleActive(product.id)}
                      className="px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm"
                      title="Ativar/Desativar"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="px-3 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 text-sm"
                      title="Excluir"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
