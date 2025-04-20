
// Refatorado! Agora cada campo virou um componente.
import React from "react";
import { CompanyNameInput } from "./inputs/CompanyNameInput";
import { CompanySizeInput } from "./inputs/CompanySizeInput";
import { CompanySectorInput } from "./inputs/CompanySectorInput";
import { CompanyWebsiteInput } from "./inputs/CompanyWebsiteInput";
import { CurrentPositionInput } from "./inputs/CurrentPositionInput";
import { AnnualRevenueInput } from "./inputs/AnnualRevenueInput";

interface CompanyInputsProps {
  companyName: string;
  setCompanyName: (value: string) => void;
  companySize: string;
  setCompanySize: (value: string) => void;
  companySector: string;
  setCompanySector: (value: string) => void;
  companyWebsite: string;
  setCompanyWebsite: (value: string) => void;
  currentPosition: string;
  setCurrentPosition: (value: string) => void;
  annualRevenue: string;
  setAnnualRevenue: (value: string) => void;
}

export const CompanyInputs: React.FC<CompanyInputsProps> = ({
  companyName,
  setCompanyName,
  companySize,
  setCompanySize,
  companySector,
  setCompanySector,
  companyWebsite,
  setCompanyWebsite,
  currentPosition,
  setCurrentPosition,
  annualRevenue,
  setAnnualRevenue,
}) => {
  return (
    <div className="flex flex-col gap-5">
      <CompanyNameInput value={companyName} onChange={setCompanyName} />
      <CompanySizeInput value={companySize} onChange={setCompanySize} />
      <CompanySectorInput value={companySector} onChange={setCompanySector} />
      <CompanyWebsiteInput value={companyWebsite} onChange={setCompanyWebsite} />
      <CurrentPositionInput value={currentPosition} onChange={setCurrentPosition} />
      <AnnualRevenueInput value={annualRevenue} onChange={setAnnualRevenue} />
    </div>
  );
};
