
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
    <div className="relative overflow-hidden mb-8">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-viverblue/20 via-operational/10 to-revenue/10 rounded-2xl blur-xl opacity-60" />
      
      <Card className="relative border-viverblue/30 bg-gradient-to-br from-background/95 to-background/80 backdrop-blur-md overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:20px_20px]" />
        
        <CardContent className="relative p-8">
          {/* Header Principal */}
          <div className="flex items-start gap-6 mb-8">
            <div className="relative">
              <div className="p-4 bg-viverblue/20 rounded-2xl border border-viverblue/30">
                <Brain className="h-10 w-10 text-viverblue" />
              </div>
              <div className="absolute -top-2 -right-2">
                <Sparkles className="h-6 w-6 text-yellow-400 animate-pulse" />
              </div>
            </div>
            
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-foreground mb-3 bg-gradient-to-r from-viverblue via-operational to-revenue bg-clip-text text-transparent">
                Trilha IA Personalizada
              </h1>
              <p className="text-xl text-muted-foreground mb-4">
                Olá <span className="font-semibold text-viverblue">{profile?.name || 'Membro'}</span>! 
                Sua jornada inteligente criada especialmente para você.
              </p>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                <span className="text-sm font-medium text-muted-foreground">
                  Baseada em análise avançada do seu perfil e objetivos
                </span>
              </div>
            </div>
          </div>

          {/* Stats Cards Redesenhadas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="group p-6 bg-gradient-to-br from-viverblue/10 to-viverblue/5 rounded-2xl border border-viverblue/20 hover:border-viverblue/40 transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-viverblue/20 rounded-xl group-hover:scale-110 transition-transform">
                  <Target className="h-6 w-6 text-viverblue" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-foreground">6</div>
                  <div className="text-sm text-muted-foreground font-medium">Soluções Recomendadas</div>
                </div>
              </div>
            </div>
            
            <div className="group p-6 bg-gradient-to-br from-operational/10 to-operational/5 rounded-2xl border border-operational/20 hover:border-operational/40 transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-operational/20 rounded-xl group-hover:scale-110 transition-transform">
                  <TrendingUp className="h-6 w-6 text-operational" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-foreground">3</div>
                  <div className="text-sm text-muted-foreground font-medium">Aulas Prioritárias</div>
                </div>
              </div>
            </div>
            
            <div className="group p-6 bg-gradient-to-br from-revenue/10 to-revenue/5 rounded-2xl border border-revenue/20 hover:border-revenue/40 transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-revenue/20 rounded-xl group-hover:scale-110 transition-transform">
                  <Sparkles className="h-6 w-6 text-revenue" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-foreground">94%</div>
                  <div className="text-sm text-muted-foreground font-medium">Compatibilidade IA</div>
                </div>
              </div>
            </div>
          </div>

          {/* Mensagem personalizada */}
          <div className="mt-6 p-4 bg-gradient-to-r from-viverblue/5 to-operational/5 rounded-xl border border-viverblue/20">
            <p className="text-sm text-muted-foreground text-center">
              🎯 Esta trilha foi gerada com IA avançada considerando seu perfil, experiência e objetivos específicos.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
