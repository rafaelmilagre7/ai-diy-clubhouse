
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const AdminBenefits = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gerenciar Benefícios</h1>
        <p className="text-muted-foreground">
          Administre os benefícios dos membros
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Sistema de Benefícios</CardTitle>
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

export default AdminBenefits;
