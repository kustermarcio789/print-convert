import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, Check, ArrowRight, Info, AlertCircle, Thermometer, Shield, Layers, Droplets } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

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
    impactResistance: 'Muito Alta — extremamente resistente a impactos, quedas e desgaste. Material flexível que absorve energia',
    applications: ['Engrenagens e peças mecânicas', 'Dobradiças e encaixes', 'Peças de substituição industrial', 'Ferramentas e gabaritos', 'Aplicações automotivas e aeroespaciais'],
    details: 'O Nylon (Poliamida) é um dos filamentos mais resistentes para FDM. Excelente resistência ao desgaste, impacto e fadiga. Flexível o suficiente para absorver impactos sem quebrar. Absorve umidade, então precisa ser armazenado em local seco. Ideal para peças mecânicas de alta performance.',
  },
];

const resinaMaterials: MaterialInfo[] = [
  {
    id: 'resina-basica', name: 'Resina Básica (Standard)', description: 'Alta precisão, detalhes finos, custo acessível',
    priceMultiplier: 2.0,
    colors: [
      { id: 'cinza', name: 'Cinza', hex: '#9CA3AF' },
      { id: 'branco', name: 'Branco', hex: '#FFFFFF' },
      { id: 'preto', name: 'Preto', hex: '#1a1a1a' },
      { id: 'transparente', name: 'Transparente', hex: '#E5E7EB' },
      { id: 'verde', name: 'Verde', hex: '#16A34A' },
      { id: 'azul', name: 'Azul', hex: '#2563EB' },
    ],
    tempMax: '~50-60°C',
    impactResistance: 'Baixa — material rígido e frágil após cura UV, não suporta quedas ou impactos fortes',
    applications: ['Miniaturas e figuras detalhadas', 'Modelos conceituais', 'Joias e bijuterias (moldes)', 'Peças com detalhes finos', 'Protótipos visuais'],
    details: 'A Resina Básica (Standard) é ideal para peças que exigem alta resolução e detalhes finos. Superfície lisa sem camadas visíveis. Custo acessível. Porém é frágil — não indicada para peças funcionais ou que sofram impacto. Necessita pós-cura UV e lavagem em álcool isopropílico.',
  },
  {
    id: 'resina-abs-like', name: 'Resina ABS-Like', description: 'Resistente a impactos, propriedades similares ao ABS',
    priceMultiplier: 2.5,
    colors: [
      { id: 'cinza', name: 'Cinza', hex: '#9CA3AF' },
      { id: 'preto', name: 'Preto', hex: '#1a1a1a' },
      { id: 'branco', name: 'Branco', hex: '#FFFFFF' },
      { id: 'verde', name: 'Verde Translúcido', hex: '#22C55E' },
    ],
    tempMax: '~70-80°C',
    impactResistance: 'Média-Alta — significativamente mais resistente que resina básica, suporta quedas moderadas e estresse mecânico',
    applications: ['Protótipos funcionais', 'Peças mecânicas de precisão', 'Encaixes e componentes', 'Peças que exigem resistência + detalhe', 'Ferramentas e gabaritos'],
    details: 'A Resina ABS-Like combina a alta resolução da impressão em resina com propriedades mecânicas similares ao ABS. Muito mais resistente a impactos que a resina básica. Ideal para protótipos funcionais que precisam de detalhes finos E resistência mecânica. Necessita pós-cura UV.',
  },
];

const finishes = [
  { id: 'raw', name: 'Bruto', description: 'Sem acabamento', priceAdd: 0 },
  { id: 'sanded', name: 'Lixado', description: 'Superfície lisa', priceAdd: 20 },
  { id: 'painted', name: 'Pintado', description: 'Pintura básica', priceAdd: 50 },
  { id: 'premium', name: 'Premium', description: 'Pintura automotiva', priceAdd: 100 },
];

const urgencies = [
  { id: 'normal', name: 'Normal (5-7 dias)', multiplier: 1 },
  { id: 'fast', name: 'Rápido (3-4 dias)', multiplier: 1.3 },
  { id: 'express', name: 'Expresso (1-2 dias)', multiplier: 1.8 },
];

