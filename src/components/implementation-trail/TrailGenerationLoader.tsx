import React from 'react';
import { Bot, Sparkles, Brain, Target } from 'lucide-react';

interface TrailGenerationLoaderProps {
  message?: string;
}

export const TrailGenerationLoader: React.FC<TrailGenerationLoaderProps> = ({ 
  message = "Criando sua trilha personalizada com IA..." 
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background Aurora Effect */}
      <div className="absolute inset-0 w-full h-full">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-viverblue/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-operational/20 rounded-full blur-3xl animate-pulse animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-revenue/10 rounded-full blur-3xl animate-pulse animation-delay-4000" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center max-w-md mx-auto px-6">
        {/* Icon Container with Animation */}
        <div className="relative mb-8">
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-viverblue/20 to-operational/20 rounded-3xl flex items-center justify-center aurora-glass backdrop-blur-md border border-viverblue/30">
            <Bot className="w-12 h-12 text-viverblue animate-pulse" />
          </div>
          
          {/* Floating Icons */}
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-operational to-revenue rounded-xl flex items-center justify-center aurora-float">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="absolute -bottom-2 -left-2 w-8 h-8 bg-gradient-to-br from-revenue to-viverblue rounded-xl flex items-center justify-center aurora-float animation-delay-2000">
            <Brain className="w-4 h-4 text-white" />
          </div>
          <div className="absolute top-1/2 -right-4 w-6 h-6 bg-gradient-to-br from-viverblue to-operational rounded-lg flex items-center justify-center aurora-float animation-delay-4000">
            <Target className="w-3 h-3 text-white" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-foreground mb-3 aurora-text-gradient">
          IA Analisando seu Perfil
        </h2>
        
        {/* Message */}
        <p className="text-muted-foreground mb-8 leading-relaxed">
          {message}
        </p>

        {/* Progress Animation */}
        <div className="space-y-4">
          {/* Progress Steps */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 bg-viverblue rounded-full animate-pulse" />
              <span className="text-muted-foreground">Analisando dados do onboarding</span>
            </div>
            <div className="flex items-center gap-3 text-sm animation-delay-1000">
              <div className="w-2 h-2 bg-operational rounded-full animate-pulse animation-delay-1000" />
              <span className="text-muted-foreground">Identificando objetivos prioritários</span>
            </div>
            <div className="flex items-center gap-3 text-sm animation-delay-2000">
              <div className="w-2 h-2 bg-revenue rounded-full animate-pulse animation-delay-2000" />
              <span className="text-muted-foreground">Personalizando recomendações</span>
            </div>
            <div className="flex items-center gap-3 text-sm animation-delay-3000">
              <div className="w-2 h-2 bg-strategy rounded-full animate-pulse animation-delay-3000" />
              <span className="text-muted-foreground">Criando trilha inteligente</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-viverblue via-operational to-revenue rounded-full animate-pulse aurora-shimmer" />
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 p-4 aurora-glass rounded-2xl border border-viverblue/20">
          <p className="text-xs text-muted-foreground">
            ✨ Usando IA para criar uma trilha 100% personalizada baseada no seu perfil e objetivos
          </p>
        </div>
      </div>
    </div>
  );
};