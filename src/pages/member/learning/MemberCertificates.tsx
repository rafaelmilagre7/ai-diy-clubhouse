
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Link } from 'react-router-dom';
import { 
  Award, 
  Download, 
  Share2, 
  Calendar,
  ExternalLink,
  Trophy,
  Star,
  Target,
  BookOpen
} from 'lucide-react';

const MemberCertificates = () => {
  const earnedCertificates = [
    {
      id: "1",
      title: "Fundamentos de IA para Negócios",
      description: "Certificado de conclusão do curso básico sobre IA",
      completedAt: "2024-01-15",
      certificateUrl: "#",
      courseId: "1",
      grade: "A+",
      credentialId: "VIAI-FUND-2024-001"
    }
  ];

  const inProgressCertificates = [
    {
      id: "2",
      title: "ChatGPT para Empresas",
      description: "Domine o uso do ChatGPT para automatizar processos",
      progress: 75,
      completedLessons: 11,
      totalLessons: 15,
      estimatedCompletion: "2024-02-01",
      courseId: "2"
    },
    {
      id: "3",
      title: "Automação com IA",
      description: "Automatize tarefas repetitivas usando ferramentas de IA",
      progress: 45,
      completedLessons: 8,
      totalLessons: 18,
      estimatedCompletion: "2024-02-15",
      courseId: "3"
    }
  ];

  const availableCertificates = [
    {
      id: "4",
      title: "IA para Marketing Digital",
      description: "Use IA para criar campanhas de marketing mais eficazes",
      lessons: 10,
      duration: "5h 40min",
      level: "Básico",
      courseId: "4"
    },
    {
      id: "5",
      title: "Análise de Dados com IA",
      description: "Extraia insights valiosos usando ferramentas de IA",
      lessons: 14,
      duration: "7h 10min",
      level: "Intermediário",
      courseId: "5"
    }
  ];

  const achievements = [
    { name: "Primeiro Certificado", icon: "🎯", earned: true },
    { name: "Estudante Dedicado", icon: "📚", earned: true },
    { name: "Especialista IA", icon: "🤖", earned: false },
    { name: "Mentor da Comunidade", icon: "👨‍🏫", earned: false }
  ];

  return (
    <div className="container max-w-7xl mx-auto py-6 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Meus Certificados</h1>
        <p className="text-muted-foreground">
          Acompanhe seu progresso e conquiste certificados oficiais
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Certificados Conquistados</p>
                <p className="text-2xl font-bold">{earnedCertificates.length}</p>
              </div>
              <Award className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Em Progresso</p>
                <p className="text-2xl font-bold">{inProgressCertificates.length}</p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Disponíveis</p>
                <p className="text-2xl font-bold">{availableCertificates.length}</p>
              </div>
              <BookOpen className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Conquistas</p>
                <p className="text-2xl font-bold">{achievements.filter(a => a.earned).length}</p>
              </div>
              <Trophy className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Certificados Conquistados */}
          <section>
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <Award className="h-6 w-6 text-yellow-500" />
              Certificados Conquistados
            </h2>

            {earnedCertificates.length > 0 ? (
              <div className="space-y-4">
                {earnedCertificates.map((cert) => (
                  <Card key={cert.id} className="border-yellow-200 bg-yellow-50">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Award className="h-5 w-5 text-yellow-600" />
                            <h3 className="font-semibold text-lg">{cert.title}</h3>
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                              Nota: {cert.grade}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground mb-4">{cert.description}</p>
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              Concluído em {new Date(cert.completedAt).toLocaleDateString('pt-BR')}
                            </span>
                            <span>ID: {cert.credentialId}</span>
                          </div>

                          <div className="flex gap-3">
                            <Button size="sm">
                              <Download className="h-4 w-4 mr-2" />
                              Baixar PDF
                            </Button>
                            <Button size="sm" variant="outline">
                              <Share2 className="h-4 w-4 mr-2" />
                              Compartilhar
                            </Button>
                            <Button size="sm" variant="outline" asChild>
                              <Link to={`/learning/curso/${cert.courseId}`}>
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Ver Curso
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <Award className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum certificado ainda</h3>
                  <p className="text-muted-foreground mb-4">
                    Complete seus cursos para conquistar seus primeiros certificados
                  </p>
                  <Button asChild>
                    <Link to="/learning/cursos">Explorar Cursos</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </section>

          {/* Certificados em Progresso */}
          <section>
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <Target className="h-6 w-6 text-blue-500" />
              Em Progresso
            </h2>

            <div className="space-y-4">
              {inProgressCertificates.map((cert) => (
                <Card key={cert.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">{cert.title}</h3>
                        <p className="text-muted-foreground mb-4">{cert.description}</p>
                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span>{cert.completedLessons} de {cert.totalLessons} aulas</span>
                            <span>{cert.progress}% completo</span>
                          </div>
                          <Progress value={cert.progress} className="h-2" />
                          <p className="text-sm text-muted-foreground">
                            Previsão de conclusão: {new Date(cert.estimatedCompletion).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    </div>

                    <Button asChild>
                      <Link to={`/learning/curso/${cert.courseId}`}>
                        Continuar Curso
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Certificados Disponíveis */}
          <section>
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-green-500" />
              Certificados Disponíveis
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableCertificates.map((cert) => (
                <Card key={cert.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-2">{cert.title}</h3>
                    <p className="text-muted-foreground text-sm mb-4">{cert.description}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        {cert.lessons} aulas
                      </span>
                      <span>{cert.duration}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{cert.level}</Badge>
                      <Button size="sm" asChild>
                        <Link to={`/learning/curso/${cert.courseId}`}>Iniciar</Link>
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
                <Trophy className="h-5 w-5" />
                Conquistas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {achievements.map((achievement, index) => (
                  <div key={index} className={`flex items-center gap-3 p-3 rounded-lg ${achievement.earned ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
                    <span className="text-2xl">{achievement.icon}</span>
                    <div className="flex-1">
                      <span className={`text-sm font-medium ${achievement.earned ? 'text-green-700' : 'text-muted-foreground'}`}>
                        {achievement.name}
                      </span>
                    </div>
                    {achievement.earned && <Star className="h-4 w-4 text-green-500" />}
                  </div>
                ))}
              </div>
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
                <Link to="/learning">
                  <Target className="h-4 w-4 mr-2" />
                  Minha Trilha
                </Link>
              </Button>
              
              <Button variant="outline" className="w-full" asChild>
                <Link to="/comunidade">
                  <Share2 className="h-4 w-4 mr-2" />
                  Compartilhar no Fórum
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MemberCertificates;
