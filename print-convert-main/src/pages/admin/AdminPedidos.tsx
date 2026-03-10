import React, { useState, useEffect } from 'react';
import {
  ShoppingBag, Search, Filter, Eye, Trash2, CheckCircle, Clock, XCircle,
  Truck, Package, CreditCard, QrCode, Banknote, Phone, Mail, MapPin,
  Download, RefreshCw, ChevronDown, ChevronUp, AlertCircle, DollarSign,
  Calendar, User, FileText
} from 'lucide-react';

interface Pedido {
  id: string;
  paymentId: string;
  data: string;
  cliente: {
    nome: string;
    email: string;
    cpf: string;
    whatsapp: string;
  };
  endereco: {
    cep: string;
    rua: string;
    numero: string;
    complemento: string;
    bairro: string;
    cidade: string;
    estado: string;
  };
  produto: {
    id: string;
    nome: string;
    preco: number;
    marca: string;
  };
  frete: {
    nome: string;
    valor: number;
    prazo: number;
  } | null;
  pagamento: {
    metodo: string;
    status: string;
    total: number;
    desconto: number;
  };
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-emerald-100 text-emerald-800',
};

const statusLabels: Record<string, string> = {
  pending: 'Pendente',
  approved: 'Aprovado',
  rejected: 'Rejeitado',
  cancelled: 'Cancelado',
  processing: 'Processando',
  shipped: 'Enviado',
  delivered: 'Entregue',
};

const metodoLabels: Record<string, string> = {
  pix: 'PIX',
  cartao: 'Cartao',
  boleto: 'Boleto',
};

const metodoIcons: Record<string, any> = {
  pix: QrCode,
  cartao: CreditCard,
  boleto: Banknote,
};

