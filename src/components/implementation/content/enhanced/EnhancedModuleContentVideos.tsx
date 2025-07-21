
import React, { useState } from "react";
import { Module } from "@/lib/supabase";
import { Play, CheckCircle, Clock, PlayCircle } from "lucide-react";
import { PandaVideoPlayer } from "@/components/formacao/comum/PandaVideoPlayer";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface EnhancedModuleContentVideosProps {
  module: Module;
}

export const EnhancedModuleContentVideos = ({ module }: EnhancedModuleContentVideosProps) => {
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(0);
  const [completedVideos, setCompletedVideos] = useState<Set<number>>(new Set());
  const [videoProgress, setVideoProgress] = useState<Record<number, number>>({});

  // Extract videos from module content
  const videos = module.content?.videos || [];

  const handleVideoProgress = (videoIndex: number, progress: number) => {
    setVideoProgress(prev => ({
      ...prev,
      [videoIndex]: progress
    }));
    
    // Mark as completed if progress >= 95%
    if (progress >= 95) {
      setCompletedVideos(prev => new Set([...prev, videoIndex]));
    }
  };

  const handleVideoEnd = (videoIndex: number) => {
    setCompletedVideos(prev => new Set([...prev, videoIndex]));
    setVideoProgress(prev => ({
      ...prev,
      [videoIndex]: 100
    }));
  };

  if (!videos || videos.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-6">🎥</div>
        <h3 className="text-2xl font-semibold text-white mb-3">Nenhum vídeo disponível</h3>
        <p className="text-neutral-400 max-w-md mx-auto">
          Esta solução não possui vídeos de implementação no momento.
        </p>
      </div>
    );
  }

  const selectedVideo = videos[selectedVideoIndex];
  const completionPercentage = (completedVideos.size / videos.length) * 100;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-viverblue/20 rounded-full mb-4">
          <Play className="h-8 w-8 text-viverblue" />
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-white via-viverblue-light to-viverblue bg-clip-text text-transparent mb-4">
          Vídeos de Implementação
        </h2>
        <p className="text-neutral-300 max-w-2xl mx-auto mb-6">
          Assista aos vídeos paso-a-passo para implementar esta solução com sucesso.
          Cada vídeo aborda uma parte específica do processo.
        </p>
        
        {/* Progress Indicator */}
        <div className="max-w-md mx-auto">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-neutral-400">Progresso dos Vídeos</span>
            <span className="text-sm text-viverblue font-medium">
              {completedVideos.size} de {videos.length} concluídos
            </span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Video Player */}
        <div className="lg:col-span-3">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-viverblue/20 to-viverblue-dark/20 rounded-2xl blur opacity-25"></div>
            <div className="relative bg-black rounded-xl overflow-hidden aspect-video">
              {selectedVideo && (
                <PandaVideoPlayer
                  videoId={selectedVideo.video_id}
                  url={selectedVideo.url}
                  title={selectedVideo.title}
                  className="w-full h-full"
                  onProgress={(progress) => handleVideoProgress(selectedVideoIndex, progress)}
                  onEnded={() => handleVideoEnd(selectedVideoIndex)}
                />
              )}
            </div>
          </div>
          
          {/* Video Details */}
          <div className="mt-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {selectedVideo?.title || `Vídeo ${selectedVideoIndex + 1}`}
                </h3>
                {selectedVideo?.description && (
                  <p className="text-neutral-300 leading-relaxed">
                    {selectedVideo.description}
                  </p>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                {completedVideos.has(selectedVideoIndex) ? (
                  <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Concluído
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-neutral-600 text-neutral-400">
                    <Clock className="h-3 w-3 mr-1" />
                    Em andamento
                  </Badge>
                )}
              </div>
            </div>
            
            {/* Video Progress */}
            {videoProgress[selectedVideoIndex] > 0 && (
              <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-neutral-400">Progresso do vídeo</span>
                  <span className="text-sm text-viverblue">
                    {Math.round(videoProgress[selectedVideoIndex] || 0)}%
                  </span>
                </div>
                <Progress value={videoProgress[selectedVideoIndex] || 0} className="h-1" />
              </div>
            )}
          </div>
        </div>

        {/* Video Playlist */}
        <div className="lg:col-span-1">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
            <h4 className="text-lg font-semibold text-white mb-4">Playlist</h4>
            <div className="space-y-2">
              {videos.map((video: any, index: number) => {
                const isSelected = index === selectedVideoIndex;
                const isCompleted = completedVideos.has(index);
                const progress = videoProgress[index] || 0;
                
                return (
                  <button
                    key={index}
                    onClick={() => setSelectedVideoIndex(index)}
                    className={`w-full text-left p-3 rounded-lg transition-all duration-200 group ${
                      isSelected 
                        ? 'bg-viverblue/20 border border-viverblue/30' 
                        : 'bg-white/5 hover:bg-white/10 border border-transparent'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        isCompleted 
                          ? 'bg-green-500/20 text-green-400' 
                          : isSelected 
                            ? 'bg-viverblue/20 text-viverblue' 
                            : 'bg-white/10 text-neutral-400'
                      }`}>
                        {isCompleted ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <PlayCircle className="h-4 w-4" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm font-medium mb-1 ${
                          isSelected ? 'text-viverblue' : 'text-white group-hover:text-viverblue-light'
                        }`}>
                          {video.title || `Vídeo ${index + 1}`}
                        </div>
                        
                        {video.duration && (
                          <div className="text-xs text-neutral-500">
                            {video.duration}
                          </div>
                        )}
                        
                        {/* Progress bar for individual video */}
                        {progress > 0 && (
                          <div className="mt-2">
                            <Progress value={progress} className="h-1" />
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
