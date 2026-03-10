import { useState, useRef } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  Upload,
  X,
  GripVertical,
  Eye,
  Download,
  Star,
  Trash2,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export interface GalleryImage {
  id: string;
  url: string;
  nome: string;
  principal?: boolean;
  tamanho?: number;
}

interface ImageGalleryProps {
  imagens: GalleryImage[];
  onImagesChange: (imagens: GalleryImage[]) => void;
  maxImages?: number;
  titulo?: string;
}

export default function ImageGallery({
  imagens,
  onImagesChange,
  maxImages = 10,
  titulo = 'Galeria de Imagens',
}: ImageGalleryProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewImage, setPreviewImage] = useState<GalleryImage | null>(null);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    if (imagens.length + files.length > maxImages) {
      toast({
        title: 'Limite de imagens atingido',
        description: `Você pode adicionar no máximo ${maxImages} imagens`,
        variant: 'destructive',
      });
      return;
    }

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Arquivo inválido',
          description: 'Por favor, selecione apenas arquivos de imagem',
          variant: 'destructive',
        });
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'Arquivo muito grande',
          description: 'O arquivo não pode exceder 5MB',
          variant: 'destructive',
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const novaImagem: GalleryImage = {
          id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          url: e.target?.result as string,
          nome: file.name,
          tamanho: file.size,
          principal: imagens.length === 0,
        };

        onImagesChange([...imagens, novaImagem]);
        toast({
          title: 'Imagem adicionada',
          description: `${file.name} foi adicionada à galeria`,
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleRemoveImage = (id: string) => {
    const novasImagens = imagens.filter((img) => img.id !== id);
    
    // Se a imagem removida era principal, marcar a primeira como principal
    if (imagens.find((img) => img.id === id)?.principal && novasImagens.length > 0) {
      novasImagens[0].principal = true;
    }

    onImagesChange(novasImagens);
    toast({
      title: 'Imagem removida',
      description: 'A imagem foi removida da galeria',
    });
  };

  const handleSetPrincipal = (id: string) => {
    const novasImagens = imagens.map((img) => ({
      ...img,
      principal: img.id === id,
    }));
    onImagesChange(novasImagens);
  };

  const handleReorder = (novasImagens: GalleryImage[]) => {
    onImagesChange(novasImagens);
  };

  const handleDownloadImage = (imagem: GalleryImage) => {
    const link = document.createElement('a');
    link.href = imagem.url;
    link.download = imagem.nome;
    link.click();
  };

  return (
    <div className="space-y-4">
      {/* Título */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">{titulo}</h3>
        <span className="text-sm text-muted-foreground">
          {imagens.length} / {maxImages}
        </span>
      </div>

      {/* Área de Upload */}
      {imagens.length < maxImages && (
        <motion.div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
          />

          <div className="flex flex-col items-center gap-3">
            <Upload className="w-8 h-8 text-muted-foreground" />
            <div>
              <p className="font-medium text-foreground">
                Arraste imagens aqui ou clique para selecionar
              </p>
              <p className="text-sm text-muted-foreground">
                Máximo {maxImages - imagens.length} imagem(ns) restante(s)
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Selecionar Imagens
            </Button>
          </div>
        </motion.div>
      )}

      {/* Galeria de Imagens */}
      {imagens.length > 0 && (
        <Reorder.Group
          axis="y"
          values={imagens}
          onReorder={handleReorder}
          className="space-y-3"
        >
          <AnimatePresence>
            {imagens.map((imagem, index) => (
              <Reorder.Item
                key={imagem.id}
                value={imagem}
                as="div"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex gap-4 items-start">
                  {/* Handle de Reordenação */}
                  <div className="cursor-grab active:cursor-grabbing pt-1">
                    <GripVertical className="w-5 h-5 text-muted-foreground" />
                  </div>

                  {/* Thumbnail */}
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-secondary/20 flex-shrink-0">
                    <img
                      src={imagem.url}
                      alt={imagem.nome}
                      className="w-full h-full object-cover"
                    />
                    {imagem.principal && (
                      <div className="absolute top-1 right-1 bg-primary rounded-full p-1">
                        <Star className="w-3 h-3 text-white fill-white" />
                      </div>
                    )}
                  </div>

                  {/* Informações */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {imagem.nome}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {imagem.tamanho ? `${(imagem.tamanho / 1024).toFixed(1)} KB` : 'Tamanho desconhecido'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Posição: {index + 1}
                    </p>
                  </div>

                  {/* Ações */}
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setPreviewImage(imagem)}
                      title="Visualizar"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownloadImage(imagem)}
                      title="Baixar"
                    >
                      <Download className="w-4 h-4" />
                    </Button>

                    {!imagem.principal && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSetPrincipal(imagem.id)}
                        title="Definir como principal"
                      >
                        <Star className="w-4 h-4" />
                      </Button>
                    )}

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveImage(imagem.id)}
                      className="text-destructive hover:text-destructive"
                      title="Remover"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Reorder.Item>
            ))}
          </AnimatePresence>
        </Reorder.Group>
      )}

      {/* Modal de Visualização */}
      <AnimatePresence>
        {previewImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPreviewImage(null)}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-2xl max-h-[80vh]"
            >
              <img
                src={previewImage.url}
                alt={previewImage.nome}
                className="w-full h-full object-contain rounded-lg"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setPreviewImage(null)}
                className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white"
              >
                <X className="w-5 h-5" />
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
