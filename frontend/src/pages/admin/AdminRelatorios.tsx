import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3, Download, Filter, TrendingUp, TrendingDown,
  DollarSign, ClipboardList, Factory, ShoppingCart, Users,
  Calendar, FileText, PieChart, ArrowUpRight, ArrowDownRight,
  Printer, Package
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Sidebar from '@/components/admin/Sidebar';

// Dados simulados de relatórios
const dadosMensais = {
  receita: 45680,
  receitaAnterior: 38200,
  orcamentos: 127,
  orcamentosAnterior: 98,
  vendas: 34,
  vendasAnterior: 28,
  producao: 89,
  producaoAnterior: 72,
  ticketMedio: 1343.53,
  taxaConversao: 26.8,
  vendasPorMes: [
    { mes: 'Set', valor: 28500 },
    { mes: 'Out', valor: 32100 },
    { mes: 'Nov', valor: 38200 },
    { mes: 'Dez', valor: 42300 },
    { mes: 'Jan', valor: 38900 },
    { mes: 'Fev', valor: 45680 },
  ],
  topProdutos: [
    { nome: 'Elegoo Saturn 4 Ultra 16K', vendas: 8, receita: 47200 },
    { nome: 'Sovol SV08', vendas: 6, receita: 40800 },
    { nome: 'Elegoo Centauri Carbon', vendas: 5, receita: 21800 },
    { nome: 'Sovol Zero', vendas: 5, receita: 24500 },
    { nome: 'Elegoo Saturn 3 Ultra 12K', vendas: 4, receita: 14800 },
  ],
  statusOrcamentos: [
    { status: 'Aprovados', count: 34, cor: 'bg-green-500', pct: 26.8 },
    { status: 'Pendentes', count: 45, cor: 'bg-yellow-500', pct: 35.4 },
    { status: 'Em Análise', count: 28, cor: 'bg-blue-500', pct: 22.0 },
    { status: 'Recusados', count: 20, cor: 'bg-red-500', pct: 15.7 },
  ],
  categorias: [
    { nome: 'Impressoras FDM', vendas: 18, receita: 98200 },
    { nome: 'Impressoras Resina', vendas: 12, receita: 52800 },
    { nome: 'Serviços de Impressão', vendas: 45, receita: 12500 },
    { nome: 'Acessórios', vendas: 8, receita: 3200 },
  ],
};

function calcVariacao(atual: number, anterior: number) {
  const pct = ((atual - anterior) / anterior * 100).toFixed(1);
  return { pct: Number(pct), positivo: Number(pct) >= 0 };
}

