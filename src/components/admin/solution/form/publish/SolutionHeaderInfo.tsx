
import React from "react";
import { Badge } from "@/components/ui/badge";
import { CardTitle, CardDescription, CardHeader } from "@/components/ui/card";
import { Solution } from "@/lib/supabase";

interface SolutionHeaderInfoProps {
  solution: Solution | null;
  formatDate: (dateString?: string) => string;
}

const SolutionHeaderInfo: React.FC<SolutionHeaderInfoProps> = ({ solution, formatDate }) => {
  return (
    <CardHeader>
      <div className="flex items-center justify-between">
        <CardTitle>Resumo da Solução</CardTitle>
        <Badge variant={solution?.published ? "default" : "outline"}>
          {solution?.published ? "Publicada" : "Rascunho"}
        </Badge>
      </div>
      <CardDescription>
        Criada em {formatDate(solution?.created_at)}<br />
        Última atualização em {formatDate(solution?.updated_at)}
      </CardDescription>
    </CardHeader>
  );
};

export default SolutionHeaderInfo;
