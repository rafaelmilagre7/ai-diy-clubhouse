
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Brain, Sparkles, TrendingUp, Target, Star } from 'lucide-react';
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
    <div className="relative overflow-hidden mb-8 group">
      {/* Animated Background Layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-viverblue/20 via-operational/15 to-revenue/15 rounded-2xl blur-xl opacity-60 animate-pulse" />
      <div className="absolute inset-0 bg-gradient-to-r from-viverblue/5 via-transparent to-operational/5 rounded-2xl blur-2xl animate-blob" />
      <div className="absolute inset-0 bg-gradient-to-l from-revenue/5 via-transparent to-viverblue/5 rounded-2xl blur-2xl animate-blob animation-delay-2000" />
      
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden rounded-2xl">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-viverblue rounded-full animate-pulse opacity-30" />
        <div className="absolute top-3/4 right-1/3 w-1 h-1 bg-operational rounded-full animate-pulse animation-delay-1000 opacity-40" />
        <div className="absolute bottom-1/3 left-2/3 w-1.5 h-1.5 bg-revenue rounded-full animate-pulse animation-delay-2000 opacity-35" />
        <div className="absolute top-1/2 right-1/4 w-1 h-1 bg-viverblue rounded-full animate-pulse animation-delay-4000 opacity-30" />
      </div>
      
      <Card className="relative border border-viverblue/30 bg-gradient-to-br from-card/95 to-muted/95 backdrop-blur-xl overflow-hidden shadow-2xl shadow-viverblue/10">
        {/* Animated grid pattern */}
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:20px_20px] animate-pulse" />
        
        {/* Shine effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-viverblue/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1500 ease-out" />
        
        <CardContent className="relative p-8 z-10">
          {/* Header Principal com avatar e efeitos */}
          <div className="flex items-start gap-6 mb-8">
            <div className="relative group">
              {/* Main AI icon container */}
              <div className="p-4 bg-gradient-to-br from-viverblue/20 to-viverblue/10 rounded-2xl border border-viverblue/30 group-hover:scale-110 transition-all duration-500 shadow-lg shadow-viverblue/20">
                <Brain className="h-10 w-10 text-viverblue group-hover:rotate-12 transition-transform duration-500" />
                
                {/* Pulsing glow ring */}
                <div className="absolute inset-0 rounded-2xl border-2 border-viverblue/20 animate-pulse" />
                <div className="absolute inset-0 rounded-2xl border border-viverblue/40 scale-110 animate-ping opacity-20" />
              </div>
              
              {/* Floating sparkles with different timings */}
              <div className="absolute -top-2 -right-2">
                <Sparkles className="h-6 w-6 text-yellow-400 animate-pulse group-hover:rotate-180 transition-transform duration-700" />
              </div>
              <div className="absolute -bottom-1 -left-1">
                <Sparkles className="h-4 w-4 text-operational animate-pulse animation-delay-1000 opacity-60" />
              </div>
              
              {/* User avatar integration */}
              {profile?.avatar_url && (
                <div className="absolute -bottom-2 -right-2">
                  <img 
                    src={profile.avatar_url} 
                    alt={profile.name || 'User'} 
                    className="w-8 h-8 rounded-full border-2 border-card shadow-lg"
                  />
                </div>
              )}
            </div>
            
            <div className="flex-1">
              {/* Animated title with typewriter effect inspiration */}
              <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-viverblue via-operational to-revenue bg-clip-text text-transparent hover:scale-105 transition-transform duration-300 cursor-default">
                Trilha IA Personalizada
                <span className="inline-block w-1 h-8 bg-viverblue ml-2 animate-pulse" />
              </h1>
              
              {/* Enhanced greeting with animation */}
              <p className="text-xl text-muted-foreground mb-4 group-hover:text-foreground transition-colors duration-300">
                Olá <span className="font-semibold text-viverblue hover:text-operational transition-colors duration-300">{profile?.name || 'Membro'}</span>! 
                <br />
                <span className="text-lg">Sua jornada inteligente criada especialmente para você.</span>
              </p>
              
              {/* Enhanced trust indicators */}
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-400/10 rounded-full border border-yellow-400/20">
                  <Star className="h-4 w-4 text-yellow-400 fill-current animate-pulse" />
                  <span className="text-sm font-medium text-muted-foreground">
                    Análise Avançada de IA
                  </span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-viverblue/10 rounded-full border border-viverblue/20">
                  <Target className="h-4 w-4 text-viverblue" />
                  <span className="text-sm font-medium text-muted-foreground">
                    100% Personalizada
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards Interativas com Micro-animações */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Soluções Recomendadas */}
            <div className="group p-6 bg-gradient-to-br from-viverblue/10 to-viverblue/5 rounded-2xl border border-viverblue/20 hover:border-viverblue/40 hover:shadow-xl hover:shadow-viverblue/10 transition-all duration-500 hover:scale-105 relative overflow-hidden">
              {/* Animated background */}
              <div className="absolute inset-0 bg-gradient-to-r from-viverblue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="flex items-center gap-4 relative z-10">
                <div className="p-3 bg-viverblue/20 rounded-xl group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 shadow-lg shadow-viverblue/20">
                  <Target className="h-6 w-6 text-viverblue" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-foreground group-hover:text-viverblue transition-colors duration-300">6</div>
                  <div className="text-sm text-muted-foreground font-medium group-hover:text-foreground transition-colors duration-300">Soluções Recomendadas</div>
                </div>
              </div>
              
              {/* Progress indicator */}
              <div className="absolute bottom-0 left-0 h-1 bg-viverblue/20 w-full">
                <div className="h-full bg-viverblue w-0 group-hover:w-full transition-all duration-1000 ease-out" />
              </div>
            </div>
            
            {/* Aulas Prioritárias */}
            <div className="group p-6 bg-gradient-to-br from-operational/10 to-operational/5 rounded-2xl border border-operational/20 hover:border-operational/40 hover:shadow-xl hover:shadow-operational/10 transition-all duration-500 hover:scale-105 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-operational/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="flex items-center gap-4 relative z-10">
                <div className="p-3 bg-operational/20 rounded-xl group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 shadow-lg shadow-operational/20">
                  <TrendingUp className="h-6 w-6 text-operational" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-foreground group-hover:text-operational transition-colors duration-300">3</div>
                  <div className="text-sm text-muted-foreground font-medium group-hover:text-foreground transition-colors duration-300">Aulas Prioritárias</div>
                </div>
              </div>
              
              <div className="absolute bottom-0 left-0 h-1 bg-operational/20 w-full">
                <div className="h-full bg-operational w-0 group-hover:w-full transition-all duration-1000 ease-out animation-delay-2000" />
              </div>
            </div>
            
            {/* Compatibilidade IA */}
            <div className="group p-6 bg-gradient-to-br from-revenue/10 to-revenue/5 rounded-2xl border border-revenue/20 hover:border-revenue/40 hover:shadow-xl hover:shadow-revenue/10 transition-all duration-500 hover:scale-105 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-revenue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="flex items-center gap-4 relative z-10">
                <div className="p-3 bg-revenue/20 rounded-xl group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 shadow-lg shadow-revenue/20">
                  <Sparkles className="h-6 w-6 text-revenue group-hover:animate-spin" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-foreground group-hover:text-revenue transition-colors duration-300">94%</div>
                  <div className="text-sm text-muted-foreground font-medium group-hover:text-foreground transition-colors duration-300">Compatibilidade IA</div>
                </div>
              </div>
              
              <div className="absolute bottom-0 left-0 h-1 bg-revenue/20 w-full">
                <div className="h-full bg-revenue w-0 group-hover:w-[94%] transition-all duration-1000 ease-out animation-delay-4000" />
              </div>
            </div>
          </div>

          {/* Call to Action Aprimorado */}
          <div className="mt-8 relative group">
            <div className="p-6 bg-gradient-to-r from-viverblue/10 via-operational/5 to-revenue/10 rounded-xl border border-viverblue/30 group-hover:border-viverblue/50 transition-all duration-500 relative overflow-hidden">
              {/* Animated background pattern */}
              <div className="absolute inset-0 bg-gradient-to-r from-viverblue/5 to-operational/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10 text-center">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-viverblue rounded-full animate-pulse" />
                    <div className="w-2 h-2 bg-operational rounded-full animate-pulse animation-delay-1000" />
                    <div className="w-2 h-2 bg-revenue rounded-full animate-pulse animation-delay-2000" />
                  </div>
                  <span className="text-lg font-semibold text-foreground">🎯 Trilha Inteligente Ativa</span>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-revenue rounded-full animate-pulse animation-delay-2000" />
                    <div className="w-2 h-2 bg-operational rounded-full animate-pulse animation-delay-1000" />
                    <div className="w-2 h-2 bg-viverblue rounded-full animate-pulse" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                  Esta trilha foi gerada com <span className="font-semibold text-viverblue">IA avançada</span> considerando seu perfil, experiência e objetivos específicos.
                  <br />
                  <span className="text-xs opacity-75">Última atualização: Agora • Próxima análise: Quando necessário</span>
                </p>
                
                {/* Regeneration button if provided */}
                {onRegenerate && (
                  <button
                    onClick={onRegenerate}
                    disabled={isRegenerating}
                    className="mt-4 px-4 py-2 bg-viverblue/20 hover:bg-viverblue/30 border border-viverblue/40 rounded-lg text-sm text-viverblue hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
                  >
                    {isRegenerating ? (
                      <span className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 animate-spin" />
                        Regenerando...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Brain className="h-4 w-4" />
                        Nova Análise IA
                      </span>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
