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
    <div className="relative overflow-hidden mb-8">
      {/* Aurora Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-viverblue/5 via-operational/3 to-revenue/5 backdrop-blur-3xl">
        <div className="absolute top-0 left-0 w-72 h-72 bg-viverblue/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 right-0 w-64 h-64 bg-operational/15 rounded-full blur-3xl animate-pulse animation-delay-2000" />
        <div className="absolute bottom-0 left-1/3 w-56 h-56 bg-revenue/15 rounded-full blur-3xl animate-pulse animation-delay-4000" />
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
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-viverblue/30 shadow-2xl shadow-viverblue/20 ring-4 ring-viverblue/10">
                  <img 
                    src={profile.avatar_url} 
                    alt={profile.name || 'User'} 
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-viverblue/30 to-operational/20 border-2 border-viverblue/30 flex items-center justify-center shadow-2xl shadow-viverblue/20 ring-4 ring-viverblue/10">
                  <span className="text-2xl font-bold text-white drop-shadow-lg">
                    {profile?.name?.charAt(0) || 'U'}
                  </span>
                </div>
              )}
              
              {/* AI Status Indicator */}
              <div className="absolute -bottom-2 -right-2 p-2 bg-gradient-to-r from-viverblue to-operational rounded-full shadow-lg">
                <Brain className="h-4 w-4 text-white animate-pulse" />
              </div>
            </div>
            
            <div>
              <h2 className="text-lg font-medium text-muted-foreground mb-1">
                {profile?.name || 'Membro'}
              </h2>
              <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-viverblue via-operational to-revenue bg-clip-text text-transparent leading-tight">
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
              className="relative bg-gradient-to-r from-viverblue to-operational hover:from-viverblue/90 hover:to-operational/90 text-white border-0 shadow-xl shadow-viverblue/25 hover:shadow-2xl hover:shadow-viverblue/40 transition-all duration-500 hover:scale-105 group overflow-hidden"
            >
              {/* Button glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
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
            Olá <span className="font-semibold bg-gradient-to-r from-viverblue to-operational bg-clip-text text-transparent">{profile?.name || 'Membro'}</span>! 
            Sua jornada inteligente criada especialmente para você.
          </p>
          
          {/* Trust badges */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-viverblue/10 to-viverblue/5 rounded-full border border-viverblue/20 backdrop-blur-sm hover:bg-viverblue/15 transition-all duration-300">
              <Star className="h-5 w-5 text-viverblue" fill="currentColor" />
              <span className="text-sm font-semibold text-foreground">
                Análise Avançada de IA
              </span>
            </div>
            <div className="flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-operational/10 to-operational/5 rounded-full border border-operational/20 backdrop-blur-sm hover:bg-operational/15 transition-all duration-300">
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
            <div className="absolute inset-0 bg-gradient-to-br from-viverblue/20 via-viverblue/10 to-transparent rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500" />
            
            <div className="relative p-6 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl border border-white/20 hover:border-viverblue/30 transition-all duration-500 hover:scale-105 shadow-xl hover:shadow-2xl hover:shadow-viverblue/20">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-gradient-to-br from-viverblue to-viverblue/80 rounded-xl shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-viverblue to-viverblue/80 bg-clip-text text-transparent">
                    6
                  </div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Soluções Recomendadas
                  </div>
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="h-1 bg-viverblue/20 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-viverblue to-viverblue/60 w-0 group-hover:w-full transition-all duration-1000 ease-out" />
              </div>
            </div>
          </div>
          
          {/* Aulas Prioritárias */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-operational/20 via-operational/10 to-transparent rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500" />
            
            <div className="relative p-6 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl border border-white/20 hover:border-operational/30 transition-all duration-500 hover:scale-105 shadow-xl hover:shadow-2xl hover:shadow-operational/20">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-gradient-to-br from-operational to-operational/80 rounded-xl shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-operational to-operational/80 bg-clip-text text-transparent">
                    3
                  </div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Aulas Prioritárias
                  </div>
                </div>
              </div>
              
              <div className="h-1 bg-operational/20 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-operational to-operational/60 w-0 group-hover:w-full transition-all duration-1000 ease-out animation-delay-500" />
              </div>
            </div>
          </div>
          
          {/* Compatibilidade IA */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-revenue/20 via-revenue/10 to-transparent rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500" />
            
            <div className="relative p-6 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl border border-white/20 hover:border-revenue/30 transition-all duration-500 hover:scale-105 shadow-xl hover:shadow-2xl hover:shadow-revenue/20">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-gradient-to-br from-revenue to-revenue/80 rounded-xl shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-revenue to-revenue/80 bg-clip-text text-transparent">
                    94%
                  </div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Compatibilidade IA
                  </div>
                </div>
              </div>
              
              <div className="h-1 bg-revenue/20 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-revenue to-revenue/60 w-0 group-hover:w-[94%] transition-all duration-1000 ease-out animation-delay-1000" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};