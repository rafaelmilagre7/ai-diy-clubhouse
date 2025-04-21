
import React from "react";
import { Badge } from "@/components/ui/badge";
import { OnboardingData } from "@/types/onboarding";

export function getAIExperienceSummary(data: OnboardingData['ai_experience']) {
  if (!data || Object.keys(data).length === 0) {
    return <p className="text-gray-500 italic">Seção não preenchida. Clique em Editar para preencher.</p>;
  }

  return (
    <div className="space-y-2 text-sm">
      <p><span className="font-medium">Nível de conhecimento em IA:</span> {data.knowledge_level || "Não preenchido"}</p>
      
      {data.previous_tools && data.previous_tools.length > 0 && (
        <div>
          <span className="font-medium">Ferramentas já utilizadas:</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {data.previous_tools.map((tool: string, index: number) => (
              <Badge key={index} variant="outline" className="bg-gray-100">{tool}</Badge>
            ))}
          </div>
        </div>
      )}
      
      {data.desired_ai_areas && data.desired_ai_areas.length > 0 && (
        <div>
          <span className="font-medium">Áreas de interesse em IA:</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {data.desired_ai_areas.map((area: string, index: number) => (
              <Badge key={index} variant="outline" className="bg-gray-100">{area}</Badge>
            ))}
          </div>
        </div>
      )}
      
      <p><span className="font-medium">Já implementou soluções de IA:</span> {data.has_implemented === "sim" ? "Sim" : "Não"}</p>
    </div>
  );
}
