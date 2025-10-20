
import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle, AlertTriangle } from 'lucide-react';

interface VideoMetadataUpdaterProps {
  lessonId?: string;
  courseId?: string;
  onComplete?: () => void;
}

export const VideoMetadataUpdater: React.FC<VideoMetadataUpdaterProps> = ({
  lessonId,
  courseId,
  onComplete
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const updateVideoMetadata = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Chamar a edge function update-video-durations
      const { data, error } = await supabase.functions.invoke('update-video-durations', {
        body: { 
          lessonId: lessonId,
          courseId: courseId
        }
      });
      
      if (error) {
        throw error;
      }
      
      setResult(data);
      
      if (onComplete) {
        onComplete();
      }
    } catch (err: any) {
      console.error('Erro ao atualizar metadados dos vídeos:', err);
      setError(err.message || 'Erro desconhecido ao atualizar metadados dos vídeos');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Atualização de Metadados</CardTitle>
        <CardDescription>
          Atualizar as durações e miniaturas dos vídeos {lessonId ? 'desta aula' : courseId ? 'deste curso' : 'da plataforma'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="bg-destructive/10 dark:bg-destructive/20 text-destructive p-md rounded-md mb-md flex items-start">
            <AlertTriangle className="h-5 w-5 mr-sm flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Erro ao atualizar metadados dos vídeos</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
        )}
        
        {result && (
          <div className="bg-operational/10 text-operational p-4 rounded-md mb-4">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-operational" />
              <p className="font-medium">Atualização concluída com sucesso!</p>
            </div>
            <div className="mt-2 text-sm">
              <p>Total de vídeos processados: {result.totalProcessed}</p>
              <p>Vídeos atualizados: {result.success}</p>
              {result.failed > 0 && (
                <p className="text-status-warning">
                  Falha ao atualizar {result.failed} vídeo(s)
                </p>
              )}
            </div>
          </div>
        )}
        
        <p className="mb-4 text-sm">
          Este processo vai buscar as durações e miniaturas dos vídeos no Panda Video e atualizar no banco de dados.
          {!lessonId && !courseId && ' Isso pode levar alguns minutos dependendo da quantidade de vídeos.'}
        </p>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button
          onClick={updateVideoMetadata}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Atualizando...
            </>
          ) : (
            'Atualizar Metadados dos Vídeos'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};
