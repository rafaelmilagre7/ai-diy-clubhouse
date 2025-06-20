
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLessonNPS } from '@/hooks/learning/useLessonNPS';
import { cn } from '@/lib/utils';

interface LessonNPSFormProps {
  lessonId: string;
  className?: string;
}

const npsScores = [
  { value: 0, label: '0' },
  { value: 1, label: '1' },
  { value: 2, label: '2' },
  { value: 3, label: '3' },
  { value: 4, label: '4' },
  { value: 5, label: '5' },
  { value: 6, label: '6' },
  { value: 7, label: '7' },
  { value: 8, label: '8' },
  { value: 9, label: '9' },
  { value: 10, label: '10' },
];

export const LessonNPSForm = ({ lessonId, className }: LessonNPSFormProps) => {
  const { existingNPS, isLoading, submitNPS } = useLessonNPS({ lessonId });
  const [selectedScore, setSelectedScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    if (existingNPS) {
      setSelectedScore((existingNPS as any).score);
      setFeedback((existingNPS as any).feedback || '');
      setHasSubmitted(true);
    }
  }, [existingNPS]);

  const handleSubmit = async () => {
    if (selectedScore === null) return;
    
    try {
      await submitNPS(selectedScore, feedback);
      setHasSubmitted(true);
    } catch (error) {
      console.error('Erro ao enviar avaliação:', error);
    }
  };

  const handleScoreChange = (score: number) => {
    setSelectedScore(score);
    setHasSubmitted(false);
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-20 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getScoreColor = (score: number) => {
    if (score <= 6) return 'bg-red-500 hover:bg-red-600';
    if (score <= 8) return 'bg-yellow-500 hover:bg-yellow-600';
    return 'bg-green-500 hover:bg-green-600';
  };

  const getScoreLabel = () => {
    if (selectedScore === null) return '';
    if (selectedScore <= 6) return 'Não recomendaria';
    if (selectedScore <= 8) return 'Neutro';
    return 'Recomendaria fortemente';
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">Como você avaliaria esta aula?</CardTitle>
        <CardDescription>
          Em uma escala de 0 a 10, o quanto você recomendaria esta aula para um colega?
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Grid de pontuação NPS */}
        <div className="space-y-4">
          <div className="grid grid-cols-11 gap-2">
            {npsScores.map((score) => (
              <Button
                key={score.value}
                variant={selectedScore === score.value ? "default" : "outline"}
                size="sm"
                className={cn(
                  "h-10 w-10 p-0 text-sm font-medium transition-colors",
                  selectedScore === score.value && getScoreColor(score.value)
                )}
                onClick={() => handleScoreChange(score.value)}
              >
                {score.label}
              </Button>
            ))}
          </div>
          
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Muito improvável</span>
            <span>Muito provável</span>
          </div>
          
          {selectedScore !== null && (
            <div className="text-center">
              <span className="text-sm font-medium">{getScoreLabel()}</span>
            </div>
          )}
        </div>

        {/* Campo de feedback */}
        {selectedScore !== null && (
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Comentários adicionais (opcional)
            </label>
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Conte-nos mais sobre sua experiência com esta aula..."
              className="min-h-[80px]"
            />
          </div>
        )}

        {/* Botão de envio */}
        {selectedScore !== null && (
          <div className="flex justify-end">
            <Button 
              onClick={handleSubmit}
              disabled={hasSubmitted}
              className="min-w-[120px]"
            >
              {hasSubmitted ? 'Avaliação enviada!' : 'Enviar avaliação'}
            </Button>
          </div>
        )}

        {hasSubmitted && (
          <div className="text-center text-sm text-muted-foreground">
            Obrigado pela sua avaliação! Ela nos ajuda a melhorar o conteúdo.
          </div>
        )}
      </CardContent>
    </Card>
  );
};
