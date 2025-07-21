
import React from "react";
import { SolutionStep } from "@/hooks/implementation/useSolutionSteps";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface WizardStepContentProps {
  step: SolutionStep;
  onComplete: () => void;
  onInteraction: () => void;
}

export const WizardStepContent: React.FC<WizardStepContentProps> = ({
  step,
  onComplete,
  onInteraction
}) => {
  const getStepTypeBadge = (type: string) => {
    const badges = {
      overview: { label: "Visão Geral", variant: "secondary" as const },
      implementation: { label: "Implementação", variant: "default" as const },
      checklist: { label: "Verificação", variant: "default" as const },
      completion: { label: "Conclusão", variant: "secondary" as const },
    };
    
    return badges[type as keyof typeof badges] || { label: "Etapa", variant: "default" as const };
  };
  
  const badgeInfo = getStepTypeBadge(step.type);
  
  const renderStepContent = () => {
    switch (step.type) {
      case "overview":
        return <OverviewContent content={step.content} onInteraction={onInteraction} />;
      case "implementation":
        return <ImplementationContent content={step.content} onInteraction={onInteraction} />;
      case "checklist":
        return <ChecklistContent content={step.content} onInteraction={onInteraction} />;
      case "completion":
        return <CompletionContent content={step.content} onInteraction={onInteraction} />;
      default:
        return <div>Tipo de etapa não reconhecido: {step.type}</div>;
    }
  };
  
  return (
    <div className="animate-fade-in">
      <Card className="p-8 bg-white/95 backdrop-blur-sm border-0 shadow-xl">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Badge variant={badgeInfo.variant} className="text-xs">
              {badgeInfo.label}
            </Badge>
          </div>
          
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            {step.title}
          </h2>
        </div>
        
        <div className="min-h-[400px]">
          {renderStepContent()}
        </div>
      </Card>
    </div>
  );
};

// Overview Content Component
const OverviewContent: React.FC<{ content: any; onInteraction: () => void }> = ({ content, onInteraction }) => {
  React.useEffect(() => onInteraction(), [onInteraction]);
  
  return (
    <div className="space-y-6">
      {content.description && (
        <p className="text-lg text-slate-600 leading-relaxed">
          {content.description}
        </p>
      )}
      
      {content.overview && (
        <div className="bg-slate-50 p-6 rounded-lg">
          <h3 className="font-semibold text-slate-800 mb-3">Sobre esta solução:</h3>
          <p className="text-slate-600">{content.overview}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">Tempo estimado</h4>
          <p className="text-blue-600">{content.estimated_time}</p>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-medium text-green-800 mb-2">Dificuldade</h4>
          <p className="text-green-600">{content.difficulty}</p>
        </div>
      </div>
      
      {content.learning_objectives && content.learning_objectives.length > 0 && (
        <div>
          <h3 className="font-semibold text-slate-800 mb-3">Objetivos de implementação:</h3>
          <ul className="list-disc pl-6 space-y-2">
            {content.learning_objectives.map((objective: string, index: number) => (
              <li key={index} className="text-slate-600">{objective}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// Implementation Content Component
const ImplementationContent: React.FC<{ content: any; onInteraction: () => void }> = ({ content, onInteraction }) => {
  React.useEffect(() => onInteraction(), [onInteraction]);
  
  return (
    <div className="space-y-6">
      {content.description && (
        <p className="text-lg text-slate-600 leading-relaxed">
          {content.description}
        </p>
      )}
      
      {content.instructions && (
        <div className="bg-slate-50 p-6 rounded-lg">
          <h3 className="font-semibold text-slate-800 mb-3">Instruções:</h3>
          <div className="prose prose-slate max-w-none">
            {typeof content.instructions === 'string' ? (
              <p>{content.instructions}</p>
            ) : (
              <div>{content.instructions}</div>
            )}
          </div>
        </div>
      )}
      
      {content.tips && Array.isArray(content.tips) && content.tips.length > 0 && (
        <div className="bg-amber-50 p-6 rounded-lg">
          <h3 className="font-semibold text-amber-800 mb-3">Dicas importantes:</h3>
          <ul className="list-disc pl-6 space-y-2">
            {content.tips.map((tip: string, index: number) => (
              <li key={index} className="text-amber-700">{tip}</li>
            ))}
          </ul>
        </div>
      )}
      
      {content.resources && Array.isArray(content.resources) && content.resources.length > 0 && (
        <div>
          <h3 className="font-semibold text-slate-800 mb-3">Recursos necessários:</h3>
          <ul className="list-disc pl-6 space-y-2">
            {content.resources.map((resource: string, index: number) => (
              <li key={index} className="text-slate-600">{resource}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// Checklist Content Component
const ChecklistContent: React.FC<{ content: any; onInteraction: () => void }> = ({ content, onInteraction }) => {
  const [checkedItems, setCheckedItems] = React.useState<Set<string>>(new Set());
  
  const handleItemCheck = (itemId: string) => {
    const newCheckedItems = new Set(checkedItems);
    if (newCheckedItems.has(itemId)) {
      newCheckedItems.delete(itemId);
    } else {
      newCheckedItems.add(itemId);
    }
    setCheckedItems(newCheckedItems);
    onInteraction();
  };
  
  return (
    <div className="space-y-6">
      {content.description && (
        <p className="text-lg text-slate-600 leading-relaxed">
          {content.description}
        </p>
      )}
      
      {content.checklist && Array.isArray(content.checklist) && (
        <div className="space-y-4">
          <h3 className="font-semibold text-slate-800 mb-4">Lista de verificação:</h3>
          {content.checklist.map((item: any, index: number) => {
            const itemId = item.id || `item-${index}`;
            const isChecked = checkedItems.has(itemId);
            
            return (
              <div 
                key={itemId} 
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  isChecked 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
                onClick={() => handleItemCheck(itemId)}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-5 h-5 mt-1 rounded border-2 flex items-center justify-center ${
                    isChecked 
                      ? 'bg-green-500 border-green-500' 
                      : 'border-slate-300'
                  }`}>
                    {isChecked && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-slate-800">{item.title || item.text}</h4>
                    {item.description && (
                      <p className="text-sm text-slate-600 mt-1">{item.description}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Completion Content Component
const CompletionContent: React.FC<{ content: any; onInteraction: () => void }> = ({ content, onInteraction }) => {
  React.useEffect(() => onInteraction(), [onInteraction]);
  
  return (
    <div className="text-center space-y-6">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <svg className="w-10 h-10 text-green-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      </div>
      
      <div>
        <h3 className="text-2xl font-bold text-slate-800 mb-2">
          {content.completion_message || "Implementação concluída!"}
        </h3>
        <p className="text-slate-600">
          Você implementou com sucesso: <strong>{content.title}</strong>
        </p>
      </div>
      
      {content.next_steps && Array.isArray(content.next_steps) && content.next_steps.length > 0 && (
        <div className="bg-slate-50 p-6 rounded-lg">
          <h4 className="font-semibold text-slate-800 mb-3">Próximos passos:</h4>
          <ul className="list-disc pl-6 space-y-2 text-left">
            {content.next_steps.map((step: string, index: number) => (
              <li key={index} className="text-slate-600">{step}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
