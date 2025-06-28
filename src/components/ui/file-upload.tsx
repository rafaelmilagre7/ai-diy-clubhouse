import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X, FileText, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onUploadComplete: (url: string, fileName?: string, fileSize?: number) => void;
  accept?: string;
  maxSize?: number; // em MB
  className?: string;
  bucket?: string;
  bucketName?: string; // Adicionar suporte para bucketName também
  folder?: string;
  buttonText?: string;
  fieldLabel?: string;
  initialFileUrl?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onUploadComplete,
  accept = "*/*",
  maxSize = 10, // 10MB por padrão
  className,
  bucket = 'learning-content',
  bucketName, // Adicionar suporte para bucketName
  folder = 'uploads',
  buttonText = 'Selecionar Arquivo',
  fieldLabel = '',
  initialFileUrl
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Usar bucketName se fornecido, senão usar bucket
  const finalBucket = bucketName || bucket;
  const maxSizeBytes = maxSize * 1024 * 1024;

  const handleUpload = async (file: File) => {
    if (!file) return;

    if (file.size > maxSizeBytes) {
      toast.error(`Arquivo muito grande. Tamanho máximo: ${maxSize}MB`);
      return;
    }

    setUploading(true);

    try {
      const fileName = `${folder}/${Date.now()}-${file.name}`;
      
      // Upload para o Supabase Storage
      const { data, error } = await supabase.storage
        .from(finalBucket)
        .upload(fileName, file);

      if (error) {
        console.error('Erro no upload:', error);
        toast.error('Erro ao fazer upload do arquivo');
        return;
      }

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from(finalBucket)
        .getPublicUrl(fileName);

      setUploadedFile(file.name);
      onUploadComplete(publicUrl, file.name, file.size);
      toast.success('Arquivo enviado com sucesso!');

    } catch (error) {
      console.error('Erro inesperado no upload:', error);
      toast.error('Erro inesperado ao fazer upload');
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleUpload(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleUpload(files[0]);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={cn("w-full", className)}>
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
          dragActive 
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/20 hover:border-muted-foreground/40",
          uploading && "opacity-50 pointer-events-none"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
        />

        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Enviando arquivo...</p>
          </div>
        ) : uploadedFile || initialFileUrl ? (
          <div className="flex items-center justify-center gap-2">
            <FileText className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium">{uploadedFile || 'Arquivo atual'}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={removeFile}
              className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <Upload className="h-8 w-8 text-muted-foreground" />
            <div className="space-y-1">
              <p className="text-sm font-medium">
                {fieldLabel || 'Clique para fazer upload ou arraste arquivos aqui'}
              </p>
              <p className="text-xs text-muted-foreground">
                Tamanho máximo: {maxSize}MB
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              {buttonText}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
