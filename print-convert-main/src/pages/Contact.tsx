import { Layout } from '@/components/layout/Layout';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Clock, Send, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { toast } from 'sonner';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    // Aqui você pode adicionar a lógica de envio do formulário
    toast.success('Mensagem enviada com sucesso! Entraremos em contato em breve.');
    
    // Limpar formulário
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-background via-secondary/20 to-background overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Entre em <span className="text-accent">Contato</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Estamos prontos para atender suas necessidades em impressão 3D
            </p>
          </motion.div>
        </div>
      </section>

      {/* Informações de Contato */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-16">
            {[
              {
                icon: Phone,
                title: 'Telefone',
                info: '(43) 9-9174-1518',
                link: 'tel:+5543991741518',
              },
              {
                icon: Mail,
                title: 'Email',
                info: '3dk.print.br@gmail.com',
                link: 'mailto:3dk.print.br@gmail.com',
              },
              {
                icon: MapPin,
                title: 'Localização',
                info: 'Ourinhos, SP',
                link: null,
              },
              {
                icon: Clock,
                title: 'Horário',
                info: 'Seg-Sex: 08:00-18:00',
                link: null,
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="card-elevated p-6 text-center hover:shadow-xl transition-shadow"
              >
                <div className="w-14 h-14 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-7 h-7 text-accent" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{item.title}</h3>
                {item.link ? (
                  <a
                    href={item.link}
                    className="text-muted-foreground hover:text-accent transition-colors"
                  >
                    {item.info}
                  </a>
                ) : (
                  <p className="text-muted-foreground">{item.info}</p>
                )}
              </motion.div>
            ))}
          </div>

          {/* Formulário de Contato */}
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Formulário */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="card-elevated p-8"
              >
                <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                  <MessageSquare className="w-6 h-6 text-accent" />
                  Envie sua Mensagem
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                      Nome Completo *
                    </label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Seu nome"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                      Email *
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="seu@email.com"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2">
                      Telefone
                    </label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="(00) 00000-0000"
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-foreground mb-2">
                      Assunto
                    </label>
                    <Input
                      id="subject"
                      name="subject"
                      type="text"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="Sobre o que você quer falar?"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                      Mensagem *
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Descreva sua necessidade ou dúvida..."
                      rows={5}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                    <Send className="w-4 h-4 mr-2" />
                    Enviar Mensagem
                  </Button>
                </form>
              </motion.div>

              {/* Informações Adicionais */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="space-y-6"
              >
                <div className="card-elevated p-8">
                  <h3 className="text-xl font-bold text-foreground mb-4">Atendimento Rápido</h3>
                  <p className="text-muted-foreground mb-6">
                    Respondemos todas as mensagens em até 24 horas úteis. Para atendimento imediato, entre em contato via WhatsApp.
                  </p>
                  <a
                    href="https://wa.me/5543991741518"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-full px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Falar no WhatsApp
                  </a>
                </div>

                <div className="card-elevated p-8">
                  <h3 className="text-xl font-bold text-foreground mb-4">Orçamento Rápido</h3>
                  <p className="text-muted-foreground mb-6">
                    Precisa de um orçamento? Use nosso formulário online e receba uma resposta em minutos.
                  </p>
                  <a
                    href="/orcamento"
                    className="inline-flex items-center justify-center w-full px-6 py-3 bg-accent text-accent-foreground font-semibold rounded-lg hover:bg-accent/90 transition-colors"
                  >
                    Fazer Orçamento
                  </a>
                </div>

                <div className="card-elevated p-8 bg-secondary/30">
                  <h3 className="text-xl font-bold text-foreground mb-4">Dúvidas Frequentes</h3>
                  <p className="text-muted-foreground mb-4">
                    Antes de entrar em contato, confira nossa central de ajuda. Talvez sua dúvida já esteja respondida lá!
                  </p>
                  <a
                    href="/ajuda"
                    className="text-accent hover:text-accent/80 font-semibold transition-colors"
                  >
                    Acessar Central de Ajuda →
                  </a>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Mapa (Opcional) */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-6xl mx-auto"
          >
            <h2 className="text-3xl font-bold text-foreground mb-8 text-center">Nossa Localização</h2>
            <div className="card-elevated overflow-hidden">
              <div className="aspect-video bg-secondary/50 flex items-center justify-center">
                <div className="text-center p-8">
                  <MapPin className="w-16 h-16 text-accent mx-auto mb-4" />
                  <p className="text-lg font-semibold text-foreground mb-2">Ourinhos, São Paulo</p>
                  <p className="text-muted-foreground">
                    Atendemos todo o Brasil com entrega rápida e rastreamento
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
