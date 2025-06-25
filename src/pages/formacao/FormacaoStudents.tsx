
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const FormacaoStudents = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Estudantes</h1>
        <p className="text-muted-foreground">
          Gerencie os estudantes da formação
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Lista de Estudantes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Lista de estudantes em desenvolvimento...
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default FormacaoStudents;