export default function QuotePage() {
  const { toast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [category, setCategory] = useState<PrintCategory | ''>('');
  const [selectedColor, setSelectedColor] = useState('');
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
  const [estimate, setEstimate] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const currentMaterials = category === 'fdm' ? fdmMaterials : category === 'resina' ? resinaMaterials : [];
  const selectedMaterial = currentMaterials.find(m => m.id === formData.material);

  const handleCategoryChange = (value: string) => {
    setCategory(value as PrintCategory);
    setFormData({ ...formData, material: '' });
    setSelectedColor('');
  };

  const handleMaterialChange = (value: string) => {
    setFormData({ ...formData, material: value });
    setSelectedColor('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const calculateEstimate = () => {
    setIsCalculating(true);
    setTimeout(() => {
      const basePricePerCm3 = 0.15;
      const estimatedVolume = 100;
      const material = currentMaterials.find((m) => m.id === formData.material);
      const finish = finishes.find((f) => f.id === formData.finish);
      const urgency = urgencies.find((u) => u.id === formData.urgency);
      if (!material || !finish || !urgency) { setIsCalculating(false); return; }
      let price = basePricePerCm3 * estimatedVolume;
      price *= material.priceMultiplier;
      price += finish.priceAdd;
      price *= urgency.multiplier;
      price *= formData.quantity;
      price = Math.max(price, 29.90);
      setEstimate(price);
      setIsCalculating(false);
    }, 1500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.material || !category) {
      toast({ title: "Campos obrigatórios", description: "Por favor, preencha todos os campos obrigatórios.", variant: "destructive" });
      return;
    }
    toast({ title: "Orçamento enviado!", description: "Em breve entraremos em contato com o valor final." });
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-primary py-16">
        <div className="container-custom">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
            <span className="inline-block text-accent font-semibold text-sm uppercase tracking-wider mb-4">Orçamento Rápido</span>
            <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-4">Receba seu orçamento em minutos</h1>
            <p className="text-xl text-primary-foreground/80">Envie seu arquivo 3D ou descreva seu projeto. Calculamos automaticamente uma estimativa de preço.</p>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <button
                      type="button"
                      onClick={() => handleCategoryChange('fdm')}
                      className={`p-6 rounded-xl border-2 text-left transition-all ${category === 'fdm' ? 'border-accent bg-accent/5 shadow-md' : 'border-border hover:border-accent/30'}`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <Layers className="w-6 h-6 text-accent" />
                        <span className="text-lg font-bold text-foreground">Filamento FDM</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Impressão por deposição de filamento. Ideal para peças funcionais, protótipos e objetos de uso diário.</p>
                      <div className="mt-3 flex flex-wrap gap-1">
                        {['PLA', 'PETG', 'ABS', 'Tritan', 'Nylon'].map(m => (
                          <span key={m} className="text-xs bg-secondary px-2 py-0.5 rounded-full text-muted-foreground">{m}</span>
                        ))}
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCategoryChange('resina')}
                      className={`p-6 rounded-xl border-2 text-left transition-all ${category === 'resina' ? 'border-accent bg-accent/5 shadow-md' : 'border-border hover:border-accent/30'}`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <Droplets className="w-6 h-6 text-accent" />
                        <span className="text-lg font-bold text-foreground">Resina UV</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Impressão por cura de resina UV (SLA/DLP/LCD). Alta resolução e detalhes finos.</p>
                      <div className="mt-3 flex flex-wrap gap-1">
                        {['Resina Básica', 'ABS-Like'].map(m => (
                          <span key={m} className="text-xs bg-secondary px-2 py-0.5 rounded-full text-muted-foreground">{m}</span>
                        ))}
                      </div>
                    </button>
                  </div>

                  {/* Material Selection */}
                  {category && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                      <div>
                        <Label className="mb-3 block font-semibold">Material *</Label>
                        <div className="grid grid-cols-1 gap-3">
                          {currentMaterials.map((material) => (
                            <button
                              key={material.id}
                              type="button"
                              onClick={() => handleMaterialChange(material.id)}
                              className={`p-4 rounded-xl border-2 text-left transition-all ${formData.material === material.id ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/30'}`}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <span className="font-semibold text-foreground">{material.name}</span>
                                  <span className="text-sm text-muted-foreground ml-2">— {material.description}</span>
                                </div>
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.material === material.id ? 'border-accent bg-accent' : 'border-border'}`}>
                                  {formData.material === material.id && <Check className="w-3 h-3 text-accent-foreground" />}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Color Selection */}
                      {selectedMaterial && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                          <Label className="mb-3 block font-semibold">Cor {selectedColor && `— ${selectedMaterial.colors.find(c => c.id === selectedColor)?.name}`}</Label>
                          <div className="flex flex-wrap gap-3">
                            {selectedMaterial.colors.map((color) => (
                              <button
                                key={color.id}
                                type="button"
                                onClick={() => setSelectedColor(color.id)}
                                className={`group relative w-10 h-10 rounded-full border-2 transition-all ${selectedColor === color.id ? 'border-accent scale-110 ring-2 ring-accent/30' : 'border-border hover:border-accent/50'}`}
                                style={{ backgroundColor: color.hex }}
                                title={color.name}
                              >
                                {selectedColor === color.id && (
                                  <Check className={`w-4 h-4 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${color.hex === '#FFFFFF' || color.hex === '#F5F5F0' || color.hex === '#E5E7EB' ? 'text-gray-800' : 'text-white'}`} />
                                )}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}

                      {/* Finish, Quantity, Urgency */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label className="mb-3 block">Acabamento</Label>
                          <Select value={formData.finish} onValueChange={(value) => setFormData({ ...formData, finish: value })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {finishes.map((finish) => (
                                <SelectItem key={finish.id} value={finish.id}>
                                  <div className="flex flex-col">
                                    <span>{finish.name}</span>
                                    <span className="text-xs text-muted-foreground">{finish.description}</span>
                                  </div>
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

                {/* Description */}
                <div className="card-elevated p-6">
                  <h2 className="text-xl font-semibold text-foreground mb-4">3. Descreva seu projeto</h2>
                  <Textarea placeholder="Conte mais sobre seu projeto, uso pretendido, detalhes especiais..." rows={4} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                </div>

                {/* Contact */}
                <div className="card-elevated p-6">
                  <h2 className="text-xl font-semibold text-foreground mb-4">4. Seus dados</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="mb-3 block">Nome completo *</Label>
                      <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                    </div>
                    <div>
                      <Label className="mb-3 block">E-mail *</Label>
                      <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                    </div>
                    <div>
                      <Label className="mb-3 block">WhatsApp</Label>
                      <Input type="tel" placeholder="(43) 9-9174-1518" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                    </div>
                    <div>
                      <Label className="mb-3 block">CEP (para frete)</Label>
                      <Input placeholder="00000-000" value={formData.cep} onChange={(e) => setFormData({ ...formData, cep: e.target.value })} />
                    </div>
                  </div>
                </div>

                <Button type="submit" size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                  Enviar Orçamento <ArrowRight className="ml-2 h-5 w-5" />
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

                {/* Estimate Card */}
                <div className="card-elevated p-6">
                  <h3 className="font-semibold text-foreground mb-4">Estimativa de Preço</h3>
                  {formData.material ? (
                    <>
                      <Button onClick={calculateEstimate} disabled={isCalculating} className="w-full mb-4" variant="outline">
                        {isCalculating ? 'Calculando...' : 'Calcular Estimativa'}
                      </Button>
                      {estimate !== null && (
                        <div className="text-center py-4 border-t border-border">
                          <p className="text-muted-foreground text-sm mb-2">Estimativa:</p>
                          <p className="text-3xl font-bold text-accent">R$ {estimate.toFixed(2).replace('.', ',')}</p>
                          <p className="text-xs text-muted-foreground mt-2 flex items-center justify-center gap-1">
                            <Info className="w-3 h-3" /> Valor aproximado, sujeito a análise
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      <AlertCircle className="w-8 h-8 mx-auto mb-2 text-muted" />
                      <p className="text-sm">Selecione a tecnologia e o material para calcular a estimativa</p>
                    </div>
                  )}
                </div>

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
