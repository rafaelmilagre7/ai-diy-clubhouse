
import React, { useState } from "react";
import { CompanyInputs } from "./business/CompanyInputs";
import { OnboardingData } from "@/types/onboarding";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface BusinessGoalsStepProps {
  onSubmit: (stepId: string, data: Partial<OnboardingData>) => void;
  isSubmitting: boolean;
  isLastStep: boolean;
  onComplete: () => void;
  initialData?: any;
  personalInfo?: OnboardingData["personal_info"];
}

export const BusinessGoalsStep = ({
  onSubmit,
  isSubmitting,
  initialData,
  personalInfo,
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
    <div className="space-y-6">
      <div className="mb-4">
        <div className="flex items-center gap-3 rounded-xl bg-white border border-[#0ABAB5]/20 px-5 py-4 shadow-sm">
          <div className="flex items-center justify-center bg-[#eafaf9] rounded-full h-11 w-11">
            <span className="text-[#0ABAB5] text-xl">🤖</span>
          </div>
          <div>
            <span className="block text-[#0ABAB5] font-semibold mb-0.5" style={{ fontSize: 16 }}>
              {personalInfo?.name ? `E aí ${personalInfo.name}!` : "Olá!"}
            </span>
            <span className="text-[#1A2228] text-sm">
              Para personalizar sua experiência, conte um pouco sobre a empresa onde você trabalha.
              Estas informações são essenciais para recomendar as melhores soluções para seu negócio.
            </span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg border border-gray-100 p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-[#15192C] mb-6">
            Dados Profissionais
          </h2>
          
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
          
          <div className="flex justify-end mt-8">
            <Button
              type="submit"
              className="bg-[#0ABAB5] hover:bg-[#099388] text-white px-5 py-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                "Salvando..."
              ) : (
                <span className="flex items-center gap-2">
                  Próximo
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
