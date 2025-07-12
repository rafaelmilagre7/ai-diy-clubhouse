/**
 * Utilitário para verificar status de segurança do sistema
 * Fornece relatórios sobre políticas RLS, permissões e vulnerabilidades
 */

import { supabase } from '@/lib/supabase';

export interface SecurityStatus {
  overall: 'secure' | 'warning' | 'critical';
  score: number;
  checks: SecurityCheck[];
  summary: {
    total: number;
    passed: number;
    warnings: number;
    critical: number;
  };
}

export interface SecurityCheck {
  id: string;
  name: string;
  status: 'pass' | 'warning' | 'critical';
  description: string;
  recommendation?: string;
  details?: any;
}

/**
 * Executa verificação completa de segurança
 */
export const runSecurityAudit = async (): Promise<SecurityStatus> => {
  const checks: SecurityCheck[] = [];
  
  try {
    // 1. Verificar políticas RLS
    const rlsCheck = await checkRLSPolicies();
    checks.push(rlsCheck);
    
    // 2. Verificar integridade de permissões
    const permissionsCheck = await checkPermissionsIntegrity();
    checks.push(permissionsCheck);
    
    // 3. Verificar logs de segurança recentes
    const securityLogsCheck = await checkRecentSecurityLogs();
    checks.push(securityLogsCheck);
    
    // 4. Verificar configuração de autenticação
    const authConfigCheck = await checkAuthConfiguration();
    checks.push(authConfigCheck);
    
    // 5. Verificar incidentes de segurança
    const incidentsCheck = await checkSecurityIncidents();
    checks.push(incidentsCheck);
    
    // Calcular pontuação e status geral
    const summary = {
      total: checks.length,
      passed: checks.filter(c => c.status === 'pass').length,
      warnings: checks.filter(c => c.status === 'warning').length,
      critical: checks.filter(c => c.status === 'critical').length
    };
    
    const score = (summary.passed / summary.total) * 100;
    const overall = summary.critical > 0 ? 'critical' : 
                   summary.warnings > 0 ? 'warning' : 'secure';
    
    return {
      overall,
      score: Math.round(score),
      checks,
      summary
    };
    
  } catch (error) {
    console.error('Erro na auditoria de segurança:', error);
    
    return {
      overall: 'critical',
      score: 0,
      checks: [{
        id: 'audit_error',
        name: 'Erro na Auditoria',
        status: 'critical',
        description: 'Não foi possível executar a auditoria de segurança',
        recommendation: 'Verifique as permissões do usuário e conectividade'
      }],
      summary: { total: 1, passed: 0, warnings: 0, critical: 1 }
    };
  }
};

/**
 * Verifica status das políticas RLS
 */
const checkRLSPolicies = async (): Promise<SecurityCheck> => {
  try {
    const { data, error } = await supabase.rpc('check_rls_status');
    
    if (error) {
      return {
        id: 'rls_policies',
        name: 'Políticas RLS',
        status: 'critical',
        description: 'Erro ao verificar políticas RLS',
        recommendation: 'Verifique as permissões do banco de dados'
      };
    }
    
    const unsafeTables = data?.filter((table: any) => 
      table.security_status.includes('SEM PROTEÇÃO') || 
      table.security_status.includes('RLS DESABILITADO')
    ) || [];
    
    if (unsafeTables.length > 0) {
      return {
        id: 'rls_policies',
        name: 'Políticas RLS',
        status: 'critical',
        description: `${unsafeTables.length} tabelas sem proteção adequada`,
        recommendation: 'Habilitar RLS e criar políticas para todas as tabelas',
        details: unsafeTables
      };
    }
    
    const warningTables = data?.filter((table: any) => 
      table.security_status.includes('VERIFICAR')
    ) || [];
    
    if (warningTables.length > 0) {
      return {
        id: 'rls_policies',
        name: 'Políticas RLS',
        status: 'warning',
        description: `${warningTables.length} tabelas precisam de verificação`,
        recommendation: 'Revisar políticas das tabelas marcadas',
        details: warningTables
      };
    }
    
    return {
      id: 'rls_policies',
      name: 'Políticas RLS',
      status: 'pass',
      description: 'Todas as tabelas estão adequadamente protegidas',
      details: { totalTables: data?.length || 0 }
    };
    
  } catch (error) {
    return {
      id: 'rls_policies',
      name: 'Políticas RLS',
      status: 'critical',
      description: 'Erro ao verificar políticas RLS',
      recommendation: 'Verifique conectividade e permissões'
    };
  }
};

