import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout, ArrowRight, MessageSquare, FileText, History } from 'lucide-react';
import { useAuth } from '@/contexts/auth';
import { useBuilderAI } from '@/hooks/builder/useBuilderAI';
import { QuestionWizard } from '@/components/builder/QuestionWizard';
import { BuilderProcessingExperience } from '@/components/builder/BuilderProcessingExperience';
import { BuilderValidationAnimation } from '@/components/builder/BuilderValidationAnimation';
import { SolutionResult } from '@/components/builder/SolutionResult';
import { AIInputWithValidation } from '@/components/ui/AIInputWithValidation';
import { VoiceInput } from '@/components/builder/VoiceInput';
import { useAISolutionAccess } from '@/hooks/builder/useAISolutionAccess';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';

const exampleIdeas = [
  {
    title: "Agente de IA de vendas no WhatsApp",
    description: "Agente inteligente que automatiza vendas, qualifica leads e acompanha clientes via WhatsApp",
    icon: MessageSquare,
    color: "from-green-500/20 to-emerald-500/20",
    borderColor: "border-green-500/30"
  },
  {
    title: "Blog no piloto automático com IA",
    description: "Sistema que cria, publica e gerencia conteúdo automaticamente usando inteligência artificial",
    icon: FileText,
    color: "from-violet-500/20 to-purple-500/20",
    borderColor: "border-violet-500/30"
  }
];

