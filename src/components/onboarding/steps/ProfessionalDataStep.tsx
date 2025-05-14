import React, { useState, useEffect, useRef } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { CompanyNameField } from "./professional-inputs/CompanyNameField";
import { CompanySizeField } from "./professional-inputs/CompanySizeField";
import { CompanySectorField } from "./professional-inputs/CompanySectorField";
import { WebsiteField } from "./professional-inputs/WebsiteField";
import { CurrentPositionField } from "./professional-inputs/CurrentPositionField";
import { AnnualRevenueField } from "./professional-inputs/AnnualRevenueField";
import { AlertCircle, Building2, CheckCircle } from "lucide-react";
import { OnboardingStepProps } from "@/types/onboarding";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { NavigationButtons } from "@/components/onboarding/NavigationButtons";
import { 
  validateCompanyName, 
  validateWebsite, 
  normalizeWebsiteUrl,
  validateCompanySize,
  validateCompanySector,
  validateCurrentPosition 
} from "@/utils/professionalDataValidation";

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
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const initialDataProcessedRef = useRef(false);
  const toastShown = useRef(false);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Função melhorada para extrair dados iniciais do objeto
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
  // Com ref para evitar atualizações desnecessárias
  useEffect(() => {
    if (initialData && !initialDataProcessedRef.current) {
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
      
      initialDataProcessedRef.current = true;
    }
  }, [initialData, methods]);

  // Efeito para monitorar alterações no formulário para auto-save
  useEffect(() => {
    const subscription = methods.watch((data) => {
      autoSave(data);
    });
    
    return () => {
      subscription.unsubscribe();
      // Limpar qualquer timeout pendente
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [methods.watch]);

  // Função para salvamento automático
  const autoSave = async (data: any) => {
    // Cancelar qualquer auto-save pendente
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    // Programar novo auto-save após 2 segundos de inatividade
    autoSaveTimeoutRef.current = setTimeout(async () => {
      // Verificar se temos dados suficientes para salvar
      if (data.company_name && data.company_name.length >= 2) {
        try {
          setAutoSaveStatus('saving');
          
          // Estruturar os dados para o formato esperado
          const professionalData = {
            professional_info: {
              company_name: data.company_name,
              company_size: data.company_size || "",
              company_sector: data.company_sector || "",
              company_website: data.company_website ? normalizeWebsiteUrl(data.company_website) : "",
              current_position: data.current_position || "",
              annual_revenue: data.annual_revenue || ""
            }
          };
          
          // Chamar onSubmit com flag para não navegar
          await onSubmit("professional_info", professionalData, false);
          setAutoSaveStatus('saved');
          
          // Resetar o status após 3 segundos
          setTimeout(() => {
            setAutoSaveStatus('idle');
          }, 3000);
        } catch (error) {
          console.error("Erro no salvamento automático:", error);
          setAutoSaveStatus('error');
          
          // Resetar o status após 3 segundos
          setTimeout(() => {
            setAutoSaveStatus('idle');
          }, 3000);
        }
      }
    }, 2000);
  };
  
  // Validação melhorada de dados antes do envio
  const validateData = (data: any): string[] => {
    const errors: string[] = [];
    
    // Usar funções de validação específicas
    const companyNameError = validateCompanyName(data.company_name);
    if (companyNameError) errors.push(companyNameError);
    
    const websiteError = validateWebsite(data.company_website);
    if (websiteError) errors.push(websiteError);
    
    const companySizeError = validateCompanySize(data.company_size);
    if (companySizeError) errors.push(companySizeError);
    
    const companySectorError = validateCompanySector(data.company_sector);
    if (companySectorError) errors.push(companySectorError);
    
    const currentPositionError = validateCurrentPosition(data.current_position);
    if (currentPositionError) errors.push(currentPositionError);
    
    return errors;
  };
  
  // Ajustada para não retornar valor booleano e corresponder ao tipo Promise<void>
  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    setValidationErrors([]);
    toastShown.current = false;
    
    try {
      // Validar dados antes do envio
      const errors = validateData(data);
      
      if (errors.length > 0) {
        setValidationErrors(errors);
        setIsLoading(false);
        return;
      }
      
      console.log("Enviando dados profissionais:", data);
      
      // Normalizar URL do website
      if (data.company_website) {
        data.company_website = normalizeWebsiteUrl(data.company_website);
      }
      
      // Estruturando os dados para seguir o padrão professional_info
      const professionalData = {
        professional_info: {
          company_name: data.company_name,
          company_size: data.company_size,
          company_sector: data.company_sector,
          company_website: data.company_website,
          current_position: data.current_position,
          annual_revenue: data.annual_revenue
        }
      };
      
      await onSubmit("professional_info", professionalData);
      
      // Mostra feedback de sucesso apenas uma vez
      if (!toastShown.current) {
        toast.success("Dados salvos com sucesso!", {
          description: "Redirecionando para a próxima etapa..."
        });
        toastShown.current = true;
      }
      
    } catch (error) {
      console.error("Erro ao enviar dados profissionais:", error);
      setValidationErrors(["Falha ao salvar dados. Por favor, tente novamente."]);
      
      if (!toastShown.current) {
        toast.error("Erro ao salvar dados", {
          description: "Verifique sua conexão e tente novamente."
        });
        toastShown.current = true;
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(handleSubmit)} className="space-y-8">
        <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 relative">
          <div className="flex items-center gap-2 mb-6">
            <Building2 className="h-5 w-5 text-[#0ABAB5]" />
            <h3 className="text-lg font-semibold text-[#0ABAB5]">Dados da Empresa</h3>
            
            {/* Indicador de auto-save */}
            <div className="ml-auto">
              {autoSaveStatus === 'saving' && (
                <span className="text-xs text-gray-400 flex items-center">
                  <span className="animate-pulse mr-1">●</span> Salvando...
                </span>
              )}
              {autoSaveStatus === 'saved' && (
                <span className="text-xs text-green-500 flex items-center">
                  <CheckCircle className="w-3 h-3 mr-1" /> Rascunho salvo
                </span>
              )}
              {autoSaveStatus === 'error' && (
                <span className="text-xs text-red-500 flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" /> Erro ao salvar
                </span>
              )}
            </div>
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
