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
import { toast } from "sonner";
import { useLessonCompletion } from "@/hooks/learning";
import { useAuth } from "@/contexts/auth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

interface LessonContentProps {
  lesson: LearningLesson;
  videos: any[];
  resources?: any[];
  prevLesson?: any;
  nextLesson?: any;
  courseId?: string;
  allLessons?: any[];
  onNextLesson?: () => void;
  onPreviousLesson?: () => void;
}

export const LessonContent: React.FC<LessonContentProps> = ({ 
  lesson, 
  videos,
  resources = [],
  prevLesson,
  nextLesson,
  courseId,
  allLessons = [],
  onNextLesson,
  onPreviousLesson
}) => {
  const [completionDialogOpen, setCompletionDialogOpen] = useState(false);
  const { user } = useAuth();
  
  // ✅ Buscar progresso diretamente do banco (fonte única de verdade)
  const { data: progressData, isLoading: progressLoading } = useQuery({
    queryKey: ["learning-progress", lesson.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from("learning_progress")
        .select("progress_percentage, completed_at")
        .eq("lesson_id", lesson.id)
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (error) {
        console.error("[LESSON-CONTENT] Erro ao buscar progresso:", error);
        return null;
      }
      
      return data;
    },
    enabled: !!user?.id && !!lesson?.id
  });
  
  // Determinar se está concluída baseado nos dados do banco
  const isCompleted = progressData?.progress_percentage >= 100 || !!progressData?.completed_at;
  
  // ✅ Hook de conclusão
  const { 
    completeLesson,
    isCompleting,
  } = useLessonCompletion({
    lessonId: lesson.id,
    initialCompleted: isCompleted,
    onSuccess: () => {
      console.log('[LESSON-CONTENT] ✅ Hook onSuccess - Abrindo modal NPS...');
      setCompletionDialogOpen(true);
    }
  });
  
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
  
  const handleCompleteLesson = () => {
    if (!user?.id) {
      toast.error("Você precisa estar autenticado para concluir a aula.");
      return;
    }
    
    if (isCompleted) {
      toast.info("Esta aula já foi marcada como concluída.");
      return;
    }
    
    completeLesson();
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
            onProgress={() => {}}
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
          isUpdating={isCompleting || progressLoading}
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