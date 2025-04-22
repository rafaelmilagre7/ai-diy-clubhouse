
import React, { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { CompanyNameField } from "./professional-inputs/CompanyNameField";
import { CompanySizeField } from "./professional-inputs/CompanySizeField";
import { CompanySectorField } from "./professional-inputs/CompanySectorField";
import { WebsiteField } from "./professional-inputs/WebsiteField";
import { CurrentPositionField } from "./professional-inputs/CurrentPositionField";
import { AnnualRevenueField } from "./professional-inputs/AnnualRevenueField";
import { Button } from "@/components/ui/button";
import { ArrowRight, AlertCircle, Building2 } from "lucide-react";
import { OnboardingStepProps } from "@/types/onboarding";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import * as validations from "@/utils/professionalDataValidation";
import { normalizeWebsiteUrl } from "@/utils/professionalDataValidation";

interface ProfessionalDataStepProps extends OnboardingStepProps {
  personalInfo?: any;
}

export const ProfessionalDataStep: React.FC<ProfessionalDataStepProps> = ({
  onSubmit,
  isSubmitting,
  initialData,
  isLastStep = false,
  onComplete,
  personalInfo
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  
  // Função melhorada para extrair dados iniciais do objeto
  const getInitialValue = (field: string) => {
    // Verificar primeiro no professional_info se existir
    if (initialData?.professional_info && initialData.professional_info[field] !== undefined && initialData.professional_info[field] !== null) {
      console.log(`Obtendo ${field} de professional_info:`, initialData.professional_info[field]);
      return initialData.professional_info[field];
    }
    // Verificar depois nos campos de nível superior
    if (initialData && initialData[field] !== undefined && initialData[field] !== null) {
      console.log(`Obtendo ${field} de nível superior:`, initialData[field]);
      return initialData[field];
    }
    // Valor padrão vazio
    return "";
  };
  
  // Initialize form with default values
  const methods = useForm({
    defaultValues: {
      company_name: getInitialValue('company_name'),
      company_size: getInitialValue('company_size'),
      company_sector: getInitialValue('company_sector'),
      company_website: getInitialValue('company_website'),
      current_position: getInitialValue('current_position'),
      annual_revenue: getInitialValue('annual_revenue')
    },
    mode: "onChange"
  });
  
  // Atualizar formulário sempre que os dados iniciais mudarem
  useEffect(() => {
    if (initialData) {
      console.log("Atualizando formulário com dados iniciais:", initialData);
      // Fazer um reset completo dos valores do formulário para garantir atualização
      methods.reset({
        company_name: getInitialValue('company_name'),
        company_size: getInitialValue('company_size'),
        company_sector: getInitialValue('company_sector'),
        company_website: getInitialValue('company_website'),
        current_position: getInitialValue('current_position'),
        annual_revenue: getInitialValue('annual_revenue')
      });
    }
  }, [initialData]);

  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    setValidationErrors([]);
    
    // Validar todos os campos
    const errors: string[] = [];
    const validationResults = {
      company_name: validations.validateCompanyName(data.company_name),
      company_website: validations.validateWebsite(data.company_website),
      company_size: validations.validateCompanySize(data.company_size),
      company_sector: validations.validateCompanySector(data.company_sector),
      current_position: validations.validateCurrentPosition(data.current_position),
      annual_revenue: validations.validateAnnualRevenue(data.annual_revenue)
    };

    Object.entries(validationResults).forEach(([field, error]) => {
      if (error) errors.push(error);
    });

    if (errors.length > 0) {
      setValidationErrors(errors);
      setIsLoading(false);
      return;
    }
    
    try {
      // Normalizar a URL do website antes de salvar
      if (data.company_website) {
        data.company_website = normalizeWebsiteUrl(data.company_website);
      }
      
      // Estruturar os dados de forma organizada para o salvamento
      const professionalData = {
        // Dados aninhados na estrutura adequada
        professional_info: {
          company_name: data.company_name,
          company_size: data.company_size,
          company_sector: data.company_sector,
          company_website: data.company_website,
          current_position: data.current_position,
          annual_revenue: data.annual_revenue,
        },
        // Campos individuais para compatibilidade com o sistema atual
        company_name: data.company_name,
        company_size: data.company_size,
        company_sector: data.company_sector,
        company_website: data.company_website,
        current_position: data.current_position,
        annual_revenue: data.annual_revenue,
      };
      
      console.log("Enviando dados profissionais:", professionalData);
      await onSubmit("professional_data", professionalData);
      toast.success("Dados profissionais salvos com sucesso!");
    } catch (error) {
      console.error("Erro ao enviar dados profissionais:", error);
      setValidationErrors(["Falha ao salvar dados. Por favor, tente novamente."]);
      toast.error("Erro ao salvar dados", {
        description: "Verifique sua conexão e tente novamente."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(handleSubmit)} className="space-y-8">
        <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6">
          <div className="flex items-center gap-2 mb-6">
            <Building2 className="h-5 w-5 text-[#0ABAB5]" />
            <h3 className="text-lg font-semibold text-[#0ABAB5]">Dados da Empresa</h3>
          </div>

          {validationErrors.length > 0 && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {validationErrors.map((err, i) => (
                  <div key={i}>{err}</div>
                ))}
              </AlertDescription>
            </Alert>
          )}
          
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
        
        <div className="flex justify-end">
          <Button
            type="submit"
            className="bg-[#0ABAB5] hover:bg-[#099388] text-white px-6 py-2"
            disabled={isSubmitting || isLoading}
          >
            {isSubmitting || isLoading ? (
              "Salvando..."
            ) : (
              <span className="flex items-center gap-2">
                Próximo Passo
                <ArrowRight className="h-4 w-4" />
              </span>
            )}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};
