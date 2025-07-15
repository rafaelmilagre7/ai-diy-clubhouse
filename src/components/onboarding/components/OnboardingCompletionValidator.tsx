import React from 'react';
import { CheckCircle, AlertCircle, User, Briefcase, Target, Settings } from 'lucide-react';

interface OnboardingCompletionValidatorProps {
  onboardingData: any;
  onComplete: () => void;
}

export const OnboardingCompletionValidator: React.FC<OnboardingCompletionValidatorProps> = ({
  onboardingData,
  onComplete
}) => {
  const validationRules = [
    {
      id: 'personal_info',
      label: 'Informações Pessoais',
      icon: User,
      validator: () => {
        const personal = onboardingData.personal_info || {};
        return {
          valid: !!(personal.name && personal.email),
          details: {
            name: !!personal.name,
            email: !!personal.email,
            phone: !!personal.phone
          }
        };
      }
    },
    {
      id: 'business_info', 
      label: 'Contexto Empresarial',
      icon: Briefcase,
      validator: () => {
        const business = onboardingData.business_info || {};
        return {
          valid: !!(business.position && business.businessSector),
          details: {
            position: !!business.position,
            businessSector: !!business.businessSector,
            companyName: !!business.companyName
          }
        };
      }
    },
    {
      id: 'ai_experience',
      label: 'Experiência com IA',
      icon: Target,
      validator: () => {
        const ai = onboardingData.ai_experience || {};
        return {
          valid: !!(ai.ai_knowledge_level),
          details: {
            knowledge_level: !!ai.ai_knowledge_level,
            has_experience: !!ai.has_implemented_ai
          }
        };
      }
    },
    {
      id: 'goals_info',
      label: 'Objetivos',
      icon: Target,
      validator: () => {
        const goals = onboardingData.goals_info || {};
        return {
          valid: !!(goals.main_objective),
          details: {
            main_objective: !!goals.main_objective,
            urgency_level: !!goals.urgency_level
          }
        };
      }
    },
    {
      id: 'preferences',
      label: 'Preferências',
      icon: Settings,
      validator: () => {
        const prefs = onboardingData.preferences || onboardingData.personalization || {};
        return {
          valid: !!(prefs.weekly_learning_time),
          details: {
            learning_time: !!prefs.weekly_learning_time,
            content_preference: !!(prefs.content_preference && prefs.content_preference.length > 0)
          }
        };
      }
    }
  ];

  const results = validationRules.map(rule => ({
    ...rule,
    result: rule.validator()
  }));

  const completionScore = results.reduce((score, item) => {
    return score + (item.result.valid ? 1 : 0);
  }, 0);

  const totalRules = results.length;
  const completionPercentage = Math.round((completionScore / totalRules) * 100);

  const isReadyToComplete = completionScore >= 4; // Pelo menos 4 de 5 seções

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="text-3xl font-bold text-foreground mb-2">
          {completionPercentage}% Completo
        </div>
        <div className="text-muted-foreground">
          {isReadyToComplete 
            ? "Tudo pronto! Você pode finalizar o onboarding."
            : "Algumas informações ainda precisam ser preenchidas."
          }
        </div>
      </div>

      <div className="space-y-4">
        {results.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.id} className="flex items-center gap-3 p-3 bg-card rounded-lg border">
              <div className="flex-shrink-0">
                {item.result.valid ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-orange-500" />
                )}
              </div>
              <Icon className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <div className="font-medium text-foreground">{item.label}</div>
                <div className="text-sm text-muted-foreground">
                  {item.result.valid 
                    ? "✓ Informações completas" 
                    : "⚠ Informações incompletas"
                  }
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {isReadyToComplete && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
            <CheckCircle className="h-5 w-5" />
            <div className="font-medium">Pronto para finalizar!</div>
          </div>
          <div className="text-sm text-green-600 dark:text-green-400 mt-1">
            Suas informações estão completas e você já pode acessar todas as funcionalidades da plataforma.
          </div>
        </div>
      )}
    </div>
  );
};