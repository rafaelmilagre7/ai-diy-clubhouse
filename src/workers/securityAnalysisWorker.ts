
// Web Worker para análise de dados de segurança
interface SecurityEvent {
  id: string;
  event_type: string;
  severity: string;
  timestamp: string;
  details: Record<string, any>;
}

interface AnomalyResult {
  id: string;
  type: string;
  confidence: number;
  description: string;
  events: string[];
}

self.onmessage = function(e) {
  const { type, data } = e.data;

  switch (type) {
    case 'ANALYZE_ANOMALIES':
      const anomalies = analyzeAnomalies(data.events);
      self.postMessage({ type: 'ANOMALIES_RESULT', data: anomalies });
      break;
      
    case 'PROCESS_SECURITY_LOGS':
      const processedLogs = processSecurityLogs(data.logs);
      self.postMessage({ type: 'LOGS_PROCESSED', data: processedLogs });
      break;
      
    case 'CALCULATE_RISK_SCORE':
      const riskScore = calculateRiskScore(data.events);
      self.postMessage({ type: 'RISK_SCORE_RESULT', data: riskScore });
      break;
      
    default:
      console.warn('Tipo de mensagem não reconhecido:', type);
  }
};

function analyzeAnomalies(events: SecurityEvent[]): AnomalyResult[] {
  const anomalies: AnomalyResult[] = [];
  
  // Análise de tentativas de login falhadas
  const failedLogins = events.filter(e => 
    e.event_type === 'login_failed' && 
    new Date(e.timestamp) > new Date(Date.now() - 60 * 60 * 1000) // última hora
  );
  
  if (failedLogins.length > 5) {
    anomalies.push({
      id: `failed_logins_${Date.now()}`,
      type: 'excessive_failed_logins',
      confidence: Math.min(0.9, failedLogins.length / 10),
      description: `${failedLogins.length} tentativas de login falhadas na última hora`,
      events: failedLogins.map(e => e.id)
    });
  }
  
  // Análise de acesso fora de horário
  const offHoursAccess = events.filter(e => {
    const hour = new Date(e.timestamp).getHours();
    return hour < 6 || hour > 22;
  });
  
  if (offHoursAccess.length > 3) {
    anomalies.push({
      id: `off_hours_${Date.now()}`,
      type: 'off_hours_activity',
      confidence: 0.7,
      description: `${offHoursAccess.length} acessos fora do horário comercial`,
      events: offHoursAccess.map(e => e.id)
    });
  }
  
  return anomalies;
}

function processSecurityLogs(logs: any[]): any {
  return {
    totalProcessed: logs.length,
    highSeverityCount: logs.filter(log => log.severity === 'high' || log.severity === 'critical').length,
    timeRange: {
      start: logs.length > 0 ? Math.min(...logs.map(log => new Date(log.timestamp).getTime())) : null,
      end: logs.length > 0 ? Math.max(...logs.map(log => new Date(log.timestamp).getTime())) : null
    }
  };
}

function calculateRiskScore(events: SecurityEvent[]): number {
  let score = 0;
  const weights = {
    critical: 0.8,
    high: 0.6,
    medium: 0.3,
    low: 0.1
  };
  
  events.forEach(event => {
    const weight = weights[event.severity as keyof typeof weights] || 0.1;
    score += weight;
  });
  
  return Math.min(1, score / events.length);
}
