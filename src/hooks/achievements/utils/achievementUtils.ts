import { Achievement, ensureValidCategory, achievementCache } from '@/types/achievementTypes';
import { supabase } from '@/lib/supabase';

export const fetchProgressData = async (userId: string) => {
  const { data, error } = await supabase
    .from('progress')
    .select(`
      id,
      user_id,
      solution_id,
      is_completed,
      current_module,
      last_activity,
      completed_at,
      completed_modules,
      solutions (
        id, category, title
      )
    `)
    .eq('user_id', userId);
    
  if (error) throw error;
  return data;
};

export const fetchBadgesData = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_badges')
      .select(`
        id,
        badge_id,
        earned_at,
        badges (
          id, name, description, category, icon
        )
      `)
      .eq('user_id', userId);
      
    // Se ocorrer um erro, retornar um array vazio em vez de lançar o erro
    // Isso evitará que a falha na tabela badges quebre o carregamento do dashboard
    if (error) {
      console.warn("Erro ao carregar badges (pode ser que a tabela não existe):", error);
      return [];
    }
    
    return data;
  } catch (err) {
    console.error("Erro ao buscar badges:", err);
    return []; // Retornar array vazio para evitar quebrar o fluxo
  }
};

export const fetchChecklistData = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_checklists')
      .select(`
        id,
        user_id,
        solution_id,
        checked_items,
        is_completed,
        completed_at
      `)
      .eq('user_id', userId);
      
    if (error) {
      console.warn("Erro ao carregar checklists:", error);
      return [];
    }
    
    return data;
  } catch (err) {
    console.error("Erro ao buscar checklists:", err);
    return [];
  }
};

export const fetchSocialData = async (userId: string) => {
  try {
    // Buscar comentários do usuário
    const { data: comments, error: commentsError } = await supabase
      .from("solution_comments")
      .select("*")
      .eq("user_id", userId);
      
    if (commentsError) throw commentsError;
    
    // Buscar likes nos comentários
    const { data: likes, error: likesError } = await supabase
      .from("solution_comment_likes")
      .select("comment_id")
      .eq("user_id", userId);
      
    if (likesError) throw likesError;
    
    return {
      comments: comments || [],
      totalComments: (comments || []).length,
      totalLikes: (likes || []).length
    };
  } catch (error) {
    console.error("Erro ao buscar dados sociais:", error);
    return {
      comments: [],
      totalComments: 0,
      totalLikes: 0
    };
  }
};

export const createFallbackAchievements = (): Achievement[] => {
  return [
    {
      id: 'achievement-beginner',
      name: 'Iniciante',
      description: 'Começou sua jornada no clube',
      category: "achievement",
      isUnlocked: true,
      earnedAt: new Date().toISOString(),
    },
    {
      id: 'achievement-pioneiro',
      name: 'Pioneiro',
      description: 'Completou sua primeira implementação',
      category: "achievement", 
      requiredCount: 1,
      currentCount: 0,
      isUnlocked: false,
    }
  ];
};

export const removeDuplicateAchievements = (achievements: Achievement[]): Achievement[] => {
  return Array.from(new Map(achievements.map(item => [item.id, item])).values());
};

export const formatDate = (dateString?: string): string => {
  if (!dateString) return 'hoje';
  
  try {
    const date = new Date(dateString);
    // Se for hoje, retornar "hoje"
    if (isToday(date)) return 'hoje';
    
    // Caso contrário, formatar como DD/MM/YYYY
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (e) {
    return 'data desconhecida';
  }
};

// Função auxiliar para verificar se uma data é hoje
const isToday = (date: Date): boolean => {
  const today = new Date();
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
};

// Mapeamento de categorias para garantir que os valores sejam válidos
export const mapToValidCategory = (category: string): "achievement" | "revenue" | "operational" | "strategy" => {
  return ensureValidCategory(category);
};

// Novo: Função para tratar o processamento de conquistas com persistência
export const processAchievements = (
  achievements: Achievement[], 
  previousAchievements: Achievement[]
): Achievement[] => {
  // Se não havia conquistas anteriores, apenas retornamos as atuais
  if (!previousAchievements || previousAchievements.length === 0) {
    return achievements;
  }

  // Preservamos o estado de desbloqueio para conquistas que podem ter sido temporariamente perdidas
  // durante uma reconexão ou recarga parcial de dados
  return achievements.map(achievement => {
    const previousAchievement = previousAchievements.find(a => a.id === achievement.id);
    
    // Se a conquista já estava desbloqueada anteriormente, mantemos esse estado
    if (previousAchievement && previousAchievement.isUnlocked && !achievement.isUnlocked) {
      return {
        ...achievement,
        isUnlocked: true,
        earnedAt: previousAchievement.earnedAt
      };
    }
    
    return achievement;
  });
};
