import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight, UserPlus, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';

export default function QuoteSuccess() {
  return (
    <Layout>
      <section className="min-h-[70vh] flex items-center justify-center py-20 bg-background">
        <div className="container-custom">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto text-center"
          >
            <div className="mb-8 flex justify-center">
              <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-16 h-16 text-green-500" />
              </div>
            </div>

            <h1 className="text-4xl font-bold text-foreground mb-4">
              Solicitação enviada com sucesso!
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8">
              Recebemos seu pedido de orçamento. Nossa equipe técnica analisará os detalhes e entrará em contato pelo e-mail informado em breve.
            </p>

            <div className="bg-accent/5 border border-accent/20 rounded-2xl p-8 mb-10 text-left">
              <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-accent" /> Dica: Crie sua conta
              </h3>
              <p className="text-muted-foreground mb-6">
                Para acompanhar o status do seu orçamento, gerenciar seus pedidos e ter acesso a descontos exclusivos, recomendamos criar uma conta em nossa plataforma.
              </p>
              <Button asChild className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                <Link to="/cadastro">
                  Criar minha conta agora <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild variant="outline" size="lg">
                <Link to="/">
                  <Home className="mr-2 h-5 w-5" /> Voltar para Home
                </Link>
              </Button>
              <Button asChild variant="ghost" size="lg">
                <Link to="/produtos">
                  Ver produtos da loja
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
