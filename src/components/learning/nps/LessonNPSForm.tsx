
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
      if (value >= 9) return "bg-green-600 text-white border-green-600 shadow-lg transform scale-110";
      if (value >= 7) return "bg-yellow-500 text-white border-yellow-500 shadow-lg transform scale-110";
      return "bg-red-500 text-white border-red-500 shadow-lg transform scale-110";
    }
    
    return "bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 hover:shadow-md";
  };

  return (
    <Button
      type="button"
      variant="outline"
      className={`
        w-12 h-12 p-0 flex-shrink-0 transition-all duration-300 font-bold text-lg rounded-lg
        ${getButtonStyles()}
        hover:scale-105 active:scale-95 focus:ring-2 focus:ring-blue-300
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

  const getScoreColor = () => {
    if (score === null) return "text-gray-500";
    if (score >= 9) return "text-green-600";
    if (score >= 7) return "text-yellow-600";
    return "text-red-600";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto" />
          <p className="text-gray-600">Carregando avaliação...</p>
        </div>
      </div>
    );
  }

  if (showSuccessMessage) {
    return (
      <div className="text-center py-8 space-y-4">
        <div className="flex justify-center">
          <CheckCircle2 className="h-16 w-16 text-green-500 animate-bounce" />
        </div>
        <h3 className="text-2xl font-bold text-green-600">
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
            
            {/* Grid responsivo para os botões NPS */}
            <div className="space-y-6">
              <div className="flex flex-wrap justify-center gap-2 max-w-3xl mx-auto">
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
              <div className="flex justify-between text-sm font-medium text-gray-600 max-w-3xl mx-auto px-4">
                <span className="text-left">Não recomendaria</span>
                <span className="text-right">Recomendaria totalmente</span>
              </div>
              
              {/* Feedback da nota selecionada */}
              {score !== null && (
                <div className="text-center animate-fade-in bg-gray-50 p-4 rounded-lg">
                  <div className={`text-2xl font-bold ${getScoreColor()}`}>
                    {getScoreLabel()}
                  </div>
                  <div className="text-xl font-bold text-blue-600 mt-2">
                    Sua nota: {score}
                  </div>
                </div>
              )}
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
                className="resize-none border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 text-base rounded-lg"
              />
            </div>
          )}
        </CardContent>
        
        <CardFooter className="p-0 pt-8">
          <Button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 text-lg shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-[1.02] rounded-lg" 
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
