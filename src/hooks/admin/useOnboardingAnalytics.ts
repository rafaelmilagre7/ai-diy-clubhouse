
import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { OnboardingProgress } from "@/types/onboarding";

export type OnboardingStats = {
  totalUsers: number;
  completedUsers: number;
  partialUsers: number;
  completionRate: number;
  averageCompletionSteps: number;
  usersByPeriod: {
    label: string;
    total: number;
    date: string;
  }[];
};

export type SectorDistribution = {
  name: string;
  value: number;
}[];

export type CompanySizeDistribution = {
  name: string;
  value: number;
}[];

export type BusinessGoalsDistribution = {
  name: string;
  value: number;
}[];

export type AIExperienceDistribution = {
  name: string;
  value: number;
}[];

export type ContentPreferencesDistribution = {
  name: string;
  value: number;
}[];

export type WeekdayAvailability = {
  name: string;
  atividade: number;
}[];

export type OnboardingTimeRange = '7d' | '30d' | '90d' | 'all';

export interface OnboardingAnalyticsData {
  stats: OnboardingStats;
  sectorDistribution: SectorDistribution;
  companySizeDistribution: CompanySizeDistribution;
  businessGoalsDistribution: BusinessGoalsDistribution; 
  aiExperienceDistribution: AIExperienceDistribution;
  contentPreferencesDistribution: ContentPreferencesDistribution;
  weekdayAvailability: WeekdayAvailability;
}

