
import { supabase } from '@/lib/supabase';

export interface SecurityContext {
  userId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
  action: string;
  resource?: string;
}

export interface SecurityAnalysis {
  riskScore: number;
  anomalies: string[];
  recommendations: string[];
  behaviorPattern: 'normal' | 'suspicious' | 'critical';
  confidence: number;
}

class AdvancedSecurityUtils {
  private static instance: AdvancedSecurityUtils;
  private activityBuffer: SecurityContext[] = [];
  private readonly bufferSize = 100;
  private readonly analysisInterval = 60000; // 1 minuto

  private constructor() {
    this.startPeriodicAnalysis();
  }

  static getInstance(): AdvancedSecurityUtils {
    if (!AdvancedSecurityUtils.instance) {
      AdvancedSecurityUtils.instance = new AdvancedSecurityUtils();
    }
    return AdvancedSecurityUtils.instance;
  }

  // Registrar atividade de segurança
  async logSecurityActivity(context: SecurityContext): Promise<void> {
    try {
      // Adicionar ao buffer local
      this.activityBuffer.push(context);
      
      // Manter apenas os últimos registros
      if (this.activityBuffer.length > this.bufferSize) {
        this.activityBuffer = this.activityBuffer.slice(-this.bufferSize);
      }

      // Enviar para o banco de dados
      await this.persistSecurityLog(context);

      // Análise em tempo real para ações críticas
      if (this.isCriticalAction(context.action)) {
        await this.performRealTimeAnalysis(context);
      }

    } catch (error) {
      console.error('Erro ao registrar atividade de segurança:', error);
    }
  }

  // Análise comportamental de usuário
  async analyzeUserBehavior(userId: string, timeframe: number = 24): Promise<SecurityAnalysis> {
    try {
      const since = new Date(Date.now() - timeframe * 60 * 60 * 1000).toISOString();

      const { data: logs, error } = await supabase
        .from('security_logs')
        .select('*')
        .eq('user_id', userId)
        .gte('timestamp', since)
        .order('timestamp', { ascending: false });

      if (error) throw error;

      return this.performBehaviorAnalysis(logs || []);
    } catch (error) {
      console.error('Erro na análise comportamental:', error);
      return this.getDefaultAnalysis();
    }
  }

  // Detectar padrões de ataques conhecidos
  async detectAttackPatterns(logs: any[]): Promise<string[]> {
    const patterns: string[] = [];

    // Padrão 1: Força bruta
    const failedLogins = logs.filter(log => 
      log.action.includes('login_failure') && 
      this.isRecentActivity(log.timestamp, 60)
    );
    
    if (failedLogins.length > 5) {
      patterns.push('brute_force_attack');
    }

    // Padrão 2: Escalação de privilégios
    const privilegeChanges = logs.filter(log => 
      log.action.includes('role_change') || log.action.includes('permission_change')
    );
    
    if (privilegeChanges.length > 2) {
      patterns.push('privilege_escalation');
    }

    // Padrão 3: Acesso a dados sensíveis
    const sensitiveAccess = logs.filter(log => 
      log.resource_type === 'user_data' || 
      log.resource_type === 'admin_data'
    );
    
    if (sensitiveAccess.length > 20) {
      patterns.push('data_harvesting');
    }

    // Padrão 4: Atividade fora do horário
    const offHoursActivity = logs.filter(log => {
      const hour = new Date(log.timestamp).getHours();
      return hour < 6 || hour > 22;
    });
    
    if (offHoursActivity.length > logs.length * 0.5) {
      patterns.push('off_hours_activity');
    }

    return patterns;
  }

