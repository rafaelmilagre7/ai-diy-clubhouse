
import React from 'react';
import { Network, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { NetworkingNotifications } from './NetworkingNotifications';

export const NetworkingHeader: React.FC = () => {
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
              Conecte-se com outros membros que podem ajudar seu negócio
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
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Como funciona o Networking IA</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Nossa IA analisa seu perfil, objetivos e necessidades para encontrar as conexões 
                mais relevantes. Seja para encontrar clientes ideais ou fornecedores especializados, 
                cada match é calculado com base em compatibilidade real de negócios.
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="px-3 py-1 bg-viverblue/10 text-viverblue text-xs rounded-full">
                  IA Avançada
                </span>
                <span className="px-3 py-1 bg-green-500/10 text-green-600 text-xs rounded-full">
                  Matches Qualificados
                </span>
                <span className="px-3 py-1 bg-purple-500/10 text-purple-600 text-xs rounded-full">
                  Análise Personalizada
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
