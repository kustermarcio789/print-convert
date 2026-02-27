import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Box, Trash2, CheckCircle, Info, AlertCircle, LogIn } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { salvarOrcamento, incrementarOrcamentosUsuario, getUsuarioByEmail } from '@/lib/dataStore';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': any;
    }
  }
}

type PrintCategory = 'fdm' | 'resina';

interface MaterialInfo {
  id: string;
  name: string;
  description: string;
  priceMultiplier: number;
  colors: { id: string; name: string; hex: string }[];
}

const fdmMaterials: MaterialInfo[] = [
  {
    id: 'pla', name: 'PLA Premium', description: 'Biodegradável, excelente acabamento visual',
    priceMultiplier: 1,
    colors: [
      { id: 'branco', name: 'Branco Neve', hex: '#FFFFFF' },
      { id: 'preto', name: 'Preto Ebony', hex: '#1a1a1a' },
      { id: 'vermelho', name: 'Vermelho Ferrari', hex: '#DC2626' },
      { id: 'azul', name: 'Azul Royal', hex: '#2563EB' },
      { id: 'verde', name: 'Verde Neon', hex: '#22C55E' },
      { id: 'cinza', name: 'Cinza Espacial', hex: '#6B7280' },
    ],
  },
  {
    id: 'petg', name: 'PETG Industrial', description: 'Resistente a impactos e temperatura',
    priceMultiplier: 1.2,
    colors: [
      { id: 'preto', name: 'Preto Sólido', hex: '#1a1a1a' },
      { id: 'branco', name: 'Branco Opaco', hex: '#FFFFFF' },
      { id: 'transparente', name: 'Cristal Transparente', hex: '#E5E7EB' },
      { id: 'azul-trans', name: 'Azul Translúcido', hex: '#60A5FA' },
    ],
  },
  {
    id: 'abs', name: 'ABS High-Strength', description: 'Alta resistência mecânica, permite lixamento',
    priceMultiplier: 1.1,
    colors: [
      { id: 'preto', name: 'Preto Fosco', hex: '#1a1a1a' },
      { id: 'cinza', name: 'Cinza Primer', hex: '#9CA3AF' },
    ],
  },
  {
    id: 'tpu', name: 'TPU Flexível', description: 'Material elástico tipo borracha',
    priceMultiplier: 1.5,
    colors: [
      { id: 'preto', name: 'Preto Flex', hex: '#1a1a1a' },
      { id: 'vermelho', name: 'Vermelho Flex', hex: '#EF4444' },
    ],
  }
];

const resinMaterials: MaterialInfo[] = [
  {
    id: 'standard', name: 'Resina Standard 8K', description: 'Extrema resolução para miniaturas',
    priceMultiplier: 1.3,
    colors: [
      { id: 'cinza', name: 'Cinza 8K', hex: '#6B7280' },
      { id: 'aqua-blue', name: 'Aqua Blue', hex: '#A5F3FC' },
    ],
  },
  {
    id: 'tough', name: 'Resina Tough (ABS-Like)', description: 'Resistente e menos quebradiça',
    priceMultiplier: 1.6,
    colors: [
      { id: 'preto', name: 'Preto Industrial', hex: '#1a1a1a' },
      { id: 'branco', name: 'Branco Técnico', hex: '#FFFFFF' },
    ],
  },
  {
    id: 'clear', name: 'Resina Ultra Clear', description: 'Transparência cristalina após polimento',
    priceMultiplier: 1.8,
    colors: [
      { id: 'clear', name: 'Cristal', hex: '#F3F4F6' },
    ],
  }
];

