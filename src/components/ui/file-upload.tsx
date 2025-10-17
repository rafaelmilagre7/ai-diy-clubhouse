/**
 * FILE UPLOAD COMPONENT - VERSÃO OTIMIZADA
 * 
 * Componente mantido para compatibilidade total.
 * Agora usa o sistema unificado internamente.
 * 
 * ⚠️ PARA NOVOS PROJETOS: Use SuperFileUpload
 */

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Upload, AlertCircle, X, Info, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { legacyUpload } from '@/lib/uploads/unified-upload-system';

interface FileUploadProps {
  bucketName: string;
  folder?: string;
  onUploadComplete: (url: string, fileName?: string, fileSize?: number) => void;
  accept?: string;
  maxSize?: number; // Em MB
  buttonText?: string;
  fieldLabel?: string;
  initialFileUrl?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  bucketName,
  folder = '',
  onUploadComplete,
  accept = '*/*',
  maxSize = 300,
  buttonText = 'Upload do Arquivo',
  fieldLabel = 'Selecione um arquivo',
  initialFileUrl,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState<string | null>(null);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleCancelUpload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsUploading(false);
      toast({
        title: 'Upload cancelado',
        description: 'O upload foi interrompido.',
      });
    }
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (!file) return;
    
    // Validação de tamanho (mantida para compatibilidade)
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSize) {
      setErrorMessage(`O arquivo é muito grande. O tamanho máximo é ${maxSize}MB.`);
      toast({
        title: 'Arquivo muito grande',
        description: `O tamanho máximo é ${maxSize}MB.`,
        variant: 'destructive',
      });
      return;
    }
    
    setErrorMessage(null);
    setIsUploading(true);
    setProgress(0);
    setFileName(file.name);
    
    try {
      abortControllerRef.current = new AbortController();
      
      console.log(`[LEGACY_UPLOAD] Redirecionando para sistema unificado`);
      toast({
        title: 'Iniciando upload',
        description: "Enviando arquivo...",
      });
      
      // Usar o novo sistema unificado
      const result = await legacyUpload(
        file,
        bucketName,
        folder,
        (progress) => {
          setProgress(progress);
        }
      );
      
      if (!result.success) {
        throw new Error((result as any).error);
      }
      
      console.log('[LEGACY_UPLOAD] Upload bem-sucedido:', result);
      
      onUploadComplete(result.publicUrl, result.fileName, result.fileSize);
      
      toast({
        title: 'Upload realizado com sucesso',
        description: 'O arquivo foi enviado com sucesso.',
        variant: 'default',
      });
    } catch (error: any) {
      console.error('[LEGACY_UPLOAD] Erro:', error);
      
      let displayMessage = error.message || 'Erro ao fazer upload do arquivo.';
      
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
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-col">
        {fieldLabel && (
          <label className="text-sm text-neutral-800 dark:text-white mb-2">
            {fieldLabel}
          </label>
        )}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            className={`relative ${isUploading ? 'opacity-70' : ''}`}
            disabled={isUploading}
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
            disabled={isUploading}
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
              className="text-sm text-operational hover:underline ml-2"
            >
              Visualizar arquivo atual
            </a>
          )}
        </div>
      </div>
      
      {!errorMessage && !isUploading && fileName && (
        <Alert variant="default" className="bg-operational/10 border-operational/30 py-2">
          <Check className="h-4 w-4 text-operational" />
          <AlertDescription className="text-operational text-xs">
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
};
