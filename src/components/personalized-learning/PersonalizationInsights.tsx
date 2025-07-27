import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { PersonalizedContext } from '@/adapters/OnboardingToAIAdapter';
import { 
  User, 
  Building2, 
  Target, 
  Brain, 
  BookOpen, 
  TrendingUp,
  Clock,
  Star
} from 'lucide-react';

interface PersonalizationInsightsProps {
  context: PersonalizedContext;
  profileStrength?: number;
  recommendations?: string[];
  focusAreas?: string[];
}

export const PersonalizationInsights: React.FC<PersonalizationInsightsProps> = ({
  context,
  profileStrength = 75,
  recommendations = [],
  focusAreas = []
}) => {
  const getStrengthColor = (strength: number) => {
    if (strength >= 80) return 'text-green-500';
    if (strength >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getStrengthLabel = (strength: number) => {
    if (strength >= 80) return 'Excelente';
    if (strength >= 60) return 'Bom';
    return 'Básico';
  };

  return (
    <Card className="mb-6 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Brain className="h-5 w-5 text-primary" />
          Perfil de Personalização
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Força do Perfil */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Força do Perfil para Personalização</span>
            <span className={`text-sm font-bold ${getStrengthColor(profileStrength)}`}>
              {profileStrength}% - {getStrengthLabel(profileStrength)}
            </span>
          </div>
          <Progress value={profileStrength} className="h-2" />
        </div>

        {/* Cards de Contexto */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Perfil Pessoal */}
          <div className="bg-background/50 rounded-lg p-3 border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <User className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium text-muted-foreground">PERFIL</span>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold">{context.personalProfile.name}</p>
              <p className="text-xs text-muted-foreground">{context.personalProfile.location}</p>
              <Badge variant="outline" className="text-xs">
                {context.personalProfile.experienceLevel}
              </Badge>
            </div>
          </div>

          {/* Contexto Empresarial */}
          <div className="bg-background/50 rounded-lg p-3 border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium text-muted-foreground">EMPRESA</span>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold truncate">{context.businessContext.company}</p>
              <p className="text-xs text-muted-foreground">{context.businessContext.sector}</p>
              <p className="text-xs text-muted-foreground">{context.businessContext.position}</p>
            </div>
          </div>

          {/* Objetivos */}
          <div className="bg-background/50 rounded-lg p-3 border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium text-muted-foreground">OBJETIVO</span>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold">{context.objectives.primaryGoal}</p>
              {context.objectives.timeline && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">{context.objectives.timeline}</p>
                </div>
              )}
            </div>
          </div>

          {/* Aprendizado */}
          <div className="bg-background/50 rounded-lg p-3 border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium text-muted-foreground">APRENDIZADO</span>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold">{context.learningPreferences.style}</p>
              {context.learningPreferences.availability && (
                <p className="text-xs text-muted-foreground">{context.learningPreferences.availability}</p>
              )}
            </div>
          </div>
        </div>

        {/* Áreas de Foco */}
        {focusAreas.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Áreas de Foco Recomendadas</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {focusAreas.map((area, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {area}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Recomendações */}
        {recommendations.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Recomendações Estratégicas</span>
            </div>
            <div className="space-y-1">
              {recommendations.map((rec, index) => (
                <div key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-primary mt-1">•</span>
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Status da IA */}
        <div className="bg-background/30 rounded-lg p-3 border border-primary/30">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Status de IA na Empresa</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {context.aiReadiness.currentStatus}
            </span>
            <Badge variant={context.aiReadiness.currentStatus === 'Já implementado' ? 'default' : 'outline'}>
              {context.aiReadiness.approach}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};