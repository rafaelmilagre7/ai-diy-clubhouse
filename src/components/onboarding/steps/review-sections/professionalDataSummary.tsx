
import React from "react";
import { Badge } from "@/components/ui/badge";

export function getProfessionalDataSummary(data: any) {
  if (!data || Object.keys(data).length === 0) {
    return <p className="text-gray-500 italic">Seção não preenchida. Clique em Editar para preencher.</p>;
  }

  return (
    <div className="space-y-2 text-sm">
      <p><span className="font-medium">Empresa:</span> {data.company_name || "Não preenchido"}</p>
      <p><span className="font-medium">Tamanho da empresa:</span> {data.company_size || "Não preenchido"}</p>
      <p><span className="font-medium">Setor:</span> {data.company_sector || "Não preenchido"}</p>
      {data.company_website && (
        <p><span className="font-medium">Website:</span> <a href={data.company_website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{data.company_website}</a></p>
      )}
      <p><span className="font-medium">Cargo atual:</span> {data.current_position || "Não preenchido"}</p>
      {data.annual_revenue && <p><span className="font-medium">Faturamento anual:</span> {data.annual_revenue}</p>}
    </div>
  );
}
