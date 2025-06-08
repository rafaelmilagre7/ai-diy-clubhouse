
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
    <div className="space-y-6 animate-fade-in">
      <ImplementationTrailHeader 
        onRegenerate={regenerateTrail}
        isRegenerating={isRegenerating}
      />
      <ImplementationTrailContent trail={trail} />
    </div>
  );
};

export default ImplementationTrail;
