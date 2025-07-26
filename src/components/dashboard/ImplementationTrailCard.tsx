
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Rocket, Plus, Clock, CheckCircle } from 'lucide-react';

export const ImplementationTrailCard: React.FC = () => {
  return (
    <Card className="bg-[#151823]/80 border-neutral-700/50 hover:shadow-lg hover:border-viverblue/30 transition-all duration-300">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-viverblue/20 rounded-lg">
              <Rocket className="h-5 w-5 text-viverblue" />
            </div>
            <span>Trilha de Implementação</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div>
            <h4 className="font-medium text-white">Trilha de Implementação IA</h4>
            <p className="text-sm text-neutral-400 mt-1">
              Sua trilha personalizada está disponível
            </p>
          </div>
          
          <Button 
            className="w-full bg-viverblue hover:bg-viverblue-dark text-white"
            onClick={() => window.location.href = '/trilha-implementacao'}
          >
            <Rocket className="h-4 w-4 mr-2" />
            Acessar Trilha
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
