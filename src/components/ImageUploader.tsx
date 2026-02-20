import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { uploadArquivo, deleteArquivo } from '@/lib/supabaseClient';

interface ImageUploaderProps {
  bucket: string; // 'produtos', 'orcamentos', etc
  onImageUpload: (publicUrl: string, storagePath: string) => void;
  onImageDelete?: (storagePath: string) => void;
  currentImageUrl?: string;
  currentImagePath?: string;
  maxSizeMB?: number;
}

export function ImageUploader({
  bucket,
  onImageUpload,
  onImageDelete,
  currentImageUrl,
  currentImagePath,
  maxSizeMB = 5,
}: ImageUploaderProps) {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamanho
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      toast({
        title: 'Arquivo muito grande',
        description: `O arquivo deve ter no máximo ${maxSizeMB}MB.`,
        variant: 'destructive',
      });
      return;
    }

    // Validar tipo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Tipo de arquivo inválido',
        description: 'Envie uma imagem em formato JPG, PNG, WebP ou GIF.',
        variant: 'destructive',
      });
      return;
    }

    // Criar preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Fazer upload
    setIsUploading(true);
    try {
      const timestamp = Date.now();
      const fileName = `${timestamp}-${file.name}`;
      const path = `${bucket}/${fileName}`;

      const result = await uploadArquivo(bucket, path, file);

      if (result.success && result.publicUrl) {
        onImageUpload(result.publicUrl, result.path);
        toast({
          title: 'Imagem enviada com sucesso!',
          description: 'A imagem foi salva no servidor.',
        });
      } else {
        throw new Error('Falha ao fazer upload');
      }
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast({
        title: 'Erro ao enviar imagem',
        description: 'Tente novamente mais tarde.',
        variant: 'destructive',
      });
      setPreview(currentImageUrl || null);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteImage = async () => {
    if (!currentImagePath) return;

    try {
      const result = await deleteArquivo(bucket, currentImagePath);

      if (result.success) {
        setPreview(null);
        onImageDelete?.(currentImagePath);
        toast({
          title: 'Imagem removida',
          description: 'A imagem foi deletada com sucesso.',
        });
      }
    } catch (error) {
      console.error('Erro ao deletar imagem:', error);
      toast({
        title: 'Erro ao remover imagem',
        description: 'Tente novamente mais tarde.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-4">
      {preview ? (
        <div className="relative w-full h-64 bg-secondary rounded-lg overflow-hidden border border-border">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center gap-2 opacity-0 hover:opacity-100">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? <Loader className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              Trocar
            </Button>
            {currentImagePath && (
              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={handleDeleteImage}
                disabled={isUploading}
              >
                <X className="w-4 h-4" />
                Remover
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="w-full h-64 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-accent/50 transition-colors bg-secondary/30"
        >
          <ImageIcon className="w-12 h-12 text-muted-foreground mb-2" />
          <p className="text-sm font-medium text-foreground">Clique para enviar uma imagem</p>
          <p className="text-xs text-muted-foreground mt-1">ou arraste aqui (máx. {maxSizeMB}MB)</p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isUploading}
      />

      {isUploading && (
        <div className="flex items-center justify-center gap-2 p-3 bg-accent/10 rounded-lg border border-accent/20">
          <Loader className="w-4 h-4 animate-spin text-accent" />
          <span className="text-sm text-accent">Enviando imagem...</span>
        </div>
      )}
    </div>
  );
}
