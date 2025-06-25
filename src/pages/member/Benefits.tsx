
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Gift, Star, Zap, Crown } from 'lucide-react';

const Benefits = () => {
  return (
    <div className="container py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Benefícios</h1>
        <p className="text-muted-foreground">
          Aproveite todos os benefícios da sua associação
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5" />
              Acesso Premium
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Acesso completo a todas as ferramentas e recursos premium.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Suporte Prioritário
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Atendimento prioritário e suporte técnico especializado.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Novidades em Primeira Mão
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Seja o primeiro a conhecer novas funcionalidades e ferramentas.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Benefits;
