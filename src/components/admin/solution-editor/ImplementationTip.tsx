
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Eye } from "lucide-react";

interface ImplementationTipProps {
  currentStep: number;
}

const ImplementationTip: React.FC<ImplementationTipProps> = ({ currentStep }) => {
  const getTipContent = (step: number): string => {
    switch (step) {
      case 1:
        return "Neste módulo, destaque os benefícios principais e o valor que o membro obterá ao implementar esta solução.";
      case 2:
        return "Inclua um vídeo demonstrativo e casos reais de sucesso para inspirar os membros.";
      case 3:
        return "Liste todos os pré-requisitos e ferramentas que serão necessárias para implementação.";
      case 4:
        return "Divida o processo em passos claros e concisos, com screenshots ou vídeos.";
      case 5:
        return "Forneça uma lista de verificação para garantir que a implementação foi bem-sucedida.";
      case 6:
        return "Ajude os membros a medir e comunicar os resultados obtidos com a solução.";
      case 7:
        return "Ofereça dicas de como otimizar ainda mais a solução após a implementação inicial.";
      case 8:
        return "Reconheça a conquista e sugira próximos passos para continuar evoluindo.";
      default:
        return "Configure cada módulo com conteúdo relevante e útil para o usuário.";
    }
  };

  return (
    <Card className="bg-gray-50">
      <CardContent className="p-4 flex items-center gap-3">
        <Eye className="h-5 w-5 text-muted-foreground" />
        <div>
          <p className="text-sm font-medium mb-1">Dica de Implementação</p>
          <p className="text-sm text-muted-foreground">
            {getTipContent(currentStep)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ImplementationTip;
