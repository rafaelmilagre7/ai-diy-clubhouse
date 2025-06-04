
import React, { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useLessonNPS } from "@/hooks/learning/useLessonNPS";
import { Loader2, Star, CheckCircle2 } from "lucide-react";
import { LearningLesson } from "@/lib/supabase";

interface NPSRatingButtonProps {
  value: number;
  selectedValue: number | null;
  onClick: (value: number) => void;
}

const NPSRatingButton: React.FC<NPSRatingButtonProps> = ({ value, selectedValue, onClick }) => {
  const isSelected = value === selectedValue;
  
  const getButtonStyles = () => {
    if (isSelected) {
      return "bg-viverblue text-white border-viverblue shadow-lg transform scale-110 font-bold";
    }
    
    return "bg-white text-gray-700 border-gray-300 hover:border-viverblue hover:bg-viverblue/10 hover:text-viverblue hover:shadow-md";
  };

  return (
    <Button
      type="button"
      variant="outline"
      className={`
        w-10 h-10 sm:w-12 sm:h-12 p-0 flex-shrink-0 transition-all duration-300 font-semibold text-sm sm:text-lg rounded-lg
        ${getButtonStyles()}
        hover:scale-105 active:scale-95 focus:ring-2 focus:ring-viverblue/30
      `}
      onClick={() => onClick(value)}
    >
      {value}
    </Button>
  );
};

interface LessonNPSFormProps {
  lessonId: string;
  onCompleted?: () => void;
  showSuccessMessage?: boolean;
  nextLesson?: LearningLesson | null;
}

export const LessonNPSForm: React.FC<LessonNPSFormProps> = ({ 
  lessonId, 
  onCompleted,
  showSuccessMessage = false,
  nextLesson
}) => {
  const { existingNPS, isLoading, isSubmitting, submitNPS } = useLessonNPS({ lessonId });
  const [score, setScore] = useState<number | null>(existingNPS?.score || null);
  const [feedback, setFeedback] = useState<string>(existingNPS?.feedback || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (score === null) {
      return;
    }
    
    submitNPS(score, feedback);
    
    if (onCompleted) {
      onCompleted();
    }
  };

  const getScoreLabel = () => {
    if (score === null) return "";
    if (score >= 9) return "Excelente! 🎉";
    if (score >= 7) return "Muito bom! 👍";
    return "Podemos melhorar 🤔";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-viverblue mx-auto" />
          <p className="text-gray-600">Carregando avaliação...</p>
        </div>
      </div>
    );
  }

  if (showSuccessMessage) {
    return (
      <div className="text-center py-8 space-y-4">
        <div className="flex justify-center">
          <CheckCircle2 className="h-16 w-16 text-viverblue animate-bounce" />
        </div>
        <h3 className="text-2xl font-bold text-viverblue">
          Avaliação enviada com sucesso!
        </h3>
        <p className="text-gray-600">
          {nextLesson 
            ? `Redirecionando para a próxima aula: ${nextLesson.title}...`
            : "Redirecionando..."
          }
        </p>
      </div>
    );
  }

  return (
    <Card className="border-0 shadow-none bg-transparent">
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-8 p-0">
          {/* Escala NPS */}
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-800 mb-3">
                Como foi sua experiência?
              </h3>
              <p className="text-lg text-gray-700 mb-6">
                De 0 a 10, qual a probabilidade de você recomendar esta aula?
              </p>
            </div>
            
            {/* Grid responsivo para os botões NPS - uma única linha */}
            <div className="space-y-6">
              <div className="flex justify-center gap-1 sm:gap-2 overflow-x-auto px-2">
                {Array.from({ length: 11 }, (_, i) => (
                  <NPSRatingButton
                    key={i}
                    value={i}
                    selectedValue={score}
                    onClick={setScore}
                  />
                ))}
              </div>
              
              {/* Labels da escala */}
              <div className="flex justify-between text-sm font-medium text-gray-600 px-4">
                <span className="text-left">Não recomendaria</span>
                <span className="text-right">Recomendaria totalmente</span>
              </div>
              
              {/* Container com altura fixa para feedback da nota - evita quebra de layout */}
              <div className="min-h-[80px] flex items-center justify-center">
                {score !== null && (
                  <div className="text-center animate-fade-in bg-viverblue/5 border border-viverblue/20 p-4 rounded-lg max-w-md mx-auto">
                    <div className="text-2xl font-bold text-viverblue mb-1">
                      {getScoreLabel()}
                    </div>
                    <div className="text-xl font-bold text-gray-700">
                      Sua nota: {score}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Campo de feedback opcional */}
          {score !== null && (
            <div className="space-y-4 animate-fade-in">
              <label htmlFor="feedback" className="block text-lg font-semibold text-gray-800">
                Quer nos contar mais sobre sua experiência? (opcional)
              </label>
              <Textarea
                id="feedback"
                placeholder="Compartilhe o que mais gostou ou como podemos melhorar..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={4}
                className="resize-none border-gray-300 focus:border-viverblue focus:ring-viverblue/20 text-base rounded-lg"
              />
            </div>
          )}
        </CardContent>
        
        <CardFooter className="p-0 pt-8">
          <Button 
            type="submit" 
            className="w-full bg-viverblue hover:bg-viverblue-dark text-white font-bold py-4 text-lg shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-[1.02] rounded-lg" 
            disabled={score === null || isSubmitting}
            size="lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Enviando sua avaliação...
              </>
            ) : (
              <>
                <Star className="mr-2 h-5 w-5" />
                Enviar avaliação
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default LessonNPSForm;
