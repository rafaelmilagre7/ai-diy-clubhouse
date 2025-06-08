
import { FC, memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { Badge } from "@/components/ui/badge";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { 
  Sparkles, 
  TrendingUp, 
  Calendar,
  Zap,
  Target,
  Clock
} from "lucide-react";

interface ModernDashboardHeaderProps {
  userName: string;
}

export const ModernDashboardHeader: FC<ModernDashboardHeaderProps> = memo(({ userName }) => {
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? "Bom dia" : currentHour < 18 ? "Boa tarde" : "Boa noite";
  const currentDate = new Date().toLocaleDateString('pt-BR', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <Card 
      variant="elevated" 
      className="mb-8 overflow-hidden bg-gradient-to-br from-primary/10 via-surface to-accent/10 border-primary/20"
    >
      <CardContent className="p-8 relative">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 opacity-10 transform translate-x-8 -translate-y-8">
          <Sparkles className="w-full h-full text-primary" />
        </div>
        
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          {/* Welcome Section */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <Badge variant="accent" size="sm">
                <Zap className="h-3 w-3 mr-1" />
                Ativo
              </Badge>
              <div className="flex items-center gap-1 text-text-tertiary">
                <Calendar className="h-4 w-4" />
                <Text variant="caption" textColor="tertiary">
                  {currentDate}
                </Text>
              </div>
            </div>
            
            <div className="space-y-2">
              <Text variant="page" textColor="primary" className="font-bold">
                {greeting}, {userName}! 👋
              </Text>
              <Text variant="body-large" textColor="secondary" className="max-w-2xl">
                Bem-vindo de volta ao seu painel de implementações. Vamos continuar 
                transformando suas ideias em resultados concretos.
              </Text>
            </div>
            
            {/* Quick Stats */}
            <div className="flex items-center gap-6 pt-2">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-success" />
                <div>
                  <Text variant="body-small" textColor="primary" className="font-semibold">
                    <AnimatedCounter to={12} />
                  </Text>
                  <Text variant="caption" textColor="tertiary">
                    Implementações
                  </Text>
                </div>
              </div>
              
              <div className="w-px h-8 bg-border-subtle"></div>
              
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <div>
                  <Text variant="body-small" textColor="primary" className="font-semibold">
                    <AnimatedCounter to={85} suffix="%" />
                  </Text>
                  <Text variant="caption" textColor="tertiary">
                    Progresso
                  </Text>
                </div>
              </div>
              
              <div className="w-px h-8 bg-border-subtle"></div>
              
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-info" />
                <div>
                  <Text variant="body-small" textColor="primary" className="font-semibold">
                    <AnimatedCounter to={47} />h
                  </Text>
                  <Text variant="caption" textColor="tertiary">
                    Economizadas
                  </Text>
                </div>
              </div>
            </div>
          </div>
          
          {/* Achievement Section */}
          <div className="flex justify-center lg:justify-end">
            <div className="text-center p-6 bg-success/10 rounded-2xl border border-success/20">
              <div className="flex justify-center mb-3">
                <div className="p-3 bg-success/20 rounded-xl">
                  <Target className="h-8 w-8 text-success" />
                </div>
              </div>
              
              <Text variant="subheading" textColor="primary" className="font-bold mb-1">
                Implementador
              </Text>
              <Text variant="body-small" textColor="secondary" className="mb-3">
                Nível atual
              </Text>
              
              <Badge variant="success" size="sm">
                ⭐ Próximo: Expert
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

ModernDashboardHeader.displayName = 'ModernDashboardHeader';
