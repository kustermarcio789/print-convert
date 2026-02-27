// Sistema de armazenamento de dados para o painel administrativo
import { orcamentosAPI, prestadoresAPI, usuariosAPI } from './apiClient';

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
export const salvarOrcamento = async (orcamento: Omit<Orcamento, 'id' | 'data' | 'status'>): Promise<string> => {
  try {
    const novoOrcamento = {
      ...orcamento,
      data: new Date().toISOString(),
      status: 'pendente',
    };
    const result = await orcamentosAPI.create(novoOrcamento);
    return result.id;
  } catch (error) {
    console.error('Erro ao salvar orçamento no Supabase:', error);
    // Fallback para localStorage em caso de erro crítico (opcional)
    const orcamentos = getOrcamentos();
    const id = `ORC-${String(orcamentos.length + 1).padStart(3, '0')}`;
    const fallbackOrcamento = { ...orcamento, id, data: new Date().toISOString(), status: 'pendente' };
    orcamentos.push(fallbackOrcamento as any);
    localStorage.setItem('3dkprint_orcamentos', JSON.stringify(orcamentos));
    return id;
  }
};

export const getOrcamentos = (): Orcamento[] => {
  const data = localStorage.getItem('3dkprint_orcamentos');
  return data ? JSON.parse(data) : [];
};

export const atualizarStatusOrcamento = async (id: string, status: 'pendente' | 'aprovado' | 'recusado', valor?: number) => {
  try {
    await orcamentosAPI.update(id, { status, valor });
  } catch (error) {
    console.error('Erro ao atualizar status no Supabase:', error);
    const orcamentos = getOrcamentos();
    const index = orcamentos.findIndex((o) => o.id === id);
    if (index !== -1) {
      orcamentos[index].status = status;
      if (valor !== undefined) orcamentos[index].valor = valor;
      localStorage.setItem('3dkprint_orcamentos', JSON.stringify(orcamentos));
    }
  }
};

// Funções para gerenciar prestadores
export const salvarPrestador = async (prestador: Omit<Prestador, 'id' | 'dataCadastro' | 'status'>): Promise<string> => {
  try {
    const novoPrestador = {
      ...prestador,
      dataCadastro: new Date().toISOString(),
      status: 'pendente',
    };
    const result = await prestadoresAPI.create(novoPrestador);
    return result.id;
  } catch (error) {
    console.error('Erro ao salvar prestador no Supabase:', error);
    const prestadores = getPrestadores();
    const id = `PREST-${String(prestadores.length + 1).padStart(3, '0')}`;
    const fallbackPrestador = { ...prestador, id, dataCadastro: new Date().toISOString(), status: 'pendente' };
    prestadores.push(fallbackPrestador as any);
    localStorage.setItem('3dkprint_prestadores', JSON.stringify(prestadores));
    return id;
  }
};

export const getPrestadores = (): Prestador[] => {
  const data = localStorage.getItem('3dkprint_prestadores');
  return data ? JSON.parse(data) : [];
};

// Funções para gerenciar usuários
export const salvarUsuario = async (usuario: Omit<Usuario, 'id' | 'dataCadastro' | 'orcamentosRealizados' | 'comprasRealizadas'>): Promise<string> => {
  try {
    const novoUsuario = {
      ...usuario,
      dataCadastro: new Date().toISOString(),
      orcamentosRealizados: 0,
      comprasRealizadas: 0,
    };
    const result = await usuariosAPI.create(novoUsuario);
    return result.id;
  } catch (error) {
    console.error('Erro ao salvar usuário no Supabase:', error);
    const usuarios = getUsuarios();
    const id = `USR-${String(usuarios.length + 1).padStart(3, '0')}`;
    const fallbackUsuario = { ...usuario, id, dataCadastro: new Date().toISOString(), orcamentosRealizados: 0, comprasRealizadas: 0 };
    usuarios.push(fallbackUsuario as any);
    localStorage.setItem('3dkprint_usuarios', JSON.stringify(usuarios));
    return id;
  }
};

export const getUsuarios = (): Usuario[] => {
  const data = localStorage.getItem('3dkprint_usuarios');
  return data ? JSON.parse(data) : [];
};

export const incrementarOrcamentosUsuario = async (email: string) => {
  try {
    const usuarios = await usuariosAPI.getAll();
    const usuario = usuarios.find(u => u.email === email);
    if (usuario) {
      await usuariosAPI.update(usuario.id, { orcamentosRealizados: (usuario.orcamentosRealizados || 0) + 1 });
    }
  } catch (error) {
    console.error('Erro ao incrementar orçamentos no Supabase:', error);
  }
};

export const inicializarDadosExemplo = () => {
  if (!localStorage.getItem('3dkprint_dados_inicializados')) {
    localStorage.setItem('3dkprint_dados_inicializados', 'true');
  }
};
