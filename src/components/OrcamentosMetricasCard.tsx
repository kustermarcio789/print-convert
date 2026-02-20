import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Printer, Cube, Palette, Wrench } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { getOrcamentosMetricas, subscribeOrcamentos } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';

interface MetricasOrcamentos {
  total: number;
  pendentes: number;
  aprovados: number;
  recusados: number;
  concluidos: number;
  porTipo: {
    impressao: number;
    modelagem: number;
    pintura: number;
    manutencao: number;
  };
}

interface TipoOrcamento {
  id: string;
  nome: string;
  icon: React.ReactNode;
  cor: string;
  chave: keyof MetricasOrcamentos['porTipo'];
}

const TIPOS_ORCAMENTOS: TipoOrcamento[] = [
  {
    id: '1',
    nome: 'Impressão 3D',
    icon: <Printer className="w-6 h-6" />,
    cor: 'from-blue-500 to-blue-600',
    chave: 'impressao',
  },
  {
    id: '2',
    nome: 'Modelagem 3D',
    icon: <Cube className="w-6 h-6" />,
    cor: 'from-purple-500 to-purple-600',
    chave: 'modelagem',
  },
  {
    id: '3',
    nome: 'Pintura',
    icon: <Palette className="w-6 h-6" />,
    cor: 'from-pink-500 to-pink-600',
    chave: 'pintura',
  },
  {
    id: '4',
    nome: 'Manutenção',
    icon: <Wrench className="w-6 h-6" />,
    cor: 'from-orange-500 to-orange-600',
    chave: 'manutencao',
  },
];

interface OrcamentosMetricasCardProps {
  onMetricasChange?: (metricas: MetricasOrcamentos) => void;
}

export function OrcamentosMetricasCard({ onMetricasChange }: OrcamentosMetricasCardProps) {
  const { toast } = useToast();
  const [metricas, setMetricas] = useState<MetricasOrcamentos>({
    total: 0,
    pendentes: 0,
    aprovados: 0,
    recusados: 0,
    concluidos: 0,
    porTipo: {
      impressao: 0,
      modelagem: 0,
      pintura: 0,
      manutencao: 0,
    },
  });
  const [isLoading, setIsLoading] = useState(true);

  // Carregar métricas iniciais
  useEffect(() => {
    carregarMetricas();
  }, []);

  // Inscrever-se em mudanças em tempo real
  useEffect(() => {
    const subscription = subscribeOrcamentos((payload: any) => {
      // Quando há mudança, recarregar as métricas
      carregarMetricas();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const carregarMetricas = async () => {
    try {
      setIsLoading(true);
      const novasMetricas = await getOrcamentosMetricas();
      setMetricas(novasMetricas);
      onMetricasChange?.(novasMetricas);
    } catch (error) {
      console.error('Erro ao carregar métricas:', error);
      toast({
        title: 'Erro ao carregar métricas',
        description: 'Não foi possível atualizar os contadores.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Orçamentos por Tipo</h2>
        <button
          onClick={carregarMetricas}
          disabled={isLoading}
          className="px-3 py-1 text-sm bg-accent text-white rounded-lg hover:bg-accent/90 disabled:opacity-50 transition-colors"
        >
          {isLoading ? 'Atualizando...' : 'Atualizar'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {TIPOS_ORCAMENTOS.map((tipo, index) => (
          <motion.div
            key={tipo.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg bg-gradient-to-br ${tipo.cor} text-white`}>
                  {tipo.icon}
                </div>
                <span className="text-3xl font-bold text-foreground">
                  {metricas.porTipo[tipo.chave]}
                </span>
              </div>

              <h3 className="font-semibold text-foreground mb-2">{tipo.nome}</h3>

              <div className="space-y-1 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>Pendentes:</span>
                  <span className="font-medium text-foreground">{metricas.pendentes}</span>
                </div>
                <div className="flex justify-between">
                  <span>Aprovados:</span>
                  <span className="font-medium text-green-600">{metricas.aprovados}</span>
                </div>
              </div>

              {/* Barra de progresso */}
              <div className="mt-4 h-2 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: metricas.total > 0
                      ? `${(metricas.porTipo[tipo.chave] / metricas.total) * 100}%`
                      : 0,
                  }}
                  transition={{ duration: 0.5 }}
                  className={`h-full bg-gradient-to-r ${tipo.cor}`}
                />
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Resumo Geral */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card-elevated p-6 mt-6"
      >
        <h3 className="font-semibold text-foreground mb-4">Resumo Geral</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center p-4 bg-secondary rounded-lg">
            <p className="text-3xl font-bold text-foreground">{metricas.total}</p>
            <p className="text-sm text-muted-foreground mt-1">Total</p>
          </div>
          <div className="text-center p-4 bg-yellow-500/10 rounded-lg">
            <p className="text-3xl font-bold text-yellow-600">{metricas.pendentes}</p>
            <p className="text-sm text-muted-foreground mt-1">Pendentes</p>
          </div>
          <div className="text-center p-4 bg-green-500/10 rounded-lg">
            <p className="text-3xl font-bold text-green-600">{metricas.aprovados}</p>
            <p className="text-sm text-muted-foreground mt-1">Aprovados</p>
          </div>
          <div className="text-center p-4 bg-red-500/10 rounded-lg">
            <p className="text-3xl font-bold text-red-600">{metricas.recusados}</p>
            <p className="text-sm text-muted-foreground mt-1">Recusados</p>
          </div>
          <div className="text-center p-4 bg-blue-500/10 rounded-lg">
            <p className="text-3xl font-bold text-blue-600">{metricas.concluidos}</p>
            <p className="text-sm text-muted-foreground mt-1">Concluídos</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
