import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, X, FileText, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { QuoteItem } from '@/lib/quoteDataStore';

interface QuoteItemFormProps {
  item: QuoteItem;
  onUpdate: (item: QuoteItem) => void;
  onRemove?: () => void;
  showRemove?: boolean;
}

const fdmMaterials = [
  { id: 'pla', name: 'PLA - Biodegradável' },
  { id: 'petg', name: 'PETG - Resistente' },
  { id: 'abs', name: 'ABS - Alta Resistência' },
  { id: 'tritan', name: 'Tritan - Food Safe' },
  { id: 'nylon', name: 'Nylon - Muito Resistente' },
];

const resinaMaterials = [
  { id: 'standard', name: 'Resina Standard' },
  { id: 'tough', name: 'Resina Tough' },
  { id: 'flexible', name: 'Resina Flexível' },
  { id: 'dental', name: 'Resina Dental' },
];

const cores = [
  { id: 'branco', name: 'Branco', hex: '#FFFFFF' },
  { id: 'preto', name: 'Preto', hex: '#1a1a1a' },
  { id: 'vermelho', name: 'Vermelho', hex: '#DC2626' },
  { id: 'azul', name: 'Azul', hex: '#2563EB' },
  { id: 'verde', name: 'Verde', hex: '#16A34A' },
  { id: 'amarelo', name: 'Amarelo', hex: '#EAB308' },
  { id: 'laranja', name: 'Laranja', hex: '#EA580C' },
  { id: 'cinza', name: 'Cinza', hex: '#6B7280' },
  { id: 'transparente', name: 'Transparente', hex: '#E5E7EB' },
];

export default function QuoteItemForm({
  item,
  onUpdate,
  onRemove,
  showRemove = true,
}: QuoteItemFormProps) {
  const [fileName, setFileName] = useState(item.arquivo?.nome || '');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        onUpdate({
          ...item,
          arquivo: {
            nome: file.name,
            tamanho: file.size,
            url: base64,
            tipo: file.type,
          },
        });
        setFileName(file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  const materiais = item.categoria === 'fdm' ? fdmMaterials : resinaMaterials;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-card border border-border rounded-lg p-6 space-y-6"
    >
      {/* Cabeçalho com ID do item */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">
          Item #{item.id.split('_')[1]?.substring(0, 6)}
        </h3>
        {showRemove && onRemove && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="text-destructive hover:bg-destructive/10"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Linha 1: Nome e Descrição */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={`nome-${item.id}`}>Nome do Produto *</Label>
          <Input
            id={`nome-${item.id}`}
            placeholder="Ex: Suporte de Impressora"
            value={item.nome}
            onChange={(e) => onUpdate({ ...item, nome: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`descricao-${item.id}`}>Descrição Breve</Label>
          <Input
            id={`descricao-${item.id}`}
            placeholder="Ex: Suporte para Ender 3"
            value={item.descricao}
            onChange={(e) => onUpdate({ ...item, descricao: e.target.value })}
          />
        </div>
      </div>

      {/* Linha 2: Categoria, Material, Cor */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor={`categoria-${item.id}`}>Tipo de Impressão *</Label>
          <Select value={item.categoria} onValueChange={(value: any) => onUpdate({ ...item, categoria: value })}>
            <SelectTrigger id={`categoria-${item.id}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fdm">FDM (Filamento)</SelectItem>
              <SelectItem value="resina">Resina (SLA/DLP)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`material-${item.id}`}>Material *</Label>
          <Select value={item.material} onValueChange={(value) => onUpdate({ ...item, material: value })}>
            <SelectTrigger id={`material-${item.id}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {materiais.map((mat) => {
                const matValue = mat.id && mat.id.trim() ? mat.id : `material-${Math.random()}`;
                return (
                  <SelectItem key={mat.id} value={matValue}>
                    {mat.name}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`cor-${item.id}`}>Cor</Label>
          <Select value={item.cor} onValueChange={(value) => onUpdate({ ...item, cor: value })}>
            <SelectTrigger id={`cor-${item.id}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {cores.map((cor) => {
                const corValue = cor.id && cor.id.trim() ? cor.id : `cor-${Math.random()}`;
                return (
                  <SelectItem key={cor.id} value={corValue}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded border border-gray-300"
                        style={{ backgroundColor: cor.hex }}
                      />
                      {cor.name}
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Linha 3: Quantidade, Preenchimento, Valor */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor={`quantidade-${item.id}`}>Quantidade *</Label>
          <Input
            id={`quantidade-${item.id}`}
            type="number"
            min="1"
            value={item.quantidade}
            onChange={(e) => onUpdate({ ...item, quantidade: parseInt(e.target.value) || 1 })}
          />
        </div>

        {item.categoria === 'fdm' && (
          <div className="space-y-2">
            <Label htmlFor={`preenchimento-${item.id}`}>Preenchimento (%)</Label>
            <Input
              id={`preenchimento-${item.id}`}
              type="number"
              min="0"
              max="100"
              step="5"
              value={item.preenchimento || 20}
              onChange={(e) => onUpdate({ ...item, preenchimento: parseInt(e.target.value) || 20 })}
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor={`valor-${item.id}`}>Valor Estimado (R$)</Label>
          <Input
            id={`valor-${item.id}`}
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={item.valorEstimado || ''}
            onChange={(e) => onUpdate({ ...item, valorEstimado: parseFloat(e.target.value) || 0 })}
          />
        </div>
      </div>

      {/* Upload de Arquivo STL */}
      <div className="space-y-2">
        <Label>Arquivo 3D (STL, OBJ, 3MF)</Label>
        <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
          <input
            type="file"
            accept=".stl,.obj,.3mf,.step,.stp"
            onChange={handleFileUpload}
            className="hidden"
            id={`file-${item.id}`}
          />
          <label htmlFor={`file-${item.id}`} className="cursor-pointer flex flex-col items-center gap-2">
            <Upload className="w-8 h-8 text-muted-foreground" />
            <span className="text-sm font-medium">
              {fileName ? `Arquivo: ${fileName}` : 'Clique para selecionar arquivo'}
            </span>
            <span className="text-xs text-muted-foreground">
              Formatos suportados: STL, OBJ, 3MF, STEP
            </span>
          </label>
        </div>
        {item.arquivo && (
          <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
            <FileText className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="text-sm text-green-800 dark:text-green-200">
              ✓ Arquivo carregado: {item.arquivo.nome}
            </span>
          </div>
        )}
      </div>

      {/* Observações */}
      <div className="space-y-2">
        <Label htmlFor={`obs-${item.id}`}>Observações Adicionais</Label>
        <Textarea
          id={`obs-${item.id}`}
          placeholder="Ex: Precisa de acabamento, pintura, etc."
          value={item.observacoes || ''}
          onChange={(e) => onUpdate({ ...item, observacoes: e.target.value })}
          className="min-h-24"
        />
      </div>

      {/* Aviso se arquivo não foi anexado */}
      {!item.arquivo && !item.descricao && (
        <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            Adicione um arquivo 3D ou uma descrição detalhada para que o administrador possa processar seu orçamento.
          </p>
        </div>
      )}
    </motion.div>
  );
}
