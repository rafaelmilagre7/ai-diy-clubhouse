import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useHublaEvents = () => {
  return useQuery({
    queryKey: ['hubla_events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hubla_webhooks')
        .select('event_type, payload')
        .limit(100);

      if (error) throw error;

      // Extrair tipos de eventos únicos e mapear estruturas
      const eventTypes = new Set<string>();
      const eventStructures: Record<string, any> = {};

      data?.forEach(webhook => {
        try {
          const eventType = webhook.payload?.type || 'unknown';
          eventTypes.add(eventType);
          
          if (!eventStructures[eventType] && webhook.payload) {
            eventStructures[eventType] = webhook.payload;
          }
        } catch (e) {
          console.warn('Erro ao processar webhook:', e);
        }
      });

      return {
        eventTypes: Array.from(eventTypes),
        eventStructures,
        rawData: data
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

export const HUBLA_EVENT_TYPES = [
  {
    value: 'NewSale',
    label: 'Nova Venda',
    description: 'Quando uma nova venda é processada',
    icon: '💰',
    category: 'vendas'
  },
  {
    value: 'customer.member_added',
    label: 'Membro Adicionado',
    description: 'Quando um cliente se torna membro',
    icon: '👤',
    category: 'membros'
  },
  {
    value: 'invoice.paid',
    label: 'Pagamento Aprovado',
    description: 'Quando um pagamento é aprovado',
    icon: '✅',
    category: 'pagamentos'
  },
  {
    value: 'invoice.overdue',
    label: 'Pagamento Vencido',
    description: 'Quando um pagamento está vencido',
    icon: '⏰',
    category: 'pagamentos'
  },
  {
    value: 'subscription.created',
    label: 'Assinatura Criada',
    description: 'Quando uma nova assinatura é criada',
    icon: '🔄',
    category: 'assinaturas'
  },
  {
    value: 'subscription.cancelled',
    label: 'Assinatura Cancelada',
    description: 'Quando uma assinatura é cancelada',
    icon: '❌',
    category: 'assinaturas'
  },
  {
    value: 'cart.abandoned',
    label: 'Carrinho Abandonado',
    description: 'Quando um carrinho é abandonado',
    icon: '🛒',
    category: 'carrinho'
  }
];

// Mapeamento de campos antigos para novos (migração)
export const FIELD_MIGRATION_MAP: Record<string, string> = {
  'type': 'payload.type',
  'event.type': 'payload.type',
  'event_type': 'payload.type',
  'userEmail': 'payload.event.userEmail',
  'userName': 'payload.event.userName',
  'userPhone': 'payload.event.userPhone',
  'groupName': 'payload.event.groupName',
  'totalAmount': 'payload.event.totalAmount',
  'paymentMethod': 'payload.event.paymentMethod',
  'recurring': 'payload.event.recurring',
  'paidAt': 'payload.event.paidAt',
  'user.email': 'payload.event.user.email',
  'subscription.status': 'payload.event.subscription.status'
};

// Função para migrar campo antigo para novo
export const migrateFieldName = (oldField: string): string => {
  return FIELD_MIGRATION_MAP[oldField] || oldField;
};

// Função para encontrar campo com fallback
export const findHublaField = (fieldValue: string) => {
  // Primeiro, tentar encontrar o campo diretamente
  let field = HUBLA_FIELDS.find(f => f.value === fieldValue);
  
  // Se não encontrou, tentar com migração
  if (!field) {
    const migratedField = migrateFieldName(fieldValue);
    field = HUBLA_FIELDS.find(f => f.value === migratedField);
  }
  
  // Se ainda não encontrou, criar um campo temporário para manter compatibilidade
  if (!field) {
    field = {
      value: fieldValue,
      label: `Campo: ${fieldValue}`,
      type: 'string',
      description: 'Campo não reconhecido (migração necessária)',
      category: 'desconhecido',
      examples: []
    };
  }
  
  return field;
};

export const HUBLA_FIELDS = [
  {
    value: 'payload.type',
    label: 'Tipo de Evento',
    type: 'string',
    description: 'Tipo do evento Hubla',
    category: 'evento',
    examples: ['NewSale', 'customer.member_added'],
    aliases: ['type', 'event.type', 'event_type'] // Campos antigos compatíveis
  },
  {
    value: 'payload.event.userEmail',
    label: 'Email do Cliente',
    type: 'string',
    description: 'Email do cliente na transação',
    category: 'cliente',
    examples: ['cliente@example.com'],
    aliases: ['userEmail', 'user_email', 'email']
  },
  {
    value: 'payload.event.userName',
    label: 'Nome do Cliente',
    type: 'string',
    description: 'Nome completo do cliente',
    category: 'cliente',
    examples: ['João Silva', 'Maria Santos'],
    aliases: ['userName', 'user_name', 'name']
  },
  {
    value: 'payload.event.userPhone',
    label: 'Telefone do Cliente',
    type: 'string',
    description: 'Número de telefone do cliente',
    category: 'cliente',
    examples: ['+5511999999999']
  },
  {
    value: 'payload.event.groupName',
    label: 'Nome do Produto/Grupo',
    type: 'string',
    description: 'Nome do produto ou grupo comprado',
    category: 'produto',
    examples: ['Lovable na Prática | Viver de IA']
  },
  {
    value: 'payload.event.totalAmount',
    label: 'Valor Total',
    type: 'number',
    description: 'Valor total da transação',
    category: 'financeiro',
    examples: [29700, 49900, 99900]
  },
  {
    value: 'payload.event.paymentMethod',
    label: 'Método de Pagamento',
    type: 'string',
    description: 'Forma de pagamento utilizada',
    category: 'financeiro',
    examples: ['pix', 'credit_card', 'boleto']
  },
  {
    value: 'payload.event.recurring',
    label: 'Tipo de Recorrência',
    type: 'string',
    description: 'Se é compra única ou recorrente',
    category: 'produto',
    examples: ['one_time_purchased', 'subscription']
  },
  {
    value: 'payload.event.paidAt',
    label: 'Data do Pagamento',
    type: 'datetime',
    description: 'Quando o pagamento foi aprovado',
    category: 'financeiro',
    examples: ['2025-08-23T13:07:14.035Z']
  },
  {
    value: 'payload.event.user.email',
    label: 'Email do Usuário (v2)',
    type: 'string',
    description: 'Email do usuário (nova estrutura)',
    category: 'cliente',
    examples: ['test-user-email@example.com']
  },
  {
    value: 'payload.event.subscription.status',
    label: 'Status da Assinatura',
    type: 'string',
    description: 'Status atual da assinatura',
    category: 'assinaturas',
    examples: ['active', 'cancelled', 'expired']
  }
];