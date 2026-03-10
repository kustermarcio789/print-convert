import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { ThreeMFLoader } from 'three/examples/jsm/loaders/3MFLoader.js';
import { Loader2, AlertCircle, Box } from 'lucide-react';

interface ThreeViewerProps {
  fileUrl: string;
  fileName: string;
  fileType: string;
}

export default function ThreeViewer({ fileUrl, fileName, fileType }: ThreeViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight || 500;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f4f8);

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 10000);
    camera.position.set(0, 0, 5);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enablePan = true;
    controls.enableZoom = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 2;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
    directionalLight2.position.set(-5, -5, -5);
    scene.add(directionalLight2);

    const hemisphereLight = new THREE.HemisphereLight(0xddeeff, 0x0f0e0d, 0.5);
    scene.add(hemisphereLight);

    // Grid helper
    const gridHelper = new THREE.GridHelper(10, 20, 0xcccccc, 0xe0e0e0);
    scene.add(gridHelper);

    // Material for loaded models
    const defaultMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x4a90d9,
      metalness: 0.1,
      roughness: 0.4,
      clearcoat: 0.3,
      clearcoatRoughness: 0.2,
    });

    // Progress callback
    const onProgress = (event: ProgressEvent) => {
      if (event.lengthComputable) {
        const pct = Math.round((event.loaded / event.total) * 100);
        setProgress(pct);
      }
    };

    // Error callback
    const onError = (err: any) => {
      console.error('Erro ao carregar modelo:', err);
      setError('Erro ao carregar o modelo 3D. Verifique se o arquivo é válido.');
      setLoading(false);
    };

    // Center and scale model
    const centerAndScale = (object: THREE.Object3D) => {
      const box = new THREE.Box3().setFromObject(object);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 3 / maxDim;
      
      object.position.sub(center);
      object.scale.multiplyScalar(scale);
      
      // Recalculate after scaling
      const newBox = new THREE.Box3().setFromObject(object);
      const newCenter = newBox.getCenter(new THREE.Vector3());
      object.position.sub(newCenter);
      object.position.y += newBox.getSize(new THREE.Vector3()).y / 2;

      // Adjust camera
      const distance = maxDim * scale * 2.5;
      camera.position.set(distance, distance * 0.8, distance);
      camera.lookAt(0, 0, 0);
      controls.target.set(0, 0, 0);
      controls.update();
    };

    // Load model based on file type
    const ext = (fileType || fileName.split('.').pop() || '').toLowerCase();

    try {
      if (ext.includes('stl')) {
        const loader = new STLLoader();
        loader.load(
          fileUrl,
          (geometry) => {
            geometry.computeVertexNormals();
            const mesh = new THREE.Mesh(geometry, defaultMaterial);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            scene.add(mesh);
            centerAndScale(mesh);
            setLoading(false);
          },
          onProgress,
          onError
        );
      } else if (ext.includes('obj')) {
        const loader = new OBJLoader();
        loader.load(
          fileUrl,
          (object) => {
            object.traverse((child: any) => {
              if (child.isMesh) {
                child.material = defaultMaterial;
                child.castShadow = true;
                child.receiveShadow = true;
              }
            });
            scene.add(object);
            centerAndScale(object);
            setLoading(false);
          },
          onProgress,
          onError
        );
      } else if (ext.includes('3mf')) {
        const loader = new ThreeMFLoader();
        loader.load(
          fileUrl,
          (object) => {
            object.traverse((child: any) => {
              if (child.isMesh) {
                if (!child.material || (child.material as THREE.Material).type === 'MeshBasicMaterial') {
                  child.material = defaultMaterial;
                }
                child.castShadow = true;
                child.receiveShadow = true;
              }
            });
            scene.add(object);
            centerAndScale(object);
            setLoading(false);
          },
          onProgress,
          onError
        );
      } else if (ext.includes('step') || ext.includes('stp')) {
        // STEP files require special handling - show info message
        setError('Arquivos STEP requerem conversão para visualização. Recomendamos converter para STL ou OBJ usando FreeCAD ou Fusion 360. O arquivo foi aceito e pode ser baixado.');
        setLoading(false);
      } else if (ext.includes('glb') || ext.includes('gltf')) {
        import('three/examples/jsm/loaders/GLTFLoader.js').then(({ GLTFLoader }) => {
          const loader = new GLTFLoader();
          loader.load(
            fileUrl,
            (gltf) => {
              scene.add(gltf.scene);
              centerAndScale(gltf.scene);
              setLoading(false);
            },
            onProgress,
            onError
          );
        });
      } else {
        setError(`Formato "${ext}" não suportado para visualização. Formatos aceitos: STL, OBJ, 3MF, GLB, GLTF`);
        setLoading(false);
      }
    } catch (e) {
      onError(e);
    }

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Resize handler
    const handleResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight || 500;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [fileUrl, fileName, fileType]);

  return (
    <div className="relative w-full h-full" style={{ minHeight: '500px' }}>
      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 z-10">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
          <p className="text-gray-600 font-medium">Carregando modelo 3D...</p>
          {progress > 0 && (
            <div className="mt-3 w-48">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-400 text-center mt-1">{progress}%</p>
            </div>
          )}
        </div>
      )}

      {/* Error overlay */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 z-10 p-8">
          <div className="bg-white rounded-2xl p-8 shadow-lg max-w-md text-center">
            <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
            <h3 className="font-bold text-lg text-gray-900 mb-2">Aviso</h3>
            <p className="text-gray-600 text-sm">{error}</p>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-700">
                <strong>Formatos suportados para visualização:</strong> STL, OBJ, 3MF, GLB, GLTF
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Arquivos STEP podem ser convertidos usando FreeCAD (gratuito)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 3D Canvas Container */}
      <div 
        ref={containerRef} 
        className="w-full h-full"
        style={{ minHeight: '500px' }}
      />
    </div>
  );
}