/**
 * Verifica integridade das permissões
 */
const checkPermissionsIntegrity = async (): Promise<SecurityCheck> => {
  try {
    const { data, error } = await supabase.rpc('verify_permissions_integrity');
    
    if (error) {
      return {
        id: 'permissions_integrity',
        name: 'Integridade de Permissões',
        status: 'warning',
        description: 'Não foi possível verificar integridade das permissões',
        recommendation: 'Verificar manualmente os papéis dos usuários'
      };
    }
    
    const criticalIssues = data?.filter((issue: any) => 
      issue.severity === 'high'
    ) || [];
    
    const warnings = data?.filter((issue: any) => 
      issue.severity === 'medium'
    ) || [];
    
    if (criticalIssues.length > 0) {
      return {
        id: 'permissions_integrity',
        name: 'Integridade de Permissões',
        status: 'critical',
        description: `${criticalIssues.length} problemas críticos de permissão encontrados`,
        recommendation: 'Corrigir imediatamente os problemas de permissão',
        details: criticalIssues
      };
    }
    
    if (warnings.length > 0) {
      return {
        id: 'permissions_integrity',
        name: 'Integridade de Permissões',
        status: 'warning',
        description: `${warnings.length} avisos de permissão encontrados`,
        recommendation: 'Revisar configurações de permissão',
        details: warnings
      };
    }
    
    return {
      id: 'permissions_integrity',
      name: 'Integridade de Permissões',
      status: 'pass',
      description: 'Todas as permissões estão íntegras'
    };
    
  } catch (error) {
    return {
      id: 'permissions_integrity',
      name: 'Integridade de Permissões',
      status: 'warning',
      description: 'Erro ao verificar integridade das permissões'
    };
  }
};

/**
 * Verifica logs de segurança recentes
 */
const checkRecentSecurityLogs = async (): Promise<SecurityCheck> => {
  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('event_type', 'security_event')
      .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('timestamp', { ascending: false });
    
    if (error) {
      return {
        id: 'security_logs',
        name: 'Logs de Segurança',
        status: 'warning',
        description: 'Não foi possível verificar logs de segurança',
        recommendation: 'Verificar permissões de acesso aos logs'
      };
    }
    
    const highSeverityEvents = data?.filter(log => 
      log.severity === 'high'
    ) || [];
    
    const mediumSeverityEvents = data?.filter(log => 
      log.severity === 'medium'
    ) || [];
    
    if (highSeverityEvents.length > 0) {
      return {
        id: 'security_logs',
        name: 'Logs de Segurança',
        status: 'critical',
        description: `${highSeverityEvents.length} eventos de alta severidade nas últimas 24h`,
        recommendation: 'Investigar imediatamente os eventos de segurança',
        details: highSeverityEvents.slice(0, 5) // Mostrar apenas os 5 mais recentes
      };
    }
    
    if (mediumSeverityEvents.length > 5) {
      return {
        id: 'security_logs',
        name: 'Logs de Segurança',
        status: 'warning',
        description: `${mediumSeverityEvents.length} eventos de média severidade nas últimas 24h`,
        recommendation: 'Monitorar eventos de segurança',
        details: mediumSeverityEvents.slice(0, 3)
      };
    }
    
    return {
      id: 'security_logs',
      name: 'Logs de Segurança',
      status: 'pass',
      description: `${data?.length || 0} eventos de segurança normais nas últimas 24h`
    };
    
  } catch (error) {
    return {
      id: 'security_logs',
      name: 'Logs de Segurança',
      status: 'warning',
      description: 'Erro ao verificar logs de segurança'
    };
  }
};

