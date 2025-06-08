
import { FC, memo } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Route, ArrowRight, Sparkles, Target, TrendingUp, Clock } from "lucide-react";
import { Link } from "react-router-dom";

export const ImplementationTrailCard: FC = memo(() => {
  const currentProgress = 65; // Mock progress - em um app real viria do backend
  const currentStep = "Automação de Vendas";
  const nextStep = "Analytics Avançado";
  const estimatedTime = "2-3 semanas";

  return (
    <Card 
      variant="elevated" 
      className="overflow-hidden bg-gradient-to-br from-primary/5 via-surface to-accent/5 border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-glow-primary group"
    >
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-2xl">
              <Route className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <Text variant="subsection" textColor="primary" className="font-bold">
                  Sua Trilha de Implementação
                </Text>
                <Badge variant="accent" size="sm">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Personalizada
                </Badge>
              </div>
              <Text variant="body" textColor="secondary">
                Jornada guiada baseada no seu perfil de negócio
              </Text>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-2 text-primary">
            <Target className="h-5 w-5" />
            <Text variant="caption" textColor="secondary" className="font-medium">
              {currentProgress}% completo
            </Text>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Progress Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Text variant="body-small" textColor="secondary" className="font-medium">
              Progresso Geral
            </Text>
            <Text variant="body-small" textColor="primary" className="font-bold">
              {currentProgress}%
            </Text>
          </div>
          
          <Progress 
            value={currentProgress} 
            className="h-3 bg-surface-elevated"
          />
          
          <div className="flex items-center justify-between text-xs">
            <Text variant="caption" textColor="tertiary">
              Iniciante
            </Text>
            <Text variant="caption" textColor="tertiary">
              Especialista
            </Text>
          </div>
        </div>

        {/* Current Step */}
        <div className="p-4 bg-surface-elevated/50 rounded-xl border border-border-subtle">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-warning rounded-full animate-pulse"></div>
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
          </div>
        </div>

        {/* Next Step Preview */}
        <div className="p-4 bg-primary/5 rounded-xl border border-primary/20">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary/50 rounded-full"></div>
              <Text variant="body-small" textColor="secondary" className="font-medium">
                Próxima Etapa
              </Text>
            </div>
            <Badge variant="accent" size="xs">
              Recomendado
            </Badge>
          </div>
          
          <Text variant="body" textColor="primary" className="font-semibold mb-2">
            {nextStep}
          </Text>
          
          <Text variant="caption" textColor="tertiary">
            Melhore suas decisões com dados em tempo real
          </Text>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <Button asChild className="flex-1 group-hover:shadow-glow-primary transition-all">
            <Link to="/trilha-implementacao">
              <Route className="h-4 w-4 mr-2" />
              Continuar Trilha
            </Link>
          </Button>
          
          <Button variant="outline" size="icon" className="hover:bg-primary hover:text-white transition-colors">
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});

ImplementationTrailCard.displayName = 'ImplementationTrailCard';
