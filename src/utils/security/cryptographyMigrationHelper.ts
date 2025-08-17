/**
 * ASSISTENTE DE MIGRAÇÃO - Criptografia Falsa para AES Real
 * 
 * Detecta e migra automaticamente dados inseguros no localStorage
 */

import { secureTokenStorage } from '@/utils/secureTokenStorage';
import { logger } from '@/utils/logger';

export interface MigrationResult {
  success: boolean;
  migratedKeys: string[];
  failedKeys: string[];
  totalFound: number;
  recommendations: string[];
}

/**
 * Executa migração completa de todos os dados inseguros
 */
export const runCompleteCryptographyMigration = async (userId: string): Promise<MigrationResult> => {
  if (!userId) {
    throw new Error('UserId necessário para migração');
  }

  logger.info("🔄 Iniciando migração completa de criptografia", {
    component: 'CRYPTOGRAPHY_MIGRATION',
    userId: userId.substring(0, 8) + '***',
    action: 'FULL_MIGRATION_START'
  });

  const insecureKeys = secureTokenStorage.detectInsecureData();
  const migratedKeys: string[] = [];
  const failedKeys: string[] = [];
  const recommendations: string[] = [];

  // Migrar cada chave encontrada
  for (const key of insecureKeys) {
    try {
      console.log(`🔄 Migrando chave insegura: ${key}`);
      
      const success = await secureTokenStorage.migrateFromFakeEncryption(key, userId);
      
      if (success) {
        migratedKeys.push(key);
        logger.info(`✅ Chave migrada com sucesso: ${key}`, {
          component: 'CRYPTOGRAPHY_MIGRATION',
          key,
          status: 'MIGRATED'
        });
      } else {
        failedKeys.push(key);
        logger.warn(`❌ Falha na migração: ${key}`, {
          component: 'CRYPTOGRAPHY_MIGRATION',
          key,
          status: 'FAILED'
        });
      }
    } catch (error) {
      failedKeys.push(key);
      logger.error(`❌ Erro na migração: ${key}`, {
        component: 'CRYPTOGRAPHY_MIGRATION',
        key,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  // Gerar recomendações
  if (failedKeys.length > 0) {
    recommendations.push(`Executar migração manual para ${failedKeys.length} chaves que falharam`);
    recommendations.push('Verificar se os dados ainda são válidos e necessários');
  }

  if (migratedKeys.length > 0) {
    recommendations.push('Verificar funcionalidade após migração');
    recommendations.push('Considerar rotação de tokens migrados por segurança');
  }

  const result: MigrationResult = {
    success: failedKeys.length === 0,
    migratedKeys,
    failedKeys,
    totalFound: insecureKeys.length,
    recommendations
  };

  logger.info("✅ Migração de criptografia concluída", {
    component: 'CRYPTOGRAPHY_MIGRATION',
    result,
    security: 'MIGRATION_COMPLETED'
  });

  // Log detalhado no console
  console.log(`
🔒 RELATÓRIO DE MIGRAÇÃO DE CRIPTOGRAFIA 🔒

📊 ESTATÍSTICAS:
  • Total de dados inseguros encontrados: ${insecureKeys.length}
  • ✅ Migrados com sucesso: ${migratedKeys.length}
  • ❌ Falharam na migração: ${failedKeys.length}

${migratedKeys.length > 0 ? `
✅ CHAVES MIGRADAS PARA AES-256-GCM:
${migratedKeys.map(k => `  • ${k}`).join('\n')}
` : ''}

${failedKeys.length > 0 ? `
❌ CHAVES QUE FALHARAM:
${failedKeys.map(k => `  • ${k}`).join('\n')}

⚠️  AÇÃO NECESSÁRIA: Executar migração manual ou remover dados inválidos.
` : ''}

${recommendations.length > 0 ? `
📋 RECOMENDAÇÕES:
${recommendations.map(r => `  • ${r}`).join('\n')}
` : ''}

🔐 STATUS: ${result.success ? 'MIGRAÇÃO BEM-SUCEDIDA' : 'MIGRAÇÃO PARCIAL - AÇÃO NECESSÁRIA'}
  `);

  return result;
};

/**
 * Força limpeza de todos os dados inseguros (sem migração)
 */
export const cleanupInsecureData = (): { removed: string[], kept: string[] } => {
  const insecureKeys = secureTokenStorage.detectInsecureData();
  const removed: string[] = [];
  const kept: string[] = [];

  for (const key of insecureKeys) {
    try {
      // Confirmar que é realmente inseguro antes de remover
      const value = localStorage.getItem(key);
      if (value && value.match(/^[A-Za-z0-9+/]+=*$/) && value.includes('://') === false) {
        localStorage.removeItem(key);
        removed.push(key);
        logger.info(`🗑️  Dados inseguros removidos: ${key}`, {
          component: 'CRYPTOGRAPHY_MIGRATION',
          action: 'CLEANUP_INSECURE_DATA'
        });
      } else {
        kept.push(key);
      }
    } catch (error) {
      kept.push(key);
      logger.warn(`Não foi possível limpar: ${key}`, {
        component: 'CRYPTOGRAPHY_MIGRATION',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  console.log(`
🧹 LIMPEZA DE DADOS INSEGUROS 🧹

✅ Removidos: ${removed.length} itens
⚠️  Mantidos: ${kept.length} itens (verificação necessária)

${removed.length > 0 ? `
🗑️  ITENS REMOVIDOS:
${removed.map(k => `  • ${k}`).join('\n')}
` : ''}

${kept.length > 0 ? `
⚠️  ITENS MANTIDOS (verificar manualmente):
${kept.map(k => `  • ${k}`).join('\n')}
` : ''}
  `);

  return { removed, kept };
};

/**
 * Executar auditoria completa de segurança de dados
 */
export const auditDataSecurity = (): {
  secure: string[],
  insecure: string[],
  unknown: string[],
  recommendations: string[]
} => {
  const secure: string[] = [];
  const insecure: string[] = [];
  const unknown: string[] = [];
  const recommendations: string[] = [];

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;

      const value = localStorage.getItem(key);
      if (!value) continue;

      // Analisar formato dos dados
      if (value.startsWith('sb-')) {
        // Dados do Supabase - geralmente seguros
        secure.push(key);
      } else if (value.match(/^[A-Za-z0-9+/]+=*$/) && value.length < 1000) {
        // Possível base64 simples (inseguro)
        insecure.push(key);
      } else if (value.length > 1000 && value.match(/^[A-Za-z0-9+/]+=*$/)) {
        // Base64 longo - pode ser AES criptografado (seguro)
        secure.push(key);
      } else {
        // Formato não identificado
        unknown.push(key);
      }
    }

    // Gerar recomendações
    if (insecure.length > 0) {
      recommendations.push(`🚨 ${insecure.length} itens com criptografia falsa detectados`);
      recommendations.push('Execute migração imediata para AES-256-GCM');
    }

    if (unknown.length > 0) {
      recommendations.push(`🔍 ${unknown.length} itens com formato não identificado`);
      recommendations.push('Revisar manualmente se contêm dados sensíveis');
    }

    if (secure.length > 0) {
      recommendations.push(`✅ ${secure.length} itens parecem estar seguros`);
    }

    console.log(`
🔍 AUDITORIA DE SEGURANÇA DE DADOS 🔍

📊 RESUMO:
  • ✅ Seguros: ${secure.length}
  • 🚨 Inseguros: ${insecure.length}
  • ❓ Desconhecidos: ${unknown.length}

${insecure.length > 0 ? `
🚨 DADOS INSEGUROS (criptografia falsa):
${insecure.map(k => `  • ${k}`).join('\n')}
` : ''}

${unknown.length > 0 ? `
❓ DADOS FORMATO DESCONHECIDO:
${unknown.map(k => `  • ${k}`).join('\n')}
` : ''}

📋 RECOMENDAÇÕES:
${recommendations.map(r => `  • ${r}`).join('\n')}
    `);

  } catch (error) {
    logger.error("Erro na auditoria de segurança", {
      component: 'CRYPTOGRAPHY_MIGRATION',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }

  return { secure, insecure, unknown, recommendations };
};