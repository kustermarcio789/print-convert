/**
 * Sistema de Propostas para Prestadores de Serviço
 * Conecta orçamentos de clientes com prestadores qualificados
 */

export interface Proposal {
  id: string;
  quoteId: string;
  providerId: string;
  providerName: string;
  providerEmail: string;
  serviceType: string;
  price: number;
  estimatedDays: number;
  description: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

export interface QuoteForProposal {
  id: string;
  clientName: string;
  clientEmail: string;
  serviceType: string;
  description: string;
  files: string[];
  budget?: number;
  deadline?: string;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: Date;
}

/**
 * Encontra prestadores qualificados para um orçamento
 */
export function findQualifiedProviders(quote: QuoteForProposal): any[] {
  // Buscar todos os prestadores
  const providers = JSON.parse(localStorage.getItem('prestadores') || '[]');
  
  // Filtrar prestadores que oferecem o serviço solicitado
  return providers.filter((provider: any) => {
    const services = provider.servicos || [];
    return services.includes(quote.serviceType);
  });
}

/**
 * Envia orçamento para prestadores qualificados
 */
export function sendQuoteToProviders(quoteId: string): {
  success: boolean;
  providerCount: number;
  message: string;
} {
  try {
    // Buscar orçamento
    const quotes = JSON.parse(localStorage.getItem('orcamentos') || '[]');
    const quote = quotes.find((q: any) => q.id === quoteId);
    
    if (!quote) {
      return {
        success: false,
        providerCount: 0,
        message: 'Orçamento não encontrado'
      };
    }

    // Encontrar prestadores qualificados
    const qualifiedProviders = findQualifiedProviders({
      id: quote.id,
      clientName: quote.nome || quote.clientName,
      clientEmail: quote.email || quote.clientEmail,
      serviceType: quote.tipo || quote.serviceType,
      description: quote.descricao || quote.description || '',
      files: quote.arquivos || quote.files || [],
      budget: quote.orcamento || quote.budget,
      deadline: quote.prazo || quote.deadline,
      status: quote.status || 'open',
      createdAt: new Date(quote.createdAt || Date.now())
    });

    // Criar notificações para prestadores
    const notifications = qualifiedProviders.map(provider => ({
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      providerId: provider.id,
      providerEmail: provider.email,
      quoteId: quoteId,
      type: 'new_quote',
      title: 'Novo Orçamento Disponível',
      message: `Novo orçamento de ${quote.tipo || quote.serviceType} disponível para proposta`,
      read: false,
      createdAt: new Date()
    }));

    // Salvar notificações
    const existingNotifications = JSON.parse(localStorage.getItem('provider_notifications') || '[]');
    localStorage.setItem('provider_notifications', JSON.stringify([...existingNotifications, ...notifications]));

    // Atualizar status do orçamento
    quote.sentToProviders = true;
    quote.providerCount = qualifiedProviders.length;
    localStorage.setItem('orcamentos', JSON.stringify(quotes));

    return {
      success: true,
      providerCount: qualifiedProviders.length,
      message: `Orçamento enviado para ${qualifiedProviders.length} prestador(es) qualificado(s)`
    };
  } catch (error) {
    return {
      success: false,
      providerCount: 0,
      message: 'Erro ao enviar orçamento para prestadores'
    };
  }
}

/**
 * Cria uma proposta de prestador
 */
export function createProposal(proposal: Omit<Proposal, 'id' | 'createdAt' | 'updatedAt'>): {
  success: boolean;
  proposal?: Proposal;
  message: string;
} {
  try {
    const newProposal: Proposal = {
      ...proposal,
      id: `proposal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Salvar proposta
    const proposals = JSON.parse(localStorage.getItem('proposals') || '[]');
    proposals.push(newProposal);
    localStorage.setItem('proposals', JSON.stringify(proposals));

    // Criar notificação para o cliente
    const quotes = JSON.parse(localStorage.getItem('orcamentos') || '[]');
    const quote = quotes.find((q: any) => q.id === proposal.quoteId);
    
    if (quote) {
      const clientNotification = {
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        quoteId: proposal.quoteId,
        type: 'new_proposal',
        title: 'Nova Proposta Recebida',
        message: `${proposal.providerName} enviou uma proposta de R$ ${proposal.price.toFixed(2)}`,
        read: false,
        createdAt: new Date()
      };

      const clientNotifications = JSON.parse(localStorage.getItem('client_notifications') || '[]');
      clientNotifications.push(clientNotification);
      localStorage.setItem('client_notifications', JSON.stringify(clientNotifications));
    }

    return {
      success: true,
      proposal: newProposal,
      message: 'Proposta enviada com sucesso!'
    };
  } catch (error) {
    return {
      success: false,
      message: 'Erro ao criar proposta'
    };
  }
}

/**
 * Lista propostas de um orçamento
 */
export function getProposalsByQuote(quoteId: string): Proposal[] {
  const proposals = JSON.parse(localStorage.getItem('proposals') || '[]');
  return proposals.filter((p: Proposal) => p.quoteId === quoteId);
}

/**
 * Lista propostas de um prestador
 */
export function getProposalsByProvider(providerId: string): Proposal[] {
  const proposals = JSON.parse(localStorage.getItem('proposals') || '[]');
  return proposals.filter((p: Proposal) => p.providerId === providerId);
}

/**
 * Aceita uma proposta
 */
export function acceptProposal(proposalId: string): {
  success: boolean;
  message: string;
} {
  try {
    const proposals = JSON.parse(localStorage.getItem('proposals') || '[]');
    const proposalIndex = proposals.findIndex((p: Proposal) => p.id === proposalId);
    
    if (proposalIndex === -1) {
      return {
        success: false,
        message: 'Proposta não encontrada'
      };
    }

    // Atualizar proposta
    proposals[proposalIndex].status = 'accepted';
    proposals[proposalIndex].updatedAt = new Date();
    
    // Rejeitar outras propostas do mesmo orçamento
    const quoteId = proposals[proposalIndex].quoteId;
    proposals.forEach((p: Proposal, index: number) => {
      if (p.quoteId === quoteId && index !== proposalIndex && p.status === 'pending') {
        proposals[index].status = 'rejected';
        proposals[index].updatedAt = new Date();
      }
    });

    localStorage.setItem('proposals', JSON.stringify(proposals));

    // Atualizar status do orçamento
    const quotes = JSON.parse(localStorage.getItem('orcamentos') || '[]');
    const quoteIndex = quotes.findIndex((q: any) => q.id === quoteId);
    if (quoteIndex !== -1) {
      quotes[quoteIndex].status = 'in_progress';
      quotes[quoteIndex].acceptedProposalId = proposalId;
      localStorage.setItem('orcamentos', JSON.stringify(quotes));
    }

    return {
      success: true,
      message: 'Proposta aceita com sucesso!'
    };
  } catch (error) {
    return {
      success: false,
      message: 'Erro ao aceitar proposta'
    };
  }
}

/**
 * Rejeita uma proposta
 */
export function rejectProposal(proposalId: string): {
  success: boolean;
  message: string;
} {
  try {
    const proposals = JSON.parse(localStorage.getItem('proposals') || '[]');
    const proposalIndex = proposals.findIndex((p: Proposal) => p.id === proposalId);
    
    if (proposalIndex === -1) {
      return {
        success: false,
        message: 'Proposta não encontrada'
      };
    }

    proposals[proposalIndex].status = 'rejected';
    proposals[proposalIndex].updatedAt = new Date();
    localStorage.setItem('proposals', JSON.stringify(proposals));

    return {
      success: true,
      message: 'Proposta rejeitada'
    };
  } catch (error) {
    return {
      success: false,
      message: 'Erro ao rejeitar proposta'
    };
  }
}
