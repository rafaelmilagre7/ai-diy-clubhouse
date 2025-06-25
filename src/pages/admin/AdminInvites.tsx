
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const AdminInvites = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gerenciar Convites</h1>
        <p className="text-muted-foreground">
          Gerencie convites de usuários para a plataforma
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Sistema de Convites</CardTitle>
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

export default AdminInvites;
