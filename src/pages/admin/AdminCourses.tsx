
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const AdminCourses = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gerenciar Cursos</h1>
        <p className="text-muted-foreground">
          Administre os cursos da plataforma LMS
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Sistema de Cursos</CardTitle>
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

export default AdminCourses;
