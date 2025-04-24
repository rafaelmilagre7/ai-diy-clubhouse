
import { Achievement } from '@/types/achievementTypes';
import { supabase } from '@/lib/supabase';

export const fetchProgressData = async (userId: string) => {
  const { data, error } = await supabase
    .from('progress')
    .select(`
      solution_id,
      is_completed,
      current_module,
      solutions (
        id, category
      )
    `)
    .eq('user_id', userId);
    
  if (error) throw error;
  return data;
};

export const fetchBadgesData = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_badges')
    .select(`
      badge_id,
      earned_at,
      badges (
        id, name, description, category
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
