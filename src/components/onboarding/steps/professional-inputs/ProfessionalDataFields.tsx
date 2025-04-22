
import React from "react";
import { Building2 } from "lucide-react";
import { CompanyNameField } from "./CompanyNameField";
import { CompanySizeField } from "./CompanySizeField";
import { CompanySectorField } from "./CompanySectorField";
import { WebsiteField } from "./WebsiteField";
import { CurrentPositionField } from "./CurrentPositionField";
import { AnnualRevenueField } from "./AnnualRevenueField";

export const ProfessionalDataFields: React.FC = () => (
  <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6">
    <div className="flex items-center gap-2 mb-6">
      <Building2 className="h-5 w-5 text-[#0ABAB5]" />
      <h3 className="text-lg font-semibold text-[#0ABAB5]">Dados da Empresa</h3>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <CompanyNameField />
      <CurrentPositionField />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
      <CompanySizeField />
      <CompanySectorField />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
      <AnnualRevenueField />
      <WebsiteField />
    </div>
  </div>
);
