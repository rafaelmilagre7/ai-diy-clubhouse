
import React from "react";

export function getProfessionalDataSummary(data: any) {
  if (!data || Object.keys(data).length === 0) {
    return <p className="text-gray-500 italic">Dados profissionais não fornecidos</p>;
  }

  // Normalizar a estrutura dos dados
  const companyName = data.company_name || data.professional_info?.company_name || "Não informado";
  const currentPosition = data.current_position || data.professional_info?.current_position || "Não informado";
  const companySize = data.company_size || data.professional_info?.company_size || "Não informado";
  const companySector = data.company_sector || data.professional_info?.company_sector || "Não informado";
  const companyWebsite = data.company_website || data.professional_info?.company_website || "";
  const annualRevenue = data.annual_revenue || data.professional_info?.annual_revenue || "";

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-semibold text-neutral-400">Empresa</h3>
          <p className="text-neutral-200">{companyName}</p>
        </div>
        
        <div>
          <h3 className="text-sm font-semibold text-neutral-400">Cargo Atual</h3>
          <p className="text-neutral-200">{currentPosition}</p>
        </div>
        
        <div>
          <h3 className="text-sm font-semibold text-neutral-400">Tamanho da Empresa</h3>
          <p className="text-neutral-200">{companySize}</p>
        </div>
        
        <div>
          <h3 className="text-sm font-semibold text-neutral-400">Setor</h3>
          <p className="text-neutral-200">{companySector}</p>
        </div>
        
        {companyWebsite && (
          <div>
            <h3 className="text-sm font-semibold text-neutral-400">Website</h3>
            <p className="text-viverblue hover:text-viverblue-light hover:underline">
              <a href={companyWebsite} target="_blank" rel="noopener noreferrer">
                {companyWebsite}
              </a>
            </p>
          </div>
        )}
        
        {annualRevenue && (
          <div>
            <h3 className="text-sm font-semibold text-neutral-400">Faturamento Anual</h3>
            <p className="text-neutral-200">{annualRevenue}</p>
          </div>
        )}
      </div>
    </div>
  );
}
