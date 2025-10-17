
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";

interface Step {
  title: string;
  description: string;
  imageUrl: string;
}

interface StepsBlockProps {
  data: {
    title: string;
    steps: Step[];
  };
  onChange: (data: any) => void;
}

const StepsBlock: React.FC<StepsBlockProps> = ({ data, onChange }) => {
  const updateStep = (index: number, field: keyof Step, value: string) => {
    const newSteps = [...data.steps];
    newSteps[index] = {
      ...newSteps[index],
      [field]: value
    };
    onChange({ ...data, steps: newSteps });
  };

  const addStep = () => {
    const stepNumber = data.steps.length + 1;
    onChange({
      ...data,
      steps: [...data.steps, { title: `Passo ${stepNumber}`, description: "", imageUrl: "" }]
    });
  };

  const removeStep = (index: number) => {
    const newSteps = [...data.steps];
    newSteps.splice(index, 1);
    
    // Renumerar os passos para manter a sequência
    const renamedSteps = newSteps.map((step, i) => {
      if (step.title.startsWith("Passo ")) {
        return { ...step, title: `Passo ${i + 1}` };
      }
      return step;
    });
    
    onChange({ ...data, steps: renamedSteps });
  };

  return (
    <div className="space-y-4">
      <Input
        value={data.title}
        onChange={(e) => onChange({ ...data, title: e.target.value })}
        placeholder="Título da sequência de passos"
      />
      
      <div className="space-y-4">
        {data.steps.map((step, index) => (
          <div key={index} className="border p-3 rounded-md">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-medium">Passo {index + 1}</h4>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeStep(index)}
                disabled={data.steps.length === 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-2">
              <Input
                value={step.title}
                onChange={(e) => updateStep(index, "title", e.target.value)}
                placeholder="Título do passo"
              />
              
              <Textarea
                value={step.description}
                onChange={(e) => updateStep(index, "description", e.target.value)}
                placeholder="Descrição detalhada deste passo..."
                className="min-h-20"
              />
              
              <Input
                value={step.imageUrl}
                onChange={(e) => updateStep(index, "imageUrl", e.target.value)}
                placeholder="URL da imagem (opcional)"
              />
              
              {step.imageUrl && (
                <div className="mt-2 border rounded p-2">
                  <p className="text-xs text-muted-foreground mb-1">Preview:</p>
                  <img 
                    src={step.imageUrl} 
                    alt={`Imagem para ${step.title}`} 
                    className="max-h-[150px] object-contain mx-auto"
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <Button variant="outline" onClick={addStep}>
        <Plus className="h-4 w-4 mr-2" />
        Adicionar Passo
      </Button>
    </div>
  );
};

export default StepsBlock;
