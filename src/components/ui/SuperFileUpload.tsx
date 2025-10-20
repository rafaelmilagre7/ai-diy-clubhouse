/**
 * SUPER FILE UPLOAD - COMPONENTE UNIFICADO
 * 
 * Componente principal que unifica todos os uploads da plataforma.
 * Mantém compatibilidade total com componentes existentes.
 */

import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Upload, AlertCircle, X, File, Check, Image } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { 
  unifiedUpload, 
  UploadContext, 
  UploadResponse,
  UPLOAD_CONTEXTS 
} from '@/lib/uploads/unified-upload-system';

// =============================================
// INTERFACES E TIPOS
// =============================================

export interface SuperFileUploadProps {
  // Contexto de upload (recomendado)
  context?: UploadContext;
  
  // Configurações customizadas (para casos especiais)
  customBucket?: string;
  customFolder?: string;
  maxSize?: number;
  allowedTypes?: string[];
  
  // Callbacks
  onUploadComplete: (url: string, fileName: string, fileSize: number) => void;
  onUploadStart?: () => void;
  onUploadError?: (error: string) => void;
  
  // Props de apresentação
  variant?: 'button' | 'dropzone' | 'minimal';
  buttonText?: string;
  fieldLabel?: string;
  accept?: string; // Para compatibilidade com HTML
  disabled?: boolean;
  className?: string;
  
  // Estado inicial
  initialFileUrl?: string;
  showPreview?: boolean;
}

// =============================================
// COMPONENTE PRINCIPAL
// =============================================