  // Análise de correlação de IPs
  async analyzeIPCorrelation(ipAddress: string): Promise<{
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    associatedUsers: number;
    recentActivity: number;
    geolocation?: any;
  }> {
    try {
      const { data: ipLogs, error } = await supabase
        .from('security_logs')
        .select('user_id, timestamp')
        .eq('ip_address', ipAddress)
        .gte('timestamp', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      if (error) throw error;

      const uniqueUsers = new Set(ipLogs?.map(log => log.user_id).filter(Boolean)).size;
      const recentActivity = ipLogs?.filter(log => 
        this.isRecentActivity(log.timestamp, 24 * 60)
      ).length || 0;

      let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
      
      if (uniqueUsers > 10) riskLevel = 'critical';
      else if (uniqueUsers > 5) riskLevel = 'high';
      else if (uniqueUsers > 2) riskLevel = 'medium';

      return {
        riskLevel,
        associatedUsers: uniqueUsers,
        recentActivity
      };
    } catch (error) {
      console.error('Erro na análise de IP:', error);
      return {
        riskLevel: 'low',
        associatedUsers: 0,
        recentActivity: 0
      };
    }
  }

  // Gerar relatório de segurança
  async generateSecurityReport(timeframe: number = 24): Promise<{
    summary: {
      totalEvents: number;
      criticalEvents: number;
      uniqueUsers: number;
      uniqueIPs: number;
    };
    topRisks: Array<{
      type: string;
      count: number;
      severity: string;
    }>;
    recommendations: string[];
    trends: any[];
  }> {
    try {
      const since = new Date(Date.now() - timeframe * 60 * 60 * 1000).toISOString();

      const { data: logs, error } = await supabase
        .from('security_logs')
        .select('*')
        .gte('timestamp', since);

      if (error) throw error;

      const summary = {
        totalEvents: logs?.length || 0,
        criticalEvents: logs?.filter(log => log.severity === 'critical').length || 0,
        uniqueUsers: new Set(logs?.map(log => log.user_id).filter(Boolean)).size,
        uniqueIPs: new Set(logs?.map(log => log.ip_address).filter(Boolean)).size
      };

      const eventTypes = logs?.reduce((acc, log) => {
        acc[log.event_type] = (acc[log.event_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const topRisks = Object.entries(eventTypes)
        .map(([type, count]) => ({
          type,
          count: Number(count),
          severity: this.assessEventSeverity(type, Number(count))
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      const recommendations = this.generateRecommendations(logs || [], topRisks);

      return {
        summary,
        topRisks,
        recommendations,
        trends: this.analyzeSecurityTrends(logs || [])
      };
    } catch (error) {
      console.error('Erro ao gerar relatório de segurança:', error);
      return {
        summary: { totalEvents: 0, criticalEvents: 0, uniqueUsers: 0, uniqueIPs: 0 },
        topRisks: [],
        recommendations: [],
        trends: []
      };
    }
  }

  // Métodos privados
  private async persistSecurityLog(context: SecurityContext): Promise<void> {
    try {
      await supabase.functions.invoke('security-log-processor', {
        body: {
          logs: [{
            userId: context.userId,
            eventType: this.determineEventType(context.action),
            severity: this.determineSeverity(context.action),
            action: context.action,
            resourceType: context.resource,
            ipAddress: context.ipAddress,
            userAgent: context.userAgent,
            details: {
              sessionId: context.sessionId,
              timestamp: context.timestamp
            }
          }]
        }
      });
    } catch (error) {
      console.error('Erro ao persistir log de segurança:', error);
    }
  }

  private async performRealTimeAnalysis(context: SecurityContext): Promise<void> {
    const recentActivity = this.activityBuffer.filter(activity =>
      activity.userId === context.userId &&
      this.isRecentActivity(activity.timestamp, 10) // Últimos 10 minutos
    );

    if (recentActivity.length > 20) {
      await this.createSecurityIncident({
        title: 'Atividade Suspeita Detectada',
        description: `Usuário ${context.userId} com ${recentActivity.length} ações nos últimos 10 minutos`,
        severity: 'high',
        userId: context.userId,
        context
      });
    }
  }

  private performBehaviorAnalysis(logs: any[]): SecurityAnalysis {
    if (logs.length === 0) {
      return this.getDefaultAnalysis();
    }

    let riskScore = 0;
    const anomalies: string[] = [];
    const recommendations: string[] = [];

    // Análise de padrões temporais
    const hourlyActivity = this.analyzeTemporalPatterns(logs);
    if (hourlyActivity.offHoursRatio > 0.3) {
      riskScore += 0.3;
      anomalies.push('high_off_hours_activity');
      recommendations.push('Revisar atividades fora do horário comercial');
    }

    // Análise de IPs
    const uniqueIPs = new Set(logs.map(log => log.ip_address).filter(Boolean)).size;
    if (uniqueIPs > 5) {
      riskScore += 0.2;
      anomalies.push('multiple_ip_addresses');
      recommendations.push('Verificar uso de múltiplos IPs');
    }

    // Análise de padrões de acesso
    const accessPatterns = this.analyzeAccessPatterns(logs);
    if (accessPatterns.suspiciousCount > 5) {
      riskScore += 0.4;
      anomalies.push('suspicious_access_patterns');
      recommendations.push('Investigar padrões de acesso anômalos');
    }

    const behaviorPattern = riskScore > 0.7 ? 'critical' : riskScore > 0.4 ? 'suspicious' : 'normal';
    const confidence = Math.min(1, logs.length / 100); // Confiança baseada na quantidade de dados

    return {
      riskScore: Math.min(1, riskScore),
      anomalies,
      recommendations,
      behaviorPattern,
      confidence
    };
  }

  private analyzeTemporalPatterns(logs: any[]): { offHoursRatio: number } {
    const offHoursLogs = logs.filter(log => {
      const hour = new Date(log.timestamp).getHours();
      return hour < 8 || hour > 18;
    });

    return {
      offHoursRatio: logs.length > 0 ? offHoursLogs.length / logs.length : 0
    };
  }

  private analyzeAccessPatterns(logs: any[]): { suspiciousCount: number } {
    const suspiciousActions = logs.filter(log =>
      log.action.includes('admin') ||
      log.action.includes('delete') ||
      log.action.includes('export') ||
      log.severity === 'high' ||
      log.severity === 'critical'
    );

    return {
      suspiciousCount: suspiciousActions.length
    };
  }

  private async createSecurityIncident(incident: {
    title: string;
    description: string;
    severity: string;
    userId?: string;
    context: SecurityContext;
  }): Promise<void> {
    try {
      await supabase
        .from('security_incidents')
        .insert({
          title: incident.title,
          description: incident.description,
          severity: incident.severity,
          metadata: {
            auto_generated: true,
            user_id: incident.userId,
            context: incident.context
          }
        });
    } catch (error) {
      console.error('Erro ao criar incidente de segurança:', error);
    }
  }

  private startPeriodicAnalysis(): void {
    setInterval(async () => {
      if (this.activityBuffer.length > 10) {
        await this.performBatchAnalysis();
      }
    }, this.analysisInterval);
  }

  private async performBatchAnalysis(): Promise<void> {
    try {
      const patterns = await this.detectAttackPatterns(this.activityBuffer);
      
      if (patterns.length > 0) {
        await this.createSecurityIncident({
          title: 'Padrões de Ataque Detectados',
          description: `Padrões detectados: ${patterns.join(', ')}`,
          severity: 'high',
          context: this.activityBuffer[this.activityBuffer.length - 1]
        });
      }
    } catch (error) {
      console.error('Erro na análise em lote:', error);
    }
  }

  private isCriticalAction(action: string): boolean {
    const criticalActions = [
      'admin_login',
      'role_change',
      'permission_change',
      'user_delete',
      'data_export',
      'system_config_change'
    ];
    
    return criticalActions.some(critical => action.includes(critical));
  }

  private isRecentActivity(timestamp: string, minutes: number): boolean {
    const activityTime = new Date(timestamp).getTime();
    const cutoff = Date.now() - (minutes * 60 * 1000);
    return activityTime > cutoff;
  }

  private determineEventType(action: string): string {
    if (action.includes('login') || action.includes('logout')) return 'auth';
    if (action.includes('view') || action.includes('access')) return 'access';
    if (action.includes('create') || action.includes('update') || action.includes('delete')) return 'data';
    if (action.includes('admin') || action.includes('system')) return 'system';
    return 'security';
  }

  private determineSeverity(action: string): string {
    if (action.includes('delete') || action.includes('admin')) return 'high';
    if (action.includes('create') || action.includes('update')) return 'medium';
    return 'low';
  }

  private assessEventSeverity(eventType: string, count: number): string {
    if (eventType === 'auth' && count > 100) return 'high';
    if (eventType === 'system' && count > 10) return 'critical';
    if (count > 50) return 'medium';
    return 'low';
  }

  private generateRecommendations(logs: any[], topRisks: any[]): string[] {
    const recommendations: string[] = [];

    if (topRisks.some(risk => risk.type === 'auth' && risk.count > 50)) {
      recommendations.push('Implementar autenticação multifator');
    }

    if (topRisks.some(risk => risk.severity === 'critical')) {
      recommendations.push('Revisar imediatamente eventos críticos');
    }

    const uniqueIPs = new Set(logs.map(log => log.ip_address).filter(Boolean)).size;
    if (uniqueIPs > logs.length * 0.1) {
      recommendations.push('Configurar geofencing para IPs suspeitos');
    }

    return recommendations;
  }

  private analyzeSecurityTrends(logs: any[]): any[] {
    const dailyActivity = logs.reduce((acc, log) => {
      const day = new Date(log.timestamp).toDateString();
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(dailyActivity).map(([date, count]) => ({
      date,
      count,
      trend: 'stable' // Lógica mais complexa pode ser adicionada aqui
    }));
  }

  private getDefaultAnalysis(): SecurityAnalysis {
    return {
      riskScore: 0,
      anomalies: [],
      recommendations: [],
      behaviorPattern: 'normal',
      confidence: 0
    };
  }
}

export const advancedSecurityUtils = AdvancedSecurityUtils.getInstance();

// Funções de conveniência para uso direto
export const logSecurityActivity = (context: SecurityContext) => 
  advancedSecurityUtils.logSecurityActivity(context);

export const analyzeUserBehavior = (userId: string, timeframe?: number) =>
  advancedSecurityUtils.analyzeUserBehavior(userId, timeframe);

export const generateSecurityReport = (timeframe?: number) =>
  advancedSecurityUtils.generateSecurityReport(timeframe);

export const analyzeIPCorrelation = (ipAddress: string) =>
  advancedSecurityUtils.analyzeIPCorrelation(ipAddress);
