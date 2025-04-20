
import React, { useState, useEffect } from "react";
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
}: BusinessGoalsStepProps) => {
  // Estados para cada campo
  const [companyName, setCompanyName] = useState(initialData?.company_name || "");
  const [companySize, setCompanySize] = useState(initialData?.company_size || "");
  const [companySector, setCompanySector] = useState(initialData?.company_sector || "");
  const [companyWebsite, setCompanyWebsite] = useState(initialData?.company_website || "");
  const [currentPosition, setCurrentPosition] = useState(initialData?.current_position || "");
  const [annualRevenue, setAnnualRevenue] = useState(initialData?.annual_revenue || "");

  useEffect(() => {
    // Atualizar os estados quando os dados iniciais mudarem
    if (initialData) {
      console.log("Dados iniciais de empresa:", initialData);
      
      if (initialData.professional_info) {
        // Se dados existirem no objeto professional_info
        setCompanyName(initialData.professional_info.company_name || "");
        setCompanySize(initialData.professional_info.company_size || "");
        setCompanySector(initialData.professional_info.company_sector || "");
        setCompanyWebsite(initialData.professional_info.company_website || "");
        setCurrentPosition(initialData.professional_info.current_position || "");
        setAnnualRevenue(initialData.professional_info.annual_revenue || "");
      } else {
        // Se dados estiverem nos campos raiz
        setCompanyName(initialData.company_name || "");
        setCompanySize(initialData.company_size || "");
        setCompanySector(initialData.company_sector || "");
        setCompanyWebsite(initialData.company_website || "");
        setCurrentPosition(initialData.current_position || "");
        setAnnualRevenue(initialData.annual_revenue || "");
      }
    }
  }, [initialData]);

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
    
    console.log("Enviando dados profissionais:", professionalData);
    onSubmit("goals", professionalData);
  };

  return (
    <div className="space-y-6">
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
