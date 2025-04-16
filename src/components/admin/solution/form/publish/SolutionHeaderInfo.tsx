
import React from "react";
import { Badge } from "@/components/ui/badge";
import { CardTitle, CardDescription, CardHeader } from "@/components/ui/card";
import { Solution } from "@/lib/supabase";

interface SolutionHeaderInfoProps {
  solution: Solution | null;
  formatDate: (dateString?: string) => string;
}

/**
 * Componente de cabeçalho para a seção de publicação de solução
 * Exibe o status da solução (publicada/rascunho) e as datas de criação e atualização
 */
const SolutionHeaderInfo: React.FC<SolutionHeaderInfoProps> = ({ solution, formatDate }) => {
  return (
    <CardHeader>
      <div className="flex items-center justify-between">
        {/* Título fixo da seção */}
        <CardTitle>Resumo da Solução</CardTitle>
        
        {/* Badge dinâmico que indica o status de publicação */}
        <Badge variant={solution?.published ? "default" : "outline"}>
          {solution?.published ? "Publicada" : "Rascunho"}
        </Badge>
      </div>
      
      {/* Datas de criação e última atualização formatadas */}
      <CardDescription>
        Criada em {formatDate(solution?.created_at)}<br />
        Última atualização em {formatDate(solution?.updated_at)}
      </CardDescription>
    </CardHeader>
  );
};

export default SolutionHeaderInfo;
