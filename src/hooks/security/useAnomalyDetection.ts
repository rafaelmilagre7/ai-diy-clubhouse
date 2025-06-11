
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';

interface SecurityAnomaly {
  id: string;
  anomaly_type: string;
  confidence_score: number;
  description?: string;
  affected_user_id?: string;
  detection_data: Record<string, any>;
  status: string;
  detected_at: string;
}

interface AnomalyPattern {
  type: string;
  count: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
}

export const useAnomalyDetection = () => {
  const { isAdmin } = useAuth();
  const [anomalies, setAnomalies] = useState<SecurityAnomaly[]>([]);
  const [patterns, setPatterns] = useState<AnomalyPattern[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState<Date | null>(null);

  // Carregar anomalias existentes
  const loadAnomalies = useCallback(async () => {
    if (!isAdmin) return;

    try {
      const { data, error } = await supabase
        .from('security_anomalies')
        .select('*')
        .gte('detected_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('detected_at', { ascending: false });

      if (error) throw error;

      setAnomalies(data || []);

      // Analisar padrões com tipos corretos
      const typeGroups = (data || []).reduce((acc, anomaly) => {
        acc[anomaly.anomaly_type] = (acc[anomaly.anomaly_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const detectedPatterns: AnomalyPattern[] = Object.entries(typeGroups).map(([type, count]) => {
        const numericCount = Number(count);
        return {
          type,
          count: numericCount,
          severity: numericCount > 10 ? 'critical' : numericCount > 5 ? 'high' : numericCount > 2 ? 'medium' : 'low',
          description: getAnomalyDescription(type, numericCount)
        };
      });

      setPatterns(detectedPatterns);

    } catch (error) {
      console.error('Erro ao carregar anomalias:', error);
    }
  }, [isAdmin]);

  // Executar análise de anomalias
  const runAnomalyDetection = useCallback(async () => {
    if (!isAdmin || isAnalyzing) return;

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('anomaly-detector');
      
      if (error) throw error;

      setLastAnalysis(new Date());
      await loadAnomalies(); // Recarregar dados após análise
      
      return data;
    } catch (error) {
      console.error('Erro ao executar detecção de anomalias:', error);
      throw error;
    } finally {
      setIsAnalyzing(false);
    }
  }, [isAdmin, isAnalyzing, loadAnomalies]);

  // Marcar anomalia como confirmada ou falso positivo
  const updateAnomalyStatus = useCallback(async (anomalyId: string, status: string) => {
    if (!isAdmin) return;

    try {
      const { error } = await supabase
        .from('security_anomalies')
        .update({ 
          status,
          resolved_at: ['confirmed', 'false_positive', 'resolved'].includes(status) ? new Date().toISOString() : null
        })
        .eq('id', anomalyId);

      if (error) throw error;

      // Atualizar localmente
      setAnomalies(prev => 
        prev.map(anomaly => 
          anomaly.id === anomalyId 
            ? { ...anomaly, status }
            : anomaly
        )
      );
    } catch (error) {
      console.error('Erro ao atualizar status da anomalia:', error);
      throw error;
    }
  }, [isAdmin]);

  // Análise comportamental simples
  const analyzeUserBehavior = useCallback(async (userId: string) => {
    if (!isAdmin) return null;

    try {
      const { data: userLogs, error } = await supabase
        .from('security_logs')
        .select('*')
        .eq('user_id', userId)
        .gte('timestamp', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('timestamp', { ascending: false });

      if (error) throw error;

      if (!userLogs || userLogs.length === 0) return null;

      // Análise de padrões simples com tipos corretos
      const hourlyActivity = userLogs.reduce((acc, log) => {
        const hour = new Date(log.timestamp).getHours();
        acc[hour] = (acc[hour] || 0) + 1;
        return acc;
      }, {} as Record<number, number>);

      const dailyActivity = userLogs.reduce((acc, log) => {
        const day = new Date(log.timestamp).getDay();
        acc[day] = (acc[day] || 0) + 1;
        return acc;
      }, {} as Record<number, number>);

      const ipAddresses = [...new Set(userLogs.map(log => log.ip_address).filter(Boolean))];
      const eventTypes = userLogs.reduce((acc, log) => {
        acc[log.event_type] = (acc[log.event_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Corrigir operações matemáticas
      const hourlyEntries = Object.entries(hourlyActivity);
      const dailyEntries = Object.entries(dailyActivity);
      
      const mostActiveHour = hourlyEntries.length > 0 
        ? hourlyEntries.sort(([,a], [,b]) => b - a)[0]?.[0]
        : undefined;
        
      const mostActiveDay = dailyEntries.length > 0
        ? dailyEntries.sort(([,a], [,b]) => b - a)[0]?.[0]
        : undefined;

      return {
        totalEvents: userLogs.length,
        hourlyActivity,
        dailyActivity,
        uniqueIPs: ipAddresses.length,
        ipAddresses,
        eventTypes,
        mostActiveHour,
        mostActiveDay,
        riskScore: calculateRiskScore(userLogs, ipAddresses.length)
      };
    } catch (error) {
      console.error('Erro ao analisar comportamento do usuário:', error);
      return null;
    }
  }, [isAdmin]);

  useEffect(() => {
    loadAnomalies();

    // Subscription para novas anomalias
    if (isAdmin) {
      const channel = supabase
        .channel('anomalies-realtime')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'security_anomalies'
          },
          (payload) => {
            const newAnomaly = payload.new as SecurityAnomaly;
            setAnomalies(prev => [newAnomaly, ...prev]);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isAdmin, loadAnomalies]);

  return {
    anomalies,
    patterns,
    isAnalyzing,
    lastAnalysis,
    runAnomalyDetection,
    updateAnomalyStatus,
    analyzeUserBehavior,
    refreshAnomalies: loadAnomalies
  };
};

// Funções auxiliares
function getAnomalyDescription(type: string, count: number): string {
  const descriptions = {
    'excessive_failed_logins': `${count} usuários com falhas excessivas de login`,
    'suspicious_login_pattern': `${count} padrões de login suspeitos detectados`,
    'off_hours_activity': `${count} atividades fora do horário detectadas`,
    'unusual_ip_access': `${count} acessos de IPs incomuns`,
    'data_access_anomaly': `${count} anomalias de acesso a dados`
  };
  
  return descriptions[type] || `${count} anomalias do tipo ${type}`;
}

function calculateRiskScore(logs: any[], uniqueIPs: number): number {
  let score = 0;
  
  // Múltiplos IPs aumentam risco
  if (uniqueIPs > 3) score += 0.3;
  
  // Atividade fora de horário
  const offHoursActivity = logs.filter(log => {
    const hour = new Date(log.timestamp).getHours();
    return hour < 8 || hour > 18;
  }).length;
  
  if (offHoursActivity > logs.length * 0.3) score += 0.4;
  
  // Eventos de alta severidade
  const highSeverityEvents = logs.filter(log => 
    ['high', 'critical'].includes(log.severity)
  ).length;
  
  if (highSeverityEvents > 0) score += 0.3;
  
  return Math.min(1, score);
}
