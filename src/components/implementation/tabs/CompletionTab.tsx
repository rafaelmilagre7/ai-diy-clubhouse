import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Sparkles, ArrowRight, Download, Gift } from "lucide-react";
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
    <div className="space-y-8 animate-fade-in">
      {/* Header Hero Section */}
      <div className="relative text-center">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 rounded-3xl blur-xl"></div>
        <div className="relative p-8 bg-gradient-to-br from-card/60 via-card/40 to-transparent backdrop-blur-md rounded-3xl border-0">
          <div className="mb-6">
            <div className="relative inline-flex items-center justify-center w-20 h-20 mx-auto mb-4">
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary rounded-2xl animate-pulse"></div>
              <div className="relative flex items-center justify-center w-full h-full bg-gradient-to-br from-primary/90 to-secondary/90 rounded-2xl">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold mb-3 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {canComplete ? "Implementação Concluída!" : "Quase Lá!"}
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {canComplete 
              ? "Parabéns! Você completou todas as etapas necessárias. Agora é só finalizar e receber seu certificado."
              : "Complete mais algumas etapas para finalizar sua implementação e receber seu certificado."
            }
          </p>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="relative bg-gradient-to-br from-card/40 via-card/20 to-transparent backdrop-blur-md rounded-2xl p-6 border-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/3 to-transparent rounded-2xl"></div>
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Seu Progresso</h2>
            <Badge 
              variant={progress >= 80 ? "default" : "secondary"}
              className={cn(
                "text-lg px-4 py-2",
                progress >= 80 && "bg-gradient-to-r from-primary to-secondary"
              )}
            >
              {Math.round(progress)}%
            </Badge>
          </div>
          
          <div className="relative w-full h-4 bg-gradient-to-r from-muted/50 to-muted/30 rounded-full overflow-hidden mb-6">
            <div 
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary via-primary to-secondary rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(tabNames).map(([tabId, tabName]) => {
              const isCompleted = completedTabs.includes(tabId);
              return (
                <div 
                  key={tabId} 
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl transition-all duration-200",
                    isCompleted 
                      ? "bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20" 
                      : "bg-muted/30"
                  )}
                >
                  <div className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-lg",
                    isCompleted 
                      ? "bg-gradient-to-br from-primary to-secondary" 
                      : "bg-muted border-2 border-muted-foreground/30"
                  )}>
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5 text-white" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-muted-foreground/50" />
                    )}
                  </div>
                  <span className={cn(
                    "font-medium",
                    isCompleted ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {tabName}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      {canComplete && (
        <div className="relative bg-gradient-to-br from-secondary/10 via-secondary/5 to-transparent backdrop-blur-sm rounded-2xl p-6 border-0">
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent rounded-2xl"></div>
          <div className="relative">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Gift className="w-5 h-5 text-secondary" />
              O que você vai receber
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-card/50 to-transparent rounded-xl">
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium mb-1">Certificado de Conclusão</h4>
                  <p className="text-sm text-muted-foreground">
                    Certificado digital válido comprovando sua implementação
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-card/50 to-transparent rounded-xl">
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg">
                  <Download className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <h4 className="font-medium mb-1">Recursos Completos</h4>
                  <p className="text-sm text-muted-foreground">
                    Acesso permanente a todos os materiais e atualizações
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Completion Action */}
      <div className="text-center">
        <Button
          size="lg"
          onClick={() => completeSolutionMutation.mutate()}
          disabled={!canComplete || completeSolutionMutation.isPending}
          className={cn(
            "px-8 py-4 text-lg font-semibold rounded-2xl transition-all duration-300",
            canComplete 
              ? "bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-lg hover:shadow-xl transform hover:scale-105" 
              : "opacity-50 cursor-not-allowed"
          )}
        >
          {completeSolutionMutation.isPending ? (
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
              Finalizando implementação...
            </div>
          ) : canComplete ? (
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5" />
              Finalizar e Receber Certificado
              <ArrowRight className="w-5 h-5" />
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5" />
              Complete mais etapas
            </div>
          )}
        </Button>
        
        {!canComplete && (
          <p className="text-sm text-muted-foreground mt-3">
            Complete pelo menos {Math.ceil((5 * 0.8) - completedTabs.length)} etapa(s) adicionais para finalizar
          </p>
        )}
      </div>
    </div>
  );
};

export default CompletionTab;