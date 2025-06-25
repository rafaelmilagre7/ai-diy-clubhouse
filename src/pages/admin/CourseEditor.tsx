
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const CourseEditor = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Editor de Curso</h1>
        <p className="text-muted-foreground">
          Criar e editar cursos da plataforma
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Editor de Curso</CardTitle>
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

export default CourseEditor;
