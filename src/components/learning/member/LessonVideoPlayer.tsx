
import React, { useState, useCallback } from 'react';
import { LearningLessonVideo } from "@/lib/supabase/types";
import { VideoPlayer } from '@/components/formacao/aulas/VideoPlayer';
import { VideoPlaylist } from './VideoPlaylist';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useVideoProgress } from '@/hooks/useVideoProgress';
import { useRobustVideoQuery } from '@/hooks/learning/useRobustVideoQuery';
import { useClearLearningCache } from '@/hooks/learning/useClearLearningCache';
import { devLog, devWarn } from '@/hooks/useOptimizedLogging';
import { validateVideoData } from '@/utils/videoConsistencyValidator';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface LessonVideoPlayerProps {
  videos: LearningLessonVideo[];
  lessonId: string;
  onProgress?: (videoId: string, progress: number) => void;
}

export const LessonVideoPlayer: React.FC<LessonVideoPlayerProps> = ({
  videos,
  lessonId,
  onProgress
}) => {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  
  // Hook robusto para buscar vídeos (fallback se videos prop estiver vazia)
  const { 
    data: robustVideos, 
    isLoading: loadingRobustVideos,
    error: robustVideosError,
    refetch: refetchVideos 
  } = useRobustVideoQuery({ 
    lessonId, 
    retryOnSchemaError: true,
    enableFallback: true 
  });
  
  // Cache management
  const { clearAllLearningCache, forceVideoDataReload } = useClearLearningCache();
  
  // Garantir que temos videos válidos
  const safeVideos = Array.isArray(videos) ? videos : [];
  
  // Determinar quais vídeos usar (props ou fallback robust query)
  const effectiveVideos = safeVideos.length > 0 ? safeVideos : (robustVideos || []);
  
  const handleForceReload = useCallback(async () => {
    try {
      await forceVideoDataReload();
      await refetchVideos();
      
      toast.success('Dados recarregados', {
        description: 'Vídeos foram atualizados com sucesso'
      });
    } catch (error) {
      toast.error('Erro ao recarregar', {
        description: 'Não foi possível atualizar os vídeos'
      });
    }
  }, [forceVideoDataReload, refetchVideos]);

  const handleClearCache = useCallback(async () => {
    try {
      await clearAllLearningCache();
      
      // Aguardar um pouco para garantir limpeza
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Recarregar página para forçar fetch fresco
      window.location.reload();
      
    } catch (error) {
      toast.error('Erro ao limpar cache');
    }
  }, [clearAllLearningCache]);

  // Se está carregando dados robustos
  if (loadingRobustVideos && effectiveVideos.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            Carregando vídeos da aula...
          </p>
        </CardContent>
      </Card>
    );
  }

  // Se houver erro e não há vídeos alternativos
  if (robustVideosError && effectiveVideos.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h3 className="font-semibold mb-2">Erro ao Carregar Vídeos</h3>
          <p className="text-muted-foreground mb-4">
            Houve um problema ao carregar os vídeos desta aula.
          </p>
          <div className="flex gap-2 justify-center">
            <Button onClick={handleForceReload} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Recarregar
            </Button>
            <Button onClick={handleClearCache} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Limpar Cache
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Se não houver vídeos após todas as tentativas
  if (effectiveVideos.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h3 className="font-semibold mb-2">Nenhum Vídeo Encontrado</h3>
          <p className="text-muted-foreground mb-4">
            Esta aula não possui vídeos ou houve um problema ao carregá-los.
          </p>
          <div className="flex gap-2 justify-center">
            <Button onClick={handleForceReload} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Recarregar
            </Button>
            <Button onClick={handleClearCache} variant="default" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Limpar Cache e Recarregar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentVideo = effectiveVideos[currentVideoIndex];
  
  // Validar vídeo atual em modo dev
  if (import.meta.env.DEV && currentVideo) {
    const validation = validateVideoData(currentVideo, 'LessonVideoPlayer');
    if (!validation.isValid) {
      devWarn('⚠️ [LESSON-PLAYER] Vídeo atual com problemas:', validation.issues);
    }
  }

  // Hook para gerenciar progresso do vídeo
  const { updateVideoProgress } = useVideoProgress(lessonId);

  const handleVideoSelect = (index: number) => {
    setCurrentVideoIndex(index);
  };

  const handleTimeUpdate = (currentTime: number, duration: number) => {
    if (duration > 0 && currentVideo) {
      const progress = (currentTime / duration) * 100;
      updateVideoProgress(currentVideo.id, progress, effectiveVideos);
      
      // Callback para componente pai
      if (onProgress) {
        const binaryProgress = progress >= 95 ? 100 : 0;
        onProgress(currentVideo.id, binaryProgress);
      }
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Player principal - tela cheia */}
      <div className="w-full">
        <VideoPlayer
          video={currentVideo}
          onTimeUpdate={handleTimeUpdate}
        />
      </div>

      {/* Playlist abaixo do vídeo */}
      {effectiveVideos.length > 1 && (
        <div className="w-full">
          <h3 className="text-lg font-semibold mb-4">Vídeos da aula</h3>
          <VideoPlaylist
            videos={effectiveVideos}
            currentVideoIndex={currentVideoIndex}
            onSelectVideo={handleVideoSelect}
          />
        </div>
      )}
    </div>
  );
};
