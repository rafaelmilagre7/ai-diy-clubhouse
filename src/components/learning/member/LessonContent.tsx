
import React, { useEffect } from "react";
import { LearningLesson } from "@/lib/supabase/types";
import { LessonVideoPlayer } from "./LessonVideoPlayer";
import { LessonComments } from "../comments/LessonComments";
import { LessonResources } from "./LessonResources";
import { LessonAssistantChat } from "../assistant/LessonAssistantChat";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface LessonContentProps {
  lesson: LearningLesson;
  videos: any[];
  resources?: any[];
  onProgressUpdate?: (videoId: string, progress: number) => void;
}

export const LessonContent: React.FC<LessonContentProps> = ({ 
  lesson, 
  videos,
  resources = [],
  onProgressUpdate
}) => {
  useEffect(() => {
    // Marcar progresso inicial quando o componente é montado
    if (onProgressUpdate && videos.length > 0) {
      onProgressUpdate(videos[0].id, 10);
    }
  }, [videos, onProgressUpdate]);
  
  const handleVideoProgress = (videoId: string, progress: number) => {
    if (onProgressUpdate) {
      onProgressUpdate(videoId, progress);
    }
  };
  
  // Verificar se há vídeos para exibir
  const hasVideos = videos && videos.length > 0;
  
  // Verificar se há recursos para exibir
  const hasResources = resources && resources.length > 0;
  
  // Verificar se há assistente de IA habilitado
  const hasAiAssistant = lesson.ai_assistant_enabled;
  
  // Determinar se devemos usar abas
  const useTabs = hasVideos || hasResources || hasAiAssistant;

  // Calcular duração total dos vídeos em formato legível
  const formatTotalDuration = () => {
    if (!videos || videos.length === 0) return null;
    
    let totalSeconds = 0;
    let hasValidDurations = false;
    
    videos.forEach(video => {
      if (video.duration_seconds) {
        totalSeconds += video.duration_seconds;
        hasValidDurations = true;
      }
    });
    
    if (!hasValidDurations) return null;
    
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    } else {
      return `${minutes} minutos`;
    }
  };

  // Renderizar a imagem da capa de modo mais proeminente
  const renderCoverImage = () => {
    if (!lesson.cover_image_url) return null;
    
    return (
      <div className="mb-6">
        <div className="relative rounded-xl overflow-hidden">
          <img 
            src={lesson.cover_image_url} 
            alt={`Capa da aula ${lesson.title}`}
            className="w-full h-full object-cover aspect-video"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      </div>
    );
  };

  if (useTabs) {
    return (
      <div className="space-y-6">
        {renderCoverImage()}
        
        {/* Descrição da aula */}
        {lesson.description && (
          <Card className="overflow-hidden">
            <CardContent className="p-6">
              <div className="prose dark:prose-invert max-w-none">
                <p>{lesson.description}</p>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Duração total dos vídeos */}
        {hasVideos && formatTotalDuration() && (
          <div className="flex items-center text-sm text-muted-foreground">
            <span>Duração total: {formatTotalDuration()}</span>
          </div>
        )}
        
        <Tabs defaultValue="video" className="w-full">
          <TabsList className="mb-4">
            {hasVideos && <TabsTrigger value="video">Vídeos</TabsTrigger>}
            {hasResources && <TabsTrigger value="resources">Materiais</TabsTrigger>}
            {hasAiAssistant && <TabsTrigger value="assistant">Assistente IA</TabsTrigger>}
          </TabsList>
          
          {hasVideos && (
            <TabsContent value="video" className="space-y-4">
              <LessonVideoPlayer 
                videos={videos}
                onProgress={(videoId, progress) => handleVideoProgress(videoId, progress)}
              />
            </TabsContent>
          )}
          
          {hasResources && (
            <TabsContent value="resources">
              <LessonResources resources={resources} />
            </TabsContent>
          )}
          
          {hasAiAssistant && (
            <TabsContent value="assistant">
              <LessonAssistantChat 
                lessonId={lesson.id}
                assistantId={lesson.ai_assistant_id}
                assistantPrompt={lesson.ai_assistant_prompt}
              />
            </TabsContent>
          )}
        </Tabs>
        
        {/* Seção de comentários */}
        <section className="mt-8">
          <Separator className="mb-6" />
          <LessonComments lessonId={lesson.id} />
        </section>
      </div>
    );
  }
  
  // Versão sem abas quando há somente um tipo de conteúdo
  return (
    <div className="space-y-6">
      {renderCoverImage()}
      
      {/* Descrição da aula */}
      {lesson.description && (
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <div className="prose dark:prose-invert max-w-none">
              <p>{lesson.description}</p>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Duração total dos vídeos */}
      {hasVideos && formatTotalDuration() && (
        <div className="flex items-center text-sm text-muted-foreground">
          <span>Duração total: {formatTotalDuration()}</span>
        </div>
      )}
      
      {/* Reprodutor de vídeo com playlist se houver vídeos */}
      {hasVideos && (
        <section>
          <LessonVideoPlayer 
            videos={videos}
            onProgress={(videoId, progress) => handleVideoProgress(videoId, progress)}
          />
        </section>
      )}
      
      {/* Seção de materiais */}
      {hasResources && (
        <section className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Materiais complementares</h2>
          <LessonResources resources={resources} />
        </section>
      )}
      
      {/* Assistente de IA */}
      {hasAiAssistant && (
        <section className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Assistente IA</h2>
          <LessonAssistantChat 
            lessonId={lesson.id}
            assistantId={lesson.ai_assistant_id}
            assistantPrompt={lesson.ai_assistant_prompt}
          />
        </section>
      )}
      
      {/* Seção de comentários */}
      <section className="mt-8">
        <Separator className="mb-6" />
        <LessonComments lessonId={lesson.id} />
      </section>
    </div>
  );
};
