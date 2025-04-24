
import React, { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { CompanyNameField } from "./professional-inputs/CompanyNameField";
import { CompanySizeField } from "./professional-inputs/CompanySizeField";
import { CompanySectorField } from "./professional-inputs/CompanySectorField";
import { WebsiteField } from "./professional-inputs/WebsiteField";
import { CurrentPositionField } from "./professional-inputs/CurrentPositionField";
import { AnnualRevenueField } from "./professional-inputs/AnnualRevenueField";
import { AlertCircle, Building2 } from "lucide-react";
import { OnboardingStepProps } from "@/types/onboarding";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { NavigationButtons } from "@/components/onboarding/NavigationButtons";

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
  const [initialDataProcessed, setInitialDataProcessed] = useState(false);
  
  console.log("ProfessionalDataStep - initialData recebido:", initialData);
  
  // Função aprimorada para extrair dados iniciais do objeto
  const getInitialValue = (field: string) => {
    if (!initialData) return "";
    
    // Primeiro verificar no objeto professional_info
    if (initialData.professional_info && 
        initialData.professional_info[field] !== undefined && 
        initialData.professional_info[field] !== null) {
      return initialData.professional_info[field];
    }
    
    // Depois verificar nos campos de nível superior
    if (initialData[field] !== undefined && initialData[field] !== null) {
      return initialData[field];
    }
    
    return "";
  };
  
  // Inicializar formulário com métodos do react-hook-form
  const methods = useForm({
    defaultValues: {
      company_name: "",
      company_size: "",
      company_sector: "",
      company_website: "",
      current_position: "",
      annual_revenue: ""
    },
    mode: "onChange"
  });
  
  // Efeito para atualizar o formulário quando os dados iniciais mudarem
  // Com flag para evitar atualizações desnecessárias
  useEffect(() => {
    if (initialData && !initialDataProcessed) {
      console.log("Atualizando formulário com dados iniciais:", initialData);
      
      // Resetar o formulário com os valores iniciais
      methods.reset({
        company_name: getInitialValue('company_name'),
        company_size: getInitialValue('company_size'),
        company_sector: getInitialValue('company_sector'),
        company_website: getInitialValue('company_website'),
        current_position: getInitialValue('current_position'),
        annual_revenue: getInitialValue('annual_revenue')
      });
      
      setInitialDataProcessed(true);
    }
  }, [initialData]);

  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    setValidationErrors([]);
    
    try {
      // Verificação básica se os campos obrigatórios estão preenchidos
      const requiredFields = ['company_name', 'company_size', 'company_sector', 'current_position', 'annual_revenue'];
      const errors: string[] = [];
      
      requiredFields.forEach(field => {
        if (!data[field]) {
          errors.push(`O campo ${field.replace('_', ' ')} é obrigatório`);
        }
      });

      if (errors.length > 0) {
        setValidationErrors(errors);
        setIsLoading(false);
        return;
      }
      
      console.log("Enviando dados profissionais:", data);
      await onSubmit("professional_data", data);
      
      // Mostra feedback de sucesso
      toast.success("Dados salvos com sucesso!", {
        description: "Redirecionando para a próxima etapa..."
      });
      
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
        
        <NavigationButtons 
          isSubmitting={isSubmitting || isLoading}
          submitText="Próximo Passo"
          loadingText="Salvando..."
          showPrevious={false}
        />
      </form>
    </FormProvider>
  );
};
