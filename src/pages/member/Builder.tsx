import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/auth';
import { useMiracleAI } from '@/hooks/builder/useMiracleAI';
import { QuestionWizard } from '@/components/builder/QuestionWizard';
import { MiracleLoadingExperience } from '@/components/builder/MiracleLoadingExperience';
import { SolutionResult } from '@/components/builder/SolutionResult';
import { AIInputWithLoading } from '@/components/ui/AIInputWithLoading';
import { useAISolutionAccess } from '@/hooks/builder/useAISolutionAccess';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const exampleIdeas = [
  {
    title: "Chatbot de Atendimento",
    description: "Chatbot no WhatsApp que usa IA para responder dúvidas sobre produtos",
    icon: "💬"
  },
  {
    title: "Sistema de Agendamento",
    description: "Sistema automático que integra Google Calendar com notificações personalizadas",
    icon: "📅"
  }
];

export default function Builder() {
  const { profile } = useAuth();
  const { analyzeIdea, generateSolution, isAnalyzing, isGenerating, questions } = useMiracleAI();
  const [solution, setSolution] = useState<any>(null);
  const [currentIdea, setCurrentIdea] = useState<string>('');
  const [showWizard, setShowWizard] = useState(false);
  const { 
    hasAccess, 
    generationsUsed, 
    monthlyLimit, 
    isLoading: accessLoading 
  } = useAISolutionAccess();
  const navigate = useNavigate();

  const handleGenerateSolution = async (idea: string) => {
    if (!hasAccess) {
      toast.error('Você não tem acesso ao Miracle AI');
      navigate('/ferramentas');
      return;
    }

    if (!idea.trim()) {
      toast.error('Por favor, descreva sua ideia');
      return;
    }

    // Salvar ideia e iniciar análise
    setCurrentIdea(idea);
    const generatedQuestions = await analyzeIdea(idea);
    
    if (generatedQuestions && generatedQuestions.length > 0) {
      setShowWizard(true);
    }
  };

  const handleWizardComplete = async (answers: Array<{ question: string; answer: string }>) => {
    setShowWizard(false);
    const result = await generateSolution(currentIdea, answers);
    if (result) {
      setSolution(result);
    }
  };

  const handleWizardCancel = () => {
    setShowWizard(false);
    setCurrentIdea('');
  };

  const handleNewIdea = () => {
    setSolution(null);
  };

  const handleExampleClick = (example: typeof exampleIdeas[0]) => {
    handleGenerateSolution(example.description);
  };

  if (accessLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">Você não tem acesso ao Builder</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-surface-elevated/20">
      <AnimatePresence mode="wait">
        {isGenerating ? (
          <MiracleLoadingExperience key="loader" />
        ) : showWizard && questions ? (
          <QuestionWizard
            key="wizard"
            questions={questions}
            onComplete={handleWizardComplete}
            onCancel={handleWizardCancel}
          />
        ) : solution ? (
          <motion.div
            key="result"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="container mx-auto px-4 py-8"
          >
            <SolutionResult solution={solution} onNewIdea={handleNewIdea} />
          </motion.div>
        ) : (
          <motion.div
            key="input"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center min-h-screen px-4 py-8"
          >
            {/* Header com contador discreto */}
            <div className="absolute top-4 right-4">
              <div className="text-xs text-muted-foreground bg-surface-elevated/50 backdrop-blur-sm px-3 py-1.5 rounded-full border border-border/50">
                {generationsUsed} de {monthlyLimit === 999999 ? '∞' : monthlyLimit} gerações
              </div>
            </div>

            {/* Logo/Título centralizado */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-center mb-12"
            >
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-aurora-primary/20 to-aurora-primary/5 border border-aurora-primary/20">
                  <Layout className="h-8 w-8 text-aurora-primary" />
                </div>
              </div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  Miracle AI
                </h1>
                <Sparkles className="h-6 w-6 text-aurora-primary animate-pulse" />
              </div>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Pense como o Rafael Milagre e transforme suas ideias em soluções inteligentes
              </p>
            </motion.div>

            {/* Input centralizado */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="w-full max-w-2xl mb-12"
            >
              <AIInputWithLoading
                placeholder="Ex: Quero automatizar atendimento no WhatsApp e integrar com meu CRM..."
                onSubmit={handleGenerateSolution}
                disabled={isGenerating || isAnalyzing}
                minHeight={56}
                maxHeight={200}
              />
            </motion.div>

            {/* Exemplos */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="w-full max-w-2xl"
            >
              <p className="text-sm text-muted-foreground text-center mb-4">
                Ou escolha um exemplo:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {exampleIdeas.map((example, index) => (
                  <motion.button
                    key={index}
                    onClick={() => handleExampleClick(example)}
                    className="group relative p-4 rounded-2xl bg-surface-elevated/50 border border-border/50 hover:border-primary/30 transition-all duration-200 text-left overflow-hidden"
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    <div className="relative">
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-2xl">{example.icon}</span>
                        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors opacity-0 group-hover:opacity-100" />
                      </div>
                      <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                        {example.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {example.description}
                      </p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
