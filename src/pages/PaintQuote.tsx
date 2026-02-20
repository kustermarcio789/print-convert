import { useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { Camera, ArrowRight, CheckCircle, Info, Shield, X, Ruler, Paintbrush, Bell, Check } from 'lucide-react';

const objectTypes = [
  { id: 'action-figure', name: 'Action Figure / Personagem', description: 'Figuras de ação, personagens de jogos, anime, filmes' },
  { id: 'busto', name: 'Busto / Escultura', description: 'Bustos, esculturas artísticas, decoração' },
  { id: 'miniatura', name: 'Miniatura / RPG', description: 'Miniaturas para jogos de mesa, RPG, wargames' },
  { id: 'prototipo', name: 'Protótipo / Peça Funcional', description: 'Protótipos, peças industriais, cases, suportes' },
  { id: 'cosplay', name: 'Cosplay / Prop', description: 'Armaduras, capacetes, armas, acessórios de cosplay' },
  { id: 'decoracao', name: 'Decoração / Vaso / Luminária', description: 'Objetos decorativos, vasos, luminárias, porta-retratos' },
  { id: 'maquete', name: 'Maquete / Arquitetura', description: 'Maquetes arquitetônicas, modelos em escala' },
  { id: 'outro', name: 'Outro', description: 'Outro tipo de objeto não listado' },
];

const paintTypes = [
  { id: 'automotiva', name: 'Pintura Automotiva', description: 'Acabamento liso e brilhante, similar a pintura de carros' },
  { id: 'aerografia', name: 'Aerografia Artística', description: 'Pintura detalhada com aerógrafo, ideal para figuras e personagens' },
  { id: 'verniz', name: 'Verniz de Proteção', description: 'Camada protetora transparente (fosco, brilhante ou acetinado)' },
  { id: 'texturizado', name: 'Texturizado', description: 'Acabamento com textura especial (soft-touch, emborrachado, etc.)' },
  { id: 'metalico', name: 'Metálico / Cromado', description: 'Efeito metalizado, cromado ou dourado' },
  { id: 'pincel', name: 'Pintura a Pincel (Detalhamento)', description: 'Pintura manual detalhada para miniaturas e figuras pequenas' },
];

const finishTypes = ['Fosco', 'Brilhante', 'Acetinado', 'Metálico', 'Semi-brilho'];

const materialTypes = ['PLA', 'PETG', 'ABS', 'Resina (SLA/DLP)', 'Nylon', 'TPU', 'Não sei'];

export default function PaintQuote() {
  const [photos, setPhotos] = useState<{ name: string; url: string }[]>([]);
  const [objectType, setObjectType] = useState('');
  const [paintType, setPaintType] = useState('');
  const [finish, setFinish] = useState('');
  const [material, setMaterial] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    colors: '',
    quantity: '1',
    width: '',
    height: '',
    depth: '',
    unit: 'cm',
    description: '',
    references: '',
    name: '',
    email: '',
    whatsapp: '',
  });

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newPhotos = Array.from(files).map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
    }));
    setPhotos((prev) => [...prev, ...newPhotos].slice(0, 10));
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!objectType) { alert('Selecione o que deseja pintar.'); return; }
    if (!paintType) { alert('Selecione o tipo de pintura.'); return; }
    if (photos.length === 0) { alert('Envie pelo menos uma foto da peça.'); return; }
    if (!formData.name || !formData.email) { alert('Preencha nome e e-mail.'); return; }
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900 text-white py-20">
        <div className="container mx-auto px-4">
          <span className="text-purple-400 font-semibold tracking-wider uppercase text-sm">Pintura Premium</span>
          <h1 className="text-4xl md:text-5xl font-bold mt-2 mb-4">Orçamento de Pintura</h1>
          <p className="text-gray-300 text-lg max-w-2xl">
            Já tem sua peça impressa em 3D? Envie fotos e receba propostas de pintores profissionais cadastrados na plataforma.
          </p>
        </div>
      </section>

      {/* Steps info */}
      <div className="bg-gray-50 border-b">
        <div className="container mx-auto px-4 py-4 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600">
          <div className="flex items-center gap-2"><Camera className="w-4 h-4 text-purple-600" /> Envie fotos da peça</div>
          <div className="flex items-center gap-2"><Bell className="w-4 h-4 text-purple-600" /> Pintores recebem como proposta</div>
          <div className="flex items-center gap-2"><Shield className="w-4 h-4 text-purple-600" /> Pagamento seguro com intermediação</div>
        </div>
      </div>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-8">

                {/* 1. O que deseja pintar */}
                <div className="bg-white rounded-2xl border border-gray-200 p-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <span className="bg-purple-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                    O que deseja pintar? *
                  </h2>
                  <p className="text-gray-500 mb-6 ml-10">Selecione o tipo de objeto que será pintado</p>

                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {objectTypes.map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setObjectType(type.id)}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          objectType === type.id
                            ? 'border-purple-600 bg-purple-50 shadow-md'
                            : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                        }`}
                      >
                        <h3 className="font-bold text-gray-900 text-xs mb-1">{type.name}</h3>
                        <p className="text-xs text-gray-500">{type.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Fotos da peça */}
                <div className="bg-white rounded-2xl border border-gray-200 p-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <span className="bg-purple-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                    Fotos da peça impressa *
                  </h2>
                  <p className="text-gray-500 mb-6 ml-10">
                    Envie fotos de todos os ângulos da peça. Quanto mais fotos, melhor será a avaliação dos pintores.
                    <strong className="text-gray-700"> Mínimo 1 foto obrigatória.</strong>
                  </p>

                  <label className="block cursor-pointer">
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-purple-400 hover:bg-purple-50 transition-all">
                      <Camera className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600 font-medium">Clique para enviar fotos da peça</p>
                      <p className="text-gray-400 text-sm mt-1">JPG, PNG ou WEBP — Máximo 10MB por foto — Até 10 fotos</p>
                    </div>
                    <input type="file" accept="image/*" multiple onChange={handlePhotoUpload} className="hidden" />
                  </label>

                  {photos.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                      {photos.map((photo, index) => (
                        <div key={index} className="relative group">
                          <img src={photo.url} alt={photo.name} className="w-full h-24 object-cover rounded-lg border" />
                          <button
                            type="button"
                            onClick={() => removePhoto(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                          <p className="text-xs text-gray-500 mt-1 truncate">Foto {index + 1}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 3. Tamanho do objeto */}
                <div className="bg-white rounded-2xl border border-gray-200 p-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <span className="bg-purple-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">3</span>
                    Tamanho do Objeto
                  </h2>
                  <p className="text-gray-500 mb-6 ml-10">Informe as dimensões aproximadas da peça</p>

                  <div className="grid sm:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Largura</label>
                      <div className="flex">
                        <input
                          type="number"
                          value={formData.width}
                          onChange={(e) => setFormData({ ...formData, width: e.target.value })}
                          placeholder="0"
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                        <span className="bg-gray-100 border border-l-0 border-gray-300 px-3 py-2.5 rounded-r-lg text-sm text-gray-500">{formData.unit}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Altura</label>
                      <div className="flex">
                        <input
                          type="number"
                          value={formData.height}
                          onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                          placeholder="0"
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                        <span className="bg-gray-100 border border-l-0 border-gray-300 px-3 py-2.5 rounded-r-lg text-sm text-gray-500">{formData.unit}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Profundidade</label>
                      <div className="flex">
                        <input
                          type="number"
                          value={formData.depth}
                          onChange={(e) => setFormData({ ...formData, depth: e.target.value })}
                          placeholder="0"
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                        <span className="bg-gray-100 border border-l-0 border-gray-300 px-3 py-2.5 rounded-r-lg text-sm text-gray-500">{formData.unit}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Unidade</label>
                      <select
                        value={formData.unit}
                        onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="cm">Centímetros (cm)</option>
                        <option value="mm">Milímetros (mm)</option>
                        <option value="pol">Polegadas (pol)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Material da peça</label>
                      <select
                        value={material}
                        onChange={(e) => setMaterial(e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="">Selecione o material...</option>
                        {materialTypes.map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade de peças</label>
                      <input
                        type="number"
                        min="1"
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Tipo de pintura e acabamento */}
                <div className="bg-white rounded-2xl border border-gray-200 p-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <span className="bg-purple-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">4</span>
                    Tipo de Pintura e Acabamento *
                  </h2>

                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
                    {paintTypes.map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setPaintType(type.id)}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          paintType === type.id
                            ? 'border-purple-600 bg-purple-50 shadow-md'
                            : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                        }`}
                      >
                        <h3 className="font-bold text-gray-900 text-sm mb-1">{type.name}</h3>
                        <p className="text-xs text-gray-500">{type.description}</p>
                      </button>
                    ))}
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Acabamento</label>
                      <select
                        value={finish}
                        onChange={(e) => setFinish(e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="">Selecione...</option>
                        {finishTypes.map((f) => (
                          <option key={f} value={f}>{f}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cores desejadas</label>
                      <input
                        type="text"
                        value={formData.colors}
                        onChange={(e) => setFormData({ ...formData, colors: e.target.value })}
                        placeholder="Ex: Vermelho metálico com detalhes em dourado"
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* 5. Detalhes adicionais */}
                <div className="bg-white rounded-2xl border border-gray-200 p-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <span className="bg-purple-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">5</span>
                    Detalhes Adicionais
                  </h2>

                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descreva detalhes sobre a pintura desejada: referências visuais, cores específicas, áreas que precisam de atenção especial, efeitos desejados..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    rows={4}
                  />

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Links de referência visual (opcional)</label>
                    <input
                      type="text"
                      value={formData.references}
                      onChange={(e) => setFormData({ ...formData, references: e.target.value })}
                      placeholder="Cole links de imagens com referências de como deseja a pintura..."
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* 6. Dados pessoais */}
                <div className="bg-white rounded-2xl border border-gray-200 p-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <span className="bg-purple-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">6</span>
                    Seus Dados
                  </h2>

                  <div className="grid sm:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nome completo *</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Seu nome completo"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">E-mail *</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="seu@email.com"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                      <input
                        type="tel"
                        value={formData.whatsapp}
                        onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                        placeholder="(43) 9-9174-1518"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit */}
                {submitted ? (
                  <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                    <h3 className="text-xl font-bold text-green-800 mb-2">Orçamento enviado com sucesso!</h3>
                    <p className="text-green-600">Sua solicitação foi enviada como proposta para os pintores cadastrados. Você receberá propostas em breve.</p>
                  </div>
                ) : (
                  <button
                    type="submit"
                    className="w-full bg-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Paintbrush className="w-5 h-5" />
                    Enviar para Pintores
                    <ArrowRight className="w-5 h-5" />
                  </button>
                )}
              </form>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                <div className="bg-purple-50 border border-purple-200 rounded-2xl p-6">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Info className="w-5 h-5 text-purple-600" /> Como funciona
                  </h3>
                  <ul className="space-y-4 text-sm text-gray-600">
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">1</div>
                      <span>Envie fotos da peça impressa e descreva a pintura desejada</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">2</div>
                      <span>Sua solicitação aparece como <strong>notificação/proposta</strong> para todos os pintores cadastrados</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">3</div>
                      <span>Pintores interessados enviam propostas com preço e prazo</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">4</div>
                      <span>Você escolhe a melhor proposta e realiza o pagamento seguro</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">5</div>
                      <span>O pagamento fica retido até você confirmar o recebimento da peça pintada</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-6">
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-green-500" /> Segurança garantida
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2"><Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" /> Intermediação total pela 3DKPRINT</li>
                    <li className="flex items-start gap-2"><Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" /> Pagamento retido até confirmação</li>
                    <li className="flex items-start gap-2"><Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" /> Pintores verificados e avaliados</li>
                    <li className="flex items-start gap-2"><Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" /> Suporte em caso de problemas</li>
                  </ul>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-6">
                  <h3 className="font-bold text-gray-900 mb-3">Dicas para melhores propostas</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Envie fotos de todos os ângulos</li>
                    <li>• Indique referências visuais (links ou imagens)</li>
                    <li>• Informe o material da peça (PLA, ABS, Resina)</li>
                    <li>• Descreva cores e detalhes com precisão</li>
                    <li>• Informe as dimensões exatas da peça</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
