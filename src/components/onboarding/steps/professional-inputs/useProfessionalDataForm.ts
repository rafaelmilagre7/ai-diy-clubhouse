
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
    mode: "onSubmit"
  });

  // Atualizar formulário se mudar o progresso inicial
  useEffect(() => {
    if (initialData) {
      const initialValues = {
        company_name: getInitialValue('company_name'),
        company_size: getInitialValue('company_size'),
        company_sector: getInitialValue('company_sector'),
        company_website: getInitialValue('company_website'),
        current_position: getInitialValue('current_position'),
        annual_revenue: getInitialValue('annual_revenue')
      };
      methods.reset(initialValues);
      setFormInitialized(true);
    }
  }, [initialData, methods]);

  return {
    methods,
    formInitialized
  };
}
