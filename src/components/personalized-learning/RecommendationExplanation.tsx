import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PersonalizedContext } from '@/adapters/OnboardingToAIAdapter';
import { 
  Lightbulb, 
  ArrowRight, 
  CheckCircle, 
  Target,
  Users,
  TrendingUp,
  Calendar,
  Briefcase
} from 'lucide-react';

interface RecommendationExplanationProps {
  reasoning?: string;
  userProfile: PersonalizedContext;
  aiAnalysis?: {
    opportunities?: string;
    strategic_goals?: string;
    implementation_phases?: string[];
  };
}

export const RecommendationExplanation: React.FC<RecommendationExplanationProps> = ({
  reasoning,
  userProfile,
  aiAnalysis
}) => {
  return (
    <Card className="mb-6 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200/50 dark:border-blue-800/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Lightbulb className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          Por que essas aulas foram recomendadas para você?
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Análise Personalizada */}
        <div className="bg-background/50 rounded-lg p-4 border border-operational/30">
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 dark:bg-blue-900/40 rounded-full p-2 mt-1">
              <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-foreground mb-2">
                Análise do Seu Perfil, {userProfile.personalProfile.name}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground">Setor:</span>
                    <Badge variant="outline">{userProfile.businessContext.sector}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground">Experiência IA:</span>
                    <Badge variant="outline">{userProfile.aiReadiness.experienceLevel}</Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Target className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground">Objetivo:</span>
                    <span className="text-foreground font-medium">{userProfile.objectives.primaryGoal}</span>
                  </div>
                  {userProfile.objectives.timeline && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">Prazo:</span>
                      <span className="text-foreground">{userProfile.objectives.timeline}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Oportunidades Identificadas */}
        {aiAnalysis?.opportunities && (
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
              Oportunidades de IA Identificadas
            </h4>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {aiAnalysis.opportunities}
            </p>
          </div>
        )}

        {/* Objetivos Estratégicos */}
        {aiAnalysis?.strategic_goals && (
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground flex items-center gap-2">
              <Target className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              Objetivos Estratégicos Personalizados
            </h4>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {aiAnalysis.strategic_goals}
            </p>
          </div>
        )}

        {/* Fases de Implementação */}
        {aiAnalysis?.implementation_phases && aiAnalysis.implementation_phases.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground flex items-center gap-2">
              <ArrowRight className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              Roadmap de Implementação Sugerido
            </h4>
            <div className="space-y-2">
              {aiAnalysis.implementation_phases.map((phase, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="bg-purple-100 dark:bg-purple-900/40 rounded-full w-6 h-6 flex items-center justify-center">
                    <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
                      {index + 1}
                    </span>
                  </div>
                  <span className="text-sm text-muted-foreground">{phase}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Critérios de Seleção */}
        <div className="bg-gradient-to-r from-green-50/50 to-emerald-50/50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg p-4 border border-green-200/30 dark:border-green-800/30">
          <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            Critérios de Personalização Aplicados
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                <span className="text-muted-foreground">Nível de experiência atual</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                <span className="text-muted-foreground">Relevância para o setor</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                <span className="text-muted-foreground">Alinhamento com objetivos</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                <span className="text-muted-foreground">Estilo de aprendizado</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                <span className="text-muted-foreground">Disponibilidade de tempo</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                <span className="text-muted-foreground">Contexto empresarial</span>
              </div>
            </div>
          </div>
        </div>

        {/* Reasoning personalizado */}
        {reasoning && (
          <div className="bg-background/50 rounded-lg p-4 border border-border/50">
            <h4 className="font-semibold text-foreground mb-2">Justificativa Personalizada</h4>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {reasoning}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};