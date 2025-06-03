
import React, { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Award, Star, BookOpen, Clock, Trophy } from "lucide-react";
import { LearningCourse } from "@/lib/supabase";
import confetti from 'canvas-confetti';

interface CourseCompletionCelebrationModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  course?: LearningCourse | null;
  courseStats?: any;
}

export const CourseCompletionCelebrationModal: React.FC<CourseCompletionCelebrationModalProps> = ({
  isOpen,
  setIsOpen,
  course,
  courseStats
}) => {
  
  useEffect(() => {
    if (isOpen) {
      // Dispara confetti ao abrir o modal
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      
      const randomInRange = (min: number, max: number) => {
        return Math.random() * (max - min) + min;
      };
      
      const interval: NodeJS.Timeout = setInterval(() => {
        const timeLeft = animationEnd - Date.now();
        
        if (timeLeft <= 0) {
          return clearInterval(interval);
        }
        
        confetti({
          particleCount: Math.floor(randomInRange(30, 60)),
          angle: randomInRange(55, 125),
          spread: randomInRange(50, 70),
          origin: { x: 0, y: 0.8 }
        });
        
        confetti({
          particleCount: Math.floor(randomInRange(30, 60)),
          angle: randomInRange(55, 125),
          spread: randomInRange(50, 70),
          origin: { x: 1, y: 0.8 }
        });
      }, 250);
      
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  // Verificação defensiva para courseStats
  const statsToDisplay = {
    totalLessons: courseStats?.totalLessons || 0,
    completedLessons: courseStats?.completedLessons || 0,
    timeSpent: courseStats?.timeSpent || 0,
    completionPercentage: courseStats?.completionPercentage || 100
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-4">
          <div className="flex items-center gap-3 text-primary justify-center">
            <Trophy className="h-12 w-12 text-yellow-500" />
            <DialogTitle className="text-3xl font-bold text-center">
              🎉 Parabéns! Curso Concluído!
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-6">
          {/* Informações do curso */}
          <div className="text-center space-y-2">
            <h3 className="text-xl font-semibold">
              {course?.title || "Curso"}
            </h3>
            <p className="text-muted-foreground">
              Você concluiu com sucesso este curso da plataforma Viver de IA!
            </p>
          </div>

          {/* Estatísticas do curso */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg text-center border border-green-200">
              <div className="flex items-center justify-center mb-2">
                <BookOpen className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-green-700">
                {statsToDisplay.completedLessons}/{statsToDisplay.totalLessons}
              </div>
              <div className="text-sm text-green-600">Aulas Concluídas</div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg text-center border border-blue-200">
              <div className="flex items-center justify-center mb-2">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-blue-700">
                {statsToDisplay.timeSpent}min
              </div>
              <div className="text-sm text-blue-600">Tempo Investido</div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg text-center border border-purple-200">
              <div className="flex items-center justify-center mb-2">
                <Star className="h-6 w-6 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-purple-700">
                {Math.round(statsToDisplay.completionPercentage)}%
              </div>
              <div className="text-sm text-purple-600">Conclusão</div>
            </div>
          </div>

          {/* Conquistas */}
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-lg border border-yellow-200">
            <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-600" />
              Suas Conquistas
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span className="text-sm">Curso 100% completo</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span className="text-sm">Conhecimento aplicável adquirido</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span className="text-sm">Certificado disponível</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span className="text-sm">Pronto para próximos desafios</span>
              </div>
            </div>
          </div>

          {/* Próximos passos */}
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <h4 className="text-lg font-semibold mb-4">Próximos Passos</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <div className="bg-blue-100 p-1 rounded-full mt-0.5">
                  <Star className="h-3 w-3 text-blue-600" />
                </div>
                <span>Aplique o conhecimento adquirido em seus projetos</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-green-100 p-1 rounded-full mt-0.5">
                  <Award className="h-3 w-3 text-green-600" />
                </div>
                <span>Baixe seu certificado de conclusão</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-purple-100 p-1 rounded-full mt-0.5">
                  <BookOpen className="h-3 w-3 text-purple-600" />
                </div>
                <span>Explore outros cursos disponíveis na plataforma</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex justify-center gap-3 pt-4 border-t">
          <Button 
            onClick={() => setIsOpen(false)}
            className="bg-viverblue hover:bg-viverblue-dark"
          >
            Continuar Aprendendo
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CourseCompletionCelebrationModal;
