import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Package, FileText, Settings, LogOut, Bell, Clock, CheckCircle, AlertCircle, Star, MessageSquare, Save } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const statusMap: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  aguardando_pagamento: { label: 'Aguardando Pagamento', color: 'text-yellow-600 bg-yellow-50', icon: Clock },
  em_producao: { label: 'Em Produção', color: 'text-blue-600 bg-blue-50', icon: Clock },
  enviado: { label: 'Enviado', color: 'text-purple-600 bg-purple-50', icon: Package },
  entregue: { label: 'Entregue', color: 'text-green-600 bg-green-50', icon: CheckCircle },
  cancelado: { label: 'Cancelado', color: 'text-red-600 bg-red-50', icon: AlertCircle },
};

export default function MyAccount() {
  const [activeTab, setActiveTab] = useState('pedidos');
  const [orders, setOrders] = useState<any[]>([]); // Inicialmente vazio
  const [notifications, setNotifications] = useState<any[]>([]); // Inicialmente vazio
  const [isEditing, setIsEditing] = useState(false);
  
  const [userData, setUserData] = useState({
    name: 'Usuário Demo',
    email: 'demo@email.com',
    whatsapp: '(43) 9-9174-1518',
    cep: '86000-000'
  });

  const tabs = [
    { id: 'pedidos', label: 'Meus Pedidos', icon: Package },
    { id: 'orcamentos', label: 'Orçamentos', icon: FileText },
    { id: 'notificacoes', label: 'Notificações', icon: Bell, badge: notifications.filter(n => !n.read).length },
    { id: 'configuracoes', label: 'Configurações', icon: Settings },
  ];

  const handleSaveProfile = () => {
    setIsEditing(false);
    // Aqui integraria com Supabase futuramente
    alert('Perfil atualizado com sucesso!');
  };

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
                    {tab.badge > 0 && (
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
                  {orders.length > 0 ? (
                    <div className="space-y-4">
                      {orders.map((order) => {
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
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="card-elevated p-12 text-center">
                      <Package className="w-12 h-12 text-muted mx-auto mb-4 opacity-20" />
                      <p className="text-muted-foreground">Você ainda não possui pedidos realizados.</p>
                      <Link to="/produtos">
                        <Button variant="link" className="text-accent mt-2">Explorar produtos</Button>
                      </Link>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'orcamentos' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <h2 className="text-xl font-bold text-foreground mb-6">Meus Orçamentos</h2>
                  <div className="card-elevated p-12 text-center">
                    <FileText className="w-12 h-12 text-muted mx-auto mb-4 opacity-20" />
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
                  {notifications.length > 0 ? (
                    <div className="space-y-3">
                      {notifications.map((notif) => (
                        <div key={notif.id} className={`card-elevated p-4 flex items-start gap-3 ${!notif.read ? 'border-accent/30 bg-accent/5' : ''}`}>
                          <Bell className={`w-5 h-5 flex-shrink-0 mt-0.5 ${!notif.read ? 'text-accent' : 'text-muted-foreground'}`} />
                          <div className="flex-1">
                            <p className={`text-sm ${!notif.read ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>{notif.text}</p>
                            <p className="text-xs text-muted-foreground mt-1">{notif.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="card-elevated p-12 text-center">
                      <Bell className="w-12 h-12 text-muted mx-auto mb-4 opacity-20" />
                      <p className="text-muted-foreground">Sem novas notificações no momento.</p>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'configuracoes' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <h2 className="text-xl font-bold text-foreground mb-6">Configurações da Conta</h2>
                  <div className="card-elevated p-6 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Nome Completo</label>
                        <Input 
                          value={userData.name} 
                          onChange={(e) => setUserData({...userData, name: e.target.value})}
                          disabled={!isEditing}
                          className={!isEditing ? "bg-muted/30" : ""}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">E-mail</label>
                        <Input 
                          value={userData.email} 
                          disabled={true} // E-mail geralmente não muda fácil
                          className="bg-muted/30"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">WhatsApp</label>
                        <Input 
                          value={userData.whatsapp} 
                          onChange={(e) => setUserData({...userData, whatsapp: e.target.value})}
                          disabled={!isEditing}
                          className={!isEditing ? "bg-muted/30" : ""}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">CEP</label>
                        <Input 
                          value={userData.cep} 
                          onChange={(e) => setUserData({...userData, cep: e.target.value})}
                          disabled={!isEditing}
                          className={!isEditing ? "bg-muted/30" : ""}
                        />
                      </div>
                    </div>

                    <div className="pt-6 border-t border-border flex gap-4">
                      {isEditing ? (
                        <>
                          <Button onClick={handleSaveProfile} className="bg-green-600 hover:bg-green-700">
                            <Save className="w-4 h-4 mr-2" /> Salvar Alterações
                          </Button>
                          <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancelar</Button>
                        </>
                      ) : (
                        <Button variant="outline" onClick={() => setIsEditing(true)}>
                          <Settings className="w-4 h-4 mr-2" /> Editar Perfil
                        </Button>
                      )}
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
