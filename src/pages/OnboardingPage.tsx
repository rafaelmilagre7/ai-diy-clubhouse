
import React from 'react';
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';
import { OnboardingLoader } from '@/components/onboarding/components/OnboardingLoader';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home, RefreshCw } from 'lucide-react';
import { logger } from '@/utils/logger';

// Componente de fallback específico para o onboarding
const OnboardingErrorFallback = ({ error, onRetry, onGoHome }: any) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Problema no Onboarding</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            Encontramos um problema durante o processo de onboarding. Você pode tentar novamente ou fazer login.
          </p>
          
          <div className="flex gap-3 justify-center">
            <Button onClick={onRetry} className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Tentar novamente
            </Button>
            
            <Button variant="outline" onClick={() => window.location.href = '/login'} className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              Fazer Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const OnboardingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <OnboardingLoader>
        <ErrorBoundary
          fallback={OnboardingErrorFallback}
          maxRetries={2}
          showDetails={false}
          resetOnLocationChange={true}
          onError={(error, errorInfo) => {
            logger.error('[OnboardingPage] Erro capturado pelo ErrorBoundary', {
              error: error.message,
              componentStack: errorInfo.componentStack,
              component: 'OnboardingPage'
            });
          }}
        >
          <OnboardingWizard />
        </ErrorBoundary>
      </OnboardingLoader>
    </div>
  );
};

export default OnboardingPage;
