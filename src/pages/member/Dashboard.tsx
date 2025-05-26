
import React from 'react';
import { useAuth } from '@/contexts/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Users, 
  MessageSquare, 
  TrendingUp, 
  CheckCircle, 
  Calendar,
  Target,
  Award
} from 'lucide-react';

const Dashboard = () => {
  const { profile } = useAuth();

  const dashboardCards = [
    {
      title: "Trilha de Aprendizado",
      description: "Continue sua jornada de aprendizado em IA",
      icon: BookOpen,
      link: "/learning",
      color: "bg-blue-500"
    },
    {
      title: "Comunidade",
      description: "Conecte-se com outros membros",
      icon: Users,
      link: "/comunidade",
      color: "bg-green-500"
    },
    {
      title: "Fórum",
      description: "Participe das discussões",
      icon: MessageSquare,
      link: "/comunidade",
      color: "bg-purple-500"
    },
    {
      title: "Implementações",
      description: "Acompanhe suas implementações",
      icon: CheckCircle,
      link: "/learning",
      color: "bg-orange-500"
    }
  ];

  const quickStats = [
    { label: "Cursos Iniciados", value: "3", icon: BookOpen },
    { label: "Implementações", value: "1", icon: Target },
    { label: "Conexões", value: "12", icon: Users },
    { label: "Certificados", value: "0", icon: Award }
  ];

  return (
    <div className="container max-w-7xl mx-auto py-6 px-4">
      {/* Header de Boas-vindas */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Bem-vindo de volta, {profile?.name || 'Membro'}! 👋
        </h1>
        <p className="text-muted-foreground">
          Aqui está um resumo do seu progresso na jornada VIVER DE IA
        </p>
      </div>

      {/* Stats Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {quickStats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <stat.icon className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Cards de Navegação Principal */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {dashboardCards.map((card, index) => (
          <Link key={index} to={card.link}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className={`inline-flex p-3 rounded-lg ${card.color} w-fit mb-2`}>
                  <card.icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg">{card.title}</CardTitle>
                <CardDescription className="text-sm">
                  {card.description}
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>

      {/* Seção de Atividade Recente */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Atividade Recente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <BookOpen className="h-4 w-4 text-blue-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Curso iniciado</p>
                  <p className="text-xs text-muted-foreground">Fundamentos de IA</p>
                </div>
                <span className="text-xs text-muted-foreground">2h atrás</span>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <MessageSquare className="h-4 w-4 text-green-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Novo tópico criado</p>
                  <p className="text-xs text-muted-foreground">Discussão sobre ChatGPT</p>
                </div>
                <span className="text-xs text-muted-foreground">1 dia atrás</span>
              </div>
            </div>
            
            <Button variant="outline" className="w-full mt-4" asChild>
              <Link to="/comunidade">Ver todas as atividades</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Próximos Passos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Completar módulo atual</p>
                  <p className="text-xs text-muted-foreground">Fundamentos de IA - Aula 3</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Participar do fórum</p>
                  <p className="text-xs text-muted-foreground">Conecte-se com outros membros</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Primeira implementação</p>
                  <p className="text-xs text-muted-foreground">Aplique o conhecimento na prática</p>
                </div>
              </div>
            </div>
            
            <Button className="w-full mt-4" asChild>
              <Link to="/learning">Continuar Aprendizado</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
