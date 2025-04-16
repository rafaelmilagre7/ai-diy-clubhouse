
import React from "react";

interface TabHeaderProps {
  currentStep: number;
}

/**
 * Componente de cabeçalho para as etapas do editor de solução
 * Exibe o título e a descrição correspondente à etapa atual
 * Atualiza dinamicamente conforme o usuário avança no fluxo
 */
const TabHeader: React.FC<TabHeaderProps> = ({ currentStep }) => {
  // Função para mostrar o título da etapa atual baseado no currentStep
  const getTabTitle = () => {
    const titles = [
      "Etapa 1: Configuração Básica",
      "Etapa 2: Ferramentas Necessárias",
      "Etapa 3: Materiais de Apoio",
      "Etapa 4: Vídeo-aulas",
      "Etapa 5: Checklist de Implementação",
      "Etapa 6: Publicação",
      "Etapa 7: Conclusão"
    ];
    
    return titles[currentStep] || "Configuração da Solução";
  };

  // Textos descritivos para cada etapa
  const getTabDescription = () => {
    const descriptions = [
      "Informe as características básicas da solução",
      "Adicione as ferramentas que serão necessárias para implementação",
      "Forneça materiais de apoio para auxiliar na implementação",
      "Adicione vídeos explicativos sobre a implementação",
      "Configure o checklist de verificação da implementação",
      "Revise e publique a solução para os membros",
      "Solução concluída e publicada com sucesso"
    ];
    
    return descriptions[currentStep] || "";
  };

  return (
    <div className="px-6 pt-4 pb-2 border-b">
      <h2 className="text-xl font-semibold text-[#0ABAB5]">{getTabTitle()}</h2>
      <p className="text-sm text-muted-foreground mt-1">
        {getTabDescription()}
      </p>
    </div>
  );
};

export default TabHeader;
