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
      console.log('🎯 [BANNER] Sem user ou profile:', { hasUser: !!user, hasProfile: !!profile });
      setShowBanner(false);
      return;
    }

    console.log('🎯 [BANNER] Verificando se deve mostrar banner:', {
      userId: user.id.substring(0, 8) + '***',
      onboardingCompleted: profile.onboarding_completed,
      profileData: profile
    });

    // Verificar se banner foi dismissado
    const dismissed = localStorage.getItem(`onboarding-banner-dismissed-${user.id}`);
    if (dismissed) {
      console.log('🎯 [BANNER] Banner foi dismissado anteriormente');
      setIsDismissed(true);
      setShowBanner(false);
      return;
    }

    // CORREÇÃO: Verificar se onboarding está realmente incompleto
    // Só mostrar banner se onboarding_completed for explicitamente false
    if (profile.onboarding_completed === false) {
      console.log('🎯 [BANNER] Usuário sem onboarding concluído - mostrando banner');
      
      // Verificar se é usuário legado (tem dados mas onboarding incompleto)
      try {
        const { data: onboardingData } = await supabase
          .from('onboarding_final')
          .select('is_completed, current_step')
          .eq('user_id', user.id)
          .maybeSingle();

        if (onboardingData && onboardingData.current_step > 1) {
          console.log('🎯 [BANNER] Usuário legado detectado - dados existem mas onboarding incompleto');
          setIsLegacyUser(true);
        }
      } catch (error) {
        console.warn('🎯 [BANNER] Erro ao verificar dados de onboarding:', error);
      }

      setShowBanner(true);
      return;
    }

    // Se onboarding_completed é true ou null/undefined, não mostrar banner
    console.log('🎯 [BANNER] Onboarding completo ou indefinido - não mostrando banner');
    setShowBanner(false);
  };

  const handleStartOnboarding = async () => {
    console.log('🎯 [BANNER] Botão clicado - iniciando onboarding');
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