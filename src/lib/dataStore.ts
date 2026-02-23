// Sistema de armazenamento de dados para o painel administrativo

export interface Orcamento {
  id: string;
  tipo: 'impressao' | 'modelagem' | 'pintura' | 'manutencao';
  cliente: string;
  email: string;
  telefone: string;
  data: string;
  status: 'pendente' | 'aprovado' | 'recusado';
  valor?: number;
  detalhes: any;
}

export interface Prestador {
  id: string;
  nome: string;
  apelido: string;
  email: string;
  telefone: string;
  cidade: string;
  estado: string;
  servicos: string[];
  experiencia: string;
  portfolio?: string;
  dataCadastro: string;
  status: 'pendente' | 'aprovado' | 'recusado';
  avaliacao?: number;
}

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  cidade?: string;
  estado?: string;
  dataCadastro: string;
  ultimoAcesso?: string;
  orcamentosRealizados: number;
  comprasRealizadas: number;
}

// Funções para gerenciar orçamentos
export const salvarOrcamento = (orcamento: Omit<Orcamento, 'id' | 'data' | 'status'>): string => {
  const orcamentos = getOrcamentos();
  const id = `ORC-${String(orcamentos.length + 1).padStart(3, '0')}`;
  const novoOrcamento: Orcamento = {
    ...orcamento,
    id,
    data: new Date().toISOString(),
    status: 'pendente',
  };
  orcamentos.push(novoOrcamento);
  localStorage.setItem('3dkprint_orcamentos', JSON.stringify(orcamentos));
  return id;
};

export const getOrcamentos = (): Orcamento[] => {
  const data = localStorage.getItem('3dkprint_orcamentos');
  return data ? JSON.parse(data) : [];
};

export const atualizarStatusOrcamento = (id: string, status: 'pendente' | 'aprovado' | 'recusado', valor?: number) => {
  const orcamentos = getOrcamentos();
  const index = orcamentos.findIndex((o) => o.id === id);
  if (index !== -1) {
    orcamentos[index].status = status;
    if (valor !== undefined) {
      orcamentos[index].valor = valor;
    }
    localStorage.setItem('3dkprint_orcamentos', JSON.stringify(orcamentos));
  }
};

// Funções para gerenciar prestadores
export const salvarPrestador = (prestador: Omit<Prestador, 'id' | 'dataCadastro' | 'status'>): string => {
  const prestadores = getPrestadores();
  const id = `PREST-${String(prestadores.length + 1).padStart(3, '0')}`;
  const novoPrestador: Prestador = {
    ...prestador,
    id,
    dataCadastro: new Date().toISOString(),
    status: 'pendente',
  };
  prestadores.push(novoPrestador);
  localStorage.setItem('3dkprint_prestadores', JSON.stringify(prestadores));
  return id;
};

export const getPrestadores = (): Prestador[] => {
  const data = localStorage.getItem('3dkprint_prestadores');
  return data ? JSON.parse(data) : [];
};

export const atualizarStatusPrestador = (id: string, status: 'pendente' | 'aprovado' | 'recusado') => {
  const prestadores = getPrestadores();
  const index = prestadores.findIndex((p) => p.id === id);
  if (index !== -1) {
    prestadores[index].status = status;
    localStorage.setItem('3dkprint_prestadores', JSON.stringify(prestadores));
  }
};

// Funções para gerenciar usuários
export const salvarUsuario = (usuario: Omit<Usuario, 'id' | 'dataCadastro' | 'orcamentosRealizados' | 'comprasRealizadas'>): string => {
  const usuarios = getUsuarios();
  const id = `USR-${String(usuarios.length + 1).padStart(3, '0')}`;
  const novoUsuario: Usuario = {
    ...usuario,
    id,
    dataCadastro: new Date().toISOString(),
    orcamentosRealizados: 0,
    comprasRealizadas: 0,
  };
  usuarios.push(novoUsuario);
  localStorage.setItem('3dkprint_usuarios', JSON.stringify(usuarios));
  return id;
};

