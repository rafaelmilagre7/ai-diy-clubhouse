import React from "react";
import { UnifiedLoadingScreen } from "@/components/common/UnifiedLoadingScreen";
import { getLoadingMessages } from "@/lib/loadingMessages";

export const BuilderProcessingExperience = () => {
  return (
    <UnifiedLoadingScreen 
      title="Processando sua solução..."
      messages={getLoadingMessages('builder_generating')}
      estimatedSeconds={60}
      showTimer={true}
      showProgressBar={true}
    />
  );
};
