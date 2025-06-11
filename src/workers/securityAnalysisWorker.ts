
// Web Worker simplificado para análise de dados de segurança
interface SecurityEvent {
  id: string;
  event_type: string;
  severity: string;
  timestamp: string;
}

interface AnomalyResult {
  id: string;
  type: string;
  confidence: number;
  description: string;
}

self.onmessage = function(e) {
  const { type, data } = e.data;

  try {
    switch (type) {
      case 'ANALYZE_ANOMALIES':
        const anomalies = analyzeAnomalies(data.events || []);
        self.postMessage({ type: 'ANOMALIES_RESULT', data: anomalies });
        break;
        
      case 'PROCESS_SECURITY_LOGS':
        const processedLogs = processSecurityLogs(data.logs || []);
        self.postMessage({ type: 'LOGS_PROCESSED', data: processedLogs });
        break;
        
      case 'CALCULATE_RISK_SCORE':
        const riskScore = calculateRiskScore(data.events || []);
        self.postMessage({ type: 'RISK_SCORE_RESULT', data: riskScore });
        break;
        
      default:
        self.postMessage({ type: 'ERROR', data: 'Tipo de mensagem não reconhecido' });
    }
  } catch (error) {
    self.postMessage({ type: 'ERROR', data: error.message });
  }
};

function analyzeAnomalies(events: SecurityEvent[]): AnomalyResult[] {
  if (!events || events.length === 0) return [];
  
  const anomalies: AnomalyResult[] = [];
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;
  
  // Análise simples de tentativas de login falhadas
  const recentFailedLogins = events.filter(e => 
    e.event_type === 'login_failed' && 
    (now - new Date(e.timestamp).getTime()) < oneHour
  );
  
  if (recentFailedLogins.length > 3) {
    anomalies.push({
      id: `failed_logins_${Date.now()}`,
      type: 'excessive_failed_logins',
      confidence: Math.min(0.9, recentFailedLogins.length / 10),
      description: `${recentFailedLogins.length} tentativas de login falhadas na última hora`
    });
  }
  
  return anomalies.slice(0, 5); // Limitar para economizar memória
}

function processSecurityLogs(logs: any[]): any {
  if (!logs || logs.length === 0) return { totalProcessed: 0, highSeverityCount: 0 };
  
  return {
    totalProcessed: logs.length,
    highSeverityCount: logs.filter(log => 
      log.severity === 'high' || log.severity === 'critical'
    ).length
  };
}

function calculateRiskScore(events: SecurityEvent[]): number {
  if (!events || events.length === 0) return 0;
  
  const weights = { critical: 0.8, high: 0.6, medium: 0.3, low: 0.1 };
  let score = 0;
  
  events.forEach(event => {
    const weight = weights[event.severity as keyof typeof weights] || 0.1;
    score += weight;
  });
  
  return Math.min(1, score / events.length);
}
