import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Send, AlertCircle, CheckCircle } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import QuoteItemForm from '@/components/QuoteItemForm';
import {
  Quote,
  adicionarItem,
  removerItem,
  atualizarItem,
  calcularValorTotal,
  validarOrcamento,
  finalizarOrcamento,
  criarNovoOrcamento,
  carregarOrcamentoRascunho,
  salvarOrcamentoRascunho,
} from '@/lib/quoteDataStore';

export default function QuoteMultiple() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orcamento, setOrcamento] = useState<Quote | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Carregar orçamento ao montar componente
  useEffect(() => {
    // Tentar carregar de sessionStorage (vindo de ProductDetails)
    const orcamentoSession = sessionStorage.getItem('orcamento_atual');
    if (orcamentoSession) {
      setOrcamento(JSON.parse(orcamentoSession));
      sessionStorage.removeItem('orcamento_atual');
    } else {
      // Tentar carregar rascunho anterior
      const ultimoRascunho = localStorage.getItem('ultimo_orcamento_id');
      if (ultimoRascunho) {
        const rascunho = carregarOrcamentoRascunho(ultimoRascunho);
        if (rascunho) {
          setOrcamento(rascunho);
        } else {
          setOrcamento(criarNovoOrcamento());
        }
      } else {
        setOrcamento(criarNovoOrcamento());
      }
    }
  }, []);

  // Salvar rascunho automaticamente
  useEffect(() => {
    if (orcamento) {
      salvarOrcamentoRascunho(orcamento);
      localStorage.setItem('ultimo_orcamento_id', orcamento.id);
    }
  }, [orcamento]);

  if (!orcamento) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground">Carregando orçamento...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const handleAddItem = () => {
    const novoOrcamento = adicionarItem(orcamento);
    setOrcamento(novoOrcamento);
    toast({
      title: 'Item adicionado',
      description: 'Novo item adicionado ao orçamento',
    });
  };

  const handleRemoveItem = (itemId: string) => {
    if (orcamento.itens.length === 1) {
      toast({
        title: 'Erro',
        description: 'Você precisa ter pelo menos um item no orçamento',
        variant: 'destructive',
      });
      return;
    }
    const novoOrcamento = removerItem(orcamento, itemId);
    setOrcamento(novoOrcamento);
  };

  const handleUpdateItem = (itemId: string, atualizacoes: any) => {
    const novoOrcamento = atualizarItem(orcamento, itemId, atualizacoes);
    setOrcamento(novoOrcamento);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors([]);

    // Validar orçamento
    const { valido, erros } = validarOrcamento(orcamento);
    if (!valido) {
      setValidationErrors(erros);
      toast({
        title: 'Orçamento inválido',
        description: 'Verifique os erros abaixo',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Finalizar orçamento
      const orcamentoFinalizado = finalizarOrcamento(orcamento);

      // Aqui você enviaria para o backend/admin
      console.log('Orçamento finalizado:', orcamentoFinalizado);

      toast({
        title: 'Sucesso!',
        description: 'Seu orçamento foi enviado com sucesso',
      });

      // Redirecionar para página de confirmação
      setTimeout(() => {
        navigate(`/orcamento/confirmacao/${orcamentoFinalizado.id}`);
      }, 1000);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao enviar orçamento',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const valorTotal = calcularValorTotal(orcamento.itens);

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/5 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <h1 className="text-2xl sm:text-4xl font-bold text-foreground mb-2">
              Solicitar Orçamento
            </h1>
            <p className="text-lg text-muted-foreground">
              Adicione múltiplos produtos e serviços para receber uma proposta personalizada
            </p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Erros de Validação */}
            <AnimatePresence>
              {validationErrors.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 space-y-2"
                >
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-destructive mb-2">Erros encontrados:</p>
                      <ul className="space-y-1">
                        {validationErrors.map((erro, index) => (
                          <li key={index} className="text-sm text-destructive">
                            • {erro}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Dados Pessoais */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border rounded-lg p-6 space-y-6"
            >
              <h2 className="text-2xl font-bold text-foreground">Seus Dados</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome Completo *</Label>
                  <Input
                    id="nome"
                    placeholder="Seu nome"
                    value={orcamento.clienteNome}
                    onChange={(e) =>
                      setOrcamento({ ...orcamento, clienteNome: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-mail *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={orcamento.clienteEmail}
                    onChange={(e) =>
                      setOrcamento({ ...orcamento, clienteEmail: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone/WhatsApp *</Label>
                  <Input
                    id="telefone"
                    placeholder="(11) 99999-9999"
                    value={orcamento.clienteTelefone}
                    onChange={(e) =>
                      setOrcamento({ ...orcamento, clienteTelefone: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF ou CNPJ</Label>
                  <Input
                    id="cpf"
                    placeholder="000.000.000-00"
                    value={orcamento.clienteCPF || ''}
                    onChange={(e) =>
                      setOrcamento({ ...orcamento, clienteCPF: e.target.value })
                    }
                  />
                </div>
              </div>
            </motion.div>

            {/* Itens do Orçamento */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-foreground">
                  Itens do Orçamento ({orcamento.itens.length})
                </h2>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddItem}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar Item
                </Button>
              </div>

              <AnimatePresence mode="popLayout">
                {orcamento.itens.map((item, index) => (
                  <QuoteItemForm
                    key={item.id}
                    item={item}
                    onUpdate={(atualizado) =>
                      handleUpdateItem(item.id, atualizado)
                    }
                    onRemove={() => handleRemoveItem(item.id)}
                    showRemove={orcamento.itens.length > 1}
                  />
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Observações Gerais */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border rounded-lg p-6 space-y-4"
            >
              <h2 className="text-lg font-bold text-foreground">
                Observações Adicionais
              </h2>
              <Textarea
                placeholder="Descreva qualquer informação adicional que possa ser útil para o orçamento..."
                value={orcamento.observacoesGerais || ''}
                onChange={(e) =>
                  setOrcamento({ ...orcamento, observacoesGerais: e.target.value })
                }
                className="min-h-24"
              />
            </motion.div>

            {/* Resumo */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 rounded-lg p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-foreground">
                  Total Estimado:
                </span>
                <span className="text-3xl font-bold text-primary">
                  R$ {valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                * Valores são estimativas. O valor final será confirmado após análise detalhada.
              </p>
            </motion.div>

            {/* Botão Submit */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-4"
            >
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                size="lg"
                className="flex-1 gap-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin h-5 w-5 border-2 border-current border-t-transparent rounded-full" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Enviar Orçamento
                  </>
                )}
              </Button>
            </motion.div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
