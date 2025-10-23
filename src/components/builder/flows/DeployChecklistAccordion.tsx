import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Clock, CheckCircle2, ExternalLink, AlertCircle } from 'lucide-react';

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  estimated_time: string;
  order: number;
  validation: string;
  video_url?: string;
  dependencies?: number[];
}

interface DeployChecklistAccordionProps {
  data: {
    items: ChecklistItem[];
    total_time: string;
    difficulty: string;
  };
  solutionId?: string;
}

export const DeployChecklistAccordion = ({ data, solutionId }: DeployChecklistAccordionProps) => {
  const { items, total_time, difficulty } = data;
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());

  // Carregar progresso do localStorage
  useEffect(() => {
    if (solutionId) {
      const savedProgress = localStorage.getItem(`deploy-checklist-${solutionId}`);
      if (savedProgress) {
        setCompletedTasks(new Set(JSON.parse(savedProgress)));
      }
    }
  }, [solutionId]);

  // Salvar progresso no localStorage
  const toggleTask = (taskId: string) => {
    const newCompleted = new Set(completedTasks);
    if (newCompleted.has(taskId)) {
      newCompleted.delete(taskId);
    } else {
      newCompleted.add(taskId);
    }
    setCompletedTasks(newCompleted);

    if (solutionId) {
      localStorage.setItem(
        `deploy-checklist-${solutionId}`,
        JSON.stringify(Array.from(newCompleted))
      );
    }
  };

  const progressPercentage = (completedTasks.size / items.length) * 100;

  const sortedItems = [...items].sort((a, b) => a.order - b.order);

  const isTaskBlocked = (item: ChecklistItem) => {
    if (!item.dependencies || item.dependencies.length === 0) return false;
    
    return item.dependencies.some((depOrder) => {
      const depTask = items.find((t) => t.order === depOrder);
      return depTask && !completedTasks.has(depTask.id);
    });
  };

  return (
    <div className="space-y-6">
      {/* Header com progresso */}
      <div className="space-y-4">
        <div className="flex flex-wrap gap-4 justify-between items-center">
          <div className="space-y-1">
            <h3 className="text-2xl font-bold">Checklist de Deploy</h3>
            <p className="text-muted-foreground">
              {completedTasks.size} de {items.length} tarefas concluídas
            </p>
          </div>
          <div className="flex gap-3">
            <Badge variant="outline" className="px-4 py-2">
              <Clock className="h-4 w-4 mr-2" />
              {total_time}
            </Badge>
            <Badge 
              variant={
                difficulty === 'Fácil' ? 'default' : 
                difficulty === 'Intermediário' ? 'secondary' : 
                'destructive'
              }
              className="px-4 py-2"
            >
              {difficulty}
            </Badge>
          </div>
        </div>

        {/* Barra de progresso */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progresso</span>
            <span className="font-medium">{Math.round(progressPercentage)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
      </div>

      {/* Accordion de tarefas */}
      <Accordion type="multiple" className="space-y-3">
        {sortedItems.map((item) => {
          const isCompleted = completedTasks.has(item.id);
          const isBlocked = isTaskBlocked(item);

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: item.order * 0.05 }}
            >
              <AccordionItem 
                value={item.id}
                className={`border rounded-lg ${
                  isCompleted 
                    ? 'bg-green-500/5 border-green-500/30' 
                    : isBlocked 
                    ? 'bg-muted/50 border-muted' 
                    : 'border-border'
                }`}
                disabled={isBlocked}
              >
                <AccordionTrigger className="px-4 hover:no-underline">
                  <div className="flex items-center gap-3 w-full">
                    <Checkbox
                      checked={isCompleted}
                      onCheckedChange={() => toggleTask(item.id)}
                      disabled={isBlocked}
                      onClick={(e) => e.stopPropagation()}
                    />

                    <div className="flex-1 flex items-center gap-3 text-left">
                      <Badge variant="outline" className="flex-shrink-0">
                        {item.order}
                      </Badge>
                      
                      <span className={`font-semibold ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                        {item.title}
                      </span>

                      <Badge variant="secondary" className="ml-auto flex-shrink-0">
                        <Clock className="h-3 w-3 mr-1" />
                        {item.estimated_time}
                      </Badge>
                    </div>

                    {isCompleted && (
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                    )}
                    {isBlocked && (
                      <AlertCircle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    )}
                  </div>
                </AccordionTrigger>

                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-4 pt-2">
                    {/* Descrição */}
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Passos:</p>
                      <p className="text-sm leading-relaxed whitespace-pre-line border-l-2 border-primary pl-4">
                        {item.description}
                      </p>
                    </div>

                    {/* Critério de validação */}
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        Como validar:
                      </p>
                      <p className="text-sm text-muted-foreground italic">
                        {item.validation}
                      </p>
                    </div>

                    {/* Vídeo tutorial */}
                    {item.video_url && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        asChild
                      >
                        <a 
                          href={item.video_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Ver vídeo tutorial
                        </a>
                      </Button>
                    )}

                    {/* Dependências bloqueadas */}
                    {isBlocked && item.dependencies && (
                      <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                        <p className="text-sm text-yellow-700 dark:text-yellow-400">
                          ⚠️ Complete as tarefas {item.dependencies.join(', ')} primeiro
                        </p>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </motion.div>
          );
        })}
      </Accordion>

      {/* Resumo final */}
      {progressPercentage === 100 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-6 bg-green-500/10 border border-green-500/30 rounded-lg text-center space-y-2"
        >
          <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto" />
          <h4 className="text-xl font-bold">Parabéns! 🎉</h4>
          <p className="text-muted-foreground">
            Você completou todas as tarefas do checklist de deploy!
          </p>
        </motion.div>
      )}
    </div>
  );
};