export default function AdminPedidos() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [filterMetodo, setFilterMetodo] = useState('todos');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedPedidos, setSelectedPedidos] = useState<string[]>([]);

  useEffect(() => {
    loadPedidos();
  }, []);

  const loadPedidos = () => {
    const data = JSON.parse(localStorage.getItem('admin_pedidos') || '[]');
    setPedidos(data);
  };

  const updateStatus = (id: string, newStatus: string) => {
    const updated = pedidos.map(p => p.id === id ? { ...p, pagamento: { ...p.pagamento, status: newStatus } } : p);
    setPedidos(updated);
    localStorage.setItem('admin_pedidos', JSON.stringify(updated));
  };

  const deletePedido = (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este pedido?')) return;
    const updated = pedidos.filter(p => p.id !== id);
    setPedidos(updated);
    localStorage.setItem('admin_pedidos', JSON.stringify(updated));
  };

  const filteredPedidos = pedidos.filter(p => {
    const matchSearch = !search || 
      p.id.toLowerCase().includes(search.toLowerCase()) ||
      p.cliente.nome.toLowerCase().includes(search.toLowerCase()) ||
      p.cliente.email.toLowerCase().includes(search.toLowerCase()) ||
      p.produto.nome.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'todos' || p.pagamento.status === filterStatus;
    const matchMetodo = filterMetodo === 'todos' || p.pagamento.metodo === filterMetodo;
    return matchSearch && matchStatus && matchMetodo;
  });

  // Totais
  const totalVendas = pedidos.reduce((acc, p) => acc + (p.pagamento.status === 'approved' || p.pagamento.status === 'delivered' ? p.pagamento.total : 0), 0);
  const totalPendente = pedidos.reduce((acc, p) => acc + (p.pagamento.status === 'pending' ? p.pagamento.total : 0), 0);
  const totalPedidos = pedidos.length;
  const pedidosAprovados = pedidos.filter(p => ['approved', 'delivered', 'shipped'].includes(p.pagamento.status)).length;

  const exportCSV = () => {
    const headers = 'Pedido,Data,Cliente,Email,WhatsApp,Produto,Metodo,Status,Total\n';
    const rows = filteredPedidos.map(p => 
      `${p.id},${new Date(p.data).toLocaleDateString('pt-BR')},${p.cliente.nome},${p.cliente.email},${p.cliente.whatsapp},${p.produto.nome},${metodoLabels[p.pagamento.metodo] || p.pagamento.metodo},${statusLabels[p.pagamento.status] || p.pagamento.status},${p.pagamento.total.toFixed(2)}`
    ).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pedidos_3dkprint_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ShoppingBag className="w-7 h-7 text-blue-600" />
            Pedidos
          </h1>
          <p className="text-gray-500 text-sm mt-1">Gerencie os pedidos recebidos pelo checkout</p>
        </div>
        <div className="flex gap-2">
          <button onClick={loadPedidos} className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm flex items-center gap-1">
            <RefreshCw className="w-4 h-4" /> Atualizar
          </button>
          <button onClick={exportCSV} className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm flex items-center gap-1">
            <Download className="w-4 h-4" /> Exportar CSV
          </button>
        </div>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <ShoppingBag className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-gray-500">Total Pedidos</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalPedidos}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-sm text-gray-500">Aprovados</span>
          </div>
          <p className="text-2xl font-bold text-green-600">{pedidosAprovados}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            <span className="text-sm text-gray-500">Vendas Aprovadas</span>
          </div>
          <p className="text-2xl font-bold text-green-600">R$ {totalVendas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-yellow-600" />
            <span className="text-sm text-gray-500">Pendente</span>
          </div>
          <p className="text-2xl font-bold text-yellow-600">R$ {totalPendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por pedido, cliente, produto..."
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
          </div>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
            <option value="todos">Todos Status</option>
            <option value="pending">Pendente</option>
            <option value="approved">Aprovado</option>
            <option value="processing">Processando</option>
            <option value="shipped">Enviado</option>
            <option value="delivered">Entregue</option>
            <option value="rejected">Rejeitado</option>
            <option value="cancelled">Cancelado</option>
          </select>
          <select value={filterMetodo} onChange={e => setFilterMetodo(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
            <option value="todos">Todos Metodos</option>
            <option value="pix">PIX</option>
            <option value="cartao">Cartao</option>
            <option value="boleto">Boleto</option>
          </select>
        </div>
      </div>

      {/* Lista de Pedidos */}
      {filteredPedidos.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">Nenhum pedido encontrado</h3>
          <p className="text-gray-500">Os pedidos realizados no checkout aparecerao aqui automaticamente.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPedidos.map((pedido) => {
            const isExpanded = expandedId === pedido.id;
            const MetodoIcon = metodoIcons[pedido.pagamento.metodo] || CreditCard;

            return (
              <div key={pedido.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {/* Header do pedido */}
                <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                  onClick={() => setExpandedId(isExpanded ? null : pedido.id)}>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <ShoppingBag className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900">#{pedido.id}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[pedido.pagamento.status] || 'bg-gray-100 text-gray-800'}`}>
                          {statusLabels[pedido.pagamento.status] || pedido.pagamento.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-500 mt-0.5">
                        <span>{pedido.cliente.nome}</span>
                        <span>-</span>
                        <span>{pedido.produto.nome}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                      <p className="font-bold text-gray-900">R$ {pedido.pagamento.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <MetodoIcon className="w-3 h-3" />
                        <span>{metodoLabels[pedido.pagamento.metodo] || pedido.pagamento.metodo}</span>
                      </div>
                    </div>
                    <div className="text-right hidden sm:block">
                      <p className="text-xs text-gray-500">{new Date(pedido.data).toLocaleDateString('pt-BR')}</p>
                      <p className="text-xs text-gray-400">{new Date(pedido.data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                  </div>
                </div>

                {/* Detalhes expandidos */}
                {isExpanded && (
                  <div className="border-t border-gray-100 p-4 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Cliente */}
                      <div>
                        <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                          <User className="w-4 h-4 text-blue-600" /> Cliente
                        </h4>
                        <div className="space-y-2 text-sm">
                          <p><span className="text-gray-500">Nome:</span> <span className="font-medium">{pedido.cliente.nome}</span></p>
                          <p><span className="text-gray-500">Email:</span> <span className="font-medium">{pedido.cliente.email}</span></p>
                          <p><span className="text-gray-500">CPF:</span> <span className="font-medium">{pedido.cliente.cpf}</span></p>
                          <p><span className="text-gray-500">WhatsApp:</span> <span className="font-medium">{pedido.cliente.whatsapp}</span></p>
                          <div className="flex gap-2 mt-2">
                            <a href={`https://wa.me/55${pedido.cliente.whatsapp.replace(/\D/g, '')}?text=Ola ${pedido.cliente.nome}! Sobre seu pedido %23${pedido.id}...`}
                              target="_blank" rel="noopener noreferrer"
                              className="px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 flex items-center gap-1">
                              <Phone className="w-3 h-3" /> WhatsApp
                            </a>
                            <a href={`mailto:${pedido.cliente.email}?subject=Pedido %23${pedido.id} - 3DKPRINT`}
                              className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 flex items-center gap-1">
                              <Mail className="w-3 h-3" /> Email
                            </a>
                          </div>
                        </div>
                      </div>

                      {/* Endereco */}
                      <div>
                        <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-blue-600" /> Endereco
                        </h4>
                        <div className="space-y-1 text-sm">
                          <p className="font-medium">{pedido.endereco.rua}, {pedido.endereco.numero}</p>
                          {pedido.endereco.complemento && <p className="text-gray-500">{pedido.endereco.complemento}</p>}
                          <p>{pedido.endereco.bairro}</p>
                          <p>{pedido.endereco.cidade} - {pedido.endereco.estado}</p>
                          <p className="text-gray-500">CEP: {pedido.endereco.cep}</p>
                          {pedido.frete && (
                            <div className="mt-2 bg-white rounded-lg p-2">
                              <p className="text-xs text-gray-500">Frete: <span className="font-medium text-gray-900">{pedido.frete.nome} - R$ {pedido.frete.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></p>
                              <p className="text-xs text-gray-500">Prazo: <span className="font-medium">{pedido.frete.prazo} dias uteis</span></p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Pagamento */}
                      <div>
                        <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-blue-600" /> Pagamento
                        </h4>
                        <div className="space-y-2 text-sm">
                          <p><span className="text-gray-500">Metodo:</span> <span className="font-medium">{metodoLabels[pedido.pagamento.metodo] || pedido.pagamento.metodo}</span></p>
                          <p><span className="text-gray-500">Produto:</span> <span className="font-medium">R$ {pedido.produto.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></p>
                          {pedido.pagamento.desconto > 0 && (
                            <p className="text-green-600"><span>Desconto PIX:</span> <span className="font-medium">-R$ {pedido.pagamento.desconto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></p>
                          )}
                          {pedido.frete && (
                            <p><span className="text-gray-500">Frete:</span> <span className="font-medium">R$ {pedido.frete.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></p>
                          )}
                          <div className="border-t pt-2">
                            <p className="font-bold text-lg text-blue-600">Total: R$ {pedido.pagamento.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                          </div>
                          <p className="text-xs text-gray-400">Payment ID: {pedido.paymentId}</p>
                        </div>

                        {/* Alterar Status */}
                        <div className="mt-4">
                          <label className="block text-xs font-medium text-gray-700 mb-1">Alterar Status:</label>
                          <select value={pedido.pagamento.status}
                            onChange={(e) => updateStatus(pedido.id, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
                            <option value="pending">Pendente</option>
                            <option value="approved">Aprovado</option>
                            <option value="processing">Processando</option>
                            <option value="shipped">Enviado</option>
                            <option value="delivered">Entregue</option>
                            <option value="rejected">Rejeitado</option>
                            <option value="cancelled">Cancelado</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Acoes */}
                    <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end gap-2">
                      <button onClick={() => deletePedido(pedido.id)}
                        className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm flex items-center gap-1">
                        <Trash2 className="w-4 h-4" /> Excluir
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
