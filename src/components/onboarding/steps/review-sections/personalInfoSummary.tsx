
import React from "react";
import { Badge } from "@/components/ui/badge";
import { OnboardingData } from "@/types/onboarding";

export function getPersonalInfoSummary(data: OnboardingData['personal_info'] | undefined) {
  if (!data || Object.keys(data).length === 0) {
    return <p className="text-gray-500 italic">Seção não preenchida. Clique em Editar para preencher.</p>;
  }

  // Formatação correta do telefone (evitar o problema de ++55)
  const formatPhone = (ddi?: string, phone?: string) => {
    if (!phone && !data.whatsapp) return "Não preenchido";
    
    // Usar whatsapp se phone não estiver disponível
    const phoneNumber = phone || data.whatsapp;
    if (!phoneNumber) return "Não preenchido";
    
    // Garante que o DDI tenha apenas um + no início
    let formattedDDI = data.country_code || "+55"; // valor padrão
    
    if (ddi) {
      // Remove qualquer + existente e adiciona apenas um no início
      formattedDDI = "+" + ddi.replace(/\+/g, '').replace(/\D/g, '');
    }
    
    console.log("Telefone formatado:", formattedDDI, phoneNumber);
    return `${formattedDDI} ${phoneNumber}`;
  };

  return (
    <div className="space-y-2 text-sm">
      <p><span className="font-medium">Nome:</span> {data.name || "Não preenchido"}</p>
      <p><span className="font-medium">Email:</span> {data.email || "Não preenchido"}</p>
      <p><span className="font-medium">Telefone:</span> {formatPhone(data.ddi, data.phone)}</p>
      <p><span className="font-medium">Localização:</span> {data.city && data.state ? `${data.city}, ${data.state}, ${data.country || "Brasil"}` : "Não preenchido"}</p>
      {data.linkedin && <p><span className="font-medium">LinkedIn:</span> {data.linkedin}</p>}
      {data.instagram && <p><span className="font-medium">Instagram:</span> {data.instagram}</p>}
    </div>
  );
}
