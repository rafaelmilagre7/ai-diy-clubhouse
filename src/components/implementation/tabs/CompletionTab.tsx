import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Trophy, Award, CheckCircle, Star } from "lucide-react";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CompletionTabProps {
  solutionId: string;
  progress: number;
  completedTabs: string[];
  onComplete: () => void;
}

const CompletionTab: React.FC<CompletionTabProps> = ({ 
  solutionId, 
  progress, 
  completedTabs,
  onComplete 
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(0);

  const completeSolutionMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');

      // Mark solution as completed
      const { data: progressData, error: progressError } = await supabase
        .from('progress')
        .upsert({
          user_id: user.id,
          solution_id: solutionId,
          status: 'completed',
          completion_percentage: 100,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,solution_id'
        });

      if (progressError) throw progressError;

      // Create certificate
      const { data: certificateData, error: certificateError } = await supabase
        .from('solution_certificates')
        .insert({
          user_id: user.id,
          solution_id: solutionId,
          issued_at: new Date().toISOString()
        });

      if (certificateError) throw certificateError;

      // Save feedback if provided
      if (feedback.trim() || rating > 0) {
        const { error: feedbackError } = await supabase
          .from('solution_feedback')
          .insert({
            user_id: user.id,
            solution_id: solutionId,
            rating: rating,
            feedback: feedback.trim(),
            created_at: new Date().toISOString()
          });

        if (feedbackError) console.error('Error saving feedback:', feedbackError);
      }

      return { progressData, certificateData };
    },
    onSuccess: () => {
      // Trigger confetti animation
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      toast.success('Parabéns! Solução concluída com sucesso!');
      onComplete();
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['user-progress'] });
      queryClient.invalidateQueries({ queryKey: ['user-certificates'] });
      
      // Navigate to completion page after a delay
      setTimeout(() => {
        navigate(`/implementation/completed/${solutionId}`);
      }, 2000);
    },
    onError: (error) => {
      toast.error('Erro ao concluir solução');
      console.error('Error completing solution:', error);
    }
  });

  const canComplete = progress >= 80 || completedTabs.length >= 4;

  const tabNames = {
    tools: 'Ferramentas',
    resources: 'Arquivos',
    video: 'Vídeo',
    checklist: 'Checklist',
    comments: 'Comentários'
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="relative">
            <Trophy className="w-16 h-16 text-yellow-500" />
            {canComplete && (
              <div className="absolute -top-2 -right-2">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center animate-pulse">
                  <CheckCircle className="w-4 h-4 text-primary-foreground" />
                </div>
              </div>
            )}
          </div>
        </div>
        <h2 className="text-2xl font-bold mb-2">Conclusão da Implementação</h2>
        <p className="text-muted-foreground">
          {canComplete 
            ? "Parabéns! Você está pronto para concluir esta solução."
            : "Complete mais etapas antes de finalizar a implementação."
          }
        </p>
      </div>

      {/* Progress Summary */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-primary" />
          Resumo do Progresso
        </h3>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span>Progresso geral</span>
            <Badge variant={progress >= 80 ? "default" : "secondary"}>
              {Math.round(progress)}%
            </Badge>
          </div>
          
          <div className="w-full bg-muted rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-primary to-primary-glow h-3 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4">
            {Object.entries(tabNames).map(([tabId, tabName]) => {
              const isCompleted = completedTabs.includes(tabId);
              return (
                <div key={tabId} className="flex items-center gap-2">
                  {isCompleted ? (
                    <CheckCircle className="w-4 h-4 text-primary" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-muted-foreground" />
                  )}
                  <span className={cn(
                    "text-sm",
                    isCompleted ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {tabName}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Feedback Section */}
      {canComplete && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Avalie sua experiência (opcional)</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Avaliação da solução
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star 
                      className={cn(
                        "w-6 h-6",
                        star <= rating ? "text-yellow-400 fill-current" : "text-gray-300"
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Comentários sobre a implementação
              </label>
              <Textarea
                placeholder="Compartilhe sua experiência, dificuldades encontradas ou sugestões..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>
        </Card>
      )}

      {/* Completion Button */}
      <div className="text-center">
        <Button
          size="lg"
          onClick={() => completeSolutionMutation.mutate()}
          disabled={!canComplete || completeSolutionMutation.isPending}
          className="px-8 py-3 text-lg"
        >
          {completeSolutionMutation.isPending ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground" />
              Finalizando...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Concluir Implementação
            </div>
          )}
        </Button>
        
        {!canComplete && (
          <p className="text-sm text-muted-foreground mt-2">
            Complete pelo menos 80% das etapas para finalizar
          </p>
        )}
      </div>
    </div>
  );
};

export default CompletionTab;