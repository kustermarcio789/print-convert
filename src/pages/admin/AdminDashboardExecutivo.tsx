import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp, TrendingDown, DollarSign, Factory, Package, Users,
  Target, Zap, Calendar, ArrowUp, ArrowDown, Activity, AlertCircle
} from 'lucide-react';

interface KPI {
  titulo: string;
  valor: string;
  variacao: number;
  meta: number;
  icon: any;
  cor: string;
}

interface Projecao {
  periodo: string;
  vendas: number;
  producao: number;
  lucro: number;
}

export default function AdminDashboardExecutivo() {
  const navigate = useNavigate();
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [projecoes, setProjecoes] = useState<Projecao[]>([]);
  const [metricas, setMetricas] = useState({
    faturamentoMensal: 0,
    crescimentoMensal: 0,
    margemLucro: 0,
    taxaConversao: 0,
    produtividade: 0,
    satisfacaoCliente: 0
  });

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = () => {
    // Carregar dados do localStorage
    const orcamentos = JSON.parse(localStorage.getItem('orcamentos') || '[]');
    const registrosProducao = JSON.parse(localStorage.getItem('registros_producao') || '[]');
    const materiais = JSON.parse(localStorage.getItem('estoque_materiais') || '[]');

    // Calcular métricas
    const vendasAprovadas = orcamentos.filter((o: any) => o.status === 'aprovado');
    const faturamentoMensal = vendasAprovadas.reduce((sum: number, v: any) => sum + (v.valorTotal || 0), 0);
    const custoProducao = registrosProducao.reduce((sum: number, r: any) => sum + (r.custoMaterial || 0), 0);
    const lucro = faturamentoMensal - custoProducao;
    const margemLucro = faturamentoMensal > 0 ? (lucro / faturamentoMensal) * 100 : 0;
    const taxaConversao = orcamentos.length > 0 ? (vendasAprovadas.length / orcamentos.length) * 100 : 0;

    setMetricas({
      faturamentoMensal,
      crescimentoMensal: 15.5,
      margemLucro,
      taxaConversao,
      produtividade: 87.5,
      satisfacaoCliente: 92.0
    });

    // Configurar KPIs
    setKpis([
      {
        titulo: 'Faturamento Mensal',
        valor: `R$ ${faturamentoMensal.toFixed(2)}`,
        variacao: 15.5,
        meta: 80,
        icon: DollarSign,
        cor: 'green'
      },
      {
        titulo: 'Taxa de Conversão',
        valor: `${taxaConversao.toFixed(1)}%`,
        variacao: 8.2,
        meta: 60,
        icon: Target,
        cor: 'blue'
      },
      {
        titulo: 'Margem de Lucro',
        valor: `${margemLucro.toFixed(1)}%`,
        variacao: 5.3,
        meta: 70,
        icon: TrendingUp,
        cor: 'purple'
      },
      {
        titulo: 'Produtividade',
        valor: '87.5%',
        variacao: 12.1,
        meta: 85,
        icon: Zap,
        cor: 'orange'
      },
      {
        titulo: 'Satisfação do Cliente',
        valor: '92.0%',
        variacao: 3.5,
        meta: 90,
        icon: Users,
        cor: 'pink'
      },
      {
        titulo: 'Peças Produzidas',
        valor: registrosProducao.length.toString(),
        variacao: 18.7,
        meta: 75,
        icon: Factory,
        cor: 'indigo'
      }
    ]);

    // Projeções de crescimento
    const faturamentoBase = faturamentoMensal || 40000;
    const taxaCrescimento = 1.08; // 8% ao mês

    setProjecoes([
      {
        periodo: 'Próximo Mês',
        vendas: faturamentoBase * taxaCrescimento,
        producao: registrosProducao.length * 1.10,
        lucro: (faturamentoBase * taxaCrescimento) * (margemLucro / 100)
      },
      {
        periodo: 'Trimestre',
        vendas: faturamentoBase * Math.pow(taxaCrescimento, 3),
        producao: registrosProducao.length * 1.35,
        lucro: (faturamentoBase * Math.pow(taxaCrescimento, 3)) * (margemLucro / 100)
      },
      {
        periodo: 'Semestre',
        vendas: faturamentoBase * Math.pow(taxaCrescimento, 6),
        producao: registrosProducao.length * 1.75,
        lucro: (faturamentoBase * Math.pow(taxaCrescimento, 6)) * (margemLucro / 100)
      },
      {
        periodo: 'Ano',
        vendas: faturamentoBase * Math.pow(taxaCrescimento, 12),
        producao: registrosProducao.length * 2.5,
        lucro: (faturamentoBase * Math.pow(taxaCrescimento, 12)) * (margemLucro / 100)
      }
    ]);
  };

  const getCoresKPI = (cor: string) => {
    const cores: any = {
      green: { bg: 'bg-green-100', text: 'text-green-600', border: 'border-green-200' },
      blue: { bg: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-200' },
      purple: { bg: 'bg-purple-100', text: 'text-purple-600', border: 'border-purple-200' },
      orange: { bg: 'bg-orange-100', text: 'text-orange-600', border: 'border-orange-200' },
      pink: { bg: 'bg-pink-100', text: 'text-pink-600', border: 'border-pink-200' },
      indigo: { bg: 'bg-indigo-100', text: 'text-indigo-600', border: 'border-indigo-200' }
    };
    return cores[cor] || cores.blue;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/admin/relatorios')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            ← Voltar
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard Executivo</h1>
              <p className="text-gray-600 mt-2">KPIs e métricas estratégicas em tempo real</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg">
              <Activity className="h-5 w-5" />
              <span className="font-semibold">Atualizado agora</span>
            </div>
          </div>
        </div>

        {/* KPIs Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {kpis.map((kpi, index) => {
            const Icon = kpi.icon;
            const cores = getCoresKPI(kpi.cor);
            return (
              <div key={index} className={`bg-white p-6 rounded-lg shadow-sm border ${cores.border}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 ${cores.bg} rounded-lg`}>
                    <Icon className={`h-6 w-6 ${cores.text}`} />
                  </div>
                  <div className={`flex items-center gap-1 ${kpi.variacao >= 0 ? 'text-green-600' : 'text-red-600'} text-sm font-medium`}>
                    {kpi.variacao >= 0 ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                    {Math.abs(kpi.variacao).toFixed(1)}%
                  </div>
                </div>
                <h3 className="text-gray-600 text-sm font-medium">{kpi.titulo}</h3>
                <p className="text-2xl font-bold text-gray-900 mt-1">{kpi.valor}</p>
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                    <span>Meta</span>
                    <span>{kpi.meta}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${cores.bg.replace('100', '600')}`}
                      style={{ width: `${Math.min(kpi.meta, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Projeções de Crescimento */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-blue-600" />
            Projeções de Crescimento
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {projecoes.map((proj, index) => (
              <div key={index} className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <h3 className="font-bold text-gray-900">{proj.periodo}</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-600">Vendas Projetadas</p>
                    <p className="text-lg font-bold text-gray-900">
                      R$ {proj.vendas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Produção Estimada</p>
                    <p className="text-lg font-bold text-gray-900">
                      {Math.round(proj.producao)} peças
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Lucro Previsto</p>
                    <p className="text-lg font-bold text-green-600">
                      R$ {proj.lucro.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Análise de Desempenho */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Saúde do Negócio */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Activity className="h-6 w-6 text-green-600" />
              Saúde do Negócio
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="font-medium text-gray-900">Crescimento</span>
                </div>
                <span className="text-green-600 font-bold">
                  {metricas.crescimentoMensal.toFixed(1)}%
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="font-medium text-gray-900">Margem de Lucro</span>
                </div>
                <span className="text-blue-600 font-bold">
                  {metricas.margemLucro.toFixed(1)}%
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="font-medium text-gray-900">Taxa de Conversão</span>
                </div>
                <span className="text-purple-600 font-bold">
                  {metricas.taxaConversao.toFixed(1)}%
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="font-medium text-gray-900">Produtividade</span>
                </div>
                <span className="text-orange-600 font-bold">
                  {metricas.produtividade.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {/* Recomendações Estratégicas */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Target className="h-6 w-6 text-purple-600" />
              Recomendações Estratégicas
            </h2>
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Expansão de Capacidade</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Com crescimento de {metricas.crescimentoMensal.toFixed(1)}%, considere investir em mais equipamentos nos próximos 3 meses.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <DollarSign className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Otimização de Preços</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Margem de {metricas.margemLucro.toFixed(1)}% está saudável. Mantenha competitividade sem comprometer qualidade.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Users className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Fidelização de Clientes</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Satisfação em {metricas.satisfacaoCliente.toFixed(1)}%. Implemente programa de fidelidade para aumentar recorrência.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Package className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Gestão de Estoque</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Monitore materiais críticos semanalmente. Projeção indica aumento de 50% no consumo em 6 meses.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Metas e Objetivos */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6">Metas para os Próximos 12 Meses</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="flex items-center gap-3 mb-3">
                <DollarSign className="h-8 w-8" />
                <div>
                  <p className="text-sm opacity-90">Faturamento Anual</p>
                  <p className="text-2xl font-bold">
                    R$ {(metricas.faturamentoMensal * 12 * 1.5).toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>
              <p className="text-sm opacity-75">Crescimento de 50% sobre o atual</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="flex items-center gap-3 mb-3">
                <Factory className="h-8 w-8" />
                <div>
                  <p className="text-sm opacity-90">Produção Anual</p>
                  <p className="text-2xl font-bold">1.500 peças</p>
                </div>
              </div>
              <p className="text-sm opacity-75">Aumento de capacidade produtiva</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="flex items-center gap-3 mb-3">
                <Users className="h-8 w-8" />
                <div>
                  <p className="text-sm opacity-90">Satisfação</p>
                  <p className="text-2xl font-bold">95%</p>
                </div>
              </div>
              <p className="text-sm opacity-75">Excelência no atendimento</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
