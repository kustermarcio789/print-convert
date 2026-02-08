import { useState } from 'react';
import { Search, Filter, X, Calendar, DollarSign, User, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';

export interface SearchFilters {
  searchTerm: string;
  tipo: string;
  status: string;
  dateFrom: string;
  dateTo: string;
  minValue: string;
  maxValue: string;
  cliente: string;
}

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void;
  onReset: () => void;
}

export default function AdvancedSearch({ onSearch, onReset }: AdvancedSearchProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    searchTerm: '',
    tipo: 'todos',
    status: 'todos',
    dateFrom: '',
    dateTo: '',
    minValue: '',
    maxValue: '',
    cliente: ''
  });

  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onSearch(newFilters);
  };

  const handleReset = () => {
    const resetFilters: SearchFilters = {
      searchTerm: '',
      tipo: 'todos',
      status: 'todos',
      dateFrom: '',
      dateTo: '',
      minValue: '',
      maxValue: '',
      cliente: ''
    };
    setFilters(resetFilters);
    onReset();
  };

  const hasActiveFilters = () => {
    return (
      filters.searchTerm !== '' ||
      filters.tipo !== 'todos' ||
      filters.status !== 'todos' ||
      filters.dateFrom !== '' ||
      filters.dateTo !== '' ||
      filters.minValue !== '' ||
      filters.maxValue !== '' ||
      filters.cliente !== ''
    );
  };

  return (
    <div className="space-y-4">
      {/* Barra de Busca Principal */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar por ID, cliente, email ou telefone..."
            value={filters.searchTerm}
            onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Button
          variant={showAdvanced ? 'default' : 'outline'}
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="gap-2"
        >
          <Filter className="w-4 h-4" />
          Filtros Avançados
        </Button>

        {hasActiveFilters() && (
          <Button
            variant="ghost"
            onClick={handleReset}
            className="gap-2"
          >
            <X className="w-4 h-4" />
            Limpar
          </Button>
        )}
      </div>

      {/* Filtros Rápidos */}
      <div className="flex flex-wrap gap-2">
        <Select value={filters.tipo} onValueChange={(value) => handleFilterChange('tipo', value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Tipo de Serviço" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os Tipos</SelectItem>
            <SelectItem value="impressao">Impressão 3D</SelectItem>
            <SelectItem value="modelagem">Modelagem 3D</SelectItem>
            <SelectItem value="pintura">Pintura</SelectItem>
            <SelectItem value="manutencao">Manutenção</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os Status</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="aprovado">Aprovado</SelectItem>
            <SelectItem value="recusado">Recusado</SelectItem>
            <SelectItem value="em_producao">Em Produção</SelectItem>
            <SelectItem value="concluido">Concluído</SelectItem>
            <SelectItem value="cancelado">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Painel de Filtros Avançados */}
      {showAdvanced && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Filtro por Cliente */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Nome do Cliente
                </label>
                <Input
                  placeholder="Digite o nome..."
                  value={filters.cliente}
                  onChange={(e) => handleFilterChange('cliente', e.target.value)}
                />
              </div>

              {/* Filtro por Data Inicial */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Data Inicial
                </label>
                <Input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                />
              </div>

              {/* Filtro por Data Final */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Data Final
                </label>
                <Input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                />
              </div>

              {/* Filtro por Valor Mínimo */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Valor Mínimo (R$)
                </label>
                <Input
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  value={filters.minValue}
                  onChange={(e) => handleFilterChange('minValue', e.target.value)}
                />
              </div>

              {/* Filtro por Valor Máximo */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Valor Máximo (R$)
                </label>
                <Input
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  value={filters.maxValue}
                  onChange={(e) => handleFilterChange('maxValue', e.target.value)}
                />
              </div>
            </div>

            {/* Resumo dos Filtros Ativos */}
            {hasActiveFilters() && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm font-medium mb-2">Filtros Ativos:</p>
                <div className="flex flex-wrap gap-2">
                  {filters.searchTerm && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                      Busca: {filters.searchTerm}
                      <button onClick={() => handleFilterChange('searchTerm', '')}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {filters.tipo !== 'todos' && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                      Tipo: {filters.tipo}
                      <button onClick={() => handleFilterChange('tipo', 'todos')}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {filters.status !== 'todos' && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                      Status: {filters.status}
                      <button onClick={() => handleFilterChange('status', 'todos')}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {filters.cliente && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">
                      Cliente: {filters.cliente}
                      <button onClick={() => handleFilterChange('cliente', '')}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {(filters.dateFrom || filters.dateTo) && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-pink-100 text-pink-800 rounded text-xs">
                      Período: {filters.dateFrom || '...'} até {filters.dateTo || '...'}
                      <button onClick={() => {
                        handleFilterChange('dateFrom', '');
                        handleFilterChange('dateTo', '');
                      }}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {(filters.minValue || filters.maxValue) && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
                      Valor: R$ {filters.minValue || '0'} - R$ {filters.maxValue || '∞'}
                      <button onClick={() => {
                        handleFilterChange('minValue', '');
                        handleFilterChange('maxValue', '');
                      }}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
