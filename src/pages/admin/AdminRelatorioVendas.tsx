import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign, TrendingUp, TrendingDown, Calendar, Download,
  ShoppingCart, Users, Package, BarChart3, PieChart, ArrowUp, ArrowDown
} from 'lucide-react';

interface VendaMensal {
  mes: string;
  valor: number;
  quantidade: number;
}

interface VendaPorCategoria {
  categoria: string;
  valor: number;
  quantidade: number;
  percentual: number;
}

interface Cliente {
  nome: string;
  totalCompras: number;
  quantidadeCompras: number;
}

export default function AdminRelatorioVendas() {
  const navigate = useNavigate();
  const [periodo, setPeriodo] = useState<'mes' | 'trimestre' | 'ano'>('mes');
  const [vendasMensais, setVendasMensais] = useState<VendaMensal[]>([]);
  const [vendasPorCategoria, setVendasPorCategoria] = useState<VendaPorCategoria[]>([]);
  const [topClientes, setTopClientes] = useState<Cliente[]>([]);
  const [metricas, setMetricas] = useState({
    faturamentoTotal: 0,
    quantidadeVendas: 0,
    ticketMedio: 0,
    crescimento: 0,
    metaMensal: 50000,
    percentualMeta: 0
  });

  useEffect(() => {
    carregarDados();
  }, [periodo]);

  const carregarDados = () => {
    // Carregar orçamentos do localStorage
    const orcamentos = JSON.parse(localStorage.getItem('orcamentos') || '[]');
    const vendasAprovadas = orcamentos.filter((o: any) => o.status === 'aprovado');

    // Calcular métricas gerais
    const faturamentoTotal = vendasAprovadas.reduce((sum: number, v: any) => sum + (v.valorTotal || 0), 0);
    const quantidadeVendas = vendasAprovadas.length;
    const ticketMedio = quantidadeVendas > 0 ? faturamentoTotal / quantidadeVendas : 0;
    const metaMensal = 50000;
    const percentualMeta = (faturamentoTotal / metaMensal) * 100;

    setMetricas({
      faturamentoTotal,
      quantidadeVendas,
      ticketMedio,
      crescimento: 15.5, // Simulado
      metaMensal,
      percentualMeta
    });

    // Vendas mensais (simulado para demonstração)
    setVendasMensais([
      { mes: 'Jan', valor: 35000, quantidade: 12 },
      { mes: 'Fev', valor: 42000, quantidade: 15 },
      { mes: 'Mar', valor: 38000, quantidade: 14 },
      { mes: 'Abr', valor: 45000, quantidade: 16 },
      { mes: 'Mai', valor: 52000, quantidade: 18 },
      { mes: 'Jun', valor: 48000, quantidade: 17 },
    ]);

    // Vendas por categoria
    const categorias: { [key: string]: { valor: number; quantidade: number } } = {};
    vendasAprovadas.forEach((v: any) => {
      const tipo = v.tipo || 'Outros';
      if (!categorias[tipo]) {
        categorias[tipo] = { valor: 0, quantidade: 0 };
      }
      categorias[tipo].valor += v.valorTotal || 0;
      categorias[tipo].quantidade += 1;
    });

    const vendasCat = Object.entries(categorias).map(([categoria, dados]) => ({
      categoria,
      valor: dados.valor,
      quantidade: dados.quantidade,
      percentual: (dados.valor / faturamentoTotal) * 100
    })).sort((a, b) => b.valor - a.valor);

    setVendasPorCategoria(vendasCat);

    // Top clientes
    const clientes: { [key: string]: { total: number; quantidade: number } } = {};
    vendasAprovadas.forEach((v: any) => {
      const nome = v.cliente?.nome || 'Cliente Anônimo';
      if (!clientes[nome]) {
        clientes[nome] = { total: 0, quantidade: 0 };
      }
      clientes[nome].total += v.valorTotal || 0;
      clientes[nome].quantidade += 1;
    });

    const topCli = Object.entries(clientes)
      .map(([nome, dados]) => ({
        nome,
        totalCompras: dados.total,
        quantidadeCompras: dados.quantidade
      }))
      .sort((a, b) => b.totalCompras - a.totalCompras)
      .slice(0, 5);

    setTopClientes(topCli);
  };

  const exportarPDF = () => {
    alert('Exportando relatório de vendas em PDF... (Funcionalidade em desenvolvimento)');
  };

  const maxVenda = Math.max(...vendasMensais.map(v => v.valor));

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
              <h1 className="text-3xl font-bold text-gray-900">Relatório de Vendas</h1>
              <p className="text-gray-600 mt-2">Análise detalhada do faturamento e desempenho comercial</p>
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
                onClick={exportarPDF}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Download className="h-5 w-5" />
                Exportar PDF
              </button>
            </div>
          </div>
        </div>

        {/* Cards de Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
                <ArrowUp className="h-4 w-4" />
                {metricas.crescimento.toFixed(1)}%
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium">Faturamento Total</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              R$ {metricas.faturamentoTotal.toFixed(2)}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium">Quantidade de Vendas</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {metricas.quantidadeVendas}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium">Ticket Médio</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              R$ {metricas.ticketMedio.toFixed(2)}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium">Meta do Mês</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {metricas.percentualMeta.toFixed(1)}%
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-orange-600 h-2 rounded-full transition-all"
                style={{ width: `${Math.min(metricas.percentualMeta, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Gráfico de Vendas Mensais */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Evolução de Vendas</h2>
          <div className="space-y-4">
            {vendasMensais.map((venda, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{venda.mes}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">{venda.quantidade} vendas</span>
                    <span className="text-sm font-semibold text-gray-900">
                      R$ {venda.valor.toLocaleString('pt-BR')}
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all"
                    style={{ width: `${(venda.valor / maxVenda) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Vendas por Categoria */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <PieChart className="h-6 w-6 text-blue-600" />
              Vendas por Categoria
            </h2>
            <div className="space-y-4">
              {vendasPorCategoria.length > 0 ? (
                vendasPorCategoria.map((cat, index) => (
                  <div key={index} className="border-b border-gray-100 pb-4 last:border-0">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{cat.categoria}</span>
                      <span className="text-sm font-semibold text-blue-600">
                        {cat.percentual.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                      <span>{cat.quantidade} vendas</span>
                      <span className="font-semibold">R$ {cat.valor.toFixed(2)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${cat.percentual}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-8">Nenhuma venda registrada ainda</p>
              )}
            </div>
          </div>

          {/* Top Clientes */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Users className="h-6 w-6 text-purple-600" />
              Top 5 Clientes
            </h2>
            <div className="space-y-4">
              {topClientes.length > 0 ? (
                topClientes.map((cliente, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-purple-600 font-bold">{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{cliente.nome}</p>
                      <p className="text-sm text-gray-600">
                        {cliente.quantidadeCompras} {cliente.quantidadeCompras === 1 ? 'compra' : 'compras'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        R$ {cliente.totalCompras.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-8">Nenhum cliente registrado ainda</p>
              )}
            </div>
          </div>
        </div>

        {/* Análise e Insights */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-green-600" />
            Análise e Insights
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Desempenho Geral</h3>
              <p className="text-sm text-gray-600">
                {metricas.percentualMeta >= 100 ? (
                  <>✅ Parabéns! Você atingiu {metricas.percentualMeta.toFixed(1)}% da meta mensal de R$ {metricas.metaMensal.toLocaleString('pt-BR')}.</>
                ) : (
                  <>📊 Você está em {metricas.percentualMeta.toFixed(1)}% da meta mensal. Faltam R$ {(metricas.metaMensal - metricas.faturamentoTotal).toFixed(2)} para atingir o objetivo.</>
                )}
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Tendência de Crescimento</h3>
              <p className="text-sm text-gray-600">
                {metricas.crescimento > 0 ? (
                  <>📈 Suas vendas cresceram {metricas.crescimento.toFixed(1)}% em relação ao mês anterior. Continue investindo em marketing e atendimento!</>
                ) : (
                  <>📉 Houve uma queda de {Math.abs(metricas.crescimento).toFixed(1)}% nas vendas. Revise suas estratégias comerciais.</>
                )}
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Ticket Médio</h3>
              <p className="text-sm text-gray-600">
                💰 Seu ticket médio é de R$ {metricas.ticketMedio.toFixed(2)}. 
                {metricas.ticketMedio > 2000 ? ' Excelente! Continue oferecendo produtos e serviços premium.' : ' Considere estratégias de upsell e cross-sell para aumentar o valor médio.'}
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Oportunidades</h3>
              <p className="text-sm text-gray-600">
                {vendasPorCategoria.length > 0 && (
                  <>🎯 {vendasPorCategoria[0].categoria} é sua categoria mais forte ({vendasPorCategoria[0].percentual.toFixed(1)}%). Explore mais produtos nesta linha!</>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
