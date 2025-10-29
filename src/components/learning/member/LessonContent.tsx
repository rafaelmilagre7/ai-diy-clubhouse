import React, { useState } from "react";
import { LearningLesson, supabase } from "@/lib/supabase";
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
import { toast } from "@/hooks/use-toast";

interface LessonContentProps {
  lesson: LearningLesson;
  videos: any[];
  resources?: any[];
  isCompleted?: boolean;
  onProgressUpdate?: (videoId: string, progress: number) => void;
  onComplete?: () => Promise<boolean> | void;
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
  
  const handleCompleteLesson = async () => {
    console.log('[LESSON-CONTENT] 🎯 Botão de conclusão clicado');
    
    // Verificar se usuário está autenticado
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('[LESSON-CONTENT] ❌ Usuário não autenticado');
      toast({
        variant: "destructive",
        title: "Erro de Autenticação",
        description: "Você precisa estar logado para marcar a aula como concluída"
      });
      return;
    }
    
    if (!onComplete) {
      console.log('[LESSON-CONTENT] ⚠️ Falta onComplete callback');
      return;
    }
    
    console.log('[LESSON-CONTENT] ⏳ Salvando progresso para usuário:', user.email);
    
    try {
      const result = await onComplete();
      
      if (result === false) {
        console.error('[LESSON-CONTENT] ❌ Falha ao salvar progresso');
        toast({
          variant: "destructive",
          title: "Erro ao salvar progresso",
          description: "Não foi possível salvar seu progresso no banco de dados. Por favor, tente novamente."
        });
        return;
      }
      
      console.log('[LESSON-CONTENT] ✅ Progresso salvo! Abrindo modal de NPS');
      setCompletionDialogOpen(true);
    } catch (error) {
      console.error('[LESSON-CONTENT] ❌ Erro ao completar aula:', error);
      console.error('[LESSON-CONTENT] Stack trace:', error);
      
      toast({
        variant: "destructive",
        title: "Erro",
        description: `Erro ao concluir aula: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      });
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
  
  // Calcular posição da aula no curso
  const currentLessonIndex = allLessons.findIndex(l => l.id === lesson.id);
  const totalLessons = allLessons.length;

  return (
    <div className="space-y-8">
      {/* Player de vídeo como elemento principal */}
      {hasVideos && (
        <div className="w-full">
          <LessonVideoPlayer 
            videos={safeVideos}
            lessonId={lesson.id}
            onProgress={(videoId, progress) => handleVideoProgress(videoId, progress)}
          />
        </div>
      )}
      
      {/* Barra de navegação logo abaixo do vídeo */}
      <div className="w-full">
        <LessonNavigationBar
          isCompleted={isCompleted}
          onComplete={handleCompleteLesson}
          onPrevious={onPreviousLesson}
          onNext={onNextLesson || (() => {})}
          prevLesson={prevLesson}
          nextLesson={nextLesson}
          isUpdating={isUpdating}
          currentLessonIndex={currentLessonIndex}
          totalLessons={totalLessons}
        />
      </div>
      
      <Separator className="my-8" />
      
      {/* Descrição da aula, se existir */}
      {hasDescription && (
        <div>
          <LessonDescription lesson={lesson} />
        </div>
      )}
      
      {/* Recursos/Materiais da aula */}
      <div>
        <LessonResources resources={safeResources} />
      </div>
      
      <Separator className="my-8" />
      
      {/* Comentários sempre visíveis após os recursos */}
      <div>
        <LessonComments lessonId={lesson.id} />
      </div>
      
      {/* Assistente IA em uma aba separada, se estiver disponível */}
      {hasAiAssistant && (
        <div className="mt-8">
          <Tabs defaultValue="assistant">
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
        onNext={handleNavigateToNext}
        nextLesson={nextLesson}
      />
    </div>
  );
};
