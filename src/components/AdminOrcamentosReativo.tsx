import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Edit, Eye, Loader, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useRealtimeOrcamentos } from '@/hooks/useRealtimeData';
import { deleteOrcamento } from '@/lib/supabaseClient';
import { OrcamentoEditModal } from './OrcamentoEditModal';

interface Orcamento {
  id: string;
  tipo: string;
  cliente_nome: string;
  cliente_email: string;
  status: 'pendente' | 'aprovado' | 'recusado' | 'concluido';
  valor?: number;
  data_criacao: string;
  observacoes?: string;
}

const STATUS_CORES = {
  pendente: 'bg-yellow-500/10 text-yellow-700 border-yellow-200',
  aprovado: 'bg-green-500/10 text-green-700 border-green-200',
  recusado: 'bg-red-500/10 text-red-700 border-red-200',
  concluido: 'bg-blue-500/10 text-blue-700 border-blue-200',
};

const TIPO_ICONES = {
  impressao: '🖨️',
  modelagem: '🎨',
  pintura: '🖌️',
  manutencao: '🔧',
};

export function AdminOrcamentosReativo() {
  const { toast } = useToast();
  const { orcamentos, isLoading, refetch } = useRealtimeOrcamentos();
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [selectedOrcamento, setSelectedOrcamento] = useState<Orcamento | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');

  // Filtrar orçamentos
  const orcamentosFiltrados = orcamentos.filter((o: Orcamento) =>
    filtroStatus === 'todos' ? true : o.status === filtroStatus
  );

  const handleDelete = async (id: string) => {
    // Confirmação
    if (!window.confirm('Tem certeza que deseja excluir este orçamento?')) {
      return;
    }

    setDeletingIds(prev => new Set(prev).add(id));

    try {
      const result = await deleteOrcamento(id);

      if (result.success) {
        // Remover imediatamente do estado local para reatividade
        // O hook useRealtimeOrcamentos vai atualizar automaticamente
        toast({
          title: 'Orçamento excluído',
          description: 'O orçamento foi removido com sucesso.',
        });
      } else {
        throw new Error('Falha ao excluir');
      }
    } catch (error) {
      console.error('Erro ao excluir:', error);
      toast({
        title: 'Erro ao excluir',
        description: 'Não foi possível remover o orçamento.',
        variant: 'destructive',
      });
    } finally {
      setDeletingIds(prev => {
        const novo = new Set(prev);
        novo.delete(id);
        return novo;
      });
    }
  };

  const handleEdit = (orcamento: Orcamento) => {
    setSelectedOrcamento(orcamento);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    setIsEditModalOpen(false);
    setSelectedOrcamento(null);
    refetch(); // Recarregar dados
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin mx-auto mb-2 text-accent" />
          <p className="text-muted-foreground">Carregando orçamentos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com Filtros */}
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-foreground">Gerenciar Orçamentos</h2>
        <div className="flex gap-2">
          {['todos', 'pendente', 'aprovado', 'recusado', 'concluido'].map(status => (
            <button
              key={status}
              onClick={() => setFiltroStatus(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filtroStatus === status
                  ? 'bg-accent text-white'
                  : 'bg-secondary text-foreground hover:bg-secondary/80'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Orçamentos */}
      {orcamentosFiltrados.length === 0 ? (
        <Card className="p-12 text-center">
          <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
          <p className="text-muted-foreground">Nenhum orçamento encontrado</p>
        </Card>
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {orcamentosFiltrados.map((orcamento: Orcamento, index: number) => (
              <motion.div
                key={orcamento.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-4">
                    {/* Informações */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">
                          {TIPO_ICONES[orcamento.tipo as keyof typeof TIPO_ICONES] || '📋'}
                        </span>
                        <div>
                          <h3 className="font-semibold text-foreground truncate">
                            {orcamento.cliente_nome}
                          </h3>
                          <p className="text-sm text-muted-foreground truncate">
                            {orcamento.cliente_email}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mt-3">
                        {/* Tipo */}
                        <span className="inline-block px-3 py-1 bg-blue-500/10 text-blue-700 border border-blue-200 rounded-full text-xs font-medium">
                          {orcamento.tipo}
                        </span>

                        {/* Status */}
                        <span
                          className={`inline-block px-3 py-1 border rounded-full text-xs font-medium ${
                            STATUS_CORES[orcamento.status]
                          }`}
                        >
                          {orcamento.status.charAt(0).toUpperCase() + orcamento.status.slice(1)}
                        </span>

                        {/* Valor */}
                        {orcamento.valor && (
                          <span className="inline-block px-3 py-1 bg-green-500/10 text-green-700 border border-green-200 rounded-full text-xs font-medium">
                            R$ {orcamento.valor.toFixed(2)}
                          </span>
                        )}

                        {/* Data */}
                        <span className="inline-block px-3 py-1 bg-gray-500/10 text-gray-700 border border-gray-200 rounded-full text-xs font-medium">
                          {new Date(orcamento.data_criacao).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>

                    {/* Ações */}
                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(orcamento)}
                        disabled={deletingIds.has(orcamento.id)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={deletingIds.has(orcamento.id)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(orcamento.id)}
                        disabled={deletingIds.has(orcamento.id)}
                      >
                        {deletingIds.has(orcamento.id) ? (
                          <Loader className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Observações */}
                  {orcamento.observacoes && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <p className="text-sm text-muted-foreground">
                        <strong>Observações:</strong> {orcamento.observacoes}
                      </p>
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Modal de Edição */}
      {selectedOrcamento && (
        <OrcamentoEditModal
          orcamento={selectedOrcamento}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSaveEdit}
        />
      )}

      {/* Contador de Resultados */}
      <div className="text-sm text-muted-foreground text-center">
        Exibindo {orcamentosFiltrados.length} de {orcamentos.length} orçamentos
      </div>
    </div>
  );
}
