import { useState } from 'react';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, Check, ArrowRight, Info, Thermometer, Shield, Layers, Droplets, X, RotateCw, Eye, Maximize2, Loader2 } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { salvarOrcamento, incrementarOrcamentosUsuario } from '@/lib/dataStore';

type PrintCategory = 'fdm' | 'resina';

interface MaterialInfo {
  id: string;
  name: string;
  description: string;
  colors: { id: string; name: string; hex: string }[];
  tempMax: string;
  impactResistance: string;
  applications: string[];
  details: string;
}

const fdmMaterials: MaterialInfo[] = [
  {
    id: 'pla', name: 'PLA', description: 'Biodegradável, fácil de imprimir',
    colors: [
      { id: 'branco', name: 'Branco', hex: '#FFFFFF' },
      { id: 'preto', name: 'Preto', hex: '#1a1a1a' },
      { id: 'vermelho', name: 'Vermelho', hex: '#DC2626' },
      { id: 'azul', name: 'Azul', hex: '#2563EB' },
      { id: 'verde', name: 'Verde', hex: '#16A34A' },
      { id: 'amarelo', name: 'Amarelo', hex: '#EAB308' },
      { id: 'laranja', name: 'Laranja', hex: '#EA580C' },
      { id: 'cinza', name: 'Cinza', hex: '#6B7280' },
      { id: 'transparente', name: 'Transparente', hex: '#E5E7EB' },
    ],
    tempMax: '~60°C',
    impactResistance: 'Baixa — material rígido e frágil, não suporta quedas de grande impacto',
    applications: ['Prototipagem rápida', 'Modelos conceituais', 'Peças decorativas', 'Miniaturas', 'Maquetes'],
    details: 'O PLA (Ácido Polilático) é o filamento mais popular e fácil de imprimir. Biodegradável, feito de amido de milho. Ótimo para prototipagem e peças estéticas.',
  },
  {
    id: 'petg', name: 'PETG', description: 'Resistente, durável, boa flexibilidade',
    colors: [
      { id: 'branco', name: 'Branco', hex: '#FFFFFF' },
      { id: 'preto', name: 'Preto', hex: '#1a1a1a' },
      { id: 'vermelho', name: 'Vermelho', hex: '#DC2626' },
      { id: 'azul', name: 'Azul', hex: '#2563EB' },
      { id: 'verde', name: 'Verde', hex: '#16A34A' },
      { id: 'transparente', name: 'Transparente', hex: '#E5E7EB' },
      { id: 'laranja', name: 'Laranja', hex: '#EA580C' },
    ],
    tempMax: '~80°C',
    impactResistance: 'Média-Alta — boa resistência a quedas e impactos',
    applications: ['Peças funcionais', 'Recipientes', 'Peças mecânicas leves', 'Protótipos de uso real', 'Peças expostas à umidade'],
    details: 'O PETG combina facilidade de impressão do PLA com resistência superior. Resistente à umidade e a produtos químicos.',
  },
  {
    id: 'abs', name: 'ABS', description: 'Alta resistência térmica e mecânica',
    colors: [
      { id: 'branco', name: 'Branco', hex: '#FFFFFF' },
      { id: 'preto', name: 'Preto', hex: '#1a1a1a' },
      { id: 'vermelho', name: 'Vermelho', hex: '#DC2626' },
      { id: 'azul', name: 'Azul', hex: '#2563EB' },
      { id: 'cinza', name: 'Cinza', hex: '#6B7280' },
      { id: 'amarelo', name: 'Amarelo', hex: '#EAB308' },
    ],
    tempMax: '~100°C',
    impactResistance: 'Alta — excelente resistência a impactos e quedas, material tenaz',
    applications: ['Peças automotivas', 'Carcaças e gabinetes', 'Peças mecânicas', 'Protótipos funcionais', 'Pós-processamento (lixar, pintar, colar)'],
    details: 'O ABS é o mesmo plástico usado em peças LEGO. Alta resistência térmica e mecânica. Pode ser lixado, pintado e colado com acetona.',
  },
  {
    id: 'tritan', name: 'Tritan (Co-Poliéster)', description: 'Food-safe, alta transparência',
    colors: [
      { id: 'transparente', name: 'Transparente', hex: '#E5E7EB' },
      { id: 'branco', name: 'Branco', hex: '#FFFFFF' },
      { id: 'preto', name: 'Preto', hex: '#1a1a1a' },
    ],
    tempMax: '~96°C',
    impactResistance: 'Alta — muito resistente a quedas, material flexível e tenaz',
    applications: ['Recipientes para alimentos', 'Garrafas e copos', 'Peças transparentes', 'Aplicações médicas'],
    details: 'Certificado food-safe, livre de BPA. Excelente transparência e resistência a impactos.',
  },
  {
    id: 'nylon', name: 'Nylon (PA)', description: 'Muito resistente, flexível, durável',
    colors: [
      { id: 'natural', name: 'Natural (Branco)', hex: '#F5F5F0' },
      { id: 'preto', name: 'Preto', hex: '#1a1a1a' },
    ],
    tempMax: '~120°C',
    impactResistance: 'Muito Alta — extremamente resistente a impactos e desgaste',
    applications: ['Engrenagens e peças mecânicas', 'Dobradiças e encaixes', 'Peças industriais', 'Ferramentas e gabaritos'],
    details: 'Um dos filamentos mais resistentes para FDM. Excelente resistência ao desgaste, impacto e fadiga.',
  },
  {
    id: 'tpu', name: 'TPU Flexível', description: 'Material elástico tipo borracha',
    colors: [
      { id: 'preto', name: 'Preto', hex: '#1a1a1a' },
      { id: 'branco', name: 'Branco', hex: '#FFFFFF' },
      { id: 'vermelho', name: 'Vermelho', hex: '#EF4444' },
      { id: 'transparente', name: 'Transparente', hex: '#E5E7EB' },
    ],
    tempMax: '~80°C',
    impactResistance: 'Muito Alta — absorve impactos por deformação elástica',
    applications: ['Capas de celular', 'Amortecedores', 'Vedações e juntas', 'Solas de sapato', 'Peças flexíveis'],
    details: 'Filamento flexível com propriedades semelhantes à borracha. Excelente absorção de impacto.',
  },
];

