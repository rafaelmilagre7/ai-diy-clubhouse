
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Network, 
  Crown, 
  Sparkles, 
  Users, 
  TrendingUp,
  Shield,
  Zap
} from 'lucide-react';

interface NetworkingUpgradeProps {
  message: string;
}

export const NetworkingUpgrade: React.FC<NetworkingUpgradeProps> = ({ message }) => {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Card className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-viverblue/20 to-purple-500/20 rounded-full -mr-16 -mt-16" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-green-500/20 to-viverblue/20 rounded-full -ml-12 -mb-12" />
        
        <CardHeader className="text-center pb-6">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-viverblue/10 rounded-full">
              <Network className="h-12 w-12 text-viverblue" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
            <Crown className="h-6 w-6 text-yellow-500" />
            Networking Inteligente
            <Badge variant="outline" className="ml-2">Club</Badge>
          </CardTitle>
          <p className="text-muted-foreground mt-2">
            {message}
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-viverblue" />
                Recursos Exclusivos
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-1 bg-viverblue/10 rounded">
                    <Users className="h-4 w-4 text-viverblue" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Matches Inteligentes</p>
                    <p className="text-xs text-muted-foreground">
                      IA analisa perfis e conecta você com potenciais clientes e fornecedores
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1 bg-green-500/10 rounded">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Análise de Compatibilidade</p>
                    <p className="text-xs text-muted-foreground">
                      Score de compatibilidade baseado em Claude Sonnet 4
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1 bg-purple-500/10 rounded">
                    <Shield className="h-4 w-4 text-purple-500" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Networking Privado</p>
                    <p className="text-xs text-muted-foreground">
                      Conexões seguras entre membros verificados
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1 bg-yellow-500/10 rounded">
                    <Zap className="h-4 w-4 text-yellow-500" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Recomendações de IA</p>
                    <p className="text-xs text-muted-foreground">
                      Sugestões personalizadas de abordagem e oportunidades
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-center items-center text-center p-6 bg-gradient-to-br from-viverblue/5 to-purple-500/5 rounded-lg">
              <Crown className="h-16 w-16 text-yellow-500 mb-4" />
              <h3 className="font-bold text-xl mb-2">Upgrade para Club</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Desbloqueie o poder do networking inteligente e conecte-se com as pessoas certas
              </p>
              <Button className="w-full gap-2">
                <Crown className="h-4 w-4" />
                Fazer Upgrade
              </Button>
            </div>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Como Funciona
            </h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>1. Nossa IA analisa seu perfil e objetivos de negócio</p>
              <p>2. Geramos matches inteligentes com outros membros Club</p>
              <p>3. Você recebe análises detalhadas e recomendações de abordagem</p>
              <p>4. Conecte-se diretamente e expanda sua rede de negócios</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
