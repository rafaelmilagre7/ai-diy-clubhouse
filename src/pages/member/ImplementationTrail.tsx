
import React from 'react';
import { useAuth } from '@/contexts/auth';
import { useImplementationTrail } from '@/hooks/useImplementationTrail';
import { TrailGenerationLoader } from '@/components/implementation-trail/TrailGenerationLoader';
import { ImplementationTrailHeader } from '@/components/implementation-trail/ImplementationTrailHeader';
import { ImplementationTrailContent } from '@/components/implementation-trail/ImplementationTrailContent';
import { TrailErrorBoundary } from '@/components/implementation-trail/ErrorBoundary';
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-surface-elevated relative overflow-hidden">
      {/* Aurora background effects - usando cores do design system */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-blob-lg h-blob-lg bg-gradient-aurora-subtle rounded-full blur-3xl animate-pulse opacity-60" />
        <div className="absolute bottom-1/4 right-1/4 w-blob-md h-blob-md bg-gradient-operational-subtle rounded-full blur-3xl animate-pulse animation-delay-2000 opacity-50" />
        <div className="absolute top-1/2 right-1/3 w-blob-sm h-blob-sm bg-gradient-strategy-subtle rounded-full blur-3xl animate-pulse animation-delay-4000 opacity-40" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 space-y-8 animate-fade-in container mx-auto px-4 py-8">
        <TrailErrorBoundary>
          <ImplementationTrailHeader 
            onRegenerate={regenerateTrail}
            isRegenerating={isRegenerating}
          />
          {/* 🔑 AJUSTE FINAL 3: Force remount quando trail mudar */}
          <ImplementationTrailContent 
            key={trail.generated_at} 
            trail={trail} 
          />
        </TrailErrorBoundary>
      </div>
    </div>
  );
};

export default ImplementationTrail;
