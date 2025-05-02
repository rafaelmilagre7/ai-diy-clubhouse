
import React, { useEffect } from "react";
import { LearningLesson } from "@/lib/supabase/types";
import { ContentRenderer } from "../content/ContentRenderer";
import { LessonVideoPlayer } from "./LessonVideoPlayer";
import { LessonComments } from "../comments/LessonComments";
import { LessonResources } from "./LessonResources";
import { Card } from "@/components/ui/card";
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
  
  // Verificar se há conteúdo textual para exibir
  const hasContent = lesson.content && 
    (typeof lesson.content === 'string' ? 
      lesson.content.trim() !== '' : 
      (lesson.content.blocks?.length > 0 || Object.keys(lesson.content).length > 0)
    );

  // Determinar se devemos usar abas ou não
  const useTabs = (hasVideos && (hasContent || hasResources));
  
  if (useTabs) {
    return (
      <div className="space-y-6">
        <Tabs defaultValue="video" className="w-full">
          <TabsList className="mb-4">
            {hasVideos && <TabsTrigger value="video">Vídeos</TabsTrigger>}
            {hasContent && <TabsTrigger value="content">Conteúdo</TabsTrigger>}
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
          
          {hasContent && (
            <TabsContent value="content">
              <Card className="p-6">
                <ScrollArea className="max-h-[70vh]">
                  <ContentRenderer 
                    content={lesson.content}
                    onInteraction={handleInteraction}
                  />
                </ScrollArea>
              </Card>
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
    <div className="space-y-6">
      {/* Reprodutor de vídeo se houver vídeos */}
      {hasVideos && (
        <section>
          <h2 className="text-xl font-semibold mb-4">Vídeo-aula</h2>
          {videos.map((video, index) => (
            <div key={video.id || index} className="mb-4">
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
      
      {/* Conteúdo textual da aula */}
      {hasContent && (
        <section className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Conteúdo da aula</h2>
          <Card className="p-6">
            <ContentRenderer 
              content={lesson.content}
              onInteraction={handleInteraction}
            />
          </Card>
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
