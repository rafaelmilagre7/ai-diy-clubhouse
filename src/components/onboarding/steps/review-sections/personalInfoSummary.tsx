
import React from "react";
import { Badge } from "@/components/ui/badge";
import { OnboardingData } from "@/types/onboarding";

export function getPersonalInfoSummary(data: OnboardingData['personal_info']) {
  if (!data || Object.keys(data).length === 0) {
    return <p className="text-gray-500 italic">Seção não preenchida. Clique em Editar para preencher.</p>;
  }

  return (
    <div className="space-y-2 text-sm">
      <p><span className="font-medium">Nome:</span> {data.name || "Não preenchido"}</p>
      <p><span className="font-medium">Email:</span> {data.email || "Não preenchido"}</p>
      <p><span className="font-medium">Telefone:</span> {data.phone ? `+${data.ddi || "55"} ${data.phone}` : "Não preenchido"}</p>
      <p><span className="font-medium">Localização:</span> {data.city && data.state ? `${data.city}, ${data.state}, ${data.country || "Brasil"}` : "Não preenchido"}</p>
      {data.linkedin && <p><span className="font-medium">LinkedIn:</span> {data.linkedin}</p>}
      {data.instagram && <p><span className="font-medium">Instagram:</span> {data.instagram}</p>}
    </div>
  );
}
