import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Package,
  Plus,
  Search,
  Edit,
  Trash2,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { produtoService, Produto, inicializarDadosExemplo } from '@/lib/dataStoreEnhanced';
import { useToast } from '@/hooks/use-toast';

export default function AdminProdutos() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [filteredProdutos, setFilteredProdutos] = useState<Produto[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduto, setEditingProduto] = useState<Produto | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    modelo: '',
    marca: '',
    categoria: '',
    unidade: 'UN' as const,
    valorCusto: 0,
    valorVenda: 0,
    estoque: 0,
    estoqueMinimo: 5,
    imagens: [] as string[],
    modelo3dUrl: '',
  });

  const [imagemPreview, setImagemPreview] = useState<string[]>([]);
  const [modelo3dPreview, setModelo3dPreview] = useState<string>('');

  useEffect(() => {
    inicializarDadosExemplo();
    carregarProdutos();
  }, []);

  useEffect(() => {
    const filtered = produtos.filter(
      (p) =>
        p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.marca?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.categoria.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProdutos(filtered);
  }, [searchTerm, produtos]);

  const carregarProdutos = () => {
    const data = produtoService.getAll();
    setProdutos(data);
    setFilteredProdutos(data);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages: string[] = [];
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          newImages.push(result);
          if (newImages.length === files.length) {
            setImagemPreview([...imagemPreview, ...newImages]);
            setFormData({ ...formData, imagens: [...formData.imagens, ...newImages] });
          }
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
        const result = reader.result as string;
        setModelo3dPreview(result);
        setFormData({ ...formData, modelo3dUrl: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (index: number) => {
    const newImages = imagemPreview.filter((_, i) => i !== index);
    setImagemPreview(newImages);
    setFormData({ ...formData, imagens: newImages });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingProduto) {
      produtoService.update(editingProduto.id, formData);
      toast({
        title: 'Produto atualizado!',
        description: 'As alterações foram salvas com sucesso.',
      });
    } else {
      produtoService.create(formData);
      toast({
        title: 'Produto cadastrado!',
        description: 'O produto foi adicionado ao sistema.',
      });
    }

    resetForm();
    carregarProdutos();
    setIsDialogOpen(false);
  };

  const handleEdit = (produto: Produto) => {
    setEditingProduto(produto);
    setFormData({
      nome: produto.nome,
      descricao: produto.descricao,
      modelo: produto.modelo || '',
      marca: produto.marca || '',
      categoria: produto.categoria,
      unidade: produto.unidade,
      valorCusto: produto.valorCusto,
      valorVenda: produto.valorVenda,
      estoque: produto.estoque,
      estoqueMinimo: produto.estoqueMinimo,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      produtoService.delete(id);
      toast({
        title: 'Produto excluído',
        description: 'O produto foi removido do sistema.',
      });
      carregarProdutos();
    }
  };

  const resetForm = () => {
    setEditingProduto(null);
    setFormData({
      nome: '',
      descricao: '',
      modelo: '',
      marca: '',
      categoria: '',
      unidade: 'UN',
      valorCusto: 0,
      valorVenda: 0,
      estoque: 0,
      estoqueMinimo: 5,
    });
  };

  const calcularMargem = (custo: number, venda: number) => {
    if (custo === 0) return 0;
    return ((venda - custo) / custo) * 100;
  };

  const estatisticas = {
    total: produtos.length,
    estoqueBaixo: produtos.filter((p) => p.estoque <= p.estoqueMinimo).length,
    valorTotal: produtos.reduce((sum, p) => sum + p.valorVenda * p.estoque, 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Produtos</h1>
          <p className="text-muted-foreground">
            Gerencie o catálogo de produtos
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Produto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduto ? 'Editar Produto' : 'Novo Produto'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Nome do Produto *</Label>
                  <Input
                    value={formData.nome}
                    onChange={(e) =>
                      setFormData({ ...formData, nome: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="col-span-2">
                  <Label>Descrição</Label>
                  <Input
                    value={formData.descricao}
                    onChange={(e) =>
                      setFormData({ ...formData, descricao: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label>Modelo</Label>
                  <Input
                    value={formData.modelo}
                    onChange={(e) =>
                      setFormData({ ...formData, modelo: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label>Marca</Label>
                  <Input
                    value={formData.marca}
                    onChange={(e) =>
                      setFormData({ ...formData, marca: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label>Categoria *</Label>
                  <Input
                    value={formData.categoria}
                    onChange={(e) =>
                      setFormData({ ...formData, categoria: e.target.value })
                    }
                    required
                    placeholder="Ex: Filamento, Resina, Peças"
                  />
                </div>

                {/* Upload de Imagens */}
                <div className="col-span-2">
                  <Label>Imagens do Produto</Label>
                  <div className="mt-2">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg className="w-8 h-8 mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-sm text-gray-500">Clique para fazer upload de imagens</p>
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
                  </div>
                  {imagemPreview.length > 0 && (
                    <div className="mt-4 grid grid-cols-4 gap-4">
                      {imagemPreview.map((img, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={img}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Upload de Modelo 3D */}
                <div className="col-span-2">
                  <Label>Modelo 3D (GLB/GLTF)</Label>
                  <div className="mt-2">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Package className="w-8 h-8 mb-2 text-gray-400" />
                        <p className="text-sm text-gray-500">Clique para fazer upload do modelo 3D</p>
                        <p className="text-xs text-gray-400">GLB, GLTF (Máx. 50MB)</p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept=".glb,.gltf"
                        onChange={handleModelo3DUpload}
                      />
                    </label>
                  </div>
                  {modelo3dPreview && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-700 flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        Modelo 3D carregado com sucesso!
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <Label>Unidade *</Label>
                  <Select
                    value={formData.unidade}
                    onValueChange={(value: any) =>
                      setFormData({ ...formData, unidade: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UN">Unidade (UN)</SelectItem>
                      <SelectItem value="KG">Quilograma (KG)</SelectItem>
                      <SelectItem value="GR">Grama (GR)</SelectItem>
                      <SelectItem value="MT">Metro (MT)</SelectItem>
                      <SelectItem value="LT">Litro (LT)</SelectItem>
                      <SelectItem value="ML">Mililitro (ML)</SelectItem>
                      <SelectItem value="PC">Peça (PC)</SelectItem>
                      <SelectItem value="CX">Caixa (CX)</SelectItem>
                      <SelectItem value="RL">Rolo (RL)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Valor de Custo (R$) *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.valorCusto}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        valorCusto: parseFloat(e.target.value) || 0,
                      })
                    }
                    required
                  />
                </div>

                <div>
                  <Label>Valor de Venda (R$) *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.valorVenda}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        valorVenda: parseFloat(e.target.value) || 0,
                      })
                    }
                    required
                  />
                </div>

                <div>
                  <Label>Estoque Atual *</Label>
                  <Input
                    type="number"
                    value={formData.estoque}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        estoque: parseInt(e.target.value) || 0,
                      })
                    }
                    required
                  />
                </div>

                <div>
                  <Label>Estoque Mínimo *</Label>
                  <Input
                    type="number"
                    value={formData.estoqueMinimo}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        estoqueMinimo: parseInt(e.target.value) || 0,
                      })
                    }
                    required
                  />
                </div>
              </div>

              {formData.valorCusto > 0 && formData.valorVenda > 0 && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium">
                    Margem de Lucro:{' '}
                    <span
                      className={
                        calcularMargem(formData.valorCusto, formData.valorVenda) >
                        0
                          ? 'text-green-600'
                          : 'text-red-600'
                      }
                    >
                      {calcularMargem(
                        formData.valorCusto,
                        formData.valorVenda
                      ).toFixed(2)}
                      %
                    </span>
                  </p>
                </div>
              )}

              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingProduto ? 'Salvar Alterações' : 'Cadastrar Produto'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-lg p-6 border border-border"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total de Produtos</p>
              <p className="text-3xl font-bold text-foreground">
                {estatisticas.total}
              </p>
            </div>
            <Package className="w-12 h-12 text-primary opacity-20" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-lg p-6 border border-border"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Estoque Baixo</p>
              <p className="text-3xl font-bold text-orange-600">
                {estatisticas.estoqueBaixo}
              </p>
            </div>
            <AlertTriangle className="w-12 h-12 text-orange-600 opacity-20" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-lg p-6 border border-border"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Valor em Estoque</p>
              <p className="text-3xl font-bold text-green-600">
                R$ {estatisticas.valorTotal.toFixed(2)}
              </p>
            </div>
            <DollarSign className="w-12 h-12 text-green-600 opacity-20" />
          </div>
        </motion.div>
      </div>

      {/* Busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome, marca ou categoria..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tabela */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produto</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Estoque</TableHead>
              <TableHead>Custo</TableHead>
              <TableHead>Venda</TableHead>
              <TableHead>Margem</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProdutos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  Nenhum produto encontrado
                </TableCell>
              </TableRow>
            ) : (
              filteredProdutos.map((produto) => {
                const margem = calcularMargem(
                  produto.valorCusto,
                  produto.valorVenda
                );
                return (
                  <TableRow key={produto.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{produto.nome}</p>
                        {produto.marca && (
                          <p className="text-sm text-muted-foreground">
                            {produto.marca} {produto.modelo && `- ${produto.modelo}`}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{produto.categoria}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>
                          {produto.estoque} {produto.unidade}
                        </span>
                        {produto.estoque <= produto.estoqueMinimo && (
                          <AlertTriangle className="w-4 h-4 text-orange-600" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>R$ {produto.valorCusto.toFixed(2)}</TableCell>
                    <TableCell>R$ {produto.valorVenda.toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {margem > 0 ? (
                          <TrendingUp className="w-4 h-4 text-green-600" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-600" />
                        )}
                        <span
                          className={
                            margem > 0 ? 'text-green-600' : 'text-red-600'
                          }
                        >
                          {margem.toFixed(1)}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(produto)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(produto.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
