# 📐 Padrões de Código e Qualidade - 3DKPRINT v2.0

## Princípios de Desenvolvimento

A plataforma 3DKPRINT segue os seguintes princípios para garantir qualidade, manutenibilidade e performance:

### 1. Reatividade Imediata (Optimistic Updates)

Todas as operações de exclusão e atualização removem o item da UI imediatamente, enquanto a operação no banco de dados ocorre em background.

```typescript
// ✅ BOM: Reatividade imediata
const handleDelete = async (id: string) => {
  // Remover da UI imediatamente
  setItems(prev => prev.filter(item => item.id !== id));
  
  try {
    // Executar no banco em background
    const result = await deleteItem(id);
    if (!result.success) {
      // Se falhar, recarregar dados
      refetch();
      toast({ title: 'Erro', variant: 'destructive' });
    }
  } catch (error) {
    refetch();
  }
};
```

### 2. Sincronização em Tempo Real

Usar subscriptions do Supabase para manter dados sincronizados entre abas e dispositivos.

```typescript
// ✅ BOM: Sincronização em tempo real
useEffect(() => {
  const subscription = subscribeOrcamentos(() => {
    carregarOrcamentos();
  });
  
  return () => subscription.unsubscribe();
}, []);
```

### 3. Tratamento de Erros Robusto

Sempre usar try-catch e retornar objetos com `{ success, error }`.

```typescript
// ✅ BOM: Tratamento robusto
export async function deleteOrcamento(id: string) {
  try {
    const { error } = await supabase
      .from('orcamentos')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return { success: true, deletedId: id };
  } catch (error) {
    console.error('Erro ao deletar:', error);
    return { success: false, error };
  }
}
```

### 4. Feedback Visual em Todas as Ações

Sempre fornecer feedback visual para ações do usuário.

```typescript
// ✅ BOM: Feedback visual
const handleDelete = async (id: string) => {
  setDeletingIds(prev => new Set(prev).add(id));
  
  try {
    const result = await deleteOrcamento(id);
    if (result.success) {
      toast({
        title: 'Orçamento excluído',
        description: 'O orçamento foi removido com sucesso.',
      });
    } else {
      throw new Error('Falha ao excluir');
    }
  } catch (error) {
    toast({
      title: 'Erro ao excluir',
      description: 'Não foi possível remover o orçamento.',
      variant: 'destructive',
    });
  } finally {
    setDeletingIds(prev => {
      const novo = new Set(prev);
      novo.delete(id);
      return novo;
    });
  }
};
```

### 5. Animações Suaves com Framer Motion

Usar Framer Motion para transições elegantes, especialmente em exclusões.

```typescript
// ✅ BOM: Animações suaves
<AnimatePresence mode="popLayout">
  {items.map((item) => (
    <motion.div
      key={item.id}
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
    >
      {/* Conteúdo */}
    </motion.div>
  ))}
</AnimatePresence>
```

### 6. Hooks Customizados para Lógica Reutilizável

Extrair lógica complexa em hooks customizados.

```typescript
// ✅ BOM: Hook customizado
export function useRealtimeOrcamentos() {
  const [orcamentos, setOrcamentos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    carregarOrcamentos();
    
    const subscription = subscribeOrcamentos(() => {
      carregarOrcamentos();
    });
    
    return () => subscription.unsubscribe();
  }, []);
  
  return { orcamentos, isLoading, refetch: carregarOrcamentos };
}
```

### 7. Tipagem TypeScript Completa

Sempre usar tipos e interfaces para segurança de tipo.

```typescript
// ✅ BOM: Tipagem completa
interface Orcamento {
  id: string;
  tipo: string;
  cliente_nome: string;
  status: 'pendente' | 'aprovado' | 'recusado' | 'concluido';
  valor?: number;
  data_criacao: string;
}

export async function deleteOrcamento(id: string): Promise<{ success: boolean; deletedId?: string; error?: any }> {
  // Implementação
}
```

### 8. Performance: Evitar Re-renders Desnecessários

Usar React.memo, useMemo e useCallback quando apropriado.

```typescript
// ✅ BOM: Otimização de re-renders
const OrcamentoCard = React.memo(({ orcamento, onDelete }: Props) => {
  return (
    <Card>
      {/* Conteúdo */}
    </Card>
  );
});

const handleDelete = useCallback((id: string) => {
  // Implementação
}, []);
```

### 9. Limpeza de Subscriptions e Timers

Sempre fazer cleanup em useEffect.

```typescript
// ✅ BOM: Cleanup
useEffect(() => {
  const subscription = subscribeOrcamentos(callback);
  
  return () => {
    subscription.unsubscribe();
  };
}, []);
```

### 10. Validação de Entrada

Validar todos os inputs antes de enviar ao banco.

```typescript
// ✅ BOM: Validação
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!formData.email || !formData.password) {
    toast({
      title: 'Campos obrigatórios',
      description: 'Por favor, preencha todos os campos.',
      variant: 'destructive',
    });
    return;
  }
  
  // Proceder com submissão
};
```

---

## Estrutura de Componentes

### Componentes Funcionais com Hooks

Todos os componentes devem ser funcionais e usar hooks.

