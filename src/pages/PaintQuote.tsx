import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Camera, ArrowRight, Check, Info, Paintbrush, Bell, Shield, X } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const paintTypes = [
  { id: 'automotiva', name: 'Pintura Automotiva', description: 'Acabamento liso e brilhante, similar a pintura de carros' },
  { id: 'aerografia', name: 'Aerografia Artistica', description: 'Pintura detalhada com aerografo, ideal para figuras e personagens' },
  { id: 'verniz', name: 'Verniz de Protecao', description: 'Camada protetora transparente (fosco, brilhante ou acetinado)' },
  { id: 'texturizado', name: 'Texturizado', description: 'Acabamento com textura especial (soft-touch, emborrachado, etc.)' },
  { id: 'metalico', name: 'Metalico / Cromado', description: 'Efeito metalizado, cromado ou dourado' },
];

const finishTypes = [
  { id: 'fosco', name: 'Fosco' },
  { id: 'brilhante', name: 'Brilhante' },
  { id: 'acetinado', name: 'Acetinado' },
  { id: 'metalico', name: 'Metalico' },
];

export default function PaintQuote() {
  const { toast } = useToast();
  const [photos, setPhotos] = useState<{ file: File; preview: string }[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    paintType: '',
    finishType: '',
    colors: '',
    quantity: 1,
    dimensions: '',
    description: '',
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newPhotos = Array.from(e.target.files).map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }));
      setPhotos((prev) => [...prev, ...newPhotos]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.paintType) {
      toast({ title: "Campos obrigatorios", description: "Preencha nome, e-mail e tipo de pintura.", variant: "destructive" });
      return;
    }
    if (photos.length === 0) {
      toast({ title: "Fotos obrigatorias", description: "Envie pelo menos uma foto da peca para que os pintores possam avaliar.", variant: "destructive" });
      return;
    }
    toast({
      title: "Orcamento de pintura enviado!",
      description: "Sua solicitacao foi enviada como proposta para os pintores cadastrados na plataforma. Voce recebera propostas em breve.",
    });
  };

  return (
    <Layout>
      <section className="bg-primary py-16">
        <div className="container-custom">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
            <span className="inline-block text-accent font-semibold text-sm uppercase tracking-wider mb-4">Pintura Premium</span>
            <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-4">Orcamento de Pintura</h1>
            <p className="text-xl text-primary-foreground/80">
              Ja tem sua peca impressa em 3D? Envie fotos e receba propostas de pintores profissionais cadastrados na plataforma.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="bg-accent/5 border-b border-accent/10 py-4">
        <div className="container-custom flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2"><Camera className="w-4 h-4 text-accent" /><span>Envie fotos da peca</span></div>
          <div className="flex items-center gap-2"><Bell className="w-4 h-4 text-accent" /><span>Pintores recebem como proposta</span></div>
          <div className="flex items-center gap-2"><Shield className="w-4 h-4 text-accent" /><span>Pagamento seguro com intermediacao</span></div>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="card-elevated p-6">
                  <h2 className="text-xl font-semibold text-foreground mb-2">1. Fotos da peca impressa *</h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    Envie fotos de todos os angulos da peca. Quanto mais fotos, melhor sera a avaliacao dos pintores.
                    <strong className="text-foreground"> Minimo 1 foto obrigatoria.</strong>
                  </p>
                  <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-accent transition-colors cursor-pointer" onClick={() => document.getElementById('photo-upload')?.click()}>
                    <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-foreground font-medium mb-2">Clique para enviar fotos da peca</p>
                    <p className="text-muted-foreground text-sm">JPG, PNG ou WEBP - Maximo 10MB por foto</p>
                    <input id="photo-upload" type="file" multiple accept="image/*" onChange={handlePhotoChange} className="hidden" />
                  </div>
                  {photos.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                      {photos.map((photo, index) => (
                        <div key={index} className="relative group rounded-lg overflow-hidden aspect-square">
                          <img src={photo.preview} alt={`Foto ${index + 1}`} className="w-full h-full object-cover" />
                          <button type="button" onClick={() => removePhoto(index)} className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <X className="w-4 h-4" />
                          </button>
                          <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs text-center py-1">Foto {index + 1}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="card-elevated p-6">
                  <h2 className="text-xl font-semibold text-foreground mb-4">2. Tipo de pintura e acabamento</h2>
                  <div className="space-y-4">
                    <div>
                      <Label className="mb-3 block">Tipo de pintura *</Label>
                      <Select value={formData.paintType} onValueChange={(value) => setFormData({ ...formData, paintType: value })}>
                        <SelectTrigger><SelectValue placeholder="Selecione o tipo de pintura" /></SelectTrigger>
                        <SelectContent>
                          {paintTypes.map((type) => (
                            <SelectItem key={type.id} value={type.id}>
                              <div className="flex flex-col"><span>{type.name}</span><span className="text-xs text-muted-foreground">{type.description}</span></div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="mb-3 block">Acabamento</Label>
                        <Select value={formData.finishType} onValueChange={(value) => setFormData({ ...formData, finishType: value })}>
                          <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                          <SelectContent>
                            {finishTypes.map((finish) => (<SelectItem key={finish.id} value={finish.id}>{finish.name}</SelectItem>))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="mb-3 block">Quantidade de pecas</Label>
                        <Input type="number" min="1" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })} />
                      </div>
                    </div>
                    <div>
                      <Label className="mb-3 block">Cores desejadas</Label>
                      <Input placeholder="Ex: Vermelho metalico com detalhes em dourado" value={formData.colors} onChange={(e) => setFormData({ ...formData, colors: e.target.value })} />
                    </div>
                    <div>
                      <Label className="mb-3 block">Dimensoes da peca (opcional)</Label>
                      <Input placeholder="Ex: 15cm x 10cm x 8cm" value={formData.dimensions} onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })} />
                    </div>
                  </div>
                </div>

                <div className="card-elevated p-6">
                  <h2 className="text-xl font-semibold text-foreground mb-4">3. Detalhes adicionais</h2>
                  <Textarea placeholder="Descreva detalhes sobre a pintura desejada: referencias, cores especificas, areas que precisam de atencao especial..." rows={4} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                </div>

                <div className="card-elevated p-6">
                  <h2 className="text-xl font-semibold text-foreground mb-4">4. Seus dados</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div><Label className="mb-3 block">Nome completo *</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required /></div>
                    <div><Label className="mb-3 block">E-mail *</Label><Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required /></div>
                    <div><Label className="mb-3 block">WhatsApp</Label><Input type="tel" placeholder="(43) 9-9174-1518" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} /></div>
                  </div>
                </div>

                <Button type="submit" size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                  <Paintbrush className="mr-2 h-5 w-5" /> Enviar para Pintores <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </form>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                <div className="card-elevated p-6 bg-accent/5 border-accent/20">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2"><Info className="w-5 h-5 text-accent" /> Como funciona</h3>
                  <ul className="space-y-4 text-sm text-muted-foreground">
                    <li className="flex items-start gap-3"><div className="w-6 h-6 rounded-full bg-accent text-accent-foreground flex items-center justify-center flex-shrink-0 text-xs font-bold">1</div><span>Envie fotos da peca impressa e descreva a pintura desejada</span></li>
                    <li className="flex items-start gap-3"><div className="w-6 h-6 rounded-full bg-accent text-accent-foreground flex items-center justify-center flex-shrink-0 text-xs font-bold">2</div><span>Sua solicitacao aparece como <strong>notificacao/proposta</strong> para todos os pintores cadastrados</span></li>
                    <li className="flex items-start gap-3"><div className="w-6 h-6 rounded-full bg-accent text-accent-foreground flex items-center justify-center flex-shrink-0 text-xs font-bold">3</div><span>Pintores interessados enviam propostas com preco e prazo</span></li>
                    <li className="flex items-start gap-3"><div className="w-6 h-6 rounded-full bg-accent text-accent-foreground flex items-center justify-center flex-shrink-0 text-xs font-bold">4</div><span>Voce escolhe a melhor proposta e realiza o pagamento seguro</span></li>
                    <li className="flex items-start gap-3"><div className="w-6 h-6 rounded-full bg-accent text-accent-foreground flex items-center justify-center flex-shrink-0 text-xs font-bold">5</div><span>O pagamento fica retido ate voce confirmar o recebimento da peca pintada</span></li>
                  </ul>
                </div>

                <div className="card-elevated p-6">
                  <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2"><Shield className="w-5 h-5 text-green-500" /> Seguranca garantida</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2"><Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" /><span>Intermediacao total pela 3DKPRINT</span></li>
                    <li className="flex items-start gap-2"><Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" /><span>Pagamento retido ate confirmacao</span></li>
                    <li className="flex items-start gap-2"><Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" /><span>Pintores verificados e avaliados</span></li>
                    <li className="flex items-start gap-2"><Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" /><span>Suporte em caso de problemas</span></li>
                  </ul>
                </div>

                <div className="card-elevated p-6">
                  <h3 className="font-semibold text-foreground mb-3">Dicas para melhores propostas</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>Envie fotos de todos os angulos</li>
                    <li>Indique referencias visuais (links ou imagens)</li>
                    <li>Informe o material da peca (PLA, ABS, Resina)</li>
                    <li>Descreva cores e detalhes com precisao</li>
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
