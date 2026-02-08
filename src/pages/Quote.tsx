import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, Check, ArrowRight, Info, AlertCircle } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';

const materials = [
  { id: 'pla', name: 'PLA', description: 'Biodegradável, fácil de imprimir', priceMultiplier: 1 },
  { id: 'petg', name: 'PETG', description: 'Resistente, durável', priceMultiplier: 1.2 },
  { id: 'abs', name: 'ABS', description: 'Alta resistência térmica', priceMultiplier: 1.3 },
  { id: 'nylon', name: 'Nylon', description: 'Muito resistente, flexível', priceMultiplier: 1.8 },
  { id: 'resina', name: 'Resina', description: 'Alta precisão, detalhes finos', priceMultiplier: 2.0 },
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
    
    // Simulate calculation
    setTimeout(() => {
      const basePricePerCm3 = 0.15; // R$ per cm³
      const estimatedVolume = 100; // Mock volume - would come from file analysis
      
      const material = materials.find((m) => m.id === formData.material);
      const finish = finishes.find((f) => f.id === formData.finish);
      const urgency = urgencies.find((u) => u.id === formData.urgency);
      
      if (!material || !finish || !urgency) {
        setIsCalculating(false);
        return;
      }
      
      let price = basePricePerCm3 * estimatedVolume;
      price *= material.priceMultiplier;
      price += finish.priceAdd;
      price *= urgency.multiplier;
      price *= formData.quantity;
      
      // Minimum price
      price = Math.max(price, 29.90);
      
      setEstimate(price);
      setIsCalculating(false);
    }, 1500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.material) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Orçamento enviado!",
      description: "Em breve entraremos em contato com o valor final.",
    });
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-primary py-16">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <span className="inline-block text-accent font-semibold text-sm uppercase tracking-wider mb-4">
              Orçamento Rápido
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
              Receba seu orçamento em minutos
            </h1>
            <p className="text-xl text-primary-foreground/80">
              Envie seu arquivo 3D ou descreva seu projeto. 
              Calculamos automaticamente uma estimativa de preço.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Form */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-2"
            >
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* File Upload */}
                <div className="card-elevated p-6">
                  <h2 className="text-xl font-semibold text-foreground mb-4">
                    1. Envie seu arquivo 3D
                  </h2>
                  <p className="text-muted-foreground text-sm mb-4">
                    Formatos aceitos: STL, OBJ, 3MF, STEP. Não tem o arquivo? Descreva seu projeto abaixo.
                  </p>
                  
                  <div
                    className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-accent transition-colors cursor-pointer"
                    onClick={() => document.getElementById('file-upload')?.click()}
                  >
                    <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-foreground font-medium mb-2">
                      Arraste arquivos aqui ou clique para selecionar
                    </p>
                    <p className="text-muted-foreground text-sm">
                      Máximo 50MB por arquivo
                    </p>
                    <input
                      id="file-upload"
                      type="file"
                      multiple
                      accept=".stl,.obj,.3mf,.step,.stp"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>

                  {files.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {files.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-muted rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-accent" />
                            <span className="text-sm text-foreground">{file.name}</span>
                            <span className="text-xs text-muted-foreground">
                              ({(file.size / 1024 / 1024).toFixed(2)} MB)
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            Remover
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Material & Finish */}
                <div className="card-elevated p-6">
                  <h2 className="text-xl font-semibold text-foreground mb-4">
                    2. Escolha material e acabamento
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="mb-3 block">Material *</Label>
                      <Select
                        value={formData.material}
                        onValueChange={(value) => setFormData({ ...formData, material: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o material" />
                        </SelectTrigger>
                        <SelectContent>
                          {materials.map((material) => (
                            <SelectItem key={material.id} value={material.id}>
                              <div className="flex flex-col">
                                <span>{material.name}</span>
                                <span className="text-xs text-muted-foreground">{material.description}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="mb-3 block">Acabamento</Label>
                      <Select
                        value={formData.finish}
                        onValueChange={(value) => setFormData({ ...formData, finish: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
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
                      <Input
                        type="number"
                        min="1"
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                      />
                    </div>

                    <div>
                      <Label className="mb-3 block">Urgência</Label>
                      <Select
                        value={formData.urgency}
                        onValueChange={(value) => setFormData({ ...formData, urgency: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {urgencies.map((urgency) => (
                            <SelectItem key={urgency.id} value={urgency.id}>
                              {urgency.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="mt-6">
                    <Label className="mb-3 block">Dimensões aproximadas (opcional)</Label>
                    <Input
                      placeholder="Ex: 10cm x 5cm x 3cm"
                      value={formData.dimensions}
                      onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="card-elevated p-6">
                  <h2 className="text-xl font-semibold text-foreground mb-4">
                    3. Descreva seu projeto
                  </h2>
                  <Textarea
                    placeholder="Conte mais sobre seu projeto, uso pretendido, detalhes especiais..."
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                {/* Contact */}
                <div className="card-elevated p-6">
                  <h2 className="text-xl font-semibold text-foreground mb-4">
                    4. Seus dados
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="mb-3 block">Nome completo *</Label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label className="mb-3 block">E-mail *</Label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label className="mb-3 block">WhatsApp</Label>
                      <Input
                        type="tel"
                        placeholder="(43) 9174-1518"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label className="mb-3 block">CEP (para frete)</Label>
                      <Input
                        placeholder="00000-000"
                        value={formData.cep}
                        onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <Button type="submit" size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                  Enviar Orçamento
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </form>
            </motion.div>

            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-1"
            >
              <div className="sticky top-24 space-y-6">
                {/* Estimate Card */}
                <div className="card-elevated p-6">
                  <h3 className="font-semibold text-foreground mb-4">
                    Estimativa de Preço
                  </h3>
                  
                  {formData.material ? (
                    <>
                      <Button
                        onClick={calculateEstimate}
                        disabled={isCalculating}
                        className="w-full mb-4"
                        variant="outline"
                      >
                        {isCalculating ? 'Calculando...' : 'Calcular Estimativa'}
                      </Button>
                      
                      {estimate !== null && (
                        <div className="text-center py-4 border-t border-border">
                          <p className="text-muted-foreground text-sm mb-2">Estimativa:</p>
                          <p className="text-3xl font-bold text-accent">
                            R$ {estimate.toFixed(2).replace('.', ',')}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2 flex items-center justify-center gap-1">
                            <Info className="w-3 h-3" />
                            Valor aproximado, sujeito a análise
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      <AlertCircle className="w-8 h-8 mx-auto mb-2 text-muted" />
                      <p className="text-sm">
                        Selecione um material para calcular a estimativa
                      </p>
                    </div>
                  )}
                </div>

                {/* Info Box */}
                <div className="card-elevated p-6 bg-accent/5 border-accent/20">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Info className="w-5 h-5 text-accent" />
                    Como funciona
                  </h3>
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    <li className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                      <span>Envie seu arquivo ou descreva o projeto</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                      <span>Analisamos e enviamos orçamento detalhado</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                      <span>Aprovado o orçamento, iniciamos a produção</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                      <span>Entregamos em qualquer lugar do Brasil</span>
                    </li>
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
