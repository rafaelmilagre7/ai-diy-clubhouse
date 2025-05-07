
import React, { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { AulaFormValues } from "../AulaStepWizard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Upload, File, X } from "lucide-react";

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
  const [uploading, setUploading] = useState(false);

  const handleContinue = async () => {
    // Sem validação obrigatória para materiais
    onNext();
  };

  const handleAddMaterial = () => {
    // Adicionar lógica para upload de materiais
    console.log("Adicionar material");
  };

  return (
    <div className="space-y-6 py-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-medium">Materiais Complementares</h3>
        <Button
          type="button"
          size="sm"
          onClick={handleAddMaterial}
          disabled={uploading}
        >
          <Plus className="w-4 h-4 mr-1" /> Adicionar Material
        </Button>
      </div>

      <Card className="p-6 min-h-[200px] flex items-center justify-center border-dashed">
        <div className="text-center">
          <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-2 text-muted-foreground">
            Arraste arquivos aqui ou clique para fazer upload
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            PDF, DOCX, PPTX, XLSX (max. 10MB)
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={handleAddMaterial}
            disabled={uploading}
          >
            Selecionar Arquivos
          </Button>
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