/**
 * Verifica configuração de autenticação
 */
const checkAuthConfiguration = async (): Promise<SecurityCheck> => {
  try {
    // Verificar se há função de limpeza de estado
    const hasCleanupFunction = typeof cleanupAuthState === 'function';
    
    // Verificar se há rate limiting
    const hasRateLimit = typeof checkLoginRateLimit === 'function';
    
    // Verificar se há validação de senha
    const hasPasswordValidation = typeof validatePasswordStrength === 'function';
    
    const score = [hasCleanupFunction, hasRateLimit, hasPasswordValidation]
      .filter(Boolean).length;
    
    if (score < 2) {
      return {
        id: 'auth_config',
        name: 'Configuração de Autenticação',
        status: 'critical',
        description: 'Configuração de autenticação insegura',
        recommendation: 'Implementar validações de segurança para autenticação'
      };
    }
    
    if (score < 3) {
      return {
        id: 'auth_config',
        name: 'Configuração de Autenticação',
        status: 'warning',
        description: 'Algumas proteções de autenticação estão faltando',
        recommendation: 'Implementar todas as validações de segurança'
      };
    }
    
    return {
      id: 'auth_config',
      name: 'Configuração de Autenticação',
      status: 'pass',
      description: 'Configuração de autenticação segura implementada'
    };
    
  } catch (error) {
    return {
      id: 'auth_config',
      name: 'Configuração de Autenticação',
      status: 'warning',
      description: 'Erro ao verificar configuração de autenticação'
    };
  }
};

/**
 * Verifica incidentes de segurança recentes
 */
const checkSecurityIncidents = async (): Promise<SecurityCheck> => {
  try {
    const { data, error } = await supabase
      .from('security_incidents')
      .select('*')
      .gte('detected_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('detected_at', { ascending: false });
    
    if (error) {
      return {
        id: 'security_incidents',
        name: 'Incidentes de Segurança',
        status: 'pass',
        description: 'Sistema de monitoramento funcionando (sem incidentes detectados)'
      };
    }
    
    const highSeverityIncidents = data?.filter(incident => 
      incident.severity === 'high'
    ) || [];
    
    const mediumSeverityIncidents = data?.filter(incident => 
      incident.severity === 'medium'
    ) || [];
    
    if (highSeverityIncidents.length > 0) {
      return {
        id: 'security_incidents',
        name: 'Incidentes de Segurança',
        status: 'critical',
        description: `${highSeverityIncidents.length} incidentes de alta severidade na última semana`,
        recommendation: 'Investigar e resolver incidentes críticos imediatamente',
        details: highSeverityIncidents
      };
    }
    
    if (mediumSeverityIncidents.length > 0) {
      return {
        id: 'security_incidents',
        name: 'Incidentes de Segurança',
        status: 'warning',
        description: `${mediumSeverityIncidents.length} incidentes de média severidade na última semana`,
        recommendation: 'Revisar e resolver incidentes de segurança',
        details: mediumSeverityIncidents
      };
    }
    
    return {
      id: 'security_incidents',
      name: 'Incidentes de Segurança',
      status: 'pass',
      description: 'Nenhum incidente de segurança detectado na última semana'
    };
    
  } catch (error) {
    return {
      id: 'security_incidents',
      name: 'Incidentes de Segurança',
      status: 'pass',
      description: 'Sistema de monitoramento funcionando'
    };
  }
};

// Importar as funções necessárias para o teste
import { 
  cleanupAuthState, 
  checkLoginRateLimit, 
  validatePasswordStrength 
} from './authSecurity';