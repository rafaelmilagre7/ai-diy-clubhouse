
import React from "react";

const steps = [
  "Informações Básicas",
  "Ferramentas Necessárias",
  "Materiais de Apoio", 
  "Vídeo-aulas",
  "Checklist de Implementação",
  "Publicação"
];

interface SolutionCreateWizardStepsProps {
  currentStep?: number; // Permite extensão futura
}

const SolutionCreateWizardSteps: React.FC<SolutionCreateWizardStepsProps> = ({ currentStep = 0 }) => (
  <nav aria-label="Etapas do cadastro" className="mb-6">
    <ol className="flex flex-wrap gap-2 items-center">
      {steps.map((step, idx) => (
        <li key={step} className="flex items-center">
          <div className={`
            flex items-center justify-center w-8 h-8 rounded-full 
            text-sm font-bold
            ${idx === currentStep 
              ? 'bg-aurora-primary text-primary-foreground border-2 border-aurora-primary'
              : 'bg-muted text-foreground border border-border'
            }
          `}>
            {idx + 1}
          </div>
          <span className={`ml-2 mr-4 text-sm ${idx === currentStep ? 'text-aurora-primary font-semibold' : 'text-muted-foreground'}`}>
            {step}
          </span>
          {idx < steps.length - 1 && (
            <span className="text-muted-foreground mr-2">&rarr;</span>
          )}
        </li>
      ))}
    </ol>
  </nav>
);

export default SolutionCreateWizardSteps;
