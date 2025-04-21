
import { useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { console } from 'console';

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

export function useExperiencePersonalizationForm(initialData: Partial<ExperienceFormData> = {}) {
  const form = useForm<ExperienceFormData>({
    defaultValues: {
      interests: initialData.interests || [],
      time_preference: initialData.time_preference || [],
      available_days: initialData.available_days || [],
      networking_availability: typeof initialData.networking_availability === "number" ? initialData.networking_availability : 5,
      skills_to_share: initialData.skills_to_share || [],
      mentorship_topics: initialData.mentorship_topics || [],
    },
    mode: "onChange"
  });

  const { watch, setValue, trigger, formState } = form;
  const formValues = watch();

  // Efeito para forçar validação quando o componente é montado
  useEffect(() => {
    // Verificar se temos dados iniciais válidos
    const hasInitialData = 
      initialData?.interests?.length > 0 && 
      initialData?.time_preference?.length > 0 && 
      initialData?.available_days?.length > 0 && 
      initialData?.skills_to_share?.length > 0 && 
      initialData?.mentorship_topics?.length > 0 && 
      typeof initialData?.networking_availability === 'number';
    
    if (hasInitialData) {
      // Forçar validação para atualizar o estado isValid
      trigger();
    }
  }, [initialData, trigger]);

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
  }

  return {
    ...form,
    isValid,
    toggleSelect
  };
}
