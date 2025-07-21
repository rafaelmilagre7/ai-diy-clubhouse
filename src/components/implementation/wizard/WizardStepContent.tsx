
import React from "react";
import { Solution } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckSquare, Info, Tool, Zap } from "lucide-react";

interface WizardStepContentProps {
  solution: Solution;
  currentStep: number;
  stepData?: {
    id: number;
    title: string;
    description: string;
    type: string;
  };
  onInteraction: () => void;
}

export const WizardStepContent: React.FC<WizardStepContentProps> = ({
  solution,
  currentStep,
  stepData,
  onInteraction
}) => {
  // Parse solution data
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

  const getToolsNeeded = () => {
    if (!solution.tools_needed) return [];
    try {
      return typeof solution.tools_needed === 'string'
        ? JSON.parse(solution.tools_needed)
        : solution.tools_needed;
    } catch (e) {
      return [];
    }
  };

  const implementationSteps = getImplementationSteps();
  const checklistItems = getChecklistItems();
  const toolsNeeded = getToolsNeeded();

  const renderBasicInfo = () => (
    <div className="space-y-6">
      <div className="flex items-start space-x-4">
        <div className="p-3 bg-viverblue/10 rounded-lg">
          <Info className="h-6 w-6 text-viverblue" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-slate-800 mb-3">
            Sobre esta Solução
          </h3>
          <p className="text-slate-600 leading-relaxed mb-4">
            {solution.description || "Esta solução irá ajudá-lo a implementar melhorias em seu negócio."}
          </p>
          
          {solution.category && (
            <div className="flex items-center space-x-2 mb-4">
              <Badge variant="secondary" className="bg-viverblue/10 text-viverblue">
                {solution.category}
              </Badge>
            </div>
          )}

          <div className="bg-slate-50 p-4 rounded-lg">
            <h4 className="font-medium text-slate-800 mb-2">O que você vai aprender:</h4>
            <ul className="text-sm text-slate-600 space-y-1">
              <li>• Como implementar esta solução no seu negócio</li>
              <li>• Ferramentas necessárias e como usá-las</li>
              <li>• Checklist para validar a implementação</li>
              <li>• Próximos passos após a implementação</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTools = () => (
    <div className="space-y-6">
      <div className="flex items-start space-x-4">
        <div className="p-3 bg-amber-100 rounded-lg">
          <Tool className="h-6 w-6 text-amber-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-slate-800 mb-3">
            Ferramentas Necessárias
          </h3>
          
          {toolsNeeded.length > 0 ? (
            <div className="grid gap-4">
              {toolsNeeded.map((tool: any, index: number) => (
                <Card key={index} className="p-4 border-l-4 border-l-amber-500">
                  <h4 className="font-medium text-slate-800 mb-2">
                    {tool.name || `Ferramenta ${index + 1}`}
                  </h4>
                  {tool.description && (
                    <p className="text-sm text-slate-600 mb-2">{tool.description}</p>
                  )}
                  {tool.link && (
                    <a 
                      href={tool.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-viverblue hover:underline"
                      onClick={onInteraction}
                    >
                      Acessar ferramenta →
                    </a>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <div className="bg-slate-50 p-6 rounded-lg text-center">
              <Tool className="h-12 w-12 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-600">
                Nenhuma ferramenta específica necessária para esta implementação.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderImplementationStep = () => {
    const stepIndex = currentStep - 2; // Assuming basic info and tools are first
    const step = implementationSteps[stepIndex];
    
    if (!step) {
      return (
        <div className="text-center py-8">
          <Zap className="h-12 w-12 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-600">Conteúdo de implementação em preparação.</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-green-100 rounded-lg">
            <Zap className="h-6 w-6 text-green-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-800 mb-3">
              {step.title || `Passo de Implementação`}
            </h3>
            
            {step.description && (
              <div className="prose prose-sm max-w-none mb-4">
                <p className="text-slate-600">{step.description}</p>
              </div>
            )}

            {step.content && (
              <Card className="p-4 bg-slate-50">
                <div className="prose prose-sm max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: step.content }} />
                </div>
              </Card>
            )}

            {step.tips && step.tips.length > 0 && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">💡 Dicas importantes:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  {step.tips.map((tip: string, index: number) => (
                    <li key={index}>• {tip}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderChecklist = () => (
    <div className="space-y-6">
      <div className="flex items-start space-x-4">
        <div className="p-3 bg-purple-100 rounded-lg">
          <CheckSquare className="h-6 w-6 text-purple-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-slate-800 mb-3">
            Checklist de Verificação
          </h3>
          
          {checklistItems.length > 0 ? (
            <div className="space-y-3">
              {checklistItems.map((item: any, index: number) => (
                <label key={index} className="flex items-start space-x-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 text-viverblue focus:ring-viverblue border-gray-300 rounded"
                    onChange={onInteraction}
                  />
                  <div className="flex-1">
                    <span className="text-slate-800 font-medium">
                      {item.text || item.title || `Item ${index + 1}`}
                    </span>
                    {item.description && (
                      <p className="text-sm text-slate-600 mt-1">{item.description}</p>
                    )}
                  </div>
                </label>
              ))}
            </div>
          ) : (
            <div className="bg-slate-50 p-6 rounded-lg text-center">
              <CheckSquare className="h-12 w-12 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-600">
                Checklist personalizado será criado baseado na sua implementação.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderCompletion = () => (
    <div className="space-y-6 text-center">
      <div className="p-6 bg-green-50 rounded-lg">
        <CheckSquare className="h-16 w-16 text-green-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-green-800 mb-2">
          Parabéns! 🎉
        </h3>
        <p className="text-green-700 mb-4">
          Você está pronto para finalizar a implementação de "{solution.title}"
        </p>
        <div className="bg-white p-4 rounded-lg border border-green-200">
          <p className="text-sm text-slate-600">
            Ao clicar em "Finalizar", você confirmará que implementou esta solução em seu negócio.
          </p>
        </div>
      </div>
    </div>
  );

  // Render appropriate content based on step type or index
  if (stepData?.type === "basic" || currentStep === 0) {
    return renderBasicInfo();
  } else if (stepData?.type === "tools" || currentStep === 1) {
    return renderTools();
  } else if (stepData?.type === "checklist" || (implementationSteps.length > 0 && currentStep === implementationSteps.length + 2)) {
    return renderChecklist();
  } else if (stepData?.type === "completion" || currentStep >= implementationSteps.length + 3) {
    return renderCompletion();
  } else {
    return renderImplementationStep();
  }
};
