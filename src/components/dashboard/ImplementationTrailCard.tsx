
import { FC, memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles, Target, Zap } from "lucide-react";
import { Link } from "react-router-dom";

export const ImplementationTrailCard: FC = memo(() => {
  return (
    <Card variant="glow" className="relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-primary opacity-5"></div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full blur-3xl"></div>
      
      <CardHeader className="relative z-10 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-gradient">
                Trilha de Implementação IA
              </CardTitle>
              <Text variant="caption" textColor="secondary">
                Personalizada para seu perfil de negócio
              </Text>
            </div>
          </div>
          <Badge variant="info" className="animate-pulse-subtle">
            Beta
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="relative z-10 pt-0">
        <div className="space-y-4">
          <Text variant="body" textColor="secondary">
            Nossa IA analisou seu perfil e criou uma trilha personalizada de implementação. 
            Siga estas etapas para maximizar seus resultados.
          </Text>

          <div className="flex items-center gap-4 p-4 rounded-lg bg-surface-elevated/50 border border-border-subtle">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-success" />
              <Text variant="body-small" weight="medium" textColor="secondary">
                3 soluções priorizadas
              </Text>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-warning" />
              <Text variant="body-small" weight="medium" textColor="secondary">
                Impacto estimado: +40% eficiência
              </Text>
            </div>
          </div>

          <div className="flex justify-end">
            <Button asChild>
              <Link to="/implementation-trail">
                Ver Trilha Completa
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

ImplementationTrailCard.displayName = 'ImplementationTrailCard';
