import React, { useState, useEffect } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';

interface ChecklistItem {
  step_number: number;
  title: string;
  description: string;
  estimated_time: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface ImplementationChecklistProps {
  checklist: ChecklistItem[];
  solutionId: string;
}

export const ImplementationChecklist: React.FC<ImplementationChecklistProps> = ({ 
  checklist,
  solutionId 
}) => {
  const { user } = useAuth();
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  // Carregar progresso salvo ao montar
  useEffect(() => {
    const loadProgress = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('implementation_progress')
          .select('completed_steps')
          .eq('user_id', user.id)
          .eq('solution_id', solutionId)
          .maybeSingle();

        if (error) throw error;

        if (data?.completed_steps) {
          setCompletedSteps(new Set(data.completed_steps));
        }
      } catch (error) {
        console.error('Erro ao carregar progresso:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProgress();
  }, [user, solutionId]);

  const handleToggle = async (stepNumber: number) => {
    if (!user) return;

    setCompletedSteps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stepNumber)) {
        newSet.delete(stepNumber);
      } else {
        newSet.add(stepNumber);
      }
      
      // Salvar progresso no banco
      const saveProgress = async () => {
        try {
          const { error } = await supabase
            .from('implementation_progress')
            .upsert({
              user_id: user.id,
              solution_id: solutionId,
              completed_steps: Array.from(newSet),
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'user_id,solution_id'
            });

          if (error) throw error;
        } catch (error) {
          console.error('Erro ao salvar progresso:', error);
          toast.error('Erro ao salvar progresso');
        }
      };

      saveProgress();
      return newSet;
    });
  };

  const getDifficultyInfo = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return { label: 'Fácil', color: 'bg-success/10 text-success border-success/20' };
      case 'hard':
        return { label: 'Difícil', color: 'bg-status-error/10 text-status-error border-status-error/20' };
      default:
        return { label: 'Médio', color: 'bg-status-warning/10 text-status-warning border-status-warning/20' };
    }
  };

  const completionPercentage = checklist.length > 0 
    ? Math.round((completedSteps.size / checklist.length) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-success" />
            <span className="font-semibold">Progresso</span>
          </div>
          <span className="text-sm text-muted-foreground">
            {completedSteps.size} de {checklist.length} passos
          </span>
        </div>
        <Progress value={completionPercentage} className="h-2" />
      </div>

      {/* Checklist Items */}
      <div className="space-y-3">
        {checklist.map((item, index) => {
          const difficultyInfo = getDifficultyInfo(item.difficulty);
          const isCompleted = completedSteps.has(item.step_number);

          return (
            <motion.div
              key={item.step_number}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`
                p-4 rounded-lg border transition-all
                ${isCompleted 
                  ? 'bg-success/5 border-success/30' 
                  : 'bg-muted/30 border-border/50 hover:border-primary/30'
                }
              `}
            >
              <div className="flex gap-4">
                {/* Checkbox */}
                <div className="flex-shrink-0 pt-1">
                  <Checkbox
                    checked={isCompleted}
                    onCheckedChange={() => handleToggle(item.step_number)}
                    className="h-5 w-5"
                  />
                </div>

                {/* Content */}
                <div className="flex-1 space-y-2">
                  {/* Title and Step Number */}
                  <div className="flex items-start justify-between gap-2">
                    <h4 className={`font-semibold ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                      <span className="text-primary mr-2">#{item.step_number}</span>
                      {item.title}
                    </h4>
                  </div>

                  {/* Description */}
                  <p className={`text-sm leading-relaxed ${isCompleted ? 'text-muted-foreground' : 'text-foreground/80'}`}>
                    {item.description}
                  </p>

                  {/* Meta Info */}
                  <div className="flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{item.estimated_time}</span>
                    </div>
                    <Badge 
                      variant="secondary" 
                      className={`${difficultyInfo.color} border`}
                    >
                      {difficultyInfo.label}
                    </Badge>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Completion Message */}
      {completionPercentage === 100 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 rounded-lg bg-success/10 border border-success/30 text-center"
        >
          <CheckCircle2 className="h-8 w-8 text-success mx-auto mb-2" />
          <p className="font-semibold text-success">Parabéns! Todos os passos foram concluídos! 🎉</p>
          <p className="text-sm text-muted-foreground mt-1">
            Você está pronto para colocar sua solução em prática
          </p>
        </motion.div>
      )}
    </div>
  );
};
