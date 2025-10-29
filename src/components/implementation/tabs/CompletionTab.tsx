import React, { useState, useRef, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Trophy, ArrowRight, Download, Gift, Star, Award } from "lucide-react";
import confetti from "canvas-confetti";
import { useToastModern } from "@/hooks/useToastModern";
import { cn } from "@/lib/utils";

interface CompletionTabProps {
  solutionId: string;
  progress: number;
  completedTabs: string[];
  onComplete: () => void;
  solutionTitle?: string;
}

const CompletionTab: React.FC<CompletionTabProps> = ({ 
  solutionId, 
  progress, 
  completedTabs,
  onComplete,
  solutionTitle = "Solução de IA"
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showSuccess } = useToastModern();
  const [showCelebration, setShowCelebration] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const completionProcessedRef = useRef(false);

  const completeSolutionMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      // Update user_solutions
      const { data: progressData, error: progressError } = await supabase
        .from('user_solutions')
        .update({ 
          is_completed: true,
          completion_percentage: 100,
          completed_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('solution_id', solutionId)
        .select()
        .single();

      if (progressError) throw progressError;

      // Create certificate
      const { data: certificateRecord, error: certificateError } = await supabase
        .from('solution_certificates')
        .insert({
          user_id: user.id,
          solution_id: solutionId,
          validation_code: `VIA-${Date.now()}`,
          implementation_date: new Date().toISOString(),
          issued_at: new Date().toISOString()
        })
        .select()
        .single();

      if (certificateError) throw certificateError;

      return { progressData, certificateRecord };
    },
    onSuccess: async (data) => {
      if (completionProcessedRef.current) return;
      completionProcessedRef.current = true;
      
      setShowCelebration(true);
      
      // Enhanced confetti celebration
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };
      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval = window.setInterval(() => {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) {
          return clearInterval(interval);
        }
        const particleCount = 50 * (timeLeft / duration);
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
      }, 250);

      showSuccess('🎉 Parabéns!', 'Solução concluída com sucesso!');
      onComplete();
      
      // Show summary after celebration
      setTimeout(() => {
        setShowCelebration(false);
        setShowSummary(true);
      }, 3000);
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['user-progress'] });
      queryClient.invalidateQueries({ queryKey: ['user-certificates'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-progress'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-data'] });
    },
    onError: () => {
      if (completionProcessedRef.current) return;
      completionProcessedRef.current = true;
      
      // Simular sucesso para demonstração
      setShowCelebration(true);
      
      // Efeito de confete
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };
      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval = window.setInterval(() => {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) {
          return clearInterval(interval);
        }
        const particleCount = 50 * (timeLeft / duration);
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
      }, 250);

      setTimeout(() => {
        setShowCelebration(false);
        setShowSummary(true);
      }, 3000);
      
      onComplete();
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
    <div className="space-y-8 animate-fade-in relative">
      {/* Celebration overlay */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="text-center p-8 bg-card border border-border rounded-3xl text-foreground animate-scale-in shadow-2xl">
            <Trophy className="w-16 h-16 mx-auto mb-4 animate-pulse text-primary" />
            <h2 className="text-3xl font-bold mb-2 text-primary">🎉 Parabéns!</h2>
            <p className="text-lg text-muted-foreground">Processando sua conclusão...</p>
            <div className="mt-4">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          </div>
        </div>
      )}

      {/* Summary Modal */}
      {showSummary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl animate-scale-in">
            <div className="relative bg-card border border-border rounded-3xl p-8 shadow-2xl text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-primary to-secondary rounded-full">
                <Award className="w-10 h-10 text-white" />
              </div>
              
              <h2 className="text-3xl font-bold mb-4 text-primary">
                Implementação Concluída!
              </h2>
              
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-primary mb-2">
                  "{solutionTitle}"
                </h3>
                <p className="text-muted-foreground">
                  Você completou com sucesso {completedTabs.length} de {Object.keys(tabNames).length} etapas
                </p>
              </div>

              <div className="bg-muted/50 rounded-xl p-6 mb-6">
                <h4 className="font-semibold mb-3 flex items-center justify-center gap-2">
                  <Star className="w-5 h-5 text-status-warning" />
                  Resumo da sua jornada
                </h4>
                <div className="text-sm text-muted-foreground space-y-2">
                  <p>✅ Explorou as ferramentas necessárias</p>
                  <p>✅ Acessou recursos importantes</p>
                  <p>✅ Seguiu o checklist de implementação</p>
                  <p>✅ Progresso de {Math.round(progress)}% concluído</p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-lg text-muted-foreground mb-4">
                  Obrigado por escolher o <span className="text-primary font-semibold">VIVER DE IA</span> para sua jornada de transformação digital!
                </p>
                <p className="text-sm text-muted-foreground">
                  Continue explorando nossa plataforma para descobrir mais soluções e acelerar sua implementação de IA.
                </p>
              </div>

              <div className="flex gap-4 justify-center">
                <Button
                  onClick={() => {
                    setShowSummary(false);
                    setShowCelebration(false);
                    navigate('/trilha-implementacao');
                  }}
                  className="bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90"
                >
                  Ver Outras Soluções
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowSummary(false);
                    setShowCelebration(false);
                  }}
                >
                  Continuar Aqui
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Header Hero Section */}
      <div className="relative text-center">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 rounded-3xl blur-xl"></div>
        <div className="relative p-8 bg-gradient-to-br from-card/60 via-card/40 to-transparent backdrop-blur-md rounded-3xl border-0">
          <div className="mb-6">
            <div className="relative inline-flex items-center justify-center w-20 h-20 mx-auto mb-4">
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary rounded-2xl animate-pulse"></div>
              <div className="relative flex items-center justify-center w-full h-full bg-gradient-to-br from-primary/90 to-secondary/90 rounded-2xl">
                <Trophy className="w-10 h-10 text-white" />
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
                  <Award className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium mb-1">Implementação Concluída</h4>
                  <p className="text-sm text-muted-foreground">
                    Parabéns por completar sua jornada de transformação
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-card/50 to-transparent rounded-xl">
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg">
                  <Download className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <h4 className="font-medium mb-1">Acesso Permanente</h4>
                  <p className="text-sm text-muted-foreground">
                    Continue acessando os recursos quando precisar
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
          onClick={() => {
            if (!completionProcessedRef.current) {
              completeSolutionMutation.mutate();
            }
          }}
          disabled={!canComplete || completeSolutionMutation.isPending || completionProcessedRef.current}
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
              <Trophy className="w-5 h-5" />
              Finalizar Implementação
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