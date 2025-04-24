
import { useMemo, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { OnboardingData, OnboardingProgress } from "@/types/onboarding";

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

// Interface que define a estrutura dos dados iniciais recebidos
interface InitialFormData {
  experience_personalization?: {
    interests?: string[];
    time_preference?: string[];
    available_days?: string[];
    networking_availability?: number;
    skills_to_share?: string[];
    mentorship_topics?: string[];
  } | string;
  [key: string]: any;
}

// Função para extrair dados de um objeto ou string JSON
function extractDataFromObject(data: any): Record<string, any> {
  // CORREÇÃO: Melhorar diagnóstico de conversão
  console.log("Extraindo dados do objeto ou string:", data, typeof data);
  
  // Se for string, tentar parsear
  if (typeof data === 'string') {
    try {
      if (data.trim() === '') {
        console.log("String vazia, retornando objeto vazio");
        return {};
      }
      
      console.log("Tentando parsear string como JSON:", data);
      const parsed = JSON.parse(data);
      console.log("String parseada com sucesso:", parsed);
      return parsed;
    } catch (e) {
      console.error("Erro ao parsear string como objeto:", e);
      return {};
    }
  }
  
  // Se for objeto, retornar diretamente
  if (data && typeof data === 'object') {
    return data;
  }
  
  return {};
}

export function useExperiencePersonalizationForm(initialData: InitialFormData | null = {}) {
  // Garantir que initialData nunca seja nulo para evitar erros ao acessar propriedades
  const safeInitialData = initialData || {};
  const initialized = useRef(false);
  
  // Extrair dados de personalização de forma segura
  const experienceData = useMemo(() => {
    console.log("Processando initialData em useExperiencePersonalizationForm:", initialData);
    
    // CORREÇÃO: Melhor diagnóstico de inicialização do formulário
    // Se initialData tem experience_personalization, usar isso
    if (initialData && initialData.experience_personalization) {
      let expData = initialData.experience_personalization;
      console.log("Dados de personalização encontrados:", expData, typeof expData);
      
      // Extrair dados do objeto ou string
      const extractedData = extractDataFromObject(expData);
      console.log("Dados extraídos:", extractedData);
      return extractedData;
    }
    
    // Caso contrário, verificar se initialData tem diretamente as propriedades esperadas
    if (initialData && 
        ('interests' in initialData || 
         'time_preference' in initialData || 
         'available_days' in initialData || 
         'networking_availability' in initialData || 
         'skills_to_share' in initialData || 
         'mentorship_topics' in initialData)) {
      console.log("Usando propriedades de raiz em initialData");
      return initialData;
    }
    
    console.log("Sem dados de inicialização válidos, retornando objeto vazio");
    return {};
  }, [initialData]);
  
  console.log("Dados processados para formulário:", experienceData);
  
  // CORREÇÃO: Garantir que os arrays são realmente arrays
  const ensureArray = (value: any) => {
    // Se for array, retornar diretamente
    if (Array.isArray(value)) return value;
    
    // Se for undefined ou null, retornar array vazio
    if (value === undefined || value === null) return [];
    
    // Se for string, tentar parsear como JSON
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        // Se o resultado for array, retornar
        if (Array.isArray(parsed)) return parsed;
        // Caso contrário, envolver em array
        return [parsed];
      } catch {
        // Se falhar ao parsear, tratar como valor único
        return [value];
      }
    }
    
    // Para outros tipos, envolver em array
    return [value];
  };
  
  // CORREÇÃO: Log detalhado dos valores iniciais
  console.log("Inicializando formulário com valores:");
  console.log("interests:", experienceData.interests, typeof experienceData.interests);
  console.log("time_preference:", experienceData.time_preference, typeof experienceData.time_preference);
  console.log("available_days:", experienceData.available_days, typeof experienceData.available_days);
  console.log("networking_availability:", experienceData.networking_availability, typeof experienceData.networking_availability);
  console.log("skills_to_share:", experienceData.skills_to_share, typeof experienceData.skills_to_share);
  console.log("mentorship_topics:", experienceData.mentorship_topics, typeof experienceData.mentorship_topics);
  
  const form = useForm<ExperienceFormData>({
    defaultValues: {
      interests: ensureArray(experienceData.interests),
      time_preference: ensureArray(experienceData.time_preference),
      available_days: ensureArray(experienceData.available_days),
      networking_availability: typeof experienceData.networking_availability === "number" ? 
                             experienceData.networking_availability : 5,
      skills_to_share: ensureArray(experienceData.skills_to_share),
      mentorship_topics: ensureArray(experienceData.mentorship_topics),
    },
    mode: "onChange"
  });

  const { watch, setValue, trigger, formState } = form;
  const formValues = watch();

  // Efeito para forçar validação quando o componente é montado, apenas uma vez
  useEffect(() => {
    if (!initialized.current) {
      // Forçar validação para atualizar o estado isValid
      trigger();
      initialized.current = true;
    }
  }, [trigger]);

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
    
    if (currentValues && currentValues.includes(value)) {
      setValue(
        field, 
        currentValues.filter((v: string) => v !== value), 
        { shouldValidate: true, shouldDirty: true }
      );
    } else {
      setValue(
        field, 
        [...(currentValues || []), value], 
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
