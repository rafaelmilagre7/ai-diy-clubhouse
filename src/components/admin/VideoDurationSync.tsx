import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, CheckCircle, AlertCircle, Clock, Video } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useVideoDurationRefresh } from '@/hooks/useVideoDurationRefresh';

// Importar funções de teste em desenvolvimento
if (import.meta.env.DEV) {
  import('@/utils/testVideoDurationSync');
}

interface SyncResult {
  totalProcessed: number;
  success: number;
  failed: number;
  results: Array<{
    success: boolean;
    videoId: string;
    error?: string;
  }>;
}

export const VideoDurationSync = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<SyncResult | null>(null);
  const { refreshAfterSync } = useVideoDurationRefresh();

  const handleSync = async () => {
    try {
      setIsLoading(true);
      setProgress(10);
      setResult(null);

      // Sincronização iniciada
      toast.info('Iniciando sincronização com a API do Panda Video...');

      setProgress(30);

      // Chamar edge function para atualizar durações
      const { data, error } = await supabase.functions.invoke('update-video-durations', {
        body: {}
      });

      setProgress(80);

      if (error) {
        console.error('❌ Erro na sincronização:', error);
        throw error;
      }

      setProgress(100);
      setResult(data);

      if (data.success > 0) {
        toast.success(`✅ ${data.success} vídeo(s) sincronizados com sucesso!`);
        
        // Invalidar caches após sincronização bem-sucedida
        await refreshAfterSync();
        
        if (data.failed > 0) {
          toast.warning(`⚠️ ${data.failed} vídeo(s) falharam na sincronização`);
        }
      } else if (data.totalProcessed === 0) {
        toast.info('ℹ️ Todos os vídeos já possuem durações atualizadas');
      } else {
        toast.error('❌ Nenhum vídeo foi sincronizado com sucesso');
      }

      // Sincronização concluída

    } catch (error: any) {
      console.error('💥 Erro na sincronização:', error);
      toast.error(`Erro: ${error.message || 'Falha na sincronização'}`);
    } finally {
      setIsLoading(false);
      setTimeout(() => setProgress(0), 2000);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="h-5 w-5" />
          Sincronização de Durações dos Vídeos
        </CardTitle>
        <CardDescription>
          Sincronizar durações dos vídeos com a API do Panda Video para cálculo preciso das cargas horárias dos certificados.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Botão de Sincronização */}
        <div className="flex gap-4">
          <Button 
            onClick={handleSync} 
            disabled={isLoading}
            className="flex items-center gap-sm"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Sincronizando...' : 'Sincronizar Durações'}
          </Button>
        </div>

        {/* Progress Bar */}
        {isLoading && (
          <div className="space-y-sm">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Progresso da sincronização</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}

        {/* Resultados */}
        {result && (
          <div className="space-y-md">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
              {/* Total Processado */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold">{result.totalProcessed}</p>
                      <p className="text-sm text-muted-foreground">Processados</p>
                    </div>
                    <Clock className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>

              {/* Sucessos */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-success">{result.success}</p>
                      <p className="text-sm text-muted-foreground">Sucessos</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-success" />
                  </div>
                </CardContent>
              </Card>

              {/* Falhas */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-destructive">{result.failed}</p>
                      <p className="text-sm text-muted-foreground">Falhas</p>
                    </div>
                    <AlertCircle className="h-8 w-8 text-destructive" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detalhes dos Resultados */}
            {result.results.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold">Detalhes da Sincronização</h4>
                <div className="max-h-60 overflow-y-auto space-y-2 border rounded-lg p-4">
                  {result.results.map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="font-mono text-xs">{item.videoId}</span>
                      <div className="flex items-center gap-2">
                        {item.success ? (
                          <Badge variant="default" className="bg-success/10 text-success">
                            Sucesso
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            Erro
                          </Badge>
                        )}
                        {item.error && (
                          <span className="text-xs text-muted-foreground max-w-xs truncate">
                            {item.error}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Informações */}
        <div className="bg-muted/50 rounded-lg p-4 text-sm">
          <h4 className="font-semibold mb-2">Como funciona:</h4>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>Conecta com a API do Panda Video para obter durações reais</li>
            <li>Atualiza apenas vídeos que não possuem duração no banco</li>
            <li>Implementa retry automático para requisições que falham</li>
            <li>Respeita rate limits para não sobrecarregar a API</li>
            <li>Certificados são automaticamente recalculados após a sincronização</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};