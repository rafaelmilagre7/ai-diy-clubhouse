
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Save, Eye } from "lucide-react";

interface SolutionEditorHeaderProps {
  id: string | undefined;
  saving: boolean;
  onSave: () => void;
}

const SolutionEditorHeader = ({ id, saving, onSave }: SolutionEditorHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <Button 
          variant="ghost" 
          className="mb-2"
          onClick={() => navigate("/admin/solutions")}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Voltar para lista
        </Button>
        <h1 className="text-3xl font-bold">
          {id ? "Editar Solução" : "Nova Solução"}
        </h1>
        <p className="text-muted-foreground mt-1">
          {id
            ? "Atualize os detalhes e conteúdo da solução"
            : "Crie uma nova solução para a plataforma DIY"}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Button 
          variant="outline" 
          onClick={() => navigate(id ? `/solution/${id}` : "/admin/solutions")}
        >
          <Eye className="mr-2 h-4 w-4" />
          {id ? "Visualizar" : "Cancelar"}
        </Button>
        <Button 
          type="submit"
          onClick={onSave}
          disabled={saving}
        >
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    </div>
  );
};

export default SolutionEditorHeader;
