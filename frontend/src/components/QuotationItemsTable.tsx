/**
 * Componente de Tabela de Itens de Orçamento Editável - 3DKPRINT
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Trash2, Package, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  QuotationItem,
  createEmptyQuotationItem,
  calculateLineTotal,
  calculateQuotationTotals,
  formatCurrencyBRL,
  parseNumber,
  roundMoney,
} from '@/lib/quotePricingEngine';
import { produtosAPI } from '@/lib/apiClient';

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  brand?: string;
  category_name?: string;
  stock?: number;
}

interface QuotationItemsTableProps {
  items: QuotationItem[];
  onChange: (items: QuotationItem[]) => void;
  readOnly?: boolean;
}

export default function QuotationItemsTable({
  items,
  onChange,
  readOnly = false,
}: QuotationItemsTableProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [activeSearchIndex, setActiveSearchIndex] = useState<number | null>(null);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Carrega produtos do catálogo
  useEffect(() => {
    const loadProducts = async () => {
      setLoadingProducts(true);
      try {
        const data = await produtosAPI.getAll();
        setProducts(data || []);
      } catch (error) {
        console.error('Erro ao carregar produtos:', error);
      } finally {
        setLoadingProducts(false);
      }
    };
    loadProducts();
  }, []);

  // Filtra produtos baseado no termo de busca
  useEffect(() => {
    if (searchTerm.length >= 2) {
      const filtered = products.filter(
        (p) =>
          p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.brand?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setSearchResults(filtered.slice(0, 10));
    } else {
      setSearchResults([]);
    }
  }, [searchTerm, products]);

  // Atualiza um item específico
  const updateItem = useCallback(
    (index: number, updates: Partial<QuotationItem>) => {
      const newItems = [...items];
      const item = { ...newItems[index], ...updates };

      // Recalcula o total da linha
      item.total_price = calculateLineTotal(
        item.quantity,
        item.unit_price,
        item.discount_amount
      );

      newItems[index] = item;
      onChange(newItems);
    },
    [items, onChange]
  );

  // Adiciona novo item
  const addItem = useCallback(() => {
    const newItem = createEmptyQuotationItem();
    onChange([...items, newItem]);
  }, [items, onChange]);

  // Remove item
  const removeItem = useCallback(
    (index: number) => {
      const newItems = items.filter((_, i) => i !== index);
      onChange(newItems);
    },
    [items, onChange]
  );

  // Seleciona produto do catálogo
  const selectProduct = useCallback(
    (index: number, product: Product) => {
      updateItem(index, {
        product_id: product.id,
        name: product.name,
        description: product.description || '',
        unit_price: product.price || 0,
      });
      setSearchTerm('');
      setSearchResults([]);
      setActiveSearchIndex(null);
    },
    [updateItem]
  );

  // Calcula totais
  const totals = calculateQuotationTotals(items);

  return (
    <div className="space-y-4">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Package className="w-5 h-5 text-blue-600" />
          Itens do Orçamento
        </h3>
        {!readOnly && (
          <Button onClick={addItem} size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            Adicionar Item
          </Button>
        )}
      </div>

      {/* Tabela */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="w-[40%]">Produto / Descrição</TableHead>
              <TableHead className="w-[12%] text-right">Qtd</TableHead>
              <TableHead className="w-[15%] text-right">Preço Unit.</TableHead>
              <TableHead className="w-[13%] text-right">Desconto</TableHead>
              <TableHead className="w-[15%] text-right">Total</TableHead>
              {!readOnly && <TableHead className="w-[5%]"></TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={readOnly ? 5 : 6} className="h-24 text-center">
                  <div className="flex flex-col items-center gap-2 text-gray-500">
                    <AlertCircle className="w-8 h-8" />
                    <p>Nenhum item adicionado</p>
                    {!readOnly && (
                      <Button variant="outline" size="sm" onClick={addItem}>
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar primeiro item
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              items.map((item, index) => (
                <TableRow key={item.id} className="group">
                  {/* Produto / Descrição */}
                  <TableCell className="align-top">
                    {readOnly ? (
                      <div>
                        <p className="font-medium">{item.name || '-'}</p>
                        {item.description && (
                          <p className="text-sm text-gray-500">{item.description}</p>
                        )}
                        {item.product_id && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-blue-100 text-blue-700 mt-1">
                            Do catálogo
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {/* Busca de produto */}
                        <Popover
                          open={activeSearchIndex === index && searchResults.length > 0}
                          onOpenChange={(open) => {
                            if (!open) {
                              setActiveSearchIndex(null);
                              setSearchResults([]);
                            }
                          }}
                        >
                          <PopoverTrigger asChild>
                            <div className="relative">
                              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                              <Input
                                placeholder="Buscar produto ou digitar nome..."
                                className="pl-8"
                                value={activeSearchIndex === index ? searchTerm : item.name}
                                onChange={(e) => {
                                  if (activeSearchIndex !== index) {
                                    setActiveSearchIndex(index);
                                  }
                                  setSearchTerm(e.target.value);
                                  updateItem(index, { name: e.target.value, product_id: null });
                                }}
                                onFocus={() => {
                                  setActiveSearchIndex(index);
                                  setSearchTerm(item.name);
                                }}
                              />
                            </div>
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-[400px] p-0"
                            align="start"
                            onOpenAutoFocus={(e) => e.preventDefault()}
                          >
                            <div className="max-h-[300px] overflow-y-auto">
                              {loadingProducts ? (
                                <div className="p-4 text-center text-gray-500">
                                  Carregando produtos...
                                </div>
                              ) : searchResults.length > 0 ? (
                                searchResults.map((product) => (
                                  <button
                                    key={product.id}
                                    className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b last:border-b-0 transition-colors"
                                    onClick={() => selectProduct(index, product)}
                                  >
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <p className="font-medium text-gray-900">
                                          {product.name}
                                        </p>
                                        {product.description && (
                                          <p className="text-sm text-gray-500 line-clamp-1">
                                            {product.description}
                                          </p>
                                        )}
                                        <p className="text-xs text-gray-400 mt-1">
                                          {product.brand} • {product.category_name}
                                        </p>
                                      </div>
                                      <div className="text-right">
                                        <p className="font-semibold text-green-600">
                                          {formatCurrencyBRL(product.price)}
                                        </p>
                                        {product.stock !== undefined && (
                                          <p className="text-xs text-gray-400">
                                            Estoque: {product.stock}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </button>
                                ))
                              ) : (
                                <div className="p-4 text-center text-gray-500">
                                  {searchTerm.length < 2
                                    ? 'Digite pelo menos 2 caracteres'
                                    : 'Nenhum produto encontrado'}
                                </div>
                              )}
                            </div>
                          </PopoverContent>
                        </Popover>

                        {/* Descrição adicional */}
                        <Input
                          placeholder="Descrição adicional (opcional)"
                          value={item.description}
                          onChange={(e) =>
                            updateItem(index, { description: e.target.value })
                          }
                          className="text-sm"
                        />

                        {/* Badge se veio do catálogo */}
                        {item.product_id && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-blue-100 text-blue-700">
                            Produto do catálogo
                          </span>
                        )}
                      </div>
                    )}
                  </TableCell>

                  {/* Quantidade */}
                  <TableCell className="align-top">
                    {readOnly ? (
                      <p className="text-right font-medium">{item.quantity}</p>
                    ) : (
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(index, {
                            quantity: Math.max(1, parseInt(e.target.value) || 1),
                          })
                        }
                        className="text-right"
                      />
                    )}
                  </TableCell>

                  {/* Preço Unitário */}
                  <TableCell className="align-top">
                    {readOnly ? (
                      <p className="text-right font-medium">
                        {formatCurrencyBRL(item.unit_price)}
                      </p>
                    ) : (
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unit_price || ''}
                        onChange={(e) =>
                          updateItem(index, {
                            unit_price: roundMoney(parseNumber(e.target.value)),
                          })
                        }
                        className="text-right"
                        placeholder="0,00"
                      />
                    )}
                  </TableCell>

                  {/* Desconto */}
                  <TableCell className="align-top">
                    {readOnly ? (
                      <p className="text-right text-green-600">
                        {item.discount_amount > 0
                          ? `-${formatCurrencyBRL(item.discount_amount)}`
                          : '-'}
                      </p>
                    ) : (
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.discount_amount || ''}
                        onChange={(e) => {
                          const discount = roundMoney(parseNumber(e.target.value));
                          const maxDiscount = item.quantity * item.unit_price;
                          updateItem(index, {
                            discount_amount: Math.min(discount, maxDiscount),
                          });
                        }}
                        className="text-right"
                        placeholder="0,00"
                      />
                    )}
                  </TableCell>

                  {/* Total */}
                  <TableCell className="align-top">
                    <p className="text-right font-bold text-gray-900">
                      {formatCurrencyBRL(item.total_price)}
                    </p>
                  </TableCell>

                  {/* Ações */}
                  {!readOnly && (
                    <TableCell className="align-top">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(index)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Totais */}
      {items.length > 0 && (
        <div className="flex justify-end">
          <div className="w-72 space-y-2 bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium">{formatCurrencyBRL(totals.subtotal)}</span>
            </div>
            {totals.total_discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Desconto Total:</span>
                <span className="font-medium text-green-600">
                  -{formatCurrencyBRL(totals.total_discount)}
                </span>
              </div>
            )}
            <div className="border-t pt-2 flex justify-between">
              <span className="font-semibold text-gray-900">Total:</span>
              <span className="font-bold text-lg text-green-600">
                {formatCurrencyBRL(totals.final_total)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
