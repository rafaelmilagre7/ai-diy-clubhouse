import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const OnboardingBanner: React.FC = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showBanner, setShowBanner] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isLegacyUser, setIsLegacyUser] = useState(false);

  useEffect(() => {
    checkIfShouldShowBanner();
  }, [user, profile]);

  const checkIfShouldShowBanner = async () => {
    if (!user || !profile) return;

    // Verificar se banner foi dismissado
    const dismissed = localStorage.getItem(`onboarding-banner-dismissed-${user.id}`);
    if (dismissed) {
      setIsDismissed(true);
      return;
    }

    // Verificar se usuário completou onboarding
    if (profile.onboarding_completed) {
      return;
    }

    // Verificar se é usuário legacy (criado antes da correção + tem dados de onboarding)
    try {
      const { data: onboardingData, error } = await supabase
        .from('onboarding_final')
        .select('user_id, created_at, current_step, completed_steps, is_completed')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.log('Usuário não tem onboarding - não é legacy');
        return;
      }

      // Usuário é legacy se:
      // 1. Tem registro de onboarding
      // 2. Não completou ainda (is_completed = false)
      // 3. Tem alguns passos feitos (completed_steps não vazio) OU foi criado antes de hoje
      const isLegacy = !onboardingData.is_completed && (
        (onboardingData.completed_steps && onboardingData.completed_steps.length > 0) ||
        new Date(onboardingData.created_at) < new Date('2025-07-23')
      );

      if (isLegacy) {
        setIsLegacyUser(true);
        setShowBanner(true);
        console.log('🎯 [BANNER] Usuário legacy detectado - mostrando banner de onboarding');
      }
    } catch (error) {
      console.error('Erro ao verificar status legacy:', error);
    }
  };

  const handleStartOnboarding = async () => {
    console.log('🎯 [BANNER] Botão clicado - iniciando onboarding');
    
    // Buscar current_step atual do usuário para redirecionar corretamente
    try {
      const { data: onboardingData, error } = await supabase
        .from('onboarding_final')
        .select('current_step, completed_steps')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Erro ao buscar current_step:', error);
        // Fallback para o início se houver erro
        navigate('/onboarding');
        return;
      }

      // Calcular step correto baseado nos completed_steps
      const targetStep = onboardingData.completed_steps && onboardingData.completed_steps.length > 0 
        ? Math.max(...onboardingData.completed_steps) + 1 
        : 1;
      
      // Garantir que não ultrapasse o limite
      const finalStep = Math.min(targetStep, 6);
      
      console.log('🎯 [BANNER] Redirecionando para step:', finalStep);
      
      toast({
        title: "Continuando de onde parou...",
        description: `Redirecionando para a etapa ${finalStep}`,
      });
      
      // Redirecionar para o step correto com parâmetro de query
      navigate(`/onboarding?step=${finalStep}`);
    } catch (error) {
      console.error('Erro ao determinar step:', error);
      navigate('/onboarding');
    }
  };

  const handleDismiss = () => {
    localStorage.setItem(`onboarding-banner-dismissed-${user?.id}`, 'true');
    setIsDismissed(true);
    setShowBanner(false);
    
    toast({
      title: "Banner ocultado",
      description: "Você pode acessar o onboarding pelo menu quando quiser!",
    });
  };

  if (!showBanner || isDismissed || !isLegacyUser) {
    return null;
  }

  return (
    <div className="relative bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-lg p-4 mb-6 overflow-hidden z-10 pointer-events-auto">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDEyNywgMTI3LCAxMjcsIDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30 pointer-events-none" />
      
      {/* Dismiss Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 h-8 w-8 text-muted-foreground hover:text-foreground"
        onClick={handleDismiss}
      >
        <X className="h-4 w-4" />
      </Button>

      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground mb-1">
            ✨ Personalize sua experiência!
          </h3>
          <p className="text-muted-foreground mb-3 text-sm leading-relaxed">
            Olá, <span className="font-medium text-foreground">{profile?.name}</span>! 
            Notamos que você já faz parte da nossa comunidade. 
            Que tal completar seu perfil para receber conteúdos e ferramentas personalizadas? 
            <span className="font-medium text-primary"> Leva apenas 3 minutos!</span>
          </p>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <Button 
              onClick={handleStartOnboarding}
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm relative z-20 cursor-pointer"
              size="sm"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Personalizar agora
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleDismiss}
              className="text-muted-foreground hover:text-foreground"
            >
              Talvez mais tarde
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom Accent */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/50 to-transparent" />
    </div>
  );
};