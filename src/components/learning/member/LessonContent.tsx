
import { LearningLesson, LearningLessonVideo } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { LessonVideoPlayer } from "./LessonVideoPlayer";
import { ContentRenderer } from "../content/ContentRenderer";

interface LessonContentProps {
  lesson: LearningLesson;
  videos: LearningLessonVideo[];
  onProgressUpdate: (progress: number) => void;
}

export const LessonContent = ({ lesson, videos, onProgressUpdate }: LessonContentProps) => {
  // Função para lidar com interações do usuário com o conteúdo
  const handleContentInteraction = () => {
    // Atualiza o progresso quando o usuário interage com o conteúdo
    // Definimos um valor intermediário para o progresso (50% se não houver vídeos)
    if (!videos.length) {
      onProgressUpdate(50);
    }
  };
  
  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">{lesson.title}</h2>
      
      <div className="space-y-8">
        {/* Reprodutor de vídeo (se houver vídeos) */}
        {videos.length > 0 && (
          <LessonVideoPlayer 
            video={videos[0]} 
            onProgress={(progress) => {
              // Atualizar progresso baseado no tempo do vídeo
              onProgressUpdate(progress);
            }}
          />
        )}
        
        {/* Conteúdo estruturado da aula */}
        <div>
          <ContentRenderer 
            content={lesson.content} 
            onInteraction={handleContentInteraction} 
          />
        </div>
      </div>
    </Card>
  );
};
