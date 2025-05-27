
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Network, Star, Users, Building, Crown, ArrowRight } from 'lucide-react';

interface NetworkingUpgradeProps {
  message: string;
}

export const NetworkingUpgrade: React.FC<NetworkingUpgradeProps> = ({ message }) => {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-viverblue/10 rounded-lg">
          <Network className="h-6 w-6 text-viverblue" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Networking Inteligente</h1>
          <p className="text-muted-foreground">
            Acesso exclusivo para membros Club
          </p>
        </div>
      </div>

      {/* Upgrade Card */}
      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-8">
          <div className="text-center space-y-6">
            {/* Crown Icon */}
            <div className="flex justify-center">
              <div className="p-4 bg-gradient-to-br from-viverblue/20 to-purple-500/20 rounded-full">
                <Crown className="h-12 w-12 text-viverblue" />
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <h2 className="text-3xl font-bold">Networking Inteligente</h2>
              <p className="text-muted-foreground text-lg">
                {message}
              </p>
            </div>

            {/* Features */}
            <div className="grid md:grid-cols-3 gap-6 my-8">
              <div className="space-y-3">
                <div className="p-3 bg-viverblue/10 rounded-lg w-fit mx-auto">
                  <Users className="h-6 w-6 text-viverblue" />
                </div>
                <h3 className="font-semibold">Matches Qualificados</h3>
                <p className="text-sm text-muted-foreground">
                  IA analisa perfis para encontrar as conexões mais relevantes para seu negócio
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-green-500/10 rounded-lg w-fit mx-auto">
                  <Building className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold">Clientes & Fornecedores</h3>
                <p className="text-sm text-muted-foreground">
                  Conecte-se com potenciais clientes e fornecedores especializados
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-purple-500/10 rounded-lg w-fit mx-auto">
                  <Star className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold">Análise Personalizada</h3>
                <p className="text-sm text-muted-foreground">
                  Relatórios detalhados sobre compatibilidade e oportunidades
                </p>
              </div>
            </div>

            {/* Benefits */}
            <div className="bg-muted/50 p-6 rounded-lg space-y-4">
              <h3 className="font-semibold text-lg">Benefícios exclusivos:</h3>
              <div className="flex flex-wrap justify-center gap-2">
                <Badge variant="secondary" className="gap-1">
                  <Star className="h-3 w-3" />
                  IA Avançada
                </Badge>
                <Badge variant="secondary" className="gap-1">
                  <Users className="h-3 w-3" />
                  Perfis Verificados
                </Badge>
                <Badge variant="secondary" className="gap-1">
                  <Building className="h-3 w-3" />
                  Empresas Qualificadas
                </Badge>
                <Badge variant="secondary" className="gap-1">
                  <Network className="h-3 w-3" />
                  Conexões Diretas
                </Badge>
              </div>
            </div>

            {/* CTA */}
            <div className="space-y-4">
              <Button size="lg" className="gap-2">
                Fazer Upgrade para Club
                <ArrowRight className="h-4 w-4" />
              </Button>
              <p className="text-xs text-muted-foreground">
                Entre em contato para saber mais sobre os planos Club
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
