import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Camera, Check, ArrowRight, Info, Paintbrush, Shield, X, FileText, Palette, Sparkles } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { useToast } from '@/hooks/use-toast';
import { salvarOrcamento } from '@/lib/dataStore';

const paintTypes = [
  { id: 'spray', name: 'Spray Básico', description: 'Pintura spray monocolor, cobertura uniforme', icon: '🎨' },
  { id: 'airbrush', name: 'Aerógrafo', description: 'Pintura com aerógrafo, gradientes e detalhes finos', icon: '✨' },
  { id: 'hand', name: 'Pintura à Mão', description: 'Pintura manual detalhada com pincel, ideal para miniaturas', icon: '🖌️' },
  { id: 'automotive', name: 'Automotiva', description: 'Pintura automotiva com primer, base e verniz PU', icon: '🚗' },
  { id: 'hydrographic', name: 'Hidrográfica', description: 'Impressão por transferência em água (water transfer)', icon: '💧' },
  { id: 'chrome', name: 'Cromado/Metalizado', description: 'Efeito espelhado cromado ou metalizado', icon: '🪞' },
];

const finishTypes = [
  'Fosco', 'Acetinado', 'Brilhante', 'Texturizado', 'Soft-touch', 'Verniz UV',
];

const materialTypes = [
  'PLA', 'PETG', 'ABS', 'Resina', 'Nylon', 'TPU', 'Outro',
];

