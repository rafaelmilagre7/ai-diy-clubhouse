
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { VideoUpload } from './VideoUpload';
import { setupLearningStorageBuckets } from '@/lib/supabase/storage';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { VideoIcon, AlertTriangle, RefreshCcw } from 'lucide-react';

interface VideoUploadCardProps {
  value: string;
  onChange: (
    url: string, 
    videoType: string, 
    fileName?: string, 
    filePath?: string, 
    fileSize?: number,
    duration?: number,
    thumbnailUrl?: string
  ) => void;
  videoType?: string;
}

export const VideoUploadCard = ({ value, onChange, videoType = 'youtube' }: VideoUploadCardProps) => {
  const [storageReady, setStorageReady] = useState(false);
  const [storageChecking, setStorageChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Verificar a disponibilidade do storage ao montar o componente
  useEffect(() => {
    const checkStorage = async () => {
      try {
        setStorageChecking(true);
        
        // Verificar se os buckets estão configurados
        const result = await setupLearningStorageBuckets();
        
        if (!result.success) {
          console.warn('Buckets de armazenamento não configurados:', result.error);
          setError(`Os buckets de armazenamento não estão configurados corretamente: ${result.error}`);
          setStorageReady(false);
        } else {
          setStorageReady(true);
          setError(null);
        }
      } catch (err: any) {
        console.error('Erro ao verificar armazenamento:', err);
        setError(err.message || 'Erro ao verificar o armazenamento');
        setStorageReady(false);
      } finally {
        setStorageChecking(false);
      }
    };
    
    checkStorage();
  }, []);

  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="video">Vídeo</Label>
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {!storageReady && storageChecking && (
            <Alert variant="info">
              <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
              <AlertDescription>Verificando configuração de armazenamento...</AlertDescription>
            </Alert>
          )}
          {!storageReady && !storageChecking && !error && (
            <Alert variant="warning">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                O sistema de armazenamento não está pronto. Alguns recursos podem não funcionar corretamente.
              </AlertDescription>
            </Alert>
          )}
          <VideoUpload
            value={value}
            onChange={onChange}
            videoType={videoType}
            disabled={!storageReady}
          />
        </div>
      </CardContent>
    </Card>
  );
};
