
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle } from 'lucide-react';

const LearningLesson = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/learning/course/1')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao Curso
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold">Introdução à IA</h1>
        <p className="text-muted-foreground">
          Aula {id} - Fundamentos de IA
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Conteúdo da Aula
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-4">
                <div className="text-center">
                  <BookOpen className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-muted-foreground">Vídeo da aula será carregado aqui</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">O que é Inteligência Artificial?</h3>
                <p className="text-muted-foreground">
                  Nesta aula, você aprenderá os conceitos fundamentais da Inteligência Artificial, 
                  sua história, evolução e principais aplicações no mundo moderno.
                </p>
                
                <div className="flex justify-between">
                  <Button variant="outline" disabled>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Aula Anterior
                  </Button>
                  <Button>
                    Próxima Aula
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Progresso</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Aula assistida</span>
                </div>
                <Button className="w-full">
                  Marcar como Concluída
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recursos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Material de Apoio
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Exercícios
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LearningLesson;
