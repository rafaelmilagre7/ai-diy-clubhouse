import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { RefreshCw, Play, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface CourseSyncStatus {
  course_title: string;
  total_videos: number;
  videos_with_duration: number;
  videos_without_duration: number;
  sync_percentage: number;
}

export const VideoDurationSyncDashboard = () => {
  const [isRunning, setIsRunning] = useState(false);

  // Query para buscar status de sincronização por curso
  const { data: syncStatus, isLoading, refetch } = useQuery({
    queryKey: ['video-duration-sync-status'],
    queryFn: async (): Promise<CourseSyncStatus[]> => {
      const { data, error } = await supabase
        .from('learning_courses')
        .select(`
          title,
          learning_modules!inner(
            learning_lessons!inner(
              learning_lesson_videos(
                id,
                title,
                duration_seconds
              )
            )
          )
        `)
        .eq('learning_modules.is_active', true)
        .eq('learning_modules.learning_lessons.is_active', true);

      if (error) throw error;

      return data.map(course => {
        const allVideos = course.learning_modules.flatMap(module =>
          module.learning_lessons.flatMap(lesson => lesson.learning_lesson_videos)
        );

        const totalVideos = allVideos.length;
        const videosWithDuration = allVideos.filter(
          video => video.duration_seconds && video.duration_seconds > 0
        ).length;
        const videosWithoutDuration = totalVideos - videosWithDuration;
        const syncPercentage = totalVideos > 0 ? Math.round((videosWithDuration / totalVideos) * 100) : 0;

        return {
          course_title: course.title,
          total_videos: totalVideos,
          videos_with_duration: videosWithDuration,
          videos_without_duration: videosWithoutDuration,
          sync_percentage: syncPercentage
        };
      });
    },
    refetchInterval: 10000 // Atualizar a cada 10 segundos
  });

  const handleSyncAll = async () => {
    setIsRunning(true);
    try {
      console.log('🚀 [DASHBOARD] Iniciando sincronização completa...');
      toast.info('Iniciando sincronização de todas as durações...');

      const { data, error } = await supabase.functions.invoke('update-video-durations', {
        body: {}
      });

      if (error) {
        console.error('❌ [DASHBOARD] Erro na sincronização:', error);
        toast.error(`Erro na sincronização: ${error.message}`);
        return;
      }

      console.log('📊 [DASHBOARD] Resultado da sincronização:', data);
      
      if (data.success > 0) {
        toast.success(`${data.success} vídeos sincronizados com sucesso!`);
        
        if (data.failed > 0) {
          toast.warning(`${data.failed} vídeos falharam na sincronização`);
        }

        // Aguardar um pouco e atualizar o dashboard
        setTimeout(() => {
          refetch();
          toast.info('Dashboard atualizado com novos dados');
        }, 3000);
      } else {
        toast.info('Nenhum vídeo precisou ser sincronizado');
      }

    } catch (error: any) {
      console.error('💥 [DASHBOARD] Erro crítico:', error);
      toast.error(`Erro crítico: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const getSyncStatusBadge = (percentage: number) => {
    if (percentage === 100) {
      return <Badge variant="default" className="bg-success"><CheckCircle className="w-3 h-3 mr-1" />Completo</Badge>;
    } else if (percentage > 50) {
      return <Badge variant="secondary" className="bg-warning"><RefreshCw className="w-3 h-3 mr-1" />Parcial</Badge>;
    } else {
      return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Pendente</Badge>;
    }
  };

  const totalVideos = syncStatus?.reduce((acc, course) => acc + course.total_videos, 0) || 0;
  const totalSynced = syncStatus?.reduce((acc, course) => acc + course.videos_with_duration, 0) || 0;
  const overallPercentage = totalVideos > 0 ? Math.round((totalSynced / totalVideos) * 100) : 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5" />
            Dashboard de Sincronização de Durações
          </CardTitle>
          <CardDescription>
            Monitore o progresso da sincronização das durações dos vídeos com a API do Panda Video
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Status Geral</h3>
              <p className="text-sm text-muted-foreground">
                {totalSynced} de {totalVideos} vídeos sincronizados ({overallPercentage}%)
              </p>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-smooth" 
                  style={{ width: `${overallPercentage}%` }}
                />
              </div>
            </div>
            
            <Button 
              onClick={handleSyncAll}
              disabled={isRunning || isLoading}
              size="lg"
              className="ml-4"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Sincronizando...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Sincronizar Tudo
                </>
              )}
            </Button>
          </div>

          <div className="grid gap-4">
            <h4 className="font-medium">Status por Curso:</h4>
            {isLoading ? (
              <div className="text-center py-8">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
                <p>Carregando status de sincronização...</p>
              </div>
            ) : (
              <div className="space-y-3">
                {syncStatus?.map((course) => (
                  <div key={course.course_title} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <h5 className="font-medium">{course.course_title}</h5>
                      <p className="text-sm text-muted-foreground">
                        {course.videos_with_duration}/{course.total_videos} vídeos sincronizados
                      </p>
                      <div className="w-48 bg-muted rounded-full h-1.5">
                        <div 
                          className="bg-primary h-1.5 rounded-full transition-smooth" 
                          style={{ width: `${course.sync_percentage}%` }}
                        />
                      </div>
                    </div>
                    
                    <div className="text-right space-y-2">
                      {getSyncStatusBadge(course.sync_percentage)}
                      <div className="text-lg font-semibold">
                        {course.sync_percentage}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 p-4 bg-operational/10 rounded-lg">
            <h5 className="font-medium mb-2">📋 Como usar:</h5>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• <strong>Sincronizar Tudo:</strong> Processa todos os vídeos que ainda não têm duração</li>
              <li>• <strong>Status em tempo real:</strong> Dashboard atualiza automaticamente a cada 10 segundos</li>
              <li>• <strong>Verde:</strong> Curso 100% sincronizado</li>
              <li>• <strong>Amarelo:</strong> Curso parcialmente sincronizado (&gt;50%)</li>
              <li>• <strong>Vermelho:</strong> Curso com poucos vídeos sincronizados (≤50%)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};