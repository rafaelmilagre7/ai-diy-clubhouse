import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Share2, Download, Save } from 'lucide-react';
import { toast } from 'sonner';
import { LiquidGlassCard } from '@/components/ui/LiquidGlassCard';
import { FrameworkQuadrants } from './FrameworkQuadrants';
import { RequiredToolsGrid } from './RequiredToolsGrid';
import { ImplementationChecklist } from './ImplementationChecklist';
import { ArchitectureFlowchart } from './ArchitectureFlowchart';

interface SolutionResultProps {
  solution: any;
  onNewIdea: () => void;
  onSave: (solution: any) => Promise<any>;
  onDiscard: () => void;
}

export const SolutionResult: React.FC<SolutionResultProps> = ({ 
  solution, 
  onNewIdea, 
  onSave, 
  onDiscard 
}) => {
  const navigate = useNavigate();
  
  const handleSaveAndRedirect = async () => {
    try {
      const savedSolution = await onSave(solution);
      
      // Se salvou com sucesso E tem ID, redirecionar
      if (savedSolution?.id) {
        navigate(`/ferramentas/builder/solution/${savedSolution.id}`);
      } else if (solution?.id) {
        // Fallback: se solution já tem id (veio da edge function), usar ele
        navigate(`/ferramentas/builder/solution/${solution.id}`);
      } else {
        toast.error('Não foi possível redirecionar para a solução');
      }
    } catch (error) {
      console.error('[BUILDER] Erro ao salvar e redirecionar:', error);
      toast.error('Erro ao processar solução');
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header com Descrição */}
      <LiquidGlassCard className="p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1 space-y-2">
            <h2 className="text-2xl font-bold">Solução Gerada</h2>
            {solution.short_description && (
              <p className="text-foreground/80 leading-relaxed">
                {solution.short_description}
              </p>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button variant="outline" size="icon">
              <Star className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Share2 className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Ideia Original - sem badge */}
        <div className="pt-4 border-t border-border/30">
          <p className="text-sm text-muted-foreground mb-1">Ideia original:</p>
          <p className="text-sm text-foreground/70 italic">"{solution.original_idea}"</p>
        </div>
      </LiquidGlassCard>

      {/* Framework Visual - Destaque Principal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <LiquidGlassCard className="p-6 bg-gradient-to-br from-primary/5 via-background to-background">
          <div className="mb-4">
            <h3 className="text-xl font-bold mb-2">Framework de Implementação</h3>
            <p className="text-sm text-muted-foreground">
              Os 4 pilares essenciais da sua solução com IA
            </p>
          </div>
          <FrameworkQuadrants framework={solution.framework_mapping} />
        </LiquidGlassCard>
      </motion.div>

      {/* Arquitetura Visual (Fluxograma) - 3º Bloco */}
      {solution.architecture_flowchart && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <LiquidGlassCard className="p-6">
            <div className="mb-4">
              <h3 className="text-xl font-bold mb-2">Arquitetura da Solução</h3>
              <p className="text-sm text-muted-foreground">
                Fluxograma técnico completo da solução de ponta a ponta
              </p>
            </div>
            <ArchitectureFlowchart flowchart={solution.architecture_flowchart} />
          </LiquidGlassCard>
        </motion.div>
      )}

      {/* Ferramentas Necessárias - 4º Bloco */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <LiquidGlassCard className="p-6">
          <div className="mb-4">
            <h3 className="text-xl font-bold mb-2">Ferramentas Necessárias</h3>
            <p className="text-sm text-muted-foreground">
              Recursos essenciais e opcionais para implementação
            </p>
          </div>
          <RequiredToolsGrid tools={solution.required_tools} />
        </LiquidGlassCard>
      </motion.div>

      {/* Checklist de Implementação */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <LiquidGlassCard className="p-6">
          <div className="mb-4">
            <h3 className="text-xl font-bold mb-2">Checklist de Implementação</h3>
            <p className="text-sm text-muted-foreground">
              Passos práticos para transformar sua ideia em realidade
            </p>
          </div>
          <ImplementationChecklist 
            checklist={solution.implementation_checklist}
            solutionId={solution.id}
          />
        </LiquidGlassCard>
      </motion.div>

      {/* Footer Actions com CTAs Save/Discard */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="space-y-4"
      >
      {/* CTAs Footer */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <Button 
          onClick={onDiscard} 
          variant="outline" 
          size="lg"
          className="min-w-[200px]"
        >
          Descartar e Voltar
        </Button>
        
        <Button 
          onClick={handleSaveAndRedirect} 
          size="lg"
          className="bg-gradient-to-r from-aurora-primary to-aurora-primary-light hover:opacity-90 transition-opacity min-w-[200px] flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          Salvar no Histórico
        </Button>
      </div>

      <p className="text-xs text-center text-muted-foreground/70 mt-3">
        Esta solução consumiu 1 crédito Builder e foi salva no seu histórico.
      </p>
      </motion.div>
    </motion.div>
  );
};
