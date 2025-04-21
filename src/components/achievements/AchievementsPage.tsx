
import React, { useState } from 'react';
import { Award, Star, Trophy, Calendar, CheckCircle, Sparkles, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useUserStats } from '@/hooks/useUserStats/useUserStats';

export const AchievementsPage = () => {
  const { stats, loading } = useUserStats();
  const [activeTab, setActiveTab] = useState('all');

  // Conquistas de exemplo - estas seriam carregadas de uma API em produção
  const achievements = [
    {
      id: 1,
      title: 'Pioneiro Digital',
      description: 'Completou sua primeira implementação de solução',
      icon: <Award className="h-8 w-8 text-viverblue" />,
      progress: 100,
      category: 'beginner',
      unlocked: stats.completedSolutions > 0,
      date: '2023-10-15',
    },
    {
      id: 2,
      title: 'Implementador Ávido',
      description: 'Completou 5 implementações de soluções',
      icon: <Trophy className="h-8 w-8 text-amber-500" />,
      progress: Math.min((stats.completedSolutions / 5) * 100, 100),
      category: 'intermediate',
      unlocked: stats.completedSolutions >= 5,
      date: stats.completedSolutions >= 5 ? '2023-11-03' : null,
    },
    {
      id: 3,
      title: 'Mestre em IA',
      description: 'Completou 10 implementações de soluções',
      icon: <Star className="h-8 w-8 text-amber-500" />,
      progress: Math.min((stats.completedSolutions / 10) * 100, 100),
      category: 'advanced',
      unlocked: stats.completedSolutions >= 10,
      date: stats.completedSolutions >= 10 ? '2023-12-20' : null,
    },
    {
      id: 4,
      title: 'Especialista em Receita',
      description: 'Implementou 3 soluções da categoria Receita',
      icon: <BarChart3 className="h-8 w-8 text-revenue" />,
      progress: Math.min((stats.categoryDistribution.revenue.completed / 3) * 100, 100),
      category: 'revenue',
      unlocked: stats.categoryDistribution.revenue.completed >= 3,
      date: stats.categoryDistribution.revenue.completed >= 3 ? '2024-01-05' : null,
    },
    {
      id: 5,
      title: 'Guru Operacional',
      description: 'Implementou 3 soluções da categoria Operacional',
      icon: <CheckCircle className="h-8 w-8 text-operational" />,
      progress: Math.min((stats.categoryDistribution.operational.completed / 3) * 100, 100),
      category: 'operational',
      unlocked: stats.categoryDistribution.operational.completed >= 3,
      date: stats.categoryDistribution.operational.completed >= 3 ? '2024-02-10' : null,
    },
    {
      id: 6,
      title: 'Estrategista Digital',
      description: 'Implementou 3 soluções da categoria Estratégia',
      icon: <Sparkles className="h-8 w-8 text-strategy" />,
      progress: Math.min((stats.categoryDistribution.strategy.completed / 3) * 100, 100),
      category: 'strategy',
      unlocked: stats.categoryDistribution.strategy.completed >= 3,
      date: stats.categoryDistribution.strategy.completed >= 3 ? '2024-03-15' : null,
    },
    {
      id: 7,
      title: 'Constância é Tudo',
      description: 'Acessou a plataforma por 7 dias consecutivos',
      icon: <Calendar className="h-8 w-8 text-viverblue" />,
      progress: Math.min((stats.activeDays / 7) * 100, 100),
      category: 'engagement',
      unlocked: stats.activeDays >= 7,
      date: stats.activeDays >= 7 ? '2024-04-01' : null,
    },
  ];

  const filteredAchievements = activeTab === 'all' 
    ? achievements 
    : achievements.filter(a => a.category === activeTab);

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const completionPercentage = Math.round((unlockedCount / achievements.length) * 100);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[500px]">
        <div className="h-12 w-12 rounded-full border-t-2 border-b-2 border-viverblue animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Suas Conquistas</h1>
        <p className="text-muted-foreground">
          Acompanhe seu progresso e desbloqueie conquistas implementando soluções de IA.
        </p>
      </div>
      
      {/* Cartão de resumo */}
      <Card className="bg-gradient-to-br from-viverblue/10 to-viverblue/5 border border-viverblue/20">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="flex-shrink-0 bg-viverblue/20 rounded-full p-5 backdrop-blur-sm">
              <Trophy className="h-12 w-12 text-viverblue" />
            </div>
            <div className="flex-1 space-y-2 text-center md:text-left">
              <h2 className="text-xl font-semibold">Progresso de Conquistas</h2>
              <p className="text-sm text-muted-foreground">
                Você já desbloqueou {unlockedCount} de {achievements.length} conquistas disponíveis.
              </p>
              <div className="w-full mt-2">
                <div className="flex justify-between text-xs mb-1">
                  <span>{unlockedCount} conquistadas</span>
                  <span>{completionPercentage}%</span>
                </div>
                <Progress value={completionPercentage} className="h-2" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Tabs de categorias */}
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 flex flex-wrap">
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="beginner">Iniciante</TabsTrigger>
          <TabsTrigger value="intermediate">Intermediário</TabsTrigger>
          <TabsTrigger value="advanced">Avançado</TabsTrigger>
          <TabsTrigger value="revenue">Receita</TabsTrigger>
          <TabsTrigger value="operational">Operacional</TabsTrigger>
          <TabsTrigger value="strategy">Estratégia</TabsTrigger>
          <TabsTrigger value="engagement">Engajamento</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAchievements.map((achievement) => (
              <AchievementCard 
                key={achievement.id} 
                achievement={achievement} 
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface AchievementCardProps {
  achievement: {
    id: number;
    title: string;
    description: string;
    icon: React.ReactNode;
    progress: number;
    unlocked: boolean;
    date: string | null;
  };
}

const AchievementCard = ({ achievement }: AchievementCardProps) => {
  return (
    <Card 
      className={cn(
        "overflow-hidden transition-all duration-300 border",
        achievement.unlocked 
          ? "bg-gradient-to-br from-viverblue/10 to-white border-viverblue/20" 
          : "bg-gradient-to-br from-gray-100 to-white border-gray-200 opacity-70"
      )}
    >
      <CardHeader className="pb-3 relative">
        <div className="absolute top-0 right-0 mt-5 mr-5">
          {achievement.unlocked && (
            <span className="text-white bg-viverblue text-xs px-2 py-1 rounded-full">
              Desbloqueado
            </span>
          )}
        </div>
        <div className="flex items-start gap-4">
          <div className={cn(
            "p-2 rounded-lg", 
            achievement.unlocked ? "bg-viverblue/20" : "bg-gray-100"
          )}>
            {achievement.icon}
          </div>
          <div>
            <CardTitle>{achievement.title}</CardTitle>
            <CardDescription className="mt-1">{achievement.description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-0">
        <div className="w-full mt-2">
          <div className="flex justify-between text-xs mb-1">
            <span>Progresso</span>
            <span>{Math.round(achievement.progress)}%</span>
          </div>
          <Progress value={achievement.progress} className="h-2" />
        </div>
      </CardContent>
      <CardFooter className="pt-3 pb-4 text-xs text-muted-foreground">
        {achievement.unlocked 
          ? `Desbloqueado em ${new Date(achievement.date!).toLocaleDateString('pt-BR')}` 
          : "Continue implementando soluções para desbloquear"}
      </CardFooter>
    </Card>
  );
};
