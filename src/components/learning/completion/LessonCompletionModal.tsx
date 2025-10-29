
import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { LessonNPSForm } from "../nps/LessonNPSForm";
import { CheckCircle2 } from "lucide-react";
import { LearningLesson } from "@/lib/supabase";
import { useLogging } from "@/hooks/useLogging";

interface LessonCompletionModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  lesson: LearningLesson;
  onNext?: () => void;
  nextLesson?: LearningLesson | null;
  onSaveCompletion?: (score: number, feedback: string) => Promise<void>;
}

export const LessonCompletionModal: React.FC<LessonCompletionModalProps> = ({
  isOpen,
  setIsOpen,
  lesson,
  onNext,
  nextLesson,
  onSaveCompletion
}) => {
  const [npsSubmitted, setNpsSubmitted] = useState(false);
  const { log } = useLogging();
  
  console.log('[LESSON-COMPLETION-MODAL] 🔍 Props recebidas:', {
    isOpen,
    hasLesson: !!lesson,
    hasOnNext: !!onNext,
    hasOnSaveCompletion: !!onSaveCompletion,
    npsSubmitted
  });

  const handleNPSCompleted = async (score: number, feedback: string) => {
    console.log('[LESSON-COMPLETION-MODAL] 💾 ==========');
    console.log('[LESSON-COMPLETION-MODAL] 📥 Recebido:', { score, feedback });
    console.log('[LESSON-COMPLETION-MODAL] 📋 onSaveCompletion definido?', !!onSaveCompletion);
    
    if (!onSaveCompletion) {
      console.error('[LESSON-COMPLETION-MODAL] ❌ onSaveCompletion não definido - ABORTANDO');
      return;
    }

    try {
      console.log('[LESSON-COMPLETION-MODAL] 🚀 Iniciando salvamento...');
      await onSaveCompletion(score, feedback);
      
      console.log('[LESSON-COMPLETION-MODAL] ✅ Salvamento COMPLETO');
      log('NPS e progresso salvos', { lessonId: lesson.id, score });
      
      setNpsSubmitted(true);
      
      // Fechar modal e navegar após delay
      setTimeout(() => {
        console.log('[LESSON-COMPLETION-MODAL] 🔄 Fechando modal...');
        setIsOpen(false);
        if (onNext && nextLesson) {
          console.log('[LESSON-COMPLETION-MODAL] ➡️ Navegando para próxima aula');
          onNext();
        }
      }, 1500);
    } catch (error) {
      console.error('[LESSON-COMPLETION-MODAL] ❌ ERRO durante salvamento:', error);
      console.error('[LESSON-COMPLETION-MODAL] ❌ Detalhes:', {
        errorMessage: error instanceof Error ? error.message : 'Erro desconhecido',
        errorStack: error instanceof Error ? error.stack : undefined
      });
      // Modal permanece aberto para usuário tentar novamente
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen} modal>
      <DialogContent className="sm:max-w-md border-0 shadow-lg bg-background p-0 overflow-hidden">
        {/* Header with celebration animation */}
        <div className="relative bg-background border-b p-6 text-center">
          <div className="space-y-3">
            <div className="flex justify-center">
              <CheckCircle2 className="h-12 w-12 text-primary animate-scale-in" />
            </div>
            <DialogTitle className="text-xl font-bold text-foreground">
              Parabéns!
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Você concluiu a aula "{lesson.title}"
            </DialogDescription>
          </div>
        </div>

        {/* Content area */}
        <div className="p-6">
          <LessonNPSForm
            lessonId={lesson.id}
            onCompleted={handleNPSCompleted}
            showSuccessMessage={npsSubmitted}
            nextLesson={nextLesson}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LessonCompletionModal;
