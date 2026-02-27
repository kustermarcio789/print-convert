import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Box, Trash2, CheckCircle, Info, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { salvarOrcamento, incrementarOrcamentosUsuario } from '@/lib/dataStore';

// Tipagem para o model-viewer
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
    id: 'pla', name: 'PLA', description: 'Biodegradável, fácil de imprimir',
    priceMultiplier: 1,
    colors: [
      { id: 'branco', name: 'Branco', hex: '#FFFFFF' },
      { id: 'preto', name: 'Preto', hex: '#1a1a1a' },
      { id: 'vermelho', name: 'Vermelho', hex: '#DC2626' },
      { id: 'azul', name: 'Azul', hex: '#2563EB' },
    ],
  },
  {
    id: 'petg', name: 'PETG', description: 'Resistente e durável',
    priceMultiplier: 1.2,
    colors: [
      { id: 'preto', name: 'Preto', hex: '#1a1a1a' },
      { id: 'branco', name: 'Branco', hex: '#FFFFFF' },
      { id: 'transparente', name: 'Transparente', hex: '#E5E7EB' },
    ],
  }
];

const resinMaterials: MaterialInfo[] = [
  {
    id: 'standard', name: 'Resina Standard', description: 'Alta resolução',
    priceMultiplier: 1.2,
    colors: [
      { id: 'cinza', name: 'Cinza', hex: '#6B7280' },
      { id: 'transparente', name: 'Transparente', hex: '#E5E7EB' },
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
    if (!formData.email || !category) {
      toast({ title: "Campos obrigatórios", description: "Preencha seu e-mail e escolha a tecnologia.", variant: "destructive" });
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Em um cenário real, você faria o upload para o Supabase Storage aqui
      // Para este MVP, vamos simular o link com o nome do arquivo
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
          arquivos: fileLinks, // Enviando os links dos arquivos para o Admin
        },
      });
      await incrementarOrcamentosUsuario(formData.email);
      navigate('/orcamento-sucesso');
    } catch (error) {
      console.error('Erro ao enviar orçamento:', error);
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
          <p className="opacity-80">Envie seu arquivo e receba uma estimativa profissional.</p>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-8">
              <div className="card-elevated p-6">
                <h2 className="text-xl font-semibold mb-4">1. Arquivo 3D</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div 
                      className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-accent cursor-pointer bg-muted/30"
                      onClick={() => document.getElementById('file-upload')?.click()}
                    >
                      <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm font-medium">Clique para fazer upload</p>
                      <p className="text-xs text-muted-foreground">STL, OBJ, 3MF</p>
                      <input id="file-upload" type="file" multiple accept=".stl,.obj,.3mf" onChange={handleFileChange} className="hidden" />
                    </div>
                    {files.map((file, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-secondary rounded-lg text-xs">
                        <span className="truncate max-w-[150px]">{file.name}</span>
                        <button onClick={() => removeFile(i)} className="text-red-500"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    ))}
                  </div>

                  <div className="bg-muted rounded-xl aspect-square flex items-center justify-center overflow-hidden border">
                    {modelUrl ? (
                      <model-viewer
                        src={modelUrl}
                        alt="Preview 3D"
                        auto-rotate
                        camera-controls
                        shadow-intensity="1"
                        style={{ width: '100%', height: '100%' }}
                      ></model-viewer>
                    ) : (
                      <div className="text-center text-muted-foreground">
                        <Box className="w-12 h-12 mx-auto mb-2 opacity-20" />
                        <p className="text-xs">Aguardando arquivo...</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="card-elevated p-6">
                <h2 className="text-xl font-semibold mb-4">2. Detalhes Técnicos</h2>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <Button variant={category === 'fdm' ? 'default' : 'outline'} onClick={() => setCategory('fdm')}>Filamento (FDM)</Button>
                  <Button variant={category === 'resina' ? 'default' : 'outline'} onClick={() => setCategory('resina')}>Resina (SLA)</Button>
                </div>

                {category && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Material</Label>
                      <Select value={formData.material} onValueChange={v => setFormData({...formData, material: v})}>
                        <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                        <SelectContent>
                          {currentMaterials.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Cor</Label>
                      <Select value={selectedColor} onValueChange={setSelectedColor}>
                        <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                        <SelectContent>
                          {selectedMaterial?.colors.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>

              <div className="card-elevated p-6">
                <h2 className="text-xl font-semibold mb-4">3. Seus Dados</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nome</Label>
                    <Input placeholder="Seu Nome" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>E-mail</Label>
                    <Input type="email" placeholder="Seu E-mail" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                  </div>
                </div>
                <Button onClick={handleSubmit} className="w-full mt-6 bg-accent text-white" disabled={isSubmitting}>
                  {isSubmitting ? 'Enviando...' : 'Enviar Pedido de Orçamento'}
                </Button>
              </div>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader><CardTitle className="text-lg">Por que escolher a 3DKPRINT?</CardTitle></CardHeader>
                <CardContent className="text-sm space-y-4">
                  <div className="flex gap-3"><CheckCircle className="w-5 h-5 text-green-500" /> <p>Análise técnica de arquivos</p></div>
                  <div className="flex gap-3"><CheckCircle className="w-5 h-5 text-green-500" /> <p>Materiais de alta performance</p></div>
                  <div className="flex gap-3"><CheckCircle className="w-5 h-5 text-green-500" /> <p>Entrega rápida em todo Brasil</p></div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
