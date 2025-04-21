
import React from "react";
import { Badge } from "@/components/ui/badge";
import { OnboardingData } from "@/types/onboarding";

export function getExperiencePersonalizationSummary(data: OnboardingData['experience_personalization']) {
  if (!data || Object.keys(data).length === 0) {
    return <p className="text-gray-500 italic">Seção não preenchida. Clique em Editar para preencher.</p>;
  }

  return (
    <div className="space-y-2 text-sm">
      {data.interests && data.interests.length > 0 && (
        <div>
          <span className="font-medium">Áreas de interesse:</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {data.interests.map((interest: string, index: number) => (
              <Badge key={index} variant="outline" className="bg-gray-100">{interest}</Badge>
            ))}
          </div>
        </div>
      )}
      
      {data.time_preference && data.time_preference.length > 0 && (
        <div>
          <span className="font-medium">Preferência de horário:</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {data.time_preference.map((time: string, index: number) => (
              <Badge key={index} variant="outline" className="bg-gray-100">{time}</Badge>
            ))}
          </div>
        </div>
      )}
      
      {data.available_days && data.available_days.length > 0 && (
        <div>
          <span className="font-medium">Dias disponíveis:</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {data.available_days.map((day: string, index: number) => (
              <Badge key={index} variant="outline" className="bg-gray-100">{day}</Badge>
            ))}
          </div>
        </div>
      )}
      
      <p><span className="font-medium">Disponibilidade para networking:</span> {data.networking_availability ? `${data.networking_availability}/10` : "Não preenchido"}</p>
    </div>
  );
}
