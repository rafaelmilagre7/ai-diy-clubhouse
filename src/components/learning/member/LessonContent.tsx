
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  onNextLesson?: () => void;
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
  allLessons = [],
  onNextLesson
}) => {
  const [completionDialogOpen, setCompletionDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('video');
  
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

  // Função para lidar com a navegação para a próxima aula a partir do modal
  const handleNavigateToNext = () => {
    if (onNextLesson) {
      // Fechar o modal primeiro
      setCompletionDialogOpen(false);
      // Em seguida, navegar para a próxima aula
      onNextLesson();
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
  const hasTabs = hasResources || hasAiAssistant || true; // Sempre mostrar abas para incluir comentários
  
  return (
    <div className="space-y-6">
      {/* Player de vídeo como elemento principal */}
      {hasVideos && (
        <div>
          <LessonVideoPlayer 
            videos={safeVideos}
            onProgress={(videoId, progress) => handleVideoProgress(videoId, progress)}
          />
          
          {/* Botão de Concluir Aula logo abaixo do vídeo */}
          <div className="mt-4 flex justify-end">
            <Button 
              onClick={handleCompleteLesson}
              size="sm"
              variant={isCompleted ? "outline" : "default"}
              className="gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              {isCompleted ? "Aula Concluída" : "Marcar como Concluída"}
            </Button>
          </div>
        </div>
      )}
      
      {/* Descrição da aula, se existir */}
      {hasDescription && (
        <div className="mt-6">
          <LessonDescription content={lesson.description || ""} />
        </div>
      )}
      
      <Separator className="my-6" />
      
      {/* Abas para recursos, assistente e comentários */}
      {hasTabs && (
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="video">Conteúdo</TabsTrigger>
            {hasResources && <TabsTrigger value="resources">Recursos</TabsTrigger>}
            <TabsTrigger value="comments">Comentários</TabsTrigger>
          </TabsList>
          
          <TabsContent value="video" className="space-y-4">
            {hasDescription ? (
              <div className="text-sm text-muted-foreground">
                Veja a descrição acima e os recursos na aba correspondente.
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                Assista ao vídeo acima para completar esta aula.
              </div>
            )}
            
            {hasAiAssistant && (
              <div className="mt-6">
                <LessonAssistantChat lessonId={lesson.id} />
              </div>
            )}
          </TabsContent>
          
          {hasResources && (
            <TabsContent value="resources">
              <LessonResources resources={safeResources} />
            </TabsContent>
          )}
          
          <TabsContent value="comments">
            <LessonComments lessonId={lesson.id} />
          </TabsContent>
        </Tabs>
      )}
      
      {/* Modal de conclusão da aula */}
      <LessonCompletionModal
        isOpen={completionDialogOpen}
        setIsOpen={setCompletionDialogOpen}
        lesson={lesson}
        onNext={onNextLesson}
        nextLesson={nextLesson}
      />
    </div>
  );
};
