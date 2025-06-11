
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth';

interface SecurityAnomaly {
  id: string;
  anomaly_type: string;
  confidence_score: number;
  description?: string;
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

  // Gerar dados demonstrativos
  const generateMockAnomalies = useCallback(() => {
    const mockAnomalies: SecurityAnomaly[] = [
      {
        id: '1',
        anomaly_type: 'excessive_failed_logins',
        confidence_score: 0.85,
        description: 'Múltiplas tentativas de login falhadas detectadas',
        status: 'active',
        detected_at: new Date().toISOString()
      },
      {
        id: '2',
        anomaly_type: 'unusual_access_pattern',
        confidence_score: 0.72,
        description: 'Padrão de acesso fora do horário normal',
        status: 'investigating',
        detected_at: new Date(Date.now() - 1800000).toISOString()
      }
    ];

    const mockPatterns: AnomalyPattern[] = [
      {
        type: 'Login Failures',
        count: 12,
        severity: 'high',
        description: 'Tentativas de login falhadas acima do normal'
      },
      {
        type: 'Off-hours Access',
        count: 5,
        severity: 'medium',
        description: 'Acessos fora do horário comercial'
      },
      {
        type: 'Multiple IPs',
        count: 3,
        severity: 'low',
        description: 'Usuários acessando de múltiplos IPs'
      }
    ];

    setAnomalies(mockAnomalies);
    setPatterns(mockPatterns);
  }, []);

  // Executar análise simulada
  const runAnomalyDetection = useCallback(async () => {
    if (!isAdmin || isAnalyzing) return;

    setIsAnalyzing(true);
    try {
      // Simular processamento
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setLastAnalysis(new Date());
      generateMockAnomalies();
      
      return { success: true, anomaliesDetected: 2 };
    } catch (error) {
      console.error('Erro na análise de anomalias:', error);
      throw error;
    } finally {
      setIsAnalyzing(false);
    }
  }, [isAdmin, isAnalyzing, generateMockAnomalies]);

  // Atualizar status de anomalia
  const updateAnomalyStatus = useCallback(async (anomalyId: string, status: string) => {
    if (!isAdmin) return;

    try {
      setAnomalies(prev => 
        prev.map(anomaly => 
          anomaly.id === anomalyId 
            ? { ...anomaly, status }
            : anomaly
        )
      );
    } catch (error) {
      console.error('Erro ao atualizar anomalia:', error);
      throw error;
    }
  }, [isAdmin]);

  // Análise comportamental simplificada
  const analyzeUserBehavior = useCallback(async (userId: string) => {
    if (!isAdmin) return null;

    // Simular análise
    return {
      totalEvents: Math.floor(Math.random() * 50) + 10,
      riskScore: Math.random() * 0.5, // Score baixo para demonstração
      mostActiveHour: '14',
      mostActiveDay: '1',
      uniqueIPs: Math.floor(Math.random() * 3) + 1
    };
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin) {
      generateMockAnomalies();
    }
  }, [isAdmin, generateMockAnomalies]);

  return {
    anomalies,
    patterns,
    isAnalyzing,
    lastAnalysis,
    runAnomalyDetection,
    updateAnomalyStatus,
    analyzeUserBehavior,
    refreshAnomalies: generateMockAnomalies
  };
};
