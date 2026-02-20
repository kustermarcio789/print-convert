import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  ArrowRight, 
  Box, 
  Info, 
  AlertCircle, 
  X,
  ChevronRight,
  Printer,
  Layers,
  Palette,
  Clock
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { salvarOrcamento, salvarUsuario } from '@/lib/dataStore';
import ModelViewer3D from '@/components/ModelViewer3D';

const categories = [
  { id: 'impressao', name: 'Impressão 3D', icon: Printer, desc: 'Produção de peças a partir de modelos 3D' },
  { id: 'modelagem', name: 'Modelagem 3D', icon: Box, desc: 'Criação de arquivos 3D a partir de ideias ou desenhos' },
  { id: 'pintura', name: 'Pintura e Acabamento', icon: Palette, desc: 'Acabamento profissional para peças impressas' },
  { id: 'manutencao', name: 'Manutenção', icon: Clock, desc: 'Reparo e calibração de impressoras 3D' },
];

const materials = [
  { id: 'pla', name: 'PLA (Biodegradável)', price: 0.15 },
  { id: 'abs', name: 'ABS (Resistente)', price: 0.18 },
  { id: 'petg', name: 'PETG (Equilibrado)', price: 0.20 },
  { id: 'resina', name: 'Resina (Alta Precisão)', price: 0.45 },
  { id: 'tpu', name: 'TPU (Flexível)', price: 0.35 },
];

const finishes = [
  { id: 'bruto', name: 'Bruto (Com suportes removidos)', priceAdd: 0 },
  { id: 'lixado', name: 'Lixado (Pronto para pintura)', priceAdd: 15 },
  { id: 'pintado', name: 'Pintura Básica (Cor sólida)', priceAdd: 35 },
  { id: 'premium', name: 'Pintura Premium (Detalhada)', priceAdd: 80 },
];

const urgencies = [
  { id: 'normal', name: 'Normal (5-7 dias úteis)', multiplier: 1 },
  { id: 'rapido', name: 'Rápido (3-4 dias úteis)', multiplier: 1.3 },
  { id: 'urgente', name: 'Urgente (24-48 horas)', multiplier: 1.8 },
];

