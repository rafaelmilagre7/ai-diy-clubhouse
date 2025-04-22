
import React, { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { CompanyNameField } from "./professional-inputs/CompanyNameField";
import { CompanySizeField } from "./professional-inputs/CompanySizeField";
import { CompanySectorField } from "./professional-inputs/CompanySectorField";
import { WebsiteField } from "./professional-inputs/WebsiteField";
import { CurrentPositionField } from "./professional-inputs/CurrentPositionField";
import { AnnualRevenueField } from "./professional-inputs/AnnualRevenueField";
import { AlertCircle, Building2, Loader2 } from "lucide-react";
import { OnboardingStepProps } from "@/types/onboarding";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import * as validations from "@/utils/professionalDataValidation";
import { NavigationButtons } from "@/components/onboarding/NavigationButtons";

interface ProfessionalDataStepProps extends OnboardingStepProps {
  personalInfo?: any;
  onPrevious?: () => void;
}

export const ProfessionalDataStep: React.FC<ProfessionalDataStepProps> = ({
  onSubmit,
  isSubmitting,
  initialData,
  isLastStep = false,
  onComplete,
  personalInfo,
  onPrevious
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [formInitialized, setFormInitialized] = useState(false);
  
  // Log de depuração para ver o formato dos dados iniciais
  console.log("ProfessionalDataStep - initialData:", initialData);
  
  // Função aprimorada para extrair dados iniciais do objeto
  const getInitialValue = (field: string) => {
    if (!initialData) return "";
    
    // Verificar no objeto professional_info
    if (initialData.professional_info && 
        initialData.professional_info[field] !== undefined && 
        initialData.professional_info[field] !== null) {
      return initialData.professional_info[field];
    }
    
    // Verificar nos campos de nível superior
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
    mode: "onBlur" // Alterado de onChange para onBlur para melhorar a experiência de digitação
  });
  
  // Adicionando log para debugging de estados do formulário
  useEffect(() => {
    const subscription = methods.watch((value, { name, type }) => {
      console.log(`Campo ${name} foi alterado (${type}):`, value);
    });
    
    return () => subscription.unsubscribe();
  }, [methods]);
  
  // Efeito para atualizar o formulário quando os dados iniciais mudarem
  useEffect(() => {
    if (initialData) {
      console.log("Atualizando formulário com dados iniciais");
      
      const initialValues = {
        company_name: getInitialValue('company_name'),
        company_size: getInitialValue('company_size'),
        company_sector: getInitialValue('company_sector'),
        company_website: getInitialValue('company_website'),
        current_position: getInitialValue('current_position'),
        annual_revenue: getInitialValue('annual_revenue')
      };
      
      console.log("Valores iniciais do formulário:", initialValues);
      
      // Resetar o formulário com os valores iniciais
      methods.reset(initialValues);
      
      setFormInitialized(true);
    }
  }, [initialData, methods]);

  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    setValidationErrors([]);
    
    try {
      // Validar campos
      const errors: string[] = [];
      
      if (!data.company_name?.trim()) {
        errors.push("Nome da empresa é obrigatório");
      }
      
      if (!data.company_size) {
        errors.push("Tamanho da empresa é obrigatório");
      }
      
      if (!data.company_sector) {
        errors.push("Setor de atuação é obrigatório");
      }
      
      if (!data.current_position?.trim()) {
        errors.push("Cargo atual é obrigatório");
      }
      
      if (!data.annual_revenue) {
        errors.push("Faturamento anual é obrigatório");
      }

      if (errors.length > 0) {
        setValidationErrors(errors);
        setIsLoading(false);
        return;
      }
      
      console.log("Enviando dados profissionais:", data);
      await onSubmit("professional_data", data);
      
      toast.success("Dados salvos com sucesso!");
      
    } catch (error) {
      console.error("Erro ao enviar dados profissionais:", error);
      setValidationErrors(["Falha ao salvar dados. Por favor, tente novamente."]);
      toast.error("Erro ao salvar dados");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrevious = () => {
    if (onPrevious) {
      onPrevious();
    }
  };

  // Tela de carregamento enquanto os dados iniciais não foram carregados
  if (!formInitialized && !initialData) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#0ABAB5] mr-2" />
        <span className="text-gray-300">Carregando seus dados...</span>
      </div>
    );
  }

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
          showPrevious={true}
          onPrevious={handlePrevious}
        />
      </form>
    </FormProvider>
  );
};
