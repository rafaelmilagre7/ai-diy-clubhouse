import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle, Sparkles, ArrowRight } from 'lucide-react';
import { SimpleOnboardingData } from '@/hooks/useSimpleOnboarding';

interface SimpleStep6Props {
  data: SimpleOnboardingData;
  onComplete: () => Promise<boolean>;
  onPrevious: () => void;
  isLoading: boolean;
}

export const SimpleStep6: React.FC<SimpleStep6Props> = ({ data, onComplete, onPrevious, isLoading }) => {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
          <Sparkles className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-foreground">Quase pronto!</h1>
        <p className="text-lg text-muted-foreground max-w-md mx-auto">
          Vamos finalizar seu onboarding e começar sua jornada personalizada de IA.
        </p>
      </div>

      <Card className="p-6 space-y-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            Resumo do seu perfil
          </h2>
          
          <div className="grid gap-4">
            {/* Informações pessoais */}
            {data.personal_info.name && (
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-muted-foreground">Nome:</span>
                <span className="font-medium">{data.personal_info.name}</span>
              </div>
            )}

            {/* Empresa */}
            {data.business_info.company_name && (
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-muted-foreground">Empresa:</span>
                <span className="font-medium">{data.business_info.company_name}</span>
              </div>
            )}

            {/* Nível de IA */}
            {data.ai_experience.ai_knowledge_level && (
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-muted-foreground">Nível de IA:</span>
                <span className="font-medium capitalize">
                  {data.ai_experience.ai_knowledge_level === 'beginner' && 'Iniciante'}
                  {data.ai_experience.ai_knowledge_level === 'intermediate' && 'Intermediário'}
                  {data.ai_experience.ai_knowledge_level === 'advanced' && 'Avançado'}
                </span>
              </div>
            )}

            {/* Objetivo principal */}
            {data.goals_info.main_objective && (
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-muted-foreground">Objetivo:</span>
                <span className="font-medium">
                  {data.goals_info.main_objective === 'automate_processes' && 'Automatizar processos'}
                  {data.goals_info.main_objective === 'improve_productivity' && 'Aumentar produtividade'}
                  {data.goals_info.main_objective === 'reduce_costs' && 'Reduzir custos'}
                  {data.goals_info.main_objective === 'improve_quality' && 'Melhorar qualidade'}
                  {data.goals_info.main_objective === 'learn_ai' && 'Aprender sobre IA'}
                  {data.goals_info.main_objective === 'other' && 'Outro objetivo'}
                </span>
              </div>
            )}

            {/* Tempo de aprendizado */}
            {data.personalization.weekly_learning_time && (
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-muted-foreground">Tempo semanal:</span>
                <span className="font-medium">
                  {data.personalization.weekly_learning_time === '30min' && '30 minutos'}
                  {data.personalization.weekly_learning_time === '1hour' && '1 hora'}
                  {data.personalization.weekly_learning_time === '2-3hours' && '2-3 horas'}
                  {data.personalization.weekly_learning_time === 'flexible' && 'Flexível'}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-primary/5 p-4 rounded-lg">
          <h3 className="font-semibold text-primary mb-2">🎯 O que acontece agora?</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Você será redirecionado para seu dashboard personalizado</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Receberá conteúdo curado baseado no seu perfil</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Poderá acessar ferramentas e recursos exclusivos</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Começará a receber atualizações conforme sua preferência</span>
            </li>
          </ul>
        </div>
      </Card>

      {/* Navegação */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrevious} disabled={isLoading}>
          ← Voltar
        </Button>
        
        <Button 
          onClick={onComplete} 
          disabled={isLoading}
          size="lg"
          className="min-w-[200px] bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
              Finalizando...
            </>
          ) : (
            <>
              Finalizar Onboarding
              <ArrowRight className="w-5 h-5 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};