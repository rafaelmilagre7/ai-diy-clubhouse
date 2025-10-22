import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, CheckCircle, ArrowRight } from 'lucide-react';
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
    if (!user || !profile) {
      setShowBanner(false);
      return;
    }

    // Verificar se banner foi dismissado
    const dismissed = localStorage.getItem(`onboarding-banner-dismissed-${user.id}`);
    if (dismissed) {
      setIsDismissed(true);
      setShowBanner(false);
      return;
    }

    // LÓGICA ROBUSTA: Verificar onboarding completo no PERFIL primeiro
    if (profile.onboarding_completed === true) {
      setShowBanner(false);
      return;
    }

    // DUPLA CHECAGEM: Verificar também no banco de dados onboarding_final
    try {
      const { data: onboardingData } = await supabase
        .from('onboarding_final')
        .select('is_completed, completed_at, completed_steps')
        .eq('user_id', user.id)
        .maybeSingle();

      // MÚLTIPLAS CONDIÇÕES para considerar onboarding completo:
      const isOnboardingComplete = (
        // Condição 1: Marcado como completo no banco
        (onboardingData?.is_completed === true && onboardingData?.completed_at) ||
        // Condição 2: Tem todos os steps incluindo o 6
        (onboardingData?.completed_steps && onboardingData.completed_steps.includes(6) && onboardingData.completed_steps.length >= 6)
      );

      if (isOnboardingComplete) {
        setShowBanner(false);
        return;
      }

    } catch (error) {
      // Em caso de erro, assumir que está incompleto para mostrar banner
    }

    // Mostrar banner apenas se onboarding NÃO estiver completo
    setIsLegacyUser(true);
    setShowBanner(true);
  };

  const handleStartOnboarding = async () => {
    navigate('/onboarding');
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

  if (!showBanner || isDismissed) {
    return null;
  }

  return (
    <div className="relative bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-lg p-4 mb-6 overflow-hidden z-10 pointer-events-auto">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />
      
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
            <CheckCircle className="w-6 h-6 text-primary" />
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
              <CheckCircle className="w-4 h-4 mr-2" />
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