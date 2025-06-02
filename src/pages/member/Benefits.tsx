
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Gift } from 'lucide-react';

const Benefits = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Gift className="h-8 w-8 text-viverblue" />
        <div>
          <h1 className="text-3xl font-bold">Benefícios</h1>
          <p className="text-muted-foreground">Acesse ferramentas e benefícios exclusivos para membros</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Benefícios Disponíveis</CardTitle>
          <CardDescription>
            Explore os benefícios e ferramentas especiais disponíveis para você
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Gift className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Benefícios em Breve</h3>
            <p className="text-muted-foreground">
              Estamos preparando benefícios exclusivos para nossos membros.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Benefits;
