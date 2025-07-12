
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
      <DialogContent className="sm:max-w-2xl border-0 shadow-2xl bg-background p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-4 top-4 z-10 rounded-full h-8 w-8 p-0 text-primary-foreground/80 hover:text-primary-foreground hover:bg-white/20"
          onClick={() => setIsOpen(false)}
        >
          <X className="h-4 w-4" />
        </Button>
        
        {/* Header with celebration animation */}
        <div className="relative bg-gradient-to-r from-primary to-accent p-8 text-primary-foreground">
          <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>
          <div className="relative">
            <DialogHeader className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="relative">
                  <CheckCircle2 className="h-16 w-16 text-primary-foreground animate-scale-in" />
                  <Sparkles className="h-6 w-6 absolute -top-2 -right-2 text-accent-foreground animate-pulse" />
                </div>
              </div>
              <DialogTitle className="text-3xl font-bold text-primary-foreground">
                Parabéns!
              </DialogTitle>
              <DialogDescription className="text-xl text-primary-foreground/90 font-medium">
                Você concluiu a aula "{lesson.title}"
              </DialogDescription>
            </DialogHeader>
          </div>
        </div>

        {/* Content area */}
        <div className="p-8">
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
