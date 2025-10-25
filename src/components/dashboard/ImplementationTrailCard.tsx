
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Rocket, Plus, Clock, CheckCircle } from 'lucide-react';

export const ImplementationTrailCard: React.FC = () => {
  return (
    <Card className="bg-card/80 border-border hover:shadow-lg hover:border-aurora-primary/30 transition-all duration-slow">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-sm">
            <div className="p-sm bg-aurora-primary/20 rounded-lg">
              <Rocket className="h-5 w-5 text-aurora-primary" />
            </div>
            <span>Trilha de Implementação</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-md">
          <div>
            <h4 className="font-medium">Trilha de Implementação IA</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Sua trilha personalizada está disponível
            </p>
          </div>
          
          <Button 
            variant="aurora-primary"
            className="w-full"
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