export const SuperFileUpload: React.FC<SuperFileUploadProps> = ({
  context,
  customBucket,
  customFolder,
  maxSize,
  allowedTypes,
  onUploadComplete,
  onUploadStart,
  onUploadError,
  variant = 'dropzone',
  buttonText = 'Upload do Arquivo',
  fieldLabel,
  accept,
  disabled = false,
  className,
  initialFileUrl,
  showPreview = true
}) => {
  // =============================================
  // ESTADO DO COMPONENTE
  // =============================================
  
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<{
    url: string;
    name: string;
    size: number;
  } | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialFileUrl || null);
  
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // =============================================
  // FUNÇÕES AUXILIARES
  // =============================================

  const getConfig = useCallback(() => {
    if (context) {
      return UPLOAD_CONTEXTS[context];
    }
    return null;
  }, [context]);

  const isImageFile = useCallback((fileName: string): boolean => {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    return imageExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
  }, []);

  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  // =============================================
  // HANDLERS PRINCIPAIS
  // =============================================

  const handleUpload = useCallback(async (file: File) => {
    console.log('[SUPER_UPLOAD] Iniciando upload:', file.name);
    
    setError(null);
    setIsUploading(true);
    setProgress(0);
    onUploadStart?.();

    try {
      abortControllerRef.current = new AbortController();

      const result = await unifiedUpload(file, {
        context,
        customBucket,
        customFolder,
        maxSize,
        allowedTypes,
        onProgress: (progress) => {
          setProgress(progress);
        },
        abortSignal: abortControllerRef.current.signal
      });

      if (!result.success) {
        throw new Error((result as any).error);
      }

      // Sucesso
      const uploadData = {
        url: result.publicUrl,
        name: result.fileName,
        size: result.fileSize
      };

      setUploadedFile(uploadData);
      
      if (showPreview && isImageFile(result.fileName)) {
        setPreviewUrl(result.publicUrl);
      }

      onUploadComplete(result.publicUrl, result.fileName, result.fileSize);

      toast({
        title: 'Upload concluído',
        description: `Arquivo "${result.fileName}" enviado com sucesso.`,
      });

    } catch (error: any) {
      const errorMessage = error.message || 'Erro inesperado durante o upload';
      console.error('[SUPER_UPLOAD] Erro:', errorMessage);
      
      setError(errorMessage);
      onUploadError?.(errorMessage);

      toast({
        title: 'Erro no upload',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      abortControllerRef.current = null;
    }
  }, [
    context, customBucket, customFolder, maxSize, allowedTypes,
    onUploadComplete, onUploadStart, onUploadError, showPreview, isImageFile, toast
  ]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    handleUpload(file);
    e.target.value = ''; // Limpar input
  }, [handleUpload]);

  const handleButtonClick = useCallback(() => {
    if (fileInputRef.current && !disabled && !isUploading) {
      fileInputRef.current.click();
    }
  }, [disabled, isUploading]);

  const handleCancelUpload = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsUploading(false);
      setProgress(0);
      
      toast({
        title: 'Upload cancelado',
        description: 'O upload foi cancelado pelo usuário.',
      });
    }
  }, [toast]);

  const handleRemoveFile = useCallback(() => {
    setUploadedFile(null);
    setPreviewUrl(null);
    setError(null);
  }, []);

  // =============================================
  // DETERMINAÇÃO DO ACCEPT
  // =============================================

  const getAcceptAttribute = useCallback((): string => {
    if (accept) return accept;
    
    const config = getConfig();
    if (!config) return '*/*';
    
    if (config.allowedTypes[0] === '*') return '*/*';
    return config.allowedTypes.join(',');
  }, [accept, getConfig]);

  // =============================================
  // RENDERIZAÇÃO POR VARIANTE
  // =============================================

  if (variant === 'minimal') {
    return (
      <div className={cn('space-y-2', className)}>
        {fieldLabel && (
          <label className="text-sm font-medium text-foreground">
            {fieldLabel}
          </label>
        )}
        
        <div className="flex items-center gap-sm">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled || isUploading}
            onClick={handleButtonClick}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {progress}%
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                {buttonText}
              </>
            )}
          </Button>

          {isUploading && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCancelUpload}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept={getAcceptAttribute()}
          onChange={handleFileChange}
          disabled={disabled || isUploading}
        />

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {uploadedFile && (
          <Alert>
            <Check className="h-4 w-4" />
            <AlertDescription>
              Arquivo enviado: {uploadedFile.name} ({formatFileSize(uploadedFile.size)})
            </AlertDescription>
          </Alert>
        )}
      </div>
    );
  }

  if (variant === 'button') {
    return (
      <div className={cn('space-y-3', className)}>
        {fieldLabel && (
          <label className="text-sm font-medium text-foreground">
            {fieldLabel}
          </label>
        )}
        
        <div className="flex items-center gap-sm">
          <Button
            type="button"
            variant="outline"
            disabled={disabled || isUploading}
            onClick={handleButtonClick}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enviando... {progress}%
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                {buttonText}
              </>
            )}
          </Button>

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
        </div>

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept={getAcceptAttribute()}
          onChange={handleFileChange}
          disabled={disabled || isUploading}
        />

        {/* Preview de imagem */}
        {previewUrl && showPreview && (
          <div className="relative inline-block">
            <img 
              src={previewUrl} 
              alt="Preview" 
              className="max-w-xs max-h-40 rounded-lg object-cover"
              onError={() => setPreviewUrl(null)}
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-1 right-1 h-6 w-6"
              onClick={handleRemoveFile}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}

        {/* Status de arquivo enviado */}
        {uploadedFile && !previewUrl && (
          <div className="flex items-center gap-sm p-sm border rounded-lg bg-muted/50">
            <File className="h-4 w-4 text-blue-600" />
            <span className="text-sm flex-1">{uploadedFile.name}</span>
            <span className="text-xs text-muted-foreground">
              {formatFileSize(uploadedFile.size)}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemoveFile}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>
    );
  }

  // Variant: dropzone (padrão)
  return (
    <div className={cn('space-y-4', className)}>
      {fieldLabel && (
        <label className="text-sm font-medium text-foreground">
          {fieldLabel}
        </label>
      )}
      
      <div className="flex items-center justify-center w-full">
        <label
          className={cn(
            "flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors",
            disabled || isUploading 
              ? 'opacity-50 cursor-not-allowed bg-muted' 
              : 'bg-background hover:bg-muted/50 border-border hover:border-primary/50'
          )}
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
                  {context && UPLOAD_CONTEXTS[context] && (
                    `Máximo: ${UPLOAD_CONTEXTS[context].maxSize}MB`
                  )}
                </p>
              </>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept={getAcceptAttribute()}
            onChange={handleFileChange}
            disabled={disabled || isUploading}
          />
        </label>
      </div>

      {/* Preview de imagem */}
      {previewUrl && showPreview && (
        <div className="relative inline-block">
          <img 
            src={previewUrl} 
            alt="Preview" 
            className="max-w-full max-h-48 rounded-lg object-cover"
            onError={() => setPreviewUrl(null)}
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-6 w-6"
            onClick={handleRemoveFile}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* Status de arquivo enviado */}
      {uploadedFile && !previewUrl && (
        <Alert className="border-success/20 bg-success/10">
          <Check className="h-4 w-4 text-success" />
          <AlertDescription className="text-success">
            Arquivo enviado: {uploadedFile.name} ({formatFileSize(uploadedFile.size)})
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Botão de cancelar durante upload */}
      {isUploading && (
        <div className="flex justify-center">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCancelUpload}
          >
            <X className="h-4 w-4 mr-1" />
            Cancelar Upload
          </Button>
        </div>
      )}
    </div>
  );
};

// =============================================
// EXPORTAÇÃO PADRÃO
// =============================================

export default SuperFileUpload;