export default function PaintQuote() {
  const { toast } = useToast();
  const [photos, setPhotos] = useState<File[]>([]);
  const [paintType, setPaintType] = useState('');
  const [finish, setFinish] = useState('');
  const [material, setMaterial] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    width: '', height: '', depth: '', unit: 'cm',
    quantity: '1', colors: '', description: '', references: '',
    name: '', email: '', whatsapp: '',
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setPhotos(prev => [...prev, ...newFiles]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !paintType) {
      toast({ title: "Campos obrigatórios", description: "Preencha todos os campos obrigatórios.", variant: "destructive" });
      return;
    }

    try {
      await salvarOrcamento({
        tipo: 'pintura',
        cliente: formData.name,
        email: formData.email,
        telefone: formData.whatsapp || 'Não informado',
        detalhes: {
          tipoPintura: paintType,
          acabamento: finish,
          material: material,
          dimensoes: `${formData.width}x${formData.height}x${formData.depth} ${formData.unit}`,
          quantidade: formData.quantity,
          cores: formData.colors,
          descricao: formData.description,
          referencias: formData.references,
          fotos: photos.map(p => p.name),
        },
      });

      setSubmitted(true);
      toast({ title: "Orçamento de pintura enviado!", description: "Nossa equipe de pintura analisará e retornará em até 48h." });
    } catch (error) {
      toast({ title: "Erro", description: "Falha ao enviar. Tente novamente.", variant: "destructive" });
    }
  };

  if (submitted) {
    return (
      <Layout>
        <section className="py-20 bg-slate-50 min-h-screen flex items-center">
          <div className="container mx-auto px-4">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-lg mx-auto text-center bg-white rounded-3xl shadow-xl p-10">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-3">Orçamento de Pintura Enviado!</h2>
              <p className="text-slate-600 mb-6">Nossa equipe especializada em pintura e acabamento analisará sua peça e enviará o orçamento detalhado em até 48 horas.</p>
              <a href="/orcamento" className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors">
                Fazer outro orçamento <ArrowRight className="w-4 h-4" />
              </a>
            </motion.div>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-purple-900 via-violet-900 to-purple-900 py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-purple-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-pink-500 rounded-full blur-3xl"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-purple-500/20 text-purple-300 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">Pintura Premium</span>
              <span className="bg-pink-500/20 text-pink-300 text-xs font-bold px-3 py-1.5 rounded-full">Acabamento Profissional</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Pintura e <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Acabamento Premium</span>
            </h1>
            <p className="text-xl text-purple-200">
              Transforme sua peça impressa em 3D em uma obra de arte. Pintura profissional com técnicas avançadas de aerógrafo, spray automotivo e acabamento premium.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-12 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Photos Upload */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
                  <h2 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-3">
                    <span className="bg-purple-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                    Fotos da Peça *
                  </h2>
                  <p className="text-slate-500 text-sm mb-6 ml-11">Envie fotos de todos os ângulos da peça que deseja pintar</p>

                  <div 
                    className="border-2 border-dashed border-purple-300 rounded-2xl p-10 text-center hover:border-purple-400 hover:bg-purple-50/30 transition-all cursor-pointer group"
                    onClick={() => document.getElementById('photo-upload')?.click()}
                  >
                    <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 transition-colors">
                      <Camera className="w-8 h-8 text-purple-600" />
                    </div>
                    <p className="text-slate-800 font-semibold text-lg mb-1">Envie fotos da peça</p>
                    <p className="text-slate-400 text-sm">JPG, PNG, WEBP — Fotos de todos os ângulos</p>
                    <input id="photo-upload" type="file" multiple accept="image/*" onChange={handlePhotoChange} className="hidden" />
                  </div>

                  {photos.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {photos.map((photo, index) => (
                        <div key={index} className="relative group rounded-xl overflow-hidden border border-slate-200">
                          <img src={URL.createObjectURL(photo)} alt={photo.name} className="w-full h-32 object-cover" />
                          <button type="button" onClick={() => removePhoto(index)} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                            <X className="w-3 h-3" />
                          </button>
                          <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-2 py-1">
                            <span className="text-white text-xs truncate block">{photo.name}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Dimensions */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
                  <h2 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-3">
                    <span className="bg-purple-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                    Dimensões e Material
                  </h2>
                  <p className="text-slate-500 text-sm mb-6 ml-11">Informe as dimensões aproximadas da peça</p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Largura</label>
                      <div className="flex">
                        <input type="number" value={formData.width} onChange={(e) => setFormData({ ...formData, width: e.target.value })} placeholder="0" className="w-full px-3 py-2.5 border border-slate-300 rounded-l-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
                        <span className="bg-slate-100 border border-l-0 border-slate-300 px-3 py-2.5 rounded-r-lg text-sm text-slate-500">{formData.unit}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Altura</label>
                      <div className="flex">
                        <input type="number" value={formData.height} onChange={(e) => setFormData({ ...formData, height: e.target.value })} placeholder="0" className="w-full px-3 py-2.5 border border-slate-300 rounded-l-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
                        <span className="bg-slate-100 border border-l-0 border-slate-300 px-3 py-2.5 rounded-r-lg text-sm text-slate-500">{formData.unit}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Profundidade</label>
                      <div className="flex">
                        <input type="number" value={formData.depth} onChange={(e) => setFormData({ ...formData, depth: e.target.value })} placeholder="0" className="w-full px-3 py-2.5 border border-slate-300 rounded-l-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
                        <span className="bg-slate-100 border border-l-0 border-slate-300 px-3 py-2.5 rounded-r-lg text-sm text-slate-500">{formData.unit}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Unidade</label>
                      <select value={formData.unit} onChange={(e) => setFormData({ ...formData, unit: e.target.value })} className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                        <option value="cm">Centímetros</option>
                        <option value="mm">Milímetros</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Material da peça</label>
                      <select value={material} onChange={(e) => setMaterial(e.target.value)} className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                        <option value="">Selecione...</option>
                        {materialTypes.map((m) => (<option key={m} value={m}>{m}</option>))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Quantidade</label>
                      <input type="number" min="1" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
                    </div>
                  </div>
                </div>

                {/* Paint Type */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
                  <h2 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-3">
                    <span className="bg-purple-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">3</span>
                    Tipo de Pintura *
                  </h2>

                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
                    {paintTypes.map((type) => (
                      <button key={type.id} type="button" onClick={() => setPaintType(type.id)}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${paintType === type.id ? 'border-purple-600 bg-purple-50 shadow-md ring-2 ring-purple-200' : 'border-slate-200 hover:border-purple-300 hover:bg-slate-50'}`}>
                        <div className="text-2xl mb-2">{type.icon}</div>
                        <h3 className="font-bold text-slate-900 text-sm mb-1">{type.name}</h3>
                        <p className="text-xs text-slate-500">{type.description}</p>
                      </button>
                    ))}
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Acabamento</label>
                      <select value={finish} onChange={(e) => setFinish(e.target.value)} className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                        <option value="">Selecione...</option>
                        {finishTypes.map((f) => (<option key={f} value={f}>{f}</option>))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Cores desejadas</label>
                      <input type="text" value={formData.colors} onChange={(e) => setFormData({ ...formData, colors: e.target.value })} placeholder="Ex: Vermelho metálico com detalhes dourados" className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
                  <h2 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-3">
                    <span className="bg-purple-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">4</span>
                    Detalhes da Pintura
                  </h2>
                  <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Descreva detalhes: referências visuais, cores específicas, áreas de atenção, efeitos desejados..." className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none" rows={4} />
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Links de referência visual (opcional)</label>
                    <input type="text" value={formData.references} onChange={(e) => setFormData({ ...formData, references: e.target.value })} placeholder="Cole links de imagens com referências..." className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
                  </div>
                </div>

                {/* Contact */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
                  <h2 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-3">
                    <span className="bg-purple-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">5</span>
                    Seus Dados
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Nome completo *</label>
                      <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Seu nome" className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">E-mail *</label>
                      <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="seu@email.com" className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" required />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1">WhatsApp</label>
                      <input type="tel" value={formData.whatsapp} onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })} placeholder="(43) 9-9174-1518" className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
                    </div>
                  </div>
                </div>

                <button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-4 rounded-2xl font-bold text-lg hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2">
                  <Paintbrush className="w-5 h-5" /> Solicitar Orçamento de Pintura <ArrowRight className="w-5 h-5" />
                </button>
              </form>
            </motion.div>

            {/* Sidebar */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                <div className="bg-white rounded-2xl border border-purple-200 shadow-sm p-6">
                  <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Palette className="w-5 h-5 text-purple-600" /> Nossos Acabamentos
                  </h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-purple-50 rounded-xl">
                      <p className="font-bold text-sm text-slate-800">Spray Básico</p>
                      <p className="text-xs text-slate-500">Cobertura uniforme monocolor, ideal para peças simples</p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-xl">
                      <p className="font-bold text-sm text-slate-800">Aerógrafo Profissional</p>
                      <p className="text-xs text-slate-500">Gradientes, sombreamento e detalhes finos com aerógrafo</p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-xl">
                      <p className="font-bold text-sm text-slate-800">Automotiva Premium</p>
                      <p className="text-xs text-slate-500">Primer + base + verniz PU, acabamento de carro</p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-xl">
                      <p className="font-bold text-sm text-slate-800">Cromado / Metalizado</p>
                      <p className="text-xs text-slate-500">Efeito espelhado cromado ou metalizado real</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                  <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Info className="w-5 h-5 text-purple-600" /> Como funciona
                  </h3>
                  <ul className="space-y-4 text-sm">
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">1</div>
                      <span className="text-slate-600">Envie fotos da peça e descreva a pintura desejada</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">2</div>
                      <span className="text-slate-600">Nossa equipe analisa e envia o orçamento em até 48h</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">3</div>
                      <span className="text-slate-600">Aprovado, você envia a peça e iniciamos a pintura</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">4</div>
                      <span className="text-slate-600">Peça pintada é enviada com embalagem especial</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                  <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-yellow-500" /> Dicas para melhor resultado
                  </h3>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li className="flex items-start gap-2"><Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" /> Envie fotos de todos os ângulos</li>
                    <li className="flex items-start gap-2"><Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" /> Indique referências visuais (links ou imagens)</li>
                    <li className="flex items-start gap-2"><Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" /> Informe o material da peça (PLA, ABS, Resina)</li>
                    <li className="flex items-start gap-2"><Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" /> Descreva cores e detalhes com precisão</li>
                    <li className="flex items-start gap-2"><Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" /> Peças lixadas recebem melhor acabamento</li>
                  </ul>
                </div>

                <div className="bg-gradient-to-br from-purple-800 to-purple-900 rounded-2xl p-6 text-white">
                  <h4 className="font-bold text-lg mb-2">Dúvidas sobre pintura?</h4>
                  <p className="text-sm text-purple-300 mb-4">Fale com nosso especialista em acabamento e pintura de peças 3D.</p>
                  <a href="https://wa.me/5543991741518?text=Olá! Tenho dúvidas sobre pintura de peças 3D." target="_blank" rel="noopener noreferrer" className="block w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold text-center transition-colors">
                    Falar com Especialista
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