```typescript
// ✅ BOM: Componente funcional com hooks
export function AdminOrcamentos() {
  const { toast } = useToast();
  const { orcamentos, isLoading, refetch } = useRealtimeOrcamentos();
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  
  const handleDelete = async (id: string) => {
    // Implementação
  };
  
  return (
    <div className="space-y-6">
      {/* Conteúdo */}
    </div>
  );
}
```

### Separação de Responsabilidades

Manter componentes focados em uma única responsabilidade.

- **Componentes de Apresentação**: Apenas renderizam UI
- **Componentes de Lógica**: Gerenciam estado e efeitos
- **Hooks Customizados**: Encapsulam lógica reutilizável
- **Clientes de API**: Comunicam com o backend

---

## Padrões de Nomeação

### Arquivos e Pastas

```
src/
├── components/          # Componentes React
│   ├── layout/         # Componentes de layout
│   ├── ui/             # Componentes UI reutilizáveis
│   └── Admin*.tsx      # Componentes de admin
├── pages/              # Páginas/rotas
├── lib/                # Lógica e utilitários
│   ├── supabaseClient.ts
│   ├── produtosClient.ts
│   └── emailService.ts
├── hooks/              # Hooks customizados
│   └── useRealtimeData.ts
└── data/               # Dados estáticos
```

### Nomeação de Variáveis

```typescript
// ✅ BOM: Nomes descritivos
const [isLoading, setIsLoading] = useState(false);
const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);

// ❌ RUIM: Nomes genéricos
const [loading, setLoading] = useState(false);
const [ids, setIds] = useState<Set<string>>(new Set());
const [data, setData] = useState<any[]>([]);
```

### Nomeação de Funções

```typescript
// ✅ BOM: Verbos descritivos
export async function deleteOrcamento(id: string) { }
export async function getOrcamentosMetricas() { }
export function subscribeOrcamentos(callback: Function) { }

// ❌ RUIM: Nomes genéricos
export async function delete(id: string) { }
export async function getMetrics() { }
export function subscribe(cb: Function) { }
```

---

## Tratamento de Erros

### Sempre Logar Erros

```typescript
// ✅ BOM: Log detalhado
try {
  const result = await deleteOrcamento(id);
  if (!result.success) throw new Error('Falha ao deletar');
} catch (error) {
  console.error('Erro ao deletar orçamento:', error);
  toast({
    title: 'Erro ao excluir',
    description: 'Não foi possível remover o orçamento.',
    variant: 'destructive',
  });
}
```

### Nunca Silenciar Erros

```typescript
// ❌ RUIM: Silenciar erros
try {
  await deleteOrcamento(id);
} catch (error) {
  // Silencioso
}

// ✅ BOM: Sempre tratar
try {
  const result = await deleteOrcamento(id);
  if (!result.success) {
    throw result.error;
  }
} catch (error) {
  console.error('Erro:', error);
  toast({ title: 'Erro', variant: 'destructive' });
}
```

---

## Performance

### Lazy Loading de Componentes

```typescript
// ✅ BOM: Lazy loading
const AdminDashboard = lazy(() => import('./AdminDashboard'));

<Suspense fallback={<Loader />}>
  <AdminDashboard />
</Suspense>
```

### Debounce em Handlers

```typescript
// ✅ BOM: Debounce
const handleSearch = useCallback(
  debounce((query: string) => {
    searchOrcamentos(query);
  }, 300),
  []
);
```

### Memoização de Dados Custosos

```typescript
// ✅ BOM: Memoização
const orcamentosProcessados = useMemo(() => {
  return orcamentos
    .filter(o => o.status === 'pendente')
    .sort((a, b) => new Date(b.data_criacao).getTime() - new Date(a.data_criacao).getTime());
}, [orcamentos]);
```

---

## Testes

### Testes Unitários

```typescript
// ✅ BOM: Teste unitário
describe('deleteOrcamento', () => {
  it('deve retornar success: true quando deletar com sucesso', async () => {
    const result = await deleteOrcamento('123');
    expect(result.success).toBe(true);
    expect(result.deletedId).toBe('123');
  });
});
```

### Testes de Integração

```typescript
// ✅ BOM: Teste de integração
describe('AdminOrcamentos', () => {
  it('deve remover orçamento da lista quando deletar', async () => {
    const { getByText, queryByText } = render(<AdminOrcamentos />);
    
    fireEvent.click(getByText('Excluir'));
    
    await waitFor(() => {
      expect(queryByText('Orçamento 123')).not.toBeInTheDocument();
    });
  });
});
```

---

## Checklist de Qualidade

Antes de fazer commit, verificar:

- [ ] Sem erros de TypeScript (`npm run type-check`)
- [ ] Sem warnings do ESLint (`npm run lint`)
- [ ] Código formatado (`npm run format`)
- [ ] Testes passando (`npm run test`)
- [ ] Sem console.log em produção
- [ ] Sem any types (usar unknown se necessário)
- [ ] Tratamento de erro em todas as funções async
- [ ] Feedback visual para todas as ações
- [ ] Cleanup em useEffect
- [ ] Nomes descritivos para variáveis e funções

---

## Conclusão

Seguindo estes padrões, a plataforma 3DKPRINT mantém alta qualidade, performance e manutenibilidade. Todos os desenvolvedores devem seguir estas diretrizes para garantir consistência no código.

**Status**: ✅ Padrões Implementados e Validados
