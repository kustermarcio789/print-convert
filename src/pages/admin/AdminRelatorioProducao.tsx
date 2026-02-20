import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Factory, Package, TrendingUp, DollarSign, Download, Calendar,
  AlertTriangle, BarChart3, PieChart, Weight, Zap
} from 'lucide-react';

interface ConsumoMaterial {
  material: string;
  quantidadeConsumida: number;
  custo: number;
  pecasProduzidas: number;
}

interface ProducaoMensal {
  mes: string;
  quantidade: number;
  custo: number;
}

export default function AdminRelatorioProducao() {
  const navigate = useNavigate();
  const [periodo, setPeriodo] = useState<'mes' | 'trimestre' | 'ano'>('mes');
  const [consumoPorMaterial, setConsumoPorMaterial] = useState<ConsumoMaterial[]>([]);
  const [producaoMensal, setProducaoMensal] = useState<ProducaoMensal[]>([]);
  const [metricas, setMetricas] = useState({
    pecasProduzidas: 0,
    materialConsumido: 0,
    custoTotal: 0,
    custoMedioPeca: 0,
    eficiencia: 0,
    desperdicio: 0
  });

  useEffect(() => {
    carregarDados();
  }, [periodo]);

  const carregarDados = () => {
    // Carregar registros de produção
    const registros = JSON.parse(localStorage.getItem('registros_producao') || '[]');

    // Calcular métricas gerais
    const pecasProduzidas = registros.length;
    const materialConsumido = registros.reduce((sum: number, r: any) => sum + (r.quantidadeTotal || 0), 0);
    const custoTotal = registros.reduce((sum: number, r: any) => sum + (r.custoMaterial || 0), 0);
    const custoMedioPeca = pecasProduzidas > 0 ? custoTotal / pecasProduzidas : 0;
    const desperdicio = registros.reduce((sum: number, r: any) => sum + (r.quantidadeDesperdicio || 0), 0);
    const eficiencia = materialConsumido > 0 ? ((materialConsumido - desperdicio) / materialConsumido) * 100 : 0;

    setMetricas({
      pecasProduzidas,
      materialConsumido,
      custoTotal,
      custoMedioPeca,
      eficiencia,
      desperdicio
    });

    // Agrupar consumo por material
    const consumoPorMat: { [key: string]: { quantidade: number; custo: number; pecas: number } } = {};
    registros.forEach((r: any) => {
      const mat = r.materialNome || 'Desconhecido';
      if (!consumoPorMat[mat]) {
        consumoPorMat[mat] = { quantidade: 0, custo: 0, pecas: 0 };
      }
      consumoPorMat[mat].quantidade += r.quantidadeTotal || 0;
      consumoPorMat[mat].custo += r.custoMaterial || 0;
      consumoPorMat[mat].pecas += 1;
    });

    const consumo = Object.entries(consumoPorMat)
      .map(([material, dados]) => ({
        material,
        quantidadeConsumida: dados.quantidade,
        custo: dados.custo,
        pecasProduzidas: dados.pecas
      }))
      .sort((a, b) => b.quantidadeConsumida - a.quantidadeConsumida);

    setConsumoPorMaterial(consumo);

    // Produção mensal (simulado)
    setProducaoMensal([
      { mes: 'Jan', quantidade: 45, custo: 1200 },
      { mes: 'Fev', quantidade: 52, custo: 1350 },
      { mes: 'Mar', quantidade: 48, custo: 1280 },
      { mes: 'Abr', quantidade: 58, custo: 1450 },
      { mes: 'Mai', quantidade: 65, custo: 1600 },
      { mes: 'Jun', quantidade: pecasProduzidas, custo: custoTotal },
    ]);
  };

  const exportarPDF = () => {
    alert('Exportando relatório de produção em PDF... (Funcionalidade em desenvolvimento)');
  };

  const maxProducao = Math.max(...producaoMensal.map(p => p.quantidade));

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
              <h1 className="text-3xl font-bold text-gray-900">Relatório de Produção</h1>
              <p className="text-gray-600 mt-2">Análise de consumo de materiais e eficiência produtiva</p>
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
              <div className="p-3 bg-blue-100 rounded-lg">
                <Factory className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium">Peças Produzidas</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {metricas.pecasProduzidas}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Weight className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium">Material Consumido</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {(metricas.materialConsumido / 1000).toFixed(2)}kg
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium">Custo Total</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              R$ {metricas.custoTotal.toFixed(2)}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Zap className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium">Eficiência</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {metricas.eficiencia.toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Gráfico de Produção Mensal */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Evolução da Produção</h2>
          <div className="space-y-4">
            {producaoMensal.map((prod, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{prod.mes}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">R$ {prod.custo.toFixed(2)}</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {prod.quantidade} peças
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all"
                    style={{ width: `${(prod.quantidade / maxProducao) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Consumo por Material */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Package className="h-6 w-6 text-blue-600" />
              Consumo por Material
            </h2>
            <div className="space-y-4">
              {consumoPorMaterial.length > 0 ? (
                consumoPorMaterial.map((mat, index) => (
                  <div key={index} className="border-b border-gray-100 pb-4 last:border-0">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{mat.material}</span>
                      <span className="text-sm font-semibold text-blue-600">
                        {(mat.quantidadeConsumida / 1000).toFixed(2)}kg
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                      <span>{mat.pecasProduzidas} peças</span>
                      <span className="font-semibold">R$ {mat.custo.toFixed(2)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ 
                          width: `${(mat.quantidadeConsumida / Math.max(...consumoPorMaterial.map(m => m.quantidadeConsumida))) * 100}%` 
                        }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-8">Nenhuma produção registrada ainda</p>
              )}
            </div>
          </div>

          {/* Análise de Custos */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <DollarSign className="h-6 w-6 text-green-600" />
              Análise de Custos
            </h2>
            <div className="space-y-6">
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Custo Médio por Peça</span>
                  <span className="text-lg font-bold text-green-600">
                    R$ {metricas.custoMedioPeca.toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-gray-600">
                  Baseado em {metricas.pecasProduzidas} peças produzidas
                </p>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Custo Total de Produção</span>
                  <span className="text-lg font-bold text-blue-600">
                    R$ {metricas.custoTotal.toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-gray-600">
                  Investimento total em materiais
                </p>
              </div>

              <div className="p-4 bg-orange-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Desperdício Total</span>
                  <span className="text-lg font-bold text-orange-600">
                    {(metricas.desperdicio / 1000).toFixed(2)}kg
                  </span>
                </div>
                <p className="text-xs text-gray-600">
                  {metricas.materialConsumido > 0 
                    ? `${((metricas.desperdicio / metricas.materialConsumido) * 100).toFixed(1)}% do material consumido`
                    : 'Sem dados de consumo'
                  }
                </p>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Taxa de Eficiência</span>
                  <span className="text-lg font-bold text-purple-600">
                    {metricas.eficiencia.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-purple-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full transition-all"
                    style={{ width: `${metricas.eficiencia}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Insights e Recomendações */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-blue-600" />
            Insights e Recomendações
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Eficiência Produtiva</h3>
              <p className="text-sm text-gray-600">
                {metricas.eficiencia >= 85 ? (
                  <>✅ Excelente! Sua eficiência de {metricas.eficiencia.toFixed(1)}% está acima da média do setor (80-85%).</>
                ) : metricas.eficiencia >= 70 ? (
                  <>⚠️ Sua eficiência de {metricas.eficiencia.toFixed(1)}% está na média. Otimize o uso de suportes para reduzir desperdício.</>
                ) : (
                  <>🔴 Atenção! Eficiência de {metricas.eficiencia.toFixed(1)}% está baixa. Revise configurações de impressão e uso de suportes.</>
                )}
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Custo por Peça</h3>
              <p className="text-sm text-gray-600">
                💰 Custo médio de R$ {metricas.custoMedioPeca.toFixed(2)} por peça. 
                {metricas.custoMedioPeca < 50 ? ' Ótimo custo! Mantenha a qualidade.' : ' Avalie fornecedores alternativos para reduzir custos.'}
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Material Mais Usado</h3>
              <p className="text-sm text-gray-600">
                {consumoPorMaterial.length > 0 && (
                  <>📦 {consumoPorMaterial[0].material} é seu material mais consumido ({(consumoPorMaterial[0].quantidadeConsumida / 1000).toFixed(2)}kg). Mantenha estoque adequado!</>
                )}
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Otimização</h3>
              <p className="text-sm text-gray-600">
                {metricas.desperdicio > 0 && (
                  <>♻️ Você desperdiçou {(metricas.desperdicio / 1000).toFixed(2)}kg em suportes. Configure impressões com menos suporte quando possível.</>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
