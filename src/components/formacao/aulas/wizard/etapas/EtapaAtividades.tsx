
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { AulaFormValues } from "../AulaStepWizard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";

interface EtapaAtividadesProps {
  form: UseFormReturn<AulaFormValues>;
  onNext: () => void;
  onPrevious: () => void;
}

const EtapaAtividades: React.FC<EtapaAtividadesProps> = ({
  form,
  onNext,
  onPrevious,
}) => {
  const handleContinue = async () => {
    // Sem validação obrigatória para atividades
    onNext();
  };

  const handleAddActivity = () => {
    const activities = form.getValues().activities || [];
    form.setValue("activities", [
      ...activities,
      {
        id: `activity-${activities.length + 1}`,
        title: "",
        description: "",
      },
    ]);
  };

  return (
    <div className="space-y-6 py-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-medium">Atividades da Aula</h3>
        <Button
          type="button"
          size="sm"
          onClick={handleAddActivity}
        >
          <Plus className="w-4 h-4 mr-1" /> Adicionar Atividade
        </Button>
      </div>

      <Card className="p-6 min-h-[200px] flex items-center justify-center border-dashed">
        <div className="text-center">
          <p className="text-muted-foreground">
            Funcionalidade de atividades em desenvolvimento.
          </p>
          <p className="text-sm text-muted-foreground">
            Em breve você poderá adicionar exercícios e questionários.
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

export default EtapaAtividades;
