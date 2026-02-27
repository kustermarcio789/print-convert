import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, Plus, Edit, Trash2, Save, X, Upload, Image as ImageIcon,
  Search, Filter, Eye, DollarSign, Tag, Copy, ExternalLink
} from 'lucide-react';
import { produtosAPI, categoriasAPI } from '@/lib/apiClient';

export default function AdminProdutosSite() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBrand, setFilterBrand] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState<any>({
    name: '',
    brand: '',
    category_id: '',
    category_name: '',
    description: '',
    price: 0,
    original_price: 0,
    stock: 0,
    images: [],
    specifications: {},
    tags: [],
    featured: false,
    active: true,
    modelo_3d: ''
  });

  const [newSpec, setNewSpec] = useState({ key: '', value: '' });
  const [newTag, setNewTag] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  // Carregar produtos e categorias
  useEffect(() => {
    loadData();
  }, []);

  // Filtrar produtos
  useEffect(() => {
    let filtered = products;

    if (filterBrand !== 'all') {
      filtered = filtered.filter(p => p.brand === filterBrand);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        (p.name && p.name.toLowerCase().includes(term)) ||
        (p.brand && p.brand.toLowerCase().includes(term)) ||
        (p.description && p.description.toLowerCase().includes(term))
      );
    }

    setFilteredProducts(filtered);
  }, [products, searchTerm, filterBrand]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [allProducts, allCategories] = await Promise.all([
        produtosAPI.getAll(),
        categoriasAPI.getAll()
      ]);
      setProducts(allProducts || []);
      setCategories(allCategories || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Garantir que category_name esteja sincronizado se category_id for selecionado
      if (formData.category_id) {
        const cat = categories.find(c => c.id === formData.category_id);
        if (cat) formData.category_name = cat.name;
      }

      if (editingProduct) {
        await produtosAPI.update(editingProduct.id, formData);
      } else {
        await produtosAPI.create(formData);
      }
      await loadData();
      resetForm();
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      alert('Erro ao salvar produto. Verifique se o banco de dados está configurado corretamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      brand: product.brand || '',
      category_id: product.category_id || '',
      category_name: product.category_name || '',
      description: product.description || '',
      price: product.price || 0,
      original_price: product.original_price || 0,
      stock: product.stock || 0,
      images: product.images || [],
      specifications: product.specifications || {},
      tags: product.tags || [],
      featured: product.featured || false,
      active: product.active !== undefined ? product.active : true,
      modelo_3d: product.modelo_3d || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      try {
        setLoading(true);
        await produtosAPI.delete(id);
        await loadData();
      } catch (error) {
        console.error('Erro ao deletar produto:', error);
      } finally {
        setLoading(false);
      }
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
    if (newTag && !formData.tags.includes(newTag)) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTag]
      });
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((t: string) => t !== tag)
    });
  };

  const addImage = () => {
    if (imageUrl) {
      setFormData({
        ...formData,
        images: [...formData.images, imageUrl]
      });
      setImageUrl('');
    }
  };

  const removeImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_: any, i: number) => i !== index)
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      brand: '',
      category_id: '',
      category_name: '',
      description: '',
      price: 0,
      original_price: 0,
      stock: 0,
      images: [],
      specifications: {},
      tags: [],
      featured: false,
      active: true,
      modelo_3d: ''
    });
    setEditingProduct(null);
    setShowForm(false);
  };

  const brands = Array.from(new Set(products.map(p => p.brand).filter(Boolean)));

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Package className="text-blue-600" />
                Produtos do Site
              </h1>
              <p className="text-sm text-gray-600">Gerencie o catálogo público da 3DKPRINT</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Voltar ao Dashboard
              </button>
              <button
                onClick={() => setShowForm(true)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus size={18} />
                Novo Produto
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtros */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar por nome, marca ou descrição..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full md:w-48">
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={filterBrand}
              onChange={(e) => setFilterBrand(e.target.value)}
            >
              <option value="all">Todas as Marcas</option>
              {brands.map(brand => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Lista de Produtos */}
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marca/Cat</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preço</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estoque</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading && products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-500">Carregando produtos...</td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-500">Nenhum produto encontrado.</td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 bg-gray-100 rounded overflow-hidden border border-gray-200">
                          <img 
                            src={product.images && product.images.length > 0 ? product.images[0] : '/placeholder-product.svg'} 
                            alt="" 
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-xs text-gray-500 truncate max-w-xs">{product.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{product.brand || 'Sem marca'}</div>
                      <div className="text-xs text-gray-500">{product.category_name || 'Sem categoria'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">R$ {Number(product.price).toFixed(2)}</div>
                      {product.original_price > 0 && (
                        <div className="text-xs text-gray-400 line-through">R$ {Number(product.original_price).toFixed(2)}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.stock} un
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {product.active ? 'Ativo' : 'Inativo'}
                        </span>
                        {product.featured && (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Destaque
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleEdit(product)} className="text-blue-600 hover:text-blue-900 p-1">
                          <Edit size={18} />
                        </button>
                        <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-900 p-1">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Formulário */}
      {showForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex justify-between items-center mb-6 border-b pb-2">
                    <h3 className="text-lg font-bold text-gray-900">
                      {editingProduct ? 'Editar Produto' : 'Novo Produto'}
                    </h3>
                    <button type="button" onClick={resetForm} className="text-gray-400 hover:text-gray-500">
                      <X size={24} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Coluna 1: Informações Básicas */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Nome do Produto</label>
                        <input
                          type="text"
                          required
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Marca</label>
                          <input
                            type="text"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                            value={formData.brand}
                            onChange={(e) => setFormData({...formData, brand: e.target.value})}
                            placeholder="Ex: Creality"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Categoria</label>
                          <select
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                            value={formData.category_id}
                            onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                          >
                            <option value="">Selecionar Categoria</option>
                            {categories.map(cat => (
                              <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Descrição</label>
                        <textarea
                          rows={4}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                          value={formData.description}
                          onChange={(e) => setFormData({...formData, description: e.target.value})}
                        ></textarea>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Preço (R$)</label>
                          <input
                            type="number"
                            step="0.01"
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                            value={formData.price}
                            onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Original (R$)</label>
                          <input
                            type="number"
                            step="0.01"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                            value={formData.original_price}
                            onChange={(e) => setFormData({...formData, original_price: parseFloat(e.target.value)})}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Estoque</label>
                          <input
                            type="number"
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                            value={formData.stock}
                            onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value)})}
                          />
                        </div>
                      </div>

                      <div className="flex gap-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                            checked={formData.active}
                            onChange={(e) => setFormData({...formData, active: e.target.checked})}
                          />
                          <span className="text-sm font-medium text-gray-700">Produto Ativo</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                            checked={formData.featured}
                            onChange={(e) => setFormData({...formData, featured: e.target.checked})}
                          />
                          <span className="text-sm font-medium text-gray-700">Destaque na Home</span>
                        </label>
                      </div>
                    </div>

                    {/* Coluna 2: Mídia e Especificações */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Imagens (URLs)</label>
                        <div className="flex gap-2 mt-1">
                          <input
                            type="text"
                            className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="https://exemplo.com/imagem.jpg"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                          />
                          <button
                            type="button"
                            onClick={addImage}
                            className="bg-gray-100 px-3 py-2 rounded-md border border-gray-300 hover:bg-gray-200"
                          >
                            Add
                          </button>
                        </div>
                        <div className="grid grid-cols-4 gap-2 mt-3">
                          {formData.images.map((img: string, idx: number) => (
                            <div key={idx} className="relative group aspect-square bg-gray-100 rounded border">
                              <img src={img} alt="" className="w-full h-full object-cover rounded" />
                              <button
                                type="button"
                                onClick={() => removeImage(idx)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Link Modelo 3D (Opcional)</label>
                        <input
                          type="text"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                          value={formData.modelo_3d}
                          onChange={(e) => setFormData({...formData, modelo_3d: e.target.value})}
                          placeholder="Link para visualizador ou arquivo"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Especificações</label>
                        <div className="flex gap-2 mt-1">
                          <input
                            type="text"
                            placeholder="Chave"
                            className="w-1/3 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                            value={newSpec.key}
                            onChange={(e) => setNewSpec({...newSpec, key: e.target.value})}
                          />
                          <input
                            type="text"
                            placeholder="Valor"
                            className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                            value={newSpec.value}
                            onChange={(e) => setNewSpec({...newSpec, value: e.target.value})}
                          />
                          <button
                            type="button"
                            onClick={addSpecification}
                            className="bg-gray-100 px-3 py-2 rounded-md border border-gray-300 hover:bg-gray-200"
                          >
                            +
                          </button>
                        </div>
                        <div className="mt-2 space-y-1">
                          {Object.entries(formData.specifications).map(([k, v]: any) => (
                            <div key={k} className="flex justify-between items-center bg-gray-50 px-3 py-1 rounded text-sm">
                              <span className="font-medium">{k}: {v}</span>
                              <button type="button" onClick={() => removeSpecification(k)} className="text-red-500">
                                <X size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Tags</label>
                        <div className="flex gap-2 mt-1">
                          <input
                            type="text"
                            className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                          />
                          <button
                            type="button"
                            onClick={addTag}
                            className="bg-gray-100 px-3 py-2 rounded-md border border-gray-300 hover:bg-gray-200"
                          >
                            +
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {formData.tags.map((tag: string) => (
                            <span key={tag} className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs flex items-center gap-1">
                              {tag}
                              <button type="button" onClick={() => removeTag(tag)}>
                                <X size={10} />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none sm:w-auto sm:text-sm disabled:opacity-50"
                  >
                    {loading ? 'Salvando...' : 'Salvar Produto'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
