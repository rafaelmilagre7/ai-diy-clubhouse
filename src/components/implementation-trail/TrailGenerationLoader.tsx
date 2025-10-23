import React from 'react';
import { Bot, Brain, Target } from 'lucide-react';

interface TrailGenerationLoaderProps {
  message?: string;
}

export const TrailGenerationLoader: React.FC<TrailGenerationLoaderProps> = ({ 
  message = "Criando sua trilha personalizada com IA..." 
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-background via-background to-surface-elevated">
      {/* Background Aurora Effect */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-gradient-aurora-subtle opacity-40 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-operational-subtle opacity-40 rounded-full blur-3xl animate-pulse animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-revenue-subtle opacity-30 rounded-full blur-3xl animate-pulse animation-delay-4000" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center max-w-md mx-auto px-6">
        {/* Icon Container with Animation */}
        <div className="relative mb-8">
          <div className="w-24 h-24 mx-auto bg-card/80 backdrop-blur-xl rounded-3xl flex items-center justify-center border-2 border-aurora-primary/40 shadow-2xl shadow-aurora-primary/20">
            <Bot className="w-12 h-12 text-aurora-primary animate-pulse" />
          </div>
          
          {/* Floating Icons */}
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-operational rounded-xl flex items-center justify-center shadow-lg animate-float">
            <Brain className="w-4 h-4 text-primary-foreground" />
          </div>
          <div className="absolute -bottom-2 -left-2 w-8 h-8 bg-gradient-revenue rounded-xl flex items-center justify-center shadow-lg animate-float animation-delay-2000">
            <Brain className="w-4 h-4 text-primary-foreground" />
          </div>
          <div className="absolute top-1/2 -right-4 w-6 h-6 bg-gradient-aurora rounded-lg flex items-center justify-center shadow-lg animate-float animation-delay-4000">
            <Target className="w-3 h-3 text-primary-foreground" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold mb-3 bg-gradient-aurora bg-clip-text text-transparent">
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
              <div className="w-2 h-2 bg-aurora-primary rounded-full animate-pulse" />
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
          <div className="w-full bg-muted/30 rounded-full h-2 overflow-hidden backdrop-blur-sm">
            <div className="h-full bg-gradient-aurora rounded-full animate-pulse transition-all duration-1000" />
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 p-4 bg-card/60 backdrop-blur-md rounded-2xl border border-aurora-primary/30 shadow-lg">
          <p className="text-xs text-muted-foreground">
            ✨ Usando IA para criar uma trilha 100% personalizada baseada no seu perfil e objetivos
          </p>
        </div>
      </div>
    </div>
  );
};