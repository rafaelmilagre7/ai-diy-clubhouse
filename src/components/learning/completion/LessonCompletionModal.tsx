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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { log } = useLogging();

  const handleNPSCompleted = async (score: number, feedback: string) => {
    if (!onSaveCompletion) {
      console.error('[MODAL] ❌ onSaveCompletion não definido');
      return;
    }

    setIsSubmitting(true);
    
    // ✅ Timeout de segurança (10 segundos)
    const safetyTimeout = setTimeout(() => {
      console.warn('[MODAL] ⚠️ Timeout de segurança ativado - resetando isSubmitting');
      setIsSubmitting(false);
    }, 10000);
    
    try {
      await onSaveCompletion(score, feedback);
      
      clearTimeout(safetyTimeout);
      log('NPS e progresso salvos', { lessonId: lesson.id, score });
      setNpsSubmitted(true);
      
      // Fechar modal e navegar após delay
      setTimeout(() => {
        setIsOpen(false);
        setNpsSubmitted(false); // Reset para próxima vez
        if (onNext && nextLesson) {
          onNext();
        }
      }, 1500);
    } catch (error) {
      clearTimeout(safetyTimeout);
      console.error('[MODAL] ❌ Erro:', error);
    } finally {
      // ✅ SEMPRE resetar isSubmitting, independente de sucesso ou erro
      setIsSubmitting(false);
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
            isSubmitting={isSubmitting}
            nextLesson={nextLesson}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LessonCompletionModal;
