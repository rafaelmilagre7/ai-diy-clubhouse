
import React from "react";

interface TabHeaderProps {
  currentStep: number;
  activeTab: string;
}

/**
 * Componente de cabeçalho para as etapas do editor de solução
 * Exibe o título e a descrição correspondente à etapa atual
 * Atualiza dinamicamente conforme o usuário avança no fluxo
 */
const TabHeader: React.FC<TabHeaderProps> = ({ currentStep, activeTab }) => {
  // Função para mostrar o título da etapa atual baseado no currentStep ou activeTab
  const getTabTitle = () => {
    // Se estivermos na etapa 0, o título deve ser baseado na aba ativa
    if (currentStep === 0) {
      switch (activeTab) {
        case "basic": return "Informações Básicas";
        case "tools": return "Ferramentas Necessárias";
        case "resources": return "Materiais de Apoio";
        case "video": return "Vídeo-aulas";
        case "checklist": return "Checklist de Implementação";
        case "publish": return "Publicação";
        default: return "Configuração Básica";
      }
    } else {
      // Para outras etapas, usar o título baseado no índice
      const titles = [
        "Informações Básicas",
        "Ferramentas Necessárias",
        "Materiais de Apoio",
        "Vídeo-aulas",
        "Checklist de Implementação",
        "Publicação"
      ];
      
      return titles[currentStep] || "Configuração da Solução";
    }
  };

  // Textos descritivos para cada etapa/aba
  const getTabDescription = () => {
    if (currentStep === 0) {
      switch (activeTab) {
        case "basic": return "Informe as características básicas da solução";
        case "tools": return "Adicione as ferramentas que serão necessárias para implementação";
        case "resources": return "Forneça materiais de apoio para auxiliar na implementação";
        case "video": return "Adicione vídeos explicativos sobre a implementação";
        case "checklist": return "Configure o checklist de verificação da implementação";
        case "publish": return "Revise e publique a solução para os membros";
        default: return "Informe as características básicas da solução";
      }
    } else {
      const descriptions = [
        "Informe as características básicas da solução",
        "Adicione as ferramentas que serão necessárias para implementação",
        "Forneça materiais de apoio para auxiliar na implementação",
        "Adicione vídeos explicativos sobre a implementação",
        "Configure o checklist de verificação da implementação",
        "Revise e publique a solução para os membros"
      ];
      
      return descriptions[currentStep] || "";
    }
  };

  return (
    <div className="px-6 pt-4 pb-2 border-b">
      <h2 className="text-xl font-semibold text-aurora-primary">{getTabTitle()}</h2>
      <p className="text-sm text-muted-foreground mt-1">
        {getTabDescription()}
      </p>
    </div>
  );
};

export default TabHeader;
