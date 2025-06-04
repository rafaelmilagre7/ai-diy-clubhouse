
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useLessonNPS } from "@/hooks/learning/useLessonNPS";
import { Loader2, Star } from "lucide-react";

interface NPSRatingButtonProps {
  value: number;
  selectedValue: number | null;
  onClick: (value: number) => void;
}

const NPSRatingButton: React.FC<NPSRatingButtonProps> = ({ value, selectedValue, onClick }) => {
  const isSelected = value === selectedValue;
  
  // Determinar cor baseada no valor
  const getButtonStyles = () => {
    if (isSelected) {
      if (value >= 9) return "bg-green-500 text-white border-green-500 shadow-lg shadow-green-200";
      if (value >= 7) return "bg-yellow-500 text-white border-yellow-500 shadow-lg shadow-yellow-200";
      return "bg-red-500 text-white border-red-500 shadow-lg shadow-red-200";
    }
    
    return "bg-white text-gray-700 border-gray-200 hover:border-viverblue hover:bg-viverblue/5 hover:text-viverblue";
  };

  return (
    <Button
      type="button"
      variant="outline"
      className={`
        w-12 h-12 p-0 flex-shrink-0 transition-all duration-200 font-bold text-lg
        ${getButtonStyles()}
        hover:scale-110 active:scale-95
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
}

export const LessonNPSForm: React.FC<LessonNPSFormProps> = ({ lessonId, onCompleted }) => {
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
          <Loader2 className="w-8 h-8 animate-spin text-viverblue mx-auto" />
          <p className="text-gray-600">Carregando avaliação...</p>
        </div>
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
              <p className="text-lg font-medium text-gray-800 mb-2">
                De 0 a 10, qual a probabilidade de você recomendar esta aula?
              </p>
              <p className="text-sm text-gray-600">
                Sua avaliação é anônima e nos ajuda a melhorar
              </p>
            </div>
            
            {/* Grid responsivo para os botões NPS */}
            <div className="space-y-4">
              <div className="grid grid-cols-11 gap-2 max-w-2xl mx-auto">
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
              <div className="flex justify-between text-sm text-gray-500 max-w-2xl mx-auto px-2">
                <span className="text-left">Não recomendaria</span>
                <span className="text-right">Recomendaria totalmente</span>
              </div>
              
              {/* Feedback da nota selecionada */}
              {score !== null && (
                <div className="text-center animate-fade-in">
                  <div className={`text-xl font-semibold ${getScoreColor()}`}>
                    {getScoreLabel()}
                  </div>
                  <div className="text-lg font-bold text-viverblue mt-1">
                    Sua nota: {score}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Campo de feedback opcional */}
          {score !== null && (
            <div className="space-y-3 animate-fade-in">
              <label htmlFor="feedback" className="block text-base font-medium text-gray-800">
                Quer nos contar mais sobre sua experiência? (opcional)
              </label>
              <Textarea
                id="feedback"
                placeholder="Compartilhe o que mais gostou ou como podemos melhorar..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={4}
                className="resize-none border-gray-200 focus:border-viverblue focus:ring-viverblue/20 text-base"
              />
            </div>
          )}
        </CardContent>
        
        <CardFooter className="p-0 pt-6">
          <Button 
            type="submit" 
            className="w-full bg-viverblue hover:bg-viverblue-dark text-white font-semibold py-3 text-lg shadow-lg transition-all duration-200 hover:shadow-xl" 
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
