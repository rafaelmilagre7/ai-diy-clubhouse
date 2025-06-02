
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
import { AlertCircle, CheckCircle, ArrowRight } from "lucide-react";
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
  const [activeTab, setActiveTab] = useState('assistant');
  
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

  // Função para navegar diretamente para a próxima aula
  const handleDirectNextLesson = () => {
    if (onNextLesson) {
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
  const hasResources = safeResources.length > 0;
  const hasAiAssistant = lesson.ai_assistant_enabled;
  
  // Determinar texto do botão de próxima aula
  const getNextButtonText = () => {
    if (nextLesson) {
      return "Próxima Aula";
    }
    return "Finalizar Curso";
  };
  
  return (
    <div className="space-y-6">
      {/* Player de vídeo como elemento principal */}
      {hasVideos && (
        <div>
          <LessonVideoPlayer 
            videos={safeVideos}
            onProgress={(videoId, progress) => handleVideoProgress(videoId, progress)}
          />
          
          {/* Botões de ação logo abaixo do vídeo */}
          <div className="mt-4 flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center">
            {/* Botão de Concluir Aula */}
            <div className="order-2 sm:order-1">
              <Button 
                onClick={handleCompleteLesson}
                size="sm"
                variant={isCompleted ? "outline" : "default"}
                className="w-full sm:w-auto gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                {isCompleted ? "Aula Concluída" : "Marcar como Concluída"}
              </Button>
            </div>
            
            {/* Botão de Próxima Aula */}
            <div className="order-1 sm:order-2">
              <Button 
                onClick={handleDirectNextLesson}
                size="sm"
                variant="outline"
                className="w-full sm:w-auto gap-2 border-viverblue text-viverblue hover:bg-viverblue hover:text-white"
                disabled={!onNextLesson}
                title={nextLesson?.title || "Voltar para a página do curso"}
              >
                {getNextButtonText()}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Descrição da aula, se existir */}
      {hasDescription && (
        <div className="mt-6">
          <LessonDescription lesson={lesson} />
        </div>
      )}
      
      {/* Recursos/Materiais da aula (agora sempre visíveis) */}
      {hasResources && (
        <div className="mt-6">
          <LessonResources resources={safeResources} />
        </div>
      )}
      
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
