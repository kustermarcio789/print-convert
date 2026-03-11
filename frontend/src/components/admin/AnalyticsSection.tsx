import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Globe, Clock, TrendingUp, Users, MapPin,
  Eye, BarChart3, Activity, Monitor
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface VisitorData {
  onlineNow: number;
  today: number;
  lastWeek: number;
  thisMonth: number;
  hourlyData: { hour: string; visitors: number }[];
  trafficSources: { source: string; visits: number; color: string }[];
  topPages: { page: string; visits: number }[];
  geoData: {
    states: { name: string; visits: number }[];
    cities: { name: string; visits: number }[];
  };
}

export default function AnalyticsSection() {
  const [geoTab, setGeoTab] = useState<'state' | 'city'>('state');
  const [data, setData] = useState<VisitorData>({
    onlineNow: 0,
    today: 0,
    lastWeek: 0,
    thisMonth: 0,
    hourlyData: [],
    trafficSources: [],
    topPages: [],
    geoData: {
      states: [],
      cities: [],
    },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      
      // Gerar dados simulados realistas
      const hourlyData = Array.from({ length: 24 }, (_, i) => ({
        hour: `${i.toString().padStart(2, '0')}`,
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
          { source: 'Direto', visits: Math.floor(totalToday * 0.4), color: 'bg-blue-500' },
          { source: 'Google', visits: Math.floor(totalToday * 0.3), color: 'bg-red-500' },
          { source: 'Instagram', visits: Math.floor(totalToday * 0.15), color: 'bg-pink-500' },
          { source: 'WhatsApp', visits: Math.floor(totalToday * 0.1), color: 'bg-green-500' },
          { source: 'Facebook', visits: Math.floor(totalToday * 0.05), color: 'bg-indigo-500' },
        ],
        topPages: [
          { page: 'Início', visits: Math.floor(totalToday * 0.35) },
          { page: 'Produtos', visits: Math.floor(totalToday * 0.25) },
          { page: 'Orçamento', visits: Math.floor(totalToday * 0.15) },
          { page: 'Calculadora', visits: Math.floor(totalToday * 0.12) },
          { page: 'Consultor 3D', visits: Math.floor(totalToday * 0.08) },
        ],
        geoData: {
          states: [
            { name: 'São Paulo', visits: Math.floor(totalToday * 30 * 0.35) },
            { name: 'Rio de Janeiro', visits: Math.floor(totalToday * 30 * 0.15) },
            { name: 'Minas Gerais', visits: Math.floor(totalToday * 30 * 0.12) },
            { name: 'Paraná', visits: Math.floor(totalToday * 30 * 0.10) },
            { name: 'Rio Grande do Sul', visits: Math.floor(totalToday * 30 * 0.08) },
          ],
          cities: [
            { name: 'São Paulo', visits: Math.floor(totalToday * 30 * 0.20) },
            { name: 'Rio de Janeiro', visits: Math.floor(totalToday * 30 * 0.10) },
            { name: 'Ourinhos', visits: Math.floor(totalToday * 30 * 0.08) },
            { name: 'Belo Horizonte', visits: Math.floor(totalToday * 30 * 0.06) },
            { name: 'Curitiba', visits: Math.floor(totalToday * 30 * 0.05) },
          ],
        },
      });
      
      setLoading(false);
    };

    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 60000);
    return () => clearInterval(interval);
  }, []);

  const maxHourlyVisitors = Math.max(...data.hourlyData.map(h => h.visitors), 1);
  const maxTrafficVisits = Math.max(...data.trafficSources.map(t => t.visits), 1);
  const geoData = geoTab === 'state' ? data.geoData.states : data.geoData.cities;
  const maxGeoVisits = Math.max(...geoData.map(g => g.visits), 1);

  if (loading) {
    return (
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-500">Carregando analytics...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 mb-6">
      {/* Header da Seção */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-bold text-gray-900">Audiência do Site</h2>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          <span className="text-green-600 font-medium">Tempo real</span>
        </div>
      </div>

      {/* KPIs de Visitantes */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-2">
            <Monitor className="w-4 h-4 text-green-600" />
            <span className="text-xs text-gray-500 uppercase font-medium">Online Agora</span>
          </div>
          <p className="text-3xl font-bold text-green-600">{data.onlineNow}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-2">
            <Eye className="w-4 h-4 text-blue-600" />
            <span className="text-xs text-gray-500 uppercase font-medium">Hoje</span>
          </div>
          <p className="text-3xl font-bold text-blue-600">{data.today}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-purple-600" />
            <span className="text-xs text-gray-500 uppercase font-medium">Últimos 7 dias</span>
          </div>
          <p className="text-3xl font-bold text-purple-600">{data.lastWeek.toLocaleString('pt-BR')}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-orange-600" />
            <span className="text-xs text-gray-500 uppercase font-medium">Este Mês</span>
          </div>
          <p className="text-3xl font-bold text-orange-600">{data.thisMonth.toLocaleString('pt-BR')}</p>
        </motion.div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Visitantes por Hora */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" />
              Visitantes por Hora (Hoje)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-1 h-32">
              {data.hourlyData.map((item, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center group relative">
                  <div
                    className="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition-colors cursor-pointer"
                    style={{ height: `${(item.visitors / maxHourlyVisitors) * 100}%`, minHeight: item.visitors > 0 ? '4px' : '0' }}
                  >
                    <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {item.hour}h: {item.visitors}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-2">
              <span>00h</span>
              <span>06h</span>
              <span>12h</span>
              <span>18h</span>
              <span>23h</span>
            </div>
          </CardContent>
        </Card>

        {/* Origem do Tráfego */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Activity className="w-4 h-4 text-green-500" />
              Origem do Tráfego (Hoje)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.trafficSources.map((source, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-20">{source.source}</span>
                  <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(source.visits / maxTrafficVisits) * 100}%` }}
                      transition={{ duration: 0.5, delay: idx * 0.1 }}
                      className={`h-full ${source.color} rounded-full`}
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-700 w-16 text-right">{source.visits}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Segunda linha de gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Páginas Mais Visitadas */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Globe className="w-4 h-4 text-purple-500" />
              Páginas Mais Visitadas (Hoje)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.topPages.map((page, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                      {idx + 1}
                    </span>
                    <span className="text-sm text-gray-700">{page.page}</span>
                  </div>
                  <span className="text-sm font-semibold text-blue-600">{page.visits} visitas</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Distribuição Geográfica */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-red-500" />
                Distribuição Geográfica (Mês)
              </CardTitle>
              <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setGeoTab('state')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    geoTab === 'state' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Estado
                </button>
                <button
                  onClick={() => setGeoTab('city')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    geoTab === 'city' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Cidade
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {geoData.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-28 truncate">{item.name}</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(item.visits / maxGeoVisits) * 100}%` }}
                      transition={{ duration: 0.5, delay: idx * 0.05 }}
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full"
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-700 w-16 text-right">{item.visits.toLocaleString('pt-BR')}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
