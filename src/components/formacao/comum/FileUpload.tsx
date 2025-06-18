
import React, { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFileUpload } from '@/hooks/useFileUpload';
import { Upload, FileIcon, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface FileUploadProps {
  value?: string;
  onChange: (url: string, fileName?: string, fileSize?: number) => void;
  bucketName: string;
  folder?: string;
  accept?: string;
  maxSize?: number;
  label?: string;
  description?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  value = '',
  onChange,
  bucketName,
  folder = '',
  accept = '*/*',
  maxSize = 25,
  label = 'Upload de Arquivo',
  description = 'Selecione um arquivo para enviar'
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadComplete = (url: string, fileName?: string, fileSize?: number) => {
    console.log('📁 Upload completo:', { url, fileName, fileSize });
    
    // Atualizar estado de sucesso
    setUploadSuccess(true);
    setUploadProgress(100);
    
    // Chamar onChange com delay para garantir que UI seja atualizada
    setTimeout(() => {
      onChange(url, fileName, fileSize);
      console.log('✅ onChange chamado com:', { url, fileName, fileSize });
    }, 100);
    
    // Reset do estado após um tempo
    setTimeout(() => {
      setUploadSuccess(false);
      setUploadProgress(0);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }, 3000);
  };

  const {
    uploading,
    uploadedFileUrl,
    fileName: uploadedFileName,
    error,
    handleFileUpload,
    setUploadedFileUrl
  } = useFileUpload({
    bucketName,
    folder,
    onUploadComplete: handleUploadComplete,
    maxSize
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log('📎 Arquivo selecionado:', file.name, 'Tamanho:', file.size);
      setSelectedFile(file);
      setUploadSuccess(false);
      setUploadProgress(0);
    }
  };

  const handleUpload = async () => {
    if (selectedFile) {
      console.log('🚀 Iniciando upload:', selectedFile.name);
      setUploadProgress(10);
      
      // Simular progresso durante upload
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);
      
      await handleFileUpload(selectedFile);
      clearInterval(progressInterval);
    }
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setUploadSuccess(false);
    setUploadProgress(0);
    setUploadedFileUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div>
          <Label className="text-sm font-medium">{label}</Label>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>

        {/* Feedback de sucesso */}
        {uploadSuccess && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>Upload concluído com sucesso!</strong>
              {uploadedFileName && (
                <span className="block mt-1">Arquivo: {uploadedFileName}</span>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Feedback de erro */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Seleção de arquivo */}
        <div className="space-y-3">
          <Input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            disabled={uploading}
            className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
          />

          {/* Arquivo selecionado */}
          {selectedFile && (
            <div className="flex items-center gap-3 p-3 bg-muted rounded-md">
              <FileIcon className="h-4 w-4 text-primary" />
              <div className="flex-1">
                <p className="text-sm font-medium">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
              {!uploading && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFile}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}

          {/* Progresso do upload */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-sm">Enviando arquivo... {uploadProgress}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Botão de upload */}
          {selectedFile && !uploading && !uploadSuccess && (
            <Button 
              type="button"
              onClick={handleUpload}
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              Enviar Arquivo
            </Button>
          )}

          {/* Informações do arquivo atual */}
          {value && !selectedFile && !uploading && (
            <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-md">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-800">
                  Arquivo carregado
                </p>
                <p className="text-xs text-green-600">
                  {uploadedFileName || 'Arquivo disponível'}
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
