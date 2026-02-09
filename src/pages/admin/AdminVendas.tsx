import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, DollarSign, TrendingUp, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Venda {
  id: string;
  produto: string;
  cliente: string;
  valor: number;
  data: string;
  status: 'concluída' | 'pendente' | 'cancelada';
}

export default function AdminVendas() {
  const navigate = useNavigate();
  const [vendas, setVendas] = useState<Venda[]>([]);

  useEffect(() => {
    // Carregar vendas do localStorage ou API
    const vendasSalvas = localStorage.getItem('vendas');
    if (vendasSalvas) {
      setVendas(JSON.parse(vendasSalvas));
    } else {
      // Dados de exemplo
      const vendasExemplo: Venda[] = [
        {
          id: 'V-001',
          produto: 'Filamento PLA 1kg',
          cliente: 'João Silva',
          valor: 89.90,
          data: '2026-02-08',
          status: 'concluída',
        },
        {
          id: 'V-002',
          produto: 'Bico 0.4mm',
          cliente: 'Maria Santos',
          valor: 25.00,
          data: '2026-02-07',
          status: 'concluída',
        },
        {
          id: 'V-003',
          produto: 'Mesa PEI',
          cliente: 'Carlos Oliveira',
          valor: 150.00,
          data: '2026-02-06',
          status: 'pendente',
        },
      ];
      setVendas(vendasExemplo);
      localStorage.setItem('vendas', JSON.stringify(vendasExemplo));
    }
  }, []);

  const totalVendas = vendas.reduce((acc, venda) => acc + venda.valor, 0);
  const vendasConcluidas = vendas.filter(v => v.status === 'concluída').length;
  const vendasPendentes = vendas.filter(v => v.status === 'pendente').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'concluída':
        return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'pendente':
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 'cancelada':
        return 'bg-red-500/10 text-red-600 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/admin/dashboard')}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Vendas</h1>
              <p className="text-muted-foreground">Gerencie as vendas de produtos</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total de Vendas</CardTitle>
              <Package className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{vendas.length}</div>
              <p className="text-xs text-muted-foreground">vendas registradas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
              <DollarSign className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {totalVendas.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">em vendas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{vendasConcluidas}</div>
              <p className="text-xs text-muted-foreground">vendas finalizadas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
              <Calendar className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{vendasPendentes}</div>
              <p className="text-xs text-muted-foreground">aguardando</p>
            </CardContent>
          </Card>
        </div>

        {/* Vendas List */}
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Vendas</CardTitle>
          </CardHeader>
          <CardContent>
            {vendas.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Nenhuma venda registrada</p>
              </div>
            ) : (
              <div className="space-y-4">
                {vendas.map((venda) => (
                  <div
                    key={venda.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-mono text-sm text-muted-foreground">
                          {venda.id}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                            venda.status
                          )}`}
                        >
                          {venda.status}
                        </span>
                      </div>
                      <h3 className="font-semibold">{venda.produto}</h3>
                      <p className="text-sm text-muted-foreground">Cliente: {venda.cliente}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">
                        R$ {venda.valor.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(venda.data).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
