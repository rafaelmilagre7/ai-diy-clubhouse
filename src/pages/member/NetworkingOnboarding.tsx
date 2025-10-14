import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Target, Users, TrendingUp, Zap, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth';
import { useNetworkingOnboarding } from '@/hooks/useNetworkingOnboarding';

type OnboardingStep = 1 | 2 | 3 | 4 | 5 | 6 | 7;

interface OnboardingData {
  valueProposition: string;
  lookingFor: string[];
  mainChallenge: string;
  keywords: string[];
}

const connectionTypes = [
  { id: 'customer', label: 'Clientes', icon: '🎯' },
  { id: 'partner', label: 'Parceiros Estratégicos', icon: '🤝' },
  { id: 'investor', label: 'Investidores', icon: '💰' },
  { id: 'supplier', label: 'Fornecedores', icon: '🏭' },
  { id: 'mentor', label: 'Mentores', icon: '🧠' }
];

const challenges = [
  { id: 'increase_sales', label: 'Aumentar vendas', icon: '📈' },
  { id: 'scale_operation', label: 'Escalar operação', icon: '🚀' },
  { id: 'innovate_product', label: 'Inovar produto', icon: '💡' },
  { id: 'hire_talent', label: 'Contratar talentos', icon: '👥' },
  { id: 'raise_capital', label: 'Captar investimento', icon: '💰' },
  { id: 'expand_market', label: 'Expandir mercado', icon: '🌍' }
];

const professionalKeywords = [
  // Perfil de Liderança
  { id: 'strategic', label: 'Estratégico', category: 'leadership', icon: '🎯' },
  { id: 'visionary', label: 'Visionário', category: 'leadership', icon: '🔭' },
  { id: 'resilient', label: 'Resiliente', category: 'leadership', icon: '💪' },
  
  // Perfil Técnico
  { id: 'innovative', label: 'Inovador', category: 'technical', icon: '💡' },
  { id: 'analytical', label: 'Analítico', category: 'technical', icon: '📊' },
  { id: 'data_driven', label: 'Data-Driven', category: 'technical', icon: '📈' },
  
  // Perfil Comercial
  { id: 'results_driven', label: 'Orientado a Resultados', category: 'commercial', icon: '🎯' },
  { id: 'negotiator', label: 'Negociador', category: 'commercial', icon: '🤝' },
  { id: 'persuasive', label: 'Persuasivo', category: 'commercial', icon: '💬' },
  
  // Perfil Criativo
  { id: 'creative', label: 'Criativo', category: 'creative', icon: '🎨' },
  { id: 'disruptive', label: 'Disruptivo', category: 'creative', icon: '⚡' },
  { id: 'adaptable', label: 'Adaptável', category: 'creative', icon: '🔄' },
  
  // Perfil Operacional
  { id: 'organized', label: 'Organizado', category: 'operational', icon: '📋' },
  { id: 'efficient', label: 'Eficiente', category: 'operational', icon: '⚙️' },
  { id: 'detail_oriented', label: 'Detalhista', category: 'operational', icon: '🔍' },
  
  // Perfil Relacional
  { id: 'collaborative', label: 'Colaborativo', category: 'relational', icon: '👥' },
  { id: 'empathetic', label: 'Empático', category: 'relational', icon: '❤️' },
  { id: 'networker', label: 'Networker', category: 'relational', icon: '🌐' }
];

