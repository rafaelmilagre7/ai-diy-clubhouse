
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useUserStats } from "@/hooks/useUserStats";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AchievementGrid, Achievement } from "@/components/achievements/AchievementGrid";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Link, useSearchParams } from "react-router-dom";
import { 
  ShieldCheck, 
  Trophy, 
  Activity, 
  FileCheck, 
  Clock,
  Calendar,
  Settings,
  User,
  Award,
  CheckCircle,
  BarChart,
  BookOpen,
  TrendingUp,
  FileEdit,
} from "lucide-react";
import LoadingScreen from "@/components/common/LoadingScreen";

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
};

const ImplementationCard = ({ implementation }: { implementation: any }) => {
  return (
    <Card className={cn("overflow-hidden hover:shadow-md transition-shadow", 
      `border-l-4 border-l-${implementation.solution.category}`
    )}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <Link to={`/solution/${implementation.solution.id}`} className="font-medium hover:text-viverblue transition-colors">
              {implementation.solution.title}
            </Link>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className={cn(
                implementation.solution.category === "revenue" && "bg-revenue/10 text-revenue border-revenue/30",
                implementation.solution.category === "operational" && "bg-operational/10 text-operational border-operational/30",
                implementation.solution.category === "strategy" && "bg-strategy/10 text-strategy border-strategy/30"
              )}>
                {implementation.solution.category === "revenue" && "Receita"}
                {implementation.solution.category === "operational" && "Operacional"}
                {implementation.solution.category === "strategy" && "Estratégia"}
              </Badge>
              <Badge variant="outline" className="bg-gray-100">
                {implementation.solution.difficulty === "easy" && "Fácil"}
                {implementation.solution.difficulty === "medium" && "Médio"}
                {implementation.solution.difficulty === "advanced" && "Avançado"}
              </Badge>
            </div>
          </div>
          {implementation.is_completed ? (
            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
              <CheckCircle className="mr-1 h-3 w-3" />
              Concluído
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
              <Clock className="mr-1 h-3 w-3" />
              Em andamento
            </Badge>
          )}
        </div>
        {implementation.is_completed ? (
          <p className="text-sm text-muted-foreground mt-2">
            Concluído em {formatDate(implementation.completed_at)}
          </p>
        ) : (
          <div className="mt-2">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Progresso</span>
              <span>Módulo {implementation.current_module + 1} de 8</span>
            </div>
            <Progress value={((implementation.current_module + 1) / 8) * 100} className="h-2" />
            <div className="flex justify-end mt-2">
              <Button size="sm" variant="outline" asChild>
                <Link to={`/implement/${implementation.solution.id}/${implementation.current_module}`}>
                  Continuar
                </Link>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const Profile = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const { stats, loading: statsLoading } = useUserStats();
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get("tab") || "stats";
  
  const [loading, setLoading] = useState(true);
  const [implementations, setImplementations] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Buscar soluções concluídas ou em andamento pelo usuário
        const { data: progressData, error: progressError } = await supabase
          .from("progress")
          .select(`
            *,
            solution:solution_id (
              id, title, category, difficulty
            )
          `)
          .eq("user_id", user.id);
        
        if (progressError) {
          console.error("Erro ao buscar progresso:", progressError);
          // Usar dados fictícios em caso de erro
          setImplementations([
            {
              id: "1",
              solution: {
                id: "s1",
                title: "Assistente de IA no WhatsApp",
                category: "operational",
                difficulty: "easy",
              },
              current_module: 2,
              is_completed: false,
            }
          ]);
        } else {
          const formattedImplementations = progressData?.map(item => ({
            id: item.id,
            solution: item.solution,
            current_module: item.current_module,
            is_completed: item.is_completed,
            completed_at: item.completion_date,
            last_activity: item.last_activity
          })) || [];
          
          setImplementations(formattedImplementations);
        }
        
        // Buscar conquistas do usuário (neste momento usamos dados mockados)
        const defaultAchievements: Achievement[] = [
          {
            id: "1",
            name: "Pioneiro",
            description: "Completou sua primeira implementação",
            category: "achievement",
            isUnlocked: false,
            requiredCount: 1,
            currentCount: 0
          },
          {
            id: "2",
            name: "Especialista em Vendas",
            description: "Implementou 3 soluções da trilha de Receita",
            category: "revenue",
            isUnlocked: false,
            requiredCount: 3,
            currentCount: 0
          },
          {
            id: "3",
            name: "Mestre em Automação",
            description: "Implementou 5 soluções com sucesso",
            category: "operational",
            isUnlocked: false,
            requiredCount: 5,
            currentCount: 0
          },
          {
            id: "4",
            name: "Estrategista",
            description: "Completou uma solução da trilha de Estratégia",
            category: "strategy",
            isUnlocked: false,
            requiredCount: 1,
            currentCount: 0
          }
        ];
        
        if (progressData) {
          const completedCount = progressData.filter(p => p.is_completed).length;
          const completedRevenue = progressData.filter(p => 
            p.is_completed && p.solution?.category === "revenue"
          ).length;
          const completedStrategy = progressData.filter(p => 
            p.is_completed && p.solution?.category === "strategy"
          ).length;
          
          defaultAchievements[0].currentCount = completedCount;
          defaultAchievements[0].isUnlocked = completedCount >= 1;
          if (defaultAchievements[0].isUnlocked) {
            defaultAchievements[0].earnedAt = new Date().toISOString();
          }
          
          defaultAchievements[1].currentCount = completedRevenue;
          defaultAchievements[1].isUnlocked = completedRevenue >= 3;
          if (defaultAchievements[1].isUnlocked) {
            defaultAchievements[1].earnedAt = new Date().toISOString();
          }
          
          defaultAchievements[2].currentCount = completedCount;
          defaultAchievements[2].isUnlocked = completedCount >= 5;
          if (defaultAchievements[2].isUnlocked) {
            defaultAchievements[2].earnedAt = new Date().toISOString();
          }
          
          defaultAchievements[3].currentCount = completedStrategy;
          defaultAchievements[3].isUnlocked = completedStrategy >= 1;
          if (defaultAchievements[3].isUnlocked) {
            defaultAchievements[3].earnedAt = new Date().toISOString();
          }
        }
        
        setAchievements(defaultAchievements);
      } catch (error) {
        console.error("Erro ao buscar dados do usuário:", error);
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar seus dados. Tente novamente mais tarde.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [user, toast]);
  
  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };
  
  if (loading || statsLoading) {
    return <LoadingScreen message="Carregando seu perfil..." />;
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Meu Perfil</h1>
        <p className="text-muted-foreground mt-1">
          Acompanhe seu progresso e conquistas
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback className="text-2xl">{getInitials(profile?.name)}</AvatarFallback>
              </Avatar>
              <h2 className="mt-4 text-xl font-semibold">{profile?.name || "Usuário"}</h2>
              <p className="text-sm text-muted-foreground mt-1">{profile?.email || ""}</p>
              
              <div className="w-full mt-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Membro desde</span>
                  <span className="font-medium">{formatDate(profile?.created_at || new Date().toISOString())}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Implementações</span>
                  <span className="font-medium">{stats.totalSolutions}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Concluídas</span>
                  <span className="font-medium">{stats.completedSolutions}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Taxa de conclusão</span>
                  <span className="font-medium">{stats.completionRate}%</span>
                </div>
              </div>
              
              <div className="w-full mt-6">
                <Progress value={stats.completionRate} className="h-2" />
              </div>
              
              <Button className="mt-6" variant="outline" size="sm">
                <FileEdit className="mr-2 h-4 w-4" />
                Editar Perfil
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <div className="md:col-span-2 space-y-6">
          <Tabs defaultValue={defaultTab}>
            <TabsList>
              <TabsTrigger value="stats">
                <BarChart className="mr-2 h-4 w-4" />
                Estatísticas
              </TabsTrigger>
              <TabsTrigger value="implementations">
                <CheckCircle className="mr-2 h-4 w-4" />
                Implementações
              </TabsTrigger>
              <TabsTrigger value="badges">
                <Award className="mr-2 h-4 w-4" />
                Conquistas
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="stats" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Estatísticas de Implementação</CardTitle>
                  <CardDescription>
                    Uma visão geral do seu progresso na plataforma
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium">Distribuição por Categoria</h4>
                        <div className="mt-2 space-y-2">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-revenue">Aumento de Receita</span>
                              <span>{stats.categoryDistribution.revenue.completed}/{stats.categoryDistribution.revenue.total}</span>
                            </div>
                            <Progress 
                              value={stats.categoryDistribution.revenue.total > 0 ? 
                                (stats.categoryDistribution.revenue.completed / stats.categoryDistribution.revenue.total) * 100 : 0
                              } 
                              className="h-2 bg-muted" 
                            />
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-operational">Otimização Operacional</span>
                              <span>{stats.categoryDistribution.operational.completed}/{stats.categoryDistribution.operational.total}</span>
                            </div>
                            <Progress 
                              value={stats.categoryDistribution.operational.total > 0 ? 
                                (stats.categoryDistribution.operational.completed / stats.categoryDistribution.operational.total) * 100 : 0
                              } 
                              className="h-2 bg-muted" 
                            />
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-strategy">Gestão Estratégica</span>
                              <span>{stats.categoryDistribution.strategy.completed}/{stats.categoryDistribution.strategy.total}</span>
                            </div>
                            <Progress 
                              value={stats.categoryDistribution.strategy.total > 0 ? 
                                (stats.categoryDistribution.strategy.completed / stats.categoryDistribution.strategy.total) * 100 : 0
                              } 
                              className="h-2 bg-muted" 
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium">Tempo Gasto</h4>
                        <div className="grid grid-cols-2 gap-4 mt-2">
                          <Card>
                            <CardContent className="p-4 text-center">
                              <p className="text-3xl font-bold">{stats.totalTimeSpent}</p>
                              <p className="text-xs text-muted-foreground">minutos totais</p>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="p-4 text-center">
                              <p className="text-3xl font-bold">{stats.avgTimePerSolution}</p>
                              <p className="text-xs text-muted-foreground">min. por solução</p>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium">Atividade Recente</h4>
                        <div className="mt-2 space-y-3">
                          {implementations.length > 0 ? (
                            implementations
                              .sort((a, b) => new Date(b.last_activity).getTime() - new Date(a.last_activity).getTime())
                              .slice(0, 3)
                              .map((implementation, index) => (
                                <div key={index} className="flex items-start gap-3">
                                  <div className="h-8 w-8 rounded-full bg-viverblue/10 flex items-center justify-center">
                                    {implementation.is_completed ? (
                                      <CheckCircle className="h-4 w-4 text-viverblue" />
                                    ) : (
                                      <Clock className="h-4 w-4 text-viverblue" />
                                    )}
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">
                                      {implementation.is_completed ? "Implementação concluída" : "Implementação em andamento"}
                                    </p>
                                    <p className="text-xs text-muted-foreground">{implementation.solution?.title}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {formatDate(implementation.last_activity)}
                                    </p>
                                  </div>
                                </div>
                              ))
                          ) : (
                            <div className="text-center py-4">
                              <p className="text-sm text-muted-foreground">
                                Nenhuma atividade recente encontrada
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium">Próximos Passos Recomendados</h4>
                        <div className="mt-2 space-y-2">
                          {implementations.some(imp => !imp.is_completed) ? (
                            <Card className="p-3">
                              <div className="flex justify-between items-center">
                                <div>
                                  <p className="text-sm font-medium">Concluir implementação atual</p>
                                  <p className="text-xs text-muted-foreground">
                                    {implementations.find(imp => !imp.is_completed)?.solution?.title}
                                  </p>
                                </div>
                                <Button size="sm" variant="outline" asChild>
                                  <Link to={`/implement/${implementations.find(imp => !imp.is_completed)?.solution?.id}/${implementations.find(imp => !imp.is_completed)?.current_module}`}>
                                    Continuar
                                  </Link>
                                </Button>
                              </div>
                            </Card>
                          ) : (
                            <Card className="p-3">
                              <div className="flex justify-between items-center">
                                <div>
                                  <p className="text-sm font-medium">Explore novas soluções</p>
                                  <p className="text-xs text-muted-foreground">
                                    Descubra soluções que podem ajudar seu negócio
                                  </p>
                                </div>
                                <Button size="sm" variant="outline" asChild>
                                  <Link to="/dashboard">
                                    Explorar
                                  </Link>
                                </Button>
                              </div>
                            </Card>
                          )}
                          
                          {stats.categoryDistribution.strategy.completed === 0 && (
                            <Card className="p-3">
                              <div className="flex justify-between items-center">
                                <div>
                                  <p className="text-sm font-medium">Explore a trilha de estratégia</p>
                                  <p className="text-xs text-muted-foreground">Ainda não implementou soluções desta trilha</p>
                                </div>
                                <Button size="sm" variant="outline" asChild>
                                  <Link to="/dashboard?category=strategy">
                                    Explorar
                                  </Link>
                                </Button>
                              </div>
                            </Card>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="implementations" className="mt-6">
              <div className="space-y-4">
                {implementations.length > 0 ? (
                  implementations.map((implementation) => (
                    <ImplementationCard key={implementation.id} implementation={implementation} />
                  ))
                ) : (
                  <Card className="border-dashed border-2 p-6 text-center">
                    <div className="flex flex-col items-center">
                      <div className="bg-muted/30 h-16 w-16 rounded-full flex items-center justify-center mb-4">
                        <BookOpen className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="font-semibold text-base">Comece sua jornada</h3>
                      <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
                        Explore nossa biblioteca de soluções e comece a implementar IA em sua empresa
                      </p>
                      <Button className="mt-4" asChild>
                        <Link to="/dashboard">
                          Explorar Soluções
                        </Link>
                      </Button>
                    </div>
                  </Card>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="badges" className="mt-6">
              <AchievementGrid achievements={achievements} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Profile;
