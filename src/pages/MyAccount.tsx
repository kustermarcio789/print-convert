import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Package, FileText, Settings, LogOut, Bell, Clock, CheckCircle, AlertCircle, Star, MessageSquare } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';

const mockOrders = [
  { id: '#001234', service: 'Impressão 3D - PLA Branco', status: 'em_producao', date: '05/02/2026', provider: 'PrintMaster_SP', value: 'R$ 89,90' },
  { id: '#001198', service: 'Modelagem 3D - Peça técnica', status: 'aguardando_pagamento', date: '03/02/2026', provider: 'Design3D_Ana', value: 'R$ 150,00' },
  { id: '#001156', service: 'Pintura Premium - Figura', status: 'entregue', date: '28/01/2026', provider: 'ArtPaint3D', value: 'R$ 120,00' },
  { id: '#001099', service: 'Impressão 3D - PETG Preto', status: 'entregue', date: '20/01/2026', provider: '3DKPRINT', value: 'R$ 45,00' },
];

const statusMap: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  aguardando_pagamento: { label: 'Aguardando Pagamento', color: 'text-yellow-600 bg-yellow-50', icon: Clock },
  em_producao: { label: 'Em Produção', color: 'text-blue-600 bg-blue-50', icon: Clock },
  enviado: { label: 'Enviado', color: 'text-purple-600 bg-purple-50', icon: Package },
  entregue: { label: 'Entregue', color: 'text-green-600 bg-green-50', icon: CheckCircle },
  cancelado: { label: 'Cancelado', color: 'text-red-600 bg-red-50', icon: AlertCircle },
};

const mockNotifications = [
  { id: 1, text: 'Seu pedido #001234 está em produção', time: 'Há 2 horas', read: false },
  { id: 2, text: 'Nova proposta recebida para seu orçamento de pintura', time: 'Há 5 horas', read: false },
  { id: 3, text: 'Pedido #001156 foi entregue. Confirme o recebimento!', time: 'Há 2 dias', read: true },
];

export default function MyAccount() {
  const [activeTab, setActiveTab] = useState('pedidos');

  const tabs = [
    { id: 'pedidos', label: 'Meus Pedidos', icon: Package },
    { id: 'orcamentos', label: 'Orçamentos', icon: FileText },
    { id: 'notificacoes', label: 'Notificações', icon: Bell, badge: 2 },
    { id: 'configuracoes', label: 'Configurações', icon: Settings },
  ];

  return (
    <Layout>
      <section className="bg-primary py-12">
        <div className="container-custom">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center">
              <User className="w-8 h-8 text-accent" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primary-foreground">Minha Conta</h1>
              <p className="text-primary-foreground/70">Gerencie seus pedidos, orçamentos e configurações</p>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === tab.id ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-secondary'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <tab.icon className="w-4 h-4" />
                      {tab.label}
                    </div>
                    {tab.badge && (
                      <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{tab.badge}</span>
                    )}
                  </button>
                ))}
                <Link to="/" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors mt-4">
                  <LogOut className="w-4 h-4" />
                  Sair
                </Link>
              </nav>
            </div>

            {/* Content */}
            <div className="lg:col-span-3">
              {activeTab === 'pedidos' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <h2 className="text-xl font-bold text-foreground mb-6">Meus Pedidos</h2>
                  <div className="space-y-4">
                    {mockOrders.map((order) => {
                      const status = statusMap[order.status];
                      return (
                        <div key={order.id} className="card-elevated p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <span className="font-mono text-sm font-bold text-foreground">{order.id}</span>
                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                                <status.icon className="w-3 h-3" />
                                {status.label}
                              </span>
                            </div>
                            <p className="text-sm text-foreground font-medium">{order.service}</p>
                            <p className="text-xs text-muted-foreground">Prestador: {order.provider} · {order.date}</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-lg font-bold text-foreground">{order.value}</span>
                            {order.status === 'entregue' && (
                              <Button size="sm" variant="outline" className="text-xs">
                                <Star className="w-3 h-3 mr-1" /> Avaliar
                              </Button>
                            )}
                            {order.status === 'em_producao' && (
                              <Button size="sm" variant="outline" className="text-xs">
                                <MessageSquare className="w-3 h-3 mr-1" /> Acompanhar
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {activeTab === 'orcamentos' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <h2 className="text-xl font-bold text-foreground mb-6">Meus Orçamentos</h2>
                  <div className="card-elevated p-8 text-center">
                    <FileText className="w-12 h-12 text-muted mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">Seus orçamentos solicitados aparecerão aqui</p>
                    <Link to="/orcamento">
                      <Button className="bg-accent text-accent-foreground hover:bg-accent/90">Solicitar Orçamento</Button>
                    </Link>
                  </div>
                </motion.div>
              )}

              {activeTab === 'notificacoes' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <h2 className="text-xl font-bold text-foreground mb-6">Notificações</h2>
                  <div className="space-y-3">
                    {mockNotifications.map((notif) => (
                      <div key={notif.id} className={`card-elevated p-4 flex items-start gap-3 ${!notif.read ? 'border-accent/30 bg-accent/5' : ''}`}>
                        <Bell className={`w-5 h-5 flex-shrink-0 mt-0.5 ${!notif.read ? 'text-accent' : 'text-muted-foreground'}`} />
                        <div className="flex-1">
                          <p className={`text-sm ${!notif.read ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>{notif.text}</p>
                          <p className="text-xs text-muted-foreground mt-1">{notif.time}</p>
                        </div>
                        {!notif.read && <span className="w-2 h-2 rounded-full bg-accent flex-shrink-0 mt-2" />}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'configuracoes' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <h2 className="text-xl font-bold text-foreground mb-6">Configurações</h2>
                  <div className="card-elevated p-6 space-y-6">
                    <div>
                      <h3 className="font-semibold text-foreground mb-4">Dados Pessoais</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div><span className="text-muted-foreground">Nome:</span> <span className="font-medium text-foreground ml-2">Usuário Demo</span></div>
                        <div><span className="text-muted-foreground">E-mail:</span> <span className="font-medium text-foreground ml-2">demo@email.com</span></div>
                        <div><span className="text-muted-foreground">WhatsApp:</span> <span className="font-medium text-foreground ml-2">(43) 9-9174-1518</span></div>
                        <div><span className="text-muted-foreground">CEP:</span> <span className="font-medium text-foreground ml-2">86000-000</span></div>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-border">
                      <Button variant="outline">Editar Dados</Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
