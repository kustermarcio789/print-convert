import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, X, Check, AlertCircle, ArrowRight, File } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const acceptedFormats = [
  { ext: '.STL', desc: 'Stereolithography' },
  { ext: '.OBJ', desc: 'Wavefront Object' },
  { ext: '.3MF', desc: '3D Manufacturing' },
  { ext: '.STEP', desc: 'CAD Exchange' },
  { ext: '.IGES', desc: 'CAD Exchange' },
  { ext: '.FBX', desc: 'Autodesk FBX' },
  { ext: '.PLY', desc: 'Polygon File' },
  { ext: '.AMF', desc: 'Additive Manufacturing' },
];

interface UploadedFile {
  name: string;
  size: string;
  format: string;
}

export default function UploadFile() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    material: '',
    quantity: '1',
    notes: '',
  });

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleFileSelect = (fileList: FileList | null) => {
    if (!fileList) return;
    const newFiles: UploadedFile[] = [];
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const ext = file.name.split('.').pop()?.toUpperCase() || '';
      newFiles.push({
        name: file.name,
        size: formatFileSize(file.size),
        format: ext,
      });
    }
    setFiles([...files, ...newFiles]);
    toast({
      title: `${newFiles.length} arquivo(s) adicionado(s)`,
      description: 'Os arquivos foram carregados com sucesso.',
    });
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) {
      toast({
        title: 'Nenhum arquivo selecionado',
        description: 'Por favor, adicione pelo menos um arquivo 3D.',
        variant: 'destructive',
      });
      return;
    }
    if (!formData.name || !formData.email) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Por favor, preencha nome e e-mail.',
        variant: 'destructive',
      });
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: 'Arquivo(s) enviado(s) com sucesso!',
        description: 'Você receberá o orçamento por e-mail em até 24 horas.',
      });
      setFiles([]);
      setFormData({ name: '', email: '', phone: '', material: '', quantity: '1', notes: '' });
    }, 2000);
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
              Enviar Arquivo
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-6">
              Envie seu arquivo 3D
            </h1>
            <p className="text-xl text-primary-foreground/80">
              Faça upload do seu arquivo 3D e receba um orçamento personalizado. 
              Aceitamos STL, OBJ, 3MF, STEP e outros formatos.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Upload Area + Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Drop Zone */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
                      isDragging
                        ? 'border-accent bg-accent/5'
                        : 'border-border hover:border-accent/50 hover:bg-muted/50'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept=".stl,.obj,.3mf,.step,.stp,.iges,.igs,.fbx,.ply,.amf"
                      onChange={(e) => handleFileSelect(e.target.files)}
                      className="hidden"
                    />
                    <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragging ? 'text-accent' : 'text-muted-foreground'}`} />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {isDragging ? 'Solte os arquivos aqui' : 'Arraste seus arquivos ou clique para selecionar'}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Formatos aceitos: STL, OBJ, 3MF, STEP, IGES, FBX, PLY, AMF
                    </p>
                    <p className="text-muted-foreground text-xs mt-2">
                      Tamanho máximo: 100MB por arquivo
                    </p>
                  </div>
                </motion.div>

                {/* File List */}
                {files.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-3"
                  >
                    <h3 className="text-sm font-semibold text-foreground">Arquivos selecionados ({files.length})</h3>
                    {files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                            <File className="w-5 h-5 text-accent" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-foreground">{file.name}</div>
                            <div className="text-xs text-muted-foreground">{file.format} — {file.size}</div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </motion.div>
                )}

                {/* Contact Info */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="space-y-4"
                >
                  <h3 className="text-lg font-semibold text-foreground">Seus dados</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Nome completo *</Label>
                      <Input
                        id="name"
                        placeholder="Seu nome"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">E-mail *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">WhatsApp</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="(43) 9174-1518"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="quantity">Quantidade</Label>
                      <Input
                        id="quantity"
                        type="number"
                        min="1"
                        placeholder="1"
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="material">Material preferido</Label>
                    <select
                      id="material"
                      value={formData.material}
                      onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                    >
                      <option value="">Selecione o material (opcional)</option>
                      <option value="pla">PLA</option>
                      <option value="petg">PETG</option>
                      <option value="abs">ABS</option>
                      <option value="asa">ASA</option>
                      <option value="nylon">Nylon</option>
                      <option value="tpu">TPU (Flexível)</option>
                      <option value="resina">Resina (SLA)</option>
                      <option value="outro">Outro / Não sei</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="notes">Observações</Label>
                    <textarea
                      id="notes"
                      rows={3}
                      placeholder="Descreva detalhes do projeto, acabamento desejado, cor, etc."
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm resize-none"
                    />
                  </div>
                </motion.div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Enviando...' : 'Enviar e solicitar orçamento'}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </form>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Accepted Formats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="card-elevated p-6"
              >
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-accent" />
                  Formatos aceitos
                </h3>
                <div className="space-y-2">
                  {acceptedFormats.map((format) => (
                    <div key={format.ext} className="flex items-center justify-between py-1.5">
                      <span className="text-sm font-medium text-foreground">{format.ext}</span>
                      <span className="text-xs text-muted-foreground">{format.desc}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* How it works */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="card-elevated p-6"
              >
                <h3 className="text-lg font-semibold text-foreground mb-4">Como funciona</h3>
                <div className="space-y-4">
                  {[
                    { step: '1', text: 'Envie seu arquivo 3D' },
                    { step: '2', text: 'Analisamos e calculamos o orçamento' },
                    { step: '3', text: 'Você recebe o valor por e-mail' },
                    { step: '4', text: 'Aprovando, iniciamos a produção' },
                  ].map((item) => (
                    <div key={item.step} className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-accent">{item.step}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{item.text}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Tips */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="card-elevated p-6 border-accent/20"
              >
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-accent" />
                  Dicas
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                    Verifique se o modelo está em escala correta (mm)
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                    Modelos watertight geram melhores resultados
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                    Informe a cor e acabamento desejados nas observações
                  </li>
                </ul>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
