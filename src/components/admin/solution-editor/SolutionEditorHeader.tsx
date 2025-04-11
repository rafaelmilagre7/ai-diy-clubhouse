
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Save, Eye, Layers } from "lucide-react";

interface SolutionEditorHeaderProps {
  id: string | undefined;
  saving: boolean;
  onSave: () => void;
}

const SolutionEditorHeader = ({ id, saving, onSave }: SolutionEditorHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-lg shadow-sm border">
      <div>
        <Button 
          variant="ghost" 
          className="h-8 px-2 mb-2"
          onClick={() => navigate("/admin/solutions")}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Voltar para lista
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">
          {id ? "Editar Solução" : "Nova Solução"}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {id
            ? "Atualize os detalhes e conteúdo da solução"
            : "Crie uma nova solução para a plataforma DIY"}
        </p>
      </div>
      <div className="flex items-center gap-3">
        {id && (
          <Button 
            variant="outline" 
            onClick={() => navigate(`/solution/${id}`)}
            className="h-9"
          >
            <Eye className="mr-2 h-4 w-4" />
            Visualizar
          </Button>
        )}
        {id && (
          <Button 
            variant="outline" 
            onClick={() => navigate(`/implement/${id}/0`)}
            className="h-9"
          >
            <Layers className="mr-2 h-4 w-4" />
            Testar Implementação
          </Button>
        )}
        <Button 
          type="submit"
          onClick={onSave}
          disabled={saving}
          className="h-9 bg-[#0ABAB5] hover:bg-[#0ABAB5]/90"
        >
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    </div>
  );
};

export default SolutionEditorHeader;
