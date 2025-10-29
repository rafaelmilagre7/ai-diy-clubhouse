import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { LessonNPSForm } from "../nps/LessonNPSForm";
import { CheckCircle2 } from "lucide-react";
import { LearningLesson } from "@/lib/supabase";
import { useLogging } from "@/hooks/useLogging";
import { toast } from "sonner";

interface LessonCompletionModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  lesson: LearningLesson;
  onNext?: () => void;
  nextLesson?: LearningLesson | null;
  onSaveCompletion?: (score: number, feedback: string) => Promise<void>;
  isSubmitting?: boolean;
}

export const LessonCompletionModal: React.FC<LessonCompletionModalProps> = ({
  isOpen,
  setIsOpen,
  lesson,
  onNext,
  nextLesson,
  onSaveCompletion,
  isSubmitting
}) => {
  const [npsSubmitted, setNpsSubmitted] = useState(false);
  const { log } = useLogging();

  const handleNPSCompleted = async (score: number, feedback: string) => {
    if (!onSaveCompletion) {
      console.error('[MODAL] ❌ onSaveCompletion não definido');
      toast.error('Erro: função de salvamento não encontrada');
      return;
    }
    
    try {
      console.log('[MODAL] 📤 Enviando para onSaveCompletion:', { score, feedback });
      
      // Aguardar salvamento completo
      await onSaveCompletion(score, feedback);
      
      log('NPS e progresso salvos', { lessonId: lesson.id, score });
      
      // Apenas após sucesso, mostrar mensagem de sucesso
      setNpsSubmitted(true);
      
      // Fechar modal e navegar após delay maior para ver o toast
      setTimeout(() => {
        setIsOpen(false);
        setNpsSubmitted(false);
        if (onNext && nextLesson) {
          console.log('[MODAL] 🔄 Navegando para próxima aula:', nextLesson.id);
          onNext();
        }
      }, 3000); // 3 segundos para ver o toast
      
    } catch (error: any) {
      console.error('[MODAL] ❌ Erro ao salvar:', error);
      toast.error(error.message || 'Erro ao salvar. Tente novamente.');
      // NÃO fechar o modal em caso de erro
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
