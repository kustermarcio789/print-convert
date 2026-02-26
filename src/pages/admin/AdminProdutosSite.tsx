import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, Plus, Edit, Trash2, Save, X, Upload, Image as ImageIcon,
  Search, Filter, Eye, DollarSign, Tag, Copy
} from 'lucide-react';
import { produtosAPI } from '@/lib/apiClient';
import type { Product } from '@/data/products';

interface SiteProduct extends Product {}

export default function AdminProdutosSite() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<SiteProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<SiteProduct[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBrand, setFilterBrand] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<SiteProduct | null>(null);
  const [loading, setLoading] = useState(false);

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

  const loadProducts = async () => {
    try {
      setLoading(true);
      const allProducts = await produtosAPI.getAll();
      setProducts(allProducts as any);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingProduct) {
        // Atualizar produto existente
        await produtosAPI.update(editingProduct.id, formData as any);
      } else {
        // Criar novo produto
        await produtosAPI.create(formData as any);
      }
      await loadProducts();
      resetForm();
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      alert('Erro ao salvar produto. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product: SiteProduct) => {
    setEditingProduct(product);
    setFormData(product);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      try {
        setLoading(true);
        await produtosAPI.delete(id);
        await loadProducts();
      } catch (error) {
        console.error('Erro ao deletar produto:', error);
        alert('Erro ao deletar produto. Tente novamente.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      setLoading(true);
      await produtosAPI.update(id, { active: !currentActive });
      await loadProducts();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFeatured = async (id: string, currentFeatured: boolean) => {
    try {
      setLoading(true);
      await produtosAPI.update(id, { featured: !currentFeatured });
      await loadProducts();
    } catch (error) {
      console.error('Erro ao atualizar destaque:', error);
    } finally {
      setLoading(false);
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
                  placeholder="Buscar por nome, marca ou descrição..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <select
              value={filterBrand}
              onChange={(e) => setFilterBrand(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todas as Marcas</option>
              {brands.map(brand => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
              Novo Produto
            </button>
          </div>
        </div>

        {/* Produtos */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Carregando...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Nenhum produto encontrado. {products.length === 0 && 'Crie seu primeiro produto!'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produto</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preço</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estoque</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredProducts.map(product => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {product.images && product.images.length > 0 && (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="h-10 w-10 rounded object-cover mr-3"
                            />
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-900">{product.name}</p>
                            <p className="text-xs text-gray-500">{product.brand}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        R$ {product.price.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.stock}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleToggleActive(product.id, product.active)}
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              product.active
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {product.active ? 'Ativo' : 'Inativo'}
                          </button>
                          {product.featured && (
                            <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                              Destaque
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(product)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleToggleFeatured(product.id, product.featured)}
                            className="text-yellow-600 hover:text-yellow-900"
                          >
                            <Tag className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal de Formulário */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingProduct ? 'Editar Produto' : 'Novo Produto'}
                </h2>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Nome e Marca */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Produto</label>
                    <input
                      type="text"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Marca</label>
                    <input
                      type="text"
                      value={formData.brand || ''}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                {/* Categoria e Preço */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                    <input
                      type="text"
                      value={formData.category || ''}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Preço (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price || 0}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Preço Original (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.originalPrice || 0}
                      onChange={(e) => setFormData({ ...formData, originalPrice: parseFloat(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Descrição e Estoque */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                    <textarea
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Estoque</label>
                    <input
                      type="number"
                      value={formData.stock || 0}
                      onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                {/* Imagens */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Imagens</label>
                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      placeholder="URL da imagem"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={addImage}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Adicionar
                    </button>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ou faça upload</label>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="w-full"
                    />
                  </div>
                  {formData.images && formData.images.length > 0 && (
                    <div className="grid grid-cols-3 gap-2">
                      {formData.images.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={image}
                            alt={`Preview ${index}`}
                            className="w-full h-24 object-cover rounded"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Especificações */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Especificações</label>
                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      placeholder="Chave"
                      value={newSpec.key}
                      onChange={(e) => setNewSpec({ ...newSpec, key: e.target.value })}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="text"
                      placeholder="Valor"
                      value={newSpec.value}
                      onChange={(e) => setNewSpec({ ...newSpec, value: e.target.value })}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={addSpecification}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Adicionar
                    </button>
                  </div>
                  {formData.specifications && Object.entries(formData.specifications).length > 0 && (
                    <div className="space-y-2">
                      {Object.entries(formData.specifications).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                          <span className="text-sm"><strong>{key}:</strong> {value}</span>
                          <button
                            type="button"
                            onClick={() => removeSpecification(key)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      placeholder="Nova tag"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Adicionar
                    </button>
                  </div>
                  {formData.tags && formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map(tag => (
                        <span key={tag} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Checkboxes */}
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.active || false}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-700">Ativo</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.featured || false}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-700">Em Destaque</span>
                  </label>
                </div>

                {/* Botões */}
                <div className="flex gap-4 pt-6 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Save className="h-5 w-5" />
                    {loading ? 'Salvando...' : 'Salvar Produto'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 px-4 py-2 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
