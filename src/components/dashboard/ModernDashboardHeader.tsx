
import { FC, memo } from "react";
import { Text } from "@/components/ui/text";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp } from "lucide-react";

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

  return (
    <div className="relative overflow-hidden bg-gradient-surface border border-border rounded-2xl p-8">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5"></div>
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-32 translate-x-32"></div>
      
      <Container size="full" spacing="none" className="relative z-10">
        <div className="flex flex-col space-y-4">
          {/* Greeting */}
          <div className="flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-primary" />
            <Text variant="subsection" textColor="primary" className="text-gradient">
              {getGreeting()}, {userName}!
            </Text>
          </div>
          
          {/* Main message */}
          <div className="space-y-2">
            <Text variant="body-large" textColor="secondary">
              Continue implementando soluções que transformam seu negócio
            </Text>
            
            <div className="flex items-center gap-2">
              <Badge variant="accent" size="sm" className="backdrop-blur-sm">
                <TrendingUp className="h-3 w-3 mr-1" />
                Em crescimento
              </Badge>
              <Text variant="caption" textColor="tertiary">
                Acelerando resultados com IA
              </Text>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
});

ModernDashboardHeader.displayName = 'ModernDashboardHeader';
