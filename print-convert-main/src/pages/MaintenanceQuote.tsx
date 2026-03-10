import { useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { Wrench, Upload, Camera, AlertCircle, CheckCircle, ArrowRight, X } from 'lucide-react';

const printerBrands = [
  {
    name: 'Creality',
    models: ['Ender 3', 'Ender 3 V2', 'Ender 3 S1', 'Ender 5', 'CR-10', 'CR-6 SE', 'K1', 'K1 Max', 'Outro'],
  },
  {
    name: 'Bambu Lab',
    models: ['X1 Carbon', 'P1P', 'P1S', 'A1', 'A1 Mini', 'Outro'],
  },
  {
    name: 'Prusa',
    models: ['i3 MK3S+', 'i3 MK4', 'Mini+', 'XL', 'Outro'],
  },
  {
    name: 'Anycubic',
    models: ['Kobra', 'Kobra 2', 'Vyper', 'Mega S', 'Photon Mono', 'Outro'],
  },
  {
    name: 'Elegoo',
    models: ['Neptune 3', 'Neptune 4', 'Mars 3', 'Saturn', 'Outro'],
  },
  {
    name: 'Sovol',
    models: ['SV06', 'SV07', 'SV01', 'Outro'],
  },
  {
    name: 'Voron',
    models: ['Voron 2.4', 'Voron 0.2', 'Voron Trident', 'Outro'],
  },
  {
    name: 'Flashforge',
    models: ['Adventurer 3', 'Adventurer 4', 'Creator Pro', 'Outro'],
  },
  {
    name: 'Outra marca',
    models: ['Especificar no campo de descrição'],
  },
];

const commonIssues = [
  'Problemas de extrusão / entupimento',
  'Desnivelamento da mesa',
  'Problemas de adesão na mesa',
  'Ruídos anormais / vibrações',
  'Problemas de aquecimento (mesa ou hotend)',
  'Problemas de firmware / software',
  'Peças quebradas / desgastadas',
  'Problemas de calibração',
  'Impressões com defeito / camadas irregulares',
  'Outro problema (descrever)',
];

export default function MaintenanceQuote() {
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [issue, setIssue] = useState('');
  const [photos, setPhotos] = useState<{ name: string; url: string }[]>([]);
  const [formData, setFormData] = useState({
    description: '',
    name: '',
    email: '',
    whatsapp: '',
    city: '',
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
    if (!brand || !model) {
      alert('Selecione a marca e o modelo da sua impressora.');
      return;
    }
    if (photos.length === 0) {
      alert('Envie pelo menos 1 foto da impressora ou do problema.');
      return;
    }
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
  };

  const selectedBrand = printerBrands.find((b) => b.name === brand);

  return (
    <Layout>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-orange-900 text-white py-20">
        <div className="container mx-auto px-4">
          <span className="text-orange-400 font-semibold tracking-wider uppercase text-sm">Manutenção</span>
          <h1 className="text-4xl md:text-5xl font-bold mt-2 mb-4">Orçamento de Manutenção</h1>
          <p className="text-gray-300 text-lg max-w-2xl">
            Serviço exclusivo realizado pela equipe técnica da 3DKPRINT. Informe o modelo da sua impressora, envie fotos e descreva o problema.
          </p>
        </div>
      </section>

      {/* Steps info */}
      <div className="bg-gray-50 border-b">
        <div className="container mx-auto px-4 py-4 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600">
          <div className="flex items-center gap-2"><Wrench className="w-4 h-4 text-orange-600" /> Informe o modelo</div>
          <div className="flex items-center gap-2"><Camera className="w-4 h-4 text-orange-600" /> Envie fotos do problema</div>
          <div className="flex items-center gap-2"><AlertCircle className="w-4 h-4 text-orange-600" /> Descreva o problema</div>
        </div>
      </div>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-10">

            {/* 1. Marca e Modelo */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                <span className="bg-orange-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                Marca e Modelo da Impressora *
              </h2>
              <p className="text-gray-500 mb-6 ml-10">Selecione a marca e o modelo da sua impressora 3D</p>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Marca *</label>
                  <select
                    value={brand}
                    onChange={(e) => {
                      setBrand(e.target.value);
                      setModel('');
                    }}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  >
                    <option value="">Selecione a marca...</option>
                    {printerBrands.map((b) => (
                      <option key={b.name} value={b.name}>{b.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Modelo *</label>
                  <select
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                    disabled={!brand}
                  >
                    <option value="">Selecione o modelo...</option>
                    {selectedBrand?.models.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 2. Tipo de Problema */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                <span className="bg-orange-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                Tipo de Problema
              </h2>
              <p className="text-gray-500 mb-6 ml-10">Selecione o problema mais próximo (opcional, mas ajuda no diagnóstico)</p>

              <div className="grid sm:grid-cols-2 gap-3">
                {commonIssues.map((issueOption) => (
                  <button
                    key={issueOption}
                    type="button"
                    onClick={() => setIssue(issueOption)}
                    className={`p-3 rounded-lg border-2 text-left text-sm transition-all ${
                      issue === issueOption
                        ? 'border-orange-600 bg-orange-50 text-orange-900 font-medium'
                        : 'border-gray-200 hover:border-orange-300 hover:bg-gray-50'
                    }`}
                  >
                    {issueOption}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Fotos do Problema */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                <span className="bg-orange-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">3</span>
                Fotos da Impressora e do Problema *
              </h2>
              <p className="text-gray-500 mb-6 ml-10">
                Envie fotos da impressora e do problema. Quanto mais ângulos e detalhes, melhor o diagnóstico. <strong>Mínimo 1 foto obrigatória.</strong>
              </p>

              <label className="block cursor-pointer">
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-orange-400 hover:bg-orange-50 transition-all">
                  <Camera className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 font-medium">Clique para enviar fotos</p>
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

              {photos.length === 0 && (
                <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <strong>Dica:</strong> Envie fotos da impressora inteira, do problema específico (peças quebradas, entupimento, etc.) e da mesa de impressão.
                  </div>
                </div>
              )}
            </div>

            {/* 4. Descrição do Problema */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                <span className="bg-orange-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">4</span>
                Descrição do Problema *
              </h2>
              <p className="text-gray-500 mb-6 ml-10">Descreva em detalhes o problema que está enfrentando</p>

              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descreva o problema: quando começou, o que acontece, se já tentou alguma solução, etc. Quanto mais detalhes, melhor o diagnóstico..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                rows={5}
                required
              />
            </div>

            {/* 5. Dados pessoais */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                <span className="bg-orange-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">5</span>
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
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp *</label>
                  <input
                    type="tel"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    placeholder="(43) 9-9174-1518"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cidade *</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Sua cidade - UF"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            {submitted ? (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <h3 className="text-xl font-bold text-green-800 mb-2">Solicitação enviada com sucesso!</h3>
                <p className="text-green-600">A equipe técnica da 3DKPRINT entrará em contato em até 24 horas com o diagnóstico e orçamento.</p>
              </div>
            ) : (
              <button
                type="submit"
                className="w-full bg-orange-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
              >
                Solicitar Orçamento de Manutenção
                <ArrowRight className="w-5 h-5" />
              </button>
            )}
          </form>

          {/* Como funciona */}
          <div className="max-w-4xl mx-auto mt-16">
            <h3 className="text-xl font-bold text-center text-gray-900 mb-8">Como funciona</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { step: '1', title: 'Envie os dados', desc: 'Informe modelo, fotos e descrição do problema' },
                { step: '2', title: 'Diagnóstico', desc: 'Equipe técnica analisa e envia orçamento' },
                { step: '3', title: 'Aprovação', desc: 'Você aprova o orçamento e agenda o serviço' },
                { step: '4', title: 'Manutenção', desc: 'Conserto realizado com garantia' },
              ].map((item) => (
                <div key={item.step} className="text-center">
                  <div className="w-10 h-10 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold mx-auto mb-3">{item.step}</div>
                  <h4 className="font-bold text-gray-900 mb-1">{item.title}</h4>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Info box */}
          <div className="max-w-4xl mx-auto mt-12 bg-blue-50 border border-blue-200 rounded-2xl p-6">
            <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Serviço exclusivo 3DKPRINT
            </h4>
            <p className="text-blue-800 text-sm">
              A manutenção de impressoras 3D é realizada exclusivamente pela equipe técnica da 3DKPRINT. 
              Não trabalhamos com prestadores externos para garantir a qualidade e segurança do serviço.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
}
