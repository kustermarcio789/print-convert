import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Globe, Clock, TrendingUp, Users, MapPin,
  Eye, ChevronDown, ChevronUp, BarChart3, Activity
} from 'lucide-react';

interface VisitorData {
  onlineNow: number;
  today: number;
  lastWeek: number;
  thisMonth: number;
  hourlyData: { hour: string; visitors: number }[];
  trafficSources: { source: string; visits: number }[];
  topPages: { page: string; visits: number }[];
  geoData: {
    countries: { name: string; visits: number }[];
    states: { name: string; visits: number }[];
    cities: { name: string; visits: number }[];
  };
}

export default function AnalyticsPanel() {
  const [expanded, setExpanded] = useState(true);
  const [geoTab, setGeoTab] = useState<'country' | 'state' | 'city'>('country');
  const [data, setData] = useState<VisitorData>({
    onlineNow: 0,
    today: 0,
    lastWeek: 0,
    thisMonth: 0,
    hourlyData: [],
    trafficSources: [],
    topPages: [],
    geoData: {
      countries: [],
      states: [],
      cities: [],
    },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular dados de analytics
    // Em produção, isso viria de uma API real como Google Analytics
    const fetchAnalytics = async () => {
      setLoading(true);
      
      // Gerar dados simulados realistas
      const hourlyData = Array.from({ length: 24 }, (_, i) => ({
        hour: `${i.toString().padStart(2, '0')}h`,
        visitors: Math.floor(Math.random() * 15) + (i >= 8 && i <= 20 ? 5 : 1),
      }));

      const totalToday = hourlyData.reduce((sum, h) => sum + h.visitors, 0);

      setData({
        onlineNow: Math.floor(Math.random() * 5) + 1,
        today: totalToday,
        lastWeek: Math.floor(totalToday * 7 * (0.8 + Math.random() * 0.4)),
        thisMonth: Math.floor(totalToday * 30 * (0.8 + Math.random() * 0.4)),
        hourlyData,
        trafficSources: [
          { source: 'Direto', visits: Math.floor(totalToday * 0.4) },
          { source: 'Google', visits: Math.floor(totalToday * 0.3) },
          { source: 'Instagram', visits: Math.floor(totalToday * 0.15) },
          { source: 'WhatsApp', visits: Math.floor(totalToday * 0.1) },
          { source: 'Facebook', visits: Math.floor(totalToday * 0.05) },
        ],
        topPages: [
          { page: 'Início', visits: Math.floor(totalToday * 0.35) },
          { page: 'Produtos', visits: Math.floor(totalToday * 0.25) },
          { page: 'Orçamento', visits: Math.floor(totalToday * 0.15) },
          { page: 'Calculadora', visits: Math.floor(totalToday * 0.12) },
          { page: 'Consultor 3D', visits: Math.floor(totalToday * 0.08) },
          { page: 'Contato', visits: Math.floor(totalToday * 0.05) },
        ],
        geoData: {
          countries: [
            { name: 'Brasil', visits: Math.floor(totalToday * 30 * 0.85) },
            { name: 'Portugal', visits: Math.floor(totalToday * 30 * 0.05) },
            { name: 'Estados Unidos', visits: Math.floor(totalToday * 30 * 0.04) },
            { name: 'Argentina', visits: Math.floor(totalToday * 30 * 0.03) },
            { name: 'México', visits: Math.floor(totalToday * 30 * 0.02) },
            { name: 'Outros', visits: Math.floor(totalToday * 30 * 0.01) },
          ],
          states: [
            { name: 'São Paulo', visits: Math.floor(totalToday * 30 * 0.35) },
            { name: 'Rio de Janeiro', visits: Math.floor(totalToday * 30 * 0.15) },
            { name: 'Minas Gerais', visits: Math.floor(totalToday * 30 * 0.12) },
            { name: 'Paraná', visits: Math.floor(totalToday * 30 * 0.10) },
            { name: 'Rio Grande do Sul', visits: Math.floor(totalToday * 30 * 0.08) },
            { name: 'Bahia', visits: Math.floor(totalToday * 30 * 0.05) },
          ],
          cities: [
            { name: 'São Paulo', visits: Math.floor(totalToday * 30 * 0.20) },
            { name: 'Rio de Janeiro', visits: Math.floor(totalToday * 30 * 0.10) },
            { name: 'Ourinhos', visits: Math.floor(totalToday * 30 * 0.08) },
            { name: 'Belo Horizonte', visits: Math.floor(totalToday * 30 * 0.06) },
            { name: 'Curitiba', visits: Math.floor(totalToday * 30 * 0.05) },
            { name: 'Campinas', visits: Math.floor(totalToday * 30 * 0.04) },
          ],
        },
      });
      
      setLoading(false);
    };

    fetchAnalytics();
    
    // Atualizar a cada 30 segundos para simular tempo real
    const interval = setInterval(fetchAnalytics, 30000);
    return () => clearInterval(interval);
  }, []);

  const maxHourlyVisitors = Math.max(...data.hourlyData.map(h => h.visitors), 1);
  const maxTrafficVisits = Math.max(...data.trafficSources.map(t => t.visits), 1);

  const getGeoData = () => {
    switch (geoTab) {
      case 'country': return data.geoData.countries;
      case 'state': return data.geoData.states;
      case 'city': return data.geoData.cities;
      default: return data.geoData.countries;
    }
  };

  const maxGeoVisits = Math.max(...getGeoData().map(g => g.visits), 1);

  if (loading) {
    return (
      <div className="bg-[#0d0d0d] rounded-xl border border-white/10 p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
          <span className="ml-3 text-gray-400">Carregando analytics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0d0d0d] rounded-xl border border-white/10 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Globe className="w-5 h-5 text-amber-500" />
          <span className="text-white font-bold uppercase tracking-wider text-sm">Audiência</span>
        </div>
        {expanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
      </button>

      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="px-4 pb-4 space-y-6"
        >
          {/* Visitantes do Site */}
          <div className="bg-[#111] rounded-xl border border-white/5 p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-amber-500" />
                <span className="text-white font-semibold text-sm">VISITANTES DO SITE</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-green-400 text-xs font-medium">Tempo real</span>
              </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-4 gap-3 mb-6">
              <div className="bg-[#0a0a0a] rounded-lg p-3 border border-white/5">
                <div className="flex items-center gap-2 mb-1">
                  <Globe className="w-4 h-4 text-green-500" />
                  <span className="text-[10px] text-gray-500 uppercase">Online Agora</span>
                </div>
                <div className="text-2xl font-bold text-green-400">{data.onlineNow}</div>
              </div>
              <div className="bg-[#0a0a0a] rounded-lg p-3 border border-white/5">
                <div className="flex items-center gap-2 mb-1">
                  <Eye className="w-4 h-4 text-amber-500" />
                  <span className="text-[10px] text-gray-500 uppercase">Hoje</span>
                </div>
                <div className="text-2xl font-bold text-amber-400">{data.today}</div>
              </div>
              <div className="bg-[#0a0a0a] rounded-lg p-3 border border-white/5">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                  <span className="text-[10px] text-gray-500 uppercase">Últimos 7 dias</span>
                </div>
                <div className="text-2xl font-bold text-blue-400">{data.lastWeek}</div>
              </div>
              <div className="bg-[#0a0a0a] rounded-lg p-3 border border-white/5">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-4 h-4 text-purple-500" />
                  <span className="text-[10px] text-gray-500 uppercase">Este Mês</span>
                </div>
                <div className="text-2xl font-bold text-purple-400">{data.thisMonth}</div>
              </div>
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-2 gap-4">
              {/* Visitantes por Hora */}
              <div className="bg-[#0a0a0a] rounded-lg p-4 border border-white/5">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <span className="text-xs text-gray-400 uppercase">Visitantes por hora (hoje)</span>
                </div>
                <div className="flex items-end gap-0.5 h-32">
                  {data.hourlyData.map((item, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center">
                      <div
                        className="w-full bg-amber-500/80 rounded-t transition-all hover:bg-amber-400"
                        style={{ height: `${(item.visitors / maxHourlyVisitors) * 100}%`, minHeight: item.visitors > 0 ? '4px' : '0' }}
                        title={`${item.hour}: ${item.visitors} visitas`}
                      ></div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-[8px] text-gray-600 mt-1 px-1">
                  <span>00h</span>
                  <span>06h</span>
                  <span>12h</span>
                  <span>18h</span>
                  <span>23h</span>
                </div>
              </div>

              {/* Origem do Tráfego */}
              <div className="bg-[#0a0a0a] rounded-lg p-4 border border-white/5">
                <div className="flex items-center gap-2 mb-3">
                  <Activity className="w-4 h-4 text-amber-500" />
                  <span className="text-xs text-gray-400 uppercase">Origem do Tráfego (hoje)</span>
                </div>
                <div className="space-y-2">
                  {data.trafficSources.map((source, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 w-20 truncate">{source.source}</span>
                      <div className="flex-1 h-2 bg-[#111] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full transition-all"
                          style={{ width: `${(source.visits / maxTrafficVisits) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-amber-400 w-16 text-right">{source.visits} visitas</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Páginas Mais Visitadas */}
          <div className="bg-[#111] rounded-xl border border-white/5 p-4">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-4 h-4 text-amber-500" />
              <span className="text-white font-semibold text-sm uppercase">Páginas mais visitadas hoje</span>
            </div>
            <div className="space-y-2">
              {data.topPages.map((page, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <span className="text-gray-300 text-sm">{page.page}</span>
                  <span className="text-amber-400 text-sm font-medium">{page.visits} visitas</span>
                </div>
              ))}
            </div>
          </div>

          {/* Distribuição Geográfica */}
          <div className="bg-[#111] rounded-xl border border-white/5 p-4">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-4 h-4 text-amber-500" />
              <span className="text-white font-semibold text-sm uppercase">Distribuição Geográfica (este mês)</span>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-4 bg-[#0a0a0a] p-1 rounded-lg">
              {[
                { key: 'country', label: 'País', icon: Globe },
                { key: 'state', label: 'Estado', icon: MapPin },
                { key: 'city', label: 'Cidade', icon: MapPin },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setGeoTab(tab.key as any)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium transition-colors ${
                    geoTab === tab.key
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  <tab.icon className="w-3 h-3" />
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Gráfico de Barras */}
              <div className="bg-[#0a0a0a] rounded-lg p-4 border border-white/5">
                <span className="text-xs text-gray-500 uppercase mb-3 block">
                  Visitas por {geoTab === 'country' ? 'País' : geoTab === 'state' ? 'Estado' : 'Cidade'}
                </span>
                <div className="space-y-2">
                  {getGeoData().slice(0, 6).map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-400 w-24 truncate">{item.name}</span>
                      <div className="flex-1 h-2 bg-[#111] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full"
                          style={{ width: `${(item.visits / maxGeoVisits) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ranking */}
              <div className="bg-[#0a0a0a] rounded-lg p-4 border border-white/5">
                <span className="text-xs text-gray-500 uppercase mb-3 block">
                  Ranking de {geoTab === 'country' ? 'Países' : geoTab === 'state' ? 'Estados' : 'Cidades'}
                </span>
                <div className="space-y-2">
                  {getGeoData().slice(0, 6).map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-300">{item.name}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-sm font-bold text-white">{item.visits}</span>
                        <div className="h-1 w-16 bg-[#111] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-500 rounded-full"
                            style={{ width: `${(item.visits / maxGeoVisits) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
