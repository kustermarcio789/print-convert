import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, Check, ArrowRight, Info, AlertCircle, Thermometer, Shield, Layers, Droplets } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { salvarOrcamento, incrementarOrcamentosUsuario } from '@/lib/dataStore';

type PrintCategory = 'fdm' | 'resina';

interface MaterialInfo {
  id: string;
  name: string;
  description: string;
  priceMultiplier: number;
  colors: { id: string; name: string; hex: string }[];
  tempMax: string;
  impactResistance: string;
  applications: string[];
  details: string;
}

const fdmMaterials: MaterialInfo[] = [
  {
    id: 'pla', name: 'PLA', description: 'Biodegradável, fácil de imprimir',
    priceMultiplier: 1,
    colors: [
      { id: 'branco', name: 'Branco', hex: '#FFFFFF' },
      { id: 'preto', name: 'Preto', hex: '#1a1a1a' },
      { id: 'vermelho', name: 'Vermelho', hex: '#DC2626' },
      { id: 'azul', name: 'Azul', hex: '#2563EB' },
      { id: 'verde', name: 'Verde', hex: '#16A34A' },
      { id: 'amarelo', name: 'Amarelo', hex: '#EAB308' },
      { id: 'laranja', name: 'Laranja', hex: '#EA580C' },
      { id: 'cinza', name: 'Cinza', hex: '#6B7280' },
      { id: 'transparente', name: 'Transparente', hex: '#E5E7EB' },
    ],
    tempMax: '~60°C',
    impactResistance: 'Baixa — material rígido e frágil, não suporta quedas de grande impacto',
    applications: ['Prototipagem rápida', 'Modelos conceituais', 'Peças decorativas', 'Miniaturas', 'Maquetes'],
    details: 'O PLA (Ácido Polilático) é o filamento mais popular e fácil de imprimir. Biodegradável, feito de amido de milho. Ótimo para prototipagem e peças estéticas. Não recomendado para peças expostas ao calor ou que exijam resistência mecânica elevada.',
  },
  {
    id: 'petg', name: 'PETG', description: 'Resistente, durável, boa flexibilidade',
    priceMultiplier: 1.2,
    colors: [
      { id: 'branco', name: 'Branco', hex: '#FFFFFF' },
      { id: 'preto', name: 'Preto', hex: '#1a1a1a' },
      { id: 'vermelho', name: 'Vermelho', hex: '#DC2626' },
      { id: 'azul', name: 'Azul', hex: '#2563EB' },
      { id: 'verde', name: 'Verde', hex: '#16A34A' },
      { id: 'transparente', name: 'Transparente', hex: '#E5E7EB' },
      { id: 'laranja', name: 'Laranja', hex: '#EA580C' },
    ],
    tempMax: '~80°C',
    impactResistance: 'Média-Alta — boa resistência a quedas e impactos, flexível o suficiente para absorver energia',
    applications: ['Peças funcionais', 'Recipientes', 'Peças mecânicas leves', 'Protótipos de uso real', 'Peças expostas à umidade'],
    details: 'O PETG é um dos filamentos mais versáteis. Combina facilidade de impressão do PLA com resistência superior. Resistente à umidade e a produtos químicos. Excelente para peças funcionais que precisam de durabilidade sem exigir alta temperatura.',
  },
  {
    id: 'abs', name: 'ABS', description: 'Alta resistência térmica e mecânica',
    priceMultiplier: 1.3,
    colors: [
      { id: 'branco', name: 'Branco', hex: '#FFFFFF' },
      { id: 'preto', name: 'Preto', hex: '#1a1a1a' },
      { id: 'vermelho', name: 'Vermelho', hex: '#DC2626' },
      { id: 'azul', name: 'Azul', hex: '#2563EB' },
      { id: 'cinza', name: 'Cinza', hex: '#6B7280' },
      { id: 'amarelo', name: 'Amarelo', hex: '#EAB308' },
    ],
    tempMax: '~100°C',
    impactResistance: 'Alta — excelente resistência a impactos e quedas, material tenaz',
    applications: ['Peças automotivas', 'Carcaças e gabinetes', 'Peças mecânicas', 'Protótipos funcionais', 'Peças que precisam de pós-processamento (lixar, pintar, colar)'],
    details: 'O ABS é o mesmo plástico usado em peças LEGO e carcaças de eletrônicos. Alta resistência térmica e mecânica. Pode ser lixado, pintado e colado com acetona. Requer impressora com mesa aquecida e ambiente controlado. Ideal para peças que sofrem estresse mecânico.',
  },
  {
    id: 'tritan', name: 'Tritan (Co-Poliéster)', description: 'Food-safe, alta transparência, resistente',
    priceMultiplier: 1.5,
    colors: [
      { id: 'transparente', name: 'Transparente', hex: '#E5E7EB' },
      { id: 'branco', name: 'Branco', hex: '#FFFFFF' },
      { id: 'preto', name: 'Preto', hex: '#1a1a1a' },
    ],
    tempMax: '~96°C',
    impactResistance: 'Alta — muito resistente a quedas, material flexível e tenaz, não quebra facilmente',
    applications: ['Recipientes para alimentos', 'Garrafas e copos', 'Peças transparentes', 'Aplicações médicas', 'Peças que exigem certificação food-safe'],
    details: 'O Tritan é um co-poliéster desenvolvido pela Eastman. É certificado food-safe (seguro para contato com alimentos), livre de BPA. Excelente transparência e resistência a impactos. Ideal para recipientes, garrafas e peças que precisam de contato com alimentos ou líquidos.',
  },
  {
    id: 'nylon', name: 'Nylon (PA)', description: 'Muito resistente, flexível, durável',
    priceMultiplier: 1.8,
    colors: [
      { id: 'natural', name: 'Natural (Branco)', hex: '#F5F5F0' },
      { id: 'preto', name: 'Preto', hex: '#1a1a1a' },
    ],
    tempMax: '~120°C',
    impactResistance: 'Altíssima — extremamente difícil de quebrar, suporta grandes tensões e impactos sem falhar',
    applications: ['Engrenagens', 'Dobradiças vivas', 'Peças de alta resistência', 'Aplicações industriais', 'Peças que sofrem atrito constante'],
    details: 'O Nylon é um material de engenharia superior. Oferece a melhor combinação de resistência, flexibilidade e durabilidade. É autolubrificante, ideal para engrenagens. Requer cuidados especiais com umidade e alta temperatura de impressão.',
  },
  {
    id: 'tpu', name: 'TPU (Flexível)', description: 'Elástico, flexível, resistente à abrasão',
    priceMultiplier: 1.6,
    colors: [
      { id: 'preto', name: 'Preto', hex: '#1a1a1a' },
      { id: 'branco', name: 'Branco', hex: '#FFFFFF' },
      { id: 'vermelho', name: 'Vermelho', hex: '#DC2626' },
      { id: 'azul', name: 'Azul', hex: '#2563EB' },
      { id: 'transparente', name: 'Transparente', hex: '#E5E7EB' },
    ],
    tempMax: '~80°C',
    impactResistance: 'Máxima — por ser elástico, absorve qualquer impacto sem sofrer danos permanentes',
    applications: ['Capas de celular', 'Vedantes e juntas', 'Pneus de robôs', 'Amortecedores', 'Peças que precisam dobrar ou esticar'],
    details: 'O TPU é um filamento elástico similar à borracha. Resistente à abrasão, óleos e graxas. Pode ser esticado e retorna à forma original. Ideal para peças que precisam de flexibilidade ou amortecimento de vibração.',
  },
];

