
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Play, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  Award,
  Target,
  Users
} from 'lucide-react';

const MemberLearning = () => {
  const currentCourses = [
    {
      id: "1",
      title: "Fundamentos de IA para Negócios",
      description: "Aprenda os conceitos básicos de IA e como aplicar em seu negócio",
      progress: 65,
      totalLessons: 12,
      completedLessons: 8,
      duration: "4h 30min",
      status: "Em Progresso",
      thumbnail: "🤖"
    },
    {
      id: "2", 
      title: "ChatGPT para Empresas",
      description: "Domine o uso do ChatGPT para automatizar processos empresariais",
      progress: 25,
      totalLessons: 15,
      completedLessons: 4,
      duration: "6h 15min",
      status: "Iniciado",
      thumbnail: "💬"
    }
  ];

  const availableCourses = [
    {
      id: "3",
      title: "Automação com IA",
      description: "Automatize tarefas repetitivas usando ferramentas de IA",
      lessons: 18,
      duration: "8h 20min",
      level: "Intermediário",
      thumbnail: "⚡"
    },
    {
      id: "4",
      title: "IA para Marketing Digital",
      description: "Use IA para criar campanhas de marketing mais eficazes",
      lessons: 10,
      duration: "5h 40min", 
      level: "Básico",
      thumbnail: "📈"
    }
  ];

  const achievements = [
    { name: "Primeiro Curso", icon: "🎯", earned: true },
    { name: "50% Completo", icon: "📚", earned: true },
    { name: "Implementador", icon: "⚡", earned: false },
    { name: "Mentor", icon: "👨‍🏫", earned: false }
  ];

  return (
    <div className="container max-w-7xl mx-auto py-6 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Minha Trilha de Aprendizado</h1>
        <p className="text-muted-foreground">
          Acompanhe seu progresso e continue evoluindo no mundo da IA
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cursos Ativos</p>
                <p className="text-2xl font-bold">2</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Progresso Médio</p>
                <p className="text-2xl font-bold">45%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Horas Estudadas</p>
                <p className="text-2xl font-bold">23h</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Certificados</p>
                <p className="text-2xl font-bold">0</p>
              </div>
              <Award className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Cursos em Progresso */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">Cursos em Progresso</h2>
              <Button variant="outline" asChild>
                <Link to="/learning/cursos">Ver Todos</Link>
              </Button>
            </div>

            <div className="space-y-4">
              {currentCourses.map((course) => (
                <Card key={course.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="text-4xl">{course.thumbnail}</div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-lg">{course.title}</h3>
                          <Badge variant={course.status === "Em Progresso" ? "default" : "secondary"}>
                            {course.status}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground mb-4">{course.description}</p>
                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span>{course.completedLessons} de {course.totalLessons} aulas</span>
                            <span>{course.progress}% completo</span>
                          </div>
                          <Progress value={course.progress} className="h-2" />
                        </div>

                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {course.duration}
                            </span>
                          </div>
                          <Button asChild>
                            <Link to={`/learning/curso/${course.id}`}>
                              <Play className="h-4 w-4 mr-2" />
                              Continuar
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Cursos Disponíveis */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">Cursos Disponíveis</h2>
              <Button variant="outline" asChild>
                <Link to="/learning/cursos">Explorar Catálogo</Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableCourses.map((course) => (
                <Card key={course.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="text-4xl mb-4">{course.thumbnail}</div>
                    <h3 className="font-semibold text-lg mb-2">{course.title}</h3>
                    <p className="text-muted-foreground text-sm mb-4">{course.description}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        {course.lessons} aulas
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {course.duration}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{course.level}</Badge>
                      <Button size="sm" asChild>
                        <Link to={`/learning/curso/${course.id}`}>Iniciar</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Conquistas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Conquistas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {achievements.map((achievement, index) => (
                  <div key={index} className={`flex items-center gap-3 p-2 rounded ${achievement.earned ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
                    <span className="text-2xl">{achievement.icon}</span>
                    <span className={`text-sm ${achievement.earned ? 'text-green-700' : 'text-muted-foreground'}`}>
                      {achievement.name}
                    </span>
                    {achievement.earned && <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />}
                  </div>
                ))}
              </div>
              
              <Button variant="outline" className="w-full mt-4" asChild>
                <Link to="/learning/certificados">Ver Certificados</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Ações Rápidas */}
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" asChild>
                <Link to="/learning/cursos">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Explorar Cursos
                </Link>
              </Button>
              
              <Button variant="outline" className="w-full" asChild>
                <Link to="/comunidade">
                  <Users className="h-4 w-4 mr-2" />
                  Fórum da Comunidade
                </Link>
              </Button>
              
              <Button variant="outline" className="w-full" asChild>
                <Link to="/learning/certificados">
                  <Target className="h-4 w-4 mr-2" />
                  Meus Certificados
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MemberLearning;
