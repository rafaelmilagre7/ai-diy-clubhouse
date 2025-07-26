
import React from 'react';
import { useAuth } from '@/contexts/auth';
import { useImplementationTrail } from '@/hooks/useImplementationTrail';
import { TrailGenerationLoader } from '@/components/implementation-trail/TrailGenerationLoader';
import { ImplementationTrailHeader } from '@/components/implementation-trail/ImplementationTrailHeader';
import { ImplementationTrailContent } from '@/components/implementation-trail/ImplementationTrailContent';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

const ImplementationTrail = () => {
  const { user } = useAuth();
  const { 
    trail, 
    isLoading, 
    error, 
    regenerateTrail, 
    isRegenerating, 
    isFirstTimeGeneration 
  } = useImplementationTrail();

  // Mostrar loader especial para primeira geração
  if (isLoading && isFirstTimeGeneration) {
    return <TrailGenerationLoader message="Criando sua trilha personalizada com IA..." />;
  }

  // Mostrar loader normal para outras operações
  if (isLoading) {
    return <TrailGenerationLoader message="Carregando sua trilha..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-semibold text-high-contrast mb-4">
            Ops! Algo deu errado
          </h2>
          <p className="text-medium-contrast mb-6">{error}</p>
          <Button onClick={regenerateTrail} disabled={isRegenerating}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isRegenerating ? 'animate-spin' : ''}`} />
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  if (!trail) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-semibold text-high-contrast mb-4">
            Trilha não encontrada
          </h2>
          <p className="text-medium-contrast mb-6">
            Vamos criar sua trilha personalizada baseada no seu perfil.
          </p>
          <Button onClick={regenerateTrail} disabled={isRegenerating}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isRegenerating ? 'animate-spin' : ''}`} />
            Gerar Trilha
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 relative overflow-hidden">
      {/* Aurora background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-viverblue/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-operational/10 rounded-full blur-3xl animate-pulse animation-delay-2000" />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-revenue/10 rounded-full blur-3xl animate-pulse animation-delay-4000" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 space-y-8 animate-fade-in container mx-auto px-4 py-8">
        <ImplementationTrailHeader 
          onRegenerate={regenerateTrail}
          isRegenerating={isRegenerating}
        />
        <ImplementationTrailContent trail={trail} />
      </div>
    </div>
  );
};

export default ImplementationTrail;
