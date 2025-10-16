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
  User,
  Zap,
  BookOpen
} from 'lucide-react';
import { PersonalizedMessage } from './PersonalizedMessage';

import { ImplementationTrailData } from '@/types/implementationTrail';

interface PersonalizationInsightsProps {
  trail: ImplementationTrailData;
}


export const PersonalizationInsights: React.FC<PersonalizationInsightsProps> = ({ trail }) => {
  // Calculate stats from trail
  const totalSolutions = trail.priority1.length + trail.priority2.length + trail.priority3.length;
  
  // Calculate complexity level based on solution types and estimated times
  const getComplexityLevel = () => {
    const allItems = [...trail.priority1, ...trail.priority2, ...trail.priority3];
    let complexityScore = 0;
    
    allItems.forEach(item => {
      // Base complexity on time estimation
      if (item.estimatedTime) {
        if (item.estimatedTime.includes('4-8') || item.estimatedTime.includes('8')) {
          complexityScore += 3; // Advanced
        } else if (item.estimatedTime.includes('2-4')) {
          complexityScore += 2; // Intermediate
        } else {
          complexityScore += 1; // Basic
        }
      }
    });
    
    const avgComplexity = complexityScore / totalSolutions;
    if (avgComplexity >= 2.5) return { level: 'Avançado', icon: Brain };
    if (avgComplexity >= 1.5) return { level: 'Intermediário', icon: Zap };
    return { level: 'Iniciante', icon: BookOpen };
  };

  const complexity = getComplexityLevel();

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
        <Card className="aurora-glass border-aurora-primary/30 aurora-hover-scale">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Soluções Selecionadas</p>
                <p className="text-2xl font-bold text-foreground">{totalSolutions}</p>
              </div>
              <Target className="w-8 h-8 text-aurora-primary" />
            </div>
          </CardContent>
        </Card>

        {/* Complexity Level */}
        <Card className="aurora-glass border-aurora-primary/30 aurora-hover-scale">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Nível de Complexidade</p>
                <p className="text-2xl font-bold text-foreground">{complexity.level}</p>
              </div>
              <complexity.icon className="w-8 h-8 text-aurora-primary" />
            </div>
          </CardContent>
        </Card>

        {/* Estimated Time */}
        <Card className="aurora-glass border-aurora-primary/30 aurora-hover-scale">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tempo Estimado</p>
                <p className="text-2xl font-bold text-foreground">{totalHours}h</p>
              </div>
              <Clock className="w-8 h-8 text-aurora-primary" />
            </div>
          </CardContent>
        </Card>

        {/* Lessons Count */}
        <Card className="aurora-glass border-aurora-primary/30 aurora-hover-scale">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aulas Recomendadas</p>
                <p className="text-2xl font-bold text-foreground">{trail.recommended_lessons?.length || 0}</p>
              </div>
              <Award className="w-8 h-8 text-aurora-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

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