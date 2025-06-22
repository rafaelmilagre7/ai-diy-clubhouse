
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLogging } from '@/hooks/useLogging';

interface AuditResult {
  category: string;
  status: 'success' | 'warning' | 'error';
  message: string;
  details?: any;
  recommendation?: string;
}

interface InviteAuditData {
  overview: {
    totalInvites: number;
    activeInvites: number;
    usedInvites: number;
    expiredInvites: number;
  };
  dataIntegrity: AuditResult[];
  performance: AuditResult[];
  security: AuditResult[];
  integrations: AuditResult[];
  recommendations: string[];
}

interface InviteRow {
  id: string;
  email: string;
  expires_at: string;
  used_at: string | null;
  created_at: string;
  role_id: string;
  token: string;
  send_attempts: number;
  last_sent_at: string | null;
}

interface RoleRow {
  id: string;
  name: string;
}

interface DeliveryRow {
  id: string;
  invite_id: string;
  channel: string;
  status: string;
  created_at: string;
}

export const useInviteAudit = () => {
  const { log, logWarning } = useLogging();

  return useQuery({
    queryKey: ['invite-audit'],
    queryFn: async (): Promise<InviteAuditData> => {
      try {
        log('Iniciando auditoria completa do sistema de convites');

        // 1. Buscar dados básicos de convites
        const { data: invites, error: invitesError } = await supabase
          .from('invites')
          .select('*');

        if (invitesError) {
          throw new Error(`Erro ao buscar convites: ${invitesError.message}`);
        }

        // 2. Buscar dados de roles
        const { data: roles, error: rolesError } = await supabase
          .from('user_roles')
          .select('id, name');

        if (rolesError) {
          throw new Error(`Erro ao buscar roles: ${rolesError.message}`);
        }

        // 3. Buscar dados de deliveries
        const { data: deliveries, error: deliveriesError } = await supabase
          .from('invite_deliveries')
          .select('*');

        if (deliveriesError) {
          throw new Error(`Erro ao buscar deliveries: ${deliveriesError.message}`);
        }

        // Garantir que os dados são arrays tipados
        const typedInvites = (invites || []) as InviteRow[];
        const typedRoles = (roles || []) as RoleRow[];
        const typedDeliveries = (deliveries || []) as DeliveryRow[];

        // Calcular overview
        const now = new Date();
        const overview = {
          totalInvites: typedInvites.length,
          activeInvites: typedInvites.filter(invite => 
            !invite.used_at && new Date(invite.expires_at) > now
          ).length,
          usedInvites: typedInvites.filter(invite => invite.used_at).length,
          expiredInvites: typedInvites.filter(invite => 
            !invite.used_at && new Date(invite.expires_at) <= now
          ).length
        };

        // Auditoria de integridade de dados
        const dataIntegrity: AuditResult[] = [];

        // Verificar convites sem role válido
        const invalidRoleInvites = typedInvites.filter(invite => 
          !typedRoles.find(role => role.id === invite.role_id)
        );

        if (invalidRoleInvites.length > 0) {
          dataIntegrity.push({
            category: 'Integridade de Dados',
            status: 'error',
            message: `${invalidRoleInvites.length} convites com roles inválidos`,
            details: invalidRoleInvites.map(inv => ({ id: inv.id, email: inv.email, role_id: inv.role_id })),
            recommendation: 'Verificar e corrigir referências de roles nos convites'
          });
        } else {
          dataIntegrity.push({
            category: 'Integridade de Dados',
            status: 'success',
            message: 'Todos os convites possuem roles válidos'
          });
        }

        // Verificar tokens duplicados
        const tokenCounts = new Map<string, number>();
        typedInvites.forEach(invite => {
          const count = tokenCounts.get(invite.token) || 0;
          tokenCounts.set(invite.token, count + 1);
        });

        const duplicateTokens = Array.from(tokenCounts.entries())
          .filter(([_, count]) => count > 1);

        if (duplicateTokens.length > 0) {
          dataIntegrity.push({
            category: 'Integridade de Dados',
            status: 'error',
            message: `${duplicateTokens.length} tokens duplicados encontrados`,
            details: duplicateTokens,
            recommendation: 'Regenerar tokens duplicados'
          });
        } else {
          dataIntegrity.push({
            category: 'Integridade de Dados',
            status: 'success',
            message: 'Todos os tokens são únicos'
          });
        }

        // Auditoria de performance
        const performance: AuditResult[] = [];

        // Verificar convites com muitas tentativas de envio
        const highAttemptInvites = typedInvites.filter(invite => invite.send_attempts > 5);

        if (highAttemptInvites.length > 0) {
          performance.push({
            category: 'Performance',
            status: 'warning',
            message: `${highAttemptInvites.length} convites com muitas tentativas de envio`,
            details: highAttemptInvites.map(inv => ({ 
              id: inv.id, 
              email: inv.email, 
              attempts: inv.send_attempts 
            })),
            recommendation: 'Verificar problemas de entrega e considerar reenvio manual'
          });
        } else {
          performance.push({
            category: 'Performance',
            status: 'success',
            message: 'Tentativas de envio dentro do esperado'
          });
        }

        // Verificar convites antigos não utilizados
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const oldUnusedInvites = typedInvites.filter(invite => 
          !invite.used_at && 
          new Date(invite.expires_at) > now &&
          new Date(invite.created_at) < thirtyDaysAgo
        );

        if (oldUnusedInvites.length > 0) {
          performance.push({
            category: 'Performance',
            status: 'warning',
            message: `${oldUnusedInvites.length} convites antigos não utilizados`,
            details: oldUnusedInvites.map(inv => ({ 
              id: inv.id, 
              email: inv.email, 
              created_at: inv.created_at 
            })),
            recommendation: 'Considerar reenvio ou cancelamento'
          });
        }

        // Auditoria de segurança
        const security: AuditResult[] = [];

        // Verificar convites com período de expiração muito longo
        const longExpirationInvites = typedInvites.filter(invite => {
          const createdAt = new Date(invite.created_at);
          const expiresAt = new Date(invite.expires_at);
          const diffDays = (expiresAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
          return diffDays > 30;
        });

        if (longExpirationInvites.length > 0) {
          security.push({
            category: 'Segurança',
            status: 'warning',
            message: `${longExpirationInvites.length} convites com expiração muito longa`,
            details: longExpirationInvites.map(inv => ({ 
              id: inv.id, 
              email: inv.email, 
              expires_at: inv.expires_at 
            })),
            recommendation: 'Reduzir período de expiração para melhor segurança'
          });
        } else {
          security.push({
            category: 'Segurança',
            status: 'success',
            message: 'Períodos de expiração adequados'
          });
        }

        // Auditoria de integrações
        const integrations: AuditResult[] = [];

        // Verificar status de deliveries
        const failedDeliveries = typedDeliveries.filter(delivery => 
          delivery.status === 'failed' || delivery.status === 'error'
        );

        if (failedDeliveries.length > 0) {
          integrations.push({
            category: 'Integrações',
            status: 'error',
            message: `${failedDeliveries.length} falhas de entrega`,
            details: failedDeliveries.map(del => ({ 
              id: del.id, 
              invite_id: del.invite_id, 
              channel: del.channel,
              status: del.status
            })),
            recommendation: 'Verificar configurações de email e WhatsApp'
          });
        } else if (typedDeliveries.length > 0) {
          integrations.push({
            category: 'Integrações',
            status: 'success',
            message: 'Todas as entregas foram bem-sucedidas'
          });
        } else {
          integrations.push({
            category: 'Integrações',
            status: 'warning',
            message: 'Nenhuma entrega registrada',
            recommendation: 'Verificar se o sistema de deliveries está funcionando'
          });
        }

        // Gerar recomendações
        const recommendations: string[] = [];

        if (overview.expiredInvites > overview.totalInvites * 0.3) {
          recommendations.push('Alto número de convites expirados - considerar reduzir tempo de expiração');
        }

        if (overview.usedInvites / overview.totalInvites < 0.5 && overview.totalInvites > 10) {
          recommendations.push('Taxa de conversão baixa - revisar processo de onboarding');
        }

        if (failedDeliveries.length > 0) {
          recommendations.push('Falhas de entrega detectadas - verificar configurações de integração');
        }

        if (recommendations.length === 0) {
          recommendations.push('Sistema de convites funcionando adequadamente');
        }

        log('Auditoria de convites concluída', {
          totalInvites: overview.totalInvites,
          issues: [...dataIntegrity, ...performance, ...security, ...integrations]
            .filter(result => result.status !== 'success').length
        });

        return {
          overview,
          dataIntegrity,
          performance,
          security,
          integrations,
          recommendations
        };

      } catch (error: any) {
        logWarning('Erro durante auditoria de convites', { error: error.message });
        throw new Error(`Falha na auditoria: ${error.message}`);
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false
  });
};
