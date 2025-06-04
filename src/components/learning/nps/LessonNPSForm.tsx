
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
      return "bg-viverblue text-white border-viverblue shadow-md ring-2 ring-viverblue/20";
    }
    
    return "bg-white text-gray-700 border-gray-200 hover:border-viverblue hover:bg-viverblue/5 hover:text-viverblue";
  };

  return (
    <Button
      type="button"
      variant="outline"
      className={`
        w-11 h-11 sm:w-12 sm:h-12 p-0 flex-shrink-0 transition-all duration-200 font-semibold text-base rounded-lg
        ${getButtonStyles()}
        hover:scale-102 active:scale-98 focus:outline-none focus:ring-2 focus:ring-viverblue/30 focus:ring-offset-2
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
            <div className="text-center space-y-3">
              <h3 className="text-2xl font-bold text-gray-800">
                Como foi sua experiência?
              </h3>
              <p className="text-lg text-gray-600 max-w-md mx-auto">
                De 0 a 10, qual a probabilidade de você recomendar esta aula?
              </p>
            </div>
            
            {/* Botões NPS com layout responsivo otimizado */}
            <div className="space-y-4">
              {/* Desktop: uma linha, Mobile: duas linhas */}
              <div className="block sm:hidden space-y-3">
                {/* Mobile: 0-5 */}
                <div className="flex justify-center gap-2">
                  {Array.from({ length: 6 }, (_, i) => (
                    <NPSRatingButton
                      key={i}
                      value={i}
                      selectedValue={score}
                      onClick={setScore}
                    />
                  ))}
                </div>
                {/* Mobile: 6-10 */}
                <div className="flex justify-center gap-2">
                  {Array.from({ length: 5 }, (_, i) => (
                    <NPSRatingButton
                      key={i + 6}
                      value={i + 6}
                      selectedValue={score}
                      onClick={setScore}
                    />
                  ))}
                </div>
              </div>
              
              {/* Desktop: linha única */}
              <div className="hidden sm:flex justify-center gap-2 max-w-4xl mx-auto">
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
              <div className="flex justify-between text-sm font-medium text-gray-500 px-2 max-w-4xl mx-auto">
                <span>Não recomendaria</span>
                <span>Recomendaria totalmente</span>
              </div>
            </div>
            
            {/* Feedback da nota selecionada - altura fixa para evitar layout shift */}
            <div className="h-20 flex items-center justify-center">
              {score !== null && (
                <div className="text-center animate-fade-in">
                  <div className="inline-flex items-center gap-3 bg-viverblue/5 border border-viverblue/20 px-6 py-3 rounded-xl">
                    <div className="text-xl font-bold text-viverblue">
                      {getScoreLabel()}
                    </div>
                    <div className="text-lg font-semibold text-gray-700">
                      Sua nota: {score}
                    </div>
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
                className="resize-none border-gray-200 focus:border-viverblue focus:ring-viverblue/20 text-base rounded-xl transition-colors"
              />
            </div>
          )}
        </CardContent>
        
        <CardFooter className="p-0 pt-8">
          <Button 
            type="submit" 
            className="w-full bg-viverblue hover:bg-viverblue-dark text-white font-semibold py-4 text-lg shadow-md transition-all duration-200 hover:shadow-lg hover:scale-[1.02] rounded-xl" 
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
