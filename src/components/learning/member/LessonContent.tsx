
import React, { useEffect } from "react";
import { LearningLesson } from "@/lib/supabase/types";
import { LessonVideoPlayer } from "./LessonVideoPlayer";
import { LessonComments } from "../comments/LessonComments";
import { LessonResources } from "./LessonResources";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface LessonContentProps {
  lesson: LearningLesson;
  videos: any[];
  resources?: any[];
  onProgressUpdate?: (progress: number) => void;
}

export const LessonContent: React.FC<LessonContentProps> = ({ 
  lesson, 
  videos,
  resources = [],
  onProgressUpdate
}) => {
  useEffect(() => {
    // Marcar progresso inicial quando o componente é montado
    if (onProgressUpdate) {
      onProgressUpdate(10);
    }
  }, []);
  
  const handleInteraction = () => {
    if (onProgressUpdate) {
      onProgressUpdate(50); // Quando o usuário interage com o conteúdo, marcamos 50% de progresso
    }
  };
  
  // Verificar se há vídeos para exibir
  const hasVideos = videos && videos.length > 0;
  
  // Verificar se há recursos para exibir
  const hasResources = resources && resources.length > 0;
  
  // Determinar se devemos usar abas ou não
  const useTabs = (hasVideos && hasResources);

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
      <div className="space-y-6" onClick={handleInteraction}>
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
        
        <Tabs defaultValue="video" className="w-full">
          <TabsList className="mb-4">
            {hasVideos && <TabsTrigger value="video">Vídeos</TabsTrigger>}
            {hasResources && <TabsTrigger value="resources">Materiais</TabsTrigger>}
          </TabsList>
          
          {hasVideos && (
            <TabsContent value="video" className="space-y-4">
              {videos.map((video, index) => (
                <div key={video.id || index} className="mb-4">
                  <h3 className="text-lg font-medium mb-2">{video.title}</h3>
                  <div className="aspect-video">
                    <LessonVideoPlayer 
                      video={video} 
                      onProgress={onProgressUpdate}
                    />
                  </div>
                  {video.description && (
                    <p className="text-muted-foreground mt-2">{video.description}</p>
                  )}
                </div>
              ))}
            </TabsContent>
          )}
          
          {hasResources && (
            <TabsContent value="resources">
              <LessonResources resources={resources} />
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
    <div className="space-y-6" onClick={handleInteraction}>
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
      
      {/* Reprodutor de vídeo se houver vídeos */}
      {hasVideos && (
        <section>
          <h2 className="text-xl font-semibold mb-4">Vídeos da Aula</h2>
          {videos.map((video, index) => (
            <div key={video.id || index} className="mb-6">
              <div className="aspect-video mb-2">
                <LessonVideoPlayer 
                  video={video} 
                  onProgress={onProgressUpdate}
                />
              </div>
              <h3 className="text-lg font-medium">{video.title}</h3>
              {video.description && (
                <p className="text-muted-foreground mt-1">{video.description}</p>
              )}
            </div>
          ))}
        </section>
      )}
      
      {/* Seção de materiais */}
      {hasResources && (
        <section className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Materiais complementares</h2>
          <LessonResources resources={resources} />
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