export const getUsuarios = (): Usuario[] => {
  const data = localStorage.getItem('3dkprint_usuarios');
  return data ? JSON.parse(data) : [];
};

export const atualizarUltimoAcesso = (email: string) => {
  const usuarios = getUsuarios();
  const index = usuarios.findIndex((u) => u.email === email);
  if (index !== -1) {
    usuarios[index].ultimoAcesso = new Date().toISOString();
    localStorage.setItem('3dkprint_usuarios', JSON.stringify(usuarios));
  }
};

export const incrementarOrcamentosUsuario = (email: string) => {
  const usuarios = getUsuarios();
  const index = usuarios.findIndex((u) => u.email === email);
  if (index !== -1) {
    usuarios[index].orcamentosRealizados += 1;
    localStorage.setItem('3dkprint_usuarios', JSON.stringify(usuarios));
  }
};

// Funções de autenticação
export const autenticarUsuario = (email: string, senha: string): boolean => {
  // Implementação básica - em produção, usar hash e backend
  const usuarios = getUsuarios();
  const usuario = usuarios.find((u) => u.email === email);
  return !!usuario;
};

// Inicializar dados de exemplo (apenas para desenvolvimento)
export const inicializarDadosExemplo = () => {
  if (!localStorage.getItem('3dkprint_dados_inicializados')) {
    // Adicionar alguns orçamentos de exemplo
    const orcamentosExemplo: Orcamento[] = [
      {
        id: 'ORC-001',
        tipo: 'impressao',
        cliente: 'João Silva',
        email: 'joao@email.com',
        telefone: '(43) 99999-9999',
        data: new Date(2026, 1, 8).toISOString(),
        status: 'pendente',
        detalhes: {
          material: 'PLA',
          cor: 'Preto',
          quantidade: 2,
          infill: '20%',
          arquivo: 'peca.stl',
        },
      },
      {
        id: 'ORC-002',
        tipo: 'modelagem',
        cliente: 'Maria Santos',
        email: 'maria@email.com',
        telefone: '(43) 98888-8888',
        data: new Date(2026, 1, 7).toISOString(),
        status: 'aprovado',
        valor: 350.00,
        detalhes: {
          tipoModelagem: 'Parametrica',
          descricao: 'Suporte para monitor',
          referencia: 'imagem.jpg',
        },
      },
    ];

    const prestadoresExemplo: Prestador[] = [
      {
        id: 'PREST-001',
        nome: 'Carlos Mendes',
        apelido: 'CarlosPrint3D',
        email: 'carlos@email.com',
        telefone: '(43) 99999-1111',
        cidade: 'Londrina',
        estado: 'PR',
        servicos: ['Impressão 3D', 'Modelagem 3D'],
        experiencia: '5 anos',
        portfolio: 'https://portfolio.com/carlos',
        dataCadastro: new Date(2026, 1, 8).toISOString(),
        status: 'pendente',
      },
    ];

    const usuariosExemplo: Usuario[] = [
      {
        id: 'USR-001',
        nome: 'João Silva',
        email: 'joao@email.com',
        telefone: '(43) 99999-9999',
        cidade: 'Londrina',
        estado: 'PR',
        dataCadastro: new Date(2026, 0, 15).toISOString(),
        ultimoAcesso: new Date(2026, 1, 8).toISOString(),
        orcamentosRealizados: 3,
        comprasRealizadas: 5,
      },
    ];

    localStorage.setItem('3dkprint_orcamentos', JSON.stringify(orcamentosExemplo));
    localStorage.setItem('3dkprint_prestadores', JSON.stringify(prestadoresExemplo));
    localStorage.setItem('3dkprint_usuarios', JSON.stringify(usuariosExemplo));
    localStorage.setItem('3dkprint_dados_inicializados', 'true');
  }
};
