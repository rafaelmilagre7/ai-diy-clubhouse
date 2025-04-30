
import { LearningLesson, LearningLessonVideo } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { LessonVideoPlayer } from "./LessonVideoPlayer";

interface LessonContentProps {
  lesson: LearningLesson;
  videos: LearningLessonVideo[];
  onProgressUpdate: (progress: number) => void;
}

export const LessonContent = ({ lesson, videos, onProgressUpdate }: LessonContentProps) => {
  // Função para renderizar o conteúdo da lição baseado no tipo
  const renderContent = () => {
    // Conteúdo em texto da lição
    const textContent = lesson.content ? (
      <div className="prose prose-slate max-w-none">
        {/* Renderizar conteúdo estruturado (JSON) - Implementação completa necessária */}
        <div dangerouslySetInnerHTML={{ __html: typeof lesson.content === 'string' 
          ? lesson.content 
          : JSON.stringify(lesson.content) }} />
      </div>
    ) : (
      <p className="text-muted-foreground">Esta lição não possui conteúdo textual.</p>
    );
    
    return (
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
        
        {/* Conteúdo textual */}
        <div>
          {textContent}
        </div>
      </div>
    );
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">{lesson.title}</h2>
      {renderContent()}
    </Card>
  );
};
