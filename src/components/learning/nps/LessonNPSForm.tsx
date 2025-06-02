
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useLessonNPS } from "@/hooks/learning/useLessonNPS";
import { Loader2, MessageSquare, ThumbsDown, ThumbsUp, Meh } from "lucide-react";
import { cn } from "@/lib/utils";

interface NPSRatingButtonProps {
  value: number;
  selectedValue: number | null;
  onClick: (value: number) => void;
}

const NPSRatingButton: React.FC<NPSRatingButtonProps> = ({ value, selectedValue, onClick }) => {
  const isSelected = value === selectedValue;
  
  // Definir categoria de cor baseada no valor
  const getButtonStyle = () => {
    if (value <= 6) {
      // Detrator - Vermelho
      return isSelected 
        ? "bg-red-500 text-white border-red-600" 
        : "border-red-200 hover:border-red-400 hover:bg-red-50 text-red-600";
    } else if (value <= 8) {
      // Neutro - Amarelo
      return isSelected 
        ? "bg-yellow-500 text-white border-yellow-600" 
        : "border-yellow-200 hover:border-yellow-400 hover:bg-yellow-50 text-yellow-600";
    } else {
      // Promotor - Verde
      return isSelected 
        ? "bg-green-500 text-white border-green-600" 
        : "border-green-200 hover:border-green-400 hover:bg-green-50 text-green-600";
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      className={cn(
        "w-12 h-12 p-0 font-semibold text-base transition-all duration-200 transform hover:scale-105",
        getButtonStyle(),
        isSelected && "scale-110 shadow-lg"
      )}
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

  // Função para obter o placeholder baseado na pontuação
  const getFeedbackPlaceholder = () => {
    if (score === null) return "Compartilhe sua opinião sobre esta aula...";
    if (score <= 6) return "O que podemos melhorar para tornar esta aula mais útil?";
    if (score <= 8) return "Como podemos tornar esta aula ainda melhor?";
    return "O que mais você gostou nesta aula?";
  };

  // Função para obter o ícone da categoria
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'detrator': return <ThumbsDown className="w-5 h-5" />;
      case 'neutro': return <Meh className="w-5 h-5" />;
      case 'promotor': return <ThumbsUp className="w-5 h-5" />;
      default: return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="w-full max-w-3xl mx-auto bg-gradient-to-br from-[#151823] to-[#1A1E2E] border-white/10">
      <form onSubmit={handleSubmit}>
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-xl font-bold text-white flex items-center justify-center gap-2">
            <MessageSquare className="w-6 h-6 text-viverblue" />
            Sua opinião é muito importante!
          </CardTitle>
          <CardDescription className="text-neutral-300 text-base">
            De 0 a 10, qual a probabilidade de você recomendar esta aula para um colega?
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-8">
          {/* Seção de Avaliação NPS */}
          <div className="space-y-6">
            {/* Grid de botões NPS */}
            <div className="grid grid-cols-11 gap-2 sm:gap-3">
              {Array.from({ length: 11 }, (_, i) => (
                <NPSRatingButton
                  key={i}
                  value={i}
                  selectedValue={score}
                  onClick={setScore}
                />
              ))}
            </div>
            
            {/* Labels das categorias */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2 text-red-400">
                  {getCategoryIcon('detrator')}
                  <span className="font-medium">Detrator</span>
                </div>
                <p className="text-xs text-neutral-400">0 - 6</p>
              </div>
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2 text-yellow-400">
                  {getCategoryIcon('neutro')}
                  <span className="font-medium">Neutro</span>
                </div>
                <p className="text-xs text-neutral-400">7 - 8</p>
              </div>
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2 text-green-400">
                  {getCategoryIcon('promotor')}
                  <span className="font-medium">Promotor</span>
                </div>
                <p className="text-xs text-neutral-400">9 - 10</p>
              </div>
            </div>
          </div>
          
          {/* Feedback textual */}
          {score !== null && (
            <div className="space-y-3 animate-fade-in">
              <label htmlFor="feedback" className="text-sm font-medium text-white">
                Comentário adicional (opcional)
              </label>
              <Textarea
                id="feedback"
                placeholder={getFeedbackPlaceholder()}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={4}
                className="resize-none bg-[#1A1E2E] border-white/20 text-white placeholder:text-neutral-400 focus:border-viverblue focus:ring-viverblue/20"
                maxLength={500}
              />
              <div className="flex justify-between items-center text-xs text-neutral-400">
                <span>Sua experiência nos ajuda a melhorar</span>
                <span>{feedback.length}/500</span>
              </div>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="pt-6">
          <Button 
            type="submit" 
            className="w-full h-12 text-base font-medium bg-viverblue hover:bg-viverblue-dark transition-all duration-200" 
            disabled={score === null || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Enviando avaliação...
              </>
            ) : (
              <>
                <ThumbsUp className="mr-2 h-5 w-5" />
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
