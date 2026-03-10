import { useState } from 'react';
import { Check, Circle, Package, Truck, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export type OrderStatus = 
  | 'pendente'
  | 'aprovado'
  | 'em_producao'
  | 'qualidade'
  | 'embalagem'
  | 'enviado'
  | 'em_transito'
  | 'entregue'
  | 'cancelado';

export interface OrderTrackingData {
  orderId: string;
  status: OrderStatus;
  customer: {
    name: string;
    email: string;
  };
  items: {
    name: string;
    quantity: number;
  }[];
  timeline: {
    status: OrderStatus;
    title: string;
    description: string;
    timestamp: Date;
    location?: string;
  }[];
  shipping?: {
    carrier: string;
    trackingCode: string;
    estimatedDelivery: Date;
  };
}

interface OrderTrackingProps {
  data?: OrderTrackingData;
  onSearch?: (orderId: string) => void;
}

export default function OrderTracking({ data, onSearch }: OrderTrackingProps) {
  const [searchId, setSearchId] = useState('');

  const statusConfig: Record<OrderStatus, {
    label: string;
    icon: React.ComponentType<any>;
    color: string;
    bgColor: string;
  }> = {
    pendente: {
      label: 'Aguardando Aprovação',
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    aprovado: {
      label: 'Pedido Aprovado',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    em_producao: {
      label: 'Em Produção',
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    qualidade: {
      label: 'Controle de Qualidade',
      icon: CheckCircle,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    embalagem: {
      label: 'Embalagem',
      icon: Package,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100'
    },
    enviado: {
      label: 'Enviado',
      icon: Truck,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    em_transito: {
      label: 'Em Trânsito',
      icon: Truck,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    entregue: {
      label: 'Entregue',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    cancelado: {
      label: 'Cancelado',
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    }
  };

  const handleSearch = () => {
    if (onSearch && searchId.trim()) {
      onSearch(searchId.trim());
    }
  };

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Rastrear Pedido</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Digite o número do seu pedido para acompanhar o status
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="Ex: ORC-2024-001"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch}>
                Rastrear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentConfig = statusConfig[data.status];
  const CurrentIcon = currentConfig.icon;

  return (
    <div className="space-y-6">
      {/* Status Atual */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 mb-4">
            <div className={`p-4 rounded-full ${currentConfig.bgColor}`}>
              <CurrentIcon className={`w-8 h-8 ${currentConfig.color}`} />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold">{currentConfig.label}</h3>
              <p className="text-gray-600">Pedido #{data.orderId}</p>
            </div>
          </div>

          {data.shipping && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Transportadora</p>
                  <p className="font-semibold">{data.shipping.carrier}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Código de Rastreio</p>
                  <p className="font-semibold font-mono">{data.shipping.trackingCode}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Previsão de Entrega</p>
                  <p className="font-semibold">
                    {data.shipping.estimatedDelivery.toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico do Pedido</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Linha vertical */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />

            {/* Eventos */}
            <div className="space-y-6">
              {data.timeline.map((event, index) => {
                const config = statusConfig[event.status];
                const Icon = config.icon;
                const isLast = index === data.timeline.length - 1;

                return (
                  <div key={index} className="relative flex gap-4">
                    {/* Ícone */}
                    <div className={`relative z-10 flex-shrink-0 w-12 h-12 rounded-full ${config.bgColor} flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${config.color}`} />
                    </div>

                    {/* Conteúdo */}
                    <div className={`flex-1 ${!isLast ? 'pb-6' : ''}`}>
                      <div className="bg-white rounded-lg border p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold">{event.title}</h4>
                          <span className="text-sm text-gray-500">
                            {event.timestamp.toLocaleString('pt-BR')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          {event.description}
                        </p>
                        {event.location && (
                          <p className="text-xs text-gray-500">
                            📍 {event.location}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informações do Pedido */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhes do Pedido</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Cliente</p>
              <p className="font-semibold">{data.customer.name}</p>
              <p className="text-sm text-gray-600">{data.customer.email}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-2">Itens do Pedido</p>
              <div className="space-y-2">
                {data.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span>{item.name}</span>
                    <span className="text-sm text-gray-600">Qtd: {item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Dados de exemplo para demonstração
 */
export const exampleTrackingData: OrderTrackingData = {
  orderId: 'ORC-2024-001',
  status: 'em_transito',
  customer: {
    name: 'João Silva',
    email: 'joao@email.com'
  },
  items: [
    { name: 'Impressão 3D - Protótipo em PLA', quantity: 1 },
    { name: 'Pintura Premium - Acabamento Metálico', quantity: 1 }
  ],
  shipping: {
    carrier: 'Correios - SEDEX',
    trackingCode: 'BR123456789BR',
    estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
  },
  timeline: [
    {
      status: 'entregue',
      title: 'Pedido Entregue',
      description: 'Pedido entregue ao destinatário',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
      location: 'Ourinhos, SP'
    },
    {
      status: 'em_transito',
      title: 'Saiu para Entrega',
      description: 'Pedido saiu para entrega',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
      location: 'Centro de Distribuição - Ourinhos, SP'
    },
    {
      status: 'enviado',
      title: 'Pedido Enviado',
      description: 'Pedido postado nos Correios',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      location: '3DKPRINT - Ourinhos, SP'
    },
    {
      status: 'embalagem',
      title: 'Embalagem Concluída',
      description: 'Pedido embalado e pronto para envio',
      timestamp: new Date(Date.now() - 25 * 60 * 60 * 1000),
      location: '3DKPRINT - Ourinhos, SP'
    },
    {
      status: 'qualidade',
      title: 'Controle de Qualidade Aprovado',
      description: 'Peça aprovada no controle de qualidade',
      timestamp: new Date(Date.now() - 26 * 60 * 60 * 1000),
      location: '3DKPRINT - Ourinhos, SP'
    },
    {
      status: 'em_producao',
      title: 'Produção Concluída',
      description: 'Impressão 3D e pintura finalizadas',
      timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000),
      location: '3DKPRINT - Ourinhos, SP'
    },
    {
      status: 'aprovado',
      title: 'Pedido Aprovado',
      description: 'Pagamento confirmado, produção iniciada',
      timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000),
      location: '3DKPRINT - Ourinhos, SP'
    },
    {
      status: 'pendente',
      title: 'Pedido Recebido',
      description: 'Orçamento criado, aguardando aprovação',
      timestamp: new Date(Date.now() - 96 * 60 * 60 * 1000),
      location: '3DKPRINT - Ourinhos, SP'
    }
  ].reverse()
};
