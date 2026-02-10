import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText, TrendingUp, DollarSign, Package, Factory, Calendar,
  Download, Filter, BarChart3, PieChart, LineChart, ArrowUp, ArrowDown
} from 'lucide-react';

interface DadosRelatorio {
  vendas: {
    totalMes: number;
    totalAno: number;
    quantidadeMes: number;
    ticketMedio: number;
    crescimentoMensal: number;
  };
  producao: {
    pecasProduzidas: number;
    materialConsumido: number;
    custoProducao: number;
    eficiencia: number;
  };
  estoque: {
    valorTotal: number;
    itensAtivos: number;
    itensBaixos: number;
    itensCriticos: number;
  };
  orcamentos: {
    total: number;
    pendentes: number;
    aprovados: number;
    recusados: number;
    taxaConversao: number;
  };
}

export default function AdminRelatorios() {
  const navigate = useNavigate();
  const [periodo, setPeriodo] = useState<'mes' | 'trimestre' | 'ano'>('mes');
  const [dados, setDados] = useState<DadosRelatorio>({
    vendas: {
      totalMes: 0,
      totalAno: 0,
      quantidadeMes: 0,
      ticketMedio: 0,
      crescimentoMensal: 0
    },
    producao: {
      pecasProduzidas: 0,
      materialConsumido: 0,
      custoProducao: 0,
      eficiencia: 0
    },
    estoque: {
      valorTotal: 0,
      itensAtivos: 0,
      itensBaixos: 0,
      itensCriticos: 0
    },
    orcamentos: {
      total: 0,
      pendentes: 0,
      aprovados: 0,
      recusados: 0,
      taxaConversao: 0
    }
  });

  useEffect(() => {
    carregarDados();
  }, [periodo]);

  const carregarDados = () => {
    // Carregar dados do localStorage
    const orcamentos = JSON.parse(localStorage.getItem('orcamentos') || '[]');
    const registrosProducao = JSON.parse(localStorage.getItem('registros_producao') || '[]');
    const materiais = JSON.parse(localStorage.getItem('estoque_materiais') || '[]');
    const produtos = JSON.parse(localStorage.getItem('produtos') || '[]');

    // Calcular dados de vendas
    const vendasAprovadas = orcamentos.filter((o: any) => o.status === 'aprovado');
    const totalVendasMes = vendasAprovadas.reduce((sum: number, o: any) => sum + (o.valorTotal || 0), 0);
    const quantidadeVendasMes = vendasAprovadas.length;
    const ticketMedio = quantidadeVendasMes > 0 ? totalVendasMes / quantidadeVendasMes : 0;

    // Calcular dados de produção
    const pecasProduzidas = registrosProducao.length;
    const custoProducao = registrosProducao.reduce((sum: number, r: any) => sum + (r.custoMaterial || 0), 0);
    const materialConsumido = registrosProducao.reduce((sum: number, r: any) => sum + (r.quantidadeTotal || 0), 0);

    // Calcular dados de estoque
    const valorEstoque = materiais.reduce((sum: number, m: any) => sum + (m.precoCompra || 0), 0);
    const itensBaixos = materiais.filter((m: any) => m.status === 'baixo').length;
    const itensCriticos = materiais.filter((m: any) => m.status === 'critico').length;

    // Calcular dados de orçamentos
    const totalOrcamentos = orcamentos.length;
    const orcamentosPendentes = orcamentos.filter((o: any) => o.status === 'pendente').length;
    const orcamentosAprovados = orcamentos.filter((o: any) => o.status === 'aprovado').length;
    const orcamentosRecusados = orcamentos.filter((o: any) => o.status === 'recusado').length;
    const taxaConversao = totalOrcamentos > 0 ? (orcamentosAprovados / totalOrcamentos) * 100 : 0;

    setDados({
      vendas: {
        totalMes: totalVendasMes,
        totalAno: totalVendasMes * 12, // Estimativa
        quantidadeMes: quantidadeVendasMes,
        ticketMedio,
        crescimentoMensal: 15.5 // Simulado
      },
      producao: {
        pecasProduzidas,
        materialConsumido,
        custoProducao,
        eficiencia: 87.5 // Simulado
      },
      estoque: {
        valorTotal: valorEstoque,
        itensAtivos: materiais.length,
        itensBaixos,
        itensCriticos
      },
      orcamentos: {
        total: totalOrcamentos,
        pendentes: orcamentosPendentes,
        aprovados: orcamentosAprovados,
        recusados: orcamentosRecusados,
        taxaConversao
      }
    });
  };

  const exportarRelatorio = (tipo: string) => {
    alert(`Exportando relatório de ${tipo}... (Funcionalidade em desenvolvimento)`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            ← Voltar
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Relatórios Gerenciais</h1>
              <p className="text-gray-600 mt-2">Análise completa do desempenho do negócio</p>
            </div>
            <div className="flex gap-3">
              <select
                value={periodo}
                onChange={(e) => setPeriodo(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="mes">Este Mês</option>
                <option value="trimestre">Trimestre</option>
                <option value="ano">Ano</option>
              </select>
              <button
                onClick={() => exportarRelatorio('geral')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Download className="h-5 w-5" />
                Exportar PDF
              </button>
            </div>
          </div>
        </div>

        {/* Cards de Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Vendas */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
                <ArrowUp className="h-4 w-4" />
                {dados.vendas.crescimentoMensal.toFixed(1)}%
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium">Vendas do Mês</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              R$ {dados.vendas.totalMes.toFixed(2)}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              {dados.vendas.quantidadeMes} vendas realizadas
            </p>
          </div>

          {/* Produção */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Factory className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex items-center gap-1 text-blue-600 text-sm font-medium">
                {dados.producao.eficiencia.toFixed(1)}%
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium">Peças Produzidas</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {dados.producao.pecasProduzidas}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              {(dados.producao.materialConsumido / 1000).toFixed(2)}kg consumidos
            </p>
          </div>

          {/* Ticket Médio */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium">Ticket Médio</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              R$ {dados.vendas.ticketMedio.toFixed(2)}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Por venda realizada
            </p>
          </div>

          {/* Taxa de Conversão */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium">Taxa de Conversão</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {dados.orcamentos.taxaConversao.toFixed(1)}%
            </p>
            <p className="text-sm text-gray-500 mt-2">
              {dados.orcamentos.aprovados} de {dados.orcamentos.total} orçamentos
            </p>
          </div>
        </div>

        {/* Navegação de Relatórios */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <button
            onClick={() => navigate('/admin/relatorios/vendas')}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Relatório de Vendas</h3>
                <p className="text-sm text-gray-600">Análise detalhada de faturamento</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Ver relatório completo</span>
              <ArrowUp className="h-5 w-5 text-gray-400 rotate-45" />
            </div>
          </button>

          <button
            onClick={() => navigate('/admin/relatorios/producao')}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Factory className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Relatório de Produção</h3>
                <p className="text-sm text-gray-600">Consumo de materiais e custos</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Ver relatório completo</span>
              <ArrowUp className="h-5 w-5 text-gray-400 rotate-45" />
            </div>
          </button>

          <button
            onClick={() => navigate('/admin/relatorios/dashboard')}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <BarChart3 className="h-8 w-8 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Dashboard Executivo</h3>
                <p className="text-sm text-gray-600">KPIs e métricas em tempo real</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Ver dashboard</span>
              <ArrowUp className="h-5 w-5 text-gray-400 rotate-45" />
            </div>
          </button>
        </div>

        {/* Resumo Executivo */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Resumo Executivo</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Vendas */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                Desempenho de Vendas
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Faturamento Mensal</span>
                  <span className="font-semibold text-gray-900">R$ {dados.vendas.totalMes.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Projeção Anual</span>
                  <span className="font-semibold text-gray-900">R$ {dados.vendas.totalAno.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Crescimento</span>
                  <span className="font-semibold text-green-600 flex items-center gap-1">
                    <ArrowUp className="h-4 w-4" />
                    {dados.vendas.crescimentoMensal.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Produção */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Factory className="h-5 w-5 text-blue-600" />
                Eficiência Operacional
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Custo de Produção</span>
                  <span className="font-semibold text-gray-900">R$ {dados.producao.custoProducao.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Material Consumido</span>
                  <span className="font-semibold text-gray-900">{(dados.producao.materialConsumido / 1000).toFixed(2)}kg</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Eficiência</span>
                  <span className="font-semibold text-blue-600">{dados.producao.eficiencia.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Alertas e Recomendações */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-blue-600" />
            Insights e Recomendações
          </h2>
          <div className="space-y-3">
            {dados.vendas.crescimentoMensal > 10 && (
              <div className="flex items-start gap-3 bg-white p-4 rounded-lg">
                <div className="p-2 bg-green-100 rounded-lg">
                  <ArrowUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Crescimento Acelerado</p>
                  <p className="text-sm text-gray-600">
                    Suas vendas cresceram {dados.vendas.crescimentoMensal.toFixed(1)}% este mês. 
                    Considere aumentar o estoque de materiais mais utilizados.
                  </p>
                </div>
              </div>
            )}
            {dados.estoque.itensCriticos > 0 && (
              <div className="flex items-start gap-3 bg-white p-4 rounded-lg">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Package className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Atenção ao Estoque</p>
                  <p className="text-sm text-gray-600">
                    {dados.estoque.itensCriticos} {dados.estoque.itensCriticos === 1 ? 'material está' : 'materiais estão'} com estoque crítico. 
                    Programe compras urgentes para evitar interrupções na produção.
                  </p>
                </div>
              </div>
            )}
            {dados.orcamentos.taxaConversao < 50 && (
              <div className="flex items-start gap-3 bg-white p-4 rounded-lg">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Oportunidade de Melhoria</p>
                  <p className="text-sm text-gray-600">
                    Sua taxa de conversão está em {dados.orcamentos.taxaConversao.toFixed(1)}%. 
                    Revise seus preços e processos de negociação para aumentar aprovações.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
