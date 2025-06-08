
import React from 'react';
import { CheckCircle, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OnboardingData, OnboardingType } from '@/types/onboarding';

interface CompletionStepProps {
  data: Partial<OnboardingData>;
  type: OnboardingType;
  onFinish?: () => void;
}

export const CompletionStep: React.FC<CompletionStepProps> = ({
  data,
  type,
  onFinish
}) => {
  return (
    <div className="max-w-2xl mx-auto text-center">
      {/* Success Icon */}
      <div className="mb-8">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-12 h-12 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-primary mb-3">
          Parabéns, {data.preferredName || data.fullName}! 🎉
        </h1>
        <p className="text-lg text-muted-foreground">
          Seu perfil foi criado com sucesso
        </p>
      </div>

      {/* AI Message */}
      <div className="bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/20 rounded-lg p-6 mb-8">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold">
            IA
          </div>
          <div className="flex-1 text-left">
            <p className="font-semibold text-primary mb-2">
              Seu plano personalizado está sendo criado!
            </p>
            <p className="text-sm text-muted-foreground">
              Com base nas suas respostas, estou gerando um plano de implementação de IA 
              específico para <strong>{data.companyName}</strong> no setor de <strong>{data.businessSector}</strong>.
              <br /><br />
              Você receberá:
              <br />• Roteiro personalizado de soluções de IA
              <br />• Cronograma de implementação
              <br />• Recursos de aprendizado adequados ao seu nível
              <br />• Conexões com profissionais do seu setor
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-muted/50 rounded-lg p-4 text-left">
          <h3 className="font-semibold text-primary mb-2">Objetivo Principal</h3>
          <p className="text-sm text-muted-foreground">
            {data.mainObjective === 'reduce_costs' && 'Reduzir custos operacionais'}
            {data.mainObjective === 'increase_sales' && 'Aumentar vendas e receita'}
            {data.mainObjective === 'automate_processes' && 'Automatizar processos'}
            {data.mainObjective === 'innovate_products' && 'Inovar produtos/serviços'}
          </p>
        </div>
        
        <div className="bg-muted/50 rounded-lg p-4 text-left">
          <h3 className="font-semibold text-primary mb-2">Nível de Conhecimento</h3>
          <p className="text-sm text-muted-foreground">
            {data.aiKnowledgeLevel === 'beginner' && 'Iniciante'}
            {data.aiKnowledgeLevel === 'intermediate' && 'Intermediário'}
            {data.aiKnowledgeLevel === 'advanced' && 'Avançado'}
            {data.aiKnowledgeLevel === 'expert' && 'Expert'}
          </p>
        </div>
      </div>

      {/* Next Steps */}
      <div className="bg-gradient-to-r from-primary to-secondary rounded-lg p-6 text-white mb-8">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Sparkles className="w-5 h-5" />
          <h3 className="font-semibold">Próximos Passos</h3>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
            <span>Acesse seu dashboard personalizado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
            <span>Comece com sua primeira solução recomendada</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
            <span>Participe da comunidade exclusiva</span>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <Button 
        onClick={onFinish}
        size="lg"
        className="w-full md:w-auto"
      >
        <span>Ir para o Dashboard</span>
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>

      {/* Footer Message */}
      <p className="text-xs text-muted-foreground mt-6">
        Você pode atualizar suas preferências a qualquer momento no seu perfil
      </p>
    </div>
  );
};
