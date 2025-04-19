
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, Check, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface FileUploadProps {
  bucketName: string;
  onUploadComplete: (url: string, fileName?: string, fileSize?: number) => void;
  accept?: string;
  maxSize?: number;
  buttonText?: string;
  fieldLabel?: string;
  initialFileUrl?: string;
  folder?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  bucketName,
  onUploadComplete,
  accept = '*',
  maxSize = 5, // 5MB padrão
  buttonText = 'Upload do Arquivo',
  fieldLabel = 'Selecione um arquivo',
  initialFileUrl
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(initialFileUrl || null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Ref para controlar chamadas duplicadas
  const isUploadingRef = useRef(false);
  const toastShownRef = useRef(false);

  // Atualizar estado local quando initialFileUrl mudar
  useEffect(() => {
    if (initialFileUrl !== uploadedFileUrl) {
      setUploadedFileUrl(initialFileUrl || null);
    }
  }, [initialFileUrl]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    // Prevenir uploads duplicados
    if (isUploadingRef.current) {
      console.log('Upload já em andamento, ignorando nova solicitação');
      return;
    }
    
    const file = files[0];
    
    // Verificar o tamanho do arquivo
    if (file.size > maxSize * 1024 * 1024) {
      setError(`O arquivo excede o tamanho máximo de ${maxSize}MB`);
      toast({
        title: 'Erro no upload',
        description: `O arquivo excede o tamanho máximo de ${maxSize}MB`,
        variant: 'destructive',
      });
      return;
    }
    
    try {
      // Resetar o toast para garantir que será mostrado apenas uma vez
      toastShownRef.current = false;
      
      // Marcar que um upload está em andamento
      isUploadingRef.current = true;
      
      setError(null);
      setUploading(true);
      setFileName(file.name);
      
      // Gerar um nome de arquivo único
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;
      
      console.log('Iniciando upload para', { bucketName, filePath });
      
      // Fazer upload para o Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true // Alterado para true para permitir substituição
        });
      
      if (error) throw error;
      
      console.log('Upload completo:', data);
      
      // Obter a URL pública do arquivo
      const { data: publicURLData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);
      
      const publicURL = publicURLData.publicUrl;
      console.log('URL pública do arquivo:', publicURL);
      
      // Atualizar o estado local
      setUploadedFileUrl(publicURL);
      
      // Chamar o callback onUploadComplete com a URL pública
      onUploadComplete(publicURL, file.name, file.size);
      
      // Mostrar toast apenas uma vez
      if (!toastShownRef.current) {
        toast({
          title: 'Upload concluído',
          description: 'O arquivo foi enviado com sucesso.',
        });
        toastShownRef.current = true;
      }
    } catch (error: any) {
      console.error('Erro no upload:', error);
      setError(error.message || 'Erro ao fazer upload do arquivo');
      toast({
        title: 'Erro no upload',
        description: error.message || 'Ocorreu um erro ao fazer upload do arquivo.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      // Resetar o flag de upload em andamento após um breve delay
      setTimeout(() => {
        isUploadingRef.current = false;
      }, 300);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="file-upload">{fieldLabel}</Label>
        <div className="flex flex-col gap-3">
          <Button
            type="button"
            variant="outline"
            className={`w-full ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={uploading}
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            {uploading ? (
              <span className="flex items-center gap-2">
                <Upload className="h-4 w-4 animate-pulse" />
                Enviando...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                {buttonText}
              </span>
            )}
          </Button>
          
          <input
            id="file-upload"
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
            disabled={uploading}
          />
          
          {fileName && !error && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {uploadedFileUrl ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : null}
              <span className="truncate">{fileName}</span>
            </div>
          )}
          
          {error && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}
          
          {uploadedFileUrl && !error && (
            <div className="mt-2">
              <img
                src={uploadedFileUrl}
                alt="Preview"
                className="h-20 w-20 object-contain border rounded"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
