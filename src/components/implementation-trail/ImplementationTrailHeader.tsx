import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
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
  const {
    profile
  } = useAuth();
  return <div className="relative overflow-hidden mb-8">
      <Card className="relative border bg-card">
        <CardContent className="relative p-8">
          {/* Header Principal com avatar */}
          <div className="flex items-start gap-6 mb-8">
            <div className="relative">
              {/* User avatar */}
              {profile?.avatar_url ? <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary/20 shadow-lg">
                  <img src={profile.avatar_url} alt={profile.name || 'User'} className="w-full h-full object-cover" />
                </div> : <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 border-2 border-primary/20 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">
                    {profile?.name?.charAt(0) || 'U'}
                  </span>
                </div>}
              
              {/* Status indicator */}
              <div className="absolute -bottom-1 -right-1">
                
              </div>
            </div>
            
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2 text-foreground">
                Trilha IA Personalizada
              </h1>
              
              <p className="text-lg text-muted-foreground mb-4">
                Olá <span className="font-semibold text-primary">{profile?.name || 'Membro'}</span>! 
                <br />
                <span className="text-base">Sua jornada inteligente criada especialmente para você.</span>
              </p>
              
              {/* Trust indicators */}
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full border border-primary/20">
                  <Star className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">
                    Análise Avançada de IA
                  </span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary/10 rounded-full border border-secondary/20">
                  <Target className="h-4 w-4 text-secondary" />
                  <span className="text-sm font-medium text-foreground">
                    100% Personalizada
                  </span>
                </div>
                <Button 
                  onClick={onRegenerate}
                  disabled={isRegenerating}
                  variant="outline"
                  size="sm"
                  className="gap-2 border-primary/20 text-primary hover:bg-primary/10"
                >
                  <RefreshCw className={`h-4 w-4 ${isRegenerating ? 'animate-spin' : ''}`} />
                  {isRegenerating ? 'Gerando...' : 'Gerar uma nova trilha com IA'}
                </Button>
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
                  <TrendingUp className="h-6 w-6 text-revenue group-hover:rotate-12 transition-transform duration-300" />
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

        </CardContent>
      </Card>
    </div>;
};