
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Rocket, CheckCircle } from 'lucide-react';
import { useOnboardingStatus } from '@/hooks/onboarding/useOnboardingStatus';
import { useOnboardingData } from '@/hooks/onboarding/useOnboardingData';
import { toast } from 'sonner';

/**
 * Componente para sugerir onboarding quando apropriado
 * FASE 4: Sugestão inteligente e não invasiva
 */
export const OnboardingSuggestion: React.FC = () => {
  const navigate = useNavigate();
  const { isSuggested, stats, userName } = useOnboardingStatus();
  const { skipOnboardingData, isSaving } = useOnboardingData();

  // Não mostrar se não é sugerido
  if (!isSuggested) {
    return null;
  }

  const handleStartOnboarding = () => {
    navigate('/onboarding');
  };

  const handleSkip = async () => {
    try {
      const success = await skipOnboardingData();
      if (success) {
        toast.success('Configuração inicial dispensada. Você pode configurar depois no seu perfil.');
      }
    } catch (error) {
      console.error('Erro ao pular onboarding:', error);
      toast.error('Erro ao processar. Tente novamente.');
    }
  };

  return (
    <Card className="border-viverblue/30 bg-gradient-to-r from-viverblue/5 to-purple-500/5 mb-6">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-viverblue/20 rounded-lg flex items-center justify-center">
              <Rocket className="w-5 h-5 text-viverblue" />
            </div>
            <div>
              <CardTitle className="text-lg text-viverblue">
                Personalizar sua experiência
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs bg-viverblue/10 text-viverblue border-viverblue/30">
                  Recomendado
                </Badge>
                <span className="text-xs text-gray-500">
                  {stats?.accountAgeDays} dias na plataforma
                </span>
              </div>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSkip}
            disabled={isSaving}
            className="h-6 w-6 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Olá {userName}! Que tal personalizar sua experiência na plataforma? 
            Um setup rápido de 2-3 minutos pode ajudar a mostrar conteúdo mais relevante para você.
          </p>
          
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Setup opcional e rápido</span>
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Personalização inteligente</span>
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Pode ser alterado depois</span>
          </div>
          
          <div className="flex gap-3">
            <Button 
              onClick={handleStartOnboarding}
              className="bg-viverblue hover:bg-viverblue/90 text-white"
              disabled={isSaving}
            >
              <Rocket className="w-4 h-4 mr-2" />
              Personalizar Agora (2 min)
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleSkip}
              disabled={isSaving}
              className="text-gray-600 hover:text-gray-800"
            >
              {isSaving ? 'Processando...' : 'Agora Não'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
