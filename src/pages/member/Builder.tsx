import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout, ArrowRight, MessageSquare, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/auth';
import { useBuilderAI } from '@/hooks/builder/useBuilderAI';
import { QuestionWizard } from '@/components/builder/QuestionWizard';
import { BuilderProcessingExperience } from '@/components/builder/BuilderProcessingExperience';
import { SolutionResult } from '@/components/builder/SolutionResult';
import { AIInputWithValidation } from '@/components/ui/AIInputWithValidation';
import { useAISolutionAccess } from '@/hooks/builder/useAISolutionAccess';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';

const exampleIdeas = [
  {
    title: "Chatbot de Atendimento",
    description: "Chatbot no WhatsApp que usa IA para responder dúvidas sobre produtos",
    icon: MessageSquare,
    color: "from-blue-500/20 to-cyan-500/20",
    borderColor: "border-blue-500/30"
  },
  {
    title: "Sistema de Agendamento",
    description: "Sistema automático que integra Google Calendar com notificações personalizadas",
    icon: Calendar,
    color: "from-purple-500/20 to-pink-500/20",
    borderColor: "border-purple-500/30"
  }
];

export default function Builder() {
  const { profile } = useAuth();
  const { analyzeIdea, generateSolution, saveSolution, discardSolution, isAnalyzing, isGenerating, questions } = useBuilderAI();
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
  const location = useLocation();

  // Redireciona soluções antigas para a nova estrutura
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const solutionId = params.get('solution');
    
    if (solutionId) {
      navigate(`/ferramentas/builder/solution/${solutionId}`, { replace: true });
    }
  }, [location.search, navigate]);

  const handleGenerateSolution = async (idea: string) => {
    if (!hasAccess) {
      toast.error('Você não tem acesso ao Builder AI');
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

  const handleSave = async (solutionToSave: any) => {
    if (solutionToSave) {
      const savedSolution = await saveSolution(solutionToSave);
      return savedSolution;
    }
  };

  const handleDiscard = () => {
    discardSolution();
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
          <BuilderProcessingExperience key="loader" />
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
            <SolutionResult 
              solution={solution} 
              onNewIdea={handleNewIdea} 
              onSave={handleSave}
              onDiscard={handleDiscard}
            />
          </motion.div>
        ) : (
          <motion.div
            key="input"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center min-h-screen px-4 py-8"
          >
            {/* Header com contador discreto - AJUSTADO para não sobrepor header */}
            <div className="absolute top-24 right-4 z-10">
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
              <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Builder AI
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Extraia o cérebro do Rafael Milagre e transforme suas ideias em soluções executáveis de IA
              </p>
            </motion.div>

            {/* Input centralizado */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="w-full max-w-2xl mb-12"
            >
              <AIInputWithValidation
                placeholder="Ex: Quero automatizar atendimento no WhatsApp e integrar com meu CRM..."
                onSubmit={handleGenerateSolution}
                disabled={isGenerating || isAnalyzing}
                minHeight={56}
                maxHeight={200}
                minChars={30}
                maxChars={2000}
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
                {exampleIdeas.map((example, index) => {
                  const IconComponent = example.icon;
                  return (
                    <motion.button
                      key={index}
                      onClick={() => handleExampleClick(example)}
                      className={`
                        group relative p-4 rounded-2xl border transition-all duration-200 text-left overflow-hidden
                        bg-gradient-to-br ${example.color}
                        ${example.borderColor} hover:border-primary/50
                      `}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                      <div className="relative">
                        <div className="flex items-start justify-between mb-2">
                          <div className="p-2 rounded-lg bg-background/50">
                            <IconComponent className="h-5 w-5 text-primary" />
                          </div>
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
                  );
                })}
              </div>
            </motion.div>

            {/* Botão Ver Histórico - movido para o final */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="w-full max-w-2xl text-center mt-12"
            >
              <button
                onClick={() => navigate('/ferramentas/builder/historico')}
                className="text-sm text-muted-foreground hover:text-primary transition-colors underline decoration-dotted underline-offset-4"
              >
                Ver histórico
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
