import React from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, Play, Clock, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const Learning = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Aprendizado</h1>
        <p className="text-muted-foreground">
          Desenvolva suas habilidades em IA com nossos cursos especializados
        </p>
      </div>
      
      {/* Seções de cursos */}
      <div className="space-y-8">
        {/* Cursos em andamento */}
        <section>
          <h3 className="text-xl font-semibold mb-4">Cursos em Andamento</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2].map((item) => (
              <Card key={item} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">Curso de IA {item}</CardTitle>
                    </div>
                    <Badge variant="secondary">75%</Badge>
                  </div>
                  <CardDescription>
                    Aprenda os fundamentos da inteligência artificial aplicada aos negócios.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>4h restantes</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4" />
                      <span>4.8</span>
                    </div>
                  </div>
                  <Button className="w-full">
                    <Play className="h-4 w-4 mr-2" />
                    Continuar
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Cursos recomendados */}
        <section>
          <h3 className="text-xl font-semibold mb-4">Cursos Recomendados</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4].map((item) => (
              <Card key={item} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">Novo Curso {item}</CardTitle>
                  </div>
                  <CardDescription>
                    Curso avançado sobre técnicas modernas de IA e machine learning.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>8h</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4" />
                      <span>Novo</span>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">
                    Iniciar Curso
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Learning;