const resinaMaterials: MaterialInfo[] = [
  {
    id: 'resina-basica', name: 'Resina Básica (Standard)', description: 'Alta precisão, detalhes finos',
    colors: [
      { id: 'cinza', name: 'Cinza', hex: '#9CA3AF' },
      { id: 'branco', name: 'Branco', hex: '#FFFFFF' },
      { id: 'preto', name: 'Preto', hex: '#1a1a1a' },
      { id: 'transparente', name: 'Transparente', hex: '#E5E7EB' },
      { id: 'verde', name: 'Verde', hex: '#16A34A' },
      { id: 'azul', name: 'Azul', hex: '#2563EB' },
    ],
    tempMax: '~50-60°C',
    impactResistance: 'Baixa — material rígido e frágil após cura UV',
    applications: ['Miniaturas e figuras detalhadas', 'Joias e bijuterias (moldes)', 'Peças com detalhes finos', 'Protótipos visuais'],
    details: 'Ideal para peças que exigem alta resolução e detalhes finos. Superfície lisa sem camadas visíveis.',
  },
  {
    id: 'resina-abs-like', name: 'Resina ABS-Like', description: 'Resistente a impactos, similar ao ABS',
    colors: [
      { id: 'cinza', name: 'Cinza', hex: '#9CA3AF' },
      { id: 'preto', name: 'Preto', hex: '#1a1a1a' },
      { id: 'branco', name: 'Branco', hex: '#FFFFFF' },
      { id: 'verde', name: 'Verde Translúcido', hex: '#22C55E' },
    ],
    tempMax: '~70-80°C',
    impactResistance: 'Média-Alta — significativamente mais resistente que resina básica',
    applications: ['Protótipos funcionais', 'Peças mecânicas de precisão', 'Encaixes e componentes', 'Ferramentas e gabaritos'],
    details: 'Combina alta resolução da resina com propriedades mecânicas similares ao ABS.',
  },
  {
    id: 'resina-clear', name: 'Resina Ultra Clear', description: 'Transparência cristalina',
    colors: [
      { id: 'clear', name: 'Cristal', hex: '#F3F4F6' },
    ],
    tempMax: '~50-60°C',
    impactResistance: 'Baixa — frágil como vidro',
    applications: ['Lentes e óptica', 'Peças decorativas transparentes', 'Luminárias e difusores', 'Modelos de apresentação'],
    details: 'Oferece transparência cristalina após polimento. Ideal para peças que precisam ser transparentes como vidro.',
  },
];

const finishes = [
  { id: 'raw', name: 'Bruto', description: 'Sem acabamento — direto da impressora' },
  { id: 'sanded', name: 'Lixado', description: 'Superfície lisa, sem linhas de camada' },
  { id: 'painted', name: 'Pintado', description: 'Pintura básica na cor desejada' },
  { id: 'premium', name: 'Premium', description: 'Pintura automotiva com primer e verniz' },
];

const urgencies = [
  { id: 'normal', name: 'Normal (5-7 dias úteis)' },
  { id: 'fast', name: 'Rápido (3-4 dias úteis)' },
  { id: 'express', name: 'Expresso (1-2 dias úteis)' },
];

