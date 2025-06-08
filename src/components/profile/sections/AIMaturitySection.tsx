
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Brain, Zap, Users, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { OnboardingData } from '@/components/onboarding/types/onboardingTypes';

interface AIMaturitySectionProps {
  data: OnboardingData;
}

export const AIMaturitySection = ({ data }: AIMaturitySectionProps) => {
  const getAILevelInfo = (level: string) => {
    const levelMap: Record<string, { label: string; progress: number; color: string }> = {
      'beginner': { label: 'Iniciante', progress: 25, color: 'bg-blue-500/20 text-blue-400' },
      'intermediate': { label: 'Intermediário', progress: 50, color: 'bg-green-500/20 text-green-400' },
      'advanced': { label: 'Avançado', progress: 75, color: 'bg-yellow-500/20 text-yellow-400' },
      'expert': { label: 'Especialista', progress: 100, color: 'bg-purple-500/20 text-purple-400' },
    };
    return levelMap[level] || { label: level, progress: 0, color: 'bg-gray-500/20 text-gray-400' };
  };

  const getImplementationIcon = (status: string) => {
    switch (status) {
      case 'yes': return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'tried-failed': return <AlertCircle className="h-4 w-4 text-yellow-400" />;
      case 'no': return <XCircle className="h-4 w-4 text-red-400" />;
      default: return null;
    }
  };

  const getImplementationText = (status: string) => {
    const statusMap: Record<string, string> = {
      'yes': 'Já implementou IA',
      'tried-failed': 'Tentou implementar',
      'no': 'Nunca implementou',
    };
    return statusMap[status] || status;
  };

  const getWhoWillImplementText = (who: string) => {
    const whoMap: Record<string, string> = {
      'myself': 'Eu mesmo',
      'team': 'Minha equipe',
      'hire': 'Contratar terceiros',
    };
    return whoMap[who] || who;
  };

  const aiLevelInfo = data.aiKnowledgeLevel ? getAILevelInfo(data.aiKnowledgeLevel) : null;

  return (
    <Card className="glass-dark">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-high-contrast">
          <Brain className="h-5 w-5 text-viverblue" />
          Maturidade em IA
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {aiLevelInfo && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm text-medium-contrast">Nível de Conhecimento</label>
              <Badge className={aiLevelInfo.color}>
                {aiLevelInfo.label}
              </Badge>
            </div>
            <Progress value={aiLevelInfo.progress} className="h-2" />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.hasImplementedAI && (
            <div>
              <label className="text-sm text-medium-contrast">Experiência com IA</label>
              <div className="flex items-center gap-2 mt-1">
                {getImplementationIcon(data.hasImplementedAI)}
                <span className="text-high-contrast font-medium">
                  {getImplementationText(data.hasImplementedAI)}
                </span>
              </div>
            </div>
          )}

          {data.whoWillImplement && (
            <div>
              <label className="text-sm text-medium-contrast flex items-center gap-1">
                <Users className="h-4 w-4" />
                Quem irá implementar
              </label>
              <p className="text-high-contrast font-medium">
                {getWhoWillImplementText(data.whoWillImplement)}
              </p>
            </div>
          )}
        </div>

        {data.aiToolsUsed && data.aiToolsUsed.length > 0 && (
          <div>
            <label className="text-sm text-medium-contrast flex items-center gap-1">
              <Zap className="h-4 w-4" />
              Ferramentas de IA Utilizadas
            </label>
            <div className="flex flex-wrap gap-1 mt-2">
              {data.aiToolsUsed.map((tool, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tool}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {data.dailyTools && data.dailyTools.length > 0 && (
          <div>
            <label className="text-sm text-medium-contrast">Ferramentas do Dia a Dia</label>
            <div className="flex flex-wrap gap-1 mt-2">
              {data.dailyTools.map((tool, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tool}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
