
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  Activity,
  CheckCircle,
  UserPlus,
  Clock,
  Star
} from "lucide-react";

interface StatsOverviewProps {
  data: any;
  loading: boolean;
}

export const StatsOverview = ({ data, loading }: StatsOverviewProps) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} variant="elevated" className="animate-pulse">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <Skeleton className="h-4 w-24" />
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const stats = [
    {
      title: "Total de Usuários",
      value: data?.totalUsers || 0,
      icon: Users,
      variant: "primary" as const,
      change: "+12%",
      description: "Membros ativos na plataforma"
    },
    {
      title: "Novos Membros",
      value: data?.newUsers || 0,
      icon: UserPlus,
      variant: "success" as const,
      change: "+8%",
      description: "Registros este mês"
    },
    {
      title: "Soluções Ativas",
      value: data?.activeSolutions || 0,
      icon: BookOpen,
      variant: "info" as const,
      change: "+5%",
      description: "Projetos disponíveis"
    },
    {
      title: "Taxa de Engajamento",
      value: `${data?.engagementRate || 0}%`,
      icon: Activity,
      variant: "accent" as const,
      change: "+15%",
      description: "Interações por usuário"
    },
    {
      title: "Implementações",
      value: data?.completedImplementations || 0,
      icon: CheckCircle,
      variant: "success" as const,
      change: "+23%",
      description: "Projetos finalizados"
    },
    {
      title: "Tempo Médio",
      value: `${data?.averageTime || 0}h`,
      icon: Clock,
      variant: "warning" as const,
      change: "-8%",
      description: "Para completar projeto"
    },
    {
      title: "Satisfação",
      value: `${data?.satisfaction || 0}/5`,
      icon: Star,
      variant: "accent" as const,
      change: "+0.3",
      description: "Avaliação média"
    },
    {
      title: "Crescimento",
      value: `${data?.growthRate || 0}%`,
      icon: TrendingUp,
      variant: "success" as const,
      change: "+18%",
      description: "Crescimento mensal"
    }
  ];

  const getIconColor = (variant: string) => {
    switch (variant) {
      case 'primary': return 'text-primary bg-primary/10';
      case 'success': return 'text-success bg-success/10';
      case 'info': return 'text-info bg-info/10';
      case 'accent': return 'text-accent bg-accent/10';
      case 'warning': return 'text-warning bg-warning/10';
      default: return 'text-text-secondary bg-surface-hover';
    }
  };

  const getBadgeVariant = (variant: string) => {
    switch (variant) {
      case 'primary': return 'default' as const;
      case 'success': return 'success' as const;
      case 'info': return 'info' as const;
      case 'accent': return 'accent' as const;
      case 'warning': return 'warning' as const;
      default: return 'secondary' as const;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        const iconColorClass = getIconColor(stat.variant);
        
        return (
          <Card 
            key={stat.title} 
            variant="elevated" 
            className="group hover-lift transition-all duration-300"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg transition-colors group-hover:scale-110 ${iconColorClass}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <Text variant="caption" textColor="secondary" className="font-medium">
                    {stat.title}
                  </Text>
                </div>
                
                <Badge variant={getBadgeVariant(stat.variant)} size="xs">
                  {stat.change}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <Text variant="heading" textColor="primary" className="text-2xl font-bold">
                {stat.value}
              </Text>
              
              <Text variant="body-small" textColor="tertiary">
                {stat.description}
              </Text>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
