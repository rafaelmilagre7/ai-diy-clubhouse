
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
  // Melhorar diagnóstico de conversão
  console.log("[useExperiencePersonalizationForm] Extraindo dados:", data, typeof data);
  
  // CORREÇÃO: Valores padrão para os campos do formulário
  const defaultValues = {
    interests: [],
    time_preference: [],
    available_days: [],
    networking_availability: 5,
    skills_to_share: [],
    mentorship_topics: []
  };
  
  // Se for null ou undefined, retornar valores padrão
  if (data === null || data === undefined) {
    return defaultValues;
  }
  
  // Se for string (pode vir como JSON), tentar fazer o parsing
  if (typeof data === 'string') {
    try {
      const parsed = JSON.parse(data);
      return { ...defaultValues, ...parsed };
    } catch (error) {
      console.error("[useExperiencePersonalizationForm] Erro ao fazer parsing de JSON:", error);
      return defaultValues;
    }
  }
  
  // Se for objeto, retornar
  if (typeof data === 'object') {
    return { ...defaultValues, ...data };
  }
  
  // Fallback para qualquer outro caso
  return defaultValues;
}

export const useExperiencePersonalizationForm = (initialData: InitialFormData | null | undefined) => {
  const initialDataProcessed = useRef(false);
  
  // Extrair dados de personalização para o formulário
  const defaultFormValues = useMemo(() => {
    let experienceData = null;
    
    if (initialData) {
      // Primeiro tentar acessar o objeto experience_personalization
      if (initialData.experience_personalization) {
        experienceData = extractDataFromObject(initialData.experience_personalization);
      } else {
        // Ver se os dados estão no nível raiz
        const rootData = {
          interests: initialData.interests,
          time_preference: initialData.time_preference,
          available_days: initialData.available_days,
          networking_availability: initialData.networking_availability,
          skills_to_share: initialData.skills_to_share,
          mentorship_topics: initialData.mentorship_topics,
        };
        
        // Verificar se temos algum dado válido no nível raiz
        const hasAnyRootData = Object.values(rootData).some(value => 
          value !== undefined && value !== null
        );
        
        if (hasAnyRootData) {
          experienceData = rootData;
        }
      }
    }
    
    return {
      interests: experienceData?.interests || [],
      time_preference: experienceData?.time_preference || [],
      available_days: experienceData?.available_days || [],
      networking_availability: experienceData?.networking_availability || 5,
      skills_to_share: experienceData?.skills_to_share || [],
      mentorship_topics: experienceData?.mentorship_topics || [],
    };
  }, [initialData]);
  
  // Configurar o hook de formulário
  const form = useForm<ExperienceFormData>({
    defaultValues: defaultFormValues
  });
  
  // Atualizar formulário quando houver novos dados iniciais
  useEffect(() => {
    if (initialData && !initialDataProcessed.current) {
      console.log("[useExperiencePersonalizationForm] Atualizando formulário com dados iniciais:", defaultFormValues);
      form.reset(defaultFormValues);
      initialDataProcessed.current = true;
    }
  }, [initialData, form, defaultFormValues]);
  
  return {
    form,
    defaultValues: defaultFormValues
  };
};
