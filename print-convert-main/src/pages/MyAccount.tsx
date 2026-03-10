import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Package, FileText, Settings, LogOut, Bell, Clock, CheckCircle, AlertCircle, Save, MapPin, Phone, CreditCard, Calendar, Home, Building, Hash } from 'lucide-react';
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
  const [orders] = useState<any[]>([]);
  const [notifications] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const [userData, setUserData] = useState({
    name: localStorage.getItem('user_name') || 'Usuário Demo',
    email: localStorage.getItem('user_email') || 'demo@email.com',
    whatsapp: localStorage.getItem('user_whatsapp') || '',
    cpf: localStorage.getItem('user_cpf') || '',
    dataNascimento: localStorage.getItem('user_nascimento') || '',
    telefone: localStorage.getItem('user_telefone') || '',
    cep: localStorage.getItem('user_cep') || '',
    endereco: localStorage.getItem('user_endereco') || '',
    numero: localStorage.getItem('user_numero') || '',
    complemento: localStorage.getItem('user_complemento') || '',
    bairro: localStorage.getItem('user_bairro') || '',
    cidade: localStorage.getItem('user_cidade') || '',
    estado: localStorage.getItem('user_estado') || '',
  });

  const tabs = [
    { id: 'pedidos', label: 'Meus Pedidos', icon: Package },
    { id: 'orcamentos', label: 'Orçamentos', icon: FileText },
    { id: 'notificacoes', label: 'Notificações', icon: Bell, badge: notifications.filter(n => !n.read).length },
    { id: 'configuracoes', label: 'Configurações', icon: Settings },
  ];

  // Buscar endereço pelo CEP
  const buscarCep = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) return;
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setUserData(prev => ({
          ...prev,
          endereco: data.logradouro || prev.endereco,
          bairro: data.bairro || prev.bairro,
          cidade: data.localidade || prev.cidade,
          estado: data.uf || prev.estado,
        }));
      }
    } catch {
      // Silently fail
    }
  };

  // Máscara de CPF
  const formatCpf = (value: string) => {
    const nums = value.replace(/\D/g, '').slice(0, 11);
    return nums
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  };

  // Máscara de telefone
  const formatPhone = (value: string) => {
    const nums = value.replace(/\D/g, '').slice(0, 11);
    if (nums.length <= 10) {
      return nums.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d)/, '$1-$2');
    }
    return nums.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2');
  };

  // Máscara de CEP
  const formatCep = (value: string) => {
    const nums = value.replace(/\D/g, '').slice(0, 8);
    return nums.replace(/(\d{5})(\d)/, '$1-$2');
  };

  const handleSaveProfile = () => {
    // Salvar no localStorage
    Object.entries(userData).forEach(([key, value]) => {
      localStorage.setItem(`user_${key}`, value);
    });
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleUpdateField = (field: string, value: string) => {
    setUserData(prev => ({ ...prev, [field]: value }));
  };

  const estados = [
    'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA',
    'PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'
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
                    {tab.badge && tab.badge > 0 && (
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
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-foreground">Configurações da Conta</h2>
                    {!isEditing && (
                      <Button variant="outline" onClick={() => setIsEditing(true)} className="gap-2">
                        <Settings className="w-4 h-4" /> Editar Dados
                      </Button>
                    )}
                  </div>

                  {saveSuccess && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3"
                    >
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <p className="text-sm font-medium text-green-800">Dados atualizados com sucesso!</p>
                    </motion.div>
                  )}

                  <div className="space-y-6">
                    {/* Dados Pessoais */}
                    <div className="card-elevated p-6">
                      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
                        <User className="w-5 h-5 text-blue-600" />
                        <h3 className="font-bold text-foreground">Dados Pessoais</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                            <User className="w-3.5 h-3.5" /> Nome Completo
                          </label>
                          <Input 
                            value={userData.name} 
                            onChange={(e) => handleUpdateField('name', e.target.value)}
                            disabled={!isEditing}
                            className={!isEditing ? "bg-muted/30" : ""}
                            placeholder="Seu nome completo"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                            <CreditCard className="w-3.5 h-3.5" /> CPF
                          </label>
                          <Input 
                            value={userData.cpf}
                            onChange={(e) => handleUpdateField('cpf', formatCpf(e.target.value))}
                            disabled={!isEditing}
                            className={!isEditing ? "bg-muted/30" : ""}
                            placeholder="000.000.000-00"
                            maxLength={14}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" /> Data de Nascimento
                          </label>
                          <Input 
                            type="date"
                            value={userData.dataNascimento}
                            onChange={(e) => handleUpdateField('dataNascimento', e.target.value)}
                            disabled={!isEditing}
                            className={!isEditing ? "bg-muted/30" : ""}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                            E-mail
                          </label>
                          <Input 
                            value={userData.email} 
                            disabled={true}
                            className="bg-muted/30"
                          />
                          <p className="text-[10px] text-muted-foreground">O e-mail não pode ser alterado</p>
                        </div>
                      </div>
                    </div>

                    {/* Contato */}
                    <div className="card-elevated p-6">
                      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
                        <Phone className="w-5 h-5 text-green-600" />
                        <h3 className="font-bold text-foreground">Contato</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5" /> WhatsApp
                          </label>
                          <Input 
                            value={userData.whatsapp}
                            onChange={(e) => handleUpdateField('whatsapp', formatPhone(e.target.value))}
                            disabled={!isEditing}
                            className={!isEditing ? "bg-muted/30" : ""}
                            placeholder="(00) 0 0000-0000"
                            maxLength={16}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5" /> Telefone Fixo
                          </label>
                          <Input 
                            value={userData.telefone}
                            onChange={(e) => handleUpdateField('telefone', formatPhone(e.target.value))}
                            disabled={!isEditing}
                            className={!isEditing ? "bg-muted/30" : ""}
                            placeholder="(00) 0000-0000"
                            maxLength={15}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Endereço */}
                    <div className="card-elevated p-6">
                      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
                        <MapPin className="w-5 h-5 text-red-600" />
                        <h3 className="font-bold text-foreground">Endereço</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" /> CEP
                          </label>
                          <Input 
                            value={userData.cep}
                            onChange={(e) => {
                              const formatted = formatCep(e.target.value);
                              handleUpdateField('cep', formatted);
                              if (formatted.replace(/\D/g, '').length === 8) {
                                buscarCep(formatted);
                              }
                            }}
                            disabled={!isEditing}
                            className={!isEditing ? "bg-muted/30" : ""}
                            placeholder="00000-000"
                            maxLength={9}
                          />
                          {isEditing && <p className="text-[10px] text-blue-600">Digite o CEP para preencher automaticamente</p>}
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                            <Home className="w-3.5 h-3.5" /> Endereço (Rua/Avenida)
                          </label>
                          <Input 
                            value={userData.endereco}
                            onChange={(e) => handleUpdateField('endereco', e.target.value)}
                            disabled={!isEditing}
                            className={!isEditing ? "bg-muted/30" : ""}
                            placeholder="Rua, Avenida..."
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                            <Hash className="w-3.5 h-3.5" /> Número
                          </label>
                          <Input 
                            value={userData.numero}
                            onChange={(e) => handleUpdateField('numero', e.target.value)}
                            disabled={!isEditing}
                            className={!isEditing ? "bg-muted/30" : ""}
                            placeholder="Nº"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">
                            Complemento
                          </label>
                          <Input 
                            value={userData.complemento}
                            onChange={(e) => handleUpdateField('complemento', e.target.value)}
                            disabled={!isEditing}
                            className={!isEditing ? "bg-muted/30" : ""}
                            placeholder="Apto, Bloco..."
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">
                            Bairro
                          </label>
                          <Input 
                            value={userData.bairro}
                            onChange={(e) => handleUpdateField('bairro', e.target.value)}
                            disabled={!isEditing}
                            className={!isEditing ? "bg-muted/30" : ""}
                            placeholder="Bairro"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                            <Building className="w-3.5 h-3.5" /> Cidade
                          </label>
                          <Input 
                            value={userData.cidade}
                            onChange={(e) => handleUpdateField('cidade', e.target.value)}
                            disabled={!isEditing}
                            className={!isEditing ? "bg-muted/30" : ""}
                            placeholder="Cidade"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">
                            Estado
                          </label>
                          {isEditing ? (
                            <select
                              value={userData.estado}
                              onChange={(e) => handleUpdateField('estado', e.target.value)}
                              className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                            >
                              <option value="">Selecione</option>
                              {estados.map(uf => (
                                <option key={uf} value={uf}>{uf}</option>
                              ))}
                            </select>
                          ) : (
                            <Input 
                              value={userData.estado}
                              disabled={true}
                              className="bg-muted/30"
                              placeholder="UF"
                            />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Botões de ação */}
                    {isEditing && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex gap-4 pt-2"
                      >
                        <Button onClick={handleSaveProfile} className="bg-green-600 hover:bg-green-700 gap-2">
                          <Save className="w-4 h-4" /> Salvar Alterações
                        </Button>
                        <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancelar</Button>
                      </motion.div>
                    )}
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
