import { useState } from 'react';
import { Download, Upload, Eye, FileText, Package, Image as ImageIcon, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function Demo3D() {
  const [selectedDemo, setSelectedDemo] = useState<'viewer' | 'download' | 'upload'>('viewer');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  // Exemplos de arquivos 3D
  const exemploArquivos = [
    {
      nome: 'Engrenagem.stl',
      tipo: 'STL',
      tamanho: '2.4 MB',
      preview: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=400&h=300&fit=crop',
      descricao: 'Modelo de engrenagem mecânica para impressão 3D'
    },
    {
      nome: 'Vaso_Decorativo.obj',
      tipo: 'OBJ',
      tamanho: '1.8 MB',
      preview: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=400&h=300&fit=crop',
      descricao: 'Vaso decorativo com padrões geométricos'
    },
    {
      nome: 'Suporte_Celular.step',
      tipo: 'STEP',
      tamanho: '3.2 MB',
      preview: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400&h=300&fit=crop',
      descricao: 'Suporte ergonômico para smartphone'
    },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      
      // Se for imagem, criar preview
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleDownload = (nomeArquivo: string) => {
    // Simular download
    alert(`Download iniciado: ${nomeArquivo}\n\nEm produção, o arquivo seria baixado do servidor.`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">
              Demonstração 3D
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Explore as novas funcionalidades de visualização 3D, download e upload de arquivos
            </p>
            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => setSelectedDemo('viewer')}
                variant={selectedDemo === 'viewer' ? 'default' : 'outline'}
                className={selectedDemo === 'viewer' ? 'bg-white text-blue-600 hover:bg-gray-100' : 'border-white text-white hover:bg-white/10'}
                size="lg"
              >
                <Eye className="w-5 h-5 mr-2" />
                Visualizador 3D
              </Button>
              <Button
                onClick={() => setSelectedDemo('download')}
                variant={selectedDemo === 'download' ? 'default' : 'outline'}
                className={selectedDemo === 'download' ? 'bg-white text-blue-600 hover:bg-gray-100' : 'border-white text-white hover:bg-white/10'}
                size="lg"
              >
                <Download className="w-5 h-5 mr-2" />
                Download
              </Button>
              <Button
                onClick={() => setSelectedDemo('upload')}
                variant={selectedDemo === 'upload' ? 'default' : 'outline'}
                className={selectedDemo === 'upload' ? 'bg-white text-blue-600 hover:bg-gray-100' : 'border-white text-white hover:bg-white/10'}
                size="lg"
              >
                <Upload className="w-5 h-5 mr-2" />
                Upload
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          
          {/* Visualizador 3D */}
          {selectedDemo === 'viewer' && (
            <div className="space-y-8">
              <Card className="border-2 border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <Package className="w-6 h-6 text-blue-600" />
                    Visualizador 3D Interativo
                  </CardTitle>
                  <CardDescription>
                    Visualize modelos 3D diretamente no navegador com controles de rotação, zoom e iluminação
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Área de Visualização 3D Simulada */}
                  <div className="bg-gradient-to-br from-gray-900 to-gray-700 rounded-lg p-8 min-h-[400px] flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
                    <div className="relative z-10 text-center">
                      <Package className="w-32 h-32 text-blue-400 mx-auto mb-4 animate-pulse" />
                      <p className="text-white text-lg mb-2">Visualizador 3D</p>
                      <p className="text-gray-400 text-sm">Arraste para rotacionar • Scroll para zoom</p>
                    </div>
                    
                    {/* Controles */}
                    <div className="absolute bottom-4 right-4 flex gap-2">
                      <Button variant="secondary" size="sm">
                        <Play className="w-4 h-4 mr-1" />
                        Auto-rotação
                      </Button>
                      <Button variant="secondary" size="sm">
                        Fullscreen
                      </Button>
                    </div>
                  </div>

                  {/* Recursos */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">🔄 Rotação 360°</h4>
                      <p className="text-sm text-blue-700">Visualize o modelo de todos os ângulos</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-purple-900 mb-2">🔍 Zoom Avançado</h4>
                      <p className="text-sm text-purple-700">Aproxime para ver detalhes</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-green-900 mb-2">💡 Iluminação</h4>
                      <p className="text-sm text-green-700">Controle de luz e sombras</p>
                    </div>
                  </div>

                  {/* Formatos Suportados */}
                  <div>
                    <h4 className="font-semibold mb-3">Formatos Suportados:</h4>
                    <div className="flex flex-wrap gap-2">
                      {['GLB', 'GLTF', 'STL', 'OBJ', '3MF', 'STEP'].map(formato => (
                        <span key={formato} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                          .{formato.toLowerCase()}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Download de Arquivos */}
          {selectedDemo === 'download' && (
            <div className="space-y-8">
              <Card className="border-2 border-green-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <Download className="w-6 h-6 text-green-600" />
                    Download de Arquivos 3D
                  </CardTitle>
                  <CardDescription>
                    Baixe modelos 3D com preview, informações detalhadas e download rápido
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {exemploArquivos.map((arquivo, index) => (
                      <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                        {/* Preview */}
                        <div className="relative h-48 bg-gray-200">
                          <img 
                            src={arquivo.preview} 
                            alt={arquivo.nome}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-medium">
                            {arquivo.tipo}
                          </div>
                        </div>
                        
                        {/* Informações */}
                        <CardContent className="p-4">
                          <h4 className="font-semibold text-gray-900 mb-1 truncate">
                            {arquivo.nome}
                          </h4>
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {arquivo.descricao}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">{arquivo.tamanho}</span>
                            <Button 
                              size="sm"
                              onClick={() => handleDownload(arquivo.nome)}
                              className="gap-1"
                            >
                              <Download className="w-3 h-3" />
                              Baixar
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Recursos de Download */}
                  <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-green-900 mb-2">✅ Preview Antes do Download</h4>
                      <p className="text-sm text-green-700">Visualize uma prévia do modelo antes de baixar</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">📊 Informações Detalhadas</h4>
                      <p className="text-sm text-blue-700">Veja tamanho, formato e descrição do arquivo</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Upload de Arquivos */}
          {selectedDemo === 'upload' && (
            <div className="space-y-8">
              <Card className="border-2 border-purple-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <Upload className="w-6 h-6 text-purple-600" />
                    Upload de Arquivos 3D
                  </CardTitle>
                  <CardDescription>
                    Faça upload de modelos 3D e imagens com drag & drop e preview instantâneo
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Área de Upload */}
                  <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-purple-300 rounded-lg cursor-pointer hover:border-purple-400 transition-colors bg-purple-50/50 hover:bg-purple-50">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-16 h-16 mb-4 text-purple-400" />
                      <p className="mb-2 text-lg font-semibold text-purple-700">
                        Clique para fazer upload ou arraste arquivos
                      </p>
                      <p className="text-sm text-purple-500">
                        STL, OBJ, 3MF, GCODE, GLB, GLTF, PNG, JPG (Máx. 50MB)
                      </p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept=".stl,.obj,.3mf,.gcode,.glb,.gltf,image/*"
                      onChange={handleFileUpload}
                    />
                  </label>

                  {/* Preview do Arquivo Carregado */}
                  {uploadedFile && (
                    <Card className="bg-green-50 border-green-200">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          {/* Preview */}
                          <div className="flex-shrink-0">
                            {previewUrl ? (
                              <img 
                                src={previewUrl} 
                                alt="Preview" 
                                className="w-24 h-24 object-cover rounded-lg border-2 border-green-300"
                              />
                            ) : (
                              <div className="w-24 h-24 bg-green-100 rounded-lg border-2 border-green-300 flex items-center justify-center">
                                <FileText className="w-12 h-12 text-green-600" />
                              </div>
                            )}
                          </div>
                          
                          {/* Informações */}
                          <div className="flex-1">
                            <h4 className="font-semibold text-green-900 mb-1">
                              Arquivo Carregado com Sucesso!
                            </h4>
                            <p className="text-sm text-green-700 mb-2">
                              <strong>Nome:</strong> {uploadedFile.name}
                            </p>
                            <p className="text-sm text-green-700 mb-2">
                              <strong>Tamanho:</strong> {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                            <p className="text-sm text-green-700">
                              <strong>Tipo:</strong> {uploadedFile.type || 'Arquivo 3D'}
                            </p>
                          </div>

                          {/* Ações */}
                          <div className="flex flex-col gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4 mr-1" />
                              Visualizar
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                setUploadedFile(null);
                                setPreviewUrl('');
                              }}
                            >
                              Remover
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Recursos de Upload */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-purple-900 mb-2">🎯 Drag & Drop</h4>
                      <p className="text-sm text-purple-700">Arraste arquivos diretamente para a área</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">👁️ Preview Instantâneo</h4>
                      <p className="text-sm text-blue-700">Veja o arquivo antes de enviar</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-green-900 mb-2">✓ Validação Automática</h4>
                      <p className="text-sm text-green-700">Verifica formato e tamanho</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Seção de Integração */}
          <Card className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
            <CardHeader>
              <CardTitle className="text-2xl">🚀 Integração no Sistema</CardTitle>
              <CardDescription>
                Essas funcionalidades estão integradas em todo o sistema 3DKPRINT
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">📦 Orçamentos</h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">•</span>
                      <span>Visualize arquivos 3D enviados pelos clientes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">•</span>
                      <span>Baixe modelos para análise e orçamento</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">•</span>
                      <span>Preview de imagens de referência</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">🛍️ Produtos</h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 mt-0.5">•</span>
                      <span>Upload de modelos 3D para produtos</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 mt-0.5">•</span>
                      <span>Galeria de imagens com preview</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 mt-0.5">•</span>
                      <span>Visualizador 3D interativo no e-commerce</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>

      {/* Footer CTA */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold mb-4">Pronto para começar?</h3>
          <p className="text-blue-100 mb-6">
            Acesse o painel administrativo para usar todas essas funcionalidades
          </p>
          <Button 
            size="lg"
            className="bg-white text-blue-600 hover:bg-gray-100"
            onClick={() => window.location.href = '/admin/login'}
          >
            Acessar Painel Admin
          </Button>
        </div>
      </div>
    </div>
  );
}
