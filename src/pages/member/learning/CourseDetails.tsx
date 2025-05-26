
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Play, 
  Clock, 
  BookOpen, 
  Users, 
  Star, 
  CheckCircle,
  Lock,
  ArrowLeft,
  Award,
  Download
} from 'lucide-react';

const CourseDetails = () => {
  const { id } = useParams();

  // Mock data - in real app, fetch based on course ID
  const course = {
    id: id,
    title: "Fundamentos de IA para Negócios",
    description: "Aprenda os conceitos básicos de IA e como aplicar em seu negócio. Este curso abrange desde os fundamentos teóricos até aplicações práticas, fornecendo uma base sólida para implementar IA em sua empresa.",
    thumbnail: "🤖",
    duration: "4h 30min",
    lessons: 12,
    level: "Básico",
    category: "Fundamentos",
    rating: 4.8,
    students: 1234,
    price: "Incluído",
    instructor: "Dr. Rafael Milagre",
    enrolled: true,
    progress: 65,
    completedLessons: 8,
    tags: ["IA", "Negócios", "Estratégia", "Fundamentos"]
  };

  const modules = [
    {
      id: 1,
      title: "Introdução à Inteligência Artificial",
      lessons: [
        { id: 1, title: "O que é IA?", duration: "15 min", completed: true },
        { id: 2, title: "História da IA", duration: "20 min", completed: true },
        { id: 3, title: "Tipos de IA", duration: "25 min", completed: true }
      ]
    },
    {
      id: 2,
      title: "IA no Mundo dos Negócios",
      lessons: [
        { id: 4, title: "Aplicações Práticas", duration: "30 min", completed: true },
        { id: 5, title: "Cases de Sucesso", duration: "25 min", completed: true },
        { id: 6, title: "ROI em IA", duration: "20 min", completed: true }
      ]
    },
    {
      id: 3,
      title: "Implementação Estratégica",
      lessons: [
        { id: 7, title: "Planejamento", duration: "35 min", completed: true },
        { id: 8, title: "Equipe e Recursos", duration: "30 min", completed: true },
        { id: 9, title: "Primeiros Passos", duration: "25 min", completed: false, current: true }
      ]
    },
    {
      id: 4,
      title: "Ferramentas e Plataformas",
      lessons: [
        { id: 10, title: "Ferramentas No-Code", duration: "40 min", completed: false },
        { id: 11, title: "APIs e Integrações", duration: "35 min", completed: false },
        { id: 12, title: "Projeto Final", duration: "60 min", completed: false }
      ]
    }
  ];

  const nextLesson = modules
    .flatMap(module => module.lessons)
    .find(lesson => !lesson.completed);

  return (
    <div className="container max-w-7xl mx-auto py-6 px-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/learning">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar aos Cursos
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Course Header */}
          <div className="mb-8">
            <div className="flex items-start gap-6 mb-6">
              <div className="text-8xl">{course.thumbnail}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline">{course.level}</Badge>
                  <Badge variant="secondary">{course.category}</Badge>
                </div>
                <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
                <p className="text-muted-foreground text-lg mb-4">{course.description}</p>
                
                <div className="flex items-center gap-6 text-sm text-muted-foreground mb-4">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {course.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    {course.lessons} aulas
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {course.students.toLocaleString()} alunos
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    {course.rating}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  {course.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">{tag}</Badge>
                  ))}
                </div>

                {course.enrolled && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Seu Progresso</span>
                      <span className="text-sm text-muted-foreground">
                        {course.completedLessons} de {course.lessons} aulas
                      </span>
                    </div>
                    <Progress value={course.progress} className="h-3" />
                    <p className="text-sm text-muted-foreground mt-1">
                      {course.progress}% completo
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              {course.enrolled ? (
                <>
                  <Button size="lg" asChild>
                    <Link to={`/learning/curso/${course.id}/aula/${nextLesson?.id || 1}`}>
                      <Play className="h-5 w-5 mr-2" />
                      {nextLesson ? 'Continuar' : 'Iniciar'} Curso
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg">
                    <Download className="h-5 w-5 mr-2" />
                    Material do Curso
                  </Button>
                </>
              ) : (
                <Button size="lg">
                  <Play className="h-5 w-5 mr-2" />
                  Inscrever-se no Curso
                </Button>
              )}
            </div>
          </div>

          <Separator className="mb-8" />

          {/* Course Modules */}
          <div>
            <h2 className="text-2xl font-semibold mb-6">Conteúdo do Curso</h2>
            <div className="space-y-4">
              {modules.map((module, moduleIndex) => (
                <Card key={module.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Módulo {moduleIndex + 1}: {module.title}</span>
                      <Badge variant="outline">
                        {module.lessons.length} aula{module.lessons.length !== 1 ? 's' : ''}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {module.lessons.map((lesson, lessonIndex) => (
                        <div key={lesson.id} className="flex items-center justify-between p-3 rounded-lg border">
                          <div className="flex items-center gap-3">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                              lesson.completed ? 'bg-green-500' : lesson.current ? 'bg-blue-500' : 'bg-gray-200'
                            }`}>
                              {lesson.completed ? (
                                <CheckCircle className="h-4 w-4 text-white" />
                              ) : lesson.current ? (
                                <Play className="h-3 w-3 text-white" />
                              ) : (
                                <Lock className="h-3 w-3 text-gray-500" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{lesson.title}</p>
                              <p className="text-sm text-muted-foreground">{lesson.duration}</p>
                            </div>
                          </div>
                          
                          {course.enrolled && (lesson.completed || lesson.current) && (
                            <Button size="sm" variant="ghost" asChild>
                              <Link to={`/learning/curso/${course.id}/aula/${lesson.id}`}>
                                <Play className="h-4 w-4" />
                              </Link>
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Course Info */}
          <Card>
            <CardHeader>
              <CardTitle>Informações do Curso</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Instrutor:</span>
                <span className="font-medium">{course.instructor}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duração:</span>
                <span className="font-medium">{course.duration}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Nível:</span>
                <span className="font-medium">{course.level}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Categoria:</span>
                <span className="font-medium">{course.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Acesso:</span>
                <span className="font-medium text-green-600">{course.price}</span>
              </div>
            </CardContent>
          </Card>

          {/* Certificate */}
          {course.enrolled && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Certificado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Complete o curso para receber seu certificado oficial.
                </p>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    {course.progress}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Progresso para certificação
                  </div>
                </div>
                <Progress value={course.progress} className="mt-4" />
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full" asChild>
                <Link to="/comunidade">
                  <Users className="h-4 w-4 mr-2" />
                  Fórum da Comunidade
                </Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link to="/learning/certificados">
                  <Award className="h-4 w-4 mr-2" />
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

export default CourseDetails;
