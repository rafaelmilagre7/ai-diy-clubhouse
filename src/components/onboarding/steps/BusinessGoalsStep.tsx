
import React, { useState } from "react";
import { BusinessInfoMessage } from "./BusinessInfoMessage";
import { CompanyInputs } from "./business/CompanyInputs";
import { BusinessNavButtons } from "./business/BusinessNavButtons";
import { OnboardingData } from "@/types/onboarding";

interface BusinessGoalsStepProps {
  onSubmit: (stepId: string, data: Partial<OnboardingData>) => void;
  isSubmitting: boolean;
  isLastStep: boolean;
  onComplete: () => void;
  initialData?: any;
  personalInfo?: OnboardingData["personal_info"];
  onPrevious?: () => void;
}

export const BusinessGoalsStep = ({
  onSubmit,
  isSubmitting,
  initialData,
  personalInfo,
  onPrevious,
}: BusinessGoalsStepProps) => {
  // Estados para cada campo
  const [companyName, setCompanyName] = useState(initialData?.company_name || "");
  const [companySize, setCompanySize] = useState(initialData?.company_size || "");
  const [companySector, setCompanySector] = useState(initialData?.company_sector || "");
  const [companyWebsite, setCompanyWebsite] = useState(initialData?.company_website || "");
  const [currentPosition, setCurrentPosition] = useState(initialData?.current_position || "");
  const [annualRevenue, setAnnualRevenue] = useState(initialData?.annual_revenue || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const professionalData: Partial<OnboardingData> = {
      professional_info: {
        company_name: companyName,
        company_size: companySize,
        company_sector: companySector,
        company_website: companyWebsite,
        current_position: currentPosition,
        annual_revenue: annualRevenue,
      },
    };
    onSubmit("goals", professionalData);
  };

  return (
    <div className="flex flex-col items-center min-h-[calc(100vh-170px)] py-8 sm:py-16 bg-[#f6f6f7]">
      <div className="w-full max-w-2xl flex flex-col items-center">
        {/* Botão voltar */}
        <BusinessNavButtons onPrevious={onPrevious} isSubmitting={false} />

        {/* Mensagem do Milagrinho */}
        <BusinessInfoMessage userName={personalInfo?.name} />

        {/* Card principal do formulário */}
        <form
          onSubmit={handleSubmit}
          className="w-full bg-white rounded-2xl shadow-lg p-5 sm:p-8 border border-gray-100 flex flex-col gap-7"
          style={{ minWidth: 0 }}
        >
          {/* Título do bloco */}
          <h2 className="text-xl font-semibold text-[#15192C] mb-3 ml-1">
            Objetivos do Negócio
          </h2>
          
          {/* Campos do formulário */}
          <CompanyInputs 
            companyName={companyName}
            setCompanyName={setCompanyName}
            companySize={companySize}
            setCompanySize={setCompanySize}
            companySector={companySector}
            setCompanySector={setCompanySector}
            companyWebsite={companyWebsite}
            setCompanyWebsite={setCompanyWebsite}
            currentPosition={currentPosition}
            setCurrentPosition={setCurrentPosition}
            annualRevenue={annualRevenue}
            setAnnualRevenue={setAnnualRevenue}
          />
          
          {/* Botão avançar */}
          <BusinessNavButtons isSubmitting={isSubmitting} />
        </form>
      </div>
    </div>
  );
};
