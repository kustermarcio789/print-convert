import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Package } from 'lucide-react';

interface DashboardChartsProps {
  data?: any;
}

export default function DashboardCharts({ data }: DashboardChartsProps) {
  // Dados de exemplo - substituir com dados reais
  const revenueData = [
    { month: 'Jan', revenue: 4200, orders: 24 },
    { month: 'Fev', revenue: 5800, orders: 32 },
    { month: 'Mar', revenue: 7200, orders: 41 },
    { month: 'Abr', revenue: 6500, orders: 38 },
    { month: 'Mai', revenue: 8900, orders: 52 },
    { month: 'Jun', revenue: 10200, orders: 61 }
  ];

  const serviceDistribution = [
    { name: 'Impressão 3D', value: 45, color: '#3b82f6' },
    { name: 'Modelagem', value: 25, color: '#8b5cf6' },
    { name: 'Pintura', value: 20, color: '#ec4899' },
    { name: 'Manutenção', value: 10, color: '#f59e0b' }
  ];

  const materialUsage = [
    { material: 'PLA', usage: 65 },
    { material: 'ABS', usage: 45 },
    { material: 'PETG', usage: 38 },
    { material: 'Resina', usage: 52 },
    { material: 'Nylon', usage: 28 }
  ];

  const dailyOrders = [
    { day: 'Seg', orders: 12, revenue: 1800 },
    { day: 'Ter', orders: 15, revenue: 2200 },
    { day: 'Qua', orders: 18, revenue: 2700 },
    { day: 'Qui', orders: 14, revenue: 2100 },
    { day: 'Sex', orders: 20, revenue: 3200 },
    { day: 'Sáb', orders: 16, revenue: 2400 },
    { day: 'Dom', orders: 8, revenue: 1200 }
  ];

  const stats = [
    {
      title: 'Receita Total',
      value: 'R$ 42.850',
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      color: 'text-green-600'
    },
    {
      title: 'Pedidos',
      value: '248',
      change: '+8.2%',
      trend: 'up',
      icon: ShoppingCart,
      color: 'text-blue-600'
    },
    {
      title: 'Clientes',
      value: '156',
      change: '+15.3%',
      trend: 'up',
      icon: Users,
      color: 'text-purple-600'
    },
    {
      title: 'Produtos',
      value: '89',
      change: '-2.4%',
      trend: 'down',
      icon: Package,
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trend === 'up' ? TrendingUp : TrendingDown;
          return (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">{stat.title}</span>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <div className={`flex items-center text-sm ${
                      stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      <TrendIcon className="w-4 h-4 mr-1" />
                      <span>{stat.change}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Gráficos Principais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Receita Mensal */}
        <Card>
          <CardHeader>
            <CardTitle>Receita Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value: any) => `R$ ${value}`}
                  contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3b82f6" 
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Distribuição de Serviços */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Serviços</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={serviceDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {serviceDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pedidos Diários */}
        <Card>
          <CardHeader>
            <CardTitle>Pedidos por Dia da Semana</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailyOrders}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb' }}
                />
                <Legend />
                <Bar dataKey="orders" fill="#3b82f6" name="Pedidos" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Uso de Materiais */}
        <Card>
          <CardHeader>
            <CardTitle>Uso de Materiais (kg)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={materialUsage} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="material" type="category" />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb' }}
                />
                <Bar dataKey="usage" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Linha - Tendência */}
      <Card>
        <CardHeader>
          <CardTitle>Tendência de Pedidos e Receita</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip 
                contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb' }}
              />
              <Legend />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="revenue" 
                stroke="#3b82f6" 
                strokeWidth={2}
                name="Receita (R$)"
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="orders" 
                stroke="#8b5cf6" 
                strokeWidth={2}
                name="Pedidos"
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
