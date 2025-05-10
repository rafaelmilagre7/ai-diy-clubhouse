
import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LessonNPSForm } from "../nps/LessonNPSForm";
import { CheckCircle2, ArrowRight } from "lucide-react";
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
  const { log, logError } = useLogging();

  const handleNPSCompleted = () => {
    log('NPS enviado com sucesso para a aula', { lessonId: lesson.id, lessonTitle: lesson.title });
    setNpsSubmitted(true);
    
    // Mantém o modal aberto por um momento para que o usuário veja a confirmação
    setTimeout(() => {
      setIsOpen(false);
      if (onNext) onNext();
    }, 1000);
  };

  // Determina o texto para o botão de próxima aula baseado na existência de uma próxima aula
  const getNextLessonText = () => {
    if (nextLesson) {
      return `Próxima aula: ${nextLesson.title}`;
    }
    return "Finalizar curso";
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary">
            <CheckCircle2 className="h-6 w-6" />
            <DialogTitle>Aula concluída!</DialogTitle>
          </div>
          <DialogDescription>
            Parabéns por concluir a aula "{lesson.title}".
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <LessonNPSForm
            lessonId={lesson.id}
            onCompleted={handleNPSCompleted}
          />
        </div>

        <DialogFooter className="sm:justify-between">
          <Button
            variant="ghost"
            onClick={() => setIsOpen(false)}
          >
            Fechar
          </Button>
          {onNext && (
            <Button 
              onClick={() => {
                if (!npsSubmitted) {
                  log('Usuário avançou sem enviar NPS', { lessonId: lesson.id });
                }
                setIsOpen(false);
                onNext();
              }} 
              className="gap-2"
            >
              {getNextLessonText()}
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LessonCompletionModal;
