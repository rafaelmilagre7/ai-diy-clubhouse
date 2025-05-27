
import React from 'react';
import { Network, Sparkles, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { NetworkingNotifications } from './NetworkingNotifications';

export const NetworkingHeader: React.FC = () => {
  const currentMonth = new Date().toLocaleDateString('pt-BR', { 
    month: 'long', 
    year: 'numeric' 
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-viverblue/10 rounded-lg">
            <Network className="h-6 w-6 text-viverblue" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Networking Inteligente</h1>
            <p className="text-muted-foreground">
              Conecte-se com potenciais clientes e fornecedores
            </p>
          </div>
        </div>
        <NetworkingNotifications />
      </div>

      <Card className="bg-gradient-to-r from-viverblue/5 to-purple-500/5 border-viverblue/20">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-viverblue/10 rounded-lg">
              <Sparkles className="h-5 w-5 text-viverblue" />
            </div>
            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg">Matches de {currentMonth}</h3>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  Atualizados mensalmente
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Nossa IA analisa seu perfil e gera <strong>5 potenciais clientes</strong> e <strong>3 fornecedores especializados</strong> 
                selecionados especificamente para o seu negócio. Cada match inclui análise de compatibilidade e sugestões de abordagem.
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="px-3 py-1 bg-viverblue/10 text-viverblue text-xs rounded-full">
                  IA Personalizada
                </span>
                <span className="px-3 py-1 bg-green-500/10 text-green-600 text-xs rounded-full">
                  8 Matches/Mês
                </span>
                <span className="px-3 py-1 bg-purple-500/10 text-purple-600 text-xs rounded-full">
                  Análise de Compatibilidade
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
