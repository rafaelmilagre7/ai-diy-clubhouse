
import React from "react";

export function getProfessionalDataSummary(data: any) {
  if (!data || Object.keys(data).length === 0) {
    return <p className="text-gray-500 italic">Dados profissionais não fornecidos</p>;
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-semibold text-neutral-400">Empresa</h3>
          <p className="text-neutral-200">{data.company_name || "Não informado"}</p>
        </div>
        
        <div>
          <h3 className="text-sm font-semibold text-neutral-400">Cargo Atual</h3>
          <p className="text-neutral-200">{data.current_position || "Não informado"}</p>
        </div>
        
        <div>
          <h3 className="text-sm font-semibold text-neutral-400">Tamanho da Empresa</h3>
          <p className="text-neutral-200">{data.company_size || "Não informado"}</p>
        </div>
        
        <div>
          <h3 className="text-sm font-semibold text-neutral-400">Setor</h3>
          <p className="text-neutral-200">{data.company_sector || "Não informado"}</p>
        </div>
        
        {data.company_website && (
          <div>
            <h3 className="text-sm font-semibold text-neutral-400">Website</h3>
            <p className="text-viverblue hover:text-viverblue-light hover:underline">
              <a href={data.company_website} target="_blank" rel="noopener noreferrer">
                {data.company_website}
              </a>
            </p>
          </div>
        )}
        
        {data.annual_revenue && (
          <div>
            <h3 className="text-sm font-semibold text-neutral-400">Faturamento Anual</h3>
            <p className="text-neutral-200">{data.annual_revenue}</p>
          </div>
        )}
      </div>
    </div>
  );
}
