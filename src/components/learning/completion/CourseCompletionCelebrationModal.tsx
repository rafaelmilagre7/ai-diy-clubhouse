
import React, { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Trophy, 
  Star, 
  Clock, 
  BookOpen, 
  Award, 
  Download,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { LearningCourse } from "@/lib/supabase";
import { useLogging } from "@/hooks/useLogging";
import confetti from "canvas-confetti";

interface CourseCompletionCelebrationModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  course: LearningCourse;
  courseStats: {
    totalLessons: number;
    completedLessons: number;
    completionPercentage: number;
    timeSpent: number;
    isCompleted: boolean;
  };
  onGenerateCertificate?: () => Promise<any>;
  onContinueLearning?: () => void;
}

export const CourseCompletionCelebrationModal: React.FC<CourseCompletionCelebrationModalProps> = ({
  isOpen,
  setIsOpen,
  course,
  courseStats,
  onGenerateCertificate,
  onContinueLearning
}) => {
  const { log } = useLogging();
  const [certificateGenerated, setCertificateGenerated] = useState(false);
  const [isGeneratingCertificate, setIsGeneratingCertificate] = useState(false);

  // Efeito de confetti quando o modal abrir
  useEffect(() => {
    if (isOpen) {
      // Confetti inicial
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#3B82F6', '#8B5CF6', '#06B6D4', '#10B981']
      });

      // Confetti adicional após um delay
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.8 },
          colors: ['#F59E0B', '#EF4444', '#8B5CF6']
        });
      }, 200);

      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.8 },
          colors: ['#10B981', '#3B82F6', '#06B6D4']
        });
      }, 400);

      log("Modal de celebração de curso exibido", {
        courseId: course.id,
        courseTitle: course.title,
        stats: courseStats
      });
    }
  }, [isOpen]);

  const handleGenerateCertificate = async () => {
    if (!onGenerateCertificate || certificateGenerated) return;

    setIsGeneratingCertificate(true);
    try {
      const certificate = await onGenerateCertificate();
      if (certificate) {
        setCertificateGenerated(true);
        
        // Confetti especial para o certificado
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#FFD700', '#FFA500', '#FF6347']
        });
        
        log("Certificado gerado via celebração", {
          certificateId: certificate.id,
          courseId: course.id
        });
      }
    } catch (error) {
      console.error("Erro ao gerar certificado:", error);
    } finally {
      setIsGeneratingCertificate(false);
    }
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const handleContinue = () => {
    setIsOpen(false);
    if (onContinueLearning) {
      onContinueLearning();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-blue-50 via-purple-50 to-cyan-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 border-2 border-gradient-to-r from-blue-400 to-purple-400">
        <div className="text-center space-y-6 p-6">
          {/* Header com ícone de troféu */}
          <div className="relative">
            <div className="mx-auto w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-2xl">
              <Trophy className="h-12 w-12 text-white" />
            </div>
            <div className="absolute -top-2 -right-2">
              <Sparkles className="h-8 w-8 text-yellow-400 animate-pulse" />
            </div>
          </div>

          {/* Título principal */}
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              🎉 Parabéns!
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Você concluiu o curso
            </p>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
              "{course.title}"
            </h2>
          </div>

          {/* Estatísticas do curso */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <BookOpen className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-800 dark:text-white">
                  {courseStats.totalLessons}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Aulas Concluídas
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <Clock className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-800 dark:text-white">
                  {formatTime(courseStats.timeSpent)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Tempo Dedicado
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <Star className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-800 dark:text-white">
                  100%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Progresso
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Badge de conquista */}
          <div className="flex justify-center">
            <Badge variant="secondary" className="text-lg px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white">
              <Award className="h-5 w-5 mr-2" />
              Curso Concluído
            </Badge>
          </div>

          {/* Seção do certificado */}
          <Card className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border-amber-200 dark:border-amber-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Award className="h-6 w-6 text-amber-600" />
                <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-200">
                  Certificado de Conclusão
                </h3>
              </div>
              
              {!certificateGenerated ? (
                <Button
                  onClick={handleGenerateCertificate}
                  disabled={isGeneratingCertificate}
                  className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white"
                >
                  {isGeneratingCertificate ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Gerando Certificado...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Gerar Meu Certificado
                    </>
                  )}
                </Button>
              ) : (
                <div className="text-center">
                  <div className="text-green-600 dark:text-green-400 font-medium mb-2">
                    ✅ Certificado gerado com sucesso!
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Seu certificado está disponível na seção "Certificados" do seu perfil.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Botões de ação */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              className="flex-1"
            >
              Fechar
            </Button>
            <Button 
              onClick={handleContinue}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
            >
              Continuar Aprendendo
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