const NetworkingOnboarding = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { markAsCompleted } = useNetworkingOnboarding();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [networkingScore, setNetworkingScore] = useState(0);
  const [matchesFound, setMatchesFound] = useState(0);

  const [formData, setFormData] = useState<OnboardingData>({
    valueProposition: '',
    lookingFor: [],
    mainChallenge: '',
    keywords: []
  });

  const progressPercentage = ((currentStep - 1) / 6) * 100;

  const handleNext = () => {
    if (currentStep < 7) {
      setCurrentStep((prev) => (prev + 1) as OnboardingStep);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as OnboardingStep);
    }
  };

  const toggleLookingFor = (type: string) => {
    setFormData(prev => ({
      ...prev,
      lookingFor: prev.lookingFor.includes(type)
        ? prev.lookingFor.filter(t => t !== type)
        : [...prev.lookingFor, type]
    }));
  };

  const toggleKeyword = (keywordId: string) => {
    setFormData(prev => {
      const isSelected = prev.keywords.includes(keywordId);
      
      if (isSelected) {
        return {
          ...prev,
          keywords: prev.keywords.filter(k => k !== keywordId)
        };
      } else if (prev.keywords.length < 3) {
        return {
          ...prev,
          keywords: [...prev.keywords, keywordId]
        };
      }
      
      return prev;
    });
  };

  const processWithAI = async () => {
    if (!user) return;
    
    setCurrentStep(6);
    setIsProcessing(true);

    try {
      const { data: analysisData, error: analysisError } = await supabase.functions.invoke('analyze-networking-profile', {
        body: {
          value_proposition: formData.valueProposition,
          looking_for: formData.lookingFor,
          main_challenge: formData.mainChallenge,
          keywords: formData.keywords
        }
      });

      if (analysisError) throw analysisError;

      const { error: insertError } = await supabase
        .from('networking_profiles_v2')
        .upsert({
          user_id: user.id,
          value_proposition: formData.valueProposition,
          looking_for: formData.lookingFor,
          main_challenge: formData.mainChallenge,
          keywords: formData.keywords,
          ai_persona: analysisData.ai_persona,
          networking_score: analysisData.networking_score,
          profile_completed_at: new Date().toISOString()
        });

      if (insertError) throw insertError;

      const { data: matchesData, error: matchesError } = await supabase.functions.invoke('generate-strategic-matches-v2', {
        body: { user_id: user.id }
      });

      if (matchesError) throw matchesError;

      await new Promise(resolve => setTimeout(resolve, 2000));

      setNetworkingScore(analysisData.networking_score || 85);
      setMatchesFound(matchesData?.matches_count || 12);
      setCurrentStep(7);

    } catch (error) {
      console.error('Erro ao processar perfil:', error);
      toast.error('Erro ao processar seu perfil. Tente novamente.');
      setCurrentStep(5);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleComplete = () => {
    markAsCompleted();
    navigate('/networking');
  };

  const canProceed = () => {
    switch (currentStep) {
      case 2:
        return formData.valueProposition.length >= 20;
      case 3:
        return formData.lookingFor.length > 0;
      case 4:
        return formData.mainChallenge !== '';
      case 5:
        return formData.keywords.length === 3;
      default:
        return true;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto py-8 px-4">
        {/* Progress Bar */}
        {currentStep < 7 && (
          <div className="mb-8 space-y-2">
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <span>Configuração do Networking</span>
              <span>{currentStep < 6 ? `${currentStep}/5` : 'Processando...'}</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        )}

        <Card className="p-8 shadow-lg">
          {/* Step 1: Boas-vindas */}
          {currentStep === 1 && (
            <div className="space-y-8 text-center">
              <div className="inline-flex p-4 rounded-2xl bg-primary/10">
                <Users className="w-12 h-12 text-primary" />
              </div>
              
              <div className="space-y-3">
                <h1 className="text-4xl font-bold">Bem-vindo ao Networking Inteligente</h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Vamos configurar seu perfil para conectar você com as pessoas certas e gerar oportunidades reais de negócio.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                <div className="p-4 rounded-lg bg-muted/50">
                  <Target className="w-6 h-6 text-primary mb-2" />
                  <h3 className="font-semibold mb-1">Matches Estratégicos</h3>
                  <p className="text-sm text-muted-foreground">IA identifica conexões valiosas</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <Zap className="w-6 h-6 text-primary mb-2" />
                  <h3 className="font-semibold mb-1">Rápido e Simples</h3>
                  <p className="text-sm text-muted-foreground">5 perguntas em 3 minutos</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <TrendingUp className="w-6 h-6 text-primary mb-2" />
                  <h3 className="font-semibold mb-1">Resultados Reais</h3>
                  <p className="text-sm text-muted-foreground">Conexões com ROI mensurável</p>
                </div>
              </div>

              <Button onClick={handleNext} size="lg" className="px-8">
                Começar Configuração <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Step 2: Proposta de Valor */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Proposta de Valor</h2>
                  <p className="text-sm text-muted-foreground">Passo 1 de 4</p>
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-base font-medium">
                  Em uma frase, o que sua empresa faz de único?
                </label>
                <Textarea
                  value={formData.valueProposition}
                  onChange={(e) => setFormData(prev => ({ ...prev, valueProposition: e.target.value }))}
                  placeholder="Ex: Conectamos empreendedores através de IA para gerar negócios reais"
                  maxLength={200}
                  rows={4}
                  className="text-base"
                />
                <p className="text-xs text-muted-foreground text-right">
                  {formData.valueProposition.length}/200 caracteres
                </p>
              </div>

              <div className="flex gap-3 justify-between pt-4">
                <Button variant="outline" onClick={handleBack}>
                  <ArrowLeft className="mr-2 w-4 h-4" /> Voltar
                </Button>
                <Button onClick={handleNext} disabled={!canProceed()}>
                  Próximo <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Tipo de Conexão */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Tipo de Conexão</h2>
                  <p className="text-sm text-muted-foreground">Passo 2 de 4 • Múltipla escolha</p>
                </div>
              </div>

              <p className="text-base">
                Que tipo de conexão você busca? Selecione todas que se aplicam.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {connectionTypes.map((type) => (
                  <Card
                    key={type.id}
                    className={cn(
                      "p-4 cursor-pointer transition-all hover:border-primary/50",
                      formData.lookingFor.includes(type.id) && "border-primary bg-primary/5"
                    )}
                    onClick={() => toggleLookingFor(type.id)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{type.icon}</span>
                      <span className="font-medium flex-1">{type.label}</span>
                      {formData.lookingFor.includes(type.id) && (
                        <CheckCircle className="w-5 h-5 text-primary" />
                      )}
                    </div>
                  </Card>
                ))}
              </div>

              <div className="flex gap-3 justify-between pt-4">
                <Button variant="outline" onClick={handleBack}>
                  <ArrowLeft className="mr-2 w-4 h-4" /> Voltar
                </Button>
                <Button onClick={handleNext} disabled={!canProceed()}>
                  Próximo <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Desafio Atual */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-primary/10">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Desafio Atual</h2>
                  <p className="text-sm text-muted-foreground">Passo 3 de 4</p>
                </div>
              </div>

              <p className="text-base">
                Qual seu principal desafio hoje?
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {challenges.map((challenge) => (
                  <Card
                    key={challenge.id}
                    className={cn(
                      "p-4 cursor-pointer transition-all hover:border-primary/50",
                      formData.mainChallenge === challenge.id && "border-primary bg-primary/5"
                    )}
                    onClick={() => setFormData(prev => ({ ...prev, mainChallenge: challenge.id }))}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{challenge.icon}</span>
                      <span className="font-medium flex-1">{challenge.label}</span>
                      {formData.mainChallenge === challenge.id && (
                        <CheckCircle className="w-5 h-5 text-primary" />
                      )}
                    </div>
                  </Card>
                ))}
              </div>

              <div className="flex gap-3 justify-between pt-4">
                <Button variant="outline" onClick={handleBack}>
                  <ArrowLeft className="mr-2 w-4 h-4" /> Voltar
                </Button>
                <Button onClick={handleNext} disabled={!canProceed()}>
                  Próximo <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 5: Palavras-chave */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Palavras-chave</h2>
                  <p className="text-sm text-muted-foreground">Passo 4 de 4 • Selecione 3</p>
                </div>
              </div>

              <p className="text-base">
                Selecione 3 palavras que melhor te descrevem profissionalmente
              </p>

              {/* Grid de Tags Selecionáveis */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {professionalKeywords.map((keyword) => (
                  <Card
                    key={keyword.id}
                    className={cn(
                      "p-3 cursor-pointer transition-all hover:border-primary/50",
                      formData.keywords.includes(keyword.id) && "border-primary bg-primary/5",
                      formData.keywords.length >= 3 && !formData.keywords.includes(keyword.id) && "opacity-50 cursor-not-allowed"
                    )}
                    onClick={() => toggleKeyword(keyword.id)}
                  >
                    <div className="flex flex-col items-center gap-2 text-center">
                      <span className="text-2xl">{keyword.icon}</span>
                      <span className="font-medium text-sm">{keyword.label}</span>
                      {formData.keywords.includes(keyword.id) && (
                        <CheckCircle className="w-4 h-4 text-primary" />
                      )}
                    </div>
                  </Card>
                ))}
              </div>

              {/* Contador Visual */}
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3].map((num) => (
                  <div
                    key={num}
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all",
                      formData.keywords.length >= num 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {num}
                  </div>
                ))}
              </div>

              <div className="flex gap-3 justify-between pt-4">
                <Button variant="outline" onClick={handleBack}>
                  <ArrowLeft className="mr-2 w-4 h-4" /> Voltar
                </Button>
                <Button 
                  onClick={processWithAI} 
                  disabled={!canProceed()}
                >
                  Analisar com IA <Zap className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 6: Processando */}
          {currentStep === 6 && (
            <div className="space-y-8 text-center py-8">
              <div className="inline-flex p-6 rounded-2xl bg-primary/10">
                <Zap className="w-16 h-16 text-primary animate-pulse" />
              </div>
              
              <div className="space-y-2">
                <h2 className="text-3xl font-bold">Analisando seu perfil...</h2>
                <p className="text-muted-foreground">
                  Nossa IA está identificando as melhores conexões para você
                </p>
              </div>

              <div className="max-w-md mx-auto space-y-2">
                <Progress value={66} className="h-2" />
                <p className="text-sm text-muted-foreground">Isso pode levar alguns segundos</p>
              </div>
            </div>
          )}

          {/* Step 7: Resultado */}
          {currentStep === 7 && (
            <div className="space-y-8 text-center">
              <div className="inline-flex p-6 rounded-2xl bg-green-500/10">
                <CheckCircle className="w-16 h-16 text-green-600" />
              </div>
              
              <div className="space-y-2">
                <h2 className="text-3xl font-bold">Perfil Configurado com Sucesso!</h2>
                <p className="text-lg text-muted-foreground">
                  Encontramos conexões estratégicas para você
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mx-auto">
                <Card className="p-6 bg-primary/5 border-primary/20">
                  <div className="text-3xl font-bold text-primary">{networkingScore}%</div>
                  <p className="text-sm text-muted-foreground mt-1">Networking Score</p>
                </Card>
                <Card className="p-6 bg-primary/5 border-primary/20">
                  <div className="text-3xl font-bold text-primary">{matchesFound}</div>
                  <p className="text-sm text-muted-foreground mt-1">Matches Encontrados</p>
                </Card>
              </div>

              <Button onClick={handleComplete} size="lg" className="px-8">
                Ver Minhas Conexões <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default NetworkingOnboarding;
