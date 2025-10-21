import React, { useState } from 'react';
import { useAISolutionAccess } from '@/hooks/builder/useAISolutionAccess';
import { useAISolutionGenerator } from '@/hooks/builder/useAISolutionGenerator';
import { LiquidGlassCard } from '@/components/ui/LiquidGlassCard';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, ArrowRight, History } from 'lucide-react';
import { AISolutionLoader } from '@/components/builder/AISolutionLoader';
import { SolutionResult } from '@/components/builder/SolutionResult';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Builder = () => {
  const [idea, setIdea] = useState('');
  const [solution, setSolution] = useState<any>(null);
  
  const { 
    hasAccess, 
    canGenerate, 
    generationsUsed, 
    monthlyLimit, 
    remaining,
    isLoading: accessLoading 
  } = useAISolutionAccess();
  
  const { generateSolution, isGenerating } = useAISolutionGenerator();

  const handleGenerate = async () => {
    if (!idea.trim()) return;
    
    const result = await generateSolution(idea);
    if (result) {
      setSolution(result);
    }
  };

  const handleExampleClick = (exampleIdea: string) => {
    setIdea(exampleIdea);
  };

  const exampleIdeas = [
    'Criar um chatbot de atendimento ao cliente no WhatsApp usando IA',
    'Sistema de análise de sentimentos em reviews de produtos',
    'Gerador automático de conteúdo para redes sociais com IA',
    'Dashboard com métricas de negócio alimentado por IA'
  ];

  if (accessLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <LiquidGlassCard className="max-w-md p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Acesso Negado</h2>
          <p className="text-muted-foreground mb-6">
            Você não tem permissão para acessar o Builder.
          </p>
          <Button asChild>
            <Link to="/dashboard">Voltar ao Dashboard</Link>
          </Button>
        </LiquidGlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background/90 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Powered by IA</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
            Builder
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Transforme sua ideia em um plano completo de implementação com IA
          </p>

          {/* Usage Badge */}
          <div className="flex items-center justify-center gap-2 text-sm">
            <span className="text-muted-foreground">
              {generationsUsed} de {monthlyLimit} usos este mês
            </span>
            {remaining > 0 ? (
              <span className="px-2 py-1 rounded-full bg-success/10 text-success text-xs font-medium">
                {remaining} restantes
              </span>
            ) : (
              <span className="px-2 py-1 rounded-full bg-status-error/10 text-status-error text-xs font-medium">
                Limite atingido
              </span>
            )}
          </div>
        </motion.div>

        {/* Loading State */}
        {isGenerating && <AISolutionLoader />}

        {/* Result State */}
        {!isGenerating && solution && (
          <SolutionResult solution={solution} onNewIdea={() => {
            setSolution(null);
            setIdea('');
          }} />
        )}

        {/* Input State */}
        {!isGenerating && !solution && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <LiquidGlassCard className="p-6 md:p-8 space-y-6">
              {/* Input Area */}
              <div className="space-y-4">
                <label className="text-sm font-medium text-foreground/90">
                  Descreva sua ideia
                </label>
                <Textarea
                  value={idea}
                  onChange={(e) => setIdea(e.target.value)}
                  placeholder="Ex: Quero criar um chatbot para WhatsApp que responde perguntas dos meus clientes usando IA..."
                  className="min-h-[150px] resize-none text-base"
                  disabled={!canGenerate}
                />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{idea.length}/1000 caracteres</span>
                  <span>Mínimo: 30 caracteres</span>
                </div>
              </div>

              {/* Generate Button */}
              <Button
                onClick={handleGenerate}
                disabled={idea.length < 30 || idea.length > 1000 || !canGenerate}
                className="w-full h-12 text-base font-medium group"
                size="lg"
              >
                <Sparkles className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
                Gerar Solução
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>

              {!canGenerate && (
                <p className="text-sm text-status-warning text-center">
                  Você atingiu o limite mensal de gerações. Aguarde até o próximo mês.
                </p>
              )}
            </LiquidGlassCard>

            {/* Example Ideas */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              <h3 className="text-sm font-medium text-muted-foreground text-center">
                Exemplos de ideias
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {exampleIdeas.map((example, index) => (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    onClick={() => handleExampleClick(example)}
                    className="p-4 text-left rounded-lg border border-border/50 bg-muted/30 hover:bg-muted/50 hover:border-primary/30 transition-all group"
                  >
                    <p className="text-sm text-foreground/80 group-hover:text-foreground transition-colors">
                      {example}
                    </p>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* History Link */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-center"
            >
              <Button variant="ghost" asChild>
                <Link to="/minhas-solucoes" className="inline-flex items-center gap-2">
                  <History className="h-4 w-4" />
                  Ver minhas soluções anteriores
                </Link>
              </Button>
            </motion.div>

            {/* Info Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="pt-6 border-t border-border/30"
            >
              <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  <span>Tempo médio: ~30 segundos</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>Powered by Gemini 2.5 Pro</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Builder;
