
import React, { useState } from "react";
import { LearningLesson } from "@/lib/supabase/types";
import { LessonVideoPlayer } from "./LessonVideoPlayer";
import { LessonComments } from "../comments/LessonComments";
import { LessonResources } from "./LessonResources";
import { LessonAssistantChat } from "../assistant/LessonAssistantChat";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LessonCompletionModal } from "../completion/LessonCompletionModal";
import { LessonCoverImage } from "./LessonCoverImage";
import { LessonDescription } from "./LessonDescription";
import { LessonDuration } from "./LessonDuration";
import { LessonCompleteButton } from "./LessonCompleteButton";

interface LessonContentProps {
  lesson: LearningLesson;
  videos: any[];
  resources?: any[];
  isCompleted?: boolean;
  onProgressUpdate?: (videoId: string, progress: number) => void;
  onComplete?: () => void;
}

export const LessonContent: React.FC<LessonContentProps> = ({ 
  lesson, 
  videos,
  resources = [],
  isCompleted = false,
  onProgressUpdate,
  onComplete
}) => {
  const [completionDialogOpen, setCompletionDialogOpen] = useState(false);
  
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
  const hasVideos = videos && videos.length > 0;
  const hasResources = resources && resources.length > 0;
  const hasAiAssistant = lesson.ai_assistant_enabled;
  const useTabs = hasVideos || hasResources || hasAiAssistant;

  // Renderização baseada em tabs ou seções individuais
  if (useTabs) {
    return (
      <div className="space-y-6">
        <LessonCoverImage lesson={lesson} />
        <LessonDescription lesson={lesson} />
        {hasVideos && <LessonDuration videos={videos} />}
        
        <LessonCompleteButton 
          isCompleted={isCompleted} 
          onComplete={handleCompleteLesson} 
        />
        
        <Tabs defaultValue="video" className="w-full">
          <TabsList className="mb-4">
            {hasVideos && <TabsTrigger value="video">Vídeos</TabsTrigger>}
            {hasResources && <TabsTrigger value="resources">Materiais</TabsTrigger>}
            {hasAiAssistant && <TabsTrigger value="assistant">Assistente IA</TabsTrigger>}
          </TabsList>
          
          {hasVideos && (
            <TabsContent value="video" className="space-y-4">
              <LessonVideoPlayer 
                videos={videos}
                onProgress={(videoId, progress) => handleVideoProgress(videoId, progress)}
              />
            </TabsContent>
          )}
          
          {hasResources && (
            <TabsContent value="resources">
              <LessonResources resources={resources} />
            </TabsContent>
          )}
          
          {hasAiAssistant && (
            <TabsContent value="assistant">
              <LessonAssistantChat 
                lessonId={lesson.id}
                assistantId={lesson.ai_assistant_id}
                assistantPrompt={lesson.ai_assistant_prompt}
              />
            </TabsContent>
          )}
        </Tabs>
        
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
  }
  
  // Versão sem abas quando há somente um tipo de conteúdo
  return (
    <div className="space-y-6">
      <LessonCoverImage lesson={lesson} />
      <LessonDescription lesson={lesson} />
      {hasVideos && <LessonDuration videos={videos} />}
      
      <LessonCompleteButton 
        isCompleted={isCompleted} 
        onComplete={handleCompleteLesson} 
      />
      
      {hasVideos && (
        <section>
          <LessonVideoPlayer 
            videos={videos}
            onProgress={(videoId, progress) => handleVideoProgress(videoId, progress)}
          />
        </section>
      )}
      
      {hasResources && (
        <section className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Materiais complementares</h2>
          <LessonResources resources={resources} />
        </section>
      )}
      
      {hasAiAssistant && (
        <section className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Assistente IA</h2>
          <LessonAssistantChat 
            lessonId={lesson.id}
            assistantId={lesson.ai_assistant_id}
            assistantPrompt={lesson.ai_assistant_prompt}
          />
        </section>
      )}
      
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