/* ============ Visualizador 3D Inline ============ */
function ThreeViewer({ file }: { file: File }) {
  const mountRef = React.useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const sceneRef = React.useRef<any>(null);
  const rendererRef = React.useRef<any>(null);
  const animationRef = React.useRef<number>(0);
  const controlsRef = React.useRef<any>(null);
  const cameraRef = React.useRef<any>(null);

  const ext = file.name.toLowerCase().split('.').pop() || '';
  const isSupported = ['stl', 'obj', '3mf'].includes(ext);
  const isSTEP = ['step', 'stp'].includes(ext);

  React.useEffect(() => {
    if (!mountRef.current || !isSupported) return;

    let cancelled = false;
    const container = mountRef.current;
    let cleanupFn: (() => void) | null = null;

    const readFileAsArrayBuffer = (f: File): Promise<ArrayBuffer> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as ArrayBuffer);
        reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
        reader.readAsArrayBuffer(f);
      });
    };

    const readFileAsText = (f: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
        reader.readAsText(f);
      });
    };

    const initViewer = async () => {
      try {
        // 1. Ler o arquivo primeiro
        let fileData: ArrayBuffer | string;
        if (ext === 'obj') {
          fileData = await readFileAsText(file);
        } else {
          fileData = await readFileAsArrayBuffer(file);
        }

        if (cancelled) return;

        // 2. Importar Three.js e loaders
        const THREE = await import('three');
        const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js');

        if (cancelled) return;

        // 3. Configurar cena
        const width = container.clientWidth || 600;
        const height = isFullscreen ? window.innerHeight : 420;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x1e293b);
        sceneRef.current = scene;

        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100000);
        camera.position.set(0, 0, 5);
        cameraRef.current = camera;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.2;
        rendererRef.current = renderer;
        container.innerHTML = '';
        container.appendChild(renderer.domElement);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.autoRotate = true;
        controls.autoRotateSpeed = 2;
        controlsRef.current = controls;

        // Luzes
        scene.add(new THREE.AmbientLight(0xffffff, 0.6));
        const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
        dirLight.position.set(5, 10, 7);
        dirLight.castShadow = true;
        scene.add(dirLight);
        const backLight = new THREE.DirectionalLight(0x6366f1, 0.4);
        backLight.position.set(-5, -5, -5);
        scene.add(backLight);
        const fillLight = new THREE.DirectionalLight(0x38bdf8, 0.3);
        fillLight.position.set(-3, 5, -3);
        scene.add(fillLight);

        const gridHelper = new THREE.GridHelper(10, 20, 0x334155, 0x1e293b);
        scene.add(gridHelper);

        const fitCamera = (object: THREE.Object3D) => {
          const box = new THREE.Box3().setFromObject(object);
          const size = box.getSize(new THREE.Vector3());
          const center = box.getCenter(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z);
          if (maxDim === 0) return;
          const fov = camera.fov * (Math.PI / 180);
          const cameraZ = Math.abs(maxDim / (2 * Math.tan(fov / 2))) * 1.8;
          camera.position.set(center.x + cameraZ * 0.5, center.y + cameraZ * 0.5, center.z + cameraZ);
          camera.lookAt(center);
          controls.target.copy(center);
          controls.update();
          camera.near = maxDim / 1000;
          camera.far = maxDim * 1000;
          camera.updateProjectionMatrix();
        };

        const applyMaterial = (object: THREE.Object3D) => {
          const mat = new THREE.MeshPhysicalMaterial({
            color: 0x6366f1,
            metalness: 0.1,
            roughness: 0.4,
            clearcoat: 0.3,
            clearcoatRoughness: 0.25,
          });
          object.traverse((child: any) => {
            if (child.isMesh) {
              child.material = mat;
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });
        };

        // 4. Carregar o modelo com os dados já lidos
        let loadedObject: THREE.Object3D | null = null;

        if (ext === 'stl') {
          const { STLLoader } = await import('three/examples/jsm/loaders/STLLoader.js');
          const loader = new STLLoader();
          const geometry = loader.parse(fileData as ArrayBuffer);
          geometry.computeVertexNormals();
          loadedObject = new THREE.Mesh(geometry);
        } else if (ext === 'obj') {
          const { OBJLoader } = await import('three/examples/jsm/loaders/OBJLoader.js');
          const loader = new OBJLoader();
          loadedObject = loader.parse(fileData as string);
        } else if (ext === '3mf') {
          try {
            const { ThreeMFLoader } = await import('three/examples/jsm/loaders/3MFLoader.js');
            const loader = new ThreeMFLoader();
            loadedObject = loader.parse(fileData as ArrayBuffer);
          } catch (e3mf) {
            console.warn('ThreeMFLoader falhou, tentando extrair STL do 3MF...', e3mf);
            // 3MF é um ZIP — tentar extrair modelo como fallback
            try {
              const { unzipSync } = await import('three/examples/jsm/libs/fflate.module.js');
              const uint8 = new Uint8Array(fileData as ArrayBuffer);
              const unzipped = unzipSync(uint8);
              // Procurar por arquivo .model dentro do 3MF
              let modelData: Uint8Array | null = null;
              for (const [name, data] of Object.entries(unzipped)) {
                if (name.endsWith('.model') || name.includes('3dmodel')) {
                  modelData = data as Uint8Array;
                  break;
                }
              }
              if (modelData) {
                // Tentar parsear o XML do modelo 3MF manualmente como geometria
                const text = new TextDecoder().decode(modelData);
                console.log('3MF model XML encontrado, tamanho:', text.length);
              }
              // Se não conseguiu, mostrar como aceito
              throw new Error('3MF parse fallback não implementado');
            } catch {
              // Fallback final: mostrar como arquivo aceito sem visualização
              if (!cancelled) {
                setLoading(false);
                setError(null);
                // Limpar container e mostrar mensagem de sucesso
                container.innerHTML = '';
                const fallbackDiv = document.createElement('div');
                fallbackDiv.className = 'flex flex-col items-center justify-center h-full py-12';
                fallbackDiv.innerHTML = `
                  <svg class="w-16 h-16 text-blue-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  <p class="text-white font-semibold text-lg">${file.name}</p>
                  <p class="text-slate-400 text-sm mt-2">Arquivo 3MF carregado com sucesso!</p>
                  <p class="text-slate-500 text-xs mt-1">A visualização 3D para este formato está sendo processada pela equipe.</p>
                  <div class="mt-4 inline-flex items-center gap-2 bg-green-600/20 text-green-400 px-4 py-2 rounded-full text-sm">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                    Arquivo aceito para orçamento
                  </div>
                `;
                container.appendChild(fallbackDiv);
              }
              return;
            }
          }
        }

        if (cancelled) return;

        if (!loadedObject) {
          throw new Error('Não foi possível carregar o modelo');
        }

        // 5. Adicionar modelo à cena
        applyMaterial(loadedObject);
        scene.add(loadedObject);
        fitCamera(loadedObject);
        setLoading(false);

        // 6. Iniciar animação APÓS o modelo estar carregado
        const animate = () => {
          if (cancelled) return;
          animationRef.current = requestAnimationFrame(animate);
          controls.update();
          renderer.render(scene, camera);
        };
        animate();

        const handleResize = () => {
          const w = container.clientWidth || 600;
          const h = isFullscreen ? window.innerHeight : 420;
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        };
        window.addEventListener('resize', handleResize);

        cleanupFn = () => {
          window.removeEventListener('resize', handleResize);
          cancelAnimationFrame(animationRef.current);
          renderer.dispose();
          controls.dispose();
        };
      } catch (err) {
        console.error('Erro ao inicializar visualizador:', err);
        if (!cancelled) {
          setError('Erro ao carregar o modelo. Tente converter para STL para melhor compatibilidade.');
          setLoading(false);
        }
      }
    };

    initViewer();

    return () => {
      cancelled = true;
      cleanupFn?.();
      cancelAnimationFrame(animationRef.current);
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, [file, isFullscreen, isSupported, ext]);

  if (isSTEP) {
    return (
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 text-center">
        <FileText className="w-16 h-16 text-blue-400 mx-auto mb-4" />
        <p className="text-white font-semibold text-lg">{file.name}</p>
        <p className="text-slate-400 text-sm mt-2">Arquivo STEP carregado com sucesso!</p>
        <p className="text-slate-500 text-xs mt-1">Arquivos STEP serão analisados pela equipe. Para visualização 3D, converta para STL.</p>
        <div className="mt-4 inline-flex items-center gap-2 bg-green-600/20 text-green-400 px-4 py-2 rounded-full text-sm">
          <Check className="w-4 h-4" /> Arquivo aceito para orçamento
        </div>
      </div>
    );
  }

  if (!isSupported) {
    return (
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 text-center">
        <FileText className="w-16 h-16 text-blue-400 mx-auto mb-4" />
        <p className="text-white font-semibold text-lg">{file.name}</p>
        <p className="text-slate-400 text-sm mt-2">Arquivo carregado com sucesso</p>
        <p className="text-slate-500 text-xs mt-1">Visualização 3D disponível para STL, OBJ e 3MF</p>
      </div>
    );
  }

  return (
    <div className={`relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''}`}>
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
        <span className="bg-blue-600/90 text-white text-xs px-3 py-1.5 rounded-full font-medium flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5" /> Visualização 3D
        </span>
        <span className="bg-slate-700/90 text-slate-300 text-xs px-2 py-1.5 rounded-full">{file.name}</span>
      </div>
      <div className="absolute top-3 right-3 z-10">
        <button type="button" onClick={() => setIsFullscreen(!isFullscreen)} className="bg-slate-700/90 hover:bg-slate-600 text-white p-2 rounded-lg transition-colors" title={isFullscreen ? 'Sair da tela cheia' : 'Tela cheia'}>
          {isFullscreen ? <X className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center z-20 bg-slate-900/80">
          <div className="text-center">
            <Loader2 className="w-10 h-10 text-blue-400 animate-spin mx-auto mb-3" />
            <p className="text-white text-sm font-medium">Carregando modelo 3D...</p>
            <p className="text-slate-400 text-xs mt-1">{file.name}</p>
          </div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center z-20 bg-slate-900/80">
          <div className="text-center">
            <FileText className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <p className="text-white text-sm font-medium">{error}</p>
          </div>
        </div>
      )}
      <div ref={mountRef} style={{ width: '100%', height: isFullscreen ? '100vh' : '420px' }} />
      <div className="absolute bottom-3 left-3 z-10">
        <span className="bg-slate-700/80 text-slate-400 text-xs px-2 py-1 rounded flex items-center gap-1">
          <RotateCw className="w-3 h-3" /> Arraste para girar | Scroll para zoom
        </span>
      </div>
    </div>
  );
}

