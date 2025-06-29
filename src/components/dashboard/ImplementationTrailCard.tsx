
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
      draft: { label: 'Rascunho', variant: 'secondary' as const, icon: Clock },
      active: { label: 'Ativa', variant: 'default' as const, icon: Rocket },
      completed: { label: 'Concluída', variant: 'default' as const, icon: CheckCircle },
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
      <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-purple-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-purple-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const activeTrail = trails.find(trail => trail.status === 'active');
  const completedCount = trails.filter(trail => trail.status === 'completed').length;

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200 hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-purple-900">
          <div className="flex items-center gap-2">
            <Rocket className="h-5 w-5 text-purple-600" />
            <span>Trilha de Implementação</span>
          </div>
          {activeTrail && getStatusBadge(activeTrail.status)}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {activeTrail ? (
          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-gray-900">
                {activeTrail.trail_data?.title || 'Trilha Personalizada'}
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                {activeTrail.trail_data?.description || 'Implementação baseada no seu perfil e objetivos'}
              </p>
            </div>
            
            {completedCount > 0 && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span>{completedCount} trilhas concluídas</span>
              </div>
            )}
            
            <Button 
              className="w-full bg-purple-600 hover:bg-purple-700"
              onClick={() => window.location.href = '/implementation'}
            >
              Continuar Implementação
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-gray-900">Crie sua Trilha Personalizada</h4>
              <p className="text-sm text-gray-600 mt-1">
                Baseada no seu perfil e objetivos de negócio
              </p>
            </div>
            
            <Button 
              onClick={handleCreateTrail}
              className="w-full bg-purple-600 hover:bg-purple-700"
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