const resinMaterials: MaterialInfo[] = [
  {
    id: 'standard', name: 'Resina Standard', description: 'Alta resolução para modelos gerais',
    priceMultiplier: 1.2,
    colors: [
      { id: 'cinza', name: 'Cinza', hex: '#6B7280' },
      { id: 'branco', name: 'Branco', hex: '#FFFFFF' },
      { id: 'preto', name: 'Preto', hex: '#1a1a1a' },
      { id: 'transparente', name: 'Transparente', hex: '#E5E7EB' },
    ],
    tempMax: '~50°C',
    impactResistance: 'Baixa — material muito rígido e quebradiço, similar ao vidro ou cerâmica',
    applications: ['Miniaturas detalhadas', 'Modelos conceituais', 'Protótipos visuais', 'Joalheria (modelos)', 'Action figures'],
    details: 'A resina standard oferece o melhor custo-benefício para alta resolução. Superfície extremamente lisa, ideal para pintura. Frágil a impactos.',
  },
  {
    id: 'tough', name: 'Resina Tough/ABS-like', description: 'Resistente a impactos e durável',
    priceMultiplier: 1.6,
    colors: [
      { id: 'cinza', name: 'Cinza', hex: '#6B7280' },
      { id: 'preto', name: 'Preto', hex: '#1a1a1a' },
    ],
    tempMax: '~60°C',
    impactResistance: 'Média — muito superior à standard, aguenta quedas leves e algum estresse mecânico',
    applications: ['Peças funcionais', 'Encaixes', 'Protótipos mecânicos', 'Peças que precisam de resistência extra'],
    details: 'Desenvolvida para simular as propriedades do plástico ABS. Mais flexível que a standard, não quebra tão facilmente.',
  },
];

const finishes = [
  { id: 'raw', name: 'Bruto (Padrão)', priceAdd: 0 },
  { id: 'sanded', name: 'Lixado', priceAdd: 15 },
  { id: 'painted', name: 'Pintado (Cor Sólida)', priceAdd: 35 },
  { id: 'premium', name: 'Pintura Premium / Detalhada', priceAdd: 75 },
];

