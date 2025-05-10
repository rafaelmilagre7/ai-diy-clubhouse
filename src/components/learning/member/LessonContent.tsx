
import React, { useState } from "react";
import { LearningLesson } from "@/lib/supabase";
import { LessonVideoPlayer } from "./LessonVideoPlayer";
import { LessonComments } from "../comments/LessonComments";
import { LessonResources } from "./LessonResources";
import { LessonAssistantChat } from "../assistant/LessonAssistantChat";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LessonCompletionModal } from "../completion/LessonCompletionModal";
import { LessonDescription } from "./LessonDescription";
import { LessonDuration } from "./LessonDuration";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface LessonContentProps {
  lesson: LearningLesson;
  videos: any[];
  resources?: any[];
  isCompleted?: boolean;
  onProgressUpdate?: (videoId: string, progress: number) => void;
  onComplete?: () => void;
  prevLesson?: any;
  nextLesson?: any;
  courseId?: string;
  allLessons?: any[];
}

export const LessonContent: React.FC<LessonContentProps> = ({ 
  lesson, 
  videos,
  resources = [],
  isCompleted = false,
  onProgressUpdate,
  onComplete,
  prevLesson,
  nextLesson,
  courseId,
  allLessons = []
}) => {
  const [completionDialogOpen, setCompletionDialogOpen] = useState(false);
  
  // Garantir que videos e resources sejam sempre arrays
  const safeVideos = Array.isArray(videos) ? videos : [];
  const safeResources = Array.isArray(resources) ? resources : [];
  
  const handleVideoProgress = (videoId: string, progress: number) => {
    if (onProgressUpdate) {
      onProgressUpdate(videoId, progress);
    }
  };
  
  const handleCompleteLesson = () => {
    setCompletionDialogOpen(true);
    if (onComplete) {
      onComplete();
    }
  };
  
  // Verificar condições para exibição dos componentes
  const hasVideos = safeVideos.length > 0;
  const hasResources = safeResources.length > 0;
  const hasAiAssistant = lesson.ai_assistant_enabled;
  const hasDescription = lesson.description && lesson.description.trim() !== "" && 
                        !lesson.description.toLowerCase().includes("bem-vindo") &&
                        !lesson.description.toLowerCase().includes("seja bem-vindo");
  
  // Verificar se há conteúdo adicional para exibir em abas
  const hasTabs = hasResources || hasAiAssistant;
  
  return (
    <div className="space-y-6">
      {/* Player de vídeo como elemento principal */}
      {hasVideos && (
        <div>
          <LessonVideoPlayer 
            videos={safeVideos}
            onProgress={(videoId, progress) => handleVideoProgress(videoId, progress)}
          />
          
          {/* Informações sobre a duração abaixo do player - removido botão de atualização */}
          <div className="mt-4">
            <LessonDuration videos={safeVideos} showUpdateButton={false} />
          </div>
          
          {/* Alerta se o progresso for baixo (após começar a assistir) */}
          {!isCompleted && safeVideos.length > 0 && (
            <Alert className="mt-4 bg-blue-50 dark:bg-blue-950/20 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-900">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Dica de aprendizado</AlertTitle>
              <AlertDescription>
                Assista os vídeos até o final para registrar seu progresso. Marque a aula como concluída quando terminar.
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}
      
      {/* Título da aula em destaque acima da descrição */}
      {hasDescription && (
        <div className="mt-6">
          <h2 className="text-2xl font-bold mb-3">{lesson.title}</h2>
          <LessonDescription lesson={lesson} />
        </div>
      )}
      
      {/* Abas para conteúdo adicional (recursos e assistente IA) */}
      {hasTabs && (
        <div className="mt-6">
          <Tabs defaultValue={hasResources ? "resources" : "assistant"}>
            <TabsList>
              {hasResources && <TabsTrigger value="resources">Materiais</TabsTrigger>}
              {hasAiAssistant && <TabsTrigger value="assistant">Assistente IA</TabsTrigger>}
            </TabsList>
            
            {hasResources && (
              <TabsContent value="resources" className="mt-4">
                <LessonResources resources={safeResources} />
              </TabsContent>
            )}
            
            {hasAiAssistant && (
              <TabsContent value="assistant" className="mt-4">
                <LessonAssistantChat 
                  lessonId={lesson.id}
                  assistantId={lesson.ai_assistant_id}
                  assistantPrompt={lesson.ai_assistant_prompt}
                />
              </TabsContent>
            )}
          </Tabs>
        </div>
      )}
      
      {/* Comentários da aula */}
      <section className="mt-8">
        <Separator className="mb-6" />
        <LessonComments lessonId={lesson.id} />
      </section>

      <LessonCompletionModal
        isOpen={completionDialogOpen}
        setIsOpen={setCompletionDialogOpen}
        lesson={lesson}
        onNext={() => {}} // Navegação para próxima aula será implementada
      />
    </div>
  );
};

export default LessonContent;
