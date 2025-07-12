
import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LessonNPSForm } from "../nps/LessonNPSForm";
import { CheckCircle2, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LearningLesson } from "@/lib/supabase";
import { useLogging } from "@/hooks/useLogging";

interface LessonCompletionModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  lesson: LearningLesson;
  onNext?: () => void;
  nextLesson?: LearningLesson | null;
}

export const LessonCompletionModal: React.FC<LessonCompletionModalProps> = ({
  isOpen,
  setIsOpen,
  lesson,
  onNext,
  nextLesson
}) => {
  const [npsSubmitted, setNpsSubmitted] = useState(false);
  const { log } = useLogging();

  const handleNPSCompleted = () => {
    log('NPS enviado com sucesso para a aula', { lessonId: lesson.id, lessonTitle: lesson.title });
    setNpsSubmitted(true);
    
    // Automaticamente avança para próxima aula ou fecha o modal após envio
    setTimeout(() => {
      setIsOpen(false);
      if (onNext) onNext();
    }, 1500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen} modal>
      <DialogContent className="sm:max-w-md border-0 shadow-lg bg-background p-0 overflow-hidden">
        {/* Close button */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-3 top-3 z-10 rounded-full h-7 w-7 p-0 text-muted-foreground hover:text-foreground hover:bg-muted"
          onClick={() => setIsOpen(false)}
        >
          <X className="h-4 w-4" />
        </Button>
        
        {/* Header with celebration animation */}
        <div className="relative bg-background border-b p-6 text-center">
          <div className="space-y-3">
            <div className="flex justify-center">
              <div className="relative">
                <CheckCircle2 className="h-12 w-12 text-primary animate-scale-in" />
                <Sparkles className="h-4 w-4 absolute -top-1 -right-1 text-primary animate-pulse" />
              </div>
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
