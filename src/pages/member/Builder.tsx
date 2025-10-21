import React, { useState } from 'react';
import { useAISolutionAccess } from '@/hooks/builder/useAISolutionAccess';
import { useAISolutionGenerator } from '@/hooks/builder/useAISolutionGenerator';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Brain, Send, History, Zap, Lightbulb } from 'lucide-react';
import { AISolutionLoader } from '@/components/builder/AISolutionLoader';
import { SolutionResult } from '@/components/builder/SolutionResult';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

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
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-card border border-border rounded-2xl p-8 text-center shadow-lg">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-destructive/10 flex items-center justify-center">
            <Brain className="h-8 w-8 text-destructive" />
          </div>
          <h2 className="text-2xl font-bold mb-3">Acesso Negado</h2>
          <p className="text-muted-foreground mb-6">
            Você não tem permissão para acessar o Builder.
          </p>
          <Button asChild className="w-full">
            <Link to="/dashboard">Voltar ao Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto">
        {/* Header Fixo */}
        <header className="sticky top-0 z-10 backdrop-blur-xl bg-background/80 border-b border-border">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg">
                <Brain className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Builder IA</h1>
                <p className="text-xs text-muted-foreground">
                  {generationsUsed} de {monthlyLimit} gerações • {remaining} restantes
                </p>
              </div>
            </div>
            
            <Button variant="ghost" size="sm" asChild>
              <Link to="/minhas-solucoes" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                <span className="hidden sm:inline">Histórico</span>
              </Link>
            </Button>
          </div>
        </header>

        {/* Conteúdo Principal */}
        <main className="p-6 pb-32">
          <AnimatePresence mode="wait">
            {/* Loading State */}
            {isGenerating && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <AISolutionLoader />
              </motion.div>
            )}

            {/* Result State */}
            {!isGenerating && solution && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <SolutionResult 
                  solution={solution} 
                  onNewIdea={() => {
                    setSolution(null);
                    setIdea('');
                  }} 
                />
              </motion.div>
            )}

            {/* Empty State - Sugestões */}
            {!isGenerating && !solution && idea.length === 0 && (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Hero Section */}
                <div className="text-center py-12 space-y-4">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
                    <Zap className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Powered by Gemini 2.5 Pro</span>
                  </div>
                  
                  <h2 className="text-3xl md:text-4xl font-bold">
                    Transforme ideias em{' '}
                    <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                      planos executáveis
                    </span>
                  </h2>
                  
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Descreva sua ideia e receba um framework completo com ferramentas, 
                    roadmap e checklist de implementação
                  </p>
                </div>

                {/* Exemplos */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Lightbulb className="h-4 w-4" />
                    <span>Exemplos para você começar</span>
                  </div>
                  
                  <div className="grid gap-3">
                    {exampleIdeas.map((example, index) => (
                      <button
                        key={index}
                        onClick={() => handleExampleClick(example)}
                        className="group p-4 text-left rounded-xl border border-border bg-card hover:bg-accent hover:border-primary/30 transition-all"
                      >
                        <p className="text-sm text-foreground/90 group-hover:text-foreground">
                          {example}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Showing Input - Com texto digitado */}
            {!isGenerating && !solution && idea.length > 0 && (
              <motion.div
                key="input-preview"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <div className="p-6 rounded-2xl bg-accent/50 border border-border">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-semibold text-primary-foreground">Você</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-foreground whitespace-pre-wrap">{idea}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Input Fixo no Bottom */}
        <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-background/95 backdrop-blur-xl">
          <div className="max-w-4xl mx-auto p-4">
            <div className="flex flex-col gap-3">
              {/* Textarea */}
              <div className={cn(
                "relative rounded-2xl border transition-all",
                idea.length > 0 ? "border-primary shadow-lg shadow-primary/5" : "border-border"
              )}>
                <Textarea
                  value={idea}
                  onChange={(e) => setIdea(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey && idea.length >= 30) {
                      e.preventDefault();
                      handleGenerate();
                    }
                  }}
                  placeholder="Descreva sua ideia de negócio ou projeto aqui... (mínimo 30 caracteres)"
                  className="min-h-[80px] max-h-[200px] resize-none border-0 focus-visible:ring-0 bg-transparent px-4 py-3 text-base"
                  disabled={!canGenerate}
                />
                
                {/* Character Count */}
                <div className="absolute bottom-2 left-4 text-xs text-muted-foreground">
                  {idea.length}/1000
                </div>

                {/* Send Button */}
                <div className="absolute bottom-2 right-2">
                  <Button
                    onClick={handleGenerate}
                    disabled={idea.length < 30 || idea.length > 1000 || !canGenerate}
                    size="sm"
                    className={cn(
                      "rounded-xl transition-all",
                      idea.length >= 30 && idea.length <= 1000 && canGenerate
                        ? "bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                        : "bg-muted"
                    )}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Status Messages */}
              {!canGenerate && (
                <p className="text-xs text-center text-destructive">
                  Limite mensal atingido. Aguarde até o próximo mês.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Builder;