export default function Quote() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [category, setCategory] = useState<PrintCategory | ''>('');
  const [files, setFiles] = useState<File[]>([]);
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userExists, setUserExists] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    material: '',
    quantity: 1,
    description: '',
  });

  const [selectedColor, setSelectedColor] = useState('');
  const currentMaterials = category === 'fdm' ? fdmMaterials : resinMaterials;
  const selectedMaterial = currentMaterials.find((m) => m.id === formData.material);

  useEffect(() => {
    if (selectedMaterial && !selectedMaterial.colors.find(c => c.id === selectedColor)) {
      setSelectedColor(selectedMaterial.colors[0].id);
    }
  }, [formData.material, selectedMaterial, selectedColor]);

  // Verificar se usuário existe ao digitar e-mail
  useEffect(() => {
    const checkUser = async () => {
      if (formData.email.includes('@')) {
        const user = await getUsuarioByEmail(formData.email);
        setUserExists(!!user);
      }
    };
    const timer = setTimeout(checkUser, 500);
    return () => clearTimeout(timer);
  }, [formData.email]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setFiles([...files, ...newFiles]);
      const file = newFiles[0];
      if (modelUrl) URL.revokeObjectURL(modelUrl);
      const url = URL.createObjectURL(file);
      setModelUrl(url);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    if (newFiles.length === 0) {
      if (modelUrl) URL.revokeObjectURL(modelUrl);
      setModelUrl(null);
    } else {
      const url = URL.createObjectURL(newFiles[0]);
      setModelUrl(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !category || !formData.material) {
      toast({ title: "Campos obrigatórios", description: "Preencha seu e-mail, escolha a tecnologia e o material.", variant: "destructive" });
      return;
    }
    
    setIsSubmitting(true);
    try {
      const fileLinks = files.map(f => `https://3dkprint.com.br/files/${f.name}`);

      await salvarOrcamento({
        tipo: 'impressao',
        cliente: formData.name || 'Cliente Site',
        email: formData.email,
        telefone: formData.phone || 'Não informado',
        detalhes: {
          categoria: category,
          material: formData.material,
          cor: selectedColor,
          quantidade: formData.quantity,
          descricao: formData.description,
          arquivos: fileLinks,
        },
      });
      await incrementarOrcamentosUsuario(formData.email);
      
      if (userExists) {
        toast({ title: "Orçamento Enviado!", description: "Como você já tem conta, faça login para acompanhar." });
        navigate('/login', { state: { message: "Orçamento enviado! Faça login para acompanhar o status." } });
      } else {
        navigate('/orcamento-sucesso');
      }
    } catch (error) {
      toast({ title: "Erro", description: "Falha ao enviar orçamento.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <section className="bg-primary py-12">
        <div className="container-custom text-white">
          <h1 className="text-3xl font-bold">Solicitar Orçamento</h1>
          <p className="opacity-80">Escolha o material, cor e tecnologia ideal para seu projeto.</p>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-8">
              {/* 1. Arquivo */}
              <div className="card-elevated p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-accent text-white rounded-full flex items-center justify-center text-sm">1</span>
                  Arquivo 3D
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div 
                      className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-accent cursor-pointer bg-muted/30 transition-colors"
                      onClick={() => document.getElementById('file-upload')?.click()}
                    >
                      <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm font-medium">Arraste ou clique para upload</p>
                      <p className="text-xs text-muted-foreground">STL, OBJ, 3MF (Máx 50MB)</p>
                      <input id="file-upload" type="file" multiple accept=".stl,.obj,.3mf" onChange={handleFileChange} className="hidden" />
                    </div>
                    {files.map((file, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-secondary rounded-lg border border-border">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <Box className="w-4 h-4 text-accent flex-shrink-0" />
                          <span className="truncate text-sm">{file.name}</span>
                        </div>
                        <button onClick={() => removeFile(i)} className="text-red-500 hover:bg-red-50 p-1 rounded"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    ))}
                  </div>

                  <div className="bg-slate-900 rounded-xl aspect-square flex items-center justify-center overflow-hidden border-2 border-slate-800 shadow-inner">
                    {modelUrl ? (
                      <model-viewer
                        src={modelUrl}
                        alt="Preview 3D"
                        auto-rotate
                        camera-controls
                        shadow-intensity="1"
                        environment-image="neutral"
                        exposure="1"
                        style={{ width: '100%', height: '100%' }}
                      ></model-viewer>
                    ) : (
                      <div className="text-center text-slate-500">
                        <Box className="w-12 h-12 mx-auto mb-2 opacity-20" />
                        <p className="text-xs">A visualização 3D aparecerá aqui</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 2. Tecnologia e Material */}
              <div className="card-elevated p-6">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 bg-accent text-white rounded-full flex items-center justify-center text-sm">2</span>
                  Tecnologia e Material
                </h2>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => {setCategory('fdm'); setFormData({...formData, material: ''})}}
                      className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${category === 'fdm' ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/30'}`}
                    >
                      <Layers className={`w-6 h-6 ${category === 'fdm' ? 'text-accent' : 'text-muted-foreground'}`} />
                      <span className="font-bold">Filamento (FDM)</span>
                    </button>
                    <button 
                      onClick={() => {setCategory('resina'); setFormData({...formData, material: ''})}}
                      className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${category === 'resina' ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/30'}`}
                    >
                      <Box className={`w-6 h-6 ${category === 'resina' ? 'text-accent' : 'text-muted-foreground'}`} />
                      <span className="font-bold">Resina (SLA)</span>
                    </button>
                  </div>

                  {category && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-muted/30 rounded-xl">
                      <div className="space-y-2">
                        <Label className="font-bold">Tipo de Material</Label>
                        <Select value={formData.material} onValueChange={v => setFormData({...formData, material: v})}>
                          <SelectTrigger className="bg-white"><SelectValue placeholder="Selecione o material" /></SelectTrigger>
                          <SelectContent>
                            {currentMaterials.map(m => (
                              <SelectItem key={m.id} value={m.id}>
                                <div className="flex flex-col">
                                  <span className="font-bold">{m.name}</span>
                                  <span className="text-[10px] text-muted-foreground">{m.description}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="font-bold">Cor Disponível</Label>
                        <div className="flex flex-wrap gap-2">
                          {selectedMaterial?.colors.map(color => (
                            <button
                              key={color.id}
                              onClick={() => setSelectedColor(color.id)}
                              className={`w-8 h-8 rounded-full border-2 transition-all ${selectedColor === color.id ? 'border-accent scale-110' : 'border-white'}`}
                              style={{ backgroundColor: color.hex }}
                              title={color.name}
                            />
                          ))}
                        </div>
                        <p className="text-[10px] text-muted-foreground font-medium">
                          Cor selecionada: <span className="text-foreground">{selectedMaterial?.colors.find(c => c.id === selectedColor)?.name || 'Nenhuma'}</span>
                        </p>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* 3. Identificação */}
              <div className="card-elevated p-6">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 bg-accent text-white rounded-full flex items-center justify-center text-sm">3</span>
                  Seus Dados
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>E-mail</Label>
                    <Input type="email" placeholder="seu@email.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Nome Completo</Label>
                    <Input placeholder="Como podemos te chamar?" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                  </div>
                </div>

                {userExists && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-center gap-3 text-sm text-blue-700">
                    <LogIn className="w-4 h-4" />
                    <p>Identificamos sua conta! Após enviar, você poderá fazer login para acompanhar.</p>
                  </div>
                )}

                <Button onClick={handleSubmit} className="w-full mt-8 bg-accent text-white h-12 text-lg font-bold" disabled={isSubmitting}>
                  {isSubmitting ? 'Processando...' : 'Enviar Solicitação de Orçamento'}
                </Button>
              </div>
            </div>

            {/* Sidebar Informativa */}
            <div className="space-y-6">
              <Card className="border-accent/20 bg-accent/5">
                <CardHeader><CardTitle className="text-lg">Dicas de Orçamento</CardTitle></CardHeader>
                <CardContent className="text-sm space-y-4">
                  <div className="flex gap-3"><CheckCircle className="w-5 h-5 text-accent" /> <p><b>FDM:</b> Ideal para peças grandes e funcionais.</p></div>
                  <div className="flex gap-3"><CheckCircle className="w-5 h-5 text-accent" /> <p><b>Resina:</b> Melhor para miniaturas e detalhes finos.</p></div>
                  <div className="flex gap-3"><CheckCircle className="w-5 h-5 text-accent" /> <p><b>Cores:</b> Se precisar de uma cor específica não listada, descreva nos detalhes.</p></div>
                </CardContent>
              </Card>
              
              <div className="p-6 bg-slate-900 text-white rounded-2xl">
                <h4 className="font-bold mb-2">Precisa de ajuda?</h4>
                <p className="text-xs opacity-70 mb-4">Nossa equipe técnica pode te ajudar a escolher o melhor material para seu projeto.</p>
                <Button asChild variant="outline" className="w-full border-white/20 hover:bg-white/10 text-white">
                  <a href="https://wa.me/5543991741518">Falar com Especialista</a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
