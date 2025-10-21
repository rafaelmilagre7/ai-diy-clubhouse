import React from 'react';
import { LiquidGlassCard } from '@/components/ui/LiquidGlassCard';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, 
  Download, 
  Share2, 
  Star,
  ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { FrameworkQuadrants } from './FrameworkQuadrants';
import { RequiredToolsGrid } from './RequiredToolsGrid';
import { ImplementationChecklist } from './ImplementationChecklist';
import { MindMapVisualization } from './MindMapVisualization';

interface SolutionResultProps {
  solution: any;
  onNewIdea: () => void;
}

export const SolutionResult: React.FC<SolutionResultProps> = ({ solution, onNewIdea }) => {
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

        {/* Ideia Original */}
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

      {/* Ferramentas Necessárias */}
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

      {/* Mapa Mental - Colapsável */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <LiquidGlassCard className="p-6">
          <div className="mb-4">
            <h3 className="text-xl font-bold mb-2">Mapa Mental</h3>
            <p className="text-sm text-muted-foreground">
              Visualização hierárquica do processo de implementação
            </p>
          </div>
          <MindMapVisualization mindMap={solution.mind_map} />
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

      {/* Footer Actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex flex-col sm:flex-row gap-4 justify-center"
      >
        <Button onClick={onNewIdea} variant="outline" size="lg">
          <Sparkles className="mr-2 h-4 w-4" />
          Gerar Nova Solução
        </Button>
        <Button size="lg">
          Começar Implementação
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </motion.div>
    </motion.div>
  );
};