export default function AdminRelatorios() {
  const [periodo, setPeriodo] = useState('mensal');
  const dados = dadosMensais;
  const maxVenda = Math.max(...dados.vendasPorMes.map(v => v.valor));

  const cards = [
    {
      titulo: 'Receita Total',
      valor: `R$ ${dados.receita.toLocaleString('pt-BR')}`,
      icon: DollarSign,
      cor: 'from-green-500 to-emerald-600',
      variacao: calcVariacao(dados.receita, dados.receitaAnterior),
    },
    {
      titulo: 'Orçamentos',
      valor: dados.orcamentos.toString(),
      icon: ClipboardList,
      cor: 'from-blue-500 to-indigo-600',
      variacao: calcVariacao(dados.orcamentos, dados.orcamentosAnterior),
    },
    {
      titulo: 'Vendas Realizadas',
      valor: dados.vendas.toString(),
      icon: ShoppingCart,
      cor: 'from-purple-500 to-violet-600',
      variacao: calcVariacao(dados.vendas, dados.vendasAnterior),
    },
    {
      titulo: 'Itens Produzidos',
      valor: dados.producao.toString(),
      icon: Factory,
      cor: 'from-orange-500 to-amber-600',
      variacao: calcVariacao(dados.producao, dados.producaoAnterior),
    },
  ];

  return (
    <div className="min-h-screen bg-[#0f1117] flex">
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-[#161923] border-b border-white/10 p-4 sticky top-0 z-10">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <BarChart3 className="text-blue-400" size={22} />
                Relatórios Gerenciais
              </h2>
              <p className="text-sm text-gray-400 mt-1">Análise completa do desempenho do negócio</p>
            </div>
            <div className="flex items-center gap-3">
              <Select value={periodo} onValueChange={setPeriodo}>
                <SelectTrigger className="w-[160px] bg-white/5 border-white/10 text-white">
                  <Calendar className="mr-2 h-4 w-4 text-gray-400" />
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="semanal">Semanal</SelectItem>
                  <SelectItem value="mensal">Mensal</SelectItem>
                  <SelectItem value="trimestral">Trimestral</SelectItem>
                  <SelectItem value="anual">Anual</SelectItem>
                </SelectContent>
              </Select>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Download className="mr-2 h-4 w-4" />
                Exportar PDF
              </Button>
            </div>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* Cards de métricas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((card, i) => {
              const Icon = card.icon;
              return (
                <div key={i} className="bg-[#161923] rounded-xl border border-white/10 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-400">{card.titulo}</span>
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${card.cor} flex items-center justify-center`}>
                      <Icon className="text-white" size={18} />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">{card.valor}</div>
                  <div className={`flex items-center gap-1 text-sm ${card.variacao.positivo ? 'text-green-400' : 'text-red-400'}`}>
                    {card.variacao.positivo ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    <span>{card.variacao.positivo ? '+' : ''}{card.variacao.pct}% vs mês anterior</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Indicadores extras */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#161923] rounded-xl border border-white/10 p-5">
              <span className="text-sm text-gray-400">Ticket Médio</span>
              <div className="text-2xl font-bold text-white mt-1">R$ {dados.ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            </div>
            <div className="bg-[#161923] rounded-xl border border-white/10 p-5">
              <span className="text-sm text-gray-400">Taxa de Conversão</span>
              <div className="text-2xl font-bold text-white mt-1">{dados.taxaConversao}%</div>
            </div>
            <div className="bg-[#161923] rounded-xl border border-white/10 p-5">
              <span className="text-sm text-gray-400">Período Selecionado</span>
              <div className="text-2xl font-bold text-white mt-1 capitalize">{periodo}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Gráfico de barras - Vendas por Mês */}
            <div className="lg:col-span-2 bg-[#161923] rounded-xl border border-white/10 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Receita por Mês</h3>
                <TrendingUp className="text-green-400" size={20} />
              </div>
              <div className="flex items-end gap-3 h-48">
                {dados.vendasPorMes.map((item, i) => {
                  const height = (item.valor / maxVenda) * 100;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <span className="text-xs text-gray-400">R$ {(item.valor / 1000).toFixed(1)}k</span>
                      <div
                        className="w-full rounded-t-lg bg-gradient-to-t from-blue-600 to-cyan-400 transition-all duration-500 hover:from-blue-500 hover:to-cyan-300"
                        style={{ height: `${height}%`, minHeight: '8px' }}
                      />
                      <span className="text-xs text-gray-500 font-medium">{item.mes}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Status dos Orçamentos */}
            <div className="bg-[#161923] rounded-xl border border-white/10 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Status Orçamentos</h3>
                <PieChart className="text-purple-400" size={20} />
              </div>
              <div className="space-y-4">
                {dados.statusOrcamentos.map((item, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-300">{item.status}</span>
                      <span className="text-sm font-semibold text-white">{item.count} ({item.pct}%)</span>
                    </div>
                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                      <div className={`h-full ${item.cor} rounded-full transition-all duration-700`} style={{ width: `${item.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Total</span>
                  <span className="text-white font-bold">{dados.orcamentos} orçamentos</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Produtos */}
            <div className="bg-[#161923] rounded-xl border border-white/10 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Top Produtos</h3>
                <Package className="text-amber-400" size={20} />
              </div>
              <div className="space-y-3">
                {dados.topProdutos.map((produto, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center text-sm font-bold text-blue-400">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{produto.nome}</p>
                      <p className="text-xs text-gray-400">{produto.vendas} vendas</p>
                    </div>
                    <span className="text-sm font-semibold text-green-400">R$ {produto.receita.toLocaleString('pt-BR')}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Vendas por Categoria */}
            <div className="bg-[#161923] rounded-xl border border-white/10 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Vendas por Categoria</h3>
                <Printer className="text-cyan-400" size={20} />
              </div>
              <div className="space-y-4">
                {dados.categorias.map((cat, i) => {
                  const maxReceita = Math.max(...dados.categorias.map(c => c.receita));
                  const pct = (cat.receita / maxReceita) * 100;
                  const cores = ['bg-blue-500', 'bg-purple-500', 'bg-cyan-500', 'bg-amber-500'];
                  return (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <span className="text-sm font-medium text-white">{cat.nome}</span>
                          <span className="text-xs text-gray-400 ml-2">({cat.vendas} vendas)</span>
                        </div>
                        <span className="text-sm font-semibold text-white">R$ {cat.receita.toLocaleString('pt-BR')}</span>
                      </div>
                      <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden">
                        <div className={`h-full ${cores[i]} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Links para relatórios detalhados */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/admin/relatorios/vendas" className="bg-[#161923] rounded-xl border border-white/10 p-5 hover:border-blue-500/50 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <TrendingUp className="text-blue-400" size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">Relatório de Vendas</h4>
                  <p className="text-xs text-gray-400">Detalhamento completo</p>
                </div>
              </div>
            </Link>
            <Link to="/admin/relatorios/producao" className="bg-[#161923] rounded-xl border border-white/10 p-5 hover:border-purple-500/50 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <Factory className="text-purple-400" size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white group-hover:text-purple-400 transition-colors">Relatório de Produção</h4>
                  <p className="text-xs text-gray-400">Acompanhamento detalhado</p>
                </div>
              </div>
            </Link>
            <Link to="/admin/relatorios/dashboard" className="bg-[#161923] rounded-xl border border-white/10 p-5 hover:border-green-500/50 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <BarChart3 className="text-green-400" size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white group-hover:text-green-400 transition-colors">Dashboard Executivo</h4>
                  <p className="text-xs text-gray-400">Visão estratégica</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
