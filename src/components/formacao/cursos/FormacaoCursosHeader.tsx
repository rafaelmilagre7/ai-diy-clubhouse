
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { ExportLMSButton } from "./ExportLMSButton";

interface FormacaoCursosHeaderProps {
  onNovoCurso: () => void;
}

export const FormacaoCursosHeader = ({ onNovoCurso }: FormacaoCursosHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Cursos</h2>
        <p className="text-muted-foreground">
          Gerencie todos os cursos disponíveis na plataforma
        </p>
      </div>
      <div className="flex gap-2">
        <ExportLMSButton />
        <Button onClick={onNovoCurso}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Novo Curso
        </Button>
      </div>
    </div>
  );
};
