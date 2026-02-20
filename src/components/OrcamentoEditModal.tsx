import { useState } from 'react';
import { X, Save, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { updateOrcamento } from '@/lib/supabaseClient';

interface Orcamento {
  id: string;
  tipo: string;
  cliente_nome: string;
  cliente_email: string;
  cliente_telefone?: string;
  status: 'pendente' | 'aprovado' | 'recusado' | 'concluido';
  valor?: number;
  observacoes?: string;
  detalhes?: Record<string, any>;
}

interface OrcamentoEditModalProps {
  orcamento: Orcamento;
  isOpen: boolean;
  onClose: () => void;
  onSave: (orcamento: Orcamento) => void;
}

export function OrcamentoEditModal({
  orcamento,
  isOpen,
  onClose,
  onSave,
}: OrcamentoEditModalProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Orcamento>(orcamento);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const result = await updateOrcamento(orcamento.id, formData);

      if (result.success) {
        toast({
          title: 'Orçamento atualizado',
          description: 'As alterações foram salvas com sucesso.',
        });
        onSave(formData);
        onClose();
      } else {
        throw new Error('Falha ao atualizar');
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível atualizar o orçamento.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-background border-b border-border p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Editar Orçamento</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-secondary rounded transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Dados do Cliente */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Dados do Cliente</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input
                  value={formData.cliente_nome}
                  onChange={(e) =>
                    setFormData({ ...formData, cliente_nome: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>E-mail</Label>
                <Input
                  type="email"
                  value={formData.cliente_email}
                  onChange={(e) =>
                    setFormData({ ...formData, cliente_email: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input
                  value={formData.cliente_telefone || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, cliente_telefone: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          {/* Detalhes do Orçamento */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Detalhes do Orçamento</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select value={formData.tipo} onValueChange={(value) => setFormData({ ...formData, tipo: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="impressao">Impressão 3D</SelectItem>
                    <SelectItem value="modelagem">Modelagem 3D</SelectItem>
                    <SelectItem value="pintura">Pintura e Acabamento</SelectItem>
                    <SelectItem value="manutencao">Manutenção</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as any })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="aprovado">Aprovado</SelectItem>
                    <SelectItem value="recusado">Recusado</SelectItem>
                    <SelectItem value="concluido">Concluído</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Valor (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.valor || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, valor: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>
            </div>
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label>Observações</Label>
            <Textarea
              value={formData.observacoes || ''}
              onChange={(e) =>
                setFormData({ ...formData, observacoes: e.target.value })
              }
              placeholder="Adicione notas sobre este orçamento..."
              className="min-h-[120px]"
            />
          </div>

          {/* Detalhes Adicionais */}
          {formData.detalhes && (
            <div className="space-y-4 p-4 bg-secondary/30 rounded-lg border border-border">
              <h3 className="font-semibold text-foreground">Detalhes Técnicos</h3>
              <div className="space-y-2 text-sm">
                {Object.entries(formData.detalhes).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-muted-foreground capitalize">{key}:</span>
                    <span className="font-medium text-foreground">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-background border-t border-border p-6 flex gap-3 justify-end">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isSaving} className="bg-accent hover:bg-accent/90">
            {isSaving ? (
              <>
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Salvar Alterações
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
