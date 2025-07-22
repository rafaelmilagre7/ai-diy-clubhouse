
import { FC, memo } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ModernDashboardHeaderProps {
  userName: string;
}

export const ModernDashboardHeader: FC<ModernDashboardHeaderProps> = memo(({ userName }) => {
  const navigate = useNavigate();

  const handleExploreClick = () => {
    navigate('/solutions');
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 via-viverblue/5 to-secondary/5 border border-border backdrop-blur-sm">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/3 via-viverblue/3 to-secondary/3" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-viverblue/10 to-transparent rounded-full blur-2xl" />
      
      <div className="relative px-8 py-12">
        <div className="flex items-start justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="w-6 h-6 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center backdrop-blur-sm border border-primary/20">
                  <div className="w-3 h-3 bg-primary/60 rounded-sm shadow-lg"></div>
                </div>
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary/40 rounded-full blur-sm"></div>
              </div>
              <span className="text-sm font-medium text-primary uppercase tracking-wider">
                Bem-vindo de volta
              </span>
            </div>
            
            <div>
              <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-2">
                Olá, {userName}! 👋
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl">
                Continue sua jornada de crescimento. Explore novas soluções e desenvolva seu negócio.
              </p>
            </div>

            <Button 
              onClick={handleExploreClick}
              className="bg-gradient-to-r from-primary to-viverblue hover:from-primary/90 hover:to-viverblue/90 text-primary-foreground px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-primary/20"
            >
              Explorar Soluções
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
});

ModernDashboardHeader.displayName = 'ModernDashboardHeader';
