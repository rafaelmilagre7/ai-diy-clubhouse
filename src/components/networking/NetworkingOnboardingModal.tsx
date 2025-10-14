import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Target, TrendingUp, Sparkles, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth';

interface NetworkingOnboardingModalProps {
  open: boolean;
  onClose?: () => void;
  onComplete: () => void;
  prefilledData?: {
    name?: string;
    email?: string;
    company_name?: string;
    current_position?: string;
    industry?: string;
    company_size?: string;
    annual_revenue?: string;
    linkedin_url?: string;
    whatsapp_number?: string;
    professional_bio?: string;
    lookingFor?: {
      types?: string[];
      industries?: string[];
      companySizes?: string[];
    };
  };
}

type OnboardingStep = 1 | 2 | 3 | 4 | 5 | 6 | 7;

interface OnboardingData {
  valueProposition: string;
  lookingFor: string[];
  mainChallenge: string;
  keywords: string[];
}

const connectionTypes = [
  { id: 'customer', label: 'Clientes', icon: '🎯', color: 'blue' },
  { id: 'partner', label: 'Parceiros Estratégicos', icon: '🤝', color: 'green' },
  { id: 'investor', label: 'Investidores', icon: '💰', color: 'yellow' },
  { id: 'supplier', label: 'Fornecedores', icon: '🏭', color: 'purple' },
  { id: 'mentor', label: 'Mentores', icon: '🧠', color: 'pink' }
];

const challenges = [
  { id: 'increase_sales', label: 'Aumentar vendas', icon: '📈' },
  { id: 'scale_operation', label: 'Escalar operação', icon: '🚀' },
  { id: 'innovate_product', label: 'Inovar produto', icon: '💡' },
  { id: 'hire_talent', label: 'Contratar talentos', icon: '👥' },
  { id: 'raise_capital', label: 'Captar investimento', icon: '💰' },
  { id: 'expand_market', label: 'Expandir mercado', icon: '🌍' }
];

