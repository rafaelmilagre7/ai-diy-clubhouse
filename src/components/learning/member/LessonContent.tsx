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
import { toast } from "@/hooks/use-toast";
import { useLessonCompletion } from "@/hooks/learning";
import { useAuth } from "@/contexts/auth";

interface LessonContentProps {
  lesson: LearningLesson;
  videos: any[];
  resources?: any[];
  isCompleted?: boolean;
  onProgressUpdate?: (videoId: string, progress: number) => void;
  prevLesson?: any;
  nextLesson?: any;
  courseId?: string;
  allLessons?: any[];
  onNextLesson?: () => void;
  onPreviousLesson?: () => void;
  isUpdating?: boolean;
  onResetProgress?: () => void;
}

export const LessonContent: React.FC<LessonContentProps> = ({ 
  lesson, 
  videos,
  resources = [],
  isCompleted = false,
  onProgressUpdate,
  prevLesson,
  nextLesson,
  courseId,
  allLessons = [],
  onNextLesson,
  onPreviousLesson,
  isUpdating = false,
  onResetProgress
}) => {
  const [completionDialogOpen, setCompletionDialogOpen] = useState(false);
  const { user } = useAuth();
  
  // ✅ Usar hook otimizado para conclusão com sincronização de estado
  const { 
    completeLesson: completeWithHook,
    isCompleting: hookIsCompleting,
    isCompleted: hookCompleted,
    error: hookError
  } = useLessonCompletion({
    lessonId: lesson.id,
    initialCompleted: isCompleted,
    onSuccess: () => {
      console.log('[LESSON-CONTENT] ✅ Hook onSuccess - Abrindo modal NPS...');
      setCompletionDialogOpen(true);
    }
  });
  
  // Estado de conclusão: priorizar o do hook
  const completed = hookCompleted || isCompleted;
  const isCompleting = hookIsCompleting || isUpdating;
  
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
    console.log('[LESSON-CONTENT] 🎯 CLIQUE RECEBIDO - Iniciando conclusão');
    console.log('[LESSON-CONTENT] 📊 Dados:', { 
      userId: user?.id, 
      lessonId: lesson.id,
      completed,
      isCompleting,
      hookCompleted,
      hookIsCompleting
    });
    
    if (!user?.id) {
      console.error('[LESSON-CONTENT] ❌ Usuário não autenticado!');
      toast({
        title: "Erro de autenticação",
        description: "Você precisa estar autenticado para concluir a aula.",
        variant: "destructive"
      });
      return;
    }
    
    if (completed) {
      console.log('[LESSON-CONTENT] ⚠️ Já concluída, ignorando');
      toast({
        title: "Aula já concluída",
        description: "Esta aula já foi marcada como concluída.",
      });
      return;
    }
    
    console.log('[LESSON-CONTENT] ⚡ Chamando completeWithHook...');
    completeWithHook();
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
      
      {/* 🔧 PAINEL DE DEBUG - TEMPORÁRIO */}
      <div className="w-full p-4 bg-yellow-100 dark:bg-yellow-900/20 border-2 border-yellow-500 rounded-lg">
        <h3 className="text-sm font-bold mb-2 text-yellow-900 dark:text-yellow-100">🐛 DEBUG - Estados da Aula</h3>
        <div className="grid grid-cols-2 gap-2 text-xs font-mono text-yellow-900 dark:text-yellow-100">
          <div><strong>User ID:</strong> {user?.id || '❌ NULL'}</div>
          <div><strong>Lesson ID:</strong> {lesson.id}</div>
          <div><strong>isCompleted (prop):</strong> {String(isCompleted)}</div>
          <div><strong>hookCompleted:</strong> {String(hookCompleted)}</div>
          <div><strong>completed (final):</strong> {String(completed)}</div>
          <div><strong>isCompleting:</strong> {String(isCompleting)}</div>
          <div><strong>isUpdating:</strong> {String(isUpdating)}</div>
        </div>
      </div>
      
      {/* Barra de navegação logo abaixo do vídeo */}
      <div className="w-full">
        <LessonNavigationBar
          isCompleted={completed}
          onComplete={handleCompleteLesson}
          onPrevious={onPreviousLesson}
          onNext={onNextLesson || (() => {})}
          prevLesson={prevLesson}
          nextLesson={nextLesson}
          isUpdating={isCompleting || isUpdating}
          currentLessonIndex={currentLessonIndex}
          totalLessons={totalLessons}
          onResetProgress={onResetProgress}
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
