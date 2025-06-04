
import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LessonNPSForm } from "../nps/LessonNPSForm";
import { CheckCircle2, ArrowRight, Sparkles } from "lucide-react";
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
      <DialogContent className="sm:max-w-2xl border-0 shadow-2xl bg-gradient-to-br from-white to-slate-50 p-0 overflow-hidden">
        {/* Header with celebration animation */}
        <div className="relative bg-gradient-to-r from-viverblue to-sky-500 p-8 text-white">
          <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>
          <div className="relative">
            <DialogHeader className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="relative">
                  <CheckCircle2 className="h-16 w-16 text-white animate-scale-in" />
                  <Sparkles className="h-6 w-6 absolute -top-2 -right-2 text-yellow-300 animate-pulse" />
                </div>
              </div>
              <DialogTitle className="text-3xl font-bold text-white">
                Parabéns!
              </DialogTitle>
              <DialogDescription className="text-xl text-white/90 font-medium">
                Você concluiu a aula "{lesson.title}"
              </DialogDescription>
            </DialogHeader>
          </div>
        </div>

        {/* Content area */}
        <div className="p-8">
          <div className="text-center mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Como foi sua experiência?
            </h3>
            <p className="text-gray-600">
              Sua opinião nos ajuda a melhorar constantemente o conteúdo
            </p>
          </div>

          <LessonNPSForm
            lessonId={lesson.id}
            onCompleted={handleNPSCompleted}
          />
        </div>

        {/* Footer */}
        <DialogFooter className="bg-gray-50 border-t px-8 py-6 flex-col sm:flex-row gap-3">
          <Button
            variant="ghost"
            onClick={() => setIsOpen(false)}
            className="order-2 sm:order-1"
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
              className="order-1 sm:order-2 gap-2 bg-viverblue hover:bg-viverblue-dark shadow-lg px-6 py-3 font-semibold"
              size="lg"
            >
              {nextLesson ? (
                <>
                  <span className="truncate max-w-[200px]">{getNextLessonText()}</span>
                  <ArrowRight className="h-5 w-5 flex-shrink-0" />
                </>
              ) : (
                <>
                  Finalizar curso
                  <CheckCircle2 className="h-5 w-5" />
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LessonCompletionModal;
