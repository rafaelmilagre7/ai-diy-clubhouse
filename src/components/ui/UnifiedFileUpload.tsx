import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Upload, AlertCircle, X, File, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

interface UnifiedFileUploadProps {
  bucketName: string;
  folder?: string;
  onUploadComplete: (url: string, fileName?: string, fileSize?: number) => void;
  accept?: string;
  maxSize?: number; // Em MB
  buttonText?: string;
  fieldLabel?: string;
  initialFileUrl?: string;
  disabled?: boolean;
  variant?: 'button' | 'dropzone';
}

export const UnifiedFileUpload: React.FC<UnifiedFileUploadProps> = ({
  bucketName,
  folder = '',
  onUploadComplete,
  accept = '*/*',
  maxSize = 100,
  buttonText = 'Upload do Arquivo',
  fieldLabel,
  initialFileUrl,
  disabled = false,
  variant = 'button',
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState<string | null>(null);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const validateFile = useCallback(async (file: File) => {
    // Validação local de tamanho
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSize) {
      throw new Error(`O arquivo é muito grande. O tamanho máximo é ${maxSize}MB.`);
    }

    // Validação via função do banco
    const { data, error } = await supabase.rpc('validate_file_upload', {
      file_name: file.name,
      file_size: file.size,
      file_type: file.type,
      bucket_name: bucketName
    });

    if (error) {
      console.warn('Erro na validação do servidor:', error);
      // Continuar com validação local se falhar no servidor
      return;
    }

    if (data && !data.valid) {
      throw new Error(data.error || 'Arquivo inválido');
    }
  }, [bucketName, maxSize]);

  const uploadFileToStorage = useCallback(async (file: File) => {
    setProgress(5);

    // Gerar nome único para o arquivo
    const fileExt = file.name.split('.').pop();
    const uniqueFileName = `${uuidv4()}.${fileExt}`;
    const filePath = folder ? `${folder}/${uniqueFileName}` : uniqueFileName;

    console.log(`Iniciando upload para bucket: ${bucketName}, pasta: ${folder}`);

    // Upload principal
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (error) {
      console.error('Erro no upload principal:', error);
      
      // Tentar fallback se o bucket não existir
      if (error.message.includes('bucket') || error.message.includes('not found')) {
        console.log('Tentando upload com bucket de fallback...');
        setProgress(30);
        
        const fallbackPath = `fallback/${bucketName}/${filePath}`;
        const { data: fallbackData, error: fallbackError } = await supabase.storage
          .from('general_storage')
          .upload(fallbackPath, file, {
            cacheControl: '3600',
            upsert: true,
          });

        if (fallbackError) {
          throw new Error(fallbackError.message);
        }

        setProgress(80);
        const { data: publicUrlData } = supabase.storage
          .from('general_storage')
          .getPublicUrl(fallbackPath);

        setProgress(100);
        return publicUrlData.publicUrl;
      }
      
      throw new Error(error.message);
    }

    setProgress(80);
    
    // Obter URL pública
    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(data.path);

    setProgress(100);
    return publicUrlData.publicUrl;
  }, [bucketName, folder]);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    setIsUploading(true);
    setProgress(0);
    setFileName(file.name);

    try {
      abortControllerRef.current = new AbortController();

      // Validar arquivo
      await validateFile(file);

      // Upload do arquivo
      const publicUrl = await uploadFileToStorage(file);

      onUploadComplete(publicUrl, file.name, file.size);

      toast({
        title: 'Upload realizado com sucesso',
        description: 'O arquivo foi enviado com sucesso.',
      });

    } catch (error: any) {
      console.error('Erro ao fazer upload:', error);
      
      const displayMessage = error.message || 'Erro ao fazer upload do arquivo.';
      setErrorMessage(displayMessage);

      toast({
        title: 'Erro ao fazer upload',
        description: displayMessage,
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      abortControllerRef.current = null;
      e.target.value = '';
    }
  }, [validateFile, uploadFileToStorage, onUploadComplete, toast]);

  const handleButtonClick = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  const handleCancelUpload = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsUploading(false);
      toast({
        title: 'Upload cancelado',
        description: 'O upload foi interrompido.',
      });
    }
  }, [toast]);

  if (variant === 'dropzone') {
    return (
      <div className="space-y-4">
        {fieldLabel && (
          <label className="text-sm font-medium text-foreground">
            {fieldLabel}
          </label>
        )}
        
        <div className="flex items-center justify-center w-full">
          <label
            className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors
              ${disabled || isUploading 
                ? 'opacity-50 cursor-not-allowed bg-muted' 
                : 'bg-background hover:bg-muted/50 border-border hover:border-primary/50'
              }`}
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              {isUploading ? (
                <>
                  <Loader2 className="w-8 h-8 mb-3 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">
                    Fazendo upload... {progress}%
                  </p>
                </>
              ) : (
                <>
                  <Upload className="w-8 h-8 mb-3 text-muted-foreground" />
                  <p className="mb-2 text-sm text-muted-foreground">
                    <span className="font-semibold">Clique para upload</span> ou arraste o arquivo
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Tamanho máximo: {maxSize}MB
                  </p>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept={accept}
              onChange={handleFileChange}
              disabled={disabled || isUploading}
            />
          </label>
        </div>

        {fileName && !errorMessage && (
          <Alert className="border-success/20 bg-success/10">
            <Check className="h-4 w-4 text-success" />
            <AlertDescription className="text-success">
              Arquivo selecionado: {fileName}
            </AlertDescription>
          </Alert>
        )}

        {errorMessage && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {fieldLabel && (
        <label className="text-sm font-medium text-foreground">
          {fieldLabel}
        </label>
      )}
      
      <div className="flex items-center gap-sm">
        <Button
          type="button"
          variant="outline"
          className={`${isUploading ? 'opacity-70' : ''}`}
          disabled={disabled || isUploading}
          onClick={handleButtonClick}
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enviando... {progress}%
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              {buttonText}
            </>
          )}
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
          disabled={disabled || isUploading}
        />

        {isUploading && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleCancelUpload}
            className="text-destructive hover:text-destructive/90"
          >
            <X className="h-4 w-4 mr-1" />
            Cancelar
          </Button>
        )}

        {initialFileUrl && !isUploading && (
          <a
            href={initialFileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline"
          >
            Visualizar arquivo atual
          </a>
        )}
      </div>

      {fileName && !errorMessage && !isUploading && (
        <Alert className="border-success/20 bg-success/10">
          <Check className="h-4 w-4 text-success" />
          <AlertDescription className="text-success">
            Arquivo enviado: {fileName}
          </AlertDescription>
        </Alert>
      )}

      {errorMessage && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};