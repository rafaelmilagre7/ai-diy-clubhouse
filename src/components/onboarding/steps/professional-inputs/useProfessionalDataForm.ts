
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";

interface UseProfessionalDataFormProps {
  initialData: any;
}

export function useProfessionalDataForm({ initialData }: UseProfessionalDataFormProps) {
  const [formInitialized, setFormInitialized] = useState(false);

  // Função para organizar dados vindos do progresso
  const getInitialValue = (field: string) => {
    if (!initialData) return "";
    if (initialData.professional_info && initialData.professional_info[field] !== undefined && initialData.professional_info[field] !== null) {
      return initialData.professional_info[field];
    }
    if (initialData[field] !== undefined && initialData[field] !== null) {
      return initialData[field];
    }
    return "";
  };

  const methods = useForm({
    defaultValues: {
      company_name: "",
      company_size: "",
      company_sector: "",
      company_website: "",
      current_position: "",
      annual_revenue: ""
    },
    mode: "onSubmit" // Alterado para onSubmit para evitar validação prematura
  });

  // Atualizar formulário se mudar o progresso inicial
  useEffect(() => {
    if (initialData) {
      console.log("Inicializando formulário com dados:", initialData);
      const initialValues = {
        company_name: getInitialValue('company_name'),
        company_size: getInitialValue('company_size'),
        company_sector: getInitialValue('company_sector'),
        company_website: getInitialValue('company_website'),
        current_position: getInitialValue('current_position'),
        annual_revenue: getInitialValue('annual_revenue')
      };
      console.log("Valores iniciais do formulário:", initialValues);
      methods.reset(initialValues);
      setFormInitialized(true);
    }
  }, [initialData, methods]);

  // Esta função ajuda a preservar os valores durante interações com campos específicos
  const safeSetValue = (field: string, value: any) => {
    const currentValues = methods.getValues();
    methods.setValue(field, value, { shouldValidate: false, shouldDirty: true });
    console.log(`Campo ${field} atualizado para:`, value);
    console.log("Valores do formulário após atualização:", methods.getValues());
  };

  return {
    methods,
    formInitialized,
    safeSetValue
  };
}
