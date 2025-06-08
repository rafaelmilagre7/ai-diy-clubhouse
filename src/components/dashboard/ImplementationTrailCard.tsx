
import { FC } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Target, 
  ArrowRight, 
  Sparkles,
  TrendingUp,
  Calendar
} from "lucide-react";
import { Link } from "react-router-dom";

export const ImplementationTrailCard: FC = () => {
  const currentPhase = "Estruturação Inicial";
  const progress = 65;
  const nextMilestone = "Automação de Processos";
  const estimatedCompletion = "15 dias";

  return (
    <Card variant="gradient" className="group overflow-hidden relative">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5"></div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -translate-y-16 translate-x-16"></div>
      
      <div className="relative z-10">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-primary/10 rounded-lg">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <Text variant="subheading" textColor="primary" className="font-semibold">
                  Trilha de Implementação Personalizada
                </Text>
              </div>
              <Text variant="body" textColor="secondary">
                Seu caminho estruturado para transformar seu negócio com IA
              </Text>
            </div>
            
            <Badge variant="accent" size="sm" className="backdrop-blur-sm">
              <Sparkles className="h-3 w-3 mr-1" />
              Ativa
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Progresso atual */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Text variant="body" textColor="primary" weight="medium">
                Fase Atual: {currentPhase}
              </Text>
              <Text variant="caption" textColor="secondary">
                {progress}% concluído
              </Text>
            </div>
            
            <Progress 
              value={progress} 
              className="h-2"
              indicatorClassName="bg-gradient-to-r from-primary to-accent"
            />
          </div>

          {/* Próximo marco */}
          <div className="bg-surface-elevated/50 backdrop-blur-sm rounded-lg p-4 border border-border-subtle">
            <div className="flex items-center gap-3 mb-3">
              <TrendingUp className="h-4 w-4 text-accent" />
              <Text variant="body" textColor="primary" weight="medium">
                Próximo Marco
              </Text>
            </div>
            
            <div className="space-y-2">
              <Text variant="body-large" textColor="primary" weight="semibold">
                {nextMilestone}
              </Text>
              
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-text-tertiary" />
                  <Text variant="caption" textColor="tertiary">
                    {estimatedCompletion}
                  </Text>
                </div>
                <div className="flex items-center gap-1">
                  <Target className="h-3 w-3 text-text-tertiary" />
                  <Text variant="caption" textColor="tertiary">
                    3 soluções
                  </Text>
                </div>
              </div>
            </div>
          </div>

          {/* Call to action */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild className="flex-1 hover-scale">
              <Link to="/implementation-trail">
                Ver trilha completa
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
            
            <Button variant="outline" asChild className="hover-scale">
              <Link to="/solutions?category=recommended">
                Explorar soluções
              </Link>
            </Button>
          </div>
        </CardContent>
      </div>
    </Card>
  );
};