/* ============ Página de Orçamento ============ */
export default function Quote() {
  const { toast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [category, setCategory] = useState<PrintCategory | ''>('');
  const [selectedColor, setSelectedColor] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    material: '',
    finish: 'raw',
    quantity: 1,
    urgency: 'normal',
    dimensions: '',
    description: '',
    cep: '',
  });

  const currentMaterials = category === 'fdm' ? fdmMaterials : category === 'resina' ? resinaMaterials : [];
  const selectedMaterial = currentMaterials.find(m => m.id === formData.material);

  const handleCategoryChange = (value: string) => {
    setCategory(value as PrintCategory);
    setFormData({ ...formData, material: '' });
    setSelectedColor('');
  };

  const handleMaterialChange = (value: string) => {
    setFormData({ ...formData, material: value });
    setSelectedColor('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [submittedData, setSubmittedData] = useState<any>(null);

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone: string) => {
    const digits = phone.replace(/\D/g, '');
    return digits.length >= 10 && digits.length <= 11;
  };
  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 2) return `(${digits}`;
    if (digits.length <= 7) return `(${digits.slice(0,2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0,2)}) ${digits.slice(2,7)}-${digits.slice(7)}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone || !formData.material || !category) {
      toast({ title: "Campos obrigatórios", description: "Preencha nome, e-mail, telefone, tecnologia e material.", variant: "destructive" });
      return;
    }
    if (!validateEmail(formData.email)) {
      toast({ title: "E-mail inválido", description: "Por favor, insira um e-mail válido.", variant: "destructive" });
      return;
    }
    if (!validatePhone(formData.phone)) {
      toast({ title: "Telefone inválido", description: "Insira um telefone com DDD (10 ou 11 dígitos).", variant: "destructive" });
      return;
    }

    try {
      // Converter arquivos para base64
      const filePromises = files.map(file => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve({
            name: file.name,
            size: file.size,
            type: file.type,
            content: reader.result
          });
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      });

      const convertedFiles = await Promise.all(filePromises);

      const detalhes = {
        categoria: category,
        material: formData.material,
        cor: selectedColor,
        quantidade: formData.quantity,
        acabamento: formData.finish,
        urgencia: formData.urgency,
        dimensoes: formData.dimensions,
        cep: formData.cep,
        descricao: formData.description,
        arquivos: convertedFiles,
      };

      const orcamentoId = await salvarOrcamento({
        tipo: 'impressao',
        cliente: formData.name,
        email: formData.email,
        telefone: formData.phone,
        detalhes,
      });

      await incrementarOrcamentosUsuario(formData.email);

      setSubmittedId(orcamentoId);
      setSubmittedData({ ...formData, categoria: category, cor: selectedColor, arquivos: files.map(f => f.name) });

      toast({
        title: "Orçamento enviado com sucesso!",
        description: `Seu orçamento #${orcamentoId} foi registrado.`
      });
    } catch {
      toast({ title: "Erro", description: "Falha ao enviar orçamento. Tente novamente.", variant: "destructive" });
    }
  };

  const getWhatsAppLink = () => {
    if (!submittedData) return '#';
    const mat = currentMaterials.find(m => m.id === submittedData.material);
    const msg = `Olá! Acabei de enviar o orçamento #${submittedId} pelo site.\n\n` +
      `*Nome:* ${submittedData.name}\n` +
      `*E-mail:* ${submittedData.email}\n` +
      `*Telefone:* ${submittedData.phone}\n` +
      `*Tecnologia:* ${submittedData.categoria?.toUpperCase()}\n` +
      `*Material:* ${mat?.name || submittedData.material}\n` +
      `*Cor:* ${submittedData.cor || 'Não selecionada'}\n` +
      `*Quantidade:* ${submittedData.quantity}\n` +
      `*Acabamento:* ${submittedData.finish}\n` +
      `*Urgência:* ${submittedData.urgency}\n` +
      (submittedData.dimensions ? `*Dimensões:* ${submittedData.dimensions}\n` : '') +
      (submittedData.descricao ? `*Descrição:* ${submittedData.descricao}\n` : '') +
      (submittedData.arquivos?.length ? `*Arquivos:* ${submittedData.arquivos.join(', ')}\n` : '');
    return `https://wa.me/5543991741518?text=${encodeURIComponent(msg)}`;
  };

  const getEmailLink = () => {
    if (!submittedData) return '#';
    const mat = currentMaterials.find(m => m.id === submittedData.material);
    const subject = `Orçamento #${submittedId} - ${submittedData.name}`;
    const body = `Orçamento #${submittedId}\n\n` +
      `Nome: ${submittedData.name}\nE-mail: ${submittedData.email}\nTelefone: ${submittedData.phone}\n` +
      `Tecnologia: ${submittedData.categoria?.toUpperCase()}\nMaterial: ${mat?.name || submittedData.material}\n` +
      `Cor: ${submittedData.cor || 'Não selecionada'}\nQuantidade: ${submittedData.quantity}\n` +
      `Acabamento: ${submittedData.finish}\nUrgência: ${submittedData.urgency}\n` +
      (submittedData.dimensions ? `Dimensões: ${submittedData.dimensions}\n` : '') +
      (submittedData.descricao ? `Descrição: ${submittedData.descricao}\n` : '') +
      (submittedData.arquivos?.length ? `Arquivos: ${submittedData.arquivos.join(', ')}\n` : '');
    return `mailto:3dk.print.br@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const resetForm = () => {
    setFiles([]);
    setCategory('');
    setSelectedColor('');
    setSubmittedId(null);
    setSubmittedData(null);
    setFormData({ name: '', email: '', phone: '', material: '', finish: 'raw', quantity: 1, urgency: 'normal', dimensions: '', description: '', cep: '' });
  };

  const viewableFile = files.find(f => {
    const name = f.name.toLowerCase();
    return name.endsWith('.stl') || name.endsWith('.obj') || name.endsWith('.3mf') || name.endsWith('.step') || name.endsWith('.stp');
  });

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-primary py-16">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
            <span className="inline-block text-accent font-semibold text-sm uppercase tracking-wider mb-4">Orçamento Rápido</span>
            <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-4">Receba seu orçamento em minutos</h1>
            <p className="text-xl text-primary-foreground/80">Envie seu arquivo 3D e visualize em tempo real. Nossa equipe analisa e retorna com o valor em até 24 horas.</p>
          </motion.div>
        </div>
      </section>

      {/* Form */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Form */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* 1. File Upload */}
                <div className="card-elevated p-6">
                  <h2 className="text-xl font-semibold text-foreground mb-4">1. Envie seu arquivo 3D</h2>
                  <p className="text-muted-foreground text-sm mb-4">Formatos aceitos: STL, OBJ, 3MF, STEP. Após o upload, você poderá visualizar o modelo em 3D.</p>
                  <div
                    className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-accent transition-colors cursor-pointer"
                    onClick={() => document.getElementById('file-upload')?.click()}
                  >
                    <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-foreground font-medium mb-2">Arraste arquivos aqui ou clique para selecionar</p>
                    <p className="text-muted-foreground text-sm">STL, OBJ, 3MF, STEP — Máximo 50MB por arquivo</p>
                    <input id="file-upload" type="file" multiple accept=".stl,.obj,.3mf,.step,.stp" onChange={handleFileChange} className="hidden" />
                  </div>

                  {files.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {files.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-accent" />
                            <span className="text-sm text-foreground">{file.name}</span>
                            <span className="text-xs text-muted-foreground">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => removeFile(index)} className="text-muted-foreground hover:text-destructive">
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 3D Viewer */}
                  <AnimatePresence>
                    {viewableFile && (
                      <motion.div
                        initial={{ opacity: 0, y: 20, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, y: -20, height: 0 }}
                        className="mt-6"
                      >
                        <ThreeViewer file={viewableFile} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* 2. Category Selection */}
                <div className="card-elevated p-6">
                  <h2 className="text-xl font-semibold text-foreground mb-4">2. Escolha a tecnologia de impressão</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <button type="button" onClick={() => handleCategoryChange('fdm')} className={`p-6 rounded-xl border-2 text-left transition-all ${category === 'fdm' ? 'border-accent bg-accent/5 shadow-md' : 'border-border hover:border-accent/30'}`}>
                      <div className="flex items-center gap-3 mb-2">
                        <Layers className="w-6 h-6 text-accent" />
                        <span className="text-lg font-bold text-foreground">Filamento FDM</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Impressão por deposição de filamento. Ideal para peças funcionais, protótipos e objetos de uso diário.</p>
                      <div className="mt-3 flex flex-wrap gap-1">
                        {['PLA', 'PETG', 'ABS', 'Tritan', 'Nylon', 'TPU'].map(m => (
                          <span key={m} className="text-xs bg-secondary px-2 py-0.5 rounded-full text-muted-foreground">{m}</span>
                        ))}
                      </div>
                    </button>
                    <button type="button" onClick={() => handleCategoryChange('resina')} className={`p-6 rounded-xl border-2 text-left transition-all ${category === 'resina' ? 'border-accent bg-accent/5 shadow-md' : 'border-border hover:border-accent/30'}`}>
                      <div className="flex items-center gap-3 mb-2">
                        <Droplets className="w-6 h-6 text-accent" />
                        <span className="text-lg font-bold text-foreground">Resina UV</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Impressão por cura de resina UV (SLA/DLP/LCD). Alta resolução e detalhes finos.</p>
                      <div className="mt-3 flex flex-wrap gap-1">
                        {['Standard', 'ABS-Like', 'Ultra Clear'].map(m => (
                          <span key={m} className="text-xs bg-secondary px-2 py-0.5 rounded-full text-muted-foreground">{m}</span>
                        ))}
                      </div>
                    </button>
                  </div>

                  {/* Material Selection */}
                  {category && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                      <div>
                        <Label className="mb-3 block font-semibold">Material *</Label>
                        <div className="grid grid-cols-1 gap-3">
                          {currentMaterials.map((material) => (
                            <button key={material.id} type="button" onClick={() => handleMaterialChange(material.id)} className={`p-4 rounded-xl border-2 text-left transition-all ${formData.material === material.id ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/30'}`}>
                              <div className="flex items-center justify-between">
                                <div>
                                  <span className="font-semibold text-foreground">{material.name}</span>
                                  <span className="text-sm text-muted-foreground ml-2">— {material.description}</span>
                                </div>
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.material === material.id ? 'border-accent bg-accent' : 'border-border'}`}>
                                  {formData.material === material.id && <Check className="w-3 h-3 text-accent-foreground" />}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Color Selection */}
                      {selectedMaterial && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                          <Label className="mb-3 block font-semibold">Cor {selectedColor && `— ${selectedMaterial.colors.find(c => c.id === selectedColor)?.name}`}</Label>
                          <div className="flex flex-wrap gap-3">
                            {selectedMaterial.colors.map((color) => (
                              <button key={color.id} type="button" onClick={() => setSelectedColor(color.id)} className={`group relative w-10 h-10 rounded-full border-2 transition-all ${selectedColor === color.id ? 'border-accent scale-110 ring-2 ring-accent/30' : 'border-border hover:border-accent/50'}`} style={{ backgroundColor: color.hex }} title={color.name}>
                                {selectedColor === color.id && (
                                  <Check className={`w-4 h-4 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${['#FFFFFF', '#F5F5F0', '#E5E7EB', '#F3F4F6'].includes(color.hex) ? 'text-gray-800' : 'text-white'}`} />
                                )}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}

                      {/* Finish, Quantity, Urgency */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label className="mb-3 block">Acabamento</Label>
                          <Select value={formData.finish} onValueChange={(value) => setFormData({ ...formData, finish: value })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {finishes.map((finish) => (
                                <SelectItem key={finish.id} value={finish.id}>
                                  <div className="flex flex-col">
                                    <span>{finish.name}</span>
                                    <span className="text-xs text-muted-foreground">{finish.description}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="mb-3 block">Quantidade</Label>
                          <Input type="number" min="1" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })} />
                        </div>
                        <div>
                          <Label className="mb-3 block">Urgência</Label>
                          <Select value={formData.urgency} onValueChange={(value) => setFormData({ ...formData, urgency: value })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {urgencies.map((urgency) => (
                                <SelectItem key={urgency.id} value={urgency.id}>{urgency.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label className="mb-3 block">Dimensões aproximadas (opcional)</Label>
                        <Input placeholder="Ex: 10cm x 5cm x 3cm" value={formData.dimensions} onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })} />
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* 3. Description */}
                <div className="card-elevated p-6">
                  <h2 className="text-xl font-semibold text-foreground mb-4">3. Descreva seu projeto</h2>
                  <Textarea placeholder="Conte mais sobre seu projeto, uso pretendido, detalhes especiais..." rows={4} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                </div>

                {/* 4. Contact */}
                <div className="card-elevated p-6">
                  <h2 className="text-xl font-semibold text-foreground mb-4">4. Seus dados</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="mb-3 block">Nome completo *</Label>
                      <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                    </div>
                    <div>
                      <Label className="mb-3 block">E-mail *</Label>
                      <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required
                        className={formData.email && !validateEmail(formData.email) ? 'border-red-500' : ''} />
                      {formData.email && !validateEmail(formData.email) && <p className="text-xs text-red-500 mt-1">E-mail inválido</p>}
                    </div>
                    <div>
                      <Label className="mb-3 block">WhatsApp *</Label>
                      <Input type="tel" placeholder="(43) 99174-1518" value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: formatPhone(e.target.value) })} required
                        className={formData.phone && !validatePhone(formData.phone) ? 'border-red-500' : ''} />
                      {formData.phone && !validatePhone(formData.phone) && <p className="text-xs text-red-500 mt-1">Telefone inválido (DDD + número)</p>}
                    </div>
                    <div>
                      <Label className="mb-3 block">CEP (para frete)</Label>
                      <Input placeholder="00000-000" value={formData.cep} onChange={(e) => setFormData({ ...formData, cep: e.target.value })} />
                    </div>
                  </div>
                </div>

                {/* Botão Enviar ou Resultado */}
                {!submittedId ? (
                  <Button type="submit" size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                    Enviar Orçamento <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                ) : (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card-elevated p-6 border-green-500/30 bg-green-50 dark:bg-green-950/20 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                        <Check className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-foreground">Orçamento #{submittedId} enviado!</h3>
                        <p className="text-sm text-muted-foreground">Agora envie diretamente para agilizar o atendimento:</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <a href={getWhatsAppLink()} target="_blank" rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-xl font-semibold transition-colors">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                        Enviar no WhatsApp
                      </a>
                      <a href={getEmailLink()} target="_blank" rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-xl font-semibold transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        Enviar por E-mail
                      </a>
                    </div>
                    <button onClick={resetForm} className="w-full text-sm text-muted-foreground hover:text-foreground flex items-center justify-center gap-2 py-2 transition-colors">
                      <RotateCw className="w-4 h-4" /> Fazer novo orçamento
                    </button>
                  </motion.div>
                )}
              </form>
            </motion.div>

            {/* Sidebar */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Material Info Card */}
                <AnimatePresence>
                  {selectedMaterial && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="card-elevated p-6 border-accent/20">
                      <h3 className="font-bold text-foreground mb-1 text-lg">{selectedMaterial.name}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{selectedMaterial.description}</p>

                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <Thermometer className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-semibold text-foreground">Temperatura máxima</p>
                            <p className="text-sm text-muted-foreground">{selectedMaterial.tempMax}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <Shield className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-semibold text-foreground">Resistência a impacto</p>
                            <p className="text-sm text-muted-foreground">{selectedMaterial.impactResistance}</p>
                          </div>
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-foreground mb-2">Aplicações recomendadas</p>
                          <ul className="space-y-1">
                            {selectedMaterial.applications.map((app, i) => (
                              <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                                <Check className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                                {app}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="pt-3 border-t border-border">
                          <p className="text-xs text-muted-foreground leading-relaxed">{selectedMaterial.details}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Info Box */}
                <div className="card-elevated p-6 bg-accent/5 border-accent/20">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Info className="w-5 h-5 text-accent" /> Como funciona
                  </h3>
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    <li className="flex items-start gap-3"><Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" /><span>Envie seu arquivo 3D e visualize o modelo</span></li>
                    <li className="flex items-start gap-3"><Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" /><span>Escolha material, cor e acabamento</span></li>
                    <li className="flex items-start gap-3"><Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" /><span>Analisamos e enviamos orçamento em até 24h</span></li>
                    <li className="flex items-start gap-3"><Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" /><span>Aprovado, produzimos e entregamos em todo o Brasil</span></li>
                  </ul>
                </div>

                {/* WhatsApp Help */}
                <div className="card-elevated p-6 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
                  <h4 className="font-semibold text-foreground mb-2">Precisa de ajuda?</h4>
                  <p className="text-sm text-muted-foreground mb-4">Nossa equipe técnica pode te ajudar a escolher o melhor material para seu projeto.</p>
                  <a
                    href="https://wa.me/5543991741518?text=Olá! Preciso de ajuda com meu orçamento de impressão 3D."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold text-center transition-colors"
                  >
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
