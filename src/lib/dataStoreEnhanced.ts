// Sistema de armazenamento de dados melhorado para 3DKPRINT
// Integra funcionalidades do sistema 3dkprintsystem

export interface Produto {
  id: string;
  nome: string;
  descricao: string;
  modelo?: string;
  marca?: string;
  categoria: string;
  unidade: 'UN' | 'KG' | 'GR' | 'MT' | 'LT' | 'ML' | 'PC' | 'CX' | 'RL';
  valorCusto: number;
  valorVenda: number;
  estoque: number;
  estoqueMinimo: number;
  imagem?: string;
  dimensoes?: {
    peso?: number;
    largura?: number;
    altura?: number;
    profundidade?: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Cliente {
  id: string;
  tipo: 'PF' | 'PJ';
  nome: string;
  documento: string; // CPF ou CNPJ
  rg_ie?: string; // RG ou Inscrição Estadual
  email: string;
  telefone: string;
  endereco: {
    cep: string;
    rua: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    estado: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Fornecedor extends Cliente {
  tipoMaterial?: string;
  produtos?: string[]; // IDs dos produtos
}

export interface Prestador extends Cliente {
  especialidade: string;
  aprovado: boolean;
  servicos: string[];
  portfolio?: string;
}

export interface ItemOrcamento {
  produtoId?: string;
  quantidade: number;
  descricao: string;
  valorUnitario: number;
  valorTotal: number;
}

export interface Orcamento {
  id: string;
  numero: string;
  clienteId: string;
  tipo: 'impressao' | 'modelagem' | 'pintura' | 'manutencao' | 'produto';
  itens: ItemOrcamento[];
  subtotal: number;
  frete: number;
  total: number;
  status: 'pendente' | 'aprovado' | 'recusado' | 'convertido';
  formaPagamento?: string;
  observacoes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Venda {
  id: string;
  orcamentoId: string;
  clienteId: string;
  itens: ItemOrcamento[];
  total: number;
  formaPagamento: string;
  status: 'pendente' | 'pago' | 'cancelado';
  createdAt: string;
}

// Funções de gerenciamento de produtos
export const produtoService = {
  getAll: (): Produto[] => {
    const data = localStorage.getItem('produtos');
    return data ? JSON.parse(data) : [];
  },

  getById: (id: string): Produto | null => {
    const produtos = produtoService.getAll();
    return produtos.find(p => p.id === id) || null;
  },

  create: (produto: Omit<Produto, 'id' | 'createdAt' | 'updatedAt'>): Produto => {
    const produtos = produtoService.getAll();
    const novoProduto: Produto = {
      ...produto,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    produtos.push(novoProduto);
    localStorage.setItem('produtos', JSON.stringify(produtos));
    return novoProduto;
  },

  update: (id: string, data: Partial<Produto>): Produto | null => {
    const produtos = produtoService.getAll();
    const index = produtos.findIndex(p => p.id === id);
    if (index === -1) return null;

    produtos[index] = {
      ...produtos[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem('produtos', JSON.stringify(produtos));
    return produtos[index];
  },

  delete: (id: string): boolean => {
    const produtos = produtoService.getAll();
    const filtered = produtos.filter(p => p.id !== id);
    if (filtered.length === produtos.length) return false;
    localStorage.setItem('produtos', JSON.stringify(filtered));
    return true;
  },

  baixarEstoque: (id: string, quantidade: number): boolean => {
    const produto = produtoService.getById(id);
    if (!produto || produto.estoque < quantidade) return false;
    
    produtoService.update(id, {
      estoque: produto.estoque - quantidade,
    });
    return true;
  },

  verificarEstoqueBaixo: (): Produto[] => {
    const produtos = produtoService.getAll();
    return produtos.filter(p => p.estoque <= p.estoqueMinimo);
  },
};

// Funções de gerenciamento de clientes
export const clienteService = {
  getAll: (): Cliente[] => {
    const data = localStorage.getItem('clientes');
    return data ? JSON.parse(data) : [];
  },

  getById: (id: string): Cliente | null => {
    const clientes = clienteService.getAll();
    return clientes.find(c => c.id === id) || null;
  },

  create: (cliente: Omit<Cliente, 'id' | 'createdAt' | 'updatedAt'>): Cliente => {
    const clientes = clienteService.getAll();
    const novoCliente: Cliente = {
      ...cliente,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    clientes.push(novoCliente);
    localStorage.setItem('clientes', JSON.stringify(clientes));
    return novoCliente;
  },

  update: (id: string, data: Partial<Cliente>): Cliente | null => {
    const clientes = clienteService.getAll();
    const index = clientes.findIndex(c => c.id === id);
    if (index === -1) return null;

    clientes[index] = {
      ...clientes[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem('clientes', JSON.stringify(clientes));
    return clientes[index];
  },

  delete: (id: string): boolean => {
    const clientes = clienteService.getAll();
    const filtered = clientes.filter(c => c.id !== id);
    if (filtered.length === clientes.length) return false;
    localStorage.setItem('clientes', JSON.stringify(filtered));
    return true;
  },
};

// Funções de gerenciamento de vendas
export const vendaService = {
  getAll: (): Venda[] => {
    const data = localStorage.getItem('vendas');
    return data ? JSON.parse(data) : [];
  },

  create: (venda: Omit<Venda, 'id' | 'createdAt'>): Venda => {
    const vendas = vendaService.getAll();
    const novaVenda: Venda = {
      ...venda,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    vendas.push(novaVenda);
    localStorage.setItem('vendas', JSON.stringify(vendas));
    return novaVenda;
  },

  converterOrcamento: (orcamentoId: string): Venda | null => {
    // Buscar orçamento
    const orcamentos = JSON.parse(localStorage.getItem('orcamentos') || '[]');
    const orcamento = orcamentos.find((o: Orcamento) => o.id === orcamentoId);
    if (!orcamento) return null;

    // Verificar estoque
    for (const item of orcamento.itens) {
      if (item.produtoId) {
        const produto = produtoService.getById(item.produtoId);
        if (!produto || produto.estoque < item.quantidade) {
          throw new Error(`Estoque insuficiente para ${item.descricao}`);
        }
      }
    }

    // Baixar estoque
    for (const item of orcamento.itens) {
      if (item.produtoId) {
        produtoService.baixarEstoque(item.produtoId, item.quantidade);
      }
    }

    // Criar venda
    const venda = vendaService.create({
      orcamentoId: orcamento.id,
      clienteId: orcamento.clienteId,
      itens: orcamento.itens,
      total: orcamento.total,
      formaPagamento: orcamento.formaPagamento || 'A definir',
      status: 'pendente',
    });

    // Atualizar status do orçamento
    orcamento.status = 'convertido';
    localStorage.setItem('orcamentos', JSON.stringify(orcamentos));

    return venda;
  },

  getTotalVendas: (mes?: number, ano?: number): number => {
    const vendas = vendaService.getAll();
    return vendas
      .filter(v => {
        if (!mes || !ano) return true;
        const data = new Date(v.createdAt);
        return data.getMonth() === mes && data.getFullYear() === ano;
      })
      .reduce((total, v) => total + v.total, 0);
  },
};

// Estatísticas do dashboard
export const dashboardService = {
  getEstatisticas: () => {
    const produtos = produtoService.getAll();
    const clientes = clienteService.getAll();
    const vendas = vendaService.getAll();
    const orcamentos = JSON.parse(localStorage.getItem('orcamentos') || '[]');
    const prestadores = JSON.parse(localStorage.getItem('prestadores') || '[]');

    const hoje = new Date();
    const mesAtual = hoje.getMonth();
    const anoAtual = hoje.getFullYear();

    return {
      totalProdutos: produtos.length,
      produtosEstoqueBaixo: produtoService.verificarEstoqueBaixo().length,
      totalClientes: clientes.length,
      totalVendas: vendas.length,
      totalOrcamentos: orcamentos.length,
      orcamentosPendentes: orcamentos.filter((o: Orcamento) => o.status === 'pendente').length,
      prestadoresPendentes: prestadores.filter((p: Prestador) => !p.aprovado).length,
      vendasMesAtual: vendaService.getTotalVendas(mesAtual, anoAtual),
      ultimasVendas: vendas.slice(-5).reverse(),
    };
  },
};

// Inicializar dados de exemplo (apenas na primeira vez)
export const inicializarDadosExemplo = () => {
  if (!localStorage.getItem('dados_inicializados')) {
    // Produtos de exemplo
    const produtosExemplo: Omit<Produto, 'id' | 'createdAt' | 'updatedAt'>[] = [
      {
        nome: 'Filamento PLA 1kg',
        descricao: 'Filamento PLA de alta qualidade',
        modelo: 'PLA-1KG',
        marca: 'Generic',
        categoria: 'Filamento',
        unidade: 'UN',
        valorCusto: 45.00,
        valorVenda: 89.90,
        estoque: 50,
        estoqueMinimo: 10,
      },
      {
        nome: 'Resina Standard 1L',
        descricao: 'Resina fotopolimerizável padrão',
        modelo: 'RES-STD-1L',
        marca: 'Anycubic',
        categoria: 'Resina',
        unidade: 'UN',
        valorCusto: 80.00,
        valorVenda: 149.90,
        estoque: 30,
        estoqueMinimo: 5,
      },
    ];

    produtosExemplo.forEach(p => produtoService.create(p));
    localStorage.setItem('dados_inicializados', 'true');
  }
};
