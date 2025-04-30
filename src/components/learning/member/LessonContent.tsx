
import React from "react";
import { LearningLesson } from "@/lib/supabase/types";
import { ContentRenderer } from "../content/ContentRenderer";
import { LessonVideoPlayer } from "./LessonVideoPlayer";
import { LessonComments } from "../comments/LessonComments";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface LessonContentProps {
  lesson: LearningLesson;
  videos: any[];
  onProgressUpdate?: (progress: number) => void;
}

export const LessonContent: React.FC<LessonContentProps> = ({ 
  lesson, 
  videos,
  onProgressUpdate
}) => {
  const handleInteraction = () => {
    if (onProgressUpdate) {
      onProgressUpdate(50); // Quando o usuário interage com o conteúdo, marcamos 50% de progresso
    }
  };
  
  // Verificar se há vídeos para exibir
  const hasVideos = videos && videos.length > 0;
  
  // Verificar se há conteúdo textual para exibir
  const hasContent = lesson.content && 
    (typeof lesson.content === 'string' ? 
      lesson.content.trim() !== '' : 
      (lesson.content.blocks?.length > 0 || Object.keys(lesson.content).length > 0)
    );
  
  return (
    <div className="space-y-6">
      {/* Reprodutor de vídeo se houver vídeos */}
      {hasVideos && (
        <section>
          <h2 className="text-xl font-semibold mb-4">Vídeo-aula</h2>
          <LessonVideoPlayer 
            videos={videos} 
            onVideoProgress={onProgressUpdate}
          />
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
      
      {/* Seção de comentários */}
      <section className="mt-8">
        <Separator className="mb-6" />
        <LessonComments lessonId={lesson.id} />
      </section>
    </div>
  );
};
