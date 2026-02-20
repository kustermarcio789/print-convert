import { useEffect, useState, useCallback } from 'react';
import {
  subscribeOrcamentos,
  subscribePrestadores,
  subscribeProdutos,
  subscribeMateriais,
  getOrcamentos,
  getPrestadores,
  getProdutos,
  getInventarioMateriais,
} from '@/lib/supabaseClient';

/**
 * Hook para sincronizar dados em tempo real com o Supabase
 * Atualiza automaticamente quando há mudanças no banco de dados
 */

export function useRealtimeOrcamentos() {
  const [orcamentos, setOrcamentos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const carregarOrcamentos = useCallback(async () => {
    try {
      setIsLoading(true);
      const dados = await getOrcamentos();
      setOrcamentos(dados);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro desconhecido'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarOrcamentos();

    const subscription = subscribeOrcamentos(() => {
      carregarOrcamentos();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [carregarOrcamentos]);

  return { orcamentos, isLoading, error, refetch: carregarOrcamentos };
}

export function useRealtimePrestadores() {
  const [prestadores, setPrestadores] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const carregarPrestadores = useCallback(async () => {
    try {
      setIsLoading(true);
      const dados = await getPrestadores();
      setPrestadores(dados);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro desconhecido'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarPrestadores();

    const subscription = subscribePrestadores(() => {
      carregarPrestadores();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [carregarPrestadores]);

  return { prestadores, isLoading, error, refetch: carregarPrestadores };
}

export function useRealtimeProdutos() {
  const [produtos, setProdutos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const carregarProdutos = useCallback(async () => {
    try {
      setIsLoading(true);
      const dados = await getProdutos();
      setProdutos(dados);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro desconhecido'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarProdutos();

    const subscription = subscribeProdutos(() => {
      carregarProdutos();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [carregarProdutos]);

  return { produtos, isLoading, error, refetch: carregarProdutos };
}

export function useRealtimeMateriais() {
  const [materiais, setMateriais] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const carregarMateriais = useCallback(async () => {
    try {
      setIsLoading(true);
      const dados = await getInventarioMateriais();
      setMateriais(dados);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro desconhecido'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarMateriais();

    const subscription = subscribeMateriais(() => {
      carregarMateriais();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [carregarMateriais]);

  return { materiais, isLoading, error, refetch: carregarMateriais };
}
