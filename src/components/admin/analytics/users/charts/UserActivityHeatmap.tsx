import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Clock } from 'lucide-react';

interface UserActivityHeatmapProps {
  data?: any;
  loading?: boolean;
}

export const UserActivityHeatmap = ({ data, loading }: UserActivityHeatmapProps) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Heatmap de Atividade
          </CardTitle>
          <CardDescription>Padrões de atividade por horário</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-48 bg-muted animate-pulse rounded" />
        </CardContent>
      </Card>
    );
  }

  // Mock data para demonstração
  const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Simular dados de atividade
  const generateActivityData = () => {
    return days.map(day => 
      hours.map(hour => ({
        day,
        hour,
        activity: Math.random() * 100
      }))
    ).flat();
  };

  const activityData = generateActivityData();

  const getIntensityColor = (activity: number) => {
    if (activity < 10) return 'bg-muted/20';
    if (activity < 25) return 'bg-operational/20';
    if (activity < 50) return 'bg-operational/40';
    if (activity < 75) return 'bg-operational/60';
    return 'bg-operational';
  };

  const getIntensityText = (activity: number) => {
    if (activity < 10) return 'Muito baixa';
    if (activity < 25) return 'Baixa';
    if (activity < 50) return 'Moderada';
    if (activity < 75) return 'Alta';
    return 'Muito alta';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-success" />
          Heatmap de Atividade
        </CardTitle>
        <CardDescription>
          Distribuição da atividade dos usuários por dia da semana e horário
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Legenda de horários */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>00:00</span>
            <span>06:00</span>
            <span>12:00</span>
            <span>18:00</span>
            <span>23:59</span>
          </div>

          {/* Grid do heatmap */}
          <div className="space-y-1">
            {days.map((day) => (
              <div key={day} className="flex items-center space-x-1">
                <div className="w-8 text-xs text-foreground font-medium">{day}</div>
                <div className="flex space-x-px">
                  {hours.map((hour) => {
                    const activity = activityData.find(d => d.day === day && d.hour === hour)?.activity || 0;
                    return (
                      <div
                        key={`${day}-${hour}`}
                        className={`w-3 h-3 rounded-sm ${getIntensityColor(activity)} cursor-pointer hover:ring-2 hover:ring-operational transition-all`}
                        title={`${day} ${hour}:00 - ${getIntensityText(activity)}: ${Math.round(activity)}% atividade`}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Legenda de intensidade */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-muted-foreground">Menos ativo</span>
            <div className="flex space-x-px">
              <div className="w-3 h-3 bg-muted/20 rounded-sm" />
...
              <div className="w-3 h-3 bg-operational rounded-sm" />
            </div>
            <span className="text-xs text-muted-foreground">Mais ativo</span>
          </div>

          {/* Insights */}
          <div className="border-t pt-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-operational" />
                <div>
                  <div className="font-medium">Pico de Atividade</div>
                  <div className="text-foreground">Terça, 14:00-16:00</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Activity className="h-4 w-4 text-success" />
                <div>
                  <div className="font-medium">Dia Mais Ativo</div>
                  <div className="text-foreground">Terça-feira</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};