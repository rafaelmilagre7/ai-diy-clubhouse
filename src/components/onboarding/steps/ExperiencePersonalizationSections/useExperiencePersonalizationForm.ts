
import { useMemo } from "react";
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

export function useExperiencePersonalizationForm(initialData: Partial<ExperienceFormData> = {}) {
  const form = useForm<ExperienceFormData>({
    defaultValues: {
      interests: initialData.interests || [],
      time_preference: initialData.time_preference || [],
      available_days: initialData.available_days || [],
      networking_availability: typeof initialData.networking_availability === "number" ? initialData.networking_availability : 5,
      skills_to_share: initialData.skills_to_share || [],
      mentorship_topics: initialData.mentorship_topics || [],
    }
  });

  const { watch, formState } = form;
  
  // Função corrigida para verificar validade do formulário
  const isValid = useMemo(() => {
    const formValues = watch();
    
    // Verificações mais explícitas para garantir que todos os arrays tenham pelo menos um item
    // e que o valor de networking_availability seja um número
    const interestsValid = Array.isArray(formValues.interests) && formValues.interests.length > 0;
    const timePreferenceValid = Array.isArray(formValues.time_preference) && formValues.time_preference.length > 0;
    const availableDaysValid = Array.isArray(formValues.available_days) && formValues.available_days.length > 0;
    const skillsToShareValid = Array.isArray(formValues.skills_to_share) && formValues.skills_to_share.length > 0;
    const mentorshipTopicsValid = Array.isArray(formValues.mentorship_topics) && formValues.mentorship_topics.length > 0;
    const networkingAvailabilityValid = typeof formValues.networking_availability === "number";
    
    console.log("Validação do formulário:", {
      interestsValid,
      timePreferenceValid,
      availableDaysValid,
      skillsToShareValid,
      mentorshipTopicsValid,
      networkingAvailabilityValid,
      formValues
    });
    
    return interestsValid && 
           timePreferenceValid && 
           availableDaysValid && 
           skillsToShareValid && 
           mentorshipTopicsValid && 
           networkingAvailabilityValid;
  }, [watch]);

  // Função corrigida para trabalhar apenas com campos do tipo array
  function toggleSelect(field: Exclude<FormFieldNames, "networking_availability">, value: string) {
    const currentValues = form.watch(field) as string[];
    if (currentValues.includes(value)) {
      form.setValue(field, currentValues.filter((v: string) => v !== value), { shouldValidate: true, shouldDirty: true });
    } else {
      form.setValue(field, [...currentValues, value], { shouldValidate: true, shouldDirty: true });
    }
  }

  return {
    ...form,
    isValid,
    toggleSelect
  };
}
