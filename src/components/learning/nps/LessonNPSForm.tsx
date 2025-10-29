
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
      return "bg-primary text-primary-foreground border-primary shadow-md ring-2 ring-primary/20";
    }
    
    return "bg-background text-foreground border-border hover:border-primary hover:bg-primary/5 hover:text-primary";
  };

  return (
    <Button
      type="button"
      variant="outline"
      className={`
        w-9 h-9 p-0 flex-shrink-0 transition-all duration-200 font-medium text-sm rounded-md
        ${getButtonStyles()}
        hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-1
      `}
      onClick={() => onClick(value)}
    >
      {value}
    </Button>
  );
};

interface LessonNPSFormProps {
  lessonId: string;
  onCompleted?: (score: number, feedback: string) => Promise<void>;
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (score === null) {
      console.warn('[LESSON-NPS-FORM] ⚠️ Tentativa de envio sem nota selecionada');
      return;
    }
    
    console.log('[LESSON-NPS-FORM] 📤 Enviando dados para modal pai:', { score, hasFeedback: !!feedback });
    
    // Passar dados para o componente pai (modal) salvar
    if (onCompleted) {
      console.log('[LESSON-NPS-FORM] ✅ Chamando onCompleted');
      await onCompleted(score, feedback);
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
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Carregando avaliação...</p>
        </div>
      </div>
    );
  }

  if (showSuccessMessage) {
    return (
      <div className="text-center py-8 space-y-4">
        <div className="flex justify-center">
          <CheckCircle2 className="h-16 w-16 text-primary animate-bounce" />
        </div>
        <h3 className="text-2xl font-bold text-primary">
          Avaliação enviada com sucesso!
        </h3>
        <p className="text-muted-foreground">
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
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <h3 className="text-lg font-bold text-foreground">
                Como foi sua experiência?
              </h3>
              <p className="text-sm text-muted-foreground">
                De 0 a 10, qual a probabilidade de você recomendar esta aula?
              </p>
            </div>
            
            {/* Botões NPS em duas linhas compactas */}
            <div className="space-y-3">
              {/* Primeira linha: 0-5 */}
              <div className="flex justify-center gap-1.5">
                {Array.from({ length: 6 }, (_, i) => (
                  <NPSRatingButton
                    key={i}
                    value={i}
                    selectedValue={score}
                    onClick={setScore}
                  />
                ))}
              </div>
              {/* Segunda linha: 6-10 */}
              <div className="flex justify-center gap-1.5">
                {Array.from({ length: 5 }, (_, i) => (
                  <NPSRatingButton
                    key={i + 6}
                    value={i + 6}
                    selectedValue={score}
                    onClick={setScore}
                  />
                ))}
              </div>
              
              {/* Labels da escala */}
              <div className="flex justify-between text-xs text-muted-foreground px-1">
                <span>Não recomendaria</span>
                <span>Recomendaria totalmente</span>
              </div>
            </div>
            
            {/* Feedback da nota selecionada */}
            <div className="h-12 flex items-center justify-center">
              {score !== null && (
                <div className="text-center animate-fade-in">
                  <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-4 py-2 rounded-lg">
                    <div className="text-sm font-bold text-primary">
                      {getScoreLabel()}
                    </div>
                    <div className="text-sm font-medium text-foreground">
                      Nota: {score}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Campo de feedback opcional */}
          {score !== null && (
            <div className="space-y-3 animate-fade-in">
              <label htmlFor="feedback" className="block text-sm font-medium text-foreground">
                Quer nos contar mais? (opcional)
              </label>
              <Textarea
                id="feedback"
                placeholder="Compartilhe sua experiência..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={3}
                className="resize-none border-border focus:border-primary focus:ring-primary/20 text-sm rounded-lg transition-colors"
              />
            </div>
          )}
        </CardContent>
        
        <CardFooter className="p-0 pt-6">
          <Button 
            type="submit" 
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3 text-sm shadow-sm transition-all duration-200 hover:shadow-md rounded-lg" 
            disabled={score === null || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando avaliação...
              </>
            ) : (
              <>
                <Star className="mr-2 h-4 w-4" />
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
