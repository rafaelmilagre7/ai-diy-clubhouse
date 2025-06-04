
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useLessonNPS } from "@/hooks/learning/useLessonNPS";
import { Loader2 } from "lucide-react";

interface NPSRatingButtonProps {
  value: number;
  selectedValue: number | null;
  onClick: (value: number) => void;
}

const NPSRatingButton: React.FC<NPSRatingButtonProps> = ({ value, selectedValue, onClick }) => {
  const isSelected = value === selectedValue;

  return (
    <Button
      type="button"
      variant={isSelected ? "default" : "outline"}
      className={`w-10 h-10 p-0 flex-shrink-0 ${
        isSelected
          ? "bg-primary text-primary-foreground"
          : "hover:bg-primary/10"
      }`}
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Sua opinião é importante!</CardTitle>
          <CardDescription>
            Em uma escala de 0 a 10, qual a probabilidade de você recomendar esta aula para um colega?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Escala NPS em uma linha com scroll horizontal em mobile */}
          <div className="space-y-4">
            <div className="overflow-x-auto pb-2">
              <div className="flex gap-2 min-w-max justify-center px-2">
                {Array.from({ length: 11 }, (_, i) => (
                  <NPSRatingButton
                    key={i}
                    value={i}
                    selectedValue={score}
                    onClick={setScore}
                  />
                ))}
              </div>
            </div>
            
            {/* Labels da escala */}
            <div className="flex justify-between text-sm text-muted-foreground px-2">
              <span>0 - Péssimo</span>
              {score !== null && (
                <span className="text-lg font-medium text-primary">
                  Nota: {score}
                </span>
              )}
              <span>10 - Excelente</span>
            </div>
          </div>
          
          {score !== null && (
            <div className="space-y-2">
              <label htmlFor="feedback" className="text-sm font-medium">
                Você gostaria de compartilhar o motivo da sua avaliação? (opcional)
              </label>
              <Textarea
                id="feedback"
                placeholder="Conte-nos o que você achou da aula..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button 
            type="submit" 
            className="w-full" 
            disabled={score === null || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              'Enviar avaliação'
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default LessonNPSForm;
