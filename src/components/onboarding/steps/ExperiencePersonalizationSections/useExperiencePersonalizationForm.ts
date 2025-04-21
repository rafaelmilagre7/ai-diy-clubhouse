
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

  const { watch } = form;
  const isValid = useMemo(() => {
    const formValues = watch();
    return [
      formValues.interests && formValues.interests.length > 0,
      formValues.time_preference && formValues.time_preference.length > 0,
      formValues.available_days && formValues.available_days.length > 0,
      formValues.skills_to_share && formValues.skills_to_share.length > 0,
      formValues.mentorship_topics && formValues.mentorship_topics.length > 0,
      typeof formValues.networking_availability === "number"
    ].every(Boolean);
  }, [watch]);

  // Função corrigida para trabalhar apenas com campos do tipo array
  function toggleSelect(field: Exclude<FormFieldNames, "networking_availability">, value: string) {
    const currentValues = form.watch(field) as string[];
    if (currentValues.includes(value)) {
      form.setValue(field, currentValues.filter((v: string) => v !== value), { shouldValidate: true });
    } else {
      form.setValue(field, [...currentValues, value], { shouldValidate: true });
    }
  }

  return {
    ...form,
    isValid,
    toggleSelect
  };
}
