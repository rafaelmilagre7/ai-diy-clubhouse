
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Rocket, Plus, Clock, CheckCircle } from 'lucide-react';
import { useImplementationTrails } from '@/hooks/useImplementationTrails';

export const ImplementationTrailCard: React.FC = () => {
  const { trails, loading, createTrail } = useImplementationTrails();

  const handleCreateTrail = async () => {
    try {
      await createTrail({
        trail_data: {
          title: 'Nova Trilha de Implementação',
          description: 'Trilha personalizada baseada no seu perfil',
          steps: []
        },
        status: 'draft'
      });
    } catch (error) {
      console.error('Erro ao criar trilha:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: 'Rascunho', variant: 'neutral' as const, icon: Clock },
      active: { label: 'Ativa', variant: 'default' as const, icon: Rocket },
      completed: { label: 'Concluída', variant: 'success' as const, icon: CheckCircle },
      paused: { label: 'Pausada', variant: 'outline' as const, icon: Clock },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    const IconComponent = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <IconComponent className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card className="bg-[#151823]/80 border-neutral-700/50">
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-neutral-600 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-neutral-600 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const activeTrail = trails.find(trail => trail.status === 'active');
  const completedCount = trails.filter(trail => trail.status === 'completed').length;

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
          {activeTrail && getStatusBadge(activeTrail.status)}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {activeTrail ? (
          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-white">
                {activeTrail.trail_data?.title || 'Trilha Personalizada'}
              </h4>
              <p className="text-sm text-neutral-400 mt-1">
                {activeTrail.trail_data?.description || 'Implementação baseada no seu perfil e objetivos'}
              </p>
            </div>
            
            {completedCount > 0 && (
              <div className="flex items-center gap-2 text-sm text-viverblue">
                <CheckCircle className="h-4 w-4" />
                <span>{completedCount} trilhas concluídas</span>
              </div>
            )}
            
            <Button 
              className="w-full bg-viverblue hover:bg-viverblue-dark text-white"
              onClick={() => window.location.href = '/implementation'}
            >
              Continuar Implementação
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-white">Crie sua Trilha Personalizada</h4>
              <p className="text-sm text-neutral-400 mt-1">
                Baseada no seu perfil e objetivos de negócio
              </p>
            </div>
            
            <Button 
              onClick={handleCreateTrail}
              className="w-full bg-viverblue hover:bg-viverblue-dark text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Criar Trilha
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
