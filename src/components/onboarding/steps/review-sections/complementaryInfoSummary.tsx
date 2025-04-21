
import React from "react";
import { Badge } from "@/components/ui/badge";
import { OnboardingData } from "@/types/onboarding";

export function getComplementaryInfoSummary(data: OnboardingData['complementary_info']) {
  if (!data || Object.keys(data).length === 0) {
    return <p className="text-gray-500 italic">Seção não preenchida. Clique em Editar para preencher.</p>;
  }

  return (
    <div className="space-y-2 text-sm">
      <p><span className="font-medium">Como nos conheceu:</span> {data.how_found_us || "Não preenchido"}</p>
      {data.referred_by && <p><span className="font-medium">Indicado por:</span> {data.referred_by}</p>}
      <p><span className="font-medium">Autoriza uso do caso:</span> {data.authorize_case_usage ? "Sim" : "Não"}</p>
      <p><span className="font-medium">Interesse em entrevista:</span> {data.interested_in_interview ? "Sim" : "Não"}</p>
      
      {data.priority_topics && data.priority_topics.length > 0 && (
        <div>
          <span className="font-medium">Tópicos prioritários:</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {data.priority_topics.map((topic: string, index: number) => (
              <Badge key={index} variant="outline" className="bg-gray-100">{topic}</Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
