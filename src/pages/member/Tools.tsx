
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wrench } from 'lucide-react';

const Tools = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Wrench className="h-8 w-8 text-viverblue" />
        <div>
          <h1 className="text-3xl font-bold">Ferramentas</h1>
          <p className="text-muted-foreground">Acesse ferramentas de IA e produtividade recomendadas</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ferramentas Recomendadas</CardTitle>
          <CardDescription>
            Explore as melhores ferramentas de IA para otimizar seu negócio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Wrench className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Ferramentas em Breve</h3>
            <p className="text-muted-foreground">
              Estamos organizando as melhores ferramentas de IA para você.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Tools;
