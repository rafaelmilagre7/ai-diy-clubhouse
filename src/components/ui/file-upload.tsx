
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Upload, AlertCircle, X, Info, Check } from 'lucide-react';
import { uploadFileToStorage } from '@/components/ui/file/uploadUtils';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { STORAGE_BUCKETS } from '@/lib/supabase/config';

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
  folder = '', // Definir um valor padrão para folder
  onUploadComplete,
  accept = '*',
  maxSize = 300, // Padrão aumentado para 300MB
  buttonText = 'Upload do Arquivo',
  fieldLabel = 'Selecione um arquivo',
  initialFileUrl,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState<string | null>(null);
  const [bucketStatus, setBucketStatus] = useState<"checking" | "ready" | "error" | "fallback">("checking");
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Verificar o status do bucket quando o componente montar
  useEffect(() => {
    checkBucketStatus();
  }, [bucketName]);
  
  const checkBucketStatus = async () => {
    try {
      setBucketStatus("checking");
      
      // Verificar se o bucket especificado existe - apenas uma verificação leve
      const { data: buckets, error } = await fetch(`https://zotzvtepvpnkcoobdubt.supabase.co/storage/v1/bucket/${bucketName}/object`, {
        method: 'HEAD',
      }).then(res => {
        if (res.ok || res.status === 400) {
          // 400 geralmente significa que o bucket existe, mas precisamos de um path
          return { data: [{ name: bucketName }], error: null };
        }
        return { data: null, error: { message: `Bucket ${bucketName} não encontrado` } };
      }).catch(() => {
        return { data: null, error: { message: `Erro ao verificar bucket ${bucketName}` } };
      });
      
      if (error) {
        console.log(`Bucket ${bucketName} não encontrado ou inacessível. Usando fallback.`);
        setBucketStatus("fallback");
      } else {
        console.log(`Bucket ${bucketName} encontrado e pronto para uso.`);
        setBucketStatus("ready");
      }
    } catch (error) {
      console.error("Erro ao verificar bucket:", error);
      setBucketStatus("fallback");
    }
  };
  
  const handleButtonClick = () => {
    // Acionar o clique no input de arquivo
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
  
  // Determinar qual bucket usar para o upload
  const getUploadBucket = () => {
    if (bucketStatus === "ready") {
      return bucketName;
    } else if (bucketStatus === "fallback") {
      // Usar um bucket fallback apropriado baseado no tipo de arquivo
      if (bucketName === STORAGE_BUCKETS.LEARNING_RESOURCES) {
        return STORAGE_BUCKETS.SOLUTION_FILES;  
      }
      return STORAGE_BUCKETS.FALLBACK;
    }
    // Em caso de erro tentar usar o bucket original de qualquer forma
    return bucketName;
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (!file) return;
    
    // Validações
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
      
      // Determinar qual bucket usar
      const uploadBucket = getUploadBucket();
      const actualFolder = bucketStatus === "fallback" ? `${bucketName}/${folder}`.trim() : folder;
      
      console.log(`Iniciando upload para bucket: ${uploadBucket}, pasta: ${actualFolder}`);
      toast({
        title: 'Iniciando upload',
        description: bucketStatus === "fallback" ? "Usando configuração alternativa de armazenamento" : "Enviando arquivo...",
      });
      
      const result = await uploadFileToStorage(
        file,
        uploadBucket,
        actualFolder,
        (progress) => {
          setProgress(progress);
        },
        abortControllerRef.current
      );
      
      console.log('Upload bem-sucedido:', result);
      
      onUploadComplete(result.publicUrl, file.name, file.size);
      
      toast({
        title: 'Upload realizado com sucesso',
        description: 'O arquivo foi enviado com sucesso.',
        variant: 'default',
      });
    } catch (error: any) {
      console.error('Erro ao fazer upload:', error);
      
      let displayMessage = error.message || 'Erro ao fazer upload do arquivo.';
      
      // Mensagens de erro específicas para problemas comuns
      if (error.message?.includes('bucket') && error.message?.includes('not found')) {
        displayMessage = 'Não foi possível encontrar o local de armazenamento. Tente novamente mais tarde ou entre em contato com o suporte.';
      } else if (error.message?.includes('timeout') || error.message?.includes('network')) {
        displayMessage = 'Tempo limite excedido ou problema de conexão. Tente novamente com um arquivo menor ou verifique sua conexão.';
      }
      
      setErrorMessage(displayMessage);
      
      toast({
        title: 'Erro ao fazer upload',
        description: displayMessage,
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      abortControllerRef.current = null;
      // Limpar o input
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-col">
        {fieldLabel && (
          <label className="text-sm text-muted-foreground mb-2">
            {fieldLabel}
          </label>
        )}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            className={`relative ${isUploading ? 'opacity-70' : ''}`}
            disabled={isUploading || bucketStatus === "error"}
            onClick={handleButtonClick}
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando... {progress}%
              </>
            ) : bucketStatus === "checking" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verificando...
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
            disabled={isUploading || bucketStatus === "error"}
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
              className="text-sm text-blue-600 hover:underline ml-2"
            >
              Visualizar arquivo atual
            </a>
          )}
        </div>
      </div>
      
      {bucketStatus === "ready" && !errorMessage && !isUploading && fileName && (
        <Alert variant="default" className="bg-green-50 border-green-100 py-2">
          <Check className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700 text-xs">
            Armazenamento pronto para uploads. Último arquivo: {fileName}
          </AlertDescription>
        </Alert>
      )}
      
      {bucketStatus === "fallback" && !errorMessage && !isUploading && (
        <Alert variant="warning" className="bg-amber-50 border-amber-100 py-2">
          <Info className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-700 text-xs">
            Usando configuração alternativa de armazenamento. O upload deve funcionar normalmente.
          </AlertDescription>
        </Alert>
      )}
      
      {bucketStatus === "error" && !errorMessage && (
        <Alert variant="destructive" className="py-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Não foi possível configurar o armazenamento. Tente novamente mais tarde.
          </AlertDescription>
        </Alert>
      )}
      
      {fileName && !isUploading && !errorMessage && bucketStatus !== "ready" && (
        <div className="text-sm text-muted-foreground">
          Arquivo selecionado: {fileName}
        </div>
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