export default function Quote() {
  const { toast } = useToast();
  const [category, setCategory] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [estimate, setEstimate] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    material: '',
    color: 'Branco',
    finish: 'bruto',
    urgency: 'normal',
    quantity: 1,
    description: '',
    cep: '',
  });

  useEffect(() => {
    return () => {
      if (fileUrl) URL.revokeObjectURL(fileUrl);
    };
  }, [fileUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const extension = selectedFile.name.split('.').pop()?.toLowerCase();
      const allowed = ['stl', 'obj', '3mf', 'step', 'glb', 'gltf'];
      
      if (!allowed.includes(extension || '')) {
        toast({
          title: 'Formato não suportado',
          description: 'Por favor, envie arquivos STL, OBJ, 3MF, STEP ou GLB.',
          variant: 'destructive',
        });
        return;
      }

      if (fileUrl) URL.revokeObjectURL(fileUrl);
      
      setFile(selectedFile);
      const url = URL.createObjectURL(selectedFile);
      setFileUrl(url);
      
      toast({
        title: 'Arquivo carregado',
        description: `${selectedFile.name} pronto para visualização.`,
      });
    }
  };

  const calculateEstimate = () => {
    setIsCalculating(true);
    setTimeout(() => {
      const mat = materials.find(m => m.id === formData.material);
      const fin = finishes.find(f => f.id === formData.finish);
      const urg = urgencies.find(u => u.id === formData.urgency);
      
      if (mat && fin && urg) {
        const basePrice = 45; // Preço base de setup
        const materialCost = mat.price * 150; // Estimativa de 150g
        const total = (basePrice + materialCost + fin.priceAdd) * urg.multiplier * formData.quantity;
        setEstimate(total);
      }
      setIsCalculating(false);
    }, 1000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!category || !formData.name || !formData.email || !formData.phone) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Por favor, preencha todas as informações de contato.',
        variant: 'destructive',
      });
      return;
    }

    // Salvar usuário no sistema
    salvarUsuario({
      nome: formData.name,
      email: formData.email,
      telefone: formData.phone,
      cidade: '',
      estado: '',
    });

    // Salvar orçamento
    const orcamentoId = salvarOrcamento({
      tipo: category as any,
      cliente: formData.name,
      email: formData.email,
      telefone: formData.phone,
      status: 'pendente',
      detalhes: {
        material: materials.find(m => m.id === formData.material)?.name || formData.material,
        cor: formData.color,
        quantidade: formData.quantity,
        arquivo: file?.name || 'Não enviado',
        observacoes: formData.description,
      },
    });

    toast({
      title: 'Pedido enviado com sucesso!',
      description: `Seu orçamento #${orcamentoId} foi registrado. Entraremos em contato em breve.`,
    });
  };

  return (
    <Layout>
      <div className="min-h-screen bg-background pt-24 pb-16">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl font-bold text-foreground mb-4"
              >
                Solicitar Orçamento
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-muted-foreground text-lg"
              >
                Preencha os detalhes abaixo e receba uma estimativa em tempo real.
              </motion.p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Step 1: Category */}
              <div className="card-elevated p-6">
                <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-sm">1</span>
                  Selecione o Serviço
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`p-4 rounded-xl border-2 text-left transition-all flex items-start gap-4 ${
                        category === cat.id 
                          ? 'border-accent bg-accent/5 ring-1 ring-accent' 
                          : 'border-border hover:border-accent/30'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${category === cat.id ? 'bg-accent text-accent-foreground' : 'bg-secondary text-muted-foreground'}`}>
                        <cat.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">{cat.name}</div>
                        <div className="text-xs text-muted-foreground mt-1">{cat.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: File Upload & 3D Preview */}
              <div className="card-elevated p-6">
                <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-sm">2</span>
                  Envie seu Arquivo 3D
                </h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div 
                      className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-accent/50 transition-colors cursor-pointer relative"
                      onClick={() => document.getElementById('file-upload')?.click()}
                    >
                      <input 
                        id="file-upload"
                        type="file" 
                        className="hidden" 
                        onChange={handleFileChange}
                        accept=".stl,.obj,.3mf,.step,.glb,.gltf"
                      />
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full bg-accent/10 text-accent flex items-center justify-center mb-4">
                          <Upload className="w-6 h-6" />
                        </div>
                        <p className="font-medium text-foreground">Clique para selecionar ou arraste o arquivo</p>
                        <p className="text-xs text-muted-foreground mt-2">Formatos aceitos: STL, OBJ, 3MF, STEP, GLB (Máx. 50MB)</p>
                      </div>
                    </div>

                    {file && (
                      <div className="flex items-center justify-between p-3 bg-secondary rounded-lg border border-border">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-accent" />
                          <div className="text-sm">
                            <p className="font-medium text-foreground truncate max-w-[200px]">{file.name}</p>
                            <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                        </div>
                        <Button type="button" variant="ghost" size="sm" onClick={() => { setFile(null); setFileUrl(null); }}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="bg-secondary/50 rounded-xl border border-border overflow-hidden min-h-[300px] flex flex-col items-center justify-center relative">
                    {fileUrl ? (
                      <div className="w-full h-full">
                        <ModelViewer3D modelUrl={fileUrl} />
                        <div className="absolute bottom-4 left-4 bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-full text-[10px] font-medium flex items-center gap-2 border border-border">
                          <Box className="w-3 h-3 text-accent" /> Visualização 3D Ativa
                        </div>
                      </div>
                    ) : (
                      <div className="text-center p-8">
                        <Box className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                        <p className="text-sm text-muted-foreground">Aguardando arquivo para visualização 3D</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Step 3: Technical Details */}
              <div className="card-elevated p-6">
                <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-sm">3</span>
                  Detalhes Técnicos
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Material</Label>
                    <Select value={formData.material} onValueChange={(v) => setFormData({ ...formData, material: v })}>
                      <SelectTrigger><SelectValue placeholder="Selecione o material" /></SelectTrigger>
                      <SelectContent>
                        {materials.map((m) => (
                          <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Cor de preferência</Label>
                    <Input placeholder="Ex: Preto, Branco, Azul translúcido..." value={formData.color} onChange={(e) => setFormData({ ...formData, color: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Acabamento</Label>
                    <Select value={formData.finish} onValueChange={(v) => setFormData({ ...formData, finish: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {finishes.map((f) => (
                          <SelectItem key={f.id} value={f.id}>{f.name} (+R$ {f.priceAdd})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Urgência</Label>
                    <Select value={formData.urgency} onValueChange={(v) => setFormData({ ...formData, urgency: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {urgencies.map((u) => (
                          <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Quantidade</Label>
                    <Input type="number" min="1" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })} />
                  </div>
                  <div className="space-y-2">
                    <Label>CEP para entrega</Label>
                    <Input placeholder="00000-000" value={formData.cep} onChange={(e) => setFormData({ ...formData, cep: e.target.value })} />
                  </div>
                </div>
                <div className="mt-6 space-y-2">
                  <Label>Observações ou detalhes do projeto</Label>
                  <Textarea 
                    placeholder="Descreva detalhes importantes, requisitos técnicos ou dúvidas..." 
                    className="min-h-[100px]" 
                    value={formData.description} 
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                  />
                </div>
              </div>

              {/* Step 4: Contact Info */}
              <div className="card-elevated p-6">
                <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-sm">4</span>
                  Suas Informações
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label>Nome Completo</Label>
                    <Input required placeholder="Seu nome" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>E-mail</Label>
                    <Input required type="email" placeholder="seu@email.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Telefone / WhatsApp</Label>
                    <Input required placeholder="(00) 00000-0000" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                  </div>
                </div>
              </div>

              {/* Estimate and Submit */}
              <div className="card-elevated p-8 bg-accent/5 border-accent/20">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="text-center md:text-left">
                    <p className="text-sm text-muted-foreground mb-1">Estimativa aproximada</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-foreground">
                        {estimate ? `R$ ${estimate.toFixed(2)}` : '---'}
                      </span>
                      <span className="text-sm text-muted-foreground">/ total</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Valor sujeito a análise técnica do arquivo.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    <Button type="button" variant="outline" size="lg" onClick={calculateEstimate} disabled={!category || !formData.material || isCalculating}>
                      {isCalculating ? 'Calculando...' : 'Calcular Estimativa'}
                    </Button>
                    <Button type="submit" size="lg" className="bg-accent hover:bg-accent/90 text-white shadow-lg shadow-accent/20 group">
                      Enviar Pedido <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}
