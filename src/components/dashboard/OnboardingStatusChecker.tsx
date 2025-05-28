
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, RefreshCw, Settings, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/auth';
import { useOnboardingCompletion } from '@/hooks/onboarding/useOnboardingCompletion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export const OnboardingStatusChecker: React.FC = () => {
  const { user } = useAuth();
  const { checkOnboardingStatus, forceCompleteOnboarding, isCompleting } = useOnboardingCompletion();
  const navigate = useNavigate();
  const [status, setStatus] = useState<any>(null);
  const [isChecking, setIsChecking] = useState(true);

  const checkStatus = async () => {
    setIsChecking(true);
    const result = await checkOnboardingStatus();
    setStatus(result);
    setIsChecking(false);
  };

  useEffect(() => {
    checkStatus();
  }, [user?.id]);

  const handleForceComplete = async () => {
    const success = await forceCompleteOnboarding();
    if (success) {
      toast.success('Onboarding marcado como concluído!');
      await checkStatus(); // Recarregar status
    }
  };

  const handleGoToOnboarding = () => {
    navigate('/onboarding-new');
  };

  if (isChecking) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-6">
          <RefreshCw className="h-6 w-6 animate-spin text-viverblue mr-2" />
          <span className="text-gray-400">Verificando status do onboarding...</span>
        </CardContent>
      </Card>
    );
  }

  const isCompleted = status?.isCompleted || false;
  const source = status?.source || 'unknown';

  return (
    <Card className={`border-l-4 ${isCompleted ? 'border-l-green-500' : 'border-l-amber-500'}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isCompleted ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-amber-500" />
          )}
          Status do Onboarding
          <Badge variant={isCompleted ? 'default' : 'secondary'}>
            {isCompleted ? 'Completo' : 'Incompleto'}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="text-sm text-gray-400">
          <p><strong>Fonte:</strong> {source}</p>
          {status?.currentStep && (
            <p><strong>Etapa atual:</strong> {status.currentStep}</p>
          )}
        </div>

        {!isCompleted && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
            <p className="text-amber-400 text-sm mb-3">
              Seu onboarding não está marcado como concluído. Isso pode impedir o acesso a algumas funcionalidades.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                onClick={handleGoToOnboarding}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <Settings className="h-4 w-4 mr-2" />
                Ir para Onboarding
              </Button>
              
              <Button
                onClick={handleForceComplete}
                disabled={isCompleting}
                size="sm"
                className="flex-1 bg-viverblue hover:bg-viverblue/90"
              >
                {isCompleting ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                Marcar como Completo
              </Button>
            </div>
          </div>
        )}

        {isCompleted && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
            <p className="text-green-400 text-sm mb-2">
              ✅ Onboarding concluído com sucesso!
            </p>
            <Button
              onClick={() => navigate('/implementation-trail')}
              size="sm"
              className="bg-viverblue hover:bg-viverblue/90"
            >
              <ArrowRight className="h-4 w-4 mr-2" />
              Ver Trilha Personalizada
            </Button>
          </div>
        )}

        <Button
          onClick={checkStatus}
          variant="ghost"
          size="sm"
          className="w-full"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Verificar Novamente
        </Button>
      </CardContent>
    </Card>
  );
};
