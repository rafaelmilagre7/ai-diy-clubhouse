import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { GlowButton } from '@/components/ui/GlowButton';
import { FloatingBlobContainer } from '@/components/ui/FloatingBlob';
import { LiquidGlassCard } from '@/components/ui/LiquidGlassCard';
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
      <DialogContent className="max-w-2xl p-0 overflow-hidden bg-transparent border-none">
        <FloatingBlobContainer>
          <LiquidGlassCard variant="premium" className="p-8">
            {/* Step 1: Boas-vindas */}
            {currentStep === 1 && (
              <div className="space-y-6 text-center animate-fade-in">
                <div className="inline-block p-4 rounded-full bg-gradient-networking/20">
                  <Sparkles className="w-12 h-12 text-white" />
                </div>
                
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold shimmer-text">
                    Networking Inteligente 🤝
                  </h2>
                  <p className="text-lg text-white/70">
                    Vamos criar conexões estratégicas para sua empresa
                  </p>
                </div>

                <div className="flex justify-center pt-4">
                  <GlowButton onClick={handleNext} size="lg">
                    Começar
                  </GlowButton>
                </div>
              </div>
            )}

            {/* Step 2: Proposta de Valor */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-gradient-networking/20 float-gentle">
                    <Lightbulb className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Proposta de Valor</h3>
                    <p className="text-sm text-white/60">Passo 1 de 4</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-white/90">
                    Em uma frase, o que sua empresa faz de único?
                  </label>
                  <Textarea
                    value={formData.valueProposition}
                    onChange={(e) => setFormData(prev => ({ ...prev, valueProposition: e.target.value }))}
                    placeholder="Ex: Conectamos empreendedores através de IA para gerar negócios reais"
                    maxLength={200}
                    rows={4}
                    className="liquid-glass-card border-white/20 text-white placeholder:text-white/40"
                  />
                  <p className="text-xs text-white/50 text-right">
                    {formData.valueProposition.length}/200 caracteres
                  </p>
                </div>

                <div className="flex gap-3 justify-between">
                  <GlowButton variant="secondary" onClick={handleBack}>
                    Voltar
                  </GlowButton>
                  <GlowButton onClick={handleNext} disabled={!canProceed()}>
                    Próximo
                  </GlowButton>
                </div>
              </div>
            )}

            {/* Step 3: Tipo de Conexão */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-gradient-partnership/20 float-gentle">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Tipo de Conexão</h3>
                    <p className="text-sm text-white/60">Passo 2 de 4 • Múltipla escolha</p>
                  </div>
                </div>

                <p className="text-white/90">
                  Que tipo de conexão você busca?
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {connectionTypes.map((type) => (
                    <LiquidGlassCard
                      key={type.id}
                      hoverable
                      className={cn(
                        "p-4 cursor-pointer transition-all",
                        formData.lookingFor.includes(type.id) && `glow-border-${type.color}`
                      )}
                      onClick={() => toggleLookingFor(type.id)}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{type.icon}</span>
                        <span className="font-medium text-white">{type.label}</span>
                        {formData.lookingFor.includes(type.id) && (
                          <CheckCircle className="w-5 h-5 ml-auto text-white" />
                        )}
                      </div>
                    </LiquidGlassCard>
                  ))}
                </div>

                <div className="flex gap-3 justify-between">
                  <GlowButton variant="secondary" onClick={handleBack}>
                    Voltar
                  </GlowButton>
                  <GlowButton onClick={handleNext} disabled={!canProceed()}>
                    Próximo
                  </GlowButton>
                </div>
              </div>
            )}

            {/* Step 4: Desafio Atual */}
            {currentStep === 4 && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-gradient-commercial/20 float-gentle">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Desafio Atual</h3>
                    <p className="text-sm text-white/60">Passo 3 de 4</p>
                  </div>
                </div>

                <p className="text-white/90">
                  Qual seu principal desafio hoje?
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {challenges.map((challenge) => (
                    <LiquidGlassCard
                      key={challenge.id}
                      hoverable
                      className={cn(
                        "p-4 cursor-pointer transition-all",
                        formData.mainChallenge === challenge.id && "glow-border"
                      )}
                      onClick={() => setFormData(prev => ({ ...prev, mainChallenge: challenge.id }))}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{challenge.icon}</span>
                        <span className="font-medium text-white">{challenge.label}</span>
                        {formData.mainChallenge === challenge.id && (
                          <CheckCircle className="w-5 h-5 ml-auto text-white" />
                        )}
                      </div>
                    </LiquidGlassCard>
                  ))}
                </div>

                <div className="flex gap-3 justify-between">
                  <GlowButton variant="secondary" onClick={handleBack}>
                    Voltar
                  </GlowButton>
                  <GlowButton onClick={handleNext} disabled={!canProceed()}>
                    Próximo
                  </GlowButton>
                </div>
              </div>
            )}

            {/* Step 5: Palavras-chave */}
            {currentStep === 5 && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-gradient-knowledge/20 float-gentle">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Palavras-chave</h3>
                    <p className="text-sm text-white/60">Passo 4 de 4</p>
                  </div>
                </div>

                <p className="text-white/90">
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
                      className="flex-1 px-4 py-2 rounded-xl liquid-glass-card border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
                    />
                    <GlowButton 
                      onClick={addKeyword} 
                      disabled={!keywordInput.trim() || formData.keywords.length >= 3}
                    >
                      Adicionar
                    </GlowButton>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {formData.keywords.map((keyword, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="px-4 py-2 text-sm bg-gradient-networking text-white animate-scale-in cursor-pointer hover:opacity-80"
                        onClick={() => removeKeyword(keyword)}
                      >
                        {keyword} ✕
                      </Badge>
                    ))}
                  </div>

                  <p className="text-xs text-white/50">
                    {formData.keywords.length}/3 palavras-chave adicionadas
                  </p>
                </div>

                <div className="flex gap-3 justify-between">
                  <GlowButton variant="secondary" onClick={handleBack}>
                    Voltar
                  </GlowButton>
                  <GlowButton 
                    onClick={processWithAI} 
                    disabled={!canProceed()}
                  >
                    Analisar com IA
                  </GlowButton>
                </div>
              </div>
            )}

            {/* Step 6: Processando */}
            {currentStep === 6 && (
              <div className="space-y-6 text-center animate-fade-in py-8">
                <div className="inline-block p-6 rounded-full bg-gradient-aurora/30 pulse-glow">
                  <Sparkles className="w-16 h-16 text-white animate-spin" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold shimmer-text">
                    Analisando seu perfil com IA...
                  </h3>
                  <p className="text-white/70">
                    Isso pode levar alguns segundos
                  </p>
                </div>

                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-networking shimmer-bg animate-pulse"></div>
                </div>
              </div>
            )}

            {/* Step 7: Resultado */}
            {currentStep === 7 && (
              <div className="space-y-6 text-center animate-fade-in">
                <LiquidGlassCard variant="premium" className="p-6">
                  <div className="space-y-4">
                    <div className="inline-block p-4 rounded-full bg-gradient-knowledge/30">
                      <CheckCircle className="w-12 h-12 text-white" />
                    </div>
                    
                    <div>
                      <p className="text-white/70 mb-2">Seu Índice de Networking</p>
                      <h2 className="text-5xl font-bold gradient-text mb-2">
                        {networkingScore}/100
                      </h2>
                      <Badge className="bg-gradient-networking text-white">
                        Perfil Estrategista 🎉
                      </Badge>
                    </div>

                    <div className="pt-4 border-t border-white/20">
                      <p className="text-lg text-white/90">
                        Encontramos <span className="font-bold text-white">{matchesFound} conexões estratégicas</span> para você
                      </p>
                    </div>
                  </div>
                </LiquidGlassCard>

                <GlowButton 
                  onClick={() => {
                    onComplete();
                    onClose();
                  }}
                  size="lg"
                  className="w-full"
                >
                  Ver Minhas Conexões 🚀
                </GlowButton>
              </div>
            )}
          </LiquidGlassCard>
        </FloatingBlobContainer>
      </DialogContent>
    </Dialog>
  );
};
