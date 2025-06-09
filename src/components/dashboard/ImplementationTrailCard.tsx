
import { FC, memo } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Route, ArrowRight, Sparkles, Target, TrendingUp, Clock, Star, Zap, Trophy, Users, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

export const ImplementationTrailCard: FC = memo(() => {
  const currentProgress = 65; // Mock progress - em um app real viria do backend
  const currentStep = "Automação de Vendas";
  const nextStep = "Analytics Avançado";
  const estimatedTime = "2-3 semanas";
  const totalSteps = 8;
  const completedSteps = 5;

  return (
    <Card 
      variant="elevated" 
      className="overflow-hidden bg-gradient-to-br from-primary/5 via-surface to-accent/5 border-primary/20 hover:border-primary/40 transition-all duration-500 hover:shadow-glow-primary group relative"
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full -translate-y-16 translate-x-16 blur-2xl opacity-50 group-hover:opacity-70 transition-opacity duration-500" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-accent/10 to-primary/10 rounded-full translate-y-12 -translate-x-12 blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500" />
      
      <CardHeader className="pb-4 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-primary to-accent rounded-2xl shadow-lg group-hover:shadow-xl transition-shadow duration-300">
              <Route className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <Text variant="subsection" textColor="primary" className="font-bold">
                  Sua Trilha de Implementação
                </Text>
                <Badge variant="accent" size="sm" className="shadow-sm">
                  <Sparkles className="h-3 w-3 mr-1" />
                  IA Personalizada
                </Badge>
              </div>
              <Text variant="body" textColor="secondary">
                Jornada guiada baseada no seu perfil e objetivos de negócio
              </Text>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-3 text-primary">
            <div className="text-center">
              <div className="flex items-center gap-1 mb-1">
                <Trophy className="h-4 w-4 text-warning" />
                <Text variant="caption" textColor="primary" className="font-bold">
                  {currentProgress}%
                </Text>
              </div>
              <Text variant="caption" textColor="secondary" className="text-xs">
                Completo
              </Text>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 relative z-10">
        {/* Progress Section Melhorada */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              <Text variant="body" textColor="primary" className="font-semibold">
                Progresso Geral
              </Text>
            </div>
            <div className="flex items-center gap-2">
              <Text variant="body-small" textColor="primary" className="font-bold">
                {completedSteps}/{totalSteps} etapas
              </Text>
              <Badge variant="info" size="xs">
                {currentProgress}%
              </Badge>
            </div>
          </div>
          
          <Progress 
            value={currentProgress} 
            className="h-3 bg-surface-elevated border border-border-subtle shadow-inner"
          />
          
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-success rounded-full" />
              <Text variant="caption" textColor="success">
                Iniciante
              </Text>
            </div>
            <div className="flex items-center gap-1">
              <Text variant="caption" textColor="tertiary">
                Próximo nível:
              </Text>
              <Text variant="caption" textColor="primary" className="font-semibold">
                Avançado
              </Text>
            </div>
          </div>
        </div>

        {/* Current Step - Redesenhado */}
        <div className="p-4 bg-gradient-to-r from-warning/10 to-warning/5 rounded-xl border border-warning/20 relative overflow-hidden">
          <div className="absolute top-2 right-2">
            <div className="w-2 h-2 bg-warning rounded-full animate-pulse" />
          </div>
          
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-warning/20 rounded-lg">
                <Zap className="h-3 w-3 text-warning" />
              </div>
              <Text variant="body-small" textColor="secondary" className="font-medium">
                Etapa Atual
              </Text>
            </div>
            <Badge variant="warning" size="xs">
              Em Andamento
            </Badge>
          </div>
          
          <Text variant="body" textColor="primary" className="font-semibold mb-2">
            {currentStep}
          </Text>
          
          <div className="flex items-center gap-4 text-text-tertiary">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <Text variant="caption" textColor="tertiary">{estimatedTime}</Text>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              <Text variant="caption" textColor="tertiary">Alto impacto</Text>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <Text variant="caption" textColor="tertiary">Intermediário</Text>
            </div>
          </div>
        </div>

        {/* Next Step Preview - Premium */}
        <div className="p-4 bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 rounded-xl border border-primary/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-accent/20 to-primary/20 rounded-full -translate-y-8 translate-x-8 blur-xl" />
          
          <div className="flex items-center justify-between mb-3 relative z-10">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-primary/20 rounded-lg">
                <Star className="h-3 w-3 text-primary" />
              </div>
              <Text variant="body-small" textColor="secondary" className="font-medium">
                Próxima Etapa
              </Text>
            </div>
            <Badge variant="accent" size="xs">
              <Sparkles className="h-2 w-2 mr-1" />
              Recomendado
            </Badge>
          </div>
          
          <Text variant="body" textColor="primary" className="font-semibold mb-2 relative z-10">
            {nextStep}
          </Text>
          
          <Text variant="caption" textColor="tertiary" className="relative z-10">
            Melhore suas decisões com dados em tempo real e insights avançados
          </Text>
        </div>

        {/* Action Buttons - Redesenhados */}
        <div className="flex gap-3 pt-2">
          <Button 
            asChild 
            className="flex-1 group-hover:shadow-glow-primary transition-all duration-300 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg"
          >
            <Link to="/trilha-implementacao" className="flex items-center justify-center gap-2">
              <Route className="h-4 w-4" />
              Continuar Trilha
              <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            className="hover:bg-primary hover:text-white hover:border-primary transition-all duration-200 hover-scale px-3"
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Stats Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-border-subtle">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <Text variant="caption" textColor="primary" className="font-bold">
                {completedSteps}
              </Text>
              <Text variant="caption" textColor="tertiary" className="text-xs">
                Completas
              </Text>
            </div>
            <div className="text-center">
              <Text variant="caption" textColor="primary" className="font-bold">
                {totalSteps - completedSteps}
              </Text>
              <Text variant="caption" textColor="tertiary" className="text-xs">
                Restantes
              </Text>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-accent" />
            <Text variant="caption" textColor="accent" className="font-medium">
              Trilha Inteligente
            </Text>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

ImplementationTrailCard.displayName = 'ImplementationTrailCard';
