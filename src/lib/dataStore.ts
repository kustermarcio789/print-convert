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

// Chaves do LocalStorage
const ORCAMENTOS_KEY = '3dkprint_orcamentos';
const PRESTADORES_KEY = '3dkprint_prestadores';
const USUARIOS_KEY = '3dkprint_usuarios';

// ==================== ORÇAMENTOS ====================

export const getOrcamentos = (): Orcamento[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(ORCAMENTOS_KEY);
  return data ? JSON.parse(data) : [];
};

export const salvarOrcamento = (
  orcamento: Omit<Orcamento, 'id' | 'data' | 'status'>
): string => {
  const orcamentos = getOrcamentos();
  const id = `ORC-${String(orcamentos.length + 1).padStart(3, '0')}`;

  const novoOrcamento: Orcamento = {
    ...orcamento,
    id,
    data: new Date().toISOString(),
    status: 'pendente',
  };

  orcamentos.push(novoOrcamento);
  localStorage.setItem(ORCAMENTOS_KEY, JSON.stringify(orcamentos));

  return id;
};

export const atualizarOrcamento = (id: string, updates: Partial<Orcamento>) => {
  const orcamentos = getOrcamentos();
  const index = orcamentos.findIndex((o) => o.id === id);

  if (index !== -1) {
    orcamentos[index] = { ...orcamentos[index], ...updates };
    localStorage.setItem(ORCAMENTOS_KEY, JSON.stringify(orcamentos));
  }
};

export const atualizarStatusOrcamento = (
  id: string,
  status: 'pendente' | 'aprovado' | 'recusado',
  valor?: number
) => {
  atualizarOrcamento(id, { status, valor });
};

export const excluirOrcamento = (id: string) => {
  const orcamentos = getOrcamentos();
  const filtrados = orcamentos.filter(o => o.id !== id);
  localStorage.setItem(ORCAMENTOS_KEY, JSON.stringify(filtrados));
};

// ==================== PRESTADORES ====================

export const getPrestadores = (): Prestador[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(PRESTADORES_KEY);
  return data ? JSON.parse(data) : [];
};

export const salvarPrestador = (
  prestador: Omit<Prestador, 'id' | 'dataCadastro' | 'status'>
): string => {
  const prestadores = getPrestadores();
  const id = `PREST-${String(prestadores.length + 1).padStart(3, '0')}`;

  const novoPrestador: Prestador = {
    ...prestador,
    id,
    dataCadastro: new Date().toISOString(),
    status: 'pendente',
  };

  prestadores.push(novoPrestador);
  localStorage.setItem(PRESTADORES_KEY, JSON.stringify(prestadores));

  return id;
};

export const atualizarPrestador = (id: string, updates: Partial<Prestador>) => {
  const prestadores = getPrestadores();
  const index = prestadores.findIndex((p) => p.id === id);

  if (index !== -1) {
    prestadores[index] = { ...prestadores[index], ...updates };
    localStorage.setItem(PRESTADORES_KEY, JSON.stringify(prestadores));
  }
};

// ✅ PATCH CRÍTICO (resolve erro do build)
export const atualizarStatusPrestador = (
  id: string,
  status: 'pendente' | 'aprovado' | 'recusado'
) => {
  atualizarPrestador(id, { status });
};

export const excluirPrestador = (id: string) => {
  const prestadores = getPrestadores();
  const filtrados = prestadores.filter(p => p.id !== id);
  localStorage.setItem(PRESTADORES_KEY, JSON.stringify(filtrados));
};

// ==================== USUÁRIOS ====================

export const getUsuarios = (): Usuario[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(USUARIOS_KEY);
  return data ? JSON.parse(data) : [];
};

export const salvarUsuario = (
  usuario: Omit<Usuario, 'id' | 'dataCadastro' | 'orcamentosRealizados' | 'comprasRealizadas'>
): string => {
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
  localStorage.setItem(USUARIOS_KEY, JSON.stringify(usuarios));

  return id;
};

export const atualizarUsuario = (id: string, updates: Partial<Usuario>) => {
  const usuarios = getUsuarios();
  const index = usuarios.findIndex((u) => u.id === id);

  if (index !== -1) {
    usuarios[index] = { ...usuarios[index], ...updates };
    localStorage.setItem(USUARIOS_KEY, JSON.stringify(usuarios));
  }
};

export const excluirUsuario = (id: string) => {
  const usuarios = getUsuarios();
  const filtrados = usuarios.filter(u => u.id !== id);
  localStorage.setItem(USUARIOS_KEY, JSON.stringify(filtrados));
};

// ==================== DADOS DE EXEMPLO ====================

export const inicializarDadosExemplo = () => {
  if (typeof window === 'undefined') return;

  if (!localStorage.getItem('3dkprint_dados_inicializados')) {

    const orcamentosExemplo: Orcamento[] = [
      {
        id: 'ORC-001',
        tipo: 'impressao',
        cliente: 'João Silva',
        email: 'joao@email.com',
        telefone: '(43) 99999-9999',
        data: new Date(2026, 1, 8).toISOString(),
        status: 'pendente',
        detalhes: { material: 'PLA', cor: 'Preto', quantidade: 2 }
      }
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
        servicos: ['Impressão 3D'],
        experiencia: '5 anos',
        dataCadastro: new Date(2026, 1, 8).toISOString(),
        status: 'pendente'
      }
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
        orcamentosRealizados: 3,
        comprasRealizadas: 5
      }
    ];

    localStorage.setItem(ORCAMENTOS_KEY, JSON.stringify(orcamentosExemplo));
    localStorage.setItem(PRESTADORES_KEY, JSON.stringify(prestadoresExemplo));
    localStorage.setItem(USUARIOS_KEY, JSON.stringify(usuariosExemplo));

    localStorage.setItem('3dkprint_dados_inicializados', 'true');
  }
};