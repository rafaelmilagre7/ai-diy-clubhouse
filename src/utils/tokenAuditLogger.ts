
/**
 * Sistema de auditoria de tokens de convite
 * Rastreia integridade do token em TODA a jornada
 */

import { logger } from '@/utils/logger';

export interface TokenAuditStep {
  step: string;
  token: string;
  tokenLength: number;
  source: string;
  timestamp: string;
  context?: any;
}

class TokenAuditLogger {
  private auditTrail: TokenAuditStep[] = [];
  private expectedToken: string | null = null;

  /**
   * Define o token esperado (do banco de dados)
   */
  setExpectedToken(token: string): void {
    this.expectedToken = token;
    this.logStep('EXPECTED_TOKEN_SET', token, 'database');
  }

  /**
   * Registra uma etapa do fluxo do token
   */
  logStep(step: string, token: string, source: string, context?: any): void {
    const auditStep: TokenAuditStep = {
      step,
      token,
      tokenLength: token.length,
      source,
      timestamp: new Date().toISOString(),
      context
    };

    this.auditTrail.push(auditStep);

    // Log imediato para debug
    logger.info(`[TOKEN-AUDIT] ${step}:`, {
      step,
      token: token.substring(0, 8) + '***',
      tokenLength: token.length,
      source,
      isExpected: this.expectedToken === token,
      expectedLength: this.expectedToken?.length || 'unknown'
    });

    // Verificar integridade se temos token esperado
    if (this.expectedToken && token !== this.expectedToken) {
      this.logCorruption(step, token, source);
    }
  }

  /**
   * Registra corrupção detectada
   */
  private logCorruption(step: string, corruptedToken: string, source: string): void {
    logger.error(`[TOKEN-AUDIT] 🚨 CORRUPÇÃO DETECTADA em ${step}:`, {
      step,
      expected: this.expectedToken?.substring(0, 8) + '***',
      expectedLength: this.expectedToken?.length,
      received: corruptedToken.substring(0, 8) + '***',
      receivedLength: corruptedToken.length,
      source,
      difference: this.analyzeTokenDifference(this.expectedToken!, corruptedToken)
    });
  }

  /**
   * Analisa diferenças entre tokens
   */
  private analyzeTokenDifference(expected: string, received: string): any {
    return {
      lengthDiff: expected.length - received.length,
      startsWithSame: expected.startsWith(received) || received.startsWith(expected),
      commonPrefix: this.getCommonPrefix(expected, received),
      isPrefixTruncation: expected.startsWith(received),
      isSuffixTruncation: expected.endsWith(received)
    };
  }

  /**
   * Obtém prefixo comum entre dois tokens
   */
  private getCommonPrefix(str1: string, str2: string): string {
    let i = 0;
    while (i < str1.length && i < str2.length && str1[i] === str2[i]) {
      i++;
    }
    return str1.substring(0, i);
  }

  /**
   * Gera relatório completo da auditoria
   */
  generateAuditReport(): any {
    return {
      expectedToken: this.expectedToken?.substring(0, 8) + '***',
      expectedTokenLength: this.expectedToken?.length,
      totalSteps: this.auditTrail.length,
      auditTrail: this.auditTrail.map(step => ({
        ...step,
        token: step.token.substring(0, 8) + '***',
        isCorrupted: this.expectedToken ? step.token !== this.expectedToken : false
      })),
      corruptionDetected: this.auditTrail.some(step => 
        this.expectedToken && step.token !== this.expectedToken
      ),
      firstCorruptionStep: this.auditTrail.find(step => 
        this.expectedToken && step.token !== this.expectedToken
      )?.step || null
    };
  }

  /**
   * Limpa auditoria
   */
  reset(): void {
    this.auditTrail = [];
    this.expectedToken = null;
  }

  /**
   * Gera log para suporte técnico
   */
  generateSupportLog(): string {
    const report = this.generateAuditReport();
    return JSON.stringify(report, null, 2);
  }
}

export const tokenAudit = new TokenAuditLogger();
