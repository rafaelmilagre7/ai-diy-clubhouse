
import { useState, useCallback } from 'react';
import { useLogging } from '@/hooks/useLogging';

interface VideoPlayerOptions {
  moduleId?: string;
  videoId?: string;
}

export const useVideoPlayer = ({ moduleId, videoId }: VideoPlayerOptions = {}) => {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playedSeconds, setPlayedSeconds] = useState(0);
  const { log } = useLogging('useVideoPlayer');

  const handlePlay = useCallback(() => {
    setPlaying(true);
    log('Vídeo iniciado', { moduleId, videoId, playing: true });
  }, [moduleId, videoId, log]);

  const handlePause = useCallback(() => {
    setPlaying(false);
    log('Vídeo pausado', { moduleId, videoId, playing: false, progress });
  }, [moduleId, videoId, progress, log]);

  const handleProgress = useCallback(
    ({ played, playedSeconds }: { played: number; playedSeconds: number }) => {
      // Atualizamos o progresso apenas se o vídeo estiver tocando
      if (playing) {
        setProgress(played);
        setPlayedSeconds(playedSeconds);
        
        // Log apenas em pontos específicos do vídeo para não sobrecarregar
        if (Math.floor(playedSeconds * 10) % 50 === 0) {
          log('Progresso do vídeo', { 
            moduleId, 
            videoId, 
            progress: played, 
            playedSeconds,
            percentComplete: (played * 100).toFixed(0) + '%' 
          });
        }
      }
    },
    [playing, moduleId, videoId, log]
  );

  const handleDuration = useCallback(
    (duration: number) => {
      setDuration(duration);
      log('Duração do vídeo carregada', { moduleId, videoId, duration });
    },
    [moduleId, videoId, log]
  );

  const handleEnded = useCallback(() => {
    log('Vídeo concluído', { moduleId, videoId, complete: true });
    setPlaying(false);
  }, [moduleId, videoId, log]);

  const handleReady = useCallback(() => {
    log('Vídeo pronto para reprodução', { moduleId, videoId });
  }, [moduleId, videoId, log]);

  return {
    playing,
    progress,
    duration,
    playedSeconds,
    handlePlay,
    handlePause,
    handleProgress,
    handleDuration,
    handleEnded,
    handleReady,
  };
};
