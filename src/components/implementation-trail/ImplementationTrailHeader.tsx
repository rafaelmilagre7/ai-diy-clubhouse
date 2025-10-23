import React from 'react';
import { Button } from '@/components/ui/button';
import { Brain, TrendingUp, Target, Star, Award, Zap, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/auth';

interface ImplementationTrailHeaderProps {
  onRegenerate?: () => void;
  isRegenerating?: boolean;
}

export const ImplementationTrailHeader = ({
  onRegenerate,
  isRegenerating
}: ImplementationTrailHeaderProps) => {
  const { profile } = useAuth();

  return (
    <div className="relative overflow-hidden mb-8 rounded-3xl border border-border/50 bg-gradient-to-br from-card/80 to-surface-elevated/80 backdrop-blur-xl shadow-2xl">
      {/* Aurora Background Effects */}
      <div className="absolute inset-0 bg-gradient-aurora-subtle opacity-20 pointer-events-none">
        <div className="absolute top-0 left-0 w-72 h-72 bg-aurora-primary/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 right-0 w-64 h-64 bg-operational/25 rounded-full blur-3xl animate-pulse animation-delay-2000" />
        <div className="absolute bottom-0 left-1/3 w-56 h-56 bg-revenue/20 rounded-full blur-3xl animate-pulse animation-delay-4000" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 p-8 lg:p-12">
        {/* Header Principal */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8 mb-12">
          {/* Left Side - Avatar & Main Info */}
          <div className="flex items-center gap-6">
            <div className="relative">
              {/* User avatar with glow */}
              {profile?.avatar_url ? (
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-aurora-primary/40 shadow-xl ring-4 ring-aurora-primary/20">
                  <img 
                    src={profile.avatar_url} 
                    alt={profile.name || 'User'} 
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-aurora-primary/40 to-operational/30 border-2 border-aurora-primary/40 flex items-center justify-center shadow-xl ring-4 ring-aurora-primary/20">
                  <span className="text-2xl font-bold text-primary-foreground drop-shadow-lg">
                    {profile?.name?.charAt(0) || 'U'}
                  </span>
                </div>
              )}
              
              {/* AI Status Indicator */}
              <div className="absolute -bottom-2 -right-2 p-2 bg-gradient-aurora rounded-full shadow-lg border border-aurora-primary/50">
                <Brain className="h-4 w-4 text-primary-foreground animate-pulse" />
              </div>
            </div>
            
            <div>
              <h2 className="text-lg font-medium text-muted-foreground mb-1">
                {profile?.name || 'Membro'}
              </h2>
              <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-aurora-primary via-operational to-revenue bg-clip-text text-transparent leading-tight">
                Trilha IA Personalizada
              </h1>
            </div>
          </div>

          {/* Right Side - CTA Button */}
          <div className="lg:ml-auto">
            <Button 
              onClick={onRegenerate}
              disabled={isRegenerating}
              size="lg"
              variant="aurora-primary"
              className="relative shadow-aurora hover:shadow-aurora-strong transition-all duration-500 hover:scale-105 group overflow-hidden"
            >
              {/* Button glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary-foreground/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative flex items-center gap-3">
                <RefreshCw className={`h-5 w-5 ${isRegenerating ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                <span className="font-semibold">
                  {isRegenerating ? 'Gerando nova trilha...' : 'Gerar nova trilha com IA'}
                </span>
                <Zap className="h-4 w-4 opacity-75 group-hover:opacity-100" />
              </div>
            </Button>
          </div>
        </div>

        {/* Subtitle & Trust Indicators */}
        <div className="mb-12">
          <p className="text-xl text-muted-foreground mb-6 max-w-2xl">
            Olá <span className="font-semibold bg-gradient-to-r from-aurora-primary to-operational bg-clip-text text-transparent">{profile?.name || 'Membro'}</span>! 
            Sua jornada inteligente criada especialmente para você.
          </p>
          
          {/* Trust badges */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-3 px-5 py-3 bg-aurora-primary/10 rounded-full border border-aurora-primary/30 backdrop-blur-sm hover:bg-aurora-primary/20 transition-all duration-300 shadow-md">
              <Star className="h-5 w-5 text-aurora-primary" fill="currentColor" />
              <span className="text-sm font-semibold text-foreground">
                Análise Avançada de IA
              </span>
            </div>
            <div className="flex items-center gap-3 px-5 py-3 bg-operational/10 rounded-full border border-operational/30 backdrop-blur-sm hover:bg-operational/20 transition-all duration-300 shadow-md">
              <Target className="h-5 w-5 text-operational" />
              <span className="text-sm font-semibold text-foreground">
                100% Personalizada
              </span>
            </div>
          </div>
        </div>

        {/* Stats Grid - Floating Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Soluções Recomendadas */}
          <div className="group relative">
            {/* Card Background with Aurora Effect */}
            <div className="absolute inset-0 bg-gradient-aurora-subtle rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-60" />
            
            <div className="relative p-6 bg-card/90 backdrop-blur-xl rounded-2xl border border-border/50 hover:border-aurora-primary/50 transition-all duration-500 hover:scale-105 shadow-lg hover:shadow-xl hover:shadow-aurora-primary/10">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-gradient-aurora rounded-xl shadow-md group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                  <Target className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <div className="text-3xl font-bold bg-gradient-aurora bg-clip-text text-transparent">
                    6
                  </div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Soluções Recomendadas
                  </div>
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="h-1 bg-aurora-primary/20 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-aurora w-0 group-hover:w-full transition-all duration-1000 ease-out" />
              </div>
            </div>
          </div>
          
          {/* Aulas Prioritárias */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-operational-subtle rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-60" />
            
            <div className="relative p-6 bg-card/90 backdrop-blur-xl rounded-2xl border border-border/50 hover:border-operational/50 transition-all duration-500 hover:scale-105 shadow-lg hover:shadow-xl hover:shadow-operational/10">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-gradient-operational rounded-xl shadow-md group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                  <TrendingUp className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <div className="text-3xl font-bold bg-gradient-operational bg-clip-text text-transparent">
                    3
                  </div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Aulas Prioritárias
                  </div>
                </div>
              </div>
              
              <div className="h-1 bg-operational/20 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-operational w-0 group-hover:w-full transition-all duration-1000 ease-out animation-delay-500" />
              </div>
            </div>
          </div>
          
          {/* Compatibilidade IA */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-revenue-subtle rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-60" />
            
            <div className="relative p-6 bg-card/90 backdrop-blur-xl rounded-2xl border border-border/50 hover:border-revenue/50 transition-all duration-500 hover:scale-105 shadow-lg hover:shadow-xl hover:shadow-revenue/10">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-gradient-revenue rounded-xl shadow-md group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                  <Brain className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <div className="text-3xl font-bold bg-gradient-revenue bg-clip-text text-transparent">
                    94%
                  </div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Compatibilidade IA
                  </div>
                </div>
              </div>
              
              <div className="h-1 bg-revenue/20 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-revenue w-0 group-hover:w-trail-progress transition-all duration-slowest ease-out animation-delay-1000" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};