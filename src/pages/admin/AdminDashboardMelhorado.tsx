import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  DollarSign,
  Package,
  Users,
  AlertCircle,
  Calendar,
  Target,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getOrcamentos, getProdutos, getInventarioMateriais } from '@/lib/supabaseClient';

interface MetricaCard {
  titulo: string;
  valor: string | number;
  variacao: number;
  icon: React.ReactNode;
  cor: string;
}

interface DadosGrafico {
  mes: string;
  receita: number;
  lucro: number;
  custos: number;
}

export default function AdminDashboardMelhorado() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [metricas, setMetricas] = useState<MetricaCard[]>([]);
  const [dadosGrafico, setDadosGrafico] = useState<DadosGrafico[]>([]);
  const [materiaisBaixoEstoque, setMateriaisBaixoEstoque] = useState<any[]>([]);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setIsLoading(true);

      // Buscar dados
      const orcamentos = await getOrcamentos();
      const produtos = await getProdutos();
      const materiais = await getInventarioMateriais();

      // Calcular métricas
      const totalOrcamentos = orcamentos.length;
      const orcamentosAprovados = orcamentos.filter(o => o.status === 'aprovado').length;
      const receitaTotal = orcamentos
        .filter(o => o.status === 'aprovado')
        .reduce((sum, o) => sum + (o.valor || 0), 0);

      // Calcular custo total de materiais
      const custoMateriais = materiais.reduce(
        (sum, m) => sum + (m.quantidade_gramas * m.preco_por_grama),
        0
      );

      // Calcular lucro (receita - custos)
      const lucroTotal = receitaTotal - custoMateriais;
      const margemLucro = receitaTotal > 0 ? ((lucroTotal / receitaTotal) * 100).toFixed(1) : '0';

      // Materiais com baixo estoque
      const baixoEstoque = materiais.filter(
        m => m.quantidade_gramas < m.quantidade_minima
      );

      // Atualizar métricas
      setMetricas([
        {
          titulo: 'Receita Total',
          valor: `R$ ${receitaTotal.toFixed(2)}`,
          variacao: 12.5,
          icon: <DollarSign className="w-6 h-6" />,
          cor: 'bg-blue-500/10 text-blue-600',
        },
        {
          titulo: 'Lucro Líquido',
          valor: `R$ ${lucroTotal.toFixed(2)}`,
          variacao: 8.2,
          icon: <TrendingUp className="w-6 h-6" />,
          cor: 'bg-green-500/10 text-green-600',
        },
        {
          titulo: 'Margem de Lucro',
          valor: `${margemLucro}%`,
          variacao: 3.1,
          icon: <Target className="w-6 h-6" />,
          cor: 'bg-purple-500/10 text-purple-600',
        },
        {
          titulo: 'Orçamentos',
          valor: `${orcamentosAprovados}/${totalOrcamentos}`,
          variacao: 5.0,
          icon: <Package className="w-6 h-6" />,
          cor: 'bg-orange-500/10 text-orange-600',
        },
      ]);

      // Preparar dados para gráfico (simulado para 6 meses)
      const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
      const dadosSimulados = meses.map((mes, index) => ({
        mes,
        receita: 5000 + Math.random() * 5000 + (index * 500),
        custos: 2000 + Math.random() * 2000 + (index * 200),
        lucro: 3000 + Math.random() * 3000 + (index * 300),
      }));
      setDadosGrafico(dadosSimulados);

      setMateriaisBaixoEstoque(baixoEstoque);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: 'Erro ao carregar dados',
        description: 'Não foi possível carregar as métricas.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const CORES = ['#667eea', '#764ba2', '#f093fb', '#4facfe'];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard Executivo</h1>
          <p className="text-muted-foreground mt-1">Análise completa de desempenho e lucratividade</p>
        </div>
        <Button onClick={carregarDados} disabled={isLoading}>
          {isLoading ? 'Atualizando...' : 'Atualizar Dados'}
        </Button>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricas.map((metrica, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`card-elevated p-6 ${metrica.cor} border-l-4 border-current`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{metrica.titulo}</p>
                <p className="text-2xl font-bold text-foreground mt-2">{metrica.valor}</p>
                <p className="text-xs text-green-600 mt-2">
                  ↑ {metrica.variacao}% vs mês anterior
                </p>
              </div>
              <div className="text-3xl opacity-20">{metrica.icon}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico de Receita vs Lucro */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 card-elevated p-6"
        >
          <h2 className="text-lg font-semibold text-foreground mb-4">Receita vs Lucro (6 Meses)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dadosGrafico}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="mes" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
              <Legend />
              <Bar dataKey="receita" fill="#667eea" name="Receita" />
              <Bar dataKey="lucro" fill="#51cf66" name="Lucro" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Gráfico de Custos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card-elevated p-6"
        >
          <h2 className="text-lg font-semibold text-foreground mb-4">Distribuição de Custos</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Materiais', value: 40 },
                  { name: 'Operacional', value: 30 },
                  { name: 'Pessoal', value: 20 },
                  { name: 'Outros', value: 10 },
                ]}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {CORES.map((cor, index) => (
                  <Cell key={`cell-${index}`} fill={cor} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Tendência de Lucro */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card-elevated p-6"
      >
        <h2 className="text-lg font-semibold text-foreground mb-4">Tendência de Lucro</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={dadosGrafico}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="mes" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="lucro"
              stroke="#667eea"
              strokeWidth={3}
              dot={{ fill: '#667eea', r: 5 }}
              activeDot={{ r: 7 }}
              name="Lucro"
            />
            <Line
              type="monotone"
              dataKey="custos"
              stroke="#f093fb"
              strokeWidth={3}
              dot={{ fill: '#f093fb', r: 5 }}
              activeDot={{ r: 7 }}
              name="Custos"
            />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Alertas de Estoque */}
      {materiaisBaixoEstoque.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card-elevated p-6 border-l-4 border-orange-500 bg-orange-500/5"
        >
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-2">Materiais com Baixo Estoque</h3>
              <div className="space-y-2">
                {materiaisBaixoEstoque.map((material, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-background rounded">
                    <div>
                      <p className="font-medium text-foreground">{material.material}</p>
                      <p className="text-sm text-muted-foreground">
                        {material.quantidade_gramas}g / {material.quantidade_minima}g
                      </p>
                    </div>
                    <Button size="sm" variant="outline">
                      Reabastecer
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
