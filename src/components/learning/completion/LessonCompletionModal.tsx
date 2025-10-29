
import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center space-y-4 pb-2">
          <div className="flex justify-center">
            <div className="rounded-full bg-primary/10 p-3">
              <CheckCircle2 className="h-10 w-10 text-primary" />
            </div>
          </div>
          <div className="space-y-2">
            <DialogTitle className="text-2xl font-semibold">
              Parabéns!
            </DialogTitle>
            <DialogDescription className="text-base">
              Você concluiu a aula "{lesson.title}"
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="pt-2">
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
