
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Play, Clock, Users, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Learning = () => {
  const navigate = useNavigate();

  return (
    <div className="container py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Aprendizado</h1>
        <p className="text-muted-foreground">
          Cursos e aulas para aprimorar seus conhecimentos em IA
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" 
              onClick={() => navigate('/learning/course/1')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Fundamentos de IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Aprenda os conceitos básicos de Inteligência Artificial e suas aplicações.
              </p>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  4h 30min
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  1.2k alunos
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-current text-yellow-500" />
                  4.8
                </div>
              </div>
              
              <Button className="w-full gap-2">
                <Play className="h-4 w-4" />
                Continuar Curso
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate('/learning/course/2')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              IA para Negócios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Como implementar IA em processos empresariais para aumentar eficiência.
              </p>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  6h 15min
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  890 alunos
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-current text-yellow-500" />
                  4.9
                </div>
              </div>
              
              <Button className="w-full gap-2">
                <Play className="h-4 w-4" />
                Iniciar Curso
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Learning;
