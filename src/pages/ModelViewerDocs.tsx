import { useState, useEffect } from 'react';
import { Code, Play, Copy, Check, RotateCw, ZoomIn, Maximize2, Smartphone, Eye, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ModelViewerDocs() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeExample, setActiveExample] = useState<string>('basic');

  // Carregar model-viewer
  useEffect(() => {
    import('@google/model-viewer');
  }, []);

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const examples = {
    basic: {
      title: 'Exemplo Básico',
      description: 'Visualizador 3D simples com controles de câmera',
      code: `<model-viewer
  src="astronaut.glb"
  alt="Modelo 3D"
  camera-controls
  style="width: 100%; height: 400px;"
></model-viewer>`,
      attributes: {
        src: 'astronaut.glb',
        alt: 'Modelo 3D',
        'camera-controls': true,
      }
    },
    autoRotate: {
      title: 'Auto-Rotação',
      description: 'Modelo gira automaticamente',
      code: `<model-viewer
  src="astronaut.glb"
  alt="Modelo 3D"
  auto-rotate
  camera-controls
  rotation-per-second="30deg"
  style="width: 100%; height: 400px;"
></model-viewer>`,
      attributes: {
        src: 'astronaut.glb',
        alt: 'Modelo 3D',
        'auto-rotate': true,
        'camera-controls': true,
        'rotation-per-second': '30deg',
      }
    },
    shadow: {
      title: 'Sombra e Iluminação',
      description: 'Modelo com sombra realista',
      code: `<model-viewer
  src="astronaut.glb"
  alt="Modelo 3D"
  camera-controls
  shadow-intensity="1"
  shadow-softness="0.8"
  exposure="1"
  style="width: 100%; height: 400px;"
></model-viewer>`,
      attributes: {
        src: 'astronaut.glb',
        alt: 'Modelo 3D',
        'camera-controls': true,
        'shadow-intensity': '1',
        'shadow-softness': '0.8',
        exposure: '1',
      }
    },
    ar: {
      title: 'Realidade Aumentada',
      description: 'Visualize em AR no seu ambiente',
      code: `<model-viewer
  src="astronaut.glb"
  alt="Modelo 3D"
  camera-controls
  ar
  ar-modes="webxr scene-viewer quick-look"
  ar-scale="auto"
  style="width: 100%; height: 400px;"
></model-viewer>`,
      attributes: {
        src: 'astronaut.glb',
        alt: 'Modelo 3D',
        'camera-controls': true,
        ar: true,
        'ar-modes': 'webxr scene-viewer quick-look',
        'ar-scale': 'auto',
      }
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">
              📦 Model-Viewer Docs
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Documentação interativa com exemplos práticos e código executável
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-100"
                onClick={() => window.scrollTo({ top: 600, behavior: 'smooth' })}
              >
                <Play className="w-5 h-5 mr-2" />
                Ver Exemplos
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10"
                onClick={() => window.open('https://modelviewer.dev/', '_blank')}
              >
                <Eye className="w-5 h-5 mr-2" />
                Docs Oficiais
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Intro Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <Card className="mb-12 border-2 border-blue-200">
            <CardHeader>
              <CardTitle className="text-3xl">🎯 O que é Model-Viewer?</CardTitle>
              <CardDescription className="text-lg">
                Biblioteca do Google para exibir modelos 3D interativos na web
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                    <RotateCw className="w-5 h-5" />
                    Interativo
                  </h4>
                  <p className="text-sm text-blue-700">
                    Rotação 360°, zoom e controles de câmera nativos
                  </p>
                </div>
                <div className="bg-purple-50 p-6 rounded-lg">
                  <h4 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                    <Smartphone className="w-5 h-5" />
                    Realidade Aumentada
                  </h4>
                  <p className="text-sm text-purple-700">
                    Visualize modelos no ambiente real via AR
                  </p>
                </div>
                <div className="bg-green-50 p-6 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Customizável
                  </h4>
                  <p className="text-sm text-green-700">
                    Dezenas de atributos para personalizar
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Exemplos Interativos */}
          <h2 className="text-3xl font-bold mb-8 text-center">🚀 Exemplos Interativos</h2>

          <Tabs value={activeExample} onValueChange={setActiveExample} className="mb-12">
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="basic">Básico</TabsTrigger>
              <TabsTrigger value="autoRotate">Auto-Rotação</TabsTrigger>
              <TabsTrigger value="shadow">Sombra</TabsTrigger>
              <TabsTrigger value="ar">AR</TabsTrigger>
            </TabsList>

            {Object.entries(examples).map(([key, example]) => (
              <TabsContent key={key} value={key}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{example.title}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyCode(example.code, key)}
                      >
                        {copiedCode === key ? (
                          <>
                            <Check className="w-4 h-4 mr-1" />
                            Copiado!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 mr-1" />
                            Copiar Código
                          </>
                        )}
                      </Button>
                    </CardTitle>
                    <CardDescription>{example.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Visualizador 3D */}
                    <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg p-4">
                      <model-viewer
                        src="https://modelviewer.dev/shared-assets/models/Astronaut.glb"
                        {...example.attributes}
                        style={{ width: '100%', height: '400px', background: 'transparent' }}
                      ></model-viewer>
                    </div>

                    {/* Código */}
                    <div className="relative">
                      <div className="absolute top-2 right-2 z-10">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => copyCode(example.code, `${key}-code`)}
                        >
                          {copiedCode === `${key}-code` ? (
                            <Check className="w-3 h-3" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </Button>
                      </div>
                      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                        <code>{example.code}</code>
                      </pre>
                    </div>

                    {/* Atributos */}
                    <div>
                      <h4 className="font-semibold mb-3">📋 Atributos Utilizados:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {Object.entries(example.attributes).map(([attr, value]) => (
                          <div key={attr} className="bg-gray-50 p-3 rounded border">
                            <code className="text-sm">
                              <span className="text-blue-600 font-medium">{attr}</span>
                              {typeof value === 'boolean' ? (
                                <span className="text-green-600"> (boolean)</span>
                              ) : (
                                <>
                                  <span className="text-gray-500">="</span>
                                  <span className="text-purple-600">{value}</span>
                                  <span className="text-gray-500">"</span>
                                </>
                              )}
                            </code>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>

          {/* Guia de Atributos */}
          <Card className="mb-12">
            <CardHeader>
              <CardTitle className="text-2xl">📚 Guia de Atributos</CardTitle>
              <CardDescription>
                Principais atributos do model-viewer e suas funções
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    attr: 'src',
                    type: 'string',
                    desc: 'URL do arquivo GLB/GLTF',
                    required: true,
                  },
                  {
                    attr: 'alt',
                    type: 'string',
                    desc: 'Texto alternativo para acessibilidade',
                    required: false,
                  },
                  {
                    attr: 'camera-controls',
                    type: 'boolean',
                    desc: 'Habilita controles manuais de câmera',
                    required: false,
                  },
                  {
                    attr: 'auto-rotate',
                    type: 'boolean',
                    desc: 'Ativa rotação automática do modelo',
                    required: false,
                  },
                  {
                    attr: 'rotation-per-second',
                    type: 'string',
                    desc: 'Velocidade da auto-rotação (ex: "30deg")',
                    required: false,
                  },
                  {
                    attr: 'shadow-intensity',
                    type: 'string',
                    desc: 'Intensidade da sombra (0-1)',
                    required: false,
                  },
                  {
                    attr: 'shadow-softness',
                    type: 'string',
                    desc: 'Suavidade da sombra (0-1)',
                    required: false,
                  },
                  {
                    attr: 'exposure',
                    type: 'string',
                    desc: 'Exposição da iluminação (0-2)',
                    required: false,
                  },
                  {
                    attr: 'ar',
                    type: 'boolean',
                    desc: 'Habilita visualização em Realidade Aumentada',
                    required: false,
                  },
                  {
                    attr: 'ar-modes',
                    type: 'string',
                    desc: 'Modos de AR suportados',
                    required: false,
                  },
                  {
                    attr: 'loading',
                    type: 'string',
                    desc: 'Estratégia de carregamento (auto/lazy/eager)',
                    required: false,
                  },
                  {
                    attr: 'reveal',
                    type: 'string',
                    desc: 'Quando revelar o modelo (auto/interaction/manual)',
                    required: false,
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border"
                  >
                    <div className="flex-shrink-0">
                      {item.required ? (
                        <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded">
                          Obrigatório
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                          Opcional
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <code className="text-sm font-semibold text-blue-600">
                          {item.attr}
                        </code>
                        <span className="text-xs text-gray-500">({item.type})</span>
                      </div>
                      <p className="text-sm text-gray-700">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Controles do Usuário */}
          <Card className="mb-12 border-2 border-purple-200">
            <CardHeader>
              <CardTitle className="text-2xl">🎮 Controles do Usuário</CardTitle>
              <CardDescription>
                Como os usuários interagem com o modelo 3D
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">🖥️ Desktop</h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <RotateCw className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">Arrastar com mouse</p>
                        <p className="text-sm text-gray-600">Rotaciona o modelo em 360°</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <ZoomIn className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium">Scroll do mouse</p>
                        <p className="text-sm text-gray-600">Zoom in/out no modelo</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Maximize2 className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">Dois dedos (trackpad)</p>
                        <p className="text-sm text-gray-600">Pan (mover lateralmente)</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">📱 Mobile/Tablet</h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <RotateCw className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">Arrastar com dedo</p>
                        <p className="text-sm text-gray-600">Rotaciona o modelo</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <ZoomIn className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium">Pinch (dois dedos)</p>
                        <p className="text-sm text-gray-600">Zoom in/out</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Smartphone className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">Botão AR</p>
                        <p className="text-sm text-gray-600">Visualizar em realidade aumentada</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Integração com React */}
          <Card className="mb-12">
            <CardHeader>
              <CardTitle className="text-2xl">⚛️ Integração com React</CardTitle>
              <CardDescription>
                Como usar model-viewer em aplicações React/TypeScript
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold mb-3">1. Instalar a biblioteca:</h4>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                  <code>pnpm add @google/model-viewer</code>
                </pre>
              </div>

              <div>
                <h4 className="font-semibold mb-3">2. Importar no componente:</h4>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{`import { useEffect } from 'react';

useEffect(() => {
  import('@google/model-viewer');
}, []);`}</code>
                </pre>
              </div>

              <div>
                <h4 className="font-semibold mb-3">3. Criar arquivo de tipos (opcional):</h4>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{`// src/types/model-viewer.d.ts
declare namespace JSX {
  interface IntrinsicElements {
    'model-viewer': ModelViewerJSX & React.DetailedHTMLProps<...>;
  }
}

interface ModelViewerJSX {
  src: string;
  alt?: string;
  'camera-controls'?: boolean;
  'auto-rotate'?: boolean;
  // ... outros atributos
}`}</code>
                </pre>
              </div>

              <div>
                <h4 className="font-semibold mb-3">4. Usar no JSX:</h4>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{`<model-viewer
  src="modelo.glb"
  alt="Meu modelo 3D"
  camera-controls
  auto-rotate
  style={{ width: '100%', height: '500px' }}
></model-viewer>`}</code>
                </pre>
              </div>
            </CardContent>
          </Card>

          {/* Recursos Adicionais */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">🔗 Recursos Adicionais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <a
                  href="https://modelviewer.dev/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200"
                >
                  <h4 className="font-semibold text-blue-900 mb-1">📖 Documentação Oficial</h4>
                  <p className="text-sm text-blue-700">Guia completo do Google</p>
                </a>
                <a
                  href="https://modelviewer.dev/examples/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors border border-purple-200"
                >
                  <h4 className="font-semibold text-purple-900 mb-1">💡 Exemplos</h4>
                  <p className="text-sm text-purple-700">Galeria de exemplos práticos</p>
                </a>
                <a
                  href="https://modelviewer.dev/editor/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors border border-green-200"
                >
                  <h4 className="font-semibold text-green-900 mb-1">🎨 Editor Online</h4>
                  <p className="text-sm text-green-700">Teste e configure modelos</p>
                </a>
                <a
                  href="https://www.3dkprint.com.br/produtos/1"
                  className="p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors border border-orange-200"
                >
                  <h4 className="font-semibold text-orange-900 mb-1">🛍️ Ver em Produto</h4>
                  <p className="text-sm text-orange-700">Exemplo integrado no site</p>
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold mb-4">Pronto para usar?</h3>
          <p className="text-blue-100 mb-6">
            Comece a integrar visualizadores 3D nos seus produtos agora
          </p>
          <Button 
            size="lg"
            className="bg-white text-blue-600 hover:bg-gray-100"
            onClick={() => window.location.href = '/admin/produtos-site'}
          >
            Cadastrar Produto com 3D
          </Button>
        </div>
      </div>
    </div>
  );
}
