
import React from "react";
import { Badge } from "@/components/ui/badge";
import { OnboardingData } from "@/types/onboarding";

export function getPersonalInfoSummary(data: OnboardingData['personal_info'] | undefined) {
  if (!data || Object.keys(data).length === 0) {
    return <p className="text-gray-500 italic">Seção não preenchida. Clique em Editar para preencher.</p>;
  }

  // Formatação correta do telefone (evitar o problema de ++55)
  const formatPhone = (ddi?: string, phone?: string) => {
    if (!phone) return "Não preenchido";
    
    // Garante que o DDI tenha apenas um + no início
    let formattedDDI = "+55"; // valor padrão
    
    if (ddi) {
      // Remove qualquer + existente e adiciona apenas um no início
      formattedDDI = "+" + ddi.replace(/\+/g, '').replace(/\D/g, '');
    }
    
    console.log("Telefone formatado:", formattedDDI, phone);
    return `${formattedDDI} ${phone}`;
  };

  return (
    <div className="space-y-2 text-sm">
      <p><span className="font-medium">Nome:</span> {data.name || "Não preenchido"}</p>
      <p><span className="font-medium">Email:</span> {data.email || "Não preenchido"}</p>
      <p><span className="font-medium">Telefone:</span> {data.phone ? formatPhone(data.ddi, data.phone) : "Não preenchido"}</p>
      <p><span className="font-medium">Localização:</span> {data.city && data.state ? `${data.city}, ${data.state}, ${data.country || "Brasil"}` : "Não preenchido"}</p>
      {data.linkedin && <p><span className="font-medium">LinkedIn:</span> {data.linkedin}</p>}
      {data.instagram && <p><span className="font-medium">Instagram:</span> {data.instagram}</p>}
    </div>
  );
}