const urgencies = [
  { id: 'normal', name: 'Normal (3-5 dias úteis)', multiplier: 1 },
  { id: 'fast', name: 'Rápido (1-2 dias úteis)', multiplier: 1.5 },
  { id: 'urgent', name: 'Urgente (Mesmo dia / 24h)', multiplier: 2.5 },
];

export default function Quote() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [category, setCategory] = useState<PrintCategory | ''>('');
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    material: '',
    finish: 'raw',
    quantity: 1,
    urgency: 'normal',
    dimensions: '',
    description: '',
    cep: '',
  });

  const [selectedColor, setSelectedColor] = useState('');

  const currentMaterials = category === 'fdm' ? fdmMaterials : resinMaterials;
  const selectedMaterial = currentMaterials.find((m) => m.id === formData.material);

  useEffect(() => {
    if (selectedMaterial && !selectedMaterial.colors.find(c => c.id === selectedColor)) {
      setSelectedColor(selectedMaterial.colors[0].id);
    }
  }, [formData.material, selectedMaterial, selectedColor]);

  const handleCategoryChange = (cat: PrintCategory) => {
    setCategory(cat);
    setFormData({ ...formData, material: cat === 'fdm' ? 'pla' : 'standard' });
  };

  const handleMaterialChange = (matId: string) => {
    setFormData({ ...formData, material: matId });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles([...files, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.material || !category) {
      toast({ title: "Campos obrigatórios", description: "Por favor, preencha pelo menos o e-mail e os detalhes da peça.", variant: "destructive" });
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Salvar orçamento no sistema (Supabase via dataStore)
      const orcamentoId = await salvarOrcamento({
        tipo: 'impressao',
        cliente: formData.name || 'Cliente Interessado',
        email: formData.email,
        telefone: formData.phone || 'Não informado',
        detalhes: {
          categoria: category,
          material: formData.material,
          cor: selectedColor,
          quantidade: formData.quantity,
          acabamento: formData.finish,
          urgencia: formData.urgency,
          dimensoes: formData.dimensions,
          descricao: formData.description,
          cep: formData.cep,
        },
      });
      
      // Incrementar contador de orçamentos do usuário
      await incrementarOrcamentosUsuario(formData.email);
      
      // Redirecionar para página de sucesso
      navigate('/orcamento-sucesso');
    } catch (error) {
      console.error('Erro ao enviar orçamento:', error);
      toast({ title: "Erro no envio", description: "Ocorreu um erro ao enviar seu orçamento. Tente novamente.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-primary py-16">
        <div className="container-custom">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
            <span className="inline-block text-accent font-semibold text-sm uppercase tracking-wider mb-4">Orçamento Rápido</span>
            <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-4">Receba seu orçamento em minutos</h1>
            <p className="text-xl text-primary-foreground/80">Envie seu arquivo 3D ou descreva seu projeto. Nossa equipe analisará e enviará o valor final por e-mail.</p>
          </motion.div>
        </div>
      </section>

      {/* Form */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Form */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* File Upload */}
                <div className="card-elevated p-6">
                  <h2 className="text-xl font-semibold text-foreground mb-4">1. Envie seu arquivo 3D</h2>
                  <p className="text-muted-foreground text-sm mb-4">Formatos aceitos: STL, OBJ, 3MF, STEP. Não tem o arquivo? Descreva seu projeto abaixo.</p>
                  <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-accent transition-colors cursor-pointer" onClick={() => document.getElementById('file-upload')?.click()}>
                    <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-foreground font-medium mb-2">Arraste arquivos aqui ou clique para selecionar</p>
                    <p className="text-muted-foreground text-sm">Máximo 50MB por arquivo</p>
                    <input id="file-upload" type="file" multiple accept=".stl,.obj,.3mf,.step,.stp" onChange={handleFileChange} className="hidden" />
                  </div>
                  {files.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {files.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-accent" />
                            <span className="text-sm text-foreground">{file.name}</span>
                            <span className="text-xs text-muted-foreground">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => removeFile(index)} className="text-muted-foreground hover:text-destructive">Remover</Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Category Selection */}
                <div className="card-elevated p-6">
                  <h2 className="text-xl font-semibold text-foreground mb-4">2. Escolha a tecnologia de impressão</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button type="button" onClick={() => handleCategoryChange('fdm')} className={`p-4 rounded-xl border-2 text-left transition-all ${category === 'fdm' ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/50'}`}>
                      <div className="flex items-center gap-3 mb-2">
                        <Layers className={`w-6 h-6 ${category === 'fdm' ? 'text-accent' : 'text-muted-foreground'}`} />
                        <span className="font-bold">Filamento FDM</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Ideal para peças funcionais e protótipos.</p>
                    </button>
                    <button type="button" onClick={() => handleCategoryChange('resina')} className={`p-4 rounded-xl border-2 text-left transition-all ${category === 'resina' ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/50'}`}>
                      <div className="flex items-center gap-3 mb-2">
                        <Droplets className={`w-6 h-6 ${category === 'resina' ? 'text-accent' : 'text-muted-foreground'}`} />
                        <span className="font-bold">Resina UV</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Alta resolução e detalhes finos.</p>
                    </button>
                  </div>

                  {category && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-8 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2">
                          <Label className="mb-3 block">Material</Label>
                          <Select value={formData.material} onValueChange={handleMaterialChange}>
                            <SelectTrigger><SelectValue placeholder="Selecione o material" /></SelectTrigger>
                            <SelectContent>
                              {currentMaterials.map((m) => (
                                <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="mb-3 block">Cor</Label>
                          <Select value={selectedColor} onValueChange={setSelectedColor}>
                            <SelectTrigger><SelectValue placeholder="Selecione a cor" /></SelectTrigger>
                            <SelectContent>
                              {selectedMaterial?.colors.map((c) => (
                                <SelectItem key={c.id} value={c.id}>
                                  <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full border border-border" style={{ backgroundColor: c.hex }} />
                                    {c.name}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <Label className="mb-3 block">Acabamento</Label>
                          <Select value={formData.finish} onValueChange={(value) => setFormData({ ...formData, finish: value })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {finishes.map((f) => (
                                <SelectItem key={f.id} value={f.id}>
                                  {f.name} {f.priceAdd > 0 && `(+R$ ${f.priceAdd})`}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="mb-3 block">Quantidade</Label>
                          <Input type="number" min="1" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })} />
                        </div>
                        <div>
                          <Label className="mb-3 block">Urgência</Label>
                          <Select value={formData.urgency} onValueChange={(value) => setFormData({ ...formData, urgency: value })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {urgencies.map((urgency) => (
                                <SelectItem key={urgency.id} value={urgency.id}>{urgency.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label className="mb-3 block">Dimensões aproximadas (opcional)</Label>
                        <Input placeholder="Ex: 10cm x 5cm x 3cm" value={formData.dimensions} onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })} />
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Description and Contact */}
                <div className="card-elevated p-6">
                  <h2 className="text-xl font-semibold text-foreground mb-4">3. Detalhes e Contato</h2>
                  <div className="space-y-6">
                    <div>
                      <Label className="mb-3 block">Descreva seu projeto</Label>
                      <Textarea placeholder="Conte mais sobre seu projeto, uso pretendido, detalhes especiais..." rows={4} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label className="mb-3 block">E-mail para retorno *</Label>
                        <Input type="email" placeholder="seu@email.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                      </div>
                      <div>
                        <Label className="mb-3 block">WhatsApp (opcional)</Label>
                        <Input type="tel" placeholder="(43) 9-9174-1518" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                      </div>
                    </div>
                  </div>
                </div>

                <Button type="submit" size="lg" disabled={isSubmitting} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                  {isSubmitting ? 'Enviando...' : 'Enviar Solicitação de Orçamento'} <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </form>
            </motion.div>

            {/* Sidebar */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Material Info Card */}
                {selectedMaterial && (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card-elevated p-6 border-accent/20">
                    <h3 className="font-bold text-foreground mb-1 text-lg">{selectedMaterial.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{selectedMaterial.description}</p>
                    
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Thermometer className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-foreground">Temperatura máxima</p>
                          <p className="text-sm text-muted-foreground">{selectedMaterial.tempMax}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Shield className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-foreground">Resistência a impacto/quedas</p>
                          <p className="text-sm text-muted-foreground">{selectedMaterial.impactResistance}</p>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-foreground mb-2">Aplicações recomendadas</p>
                        <ul className="space-y-1">
                          {selectedMaterial.applications.map((app, i) => (
                            <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                              <Check className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                              {app}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="pt-3 border-t border-border">
                        <p className="text-xs text-muted-foreground leading-relaxed">{selectedMaterial.details}</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Info Box */}
                <div className="card-elevated p-6 bg-accent/5 border-accent/20">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Info className="w-5 h-5 text-accent" /> Como funciona
                  </h3>
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    <li className="flex items-start gap-3"><Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" /><span>Envie seu arquivo ou descreva o projeto</span></li>
                    <li className="flex items-start gap-3"><Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" /><span>Analisamos e enviamos orçamento detalhado</span></li>
                    <li className="flex items-start gap-3"><Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" /><span>Aprovado o orçamento, iniciamos a produção</span></li>
                    <li className="flex items-start gap-3"><Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" /><span>Entregamos em qualquer lugar do Brasil</span></li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