export const NetworkingOnboardingModal: React.FC<NetworkingOnboardingModalProps> = ({
  open,
  onClose,
  onComplete,
  prefilledData
}) => {
  const { user } = useAuth();
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

  const [keywordInput, setKeywordInput] = useState('');

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

  const addKeyword = () => {
    if (keywordInput.trim() && formData.keywords.length < 3) {
      setFormData(prev => ({
        ...prev,
        keywords: [...prev.keywords, keywordInput.trim()]
      }));
      setKeywordInput('');
    }
  };

  const removeKeyword = (keyword: string) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keyword)
    }));
  };

  const processWithAI = async () => {
    if (!user) return;
    
    setCurrentStep(6);
    setIsProcessing(true);

    try {
      // Chamar Edge Function para analisar perfil
      const { data: analysisData, error: analysisError } = await supabase.functions.invoke('analyze-networking-profile', {
        body: {
          value_proposition: formData.valueProposition,
          looking_for: formData.lookingFor,
          main_challenge: formData.mainChallenge,
          keywords: formData.keywords
        }
      });

      if (analysisError) throw analysisError;

      // Salvar perfil enriquecido
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

      // Gerar matches estratégicos
      const { data: matchesData, error: matchesError } = await supabase.functions.invoke('generate-strategic-matches-v2', {
        body: { user_id: user.id }
      });

      if (matchesError) throw matchesError;

      // Simular progresso
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
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden bg-surface-modal border border-border/50 shadow-aurora">
        <Card className="aurora-glass p-8 border-none">
            {/* Step 1: Boas-vindas */}
            {currentStep === 1 && (
              <div className="space-y-6 text-center animate-fade-in">
                <div className="inline-block p-4 rounded-xl bg-viverblue/10 border border-viverblue/20 aurora-glow">
                  <Sparkles className="w-12 h-12 text-viverblue" />
                </div>
                
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold text-text-primary aurora-text-gradient">
                    Networking Inteligente 🤝
                  </h2>
                  <p className="text-lg text-text-muted">
                    Vamos criar conexões estratégicas para sua empresa
                  </p>
                </div>

                <div className="flex justify-center pt-4">
                  <Button onClick={handleNext} size="lg" variant="aurora">
                    Começar
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Proposta de Valor */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-viverblue/10 border border-viverblue/20 aurora-float">
                    <Lightbulb className="w-6 h-6 text-viverblue" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-text-primary">Proposta de Valor</h3>
                    <p className="text-sm text-text-muted">Passo 1 de 4</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-text-primary">
                    Em uma frase, o que sua empresa faz de único?
                  </label>
                  <Textarea
                    value={formData.valueProposition}
                    onChange={(e) => setFormData(prev => ({ ...prev, valueProposition: e.target.value }))}
                    placeholder="Ex: Conectamos empreendedores através de IA para gerar negócios reais"
                    maxLength={200}
                    rows={4}
                    className="bg-surface-elevated border-border text-text-primary placeholder:text-text-disabled"
                  />
                  <p className="text-xs text-text-muted text-right">
                    {formData.valueProposition.length}/200 caracteres
                  </p>
                </div>

                <div className="flex gap-3 justify-between">
                  <Button variant="outline" onClick={handleBack}>
                    Voltar
                  </Button>
                  <Button variant="aurora" onClick={handleNext} disabled={!canProceed()}>
                    Próximo
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Tipo de Conexão */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-operational/10 border border-operational/20 aurora-float">
                    <Target className="w-6 h-6 text-operational" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-text-primary">Tipo de Conexão</h3>
                    <p className="text-sm text-text-muted">Passo 2 de 4 • Múltipla escolha</p>
                  </div>
                </div>

                <p className="text-text-primary">
                  Que tipo de conexão você busca?
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {connectionTypes.map((type) => (
                    <Card
                      key={type.id}
                      className={cn(
                        "p-4 cursor-pointer transition-all aurora-glass-hover",
                        formData.lookingFor.includes(type.id) && "border-viverblue/60 bg-viverblue/5"
                      )}
                      onClick={() => toggleLookingFor(type.id)}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{type.icon}</span>
                        <span className="font-medium text-text-primary">{type.label}</span>
                        {formData.lookingFor.includes(type.id) && (
                          <CheckCircle className="w-5 h-5 ml-auto text-viverblue" />
                        )}
                      </div>
                    </Card>
                  ))}
                </div>

                <div className="flex gap-3 justify-between">
                  <Button variant="outline" onClick={handleBack}>
                    Voltar
                  </Button>
                  <Button variant="aurora" onClick={handleNext} disabled={!canProceed()}>
                    Próximo
                  </Button>
                </div>
              </div>
            )}

            {/* Step 4: Desafio Atual */}
            {currentStep === 4 && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-revenue/10 border border-revenue/20 aurora-float">
                    <TrendingUp className="w-6 h-6 text-revenue" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-text-primary">Desafio Atual</h3>
                    <p className="text-sm text-text-muted">Passo 3 de 4</p>
                  </div>
                </div>

                <p className="text-text-primary">
                  Qual seu principal desafio hoje?
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {challenges.map((challenge) => (
                    <Card
                      key={challenge.id}
                      className={cn(
                        "p-4 cursor-pointer transition-all aurora-glass-hover",
                        formData.mainChallenge === challenge.id && "border-viverblue/60 bg-viverblue/5"
                      )}
                      onClick={() => setFormData(prev => ({ ...prev, mainChallenge: challenge.id }))}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{challenge.icon}</span>
                        <span className="font-medium text-text-primary">{challenge.label}</span>
                        {formData.mainChallenge === challenge.id && (
                          <CheckCircle className="w-5 h-5 ml-auto text-viverblue" />
                        )}
                      </div>
                    </Card>
                  ))}
                </div>

                <div className="flex gap-3 justify-between">
                  <Button variant="outline" onClick={handleBack}>
                    Voltar
                  </Button>
                  <Button variant="aurora" onClick={handleNext} disabled={!canProceed()}>
                    Próximo
                  </Button>
                </div>
              </div>
            )}

            {/* Step 5: Palavras-chave */}
            {currentStep === 5 && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-strategy/10 border border-strategy/20 aurora-float">
                    <Sparkles className="w-6 h-6 text-strategy" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-text-primary">Palavras-chave</h3>
                    <p className="text-sm text-text-muted">Passo 4 de 4</p>
                  </div>
                </div>

                <p className="text-text-primary">
                  3 palavras que descrevem você profissionalmente
                </p>

                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={keywordInput}
                      onChange={(e) => setKeywordInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addKeyword()}
                      placeholder="Digite uma palavra-chave"
                      disabled={formData.keywords.length >= 3}
                      className="flex-1 px-4 py-2 rounded-xl bg-surface-elevated border border-border text-text-primary placeholder:text-text-disabled focus:outline-none focus:ring-2 focus:ring-viverblue/30"
                    />
                    <Button 
                      onClick={addKeyword} 
                      disabled={!keywordInput.trim() || formData.keywords.length >= 3}
                      variant="aurora"
                    >
                      Adicionar
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {formData.keywords.map((keyword, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="px-4 py-2 text-sm border-viverblue/40 bg-viverblue/10 text-viverblue animate-scale-in cursor-pointer hover:bg-viverblue/20"
                        onClick={() => removeKeyword(keyword)}
                      >
                        {keyword} ✕
                      </Badge>
                    ))}
                  </div>

                  <p className="text-xs text-text-muted">
                    {formData.keywords.length}/3 palavras-chave adicionadas
                  </p>
                </div>

                <div className="flex gap-3 justify-between">
                  <Button variant="outline" onClick={handleBack}>
                    Voltar
                  </Button>
                  <Button 
                    onClick={processWithAI} 
                    disabled={!canProceed()}
                    variant="aurora"
                  >
                    Analisar com IA
                  </Button>
                </div>
              </div>
            )}

            {/* Step 6: Processando */}
            {currentStep === 6 && (
              <div className="space-y-6 text-center animate-fade-in py-8">
                <div className="inline-block p-6 rounded-xl bg-viverblue/10 border border-viverblue/20 aurora-pulse">
                  <Sparkles className="w-16 h-16 text-viverblue animate-spin" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-text-primary aurora-text-gradient">
                    Analisando seu perfil com IA...
                  </h3>
                  <p className="text-text-muted">
                    Isso pode levar alguns segundos
                  </p>
                </div>

                <div className="w-full h-2 bg-border/30 rounded-full overflow-hidden">
                  <div className="h-full aurora-progress animate-shimmer"></div>
                </div>
              </div>
            )}

            {/* Step 7: Resultado */}
            {currentStep === 7 && (
              <div className="space-y-6 text-center animate-fade-in">
                <Card className="aurora-glass p-6 border-viverblue/30">
                  <div className="space-y-4">
                    <div className="inline-block p-4 rounded-xl bg-viverblue/10 border border-viverblue/20 aurora-pulse">
                      <CheckCircle className="w-12 h-12 text-viverblue" />
                    </div>
                    
                    <div>
                      <p className="text-text-muted mb-2">Seu Índice de Networking</p>
                      <h2 className="text-5xl font-bold aurora-text-gradient mb-2">
                        {networkingScore}/100
                      </h2>
                      <Badge className="border-viverblue/40 bg-viverblue/20 text-viverblue">
                        Perfil Estrategista 🎉
                      </Badge>
                    </div>

                    <div className="pt-4 border-t border-border/50">
                      <p className="text-lg text-text-primary">
                        Encontramos <span className="font-bold text-viverblue">{matchesFound} conexões estratégicas</span> para você
                      </p>
                    </div>
                  </div>
                </Card>

                <Button 
                  onClick={() => {
                    onComplete();
                    onClose?.();
                  }}
                  size="lg"
                  className="w-full"
                  variant="aurora"
                >
                  Ver Minhas Conexões 🚀
                </Button>
              </div>
            )}
          </Card>
      </DialogContent>
    </Dialog>
  );
};
