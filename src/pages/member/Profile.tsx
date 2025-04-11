import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  User, 
  Award, 
  CheckCircle, 
  BarChart, 
  Calendar, 
  Clock, 
  TrendingUp, 
  FileEdit,
  BookOpen
} from "lucide-react";
import LoadingScreen from "@/components/common/LoadingScreen";
import { Link } from "react-router-dom";

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
};

const mockBadges = [
  {
    id: "1",
    name: "Pioneiro",
    description: "Completou sua primeira implementação",
    image_url: "/placeholder.svg",
    category: "achievement",
    earned_at: "2025-01-15T10:30:00Z",
  },
  {
    id: "2",
    name: "Especialista em Vendas",
    description: "Implementou 3 soluções da trilha de Receita",
    image_url: "/placeholder.svg",
    category: "revenue",
    earned_at: "2025-02-20T14:45:00Z",
  },
  {
    id: "3",
    name: "Mestre em Automação",
    description: "Implementou 5 soluções com sucesso",
    image_url: "/placeholder.svg",
    category: "operational",
    earned_at: "2025-03-10T09:15:00Z",
  },
  {
    id: "4",
    name: "Estrategista",
    description: "Completou uma solução da trilha de Estratégia",
    image_url: "/placeholder.svg",
    category: "strategy",
    earned_at: "2025-03-25T16:20:00Z",
  },
];

const mockImplementations = [
  {
    id: "1",
    solution: {
      id: "s1",
      title: "Assistente de vendas no Instagram",
      category: "revenue",
      difficulty: "medium",
    },
    completed_at: "2025-01-15T10:30:00Z",
    is_completed: true,
  },
  {
    id: "2",
    solution: {
      id: "s2",
      title: "Automação de atendimento ao cliente",
      category: "operational",
      difficulty: "easy",
    },
    completed_at: "2025-02-20T14:45:00Z",
    is_completed: true,
  },
  {
    id: "3",
    solution: {
      id: "s3",
      title: "Análise preditiva de tendências",
      category: "strategy",
      difficulty: "advanced",
    },
    completed_at: null,
    is_completed: false,
    current_module: 3,
  },
];

