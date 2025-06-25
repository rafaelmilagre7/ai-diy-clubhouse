
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const LessonEditor = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Editor de Aula</h1>
        <p className="text-muted-foreground">
          Criar e editar aulas dos cursos
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Editor de Aula</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Funcionalidade em desenvolvimento...
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default LessonEditor;
