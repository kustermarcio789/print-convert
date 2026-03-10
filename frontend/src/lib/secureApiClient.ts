/**
 * Cliente API Seguro para Operações CRUD
 * 
 * Todas as operações de escrita (create, update, delete) são processadas
 * através de Edge Functions do Supabase, que validam permissões e autenticação
 * no servidor, em vez de confiar no frontend.
 */

import { getAdminToken } from './adminAuthService';

interface CrudOptions {
  operation: 'create' | 'update' | 'delete';
  table: string;
  data?: Record<string, any>;
  id?: string | number;
}

interface CrudResponse {
  success: boolean;
  data?: any;
  error?: string;
}

/**
 * Executa uma operação CRUD segura através da Edge Function
 */
export async function executeCrudOperation(options: CrudOptions): Promise<CrudResponse> {
  try {
    const token = getAdminToken();
    if (!token) {
      return {
        success: false,
        error: 'Usuário não autenticado'
      };
    }

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/secure-crud`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(options),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.message || 'Erro ao executar operação'
      };
    }

    const data = await response.json();
    return {
      success: true,
      data: data.data
    };
  } catch (error) {
    console.error('Erro na operação CRUD:', error);
    return {
      success: false,
      error: 'Erro ao conectar com o servidor'
    };
  }
}

/**
 * Cria um novo registro de forma segura
 */
export async function secureCreate(table: string, data: Record<string, any>) {
  return executeCrudOperation({
    operation: 'create',
    table,
    data
  });
}

/**
 * Atualiza um registro de forma segura
 */
export async function secureUpdate(
  table: string,
  id: string | number,
  data: Record<string, any>
) {
  return executeCrudOperation({
    operation: 'update',
    table,
    id,
    data
  });
}

/**
 * Deleta um registro de forma segura
 */
export async function secureDelete(table: string, id: string | number) {
  return executeCrudOperation({
    operation: 'delete',
    table,
    id
  });
}

/**
 * Exemplo de uso:
 * 
 * // Criar
 * const result = await secureCreate('usuarios', {
 *   nome: 'João Silva',
 *   email: 'joao@example.com'
 * });
 * 
 * // Atualizar
 * const result = await secureUpdate('usuarios', 1, {
 *   nome: 'João Silva Atualizado'
 * });
 * 
 * // Deletar
 * const result = await secureDelete('usuarios', 1);
 */
