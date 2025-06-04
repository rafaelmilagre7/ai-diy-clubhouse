
import React, { useState } from "react";
import { LearningLesson } from "@/lib/supabase";
import { LessonVideoPlayer } from "./LessonVideoPlayer";
import { LessonComments } from "../comments/LessonComments";
import { LessonResources } from "./LessonResources";
import { LessonAssistantChat } from "../assistant/LessonAssistantChat";
import { LessonNavigationBar } from "./LessonNavigationBar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LessonCompletionModal } from "../completion/LessonCompletionModal";
import { LessonDescription } from "./LessonDescription";
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
  onNextLesson?: () => void;
  onPreviousLesson?: () => void;
  isUpdating?: boolean;
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
  onNextLesson,
  onPreviousLesson,
  isUpdating = false
}) => {
  const [completionDialogOpen, setCompletionDialogOpen] = useState(false);
  
  // Verificar se temos um objeto lesson válido
  if (!lesson) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erro ao carregar aula</AlertTitle>
        <AlertDescription>
          Não foi possível carregar os dados da aula. Por favor, tente novamente.
        </AlertDescription>
      </Alert>
    );
  }
  
  // Garantir que videos e resources sejam sempre arrays
  const safeVideos = Array.isArray(videos) ? videos : [];
  const safeResources = Array.isArray(resources) ? resources : [];
  
  const handleVideoProgress = (videoId: string, progress: number) => {
    if (onProgressUpdate) {
      onProgressUpdate(videoId, progress);
    }
  };
  
  const handleCompleteLesson = () => {
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

  // Verificação mais robusta para a descrição da aula
  const hasDescription = lesson && 
                        lesson.description && 
                        lesson.description.trim() !== "" && 
                        !lesson.description.toLowerCase().includes("bem-vindo") &&
                        !lesson.description.toLowerCase().includes("seja bem-vindo");
  
  // Verificar condições para exibição dos componentes
  const hasVideos = safeVideos.length > 0;
  const hasAiAssistant = lesson.ai_assistant_enabled;
  
  return (
    <div className="space-y-6 pb-20"> {/* Adicionar padding bottom para a barra de navegação fixa */}
      {/* Player de vídeo como elemento principal - agora com largura total */}
      {hasVideos && (
        <div>
          <LessonVideoPlayer 
            videos={safeVideos}
            onProgress={(videoId, progress) => handleVideoProgress(videoId, progress)}
          />
        </div>
      )}
      
      {/* Descrição da aula, se existir */}
      {hasDescription && (
        <div className="mt-6">
          <LessonDescription lesson={lesson} />
        </div>
      )}
      
      {/* Recursos/Materiais da aula (sempre visível) */}
      <div className="mt-6">
        <LessonResources resources={safeResources} />
      </div>
      
      <Separator className="my-6" />
      
      {/* Comentários sempre visíveis após os recursos */}
      <div className="mt-6">
        <LessonComments lessonId={lesson.id} />
      </div>
      
      {/* Assistente IA em uma aba separada, se estiver disponível */}
      {hasAiAssistant && (
        <div className="mt-6">
          <Tabs defaultValue="assistant" className="mt-4">
            <TabsList>
              <TabsTrigger value="assistant">Assistente IA</TabsTrigger>
            </TabsList>
            <TabsContent value="assistant">
              <LessonAssistantChat lessonId={lesson.id} />
            </TabsContent>
          </Tabs>
        </div>
      )}
      
      {/* Barra de navegação fixa */}
      <LessonNavigationBar
        isCompleted={isCompleted}
        onComplete={handleCompleteLesson}
        onPrevious={onPreviousLesson}
        onNext={onNextLesson || (() => {})}
        prevLesson={prevLesson}
        nextLesson={nextLesson}
        isUpdating={isUpdating}
      />
      
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