export default function Builder() {
  const { profile } = useAuth();
  const { analyzeIdea, generateSolution, isAnalyzing, isGenerating, questions } = useBuilderAI();
  const [currentIdea, setCurrentIdea] = useState<string>('');
  const [showWizard, setShowWizard] = useState(false);
  const [clickedExample, setClickedExample] = useState<number | null>(null);
  const [validationStatus, setValidationStatus] = useState<'idle' | 'validating' | 'success' | 'error' | 'loading-questions'>('idle');
  const [validationMessage, setValidationMessage] = useState<string>('');
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

  // 🔧 FASE 2: RECOVERY melhorado - detectar tentativas incompletas
  useEffect(() => {
    const checkForRecovery = async () => {
      if (!profile?.id || showWizard || isGenerating) return;
      
      // NÃO executar recovery se está gerando
      if (localStorage.getItem('builder_generating')) {
        console.log('[BUILDER-RECOVERY] ⏸️ Geração em andamento, pulando recovery');
        return;
      }
      
      // Verificar se geração acabou recentemente (últimos 30s)
      const lastGenerationEnd = localStorage.getItem('builder_last_generation_end');
      if (lastGenerationEnd) {
        const timeSinceGeneration = Date.now() - parseInt(lastGenerationEnd);
        if (timeSinceGeneration < 30000) {
          console.log('[BUILDER-RECOVERY] ⏭️ Geração terminou há menos de 30s, pulando recovery');
          return;
        }
      }
      
      // Verificar tentativa incompleta no localStorage
      const lastAttemptStr = localStorage.getItem('builder_last_attempt');
      if (lastAttemptStr) {
        try {
          const attempt = JSON.parse(lastAttemptStr);
          const ageMinutes = (Date.now() - attempt.timestamp) / 60000;
          
          // Se tentativa tem menos de 10 minutos, oferecer continuar
          if (ageMinutes < 10) {
            toast.info('Detectamos uma geração incompleta', {
              description: 'Deseja tentar novamente?',
              action: {
                label: 'Sim, continuar',
                onClick: () => {
                  setCurrentIdea(attempt.idea);
                  handleWizardComplete(attempt.answers);
                }
              },
              cancel: {
                label: 'Não, descartar',
                onClick: () => localStorage.removeItem('builder_last_attempt')
              },
              duration: 15000
            });
            return; // Não verificar soluções recentes se há tentativa incompleta
          } else {
            // Limpar tentativas antigas
            localStorage.removeItem('builder_last_attempt');
          }
        } catch (e) {
          console.error('[BUILDER-RECOVERY] Erro ao parsear tentativa:', e);
          localStorage.removeItem('builder_last_attempt');
        }
      }
      
      // Verificar se há solução recente sem visualização
      const { data: recentSolution, error: queryError } = await supabase
        .from('ai_generated_solutions')
        .select('id, created_at')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (queryError || !recentSolution) return;
      
      // Se foi criada nos últimos 5 minutos, redirecionar
      const createdAt = new Date(recentSolution.created_at);
      const now = new Date();
      const diffMinutes = (now.getTime() - createdAt.getTime()) / 60000;
      
      if (diffMinutes < 5) {
        console.log('[BUILDER-RECOVERY] 🔄 Solução recente encontrada, redirecionando...');
        toast.info('Redirecionando para sua solução recente...');
        
        const targetUrl = `/ferramentas/builder/solution/${recentSolution.id}`;
        try {
          navigate(targetUrl);
        } catch (navError) {
          console.error('[BUILDER-RECOVERY] ❌ Erro no navigate, usando fallback:', navError);
          window.location.href = targetUrl;
        }
      }
    };
    
    // Delay de 2s para não competir com outras operações
    const timer = setTimeout(checkForRecovery, 2000);
    return () => clearTimeout(timer);
  }, [profile?.id, showWizard, isGenerating, navigate]);

  const handleGenerateSolution = async (idea: string) => {
    if (!hasAccess) {
      toast.error('Você não tem acesso ao Builder');
      navigate('/ferramentas');
      return;
    }

    if (!idea.trim()) {
      toast.error('Por favor, descreva sua ideia');
      return;
    }

    setCurrentIdea(idea);

    // NOVA ETAPA: Validar viabilidade primeiro
    try {
      setValidationStatus('validating');

      const { data, error } = await supabase.functions.invoke('validate-idea-feasibility', {
        body: { idea }
      });

      if (error) {
        console.error('[BUILDER] Erro na validação:', error);
        setValidationStatus('error');
        setValidationMessage('Erro ao validar ideia. Tente novamente.');
        setTimeout(() => setValidationStatus('idle'), 3000);
        return;
      }

      // 🆕 FASE 2: Dados enriquecidos de viabilidade
      const { 
        viable, 
        score,
        reason, 
        technical_explanation,
        suggestions,
        estimated_complexity,
        estimated_time,
        required_stack,
        limitations,
        cost_estimate,
        from_cache
      } = data;

      if (!viable) {
        // Não é viável
        setValidationStatus('error');
        setValidationMessage(reason || 'Ideia não é viável para desenvolvimento com IA');
        
        setTimeout(() => {
          setValidationStatus('idle');
          setCurrentIdea('');
        }, 5000);
        return;
      }

      // É viável! Mostrar sucesso com informações ricas
      setValidationStatus('success');
      
      // Formatar mensagem com score e informações adicionais
      let enrichedMessage = `✅ Score de Viabilidade: ${score}/100\n\n${reason}`;
      
      if (estimated_complexity && estimated_time) {
        enrichedMessage += `\n\n📊 Complexidade: ${estimated_complexity.toUpperCase()} • Tempo estimado: ${estimated_time}`;
      }
      
      if (cost_estimate) {
        enrichedMessage += `\n💰 Custo estimado: ${cost_estimate}`;
      }
      
      if (required_stack && Array.isArray(required_stack) && required_stack.length > 0) {
        enrichedMessage += `\n\n🛠️ Stack necessário: ${required_stack.slice(0, 5).join(', ')}`;
      }
      
      if (from_cache) {
        enrichedMessage += `\n\n⚡ (Resultado do cache - processamento instantâneo)`;
      }
      
      setValidationMessage(enrichedMessage);

      // Aguardar 1s para mostrar sucesso e então carregar perguntas
      setTimeout(async () => {
        setValidationStatus('loading-questions');
        
        const generatedQuestions = await analyzeIdea(idea);
        
        if (generatedQuestions && generatedQuestions.length > 0) {
          setValidationStatus('idle');
          setShowWizard(true);
        } else {
          setValidationStatus('idle');
        }
      }, 1000);

    } catch (error) {
      console.error('[BUILDER] Erro na validação:', error);
      setValidationStatus('error');
      setValidationMessage('Erro inesperado ao validar ideia');
      setTimeout(() => setValidationStatus('idle'), 3000);
    }
  };

  const handleWizardComplete = async (answers: Array<{ question: string; answer: string }>) => {
    setShowWizard(false);
    console.log('[BUILDER] 🚀 Iniciando geração...', {
      idea: currentIdea.substring(0, 50) + '...',
      answersCount: answers.length,
      timestamp: new Date().toISOString()
    });
    
    // Desabilitar recovery durante geração
    const recoveryFlag = 'builder_generating';
    localStorage.setItem(recoveryFlag, 'true');
    
    // Salvar tentativa no localStorage (recovery)
    localStorage.setItem('builder_last_attempt', JSON.stringify({
      idea: currentIdea,
      answers,
      timestamp: Date.now()
    }));
    
    try {
      console.log('[BUILDER] 📞 Chamando generateSolution...');
      const result = await generateSolution(currentIdea, answers);
      
      console.log('[BUILDER] 📦 Resultado recebido:', {
        hasResult: !!result,
        hasId: !!result?.id,
        id: result?.id,
        title: result?.title,
        allKeys: result ? Object.keys(result) : []
      });
      
      if (result?.id) {
        const targetUrl = `/ferramentas/builder/solution/${result.id}`;
        console.log('[BUILDER] ✅ ID válido! Redirecionando para:', targetUrl);
        
        // Marcar que geração acabou
        localStorage.setItem('builder_last_generation_end', Date.now().toString());
        
        // Limpar flags antes de redirecionar
        localStorage.removeItem('builder_last_attempt');
        localStorage.removeItem(recoveryFlag);
        
        // Toast de sucesso
        toast.success('Solução gerada com sucesso! 🎉', {
          description: 'Redirecionando para visualização...'
        });
        
        // Aguardar um pouco para o usuário ver o toast
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Redirecionar com fallback
        console.log('[BUILDER] 🔀 Executando navigate...');
        try {
          navigate(targetUrl);
          console.log('[BUILDER] ✅ Navigate executado');
        } catch (navError) {
          console.error('[BUILDER] ❌ Erro no navigate, usando fallback:', navError);
          window.location.href = targetUrl;
        }
      } else {
        console.error('[BUILDER] ❌ Resultado sem ID:', result);
        throw new Error('ID da solução não foi retornado pela API');
      }
    } catch (error) {
      console.error('[BUILDER] ❌ Erro capturado no handleWizardComplete:', error);
      localStorage.removeItem(recoveryFlag);
      
      // Toast SEMPRE visível
      toast.error('Erro ao gerar solução', {
        description: 'Não foi possível criar sua solução. Tente novamente.',
        action: {
          label: 'Tentar novamente',
          onClick: () => handleWizardComplete(answers)
        },
        duration: 15000
      });
      
      // Não fazer nada - fica na tela de loading para o usuário ver o erro
    }
  };

  const handleWizardCancel = () => {
    setShowWizard(false);
    setCurrentIdea('');
  };

  const handleExampleClick = async (example: typeof exampleIdeas[0], index: number) => {
    setClickedExample(index);
    await handleGenerateSolution(example.description);
    // Reset após 2s (tempo suficiente para ver o feedback)
    setTimeout(() => setClickedExample(null), 2000);
  };

  const handleVoiceTranscription = (text: string) => {
    setCurrentIdea((prev) => {
      if (prev.trim()) {
        return prev + ' ' + text;
      }
      return text;
    });
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
    <div className="min-h-screen h-screen overflow-hidden bg-gradient-to-br from-background via-background to-surface-elevated/20">
      <AnimatePresence mode="wait">
        {validationStatus !== 'idle' ? (
          <BuilderValidationAnimation 
            key="validation"
            status={validationStatus as 'validating' | 'success' | 'error' | 'loading-questions'}
            message={validationMessage}
          />
        ) : isGenerating ? (
          <BuilderProcessingExperience key="loader" />
        ) : showWizard && questions ? (
          <QuestionWizard
            key="wizard"
            questions={questions}
            onComplete={handleWizardComplete}
            onCancel={handleWizardCancel}
          />
        ) : (
          <motion.div
            key="input"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center h-screen px-4 py-6"
          >
            {/* Header com contador e botão de soluções */}
            <div className="absolute top-20 right-4 z-10 flex items-center gap-3">
              <div className="text-xs text-muted-foreground bg-surface-elevated/50 backdrop-blur-sm px-3 py-1.5 rounded-full border border-border/50">
                {generationsUsed} de {monthlyLimit === 999999 ? '∞' : monthlyLimit} gerações
              </div>
              <Button
                variant="default"
                size="sm"
                onClick={() => navigate('/ferramentas/builder/historico')}
                className="gap-2 shadow-lg"
              >
                <History className="h-4 w-4" />
                Minhas Soluções
              </Button>
            </div>

            {/* Logo/Título centralizado */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-center mb-6"
            >
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-aurora-primary/20 to-aurora-primary/5 border border-aurora-primary/20">
                  <Layout className="h-7 w-7 text-aurora-primary" />
                </div>
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Builder
              </h1>
              <p className="text-muted-foreground text-sm max-w-2xl mx-auto leading-tight">
                Extraia o Cérebro do Rafael Milagre e transforme ideias em soluções práticas de IA
              </p>
            </motion.div>

            {/* Input centralizado com voice input integrado */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="w-full max-w-2xl mb-6"
            >
              <div className="flex flex-col items-center gap-3">
                <AIInputWithValidation
                  placeholder="Ex: Quero automatizar atendimento no WhatsApp e integrar com meu CRM..."
                  onSubmit={handleGenerateSolution}
                  disabled={isGenerating || isAnalyzing}
                  minHeight={56}
                  maxHeight={200}
                  minChars={30}
                  maxChars={2000}
                  value={currentIdea}
                  onChange={setCurrentIdea}
                />
                <VoiceInput 
                  onTranscription={handleVoiceTranscription}
                  disabled={isGenerating || isAnalyzing}
                />
              </div>
            </motion.div>

            {/* Exemplos */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="w-full max-w-2xl mb-6"
            >
              <p className="text-xs text-muted-foreground text-center mb-3">
                Ou escolha um exemplo:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {exampleIdeas.map((example, index) => {
                  const IconComponent = example.icon;
                  const isClicked = clickedExample === index;
                  
                  return (
                    <motion.button
                      key={index}
                      onClick={() => handleExampleClick(example, index)}
                      disabled={isClicked || isAnalyzing || isGenerating}
                      className={`
                        group relative p-3 rounded-2xl border transition-all duration-200 text-left overflow-hidden
                        bg-gradient-to-br ${example.color}
                        ${example.borderColor} hover:border-primary/50
                        ${isClicked ? 'border-primary ring-2 ring-primary/20' : ''}
                        ${(isAnalyzing || isGenerating) && !isClicked ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                      whileHover={!isClicked && !isAnalyzing && !isGenerating ? { scale: 1.02, y: -2 } : {}}
                      whileTap={!isClicked && !isAnalyzing && !isGenerating ? { scale: 0.98 } : {}}
                    >
                      {isClicked && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute inset-0 bg-primary/10 rounded-2xl"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                      <div className="relative">
                        <div className="flex items-start justify-between mb-2">
                          <div className="p-2 rounded-lg bg-background/50">
                            <IconComponent className={`h-4 w-4 ${isClicked ? 'text-primary' : 'text-primary'}`} />
                          </div>
                          {isClicked ? (
                            <motion.div
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              className="h-5 w-5 rounded-full bg-primary flex items-center justify-center"
                            >
                              <svg className="h-3 w-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </motion.div>
                          ) : (
                            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors opacity-0 group-hover:opacity-100" />
                          )}
                        </div>
                        <h3 className={`font-semibold mb-1 text-sm transition-colors ${isClicked ? 'text-primary' : 'text-foreground group-hover:text-primary'}`}>
                          {example.title}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {example.description}
                        </p>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>

            {/* Botão removido daqui - agora está no header */}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
