import { useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { Pen, Upload, Camera, Ruler, Info, CheckCircle, ArrowRight, X, Target, Cpu, ScanLine, ChevronDown, ChevronUp } from 'lucide-react';

const modelingTypes = [
  {
    id: 'organica',
    name: 'Modelagem Orgânica',
    icon: '🧩',
    shortDesc: 'Formas livres, curvas e naturais — estética e fluidez visual',
    whatIs: 'A modelagem orgânica é voltada para formas livres, curvas e naturais, sem restrições geométricas rígidas. Ela prioriza estética, ergonomia e fluidez visual.',
    applications: [
      'Design de produtos',
      'Personagens e esculturas',
      'Peças decorativas',
      'Protótipos conceituais',
      'Design artístico e visual',
    ],
    technicalFeatures: [
      'Baseada em escultura digital',
      'Ajustes manuais e intuitivos',
      'Alta liberdade criativa',
      'Menor foco em medidas exatas',
      'Ideal quando forma > precisão dimensional',
    ],
    softwares: ['ZBrush', 'Blender', 'Nomad Sculpt', 'Mudbox'],
    valueText: 'Excelente para impacto visual, branding, diferenciação de produto e validação estética antes da engenharia final.',
    precision: 'Média',
    aesthetics: 'Alta',
    idealUse: 'Design e conceito',
    color: 'purple',
  },
  {
    id: 'parametrica',
    name: 'Modelagem Paramétrica',
    icon: '📐',
    shortDesc: 'Orientada a medidas, regras e variáveis — precisão industrial',
    whatIs: 'A modelagem paramétrica é totalmente orientada a medidas, regras e variáveis. Cada dimensão é controlada matematicamente, permitindo alterações rápidas sem refazer o projeto.',
    applications: [
      'Peças mecânicas',
      'Engenharia reversa',
      'Componentes industriais',
      'Dispositivos funcionais',
      'Produção em escala',
    ],
    technicalFeatures: [
      'Total controle dimensional',
      'Projetos baseados em parâmetros',
      'Alta repetibilidade',
      'Compatível com CNC, impressão 3D e injeção',
      'Ideal quando precisão > estética',
    ],
    softwares: ['Fusion 360', 'SolidWorks', 'FreeCAD', 'Inventor'],
    valueText: 'Reduz retrabalho, acelera iteração, melhora padronização e garante confiabilidade industrial.',
    precision: 'Alta',
    aesthetics: 'Média',
    idealUse: 'Engenharia e produção',
    color: 'blue',
  },
  {
    id: 'scanner',
    name: 'Serviço de Scanner 3D',
    icon: '📡',
    shortDesc: 'Captura digital de objetos físicos com alta fidelidade',
    whatIs: 'O scanner 3D captura digitalmente objetos físicos, gerando uma nuvem de pontos ou malha 3D extremamente fiel à peça real.',
    applications: [
      'Engenharia reversa',
      'Reprodução de peças fora de linha',
      'Digitalização de moldes',
      'Ajuste perfeito entre componentes',
      'Documentação técnica',
    ],
    technicalFeatures: [
      'Alta precisão dimensional',
      'Captação de geometrias complexas',
      'Redução de erros manuais',
      'Base para modelagem orgânica ou paramétrica',
      'Integração direta com CAD',
    ],
    softwares: ['Artec Studio', 'Geomagic', 'MeshLab', 'CloudCompare'],
    valueText: 'Acelera o processo, elimina suposições e transforma o físico em digital com assertividade técnica.',
    precision: 'Muito alta',
    aesthetics: 'Dependente do pós-processo',
    idealUse: 'Reprodução e engenharia reversa',
    color: 'green',
  },
];

const complexityLevels = [
  { id: 'simples', name: 'Simples', description: 'Formas básicas, poucos detalhes', price: 'A partir de R$ 50' },
  { id: 'media', name: 'Média', description: 'Detalhes moderados, algumas curvas', price: 'A partir de R$ 120' },
  { id: 'complexa', name: 'Complexa', description: 'Muitos detalhes, formas elaboradas', price: 'A partir de R$ 250' },
  { id: 'muito-complexa', name: 'Muito Complexa', description: 'Altíssimo nível de detalhe', price: 'A partir de R$ 500' },
];

export default function ModelingQuote() {
  const [modelingType, setModelingType] = useState('');
  const [expandedType, setExpandedType] = useState('');
  const [complexity, setComplexity] = useState('');
  const [photos, setPhotos] = useState<{ name: string; url: string }[]>([]);
  const [formData, setFormData] = useState({
    description: '',
    width: '',
    height: '',
    depth: '',
    unit: 'mm',
    purpose: '',
    fileFormat: 'stl',
    name: '',
    email: '',
    whatsapp: '',
    references: '',
    needPrint: false,
  });
  const [submitted, setSubmitted] = useState(false);

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
    if (!modelingType) {
      alert('Selecione o tipo de modelagem ou serviço desejado.');
      return;
    }
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
  };

  const selectedType = modelingTypes.find((t) => t.id === modelingType);

  const getColorClasses = (color: string, isSelected: boolean) => {
    const colors: Record<string, { border: string; bg: string; text: string; badge: string }> = {
      purple: { border: 'border-purple-600', bg: 'bg-purple-50', text: 'text-purple-600', badge: 'bg-purple-100 text-purple-700' },
      blue: { border: 'border-blue-600', bg: 'bg-blue-50', text: 'text-blue-600', badge: 'bg-blue-100 text-blue-700' },
      green: { border: 'border-green-600', bg: 'bg-green-50', text: 'text-green-600', badge: 'bg-green-100 text-green-700' },
    };
    return isSelected ? colors[color] : { border: 'border-gray-200', bg: '', text: 'text-gray-400', badge: 'bg-gray-100 text-gray-600' };
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 text-white py-20">
        <div className="container mx-auto px-4">
          <span className="text-blue-400 font-semibold tracking-wider uppercase text-sm">Modelagem 3D</span>
          <h1 className="text-4xl md:text-5xl font-bold mt-2 mb-4">Orçamento de Modelagem 3D</h1>
          <p className="text-gray-300 text-lg max-w-2xl">
            Escolha entre modelagem orgânica, paramétrica ou serviço de scanner 3D. Descreva seu projeto e receba um orçamento personalizado.
          </p>
        </div>
      </section>

      {/* Steps info */}
      <div className="bg-gray-50 border-b">
        <div className="container mx-auto px-4 py-4 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600">
          <div className="flex items-center gap-2"><Pen className="w-4 h-4 text-blue-600" /> Escolha o serviço</div>
          <div className="flex items-center gap-2"><Camera className="w-4 h-4 text-blue-600" /> Envie fotos e referências</div>
          <div className="flex items-center gap-2"><Ruler className="w-4 h-4 text-blue-600" /> Informe as dimensões</div>
        </div>
      </div>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-10">

            {/* 1. Tipo de Modelagem / Serviço */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                Escolha o Serviço *
              </h2>
              <p className="text-gray-500 mb-6 ml-10">Selecione o tipo de modelagem ou serviço que melhor se encaixa no seu projeto</p>

              <div className="space-y-4">
                {modelingTypes.map((type) => {
                  const isSelected = modelingType === type.id;
                  const isExpanded = expandedType === type.id;
                  const colors = getColorClasses(type.color, isSelected);

                  return (
                    <div key={type.id} className={`rounded-2xl border-2 transition-all overflow-hidden ${isSelected ? colors.border + ' ' + colors.bg + ' shadow-lg' : 'border-gray-200 hover:border-gray-300'}`}>
                      {/* Card header - clickable to select */}
                      <button
                        type="button"
                        onClick={() => {
                          setModelingType(type.id);
                          setExpandedType(isExpanded ? '' : type.id);
                        }}
                        className="w-full p-6 text-left flex items-start gap-4"
                      >
                        <div className="text-3xl flex-shrink-0">{type.icon}</div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-bold text-gray-900 text-lg">{type.name}</h3>
                            {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                          </div>
                          <p className="text-gray-500 mt-1">{type.shortDesc}</p>
                          <div className="flex flex-wrap gap-2 mt-3">
                            {type.softwares.map((sw) => (
                              <span key={sw} className={`text-xs px-2 py-1 rounded-full ${isSelected ? colors.badge : 'bg-gray-100 text-gray-600'}`}>{sw}</span>
                            ))}
                          </div>
                        </div>
                      </button>

                      {/* Expanded details */}
                      {isExpanded && (
                        <div className="px-6 pb-6 border-t border-gray-200/50">
                          <div className="grid md:grid-cols-2 gap-6 mt-6">
                            {/* O que é */}
                            <div>
                              <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                                <Info className="w-4 h-4" /> O que é
                              </h4>
                              <p className="text-sm text-gray-600 leading-relaxed">{type.whatIs}</p>
                            </div>

                            {/* Valor agregado */}
                            <div>
                              <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                                📈 Valor agregado
                              </h4>
                              <p className="text-sm text-gray-600 leading-relaxed">{type.valueText}</p>
                            </div>

                            {/* Aplicações */}
                            <div>
                              <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                                🎯 Aplicações estratégicas
                              </h4>
                              <ul className="space-y-1.5">
                                {type.applications.map((app, i) => (
                                  <li key={i} className="text-sm text-gray-600 flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                    {app}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Características técnicas */}
                            <div>
                              <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                                🛠️ Características técnicas
                              </h4>
                              <ul className="space-y-1.5">
                                {type.technicalFeatures.map((feat, i) => (
                                  <li key={i} className="text-sm text-gray-600 flex items-center gap-2">
                                    <Cpu className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                    {feat}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          {/* Resumo rápido */}
                          <div className="mt-6 bg-white/80 rounded-xl p-4 border border-gray-200">
                            <h4 className="font-bold text-gray-900 mb-3 text-sm">Resumo rápido</h4>
                            <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Precisão</p>
                                <span className={`text-sm font-bold ${type.precision === 'Muito alta' ? 'text-green-600' : type.precision === 'Alta' ? 'text-blue-600' : 'text-purple-600'}`}>
                                  {type.precision}
                                </span>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Estética</p>
                                <span className={`text-sm font-bold ${type.aesthetics === 'Alta' ? 'text-purple-600' : type.aesthetics === 'Média' ? 'text-blue-600' : 'text-gray-600'}`}>
                                  {type.aesthetics}
                                </span>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Uso ideal</p>
                                <span className="text-sm font-bold text-gray-700">{type.idealUse}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Comparativo rápido */}
            <div className="bg-gray-50 rounded-2xl border border-gray-200 p-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">🔗 Comparativo Rápido</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-300">
                      <th className="text-left py-3 px-4 font-bold text-gray-700">Solução</th>
                      <th className="text-center py-3 px-4 font-bold text-gray-700">Foco Principal</th>
                      <th className="text-center py-3 px-4 font-bold text-gray-700">Precisão</th>
                      <th className="text-center py-3 px-4 font-bold text-gray-700">Estética</th>
                      <th className="text-center py-3 px-4 font-bold text-gray-700">Uso Ideal</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-200 hover:bg-purple-50">
                      <td className="py-3 px-4 font-medium text-gray-900">🧩 Modelagem Orgânica</td>
                      <td className="py-3 px-4 text-center text-gray-600">Forma e visual</td>
                      <td className="py-3 px-4 text-center"><span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-xs font-medium">Média</span></td>
                      <td className="py-3 px-4 text-center"><span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-xs font-medium">Alta</span></td>
                      <td className="py-3 px-4 text-center text-gray-600">Design e conceito</td>
                    </tr>
                    <tr className="border-b border-gray-200 hover:bg-blue-50">
                      <td className="py-3 px-4 font-medium text-gray-900">📐 Modelagem Paramétrica</td>
                      <td className="py-3 px-4 text-center text-gray-600">Função e medida</td>
                      <td className="py-3 px-4 text-center"><span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-medium">Alta</span></td>
                      <td className="py-3 px-4 text-center"><span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-medium">Média</span></td>
                      <td className="py-3 px-4 text-center text-gray-600">Engenharia e produção</td>
                    </tr>
                    <tr className="hover:bg-green-50">
                      <td className="py-3 px-4 font-medium text-gray-900">📡 Scanner 3D</td>
                      <td className="py-3 px-4 text-center text-gray-600">Fidelidade real</td>
                      <td className="py-3 px-4 text-center"><span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-medium">Muito alta</span></td>
                      <td className="py-3 px-4 text-center"><span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs font-medium">Depende do pós-processo</span></td>
                      <td className="py-3 px-4 text-center text-gray-600">Reprodução e eng. reversa</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* 2. Complexidade */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                Nível de Complexidade
              </h2>
              <p className="text-gray-500 mb-6 ml-10">Selecione o nível de complexidade estimado do seu projeto</p>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {complexityLevels.map((level) => (
                  <button
                    key={level.id}
                    type="button"
                    onClick={() => setComplexity(level.id)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      complexity === level.id
                        ? 'border-blue-600 bg-blue-50 shadow-md'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                    }`}
                  >
                    <h3 className="font-bold text-gray-900 text-sm mb-1">{level.name}</h3>
                    <p className="text-xs text-gray-500 mb-2">{level.description}</p>
                    <span className="text-xs font-semibold text-blue-600">{level.price}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Fotos e Referências */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">3</span>
                Fotos e Referências
              </h2>
              <p className="text-gray-500 mb-6 ml-10">
                {modelingType === 'scanner'
                  ? 'Envie fotos do objeto que deseja escanear. Mostre todos os ângulos para melhor avaliação.'
                  : 'Envie fotos, desenhos ou referências visuais do que deseja modelar. Quanto mais detalhes, melhor o orçamento.'}
              </p>

              <label className="block cursor-pointer">
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 hover:bg-blue-50 transition-all">
                  <Camera className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 font-medium">Clique para enviar fotos e referências</p>
                  <p className="text-gray-400 text-sm mt-1">JPG, PNG ou WEBP — Máximo 10MB por foto — Até 10 fotos</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
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
                      <p className="text-xs text-gray-500 mt-1 truncate">{photo.name}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Links de referência (opcional)</label>
                <textarea
                  value={formData.references}
                  onChange={(e) => setFormData({ ...formData, references: e.target.value })}
                  placeholder="Cole links de imagens ou sites com referências visuais do que deseja..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                />
              </div>
            </div>

            {/* 4. Dimensões do Objeto */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">4</span>
                Dimensões do Objeto
              </h2>
              <p className="text-gray-500 mb-6 ml-10">
                {modelingType === 'scanner'
                  ? 'Informe as dimensões aproximadas do objeto que será escaneado'
                  : 'Informe as dimensões aproximadas da peça que deseja modelar'}
              </p>

              <div className="grid sm:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Largura</label>
                  <div className="flex">
                    <input
                      type="number"
                      value={formData.width}
                      onChange={(e) => setFormData({ ...formData, width: e.target.value })}
                      placeholder="0"
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <span className="bg-gray-100 border border-l-0 border-gray-300 px-3 py-2.5 rounded-r-lg text-sm text-gray-500">{formData.unit}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unidade</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="mm">Milímetros (mm)</option>
                    <option value="cm">Centímetros (cm)</option>
                    <option value="m">Metros (m)</option>
                    <option value="pol">Polegadas (pol)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 5. Descrição do Projeto */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">5</span>
                Descrição do Projeto
              </h2>
              <p className="text-gray-500 mb-6 ml-10">Descreva em detalhes o que deseja</p>

              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={
                  modelingType === 'scanner'
                    ? 'Descreva o objeto que deseja escanear: material, tamanho, finalidade do scan, se precisa de pós-processamento...'
                    : 'Descreva o que deseja modelar: formato, detalhes, funcionalidade, encaixes, etc. Quanto mais detalhes, melhor o orçamento...'
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={5}
                required
              />

              <div className="grid sm:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Finalidade</label>
                  <select
                    value={formData.purpose}
                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Selecione...</option>
                    <option value="prototipo">Protótipo / Teste</option>
                    <option value="funcional">Peça funcional / Uso final</option>
                    <option value="decoracao">Decoração / Artístico</option>
                    <option value="colecao">Colecionável / Miniatura</option>
                    <option value="reposicao">Peça de reposição</option>
                    <option value="engenharia-reversa">Engenharia reversa</option>
                    <option value="documentacao">Documentação técnica</option>
                    <option value="educacional">Educacional / Acadêmico</option>
                    <option value="outro">Outro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Formato de entrega do arquivo</label>
                  <select
                    value={formData.fileFormat}
                    onChange={(e) => setFormData({ ...formData, fileFormat: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="stl">STL (para impressão 3D)</option>
                    <option value="obj">OBJ</option>
                    <option value="3mf">3MF</option>
                    <option value="step">STEP (para CAD)</option>
                    <option value="fbx">FBX (para animação)</option>
                    <option value="blend">Blender (.blend)</option>
                    <option value="nuvem">Nuvem de pontos (.ply / .xyz)</option>
                    <option value="outro">Outro / Não sei</option>
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.needPrint}
                    onChange={(e) => setFormData({ ...formData, needPrint: e.target.checked })}
                    className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Também quero orçamento de <strong>impressão 3D</strong> da peça</span>
                </label>
              </div>
            </div>

            {/* 6. Dados pessoais */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">6</span>
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
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            {submitted ? (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <h3 className="text-xl font-bold text-green-800 mb-2">Solicitação enviada com sucesso!</h3>
                <p className="text-green-600">
                  {modelingType === 'scanner'
                    ? 'Entraremos em contato em até 24 horas para agendar o serviço de scanner 3D.'
                    : 'Você receberá propostas de modeladores em até 24 horas no seu e-mail.'}
                </p>
              </div>
            ) : (
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                {modelingType === 'scanner' ? 'Solicitar Serviço de Scanner 3D' : 'Solicitar Orçamento de Modelagem'}
                <ArrowRight className="w-5 h-5" />
              </button>
            )}
          </form>

          {/* Como funciona */}
          <div className="max-w-5xl mx-auto mt-16">
            <h3 className="text-xl font-bold text-center text-gray-900 mb-8">Como funciona</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { step: '1', title: 'Descreva o projeto', desc: 'Escolha o tipo de serviço e envie referências' },
                { step: '2', title: 'Receba propostas', desc: 'Profissionais enviam orçamentos com prazo e preço' },
                { step: '3', title: 'Pagamento seguro', desc: 'Pague pela plataforma com valor retido' },
                { step: '4', title: 'Receba o resultado', desc: 'Arquivo 3D pronto ou peça escaneada digitalmente' },
              ].map((item) => (
                <div key={item.step} className="text-center">
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mx-auto mb-3">{item.step}</div>
                  <h4 className="font-bold text-gray-900 mb-1">{item.title}</h4>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
