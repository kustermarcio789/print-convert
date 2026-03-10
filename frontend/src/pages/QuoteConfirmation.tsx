import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Download, Home, MessageSquare } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';

export default function QuoteConfirmation() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/5 flex items-center justify-center py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-8"
          >
            {/* Ícone de Sucesso */}
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex justify-center"
            >
              <div className="relative w-24 h-24">
                <div className="absolute inset-0 bg-green-500/20 rounded-full animate-pulse" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <CheckCircle className="w-24 h-24 text-green-500" />
                </div>
              </div>
            </motion.div>

            {/* Título */}
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-4xl font-bold text-foreground">
                Orçamento Enviado com Sucesso!
              </h1>
              <p className="text-xl text-muted-foreground">
                Seu orçamento foi recebido e está sendo processado
              </p>
            </div>

            {/* Número do Orçamento */}
            <div className="bg-card border border-border rounded-lg p-6 space-y-2">
              <p className="text-sm text-muted-foreground">Número do Orçamento</p>
              <p className="text-3xl font-bold text-primary font-mono">{id}</p>
              <p className="text-xs text-muted-foreground">
                Guarde este número para referência
              </p>
            </div>

            {/* Informações */}
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-6 space-y-3 text-left">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                O que acontece agora?
              </h3>
              <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                <li className="flex gap-3">
                  <span className="font-bold">1.</span>
                  <span>Nosso time analisará seu orçamento em detalhes</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold">2.</span>
                  <span>Você receberá um e-mail com a proposta personalizada</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold">3.</span>
                  <span>Entraremos em contato por WhatsApp/Telefone para esclarecer dúvidas</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold">4.</span>
                  <span>Após aprovação, iniciaremos a produção</span>
                </li>
              </ul>
            </div>

            {/* Tempo de Resposta */}
            <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                <span className="font-semibold">Tempo de resposta:</span> Geralmente respondemos em até 24 horas úteis
              </p>
            </div>

            {/* Botões de Ação */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <Button
                variant="outline"
                onClick={() => navigate('/')}
                className="gap-2"
              >
                <Home className="w-4 h-4" />
                Voltar ao Início
              </Button>
              <Button
                onClick={() => {
                  // Abrir WhatsApp
                  window.open('https://wa.me/5511999999999?text=Olá! Gostaria de acompanhar meu orçamento.', '_blank');
                }}
                className="gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                Falar no WhatsApp
              </Button>
            </div>

            {/* Informações de Contato */}
            <div className="space-y-2 text-sm text-muted-foreground pt-6 border-t border-border">
              <p>
                <span className="font-semibold text-foreground">E-mail:</span> contato@3dkprint.com.br
              </p>
              <p>
                <span className="font-semibold text-foreground">WhatsApp:</span> (11) 9999-9999
              </p>
              <p>
                <span className="font-semibold text-foreground">Telefone:</span> (11) 3333-3333
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
