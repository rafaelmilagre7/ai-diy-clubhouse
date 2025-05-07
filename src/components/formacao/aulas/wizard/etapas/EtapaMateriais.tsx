
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { AulaFormValues } from "../AulaStepWizard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";

interface EtapaMateriaisProps {
  form: UseFormReturn<AulaFormValues>;
  onNext: () => void;
  onPrevious: () => void;
}

const EtapaMateriais: React.FC<EtapaMateriaisProps> = ({
  form,
  onNext,
  onPrevious,
}) => {
  const handleContinue = async () => {
    // Sem validação obrigatória para materiais
    onNext();
  };

  const handleAddResource = () => {
    const resources = form.getValues().resources || [];
    form.setValue("resources", [
      ...resources,
      {
        id: `resource-${resources.length + 1}`,
        title: "",
        type: "",
        url: "",
      },
    ]);
  };

  return (
    <div className="space-y-6 py-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-medium">Materiais Complementares</h3>
        <Button
          type="button"
          size="sm"
          onClick={handleAddResource}
        >
          <Plus className="w-4 h-4 mr-1" /> Adicionar Material
        </Button>
      </div>

      <Card className="p-6 min-h-[200px] flex items-center justify-center border-dashed">
        <div className="text-center">
          <p className="text-muted-foreground">
            Funcionalidade de materiais complementares em desenvolvimento.
          </p>
          <p className="text-sm text-muted-foreground">
            Em breve você poderá adicionar links, PDFs e outros recursos.
          </p>
        </div>
      </Card>

      <div className="flex justify-between pt-4 border-t">
        <Button type="button" variant="outline" onClick={onPrevious}>
          Voltar
        </Button>
        <Button type="button" onClick={handleContinue}>
          Continuar
        </Button>
      </div>
    </div>
  );
};

export default EtapaMateriais;
