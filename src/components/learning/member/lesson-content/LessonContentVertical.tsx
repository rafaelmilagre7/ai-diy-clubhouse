
import React from "react";
import { LessonVideoPlayer } from "../LessonVideoPlayer";
import { LessonDescription } from "../LessonDescription";
import { LessonResources } from "../LessonResources";
import { LessonComments } from "../../comments/LessonComments";
import { LearningLesson, LearningLessonVideo, LearningResource } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, FileText, MessageSquare, BookOpen } from "lucide-react";

interface LessonContentVerticalProps {
  lesson: LearningLesson;
  videos: LearningLessonVideo[];
  resources: LearningResource[];
  onProgressUpdate?: (videoId: string, progress: number) => void;
}

export const LessonContentVertical: React.FC<LessonContentVerticalProps> = ({
  lesson,
  videos,
  resources,
  onProgressUpdate
}) => {
  return (
    <div className="space-y-8">
      {/* Seção de Vídeos - Sempre no topo */}
      {videos.length > 0 && (
        <Card className="bg-cardBg border-cardBorder">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Play className="h-5 w-5 text-viverblue" />
              Vídeos da Aula ({videos.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <LessonVideoPlayer 
              videos={videos}
              onProgress={onProgressUpdate}
            />
          </CardContent>
        </Card>
      )}

      {/* Seção de Conteúdo/Descrição */}
      {lesson.description && (
        <Card className="bg-cardBg border-cardBorder">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BookOpen className="h-5 w-5 text-viverblue" />
              Conteúdo da Aula
            </CardTitle>
          </CardHeader>
          <CardContent>
            <LessonDescription lesson={lesson} />
          </CardContent>
        </Card>
      )}

      {/* Seção de Recursos */}
      {resources.length > 0 && (
        <Card className="bg-cardBg border-cardBorder">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5 text-viverblue" />
              Recursos e Materiais ({resources.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <LessonResources resources={resources} />
          </CardContent>
        </Card>
      )}

      {/* Seção de Comentários */}
      <Card className="bg-cardBg border-cardBorder">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageSquare className="h-5 w-5 text-viverblue" />
            Discussão e Comentários
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LessonComments lessonId={lesson.id} />
        </CardContent>
      </Card>
    </div>
  );
};
