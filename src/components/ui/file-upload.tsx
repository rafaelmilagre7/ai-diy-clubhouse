import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { X, Upload, FileIcon, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { STORAGE_BUCKETS, BUCKET_CONFIG } from '@/lib/supabase/config';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

interface FileUploadProps {
  bucketName: keyof typeof STORAGE_BUCKETS;
  folder?: string;
  onUploadComplete: (url: string) => void;
  accept?: string;
  maxSize?: number;
  buttonText?: string;
  fieldLabel?: string;
  initialFileUrl?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  bucketName,
  folder = '',
  onUploadComplete,
  accept = '*',
  maxSize,
  buttonText = 'Upload File',
  fieldLabel = 'Select a file',
  initialFileUrl
}) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(initialFileUrl || null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
  }, []);

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    const bucketConfig = BUCKET_CONFIG[STORAGE_BUCKETS[bucketName]];
    const maxSizeBytes = (maxSize || bucketConfig?.maxSize || 300) * 1024 * 1024;

    if (file.size > maxSizeBytes) {
      setError(`File size exceeds the maximum limit of ${maxSizeBytes / (1024 * 1024)}MB`);
      toast({
        title: "Erro no upload",
        description: `O arquivo excede o tamanho máximo de ${maxSizeBytes / (1024 * 1024)}MB`,
        variant: 'destructive'
      });
      return;
    }

    setError(null);
    setUploading(true);
    setProgress(0);

    try {
      // Gerar um nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = folder ? `${folder}/${fileName}` : fileName;

      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        console.error('Supabase upload error:', error);
        setError(error.message);
        toast({
          title: "Erro no upload",
          description: error.message,
          variant: 'destructive'
        });
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      const publicUrl = publicUrlData.publicUrl;
      setFileUrl(publicUrl);
      onUploadComplete(publicUrl);
      toast({
        title: "Upload concluído",
        description: "O arquivo foi enviado com sucesso."
      });
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'An error occurred during the upload.');
      toast({
        title: "Erro no upload",
        description: err.message || 'An error occurred during the upload.',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
      setProgress(0);
      if (inputRef.current) {
        inputRef.current.value = ''; // Reset the input
      }
    }
  };

  const handleRemove = () => {
    setFile(null);
    setFileUrl(null);
    if (inputRef.current) {
      inputRef.current.value = ''; // Reset the input
    }
  };

  return (
    <div>
      {fileUrl ? (
        <div className="flex items-center justify-between p-4 border rounded-md bg-muted">
          <div className="flex items-center gap-2">
            <FileIcon className="h-4 w-4" />
            <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-sm underline underline-offset-2">
              View File
            </a>
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={handleRemove}>
            <X className="h-4 w-4 mr-2" />
            Remove
          </Button>
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">{fieldLabel}</p>
          <div className="flex items-center space-x-4">
            <Input
              type="file"
              accept={accept}
              onChange={handleFileChange}
              className="hidden"
              id="upload"
              ref={inputRef}
            />
            <Button
              variant="outline"
              asChild
              disabled={uploading}
            >
              <label htmlFor="upload" className="cursor-pointer flex items-center">
                <Upload className="h-4 w-4 mr-2" />
                {buttonText}
              </label>
            </Button>
            {uploading && <Progress value={progress} />}
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </>
      )}
      {uploading && (
        <Button type="button" variant="secondary" size="sm" disabled={!uploading} onClick={handleUpload}>
          {uploading ? 'Uploading...' : 'Upload'}
        </Button>
      )}
    </div>
  );
};
