import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, DollarSign, TrendingUp, Calendar, Trash2, Eye, Mail, Phone, MapPin, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Venda {
  id: string;
  produto: string;
  cliente: string;
  clienteEmail?: string;
  clienteTelefone?: string;
  clienteCidade?: string;
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
          clienteEmail: 'joao.silva@email.com',
          clienteTelefone: '(43) 99999-1111',
          clienteCidade: 'Jacarezinho - PR',
          valor: 89.90,
          data: '2026-02-08',
          status: 'concluída',
        },
        {
          id: 'V-002',
          produto: 'Bico 0.4mm',
          cliente: 'Maria Santos',
          clienteEmail: 'maria.santos@email.com',
          clienteTelefone: '(43) 99999-2222',
          clienteCidade: 'Jacarezinho - PR',
          valor: 25.00,
          data: '2026-02-07',
          status: 'concluída',
        },
        {
          id: 'V-003',
          produto: 'Mesa PEI',
          cliente: 'Carlos Oliveira',
          clienteEmail: 'carlos.oliveira@email.com',
          clienteTelefone: '(43) 99999-3333',
          clienteCidade: 'Jacarezinho - PR',
          valor: 150.00,
          data: '2026-02-06',
          status: 'pendente',
        },
      ];
      setVendas(vendasExemplo);
      localStorage.setItem('vendas', JSON.stringify(vendasExemplo));
    }
  }, []);

  const [modalDetalhes, setModalDetalhes] = useState(false);
  const [vendaSelecionada, setVendaSelecionada] = useState<Venda | null>(null);

  const totalVendas = vendas.reduce((acc, venda) => acc + venda.valor, 0);
  const vendasConcluidas = vendas.filter(v => v.status === 'concluída').length;
  const vendasPendentes = vendas.filter(v => v.status === 'pendente').length;

  const handleExcluir = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta venda?')) {
      const vendasAtualizadas = vendas.filter(v => v.id !== id);
      setVendas(vendasAtualizadas);
      localStorage.setItem('vendas', JSON.stringify(vendasAtualizadas));
      alert('Venda excluída com sucesso!');
    }
  };

  const handleVerDetalhes = (venda: Venda) => {
    setVendaSelecionada(venda);
    setModalDetalhes(true);
  };

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
                    className="p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
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
                        <h3 className="font-semibold text-lg mb-2">{venda.produto}</h3>
                        
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <p className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <span className="font-medium">Cliente:</span> {venda.cliente}
                          </p>
                          {venda.clienteEmail && (
                            <p className="flex items-center gap-2">
                              <Mail className="w-4 h-4" />
                              {venda.clienteEmail}
                            </p>
                          )}
                          {venda.clienteTelefone && (
                            <p className="flex items-center gap-2">
                              <Phone className="w-4 h-4" />
                              {venda.clienteTelefone}
                            </p>
                          )}
                          {venda.clienteCidade && (
                            <p className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              {venda.clienteCidade}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-3">
                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-600">
                            R$ {venda.valor.toFixed(2)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(venda.data).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            onClick={() => handleVerDetalhes(venda)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Ver Detalhes
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleExcluir(venda.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Excluir
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal de Detalhes */}
      {modalDetalhes && vendaSelecionada && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Detalhes da Venda</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setModalDetalhes(false)}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">ID da Venda</label>
                  <p className="text-lg font-semibold">{vendaSelecionada.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <p>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(vendaSelecionada.status)}`}>
                      {vendaSelecionada.status}
                    </span>
                  </p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">Produto</h3>
                <p className="text-lg">{vendaSelecionada.produto}</p>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Dados do Cliente</h3>
                <div className="space-y-2">
                  <p className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">Nome:</span> {vendaSelecionada.cliente}
                  </p>
                  {vendaSelecionada.clienteEmail && (
                    <p className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">E-mail:</span> {vendaSelecionada.clienteEmail}
                    </p>
                  )}
                  {vendaSelecionada.clienteTelefone && (
                    <p className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">Telefone:</span> {vendaSelecionada.clienteTelefone}
                    </p>
                  )}
                  {vendaSelecionada.clienteCidade && (
                    <p className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">Cidade:</span> {vendaSelecionada.clienteCidade}
                    </p>
                  )}
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Valor</label>
                    <p className="text-2xl font-bold text-green-600">
                      R$ {vendaSelecionada.valor.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Data</label>
                    <p className="text-lg">
                      {new Date(vendaSelecionada.data).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button
                variant="outline"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => {
                  setModalDetalhes(false);
                  handleExcluir(vendaSelecionada.id);
                }}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir Venda
              </Button>
              <Button onClick={() => setModalDetalhes(false)}>
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
