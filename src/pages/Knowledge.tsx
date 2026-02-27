import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Search, ChevronRight, Zap, Settings, Tool, History, Cpu, Layers, Maximize, Ruler, ShieldCheck } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const guides = [
  {
    id: 'intro-fdm',
    category: 'fdm',
    title: 'Fundamentos da Impressão FDM',
    description: 'Tudo o que você precisa saber para começar com filamentos.',
    icon: <Layers className="w-6 h-6" />,
    content: (
      <div className="space-y-6 prose prose-blue max-w-none">
        <h3>O que é FDM?</h3>
        <p>A Modelagem por Deposição Fundida (FDM) é o método mais popular de impressão 3D. Funciona derretendo um filamento termoplástico e extrudando-o camada por camada para construir um objeto.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 not-prose">
          <Card className="bg-muted/50">
            <CardHeader><CardTitle className="text-lg">Vantagens</CardTitle></CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Baixo custo de materiais e máquinas</li>
                <li>Grande variedade de materiais (PLA, ABS, PETG, TPU)</li>
                <li>Ideal para peças funcionais e protótipos</li>
              </ul>
            </CardContent>
          </Card>
          <Card className="bg-muted/50">
            <CardHeader><CardTitle className="text-lg">Desafios</CardTitle></CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Linhas de camada visíveis</li>
                <li>Anisotropia (peças mais fracas no eixo Z)</li>
                <li>Necessidade de suportes em ângulos agudos</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  },
  {
    id: 'movimentacao',
    category: 'mecanica',
    title: 'Sistemas de Movimentação e Guias',
    description: 'Rodinhas, Guias Lineares e a precisão do movimento.',
    icon: <Settings className="w-6 h-6" />,
    content: (
      <div className="space-y-6 prose prose-blue max-w-none">
        <h3>Rodinhas vs Guias Lineares</h3>
        <p>A precisão de uma impressora 3D depende diretamente de quão suave e estável é o seu movimento nos eixos X, Y e Z.</p>
        
        <div className="space-y-4 not-prose">
          <div className="p-4 border-l-4 border-accent bg-accent/5">
            <h4 className="font-bold">1. Rodinhas V-Slot (Delrin)</h4>
            <p className="text-sm">Comuns em impressoras de entrada (como a Ender 3). São baratas e silenciosas, mas sofrem desgaste e exigem ajuste constante do parafuso excêntrico.</p>
          </div>
          <div className="p-4 border-l-4 border-blue-500 bg-blue-500/5">
            <h4 className="font-bold">2. Guias Lineares Redondas (Eixos Retificados)</h4>
            <p className="text-sm">Utilizam rolamentos lineares (LM8UU). Oferecem boa durabilidade e são comuns em eixos Z ou impressoras tipo Prusa.</p>
          </div>
          <div className="p-4 border-l-4 border-green-500 bg-green-500/5">
            <h4 className="font-bold">3. Guias Lineares Quadradas (MGN)</h4>
            <p className="text-sm">O padrão ouro. Oferecem a maior rigidez, precisão e suportam altas velocidades sem vibração (Ghosting/Ringing). Essenciais para máquinas CoreXY de alta performance.</p>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'eletronica',
    category: 'eletronica',
    title: 'O Cérebro da Máquina: Placas e Drivers',
    description: 'Como os motores de passo e as controladoras trabalham juntos.',
    icon: <Cpu className="w-6 h-6" />,
    content: (
      <div className="space-y-6 prose prose-blue max-w-none">
        <h3>Eletrônica e Motores de Passo</h3>
        <p>Uma impressora 3D é controlada por uma placa-mãe (MCU) que traduz o G-Code em pulsos elétricos para os motores.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 not-prose">
          <div className="space-y-2">
            <h4 className="font-bold flex items-center gap-2"><Zap className="w-4 h-4 text-yellow-500" /> Drivers de Passo</h4>
            <p className="text-sm">Componentes como o TMC2209 são famosos por tornarem os motores "silenciosos" e permitirem recursos como o Sensorless Homing (homing sem chaves de fim de curso).</p>
          </div>
          <div className="space-y-2">
            <h4 className="font-bold flex items-center gap-2"><Settings className="w-4 h-4 text-blue-500" /> Firmware</h4>
            <p className="text-sm">Marlin vs Klipper. Enquanto o Marlin roda tudo na placa da impressora, o Klipper usa o poder de um Raspberry Pi para calcular movimentos complexos, permitindo velocidades muito maiores.</p>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'cinematica',
    category: 'mecanica',
    title: 'Cartesiana vs CoreXY',
    description: 'Entenda as diferentes formas de movimentar a cabeça de impressão.',
    icon: <Maximize className="w-6 h-6" />,
    content: (
      <div className="space-y-6 prose prose-blue max-w-none">
        <h3>Arquiteturas de Movimento</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse border border-border">
            <thead>
              <tr className="bg-muted">
                <th className="p-2 border border-border text-left">Tipo</th>
                <th className="p-2 border border-border text-left">Como funciona</th>
                <th className="p-2 border border-border text-left">Vantagem</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-2 border border-border font-bold">Cartesiana</td>
                <td className="p-2 border border-border">A mesa se move no eixo Y ("Bedslinger").</td>
                <td className="p-2 border border-border">Simplicidade e baixo custo.</td>
              </tr>
              <tr>
                <td className="p-2 border border-border font-bold">CoreXY</td>
                <td className="p-2 border border-border">Motores fixos movem X e Y simultaneamente.</td>
                <td className="p-2 border border-border">Alta velocidade e precisão.</td>
              </tr>
              <tr>
                <td className="p-2 border border-border font-bold">Delta</td>
                <td className="p-2 border border-border">Três braços coordenados movem o hotend.</td>
                <td className="p-2 border border-border">Velocidade extrema e visual incrível.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    )
  },
  {
    id: 'evolucao-cor',
    category: 'historia',
    title: 'A Evolução da Impressão Colorida',
    description: 'Do primeiro projeto MMU até os sistemas AMS modernos.',
    icon: <History className="w-6 h-6" />,
    content: (
      <div className="space-y-6 prose prose-blue max-w-none">
        <h3>O Caminho das Cores</h3>
        <p>Imprimir em várias cores sempre foi o "Santo Graal" da FDM. Veja como evoluímos:</p>
        <ul className="list-decimal pl-5 space-y-2">
          <li><strong>Troca Manual:</strong> O usuário pausava a impressão e trocava o filamento. Limitado a cores por camadas.</li>
          <li><strong>Múltiplos Extrusores:</strong> Duas ou mais cabeças de impressão. Problemas de calibração e "vazamento" de bicos parados.</li>
          <li><strong>Sistemas de Troca Automática (MMU/AMS):</strong> Um único bico recebe diferentes filamentos. O sistema corta, retrai e carrega o novo material. O AMS da Bambu Lab popularizou essa tecnologia pela sua confiabilidade.</li>
        </ul>
      </div>
    )
  }
];

export default function Knowledge() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedGuide, setSelectedGuide] = useState<typeof guides[0] | null>(null);

  const filteredGuides = guides.filter(guide => {
    const matchesSearch = guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         guide.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'all' || guide.category === activeTab;
    return matchesSearch && matchesTab;
  });

  return (
    <Layout>
      <section className="bg-primary py-16">
        <div className="container-custom">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-6">Guias Técnicos Completos</h1>
            <p className="text-xl text-primary-foreground/80">
              Aprenda tudo sobre o universo da fabricação digital. Do básico ao avançado, com foco em qualidade e performance.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container-custom">
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Sidebar / List */}
            <div className="lg:w-1/3 space-y-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Pesquisar guias..." 
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-2 lg:grid-cols-1 h-auto gap-1 bg-transparent p-0">
                  <TabsTrigger value="all" className="justify-start data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">Todos os Guias</TabsTrigger>
                  <TabsTrigger value="fdm" className="justify-start data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">Impressão FDM</TabsTrigger>
                  <TabsTrigger value="mecanica" className="justify-start data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">Mecânica e Guias</TabsTrigger>
                  <TabsTrigger value="eletronica" className="justify-start data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">Eletrônica</TabsTrigger>
                  <TabsTrigger value="historia" className="justify-start data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">História e Evolução</TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="space-y-3">
                {filteredGuides.map((guide) => (
                  <button
                    key={guide.id}
                    onClick={() => setSelectedGuide(guide)}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      selectedGuide?.id === guide.id 
                      ? 'border-accent bg-accent/5 ring-1 ring-accent' 
                      : 'border-border hover:border-accent/50 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 rounded-lg ${selectedGuide?.id === guide.id ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground'}`}>
                        {guide.icon}
                      </div>
                      <h3 className="font-bold text-sm">{guide.title}</h3>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{guide.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Content Area */}
            <div className="lg:w-2/3">
              <AnimatePresence mode="wait">
                {selectedGuide ? (
                  <motion.div
                    key={selectedGuide.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-white rounded-2xl border border-border p-8 shadow-sm sticky top-24"
                  >
                    <div className="flex items-center gap-4 mb-8 pb-6 border-b">
                      <div className="p-3 bg-accent/10 rounded-xl text-accent">
                        {selectedGuide.icon}
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold">{selectedGuide.title}</h2>
                        <p className="text-muted-foreground">{selectedGuide.description}</p>
                      </div>
                    </div>
                    
                    {selectedGuide.content}

                    <div className="mt-12 p-6 bg-muted/30 rounded-xl border border-dashed flex items-center justify-between">
                      <div>
                        <h4 className="font-bold mb-1">Dúvidas sobre este guia?</h4>
                        <p className="text-sm text-muted-foreground">Fale com nossa equipe técnica para consultoria especializada.</p>
                      </div>
                      <Button asChild variant="accent">
                        <a href="https://wa.me/5543991741518" target="_blank" rel="noopener noreferrer">Tirar Dúvida</a>
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 bg-muted/20 rounded-2xl border-2 border-dashed border-border sticky top-24">
                    <BookOpen className="w-16 h-16 text-muted-foreground mb-4 opacity-20" />
                    <h3 className="text-xl font-bold mb-2">Selecione um guia para começar</h3>
                    <p className="text-muted-foreground max-w-sm">
                      Escolha um dos tópicos ao lado para explorar nossa documentação técnica completa.
                    </p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
