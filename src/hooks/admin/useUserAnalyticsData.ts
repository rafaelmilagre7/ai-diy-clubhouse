
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface UserAnalyticsData {
  // Métricas principais
  totalUsers: number;
  newUsersToday: number;
  activeUsersLast7Days: number;
  growthRate: number;
  
  // Dados para visualizações
  userGrowthData: any[];
  userActivityByDay: any[];
  userRoleDistribution: any[];
  topActiveUsers: any[];
  userRetentionRate: number;
  
  // Dados geográficos (se disponíveis)
  usersByLocation?: any[];
}

interface UserAnalyticsFilters {
  timeRange: string;
}

export const useUserAnalyticsData = (filters: UserAnalyticsFilters) => {
  const [data, setData] = useState<UserAnalyticsData>({
    totalUsers: 0,
    newUsersToday: 0,
    activeUsersLast7Days: 0,
    growthRate: 0,
    userGrowthData: [],
    userActivityByDay: [],
    userRoleDistribution: [],
    topActiveUsers: [],
    userRetentionRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);

        // Determinar intervalo de datas com base no timeRange selecionado
        const now = new Date();
        let startDate = new Date();
        
        switch (filters.timeRange) {
          case '7d':
            startDate.setDate(now.getDate() - 7);
            break;
          case '30d':
            startDate.setDate(now.getDate() - 30);
            break;
          case '90d':
            startDate.setDate(now.getDate() - 90);
            break;
          case 'all':
          default:
            // Pegamos todos os dados, não limitamos por data
            startDate = new Date(0); // 1970-01-01
            break;
        }

        // Converter para formato ISO para usar nas queries
        const startDateISO = startDate.toISOString();
        const todayStart = new Date(now.setHours(0, 0, 0, 0)).toISOString();
        
        // Buscar contagem total de usuários
        const { count: totalUsers, error: countError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });
          
        if (countError) throw countError;

        // Buscar novos usuários hoje
        const { count: newUsersToday, error: newUsersError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', todayStart);
          
        if (newUsersError) throw newUsersError;

        // Buscar todos os usuários para processamento adicional
        const { data: allUsers, error: usersError } = await supabase
          .from('profiles')
          .select('id, name, email, role, created_at, avatar_url, company_name, industry')
          .order('created_at', { ascending: false });
        
        if (usersError) throw usersError;
        
        // Buscar atividades recentes para identificar usuários ativos
        const { data: recentActivities, error: activitiesError } = await supabase
          .from('analytics')
          .select('user_id, created_at')
          .gte('created_at', new Date(now.setDate(now.getDate() - 7)).toISOString())
          .order('created_at', { ascending: false });
          
        if (activitiesError && !activitiesError.message.includes('does not exist')) {
          console.warn("Erro ao buscar atividades:", activitiesError);
        }
        
        // Processar dados para visualizações
        
        // 1. Dados de crescimento de usuários ao longo do tempo
        const userGrowthData = processUserGrowthData(allUsers || [], filters.timeRange);
        
        // 2. Atividade por dia da semana
        const userActivityByDay = processUserActivityByDay(recentActivities || []);
        
        // 3. Distribuição por role
        const userRoleDistribution = processUsersByRole(allUsers || []);
        
        // 4. Usuários mais ativos
        const topActiveUsers = processTopActiveUsers(allUsers || [], recentActivities || []);
        
        // 5. Calcular métricas adicionais
        // Taxa de crescimento (% de novos usuários em relação ao total)
        const previousPeriodUsers = getPreviousPeriodUserCount(allUsers || [], filters.timeRange);
        const currentPeriodUsers = getCurrentPeriodUserCount(allUsers || [], filters.timeRange);
        const growthRate = previousPeriodUsers > 0 
          ? ((currentPeriodUsers - previousPeriodUsers) / previousPeriodUsers) * 100 
          : 0;
        
        // Usuários ativos (últimos 7 dias)
        const activeUserIds = new Set();
        recentActivities?.forEach(activity => activeUserIds.add(activity.user_id));
        const activeUsersLast7Days = activeUserIds.size;
        
        // Taxa de retenção aproximada (simplificada)
        const userRetentionRate = totalUsers ? (activeUsersLast7Days / totalUsers) * 100 : 0;
        
        // Atualizar estado com todos os dados processados
        setData({
          totalUsers: totalUsers || 0,
          newUsersToday: newUsersToday || 0,
          activeUsersLast7Days,
          growthRate,
          userGrowthData,
          userActivityByDay,
          userRoleDistribution,
          topActiveUsers,
          userRetentionRate
        });
        
      } catch (err: any) {
        console.error("Erro ao buscar dados de analytics:", err);
        setError(err.message);
        toast({
          title: "Erro ao carregar dados de analytics",
          description: "Não foi possível carregar as métricas de usuários.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserAnalytics();
  }, [filters.timeRange, toast]);

  return { data, loading, error };
};

// Funções auxiliares para processamento de dados

function processUserGrowthData(users: any[], timeRange: string): any[] {
  // Se não houver usuários, retornamos dados simulados
  if (users.length === 0) {
    return generateMockTimeSeriesData(timeRange);
  }

  const now = new Date();
  let startDate = new Date();
  let interval = 'day';
  let format = 'DD/MM';
  let periods = 7;
  
  switch (timeRange) {
    case '7d':
      startDate.setDate(now.getDate() - 7);
      interval = 'day';
      format = 'DD/MM';
      periods = 7;
      break;
    case '30d':
      startDate.setDate(now.getDate() - 30);
      interval = 'day';
      format = 'DD/MM';
      periods = 30;
      break;
    case '90d':
      startDate.setDate(now.getDate() - 90);
      interval = 'week';
      format = 'WW/YYYY';
      periods = 13;
      break;
    case 'all':
      startDate = new Date(users[users.length - 1]?.created_at || now);
      interval = 'month';
      format = 'MM/YYYY';
      
      // Calcular número de meses entre a primeira data e hoje
      const months = (now.getFullYear() - startDate.getFullYear()) * 12 + 
                     now.getMonth() - startDate.getMonth();
      periods = Math.max(6, months);
      break;
  }

  // Inicializar objeto para contar usuários por período
  const userCounts: Record<string, number> = {};
  
  // Preparar períodos vazios
  for (let i = 0; i < periods; i++) {
    const periodDate = new Date(startDate);
    
    if (interval === 'day') {
      periodDate.setDate(startDate.getDate() + i);
    } else if (interval === 'week') {
      periodDate.setDate(startDate.getDate() + i * 7);
    } else if (interval === 'month') {
      periodDate.setMonth(startDate.getMonth() + i);
    }
    
    // Formatar a chave do período
    const periodKey = formatDateKey(periodDate, interval);
    userCounts[periodKey] = 0;
  }
  
  // Contar usuários por período
  users.forEach(user => {
    const createdAt = new Date(user.created_at);
    if (createdAt >= startDate && createdAt <= now) {
      const periodKey = formatDateKey(createdAt, interval);
      if (userCounts[periodKey] !== undefined) {
        userCounts[periodKey]++;
      }
    }
  });
  
  // Converter para formato de gráfico e calcular valores cumulativos
  let cumulativeTotal = 0;
  return Object.entries(userCounts).map(([date, count]) => {
    cumulativeTotal += count;
    return {
      date,
      novos: count,
      total: cumulativeTotal
    };
  });
}

function formatDateKey(date: Date, interval: string): string {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  
  if (interval === 'day') {
    return `${day}/${month}`;
  } else if (interval === 'week') {
    // Simplificação: usando dia/mês para representar a semana
    return `${day}/${month}`;
  } else if (interval === 'month') {
    return `${month}/${year}`;
  }
  
  return `${day}/${month}/${year}`;
}

function processUserActivityByDay(activities: any[]): any[] {
  const daysOfWeek = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  const activityByDay = Array(7).fill(0);
  
  if (activities.length === 0) {
    // Dados simulados se não houver atividades
    return daysOfWeek.map((day, index) => ({
      name: day,
      atividade: Math.floor(Math.random() * 10) + 2
    }));
  }
  
  // Contar atividades por dia da semana
  activities.forEach(activity => {
    const date = new Date(activity.created_at);
    const dayOfWeek = date.getDay(); // 0 = Domingo, 1 = Segunda, ...
    activityByDay[dayOfWeek]++;
  });
  
  // Formatar para gráfico
  return daysOfWeek.map((day, index) => ({
    name: day,
    atividade: activityByDay[index]
  }));
}

function processUsersByRole(users: any[]): any[] {
  const roleCounts: Record<string, number> = {
    admin: 0,
    member: 0,
    formacao: 0,
    outros: 0
  };
  
  users.forEach(user => {
    const role = user.role?.toLowerCase();
    if (role && roleCounts[role] !== undefined) {
      roleCounts[role]++;
    } else {
      roleCounts.outros++;
    }
  });
  
  // Formatar para gráfico
  return Object.entries(roleCounts).map(([role, count]) => ({
    name: role.charAt(0).toUpperCase() + role.slice(1),
    value: count
  })).filter(item => item.value > 0);
}

function processTopActiveUsers(users: any[], activities: any[]): any[] {
  // Contar atividades por usuário
  const userActivityCount: Record<string, number> = {};
  activities.forEach(activity => {
    const userId = activity.user_id;
    userActivityCount[userId] = (userActivityCount[userId] || 0) + 1;
  });
  
  // Mapear contagens para usuários e ordenar por atividade
  return users
    .map(user => ({
      id: user.id,
      name: user.name || 'Usuário sem nome',
      email: user.email || 'Email não disponível',
      avatarUrl: user.avatar_url,
      company: user.company_name || 'N/A',
      role: user.role || 'member',
      activityCount: userActivityCount[user.id] || 0,
      lastSeen: activities.find(a => a.user_id === user.id)?.created_at || user.created_at
    }))
    .sort((a, b) => b.activityCount - a.activityCount)
    .slice(0, 10);
}

function getPreviousPeriodUserCount(users: any[], timeRange: string): number {
  const now = new Date();
  let currentPeriodStart: Date;
  let previousPeriodStart: Date;
  
  switch (timeRange) {
    case '7d':
      currentPeriodStart = new Date(now.setDate(now.getDate() - 7));
      previousPeriodStart = new Date(now.setDate(now.getDate() - 7));
      break;
    case '30d':
      currentPeriodStart = new Date(now.setDate(now.getDate() - 30));
      previousPeriodStart = new Date(now.setDate(now.getDate() - 30));
      break;
    case '90d':
      currentPeriodStart = new Date(now.setDate(now.getDate() - 90));
      previousPeriodStart = new Date(now.setDate(now.getDate() - 90));
      break;
    case 'all':
    default:
      // Para "all", comparamos a primeira metade do período com a segunda
      const oldestDate = new Date(users[users.length - 1]?.created_at || now);
      const totalDays = Math.ceil((now.getTime() - oldestDate.getTime()) / (1000 * 60 * 60 * 24));
      currentPeriodStart = new Date(now.setDate(now.getDate() - totalDays / 2));
      previousPeriodStart = oldestDate;
      break;
  }
  
  // Contar usuários do período anterior
  return users.filter(user => {
    const createdAt = new Date(user.created_at);
    return createdAt >= previousPeriodStart && createdAt < currentPeriodStart;
  }).length;
}

function getCurrentPeriodUserCount(users: any[], timeRange: string): number {
  const now = new Date();
  let startDate: Date;
  
  switch (timeRange) {
    case '7d':
      startDate = new Date(now.setDate(now.getDate() - 7));
      break;
    case '30d':
      startDate = new Date(now.setDate(now.getDate() - 30));
      break;
    case '90d':
      startDate = new Date(now.setDate(now.getDate() - 90));
      break;
    case 'all':
    default:
      // Para "all", consideramos a segunda metade do período total
      const oldestDate = new Date(users[users.length - 1]?.created_at || now);
      const totalDays = Math.ceil((now.getTime() - oldestDate.getTime()) / (1000 * 60 * 60 * 24));
      startDate = new Date(now.setDate(now.getDate() - totalDays / 2));
      break;
  }
  
  // Contar usuários do período atual
  return users.filter(user => {
    const createdAt = new Date(user.created_at);
    return createdAt >= startDate;
  }).length;
}

function generateMockTimeSeriesData(timeRange: string): any[] {
  const periods = timeRange === '7d' ? 7 : 
                  timeRange === '30d' ? 30 : 
                  timeRange === '90d' ? 13 : 12;
  
  const result = [];
  let total = 10; // Começamos com um valor base
  
  for (let i = 0; i < periods; i++) {
    const novos = Math.floor(Math.random() * 5) + 1;
    total += novos;
    
    let date;
    if (timeRange === '7d' || timeRange === '30d') {
      const d = new Date();
      d.setDate(d.getDate() - (periods - i - 1));
      date = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
    } else if (timeRange === '90d') {
      const d = new Date();
      d.setDate(d.getDate() - (periods - i - 1) * 7);
      date = `Sem ${i + 1}`;
    } else {
      const d = new Date();
      d.setMonth(d.getMonth() - (periods - i - 1));
      date = `${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
    }
    
    result.push({
      date,
      novos,
      total
    });
  }
  
  return result;
}
