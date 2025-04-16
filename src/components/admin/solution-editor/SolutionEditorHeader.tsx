
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Save, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SolutionEditorHeaderProps {
  id: string | undefined;
  saving: boolean;
  onSave: () => void;
  title?: string;
  difficulty?: "easy" | "medium" | "advanced";
  difficultyColor?: string;
}

/**
 * Cabeçalho do editor de solução
 * Mostra informações básicas e ações principais
 * @param props Propriedades do componente
 */
const SolutionEditorHeader = ({ 
  id, 
  saving, 
  onSave,
  title,
  difficulty,
  difficultyColor 
}: SolutionEditorHeaderProps) => {
  const navigate = useNavigate();
  
  // Mapear dificuldade para texto em português
  const getDifficultyText = (diff?: string) => {
    switch (diff) {
      case "easy": return "Fácil";
      case "medium": return "Médio";
      case "advanced": return "Avançado";
      default: return "";
    }
  };

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
          {id ? (title ? title : "Editar Solução") : "Nova Solução"}
        </h1>
        <div className="flex items-center gap-2 mt-2">
          {difficulty && title && (
            <Badge 
              className={`${difficultyColor} text-white`}
            >
              {getDifficultyText(difficulty)}
            </Badge>
          )}
          <p className="text-muted-foreground text-sm">
            {id
              ? "Atualize os detalhes e conteúdo da solução"
              : "Crie uma nova solução para o VIVER DE IA Club"}
          </p>
        </div>
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
