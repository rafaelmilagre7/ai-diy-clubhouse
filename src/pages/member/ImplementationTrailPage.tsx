
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Route } from 'lucide-react';

const ImplementationTrailPage = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Route className="h-8 w-8 text-viverblue" />
        <div>
          <h1 className="text-3xl font-bold">Trilha de Implementação</h1>
          <p className="text-muted-foreground">Sua jornada personalizada para implementar IA no seu negócio</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sua Trilha Personalizada</CardTitle>
          <CardDescription>
            Baseada no seu perfil e objetivos de negócio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Route className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Trilha em Construção</h3>
            <p className="text-muted-foreground">
              Sua trilha personalizada será gerada com base no seu onboarding.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ImplementationTrailPage;
