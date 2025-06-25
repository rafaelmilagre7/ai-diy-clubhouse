
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Play, BookOpen, CheckCircle, Lock, Clock } from 'lucide-react';

const LearningCourse = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const lessons = [
    { id: 1, title: "Introdução à IA", duration: "15 min", completed: true, locked: false },
    { id: 2, title: "Tipos de IA", duration: "20 min", completed: true, locked: false },
    { id: 3, title: "Machine Learning Básico", duration: "25 min", completed: false, locked: false },
    { id: 4, title: "Redes Neurais", duration: "30 min", completed: false, locked: true },
    { id: 5, title: "IA na Prática", duration: "35 min", completed: false, locked: true },
  ];

  const completedLessons = lessons.filter(lesson => lesson.completed).length;
  const progressPercentage = (completedLessons / lessons.length) * 100;

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/learning')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para Cursos
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold">Fundamentos de IA</h1>
        <p className="text-muted-foreground">
          Curso completo sobre os conceitos fundamentais de Inteligência Artificial
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Progresso do Curso</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>{completedLessons} de {lessons.length} aulas concluídas</span>
                  <span>{Math.round(progressPercentage)}%</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Aulas do Curso
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {lessons.map((lesson) => (
                  <div 
                    key={lesson.id}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      lesson.locked ? 'opacity-50' : 'hover:bg-muted cursor-pointer'
                    }`}
                    onClick={() => !lesson.locked && navigate(`/learning/lesson/${lesson.id}`)}
                  >
                    <div className="flex items-center gap-3">
                      {lesson.completed ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : lesson.locked ? (
                        <Lock className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <Play className="h-5 w-5 text-primary" />
                      )}
                      <div>
                        <h4 className="font-medium">{lesson.title}</h4>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {lesson.duration}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sobre o Curso</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Duração:</strong> 4h 30min</p>
                <p><strong>Nível:</strong> Iniciante</p>
                <p><strong>Certificado:</strong> Sim</p>
                <p><strong>Idioma:</strong> Português</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LearningCourse;