export const useOnboardingAnalytics = (timeRange: OnboardingTimeRange = 'all') => {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [onboardingData, setOnboardingData] = useState<OnboardingProgress[]>([]);
  const { toast } = useToast();

  // Função para carregar dados do onboarding
  useEffect(() => {
    const fetchOnboardingData = async () => {
      if (!profile || profile.role !== 'admin') {
        setError("Acesso não autorizado");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Definir filtro de data baseado no timeRange
        let query = supabase.from("onboarding_progress").select("*");
        
        if (timeRange !== 'all') {
          const daysBack = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
          const fromDate = new Date();
          fromDate.setDate(fromDate.getDate() - daysBack);
          
          query = query.gte('created_at', fromDate.toISOString());
        }

        const { data, error } = await query;

        if (error) {
          throw error;
        }

        console.log(`Dados de onboarding carregados (${timeRange}):`, data?.length || 0);
        setOnboardingData(data as OnboardingProgress[] || []);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erro ao carregar dados de onboarding";
        console.error("Erro ao carregar dados de onboarding:", err);
        setError(message);
        toast({
          title: "Erro ao carregar dados",
          description: message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOnboardingData();
  }, [profile, timeRange, toast]);

  // Calcular estatísticas gerais e distribuições
  const analytics = useMemo<OnboardingAnalyticsData>(() => {
    // Inicializar objeto de retorno com valores padrão
    const defaultAnalytics: OnboardingAnalyticsData = {
      stats: {
        totalUsers: 0,
        completedUsers: 0,
        partialUsers: 0,
        completionRate: 0,
        averageCompletionSteps: 0,
        usersByPeriod: []
      },
      sectorDistribution: [],
      companySizeDistribution: [],
      businessGoalsDistribution: [],
      aiExperienceDistribution: [],
      contentPreferencesDistribution: [],
      weekdayAvailability: [
        { name: "Segunda", atividade: 0 },
        { name: "Terça", atividade: 0 },
        { name: "Quarta", atividade: 0 },
        { name: "Quinta", atividade: 0 },
        { name: "Sexta", atividade: 0 },
        { name: "Sábado", atividade: 0 },
        { name: "Domingo", atividade: 0 },
      ]
    };
    
    // Se não há dados, retornar valores padrão
    if (!onboardingData || onboardingData.length === 0) {
      return defaultAnalytics;
    }

    try {
      // 1. Estatísticas gerais
      const completedUsers = onboardingData.filter(p => p.is_completed).length;
      const totalUsers = onboardingData.length;
      const partialUsers = totalUsers - completedUsers;
      const completionRate = totalUsers > 0 ? (completedUsers / totalUsers * 100) : 0;
      
      // Média de etapas completadas
      const totalCompletedSteps = onboardingData.reduce((sum, user) => {
        return sum + (Array.isArray(user.completed_steps) ? user.completed_steps.length : 0);
      }, 0);
      const averageCompletionSteps = totalUsers > 0 ? (totalCompletedSteps / totalUsers) : 0;

      // Agrupar usuários por data de criação (últimos 7 ou 30 dias dependendo do timeRange)
      const usersByPeriod = processUsersByPeriod(onboardingData, timeRange);

      // 2. Distribuição por setor
      const sectorDistribution = processDistribution(onboardingData, 'company_sector', 'professional_info');
      
      // 3. Distribuição por tamanho da empresa
      const companySizeDistribution = processDistribution(onboardingData, 'company_size', 'professional_info');
      
      // 4. Distribuição de objetivos de negócio
      const businessGoalsDistribution = processPrimaryGoals(onboardingData);
      
      // 5. Distribuição de experiência com IA
      const aiExperienceDistribution = processAIExperience(onboardingData);
      
      // 6. Preferências de conteúdo
      const contentPreferencesDistribution = processContentPreferences(onboardingData);
      
      // 7. Disponibilidade por dia da semana
      const weekdayAvailability = processWeekdayAvailability(onboardingData);

      return {
        stats: {
          totalUsers,
          completedUsers,
          partialUsers,
          completionRate,
          averageCompletionSteps,
          usersByPeriod
        },
        sectorDistribution,
        companySizeDistribution,
        businessGoalsDistribution,
        aiExperienceDistribution,
        contentPreferencesDistribution,
        weekdayAvailability
      };
    } catch (err) {
      console.error("Erro ao processar dados para análise:", err);
      return defaultAnalytics;
    }
  }, [onboardingData, timeRange]);

  return {
    loading,
    error,
    data: analytics,
    rawData: onboardingData
  };
};

// Funções auxiliares para processamento de dados

function processUsersByPeriod(data: OnboardingProgress[], timeRange: OnboardingTimeRange): {label: string, total: number, date: string}[] {
  if (!data || data.length === 0) return [];
  
  // Determinar o número de pontos de dados baseado no timeRange
  const numberOfPoints = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
  const result: {label: string, total: number, date: string}[] = [];
  
  // Criar array de datas para o período
  const today = new Date();
  
  for (let i = numberOfPoints - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Formatar data para exibição
    const formattedDate = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    const isoDate = date.toISOString().split('T')[0]; // Formato YYYY-MM-DD para comparação
    
    // Contar usuários criados nesta data
    const usersThisDay = data.filter(user => {
      const userDate = user.created_at ? new Date(user.created_at).toISOString().split('T')[0] : '';
      return userDate === isoDate;
    }).length;
    
    result.push({ 
      label: formattedDate,
      total: usersThisDay,
      date: isoDate
    });
  }
  
  return result;
}

function processDistribution(data: OnboardingProgress[], fieldName: string, section?: string): {name: string, value: number}[] {
  const distribution: Record<string, number> = {};
  let totalWithValue = 0;

  data.forEach(item => {
    let value;
    
    if (section && typeof item[section as keyof OnboardingProgress] === 'object') {
      // Tentar obter valor do campo dentro da seção (que é um objeto)
      const sectionObj = item[section as keyof OnboardingProgress];
      if (typeof sectionObj === 'object' && sectionObj !== null) {
        value = section === 'professional_info' 
          ? (sectionObj as any)[fieldName] || item[fieldName as keyof OnboardingProgress]
          : (sectionObj as any)[fieldName];
      }
    } else {
      // Tentar obter valor diretamente do objeto principal
      value = item[fieldName as keyof OnboardingProgress];
    }
    
    // Normalizar valor
    if (typeof value === 'string' && value.trim() !== '') {
      const normalizedValue = value.trim();
      distribution[normalizedValue] = (distribution[normalizedValue] || 0) + 1;
      totalWithValue++;
    }
  });

  // Converter para o formato esperado e ordenar por frequência
  const result = Object.entries(distribution)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // Adicionar "Não informado" se necessário
  const notInformed = data.length - totalWithValue;
  if (notInformed > 0) {
    result.push({ name: "Não informado", value: notInformed });
  }

  return result;
}

function processPrimaryGoals(data: OnboardingProgress[]): {name: string, value: number}[] {
  const goalDistribution: Record<string, number> = {};
  let totalWithGoals = 0;

  data.forEach(item => {
    let primaryGoal = null;
    
    // Tentar obter o objetivo principal
    if (item.business_goals) {
      // Se for string, tentar converter para objeto
      let businessGoals = item.business_goals;
      if (typeof businessGoals === 'string') {
        try {
          businessGoals = JSON.parse(businessGoals);
        } catch (e) {
          console.warn("Erro ao parsear business_goals:", e);
        }
      }
      
      if (typeof businessGoals === 'object' && businessGoals !== null) {
        primaryGoal = (businessGoals as any).primary_goal;
      }
    }
    
    // Normalizar valor
    if (typeof primaryGoal === 'string' && primaryGoal.trim() !== '') {
      const normalizedGoal = primaryGoal.trim();
      goalDistribution[normalizedGoal] = (goalDistribution[normalizedGoal] || 0) + 1;
      totalWithGoals++;
    }
  });

  // Converter para o formato esperado e ordenar por frequência
  const result = Object.entries(goalDistribution)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // Adicionar "Não informado" se necessário
  const notInformed = data.length - totalWithGoals;
  if (notInformed > 0) {
    result.push({ name: "Não definido", value: notInformed });
  }

  return result;
}

function processAIExperience(data: OnboardingProgress[]): {name: string, value: number}[] {
  const experienceLevels: Record<string, number> = {};
  let totalWithExperience = 0;

  data.forEach(item => {
    let knowledgeLevel = null;
    
    // Tentar obter o nível de conhecimento
    if (item.ai_experience) {
      // Se for string, tentar converter para objeto
      let aiExperience = item.ai_experience;
      if (typeof aiExperience === 'string') {
        try {
          aiExperience = JSON.parse(aiExperience);
        } catch (e) {
          console.warn("Erro ao parsear ai_experience:", e);
        }
      }
      
      if (typeof aiExperience === 'object' && aiExperience !== null) {
        knowledgeLevel = (aiExperience as any).knowledge_level;
      }
    }
    
    // Normalizar valor
    if (typeof knowledgeLevel === 'string' && knowledgeLevel.trim() !== '') {
      const normalizedLevel = knowledgeLevel.trim();
      experienceLevels[normalizedLevel] = (experienceLevels[normalizedLevel] || 0) + 1;
      totalWithExperience++;
    }
  });

  // Converter para o formato esperado e ordenar por frequência
  const result = Object.entries(experienceLevels)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // Adicionar "Não informado" se necessário
  const notInformed = data.length - totalWithExperience;
  if (notInformed > 0) {
    result.push({ name: "Não informado", value: notInformed });
  }

  return result;
}

function processContentPreferences(data: OnboardingProgress[]): {name: string, value: number}[] {
  const contentFormats: Record<string, number> = {};
  let totalEntries = 0;

  data.forEach(item => {
    let contentFormatsList: string[] = [];
    
    // Tentar obter os formatos de conteúdo preferidos
    if (item.business_goals) {
      // Se for string, tentar converter para objeto
      let businessGoals = item.business_goals;
      if (typeof businessGoals === 'string') {
        try {
          businessGoals = JSON.parse(businessGoals);
        } catch (e) {
          console.warn("Erro ao parsear business_goals para content_formats:", e);
        }
      }
      
      if (typeof businessGoals === 'object' && businessGoals !== null && (businessGoals as any).content_formats) {
        contentFormatsList = Array.isArray((businessGoals as any).content_formats) 
          ? (businessGoals as any).content_formats 
          : [(businessGoals as any).content_formats];
      }
    }
    
    // Processar cada formato na lista
    if (contentFormatsList.length > 0) {
      contentFormatsList.forEach(format => {
        if (typeof format === 'string' && format.trim() !== '') {
          const normalizedFormat = format.trim();
          contentFormats[normalizedFormat] = (contentFormats[normalizedFormat] || 0) + 1;
          totalEntries++;
        }
      });
    }
  });

  // Converter para o formato esperado e ordenar por frequência
  return Object.entries(contentFormats)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

function processWeekdayAvailability(data: OnboardingProgress[]): {name: string, atividade: number}[] {
  // Inicializar contadores para cada dia da semana
  const weekdays = [
    { name: "Segunda", atividade: 0 },
    { name: "Terça", atividade: 0 },
    { name: "Quarta", atividade: 0 },
    { name: "Quinta", atividade: 0 },
    { name: "Sexta", atividade: 0 },
    { name: "Sábado", atividade: 0 },
    { name: "Domingo", atividade: 0 },
  ];

  data.forEach(item => {
    let availableDays: string[] = [];
    
    // Tentar obter os dias disponíveis da personalização da experiência
    if (item.experience_personalization) {
      // Se for string, tentar converter para objeto
      let expPersonalization = item.experience_personalization;
      if (typeof expPersonalization === 'string') {
        try {
          expPersonalization = JSON.parse(expPersonalization);
        } catch (e) {
          console.warn("Erro ao parsear experience_personalization para available_days:", e);
        }
      }
      
      if (typeof expPersonalization === 'object' && expPersonalization !== null) {
        // Tentar diferentes nomes de campo possíveis
        availableDays = Array.isArray((expPersonalization as any).available_days)
          ? (expPersonalization as any).available_days
          : Array.isArray((expPersonalization as any).days_available)
            ? (expPersonalization as any).days_available
            : [];
      }
    }
    
    // Mapear nomes dos dias para índices
    const dayMapping: Record<string, number> = {
      'segunda': 0, 'segunda-feira': 0, 
      'terça': 1, 'terca': 1, 'terça-feira': 1, 'terca-feira': 1,
      'quarta': 2, 'quarta-feira': 2,
      'quinta': 3, 'quinta-feira': 3,
      'sexta': 4, 'sexta-feira': 4,
      'sábado': 5, 'sabado': 5,
      'domingo': 6
    };
    
    // Incrementar contadores para os dias disponíveis
    availableDays.forEach(day => {
      if (typeof day === 'string') {
        const normalizedDay = day.trim().toLowerCase();
        const dayIndex = dayMapping[normalizedDay];
        
        if (dayIndex !== undefined && weekdays[dayIndex]) {
          weekdays[dayIndex].atividade += 1;
        }
      }
    });
  });

  return weekdays;
}
