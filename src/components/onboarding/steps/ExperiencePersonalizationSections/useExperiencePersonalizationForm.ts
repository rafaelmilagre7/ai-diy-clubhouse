
import { useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";

// Definindo um tipo para os nomes dos campos do formulário
export type FormFieldNames = 
  | "interests" 
  | "time_preference" 
  | "available_days" 
  | "networking_availability" 
  | "skills_to_share" 
  | "mentorship_topics";

// Interface para o tipo de dados que o formulário vai gerenciar
export interface ExperienceFormData {
  interests: string[];
  time_preference: string[];
  available_days: string[];
  networking_availability: number;
  skills_to_share: string[];
  mentorship_topics: string[];
}

export function useExperiencePersonalizationForm(initialData: Partial<ExperienceFormData> | null = {}) {
  // Garantir que initialData nunca seja nulo para evitar erros ao acessar propriedades
  const safeInitialData = initialData || {};
  
  console.log("useExperiencePersonalizationForm initialData:", initialData);
  
  const form = useForm<ExperienceFormData>({
    defaultValues: {
      interests: safeInitialData.interests || [],
      time_preference: safeInitialData.time_preference || [],
      available_days: safeInitialData.available_days || [],
      networking_availability: typeof safeInitialData.networking_availability === "number" ? safeInitialData.networking_availability : 5,
      skills_to_share: safeInitialData.skills_to_share || [],
      mentorship_topics: safeInitialData.mentorship_topics || [],
    },
    mode: "onChange"
  });

  const { watch, setValue, trigger, formState } = form;
  const formValues = watch();

  // Efeito para forçar validação quando o componente é montado
  useEffect(() => {
    // Verificar se temos dados iniciais válidos
    const hasInitialData = 
      safeInitialData?.interests?.length > 0 && 
      safeInitialData?.time_preference?.length > 0 && 
      safeInitialData?.available_days?.length > 0 && 
      safeInitialData?.skills_to_share?.length > 0 && 
      safeInitialData?.mentorship_topics?.length > 0 && 
      typeof safeInitialData?.networking_availability === 'number';
    
    if (hasInitialData) {
      // Forçar validação para atualizar o estado isValid
      trigger();
    }
    
    // Debug
    console.log("Dados iniciais validados:", hasInitialData, safeInitialData);
  }, [safeInitialData, trigger]);

  // Função para verificar se todos os campos obrigatórios estão preenchidos
  const isValid = useMemo(() => {
    // Verifica se todos os arrays têm pelo menos um item
    const hasInterests = formValues.interests?.length > 0;
    const hasTimePreference = formValues.time_preference?.length > 0;
    const hasAvailableDays = formValues.available_days?.length > 0;
    const hasSkillsToShare = formValues.skills_to_share?.length > 0;
    const hasMentorshipTopics = formValues.mentorship_topics?.length > 0;
    
    // Networking availability é um número, então apenas verificamos se existe
    const hasNetworkingAvailability = typeof formValues.networking_availability === "number";
    
    const allFieldsValid = 
      hasInterests && 
      hasTimePreference && 
      hasAvailableDays && 
      hasSkillsToShare && 
      hasMentorshipTopics && 
      hasNetworkingAvailability;
    
    console.log("Estado de validação dos campos:", {
      hasInterests,
      hasTimePreference,
      hasAvailableDays,
      hasSkillsToShare,
      hasMentorshipTopics,
      hasNetworkingAvailability,
      allFieldsValid
    });
    
    return allFieldsValid;
  }, [formValues]);

  // Função para trabalhar apenas com campos do tipo array
  function toggleSelect(field: Exclude<FormFieldNames, "networking_availability">, value: string) {
    const currentValues = form.watch(field) as string[];
    
    if (currentValues.includes(value)) {
      setValue(
        field, 
        currentValues.filter((v: string) => v !== value), 
        { shouldValidate: true, shouldDirty: true }
      );
    } else {
      setValue(
        field, 
        [...currentValues, value], 
        { shouldValidate: true, shouldDirty: true }
      );
    }
    
    console.log(`Campo ${field} atualizado:`, form.watch(field));
  }

  return {
    ...form,
    isValid,
    toggleSelect
  };
}
