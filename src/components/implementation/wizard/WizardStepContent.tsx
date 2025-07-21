
import React from "react";
import { Solution } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckSquare, Info, Zap, Target, Clock, ArrowRight } from "lucide-react";
import { createSafeHTML } from "@/utils/htmlSanitizer";

interface WizardStepContentProps {
  solution: Solution;
  stepType: string;
  stepIndex: number;
  onNext: () => void;
  canGoNext: boolean;
}

export const WizardStepContent: React.FC<WizardStepContentProps> = ({
  solution,
  stepType,
  stepIndex,
  onNext,
  canGoNext
}) => {
  // Parse implementation steps safely
  const getImplementationSteps = () => {
    if (!solution.implementation_steps) return [];
    try {
      return typeof solution.implementation_steps === 'string'
        ? JSON.parse(solution.implementation_steps)
        : solution.implementation_steps;
    } catch (e) {
      return [];
    }
  };

  // Parse checklist items safely
  const getChecklistItems = () => {
    if (!solution.checklist_items) return [];
    try {
      return typeof solution.checklist_items === 'string'
        ? JSON.parse(solution.checklist_items)
        : solution.checklist_items;
    } catch (e) {
      return [];
    }
  };

  const renderOverviewStep = () => (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="p-4 bg-gradient-to-br from-viverblue/10 to-viverblue-dark/5 rounded-xl border border-viverblue/20">
          <Target className="h-12 w-12 text-viverblue mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">
            {solution.title}
          </h2>
          <p className="text-neutral-600 text-lg">
            {solution.description}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 border-l-4 border-l-viverblue">
          <Badge variant="secondary" className="mb-3">
            <Target className="h-3 w-3 mr-1" />
            Categoria
          </Badge>
          <p className="font-medium text-neutral-900">{solution.category}</p>
        </Card>

        <Card className="p-4 border-l-4 border-l-amber-500">
          <Badge variant="secondary" className="mb-3">
            <Zap className="h-3 w-3 mr-1" />
            Dificuldade
          </Badge>
          <p className="font-medium text-neutral-900">{solution.difficulty}</p>
        </Card>

        {solution.estimated_time && (
          <Card className="p-4 border-l-4 border-l-green-500">
            <Badge variant="secondary" className="mb-3">
              <Clock className="h-3 w-3 mr-1" />
              Tempo Estimado
            </Badge>
            <p className="font-medium text-neutral-900">{solution.estimated_time} min</p>
          </Card>
        )}
      </div>

      {solution.overview && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center">
            <Info className="h-5 w-5 mr-2 text-viverblue" />
            Sobre esta Solução
          </h3>
          <div 
            className="prose max-w-none text-neutral-700"
            dangerouslySetInnerHTML={createSafeHTML(solution.overview)}
          />
        </Card>
      )}

      <div className="flex justify-end">
        <Button onClick={onNext} className="bg-viverblue hover:bg-viverblue/90">
          Começar Implementação
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );

  const renderImplementationStep = () => {
    const implementationSteps = getImplementationSteps();
    const hasSteps = implementationSteps.length > 0;
    
    // For implementation steps, stepIndex - 1 because overview is step 0
    const currentImplementationIndex = stepIndex - 1;
    const currentImplementationStep = hasSteps ? implementationSteps[currentImplementationIndex] : null;

    return (
      <div className="space-y-6">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-viverblue/10 rounded-lg">
            <Zap className="h-6 w-6 text-viverblue" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-neutral-900 mb-3">
              {currentImplementationStep?.title || "Implementação"}
            </h3>
            
            {currentImplementationStep ? (
              <div className="space-y-4">
                {currentImplementationStep.description && (
                  <div 
                    className="prose max-w-none text-neutral-700"
                    dangerouslySetInnerHTML={createSafeHTML(currentImplementationStep.description)}
                  />
                )}
                
                {currentImplementationStep.details && (
                  <Card className="p-4 bg-amber-50 border-amber-200">
                    <h4 className="font-medium text-amber-800 mb-2">Detalhes Importantes:</h4>
                    <div 
                      className="text-amber-700 text-sm"
                      dangerouslySetInnerHTML={createSafeHTML(currentImplementationStep.details)}
                    />
                  </Card>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-neutral-700">
                  Siga as orientações para implementar esta solução em seu negócio.
                </p>
                
                {solution.overview && (
                  <Card className="p-4 bg-blue-50 border-blue-200">
                    <div 
                      className="text-blue-700 text-sm"
                      dangerouslySetInnerHTML={createSafeHTML(solution.overview)}
                    />
                  </Card>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={onNext} disabled={!canGoNext} className="bg-viverblue hover:bg-viverblue/90">
            Próximo Passo
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  };

  const renderChecklistStep = () => {
    const checklistItems = getChecklistItems();

    return (
      <div className="space-y-6">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-green-100 rounded-lg">
            <CheckSquare className="h-6 w-6 text-green-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-neutral-900 mb-3">
              Lista de Verificação
            </h3>
            <p className="text-neutral-600 mb-4">
              Confirme se todos os itens foram implementados corretamente:
            </p>

            {checklistItems.length > 0 ? (
              <div className="space-y-3">
                {checklistItems.map((item: any, index: number) => (
                  <Card key={index} className="p-4 hover:bg-neutral-50 transition-colors">
                    <div className="flex items-start space-x-3">
                      <CheckSquare className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="font-medium text-neutral-900">
                          {typeof item === 'string' ? item : item.title || `Item ${index + 1}`}
                        </h4>
                        {typeof item === 'object' && item.description && (
                          <p className="text-sm text-neutral-600 mt-1">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-6 text-center">
                <CheckSquare className="h-12 w-12 text-neutral-400 mx-auto mb-3" />
                <p className="text-neutral-600">
                  Revise sua implementação e confirme se tudo está funcionando conforme esperado.
                </p>
              </Card>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={onNext} className="bg-viverblue hover:bg-viverblue/90">
            Verificação Concluída
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  };

  const renderCompletionStep = () => (
    <div className="space-y-6 text-center">
      <div className="p-8 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
        <div className="p-4 bg-green-100 rounded-full w-fit mx-auto mb-4">
          <CheckSquare className="h-12 w-12 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">
          Implementação Concluída!
        </h2>
        <p className="text-neutral-600 text-lg">
          Parabéns! Você implementou com sucesso a solução "{solution.title}".
        </p>
      </div>

      <Card className="p-6 text-left">
        <h3 className="text-lg font-semibold text-neutral-900 mb-3">
          Próximos Passos Recomendados:
        </h3>
        <ul className="space-y-2 text-neutral-700">
          <li className="flex items-center">
            <CheckSquare className="h-4 w-4 text-green-500 mr-2" />
            Monitore os resultados da implementação
          </li>
          <li className="flex items-center">
            <CheckSquare className="h-4 w-4 text-green-500 mr-2" />
            Documente os aprendizados obtidos
          </li>
          <li className="flex items-center">
            <CheckSquare className="h-4 w-4 text-green-500 mr-2" />
            Explore outras soluções relacionadas
          </li>
        </ul>
      </Card>
    </div>
  );

  // Render appropriate content based on step type
  switch (stepType) {
    case "overview":
      return renderOverviewStep();
    case "implementation":
      return renderImplementationStep();
    case "checklist":
      return renderChecklistStep();
    case "completion":
      return renderCompletionStep();
    default:
      return renderOverviewStep();
  }
};
