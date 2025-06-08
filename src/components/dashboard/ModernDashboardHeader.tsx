
import { FC, memo } from "react";
import { Text } from "@/components/ui/text";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Sparkles, Zap, Target } from "lucide-react";

interface ModernDashboardHeaderProps {
  userName: string;
}

export const ModernDashboardHeader: FC<ModernDashboardHeaderProps> = memo(({ userName }) => {
  const currentHour = new Date().getHours();
  
  const getGreeting = () => {
    if (currentHour < 12) return "Bom dia";
    if (currentHour < 18) return "Boa tarde";
    return "Boa noite";
  };

  const getMotivationalMessage = () => {
    const messages = [
      "Vamos implementar mais soluções de IA hoje!",
      "Seu negócio está evoluindo com IA!",
      "Cada implementação te aproxima do sucesso!",
      "A jornada da IA transformadora continua!"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  return (
    <Container className="relative">
      <Card variant="glow" className="relative overflow-hidden p-8 md:p-10">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-primary opacity-5"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-accent/20 to-primary/20 rounded-full blur-2xl"></div>
        
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            {/* Saudação Principal */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-primary animate-pulse" />
                <Text variant="small" textColor="secondary" className="animate-fade-in">
                  {getGreeting()}, {userName}! 👋
                </Text>
              </div>
              
              <Text variant="section" className="text-gradient animate-fade-in" style={{ animationDelay: '0.1s' }}>
                Seu Hub de IA
              </Text>
              
              <Text variant="body" textColor="secondary" className="animate-fade-in max-w-lg" style={{ animationDelay: '0.2s' }}>
                {getMotivationalMessage()}
              </Text>
            </div>

            {/* Indicadores de Progresso */}
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-surface-elevated/50 border border-border-subtle">
                <Target className="h-5 w-5 text-success" />
                <div>
                  <Text variant="caption" textColor="tertiary">Status</Text>
                  <Text variant="body-small" weight="medium" textColor="secondary">Ativo</Text>
                </div>
              </div>
              
              <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-surface-elevated/50 border border-border-subtle">
                <Zap className="h-5 w-5 text-primary" />
                <div>
                  <Text variant="caption" textColor="tertiary">Nível</Text>
                  <Text variant="body-small" weight="medium" textColor="secondary">Implementador</Text>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </Container>
  );
});

ModernDashboardHeader.displayName = 'ModernDashboardHeader';
