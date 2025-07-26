import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Target, 
  TrendingUp, 
  Clock, 
  Award, 
  Lightbulb,
  Building2,
  User
} from 'lucide-react';
import { PersonalizedMessage } from './PersonalizedMessage';

import { ImplementationTrailData } from '@/types/implementationTrail';

interface PersonalizationInsightsProps {
  trail: ImplementationTrailData;
}


export const PersonalizationInsights: React.FC<PersonalizationInsightsProps> = ({ trail }) => {
  // Calculate stats from trail
  const totalSolutions = trail.priority1.length + trail.priority2.length + trail.priority3.length;
  const averageScore = Math.round(
    [...trail.priority1, ...trail.priority2, ...trail.priority3]
      .reduce((acc, item) => acc + (item.aiScore || 0), 0) / totalSolutions
  );

  const highPriority = trail.priority1.length;
  const mediumPriority = trail.priority2.length;
  const lowPriority = trail.priority3.length;

  // Estimated total time calculation
  const getTotalEstimatedHours = () => {
    const allItems = [...trail.priority1, ...trail.priority2, ...trail.priority3];
    let totalHours = 0;
    
    allItems.forEach(item => {
      if (item.estimatedTime) {
        const match = item.estimatedTime.match(/(\d+)/);
        if (match) {
          totalHours += parseInt(match[1]);
        }
      }
    });
    
    return totalHours;
  };

  const totalHours = getTotalEstimatedHours();

  return (
    <div className="space-y-6">
      {/* Nina's Personalized Message */}
      {trail.ai_message && (
        <PersonalizedMessage message={trail.ai_message} />
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Solutions */}
        <Card className="aurora-glass border-operational/30 aurora-hover-scale">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Soluções Selecionadas</p>
                <p className="text-2xl font-bold text-foreground">{totalSolutions}</p>
              </div>
              <Target className="w-8 h-8 text-operational" />
            </div>
          </CardContent>
        </Card>

        {/* Average Compatibility */}
        <Card className="aurora-glass border-revenue/30 aurora-hover-scale">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Compatibilidade Média</p>
                <p className="text-2xl font-bold text-foreground">{averageScore}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-revenue" />
            </div>
          </CardContent>
        </Card>

        {/* Estimated Time */}
        <Card className="aurora-glass border-strategy/30 aurora-hover-scale">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tempo Estimado</p>
                <p className="text-2xl font-bold text-foreground">{totalHours}h</p>
              </div>
              <Clock className="w-8 h-8 text-strategy" />
            </div>
          </CardContent>
        </Card>

        {/* Lessons Count */}
        <Card className="aurora-glass border-viverblue/30 aurora-hover-scale">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aulas Recomendadas</p>
                <p className="text-2xl font-bold text-foreground">{trail.recommended_lessons?.length || 0}</p>
              </div>
              <Award className="w-8 h-8 text-viverblue" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Priority Distribution */}
      <Card className="aurora-glass border-viverblue/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Lightbulb className="w-5 h-5 text-viverblue" />
            <CardTitle>Distribuição por Prioridade</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {/* High Priority */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge variant="default" className="bg-viverblue text-white">
                  Alta Prioridade
                </Badge>
                <span className="text-sm text-muted-foreground">{highPriority} soluções</span>
              </div>
              <Progress value={(highPriority / totalSolutions) * 100} className="w-24" />
            </div>

            {/* Medium Priority */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="bg-operational text-white">
                  Média Prioridade
                </Badge>
                <span className="text-sm text-muted-foreground">{mediumPriority} soluções</span>
              </div>
              <Progress value={(mediumPriority / totalSolutions) * 100} className="w-24" />
            </div>

            {/* Low Priority */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="border-revenue text-revenue">
                  Baixa Prioridade
                </Badge>
                <span className="text-sm text-muted-foreground">{lowPriority} soluções</span>
              </div>
              <Progress value={(lowPriority / totalSolutions) * 100} className="w-24" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Generation Info */}
      <Card className="aurora-glass border-muted/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>Trilha personalizada gerada por IA</span>
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              <span>Gerada em {new Date(trail.generated_at).toLocaleDateString('pt-BR')}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};