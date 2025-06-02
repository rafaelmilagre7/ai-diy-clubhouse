
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';

const ConnectionsManager = () => {
  return (
    <div className="container py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 rounded-full bg-viverblue/10">
            <Users className="w-6 h-6 text-viverblue" />
          </div>
          <div>
            <h1 className="text-2xl font-bold mb-1">Gerenciar Conexões</h1>
            <p className="text-muted-foreground">
              Gerencie suas conexões de networking.
            </p>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Suas Conexões</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Lista de conexões será exibida aqui.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ConnectionsManager;

// Export nomeado para compatibilidade
export { ConnectionsManager };
