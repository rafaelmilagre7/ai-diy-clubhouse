import React from 'react';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, AlertTriangle, CheckCircle, Target, Lightbulb } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { OnboardingData } from '../types/onboardingTypes';

interface IntelligentProfileAnalysisProps {
  data: OnboardingData;
}

export const IntelligentProfileAnalysis: React.FC<IntelligentProfileAnalysisProps> = ({ data }) => {
  // Análise de maturidade em IA
  const getAIMaturityScore = () => {
    let score = 0;
    let maxScore = 100;

    // Experiência prévia (30 pontos)
    if (data.hasImplementedAI === 'yes') score += 30;
    else if (data.hasImplementedAI === 'tried-failed') score += 15;

    // Nível de conhecimento (25 pontos)
    const knowledgeMap: Record<string, number> = {
      'beginner': 5,
      'intermediate': 15,
      'advanced': 25
    };
    score += knowledgeMap[data.aiKnowledgeLevel || ''] || 0;

    // Capacidade de implementação (20 pontos)
    const implementationMap: Record<string, number> = {
      'myself': 20,
      'team': 15,
      'outsource': 10
    };
    score += implementationMap[data.whoWillImplement || ''] || 0;

    // Ferramentas já utilizadas (15 pontos)
    if (data.aiToolsUsed && data.aiToolsUsed.length > 0) {
      score += Math.min(data.aiToolsUsed.length * 3, 15);
    }

    // Urgência e objetivos claros (10 pontos)
    if (data.aiImplementationUrgency === 'immediate') score += 10;
    else if (data.aiImplementationUrgency === 'this-quarter') score += 7;
    else if (data.aiImplementationUrgency === 'this-year') score += 5;

    return Math.min(score, maxScore);
  };

  // Análise do perfil empresarial
  const getBusinessReadiness = () => {
    const factors = [];
    
    // Tamanho da empresa
    if (data.companySize) {
      const sizeMap: Record<string, string> = {
        'startup': 'Agilidade para implementar rapidamente',
        'small': 'Flexibilidade para mudanças',
        'medium': 'Recursos equilibrados',
        'large': 'Recursos robustos para implementação',
        'enterprise': 'Infraestrutura avançada'
      };
      factors.push(sizeMap[data.companySize] || '');
    }

    // Orçamento
    if (data.aiImplementationBudget) {
      const budgetMap: Record<string, string> = {
        'under-10k': 'Foco em soluções de baixo custo',
        '10k-50k': 'Investimento moderado possível',
        '50k-100k': 'Orçamento substancial',
        'over-100k': 'Alto potencial de investimento'
      };
      factors.push(budgetMap[data.aiImplementationBudget] || '');
    }

    return factors.filter(Boolean);
  };

  // Recomendações personalizadas
  const getPersonalizedRecommendations = () => {
    const recommendations = [];
    const score = getAIMaturityScore();

    if (score < 30) {
      recommendations.push({
        type: 'learning',
        title: 'Fundamentação em IA',
        description: 'Recomendamos começar com cursos básicos sobre IA e suas aplicações empresariais'
      });
    }

    if (data.hasImplementedAI === 'tried-failed') {
      recommendations.push({
        type: 'support',
        title: 'Mentoria Especializada',
        description: 'Indicamos acompanhamento próximo para evitar erros anteriores'
      });
    }

    if (data.mainObjective === 'reduce-costs') {
      recommendations.push({
        type: 'strategy',
        title: 'Automação de Processos',
        description: 'Foque em soluções de RPA e automação para redução de custos imediata'
      });
    }

    if (data.aiImplementationUrgency === 'immediate') {
      recommendations.push({
        type: 'priority',
        title: 'Implementação Rápida',
        description: 'Priorizaremos soluções de implementação rápida com ROI imediato'
      });
    }

    return recommendations;
  };

  const maturityScore = getAIMaturityScore();
  const businessFactors = getBusinessReadiness();
  const recommendations = getPersonalizedRecommendations();

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-400';
    if (score >= 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 70) return 'Avançado';
    if (score >= 40) return 'Intermediário';
    return 'Iniciante';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Score de Maturidade */}
      <Card className="p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
            <Brain className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white">Índice de Maturidade em IA</h3>
            <p className="text-neutral-300 text-sm">Baseado no seu perfil e experiência</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-neutral-400">Pontuação</span>
              <span className={`text-2xl font-bold ${getScoreColor(maturityScore)}`}>
                {maturityScore}/100
              </span>
            </div>
            <div className="w-full bg-neutral-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-1000 ${
                  maturityScore >= 70 ? 'bg-green-400' : 
                  maturityScore >= 40 ? 'bg-yellow-400' : 'bg-red-400'
                }`}
                style={{ width: `${maturityScore}%` }}
              />
            </div>
          </div>
          <Badge variant="outline" className={`${getScoreColor(maturityScore)} border-current`}>
            {getScoreLabel(maturityScore)}
          </Badge>
        </div>
      </Card>

      {/* Fatores Empresariais */}
      {businessFactors.length > 0 && (
        <Card className="p-6 bg-neutral-900/50 border-neutral-700">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-5 h-5 text-green-400" />
            <h3 className="text-lg font-semibold text-white">Pontos Fortes Empresariais</h3>
          </div>
          <div className="space-y-2">
            {businessFactors.map((factor, index) => (
              <div key={index} className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                <span className="text-neutral-300 text-sm">{factor}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Recomendações Personalizadas */}
      {recommendations.length > 0 && (
        <Card className="p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20">
          <div className="flex items-center gap-3 mb-4">
            <Lightbulb className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-semibold text-white">Recomendações Personalizadas</h3>
          </div>
          <div className="space-y-4">
            {recommendations.map((rec, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-neutral-800/50 rounded-lg p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                    {rec.type === 'learning' && <Brain className="w-4 h-4 text-purple-400" />}
                    {rec.type === 'support' && <Target className="w-4 h-4 text-purple-400" />}
                    {rec.type === 'strategy' && <TrendingUp className="w-4 h-4 text-purple-400" />}
                    {rec.type === 'priority' && <AlertTriangle className="w-4 h-4 text-purple-400" />}
                  </div>
                  <div>
                    <h4 className="font-medium text-white mb-1">{rec.title}</h4>
                    <p className="text-sm text-neutral-300">{rec.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      )}
    </motion.div>
  );
};