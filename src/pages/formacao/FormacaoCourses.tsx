
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const FormacaoCourses = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Cursos de Formação</h1>
        <p className="text-muted-foreground">
          Gerencie os cursos de formação
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Cursos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Lista de cursos em desenvolvimento...
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default FormacaoCourses;