const BadgeCard = ({ badge }: { badge: any }) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Card className="relative overflow-hidden hover:shadow-md transition-shadow">
            <div className={cn(
              "absolute top-0 right-0 w-0 h-0 border-t-[3rem] border-r-[3rem]",
              badge.category === "revenue" && "border-t-revenue/20 border-r-revenue/20",
              badge.category === "operational" && "border-t-operational/20 border-r-operational/20",
              badge.category === "strategy" && "border-t-strategy/20 border-r-strategy/20",
              badge.category === "achievement" && "border-t-viverblue/20 border-r-viverblue/20"
            )} />
            <CardContent className="pt-6 pb-4 text-center flex flex-col items-center">
              <div className={cn(
                "h-20 w-20 rounded-full flex items-center justify-center mb-4",
                badge.category === "revenue" && "bg-revenue/10 text-revenue",
                badge.category === "operational" && "bg-operational/10 text-operational",
                badge.category === "strategy" && "bg-strategy/10 text-strategy",
                badge.category === "achievement" && "bg-viverblue/10 text-viverblue"
              )}>
                <Award className="h-10 w-10" />
              </div>
              <h3 className="font-semibold text-base">{badge.name}</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Conquistado em {formatDate(badge.earned_at)}
              </p>
            </CardContent>
          </Card>
        </TooltipTrigger>
        <TooltipContent>
          <p>{badge.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
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
  
  const [loading, setLoading] = useState(false);
  const [badges, setBadges] = useState<any[]>(mockBadges);
  const [implementations, setImplementations] = useState<any[]>(mockImplementations);
  const [stats, setStats] = useState({
    total: 3,
    completed: 2,
    inProgress: 1,
    completionRate: 67,
  });
  
  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };
  
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
                  <span className="font-medium">{stats.total}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Concluídas</span>
                  <span className="font-medium">{stats.completed}</span>
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
          <Tabs defaultValue="badges">
            <TabsList>
              <TabsTrigger value="badges">
                <Award className="mr-2 h-4 w-4" />
                Conquistas
              </TabsTrigger>
              <TabsTrigger value="implementations">
                <CheckCircle className="mr-2 h-4 w-4" />
                Implementações
              </TabsTrigger>
              <TabsTrigger value="stats">
                <BarChart className="mr-2 h-4 w-4" />
                Estatísticas
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="badges" className="mt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {badges.map((badge) => (
                  <BadgeCard key={badge.id} badge={badge} />
                ))}
                
                <Card className="border-dashed border-2 flex flex-col items-center justify-center p-6 text-center">
                  <div className="bg-muted/30 h-20 w-20 rounded-full flex items-center justify-center mb-4">
                    <BookOpen className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold text-base">Próximas Conquistas</h3>
                  <p className="text-xs text-muted-foreground mt-2">
                    Implemente mais soluções para desbloquear novas conquistas
                  </p>
                  <Button className="mt-4" variant="outline" size="sm" asChild>
                    <Link to="/dashboard">
                      Ver Soluções
                    </Link>
                  </Button>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="implementations" className="mt-6">
              <div className="space-y-4">
                {implementations.map((implementation) => (
                  <ImplementationCard key={implementation.id} implementation={implementation} />
                ))}
              </div>
              
              <Card className="border-dashed border-2 mt-4 p-6 text-center">
                <div className="flex flex-col items-center">
                  <div className="bg-muted/30 h-16 w-16 rounded-full flex items-center justify-center mb-4">
                    <TrendingUp className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold text-base">Continue Crescendo</h3>
                  <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
                    Explore nossa biblioteca de soluções e continue implementando IA em sua empresa
                  </p>
                  <Button className="mt-4" asChild>
                    <Link to="/dashboard">
                      Explorar Soluções
                    </Link>
                  </Button>
                </div>
              </Card>
            </TabsContent>
            
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
                              <span>1/5</span>
                            </div>
                            <Progress value={20} className="h-2 bg-muted" />
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-operational">Otimização Operacional</span>
                              <span>1/6</span>
                            </div>
                            <Progress value={16.7} className="h-2 bg-muted" />
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-strategy">Gestão Estratégica</span>
                              <span>0/4</span>
                            </div>
                            <Progress value={0} className="h-2 bg-muted" />
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium">Tempo Gasto</h4>
                        <div className="grid grid-cols-2 gap-4 mt-2">
                          <Card>
                            <CardContent className="p-4 text-center">
                              <p className="text-3xl font-bold">125</p>
                              <p className="text-xs text-muted-foreground">minutos totais</p>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="p-4 text-center">
                              <p className="text-3xl font-bold">62</p>
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
                          <div className="flex items-start gap-3">
                            <div className="h-8 w-8 rounded-full bg-viverblue/10 flex items-center justify-center">
                              <CheckCircle className="h-4 w-4 text-viverblue" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">Implementação concluída</p>
                              <p className="text-xs text-muted-foreground">Automação de atendimento ao cliente</p>
                              <p className="text-xs text-muted-foreground">2 dias atrás</p>
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-3">
                            <div className="h-8 w-8 rounded-full bg-viverblue/10 flex items-center justify-center">
                              <Award className="h-4 w-4 text-viverblue" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">Nova conquista</p>
                              <p className="text-xs text-muted-foreground">Mestre em Automação</p>
                              <p className="text-xs text-muted-foreground">5 dias atrás</p>
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-3">
                            <div className="h-8 w-8 rounded-full bg-viverblue/10 flex items-center justify-center">
                              <BookOpen className="h-4 w-4 text-viverblue" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">Iniciou implementação</p>
                              <p className="text-xs text-muted-foreground">Análise preditiva de tendências</p>
                              <p className="text-xs text-muted-foreground">1 semana atrás</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium">Próximos Passos Recomendados</h4>
                        <div className="mt-2 space-y-2">
                          <Card className="p-3">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="text-sm font-medium">Concluir implementação atual</p>
                                <p className="text-xs text-muted-foreground">Análise preditiva de tendências</p>
                              </div>
                              <Button size="sm" variant="outline" asChild>
                                <Link to={`/implement/s3/3`}>
                                  Continuar
                                </Link>
                              </Button>
                            </div>
                          </Card>
                          
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
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Profile;
