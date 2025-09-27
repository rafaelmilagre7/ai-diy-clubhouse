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
  // === EVENTO ===
  {
    value: 'payload.type',
    label: 'Tipo de Evento',
    type: 'string',
    description: 'Tipo do evento Hubla que disparou a automação',
    category: 'evento',
    examples: ['NewSale', 'customer.member_added', 'invoice.paid'],
    aliases: ['type', 'event.type', 'event_type']
  },
  {
    value: 'payload.timestamp',
    label: 'Data/Hora do Evento',
    type: 'datetime',
    description: 'Quando o evento foi processado',
    category: 'evento',
    examples: ['2025-08-23T13:07:14.035Z']
  },
  {
    value: 'payload.id',
    label: 'ID do Evento',
    type: 'string',
    description: 'Identificador único do evento',
    category: 'evento',
    examples: ['evt_123456789']
  },

  // === CLIENTE ===
  {
    value: 'payload.event.userEmail',
    label: 'Email do Cliente',
    type: 'string',
    description: 'Email principal do cliente que fez a compra',
    category: 'cliente',
    examples: ['cliente@example.com', 'joao.silva@gmail.com'],
    aliases: ['userEmail', 'user_email', 'email']
  },
  {
    value: 'payload.event.userName',
    label: 'Nome do Cliente',
    type: 'string',
    description: 'Nome completo do cliente',
    category: 'cliente',
    examples: ['João Silva Santos', 'Maria Oliveira'],
    aliases: ['userName', 'user_name', 'name']
  },
  {
    value: 'payload.event.userPhone',
    label: 'Telefone do Cliente',
    type: 'string',
    description: 'Número de telefone/WhatsApp do cliente',
    category: 'cliente',
    examples: ['+5511999999999', '11999888777'],
    aliases: ['userPhone', 'user_phone', 'phone']
  },
  {
    value: 'payload.event.user.email',
    label: 'Email Usuário (v2)',
    type: 'string',
    description: 'Email do usuário na nova estrutura da Hubla',
    category: 'cliente',
    examples: ['test-user-email@example.com']
  },
  {
    value: 'payload.event.user.name',
    label: 'Nome Usuário (v2)',
    type: 'string',
    description: 'Nome do usuário na nova estrutura',
    category: 'cliente',
    examples: ['João Silva']
  },
  {
    value: 'payload.event.user.phone',
    label: 'Telefone Usuário (v2)',
    type: 'string',
    description: 'Telefone na nova estrutura',
    category: 'cliente',
    examples: ['+5511999999999']
  },
  {
    value: 'payload.event.customerId',
    label: 'ID do Cliente',
    type: 'string',
    description: 'Identificador único do cliente na Hubla',
    category: 'cliente',
    examples: ['cust_abcd1234']
  },

  // === PRODUTO/VENDA ===
  {
    value: 'payload.event.groupName',
    label: 'Nome do Produto/Grupo',
    type: 'string',
    description: 'Nome do produto ou grupo comprado pelo cliente',
    category: 'produto',
    examples: ['Lovable na Prática | Viver de IA', 'Combo Viver de IA', 'Curso Avançado'],
    aliases: ['groupName', 'product_name', 'productName']
  },
  {
    value: 'payload.event.productId',
    label: 'ID do Produto',
    type: 'string',
    description: 'Identificador único do produto',
    category: 'produto',
    examples: ['prod_123456', 'lovable_course_v2']
  },
  {
    value: 'payload.event.productSku',
    label: 'SKU do Produto',
    type: 'string',
    description: 'Código SKU do produto',
    category: 'produto',
    examples: ['LOVABLE-001', 'VIA-COMBO-2024']
  },
  {
    value: 'payload.event.categoryName',
    label: 'Categoria do Produto',
    type: 'string',
    description: 'Categoria à qual o produto pertence',
    category: 'produto',
    examples: ['Cursos', 'Mentoria', 'Consultoria']
  },

  // === FINANCEIRO ===
  {
    value: 'payload.event.totalAmount',
    label: 'Valor Total',
    type: 'number',
    description: 'Valor total da transação em centavos',
    category: 'financeiro',
    examples: [29700, 49900, 99900, 197000],
    aliases: ['totalAmount', 'amount', 'saleValue']
  },
  {
    value: 'payload.event.originalAmount',
    label: 'Valor Original',
    type: 'number',
    description: 'Valor original antes de descontos',
    category: 'financeiro',
    examples: [59900, 99900, 199900]
  },
  {
    value: 'payload.event.discountAmount',
    label: 'Valor do Desconto',
    type: 'number',
    description: 'Valor do desconto aplicado',
    category: 'financeiro',
    examples: [10000, 50000, 100000]
  },
  {
    value: 'payload.event.currency',
    label: 'Moeda',
    type: 'string',
    description: 'Código da moeda da transação',
    category: 'financeiro',
    examples: ['BRL', 'USD', 'EUR']
  },
  {
    value: 'payload.event.paymentMethod',
    label: 'Método de Pagamento',
    type: 'string',
    description: 'Forma de pagamento utilizada pelo cliente',
    category: 'financeiro',
    examples: ['pix', 'credit_card', 'boleto', 'debit_card'],
    aliases: ['paymentMethod', 'payment_method']
  },
  {
    value: 'payload.event.installments',
    label: 'Parcelas',
    type: 'number',
    description: 'Número de parcelas da compra',
    category: 'financeiro',
    examples: [1, 3, 6, 12]
  },
  {
    value: 'payload.event.paidAt',
    label: 'Data do Pagamento',
    type: 'datetime',
    description: 'Data e hora exata em que o pagamento foi aprovado',
    category: 'financeiro',
    examples: ['2025-08-23T13:07:14.035Z', '2025-09-15T10:30:00.000Z'],
    aliases: ['paidAt', 'paid_at']
  },
  {
    value: 'payload.event.dueDate',
    label: 'Data de Vencimento',
    type: 'datetime',
    description: 'Data de vencimento do pagamento',
    category: 'financeiro',
    examples: ['2025-08-30T23:59:59.000Z']
  },

  // === RECORRÊNCIA/ASSINATURA ===
  {
    value: 'payload.event.recurring',
    label: 'Tipo de Recorrência',
    type: 'string',
    description: 'Indica se é compra única ou recorrente',
    category: 'assinatura',
    examples: ['one_time_purchased', 'subscription', 'recurring'],
    aliases: ['recurring', 'subscription_type']
  },
  {
    value: 'payload.event.subscription.id',
    label: 'ID da Assinatura',
    type: 'string',
    description: 'Identificador da assinatura',
    category: 'assinatura',
    examples: ['sub_123456789']
  },
  {
    value: 'payload.event.subscription.status',
    label: 'Status da Assinatura',
    type: 'string',
    description: 'Status atual da assinatura do cliente',
    category: 'assinatura',
    examples: ['active', 'cancelled', 'expired', 'paused', 'trial'],
    aliases: ['subscription_status']
  },
  {
    value: 'payload.event.subscription.cycle',
    label: 'Ciclo da Assinatura',
    type: 'string',
    description: 'Frequência de cobrança da assinatura',
    category: 'assinatura',
    examples: ['monthly', 'yearly', 'weekly', 'quarterly']
  },
  {
    value: 'payload.event.subscription.nextBilling',
    label: 'Próxima Cobrança',
    type: 'datetime',
    description: 'Data da próxima cobrança',
    category: 'assinatura',
    examples: ['2025-09-23T13:07:14.035Z']
  },
  {
    value: 'payload.event.subscription.trialEnds',
    label: 'Fim do Trial',
    type: 'datetime',
    description: 'Data de término do período de teste',
    category: 'assinatura',
    examples: ['2025-09-07T23:59:59.000Z']
  },

  // === CUPONS/PROMOÇÕES ===
  {
    value: 'payload.event.couponCode',
    label: 'Código do Cupom',
    type: 'string',
    description: 'Código do cupom de desconto utilizado',
    category: 'promocao',
    examples: ['DESCONTO50', 'PRIMEIRACOMPRA', 'BLACKFRIDAY2024']
  },
  {
    value: 'payload.event.affiliateCode',
    label: 'Código do Afiliado',
    type: 'string',
    description: 'Código do afiliado que gerou a venda',
    category: 'promocao',
    examples: ['AFF001', 'influencer_joao', 'partner_maria']
  },
  {
    value: 'payload.event.utmSource',
    label: 'UTM Source',
    type: 'string',
    description: 'Origem da campanha de marketing',
    category: 'marketing',
    examples: ['google', 'facebook', 'instagram', 'email']
  },
  {
    value: 'payload.event.utmCampaign',
    label: 'UTM Campaign',
    type: 'string',
    description: 'Nome da campanha de marketing',
    category: 'marketing',
    examples: ['black_friday_2024', 'lancamento_produto', 'retargeting']
  },

  // === DADOS TÉCNICOS ===  
  {
    value: 'payload.event.orderId',
    label: 'ID do Pedido',
    type: 'string',
    description: 'Identificador único do pedido',
    category: 'pedido',
    examples: ['order_123456789', 'PED-2024-001']
  },
  {
    value: 'payload.event.invoiceId',
    label: 'ID da Fatura',
    type: 'string',
    description: 'Identificador da fatura',
    category: 'pedido',
    examples: ['inv_123456789']
  },
  {
    value: 'payload.event.customerIp',
    label: 'IP do Cliente',
    type: 'string',
    description: 'Endereço IP do cliente',
    category: 'tecnico',
    examples: ['192.168.1.100', '203.0.113.45']
  },
  {
    value: 'payload.event.browserAgent',
    label: 'User Agent',
    type: 'string',
    description: 'Informações do navegador do cliente',
    category: 'tecnico',
    examples: ['Mozilla/5.0 (Windows NT 10.0; Win64; x64)...']
  },

  // === LOCALIZAÇÃO ===
  {
    value: 'payload.event.country',
    label: 'País',
    type: 'string',
    description: 'País do cliente',
    category: 'localizacao',
    examples: ['BR', 'US', 'PT']
  },
  {
    value: 'payload.event.state',
    label: 'Estado/Região',
    type: 'string',
    description: 'Estado ou região do cliente',
    category: 'localizacao',
    examples: ['SP', 'RJ', 'MG']
  },
  {
    value: 'payload.event.city',
    label: 'Cidade',
    type: 'string',
    description: 'Cidade do cliente',
    category: 'localizacao',
    examples: ['São Paulo', 'Rio de Janeiro', 'Belo Horizonte']
  },

  // === MEMBROS/COMUNIDADE ===
  {
    value: 'payload.event.memberLevel',
    label: 'Nível de Membro',
    type: 'string',
    description: 'Nível de acesso do membro',
    category: 'membro',
    examples: ['basic', 'premium', 'vip', 'enterprise']
  },
  {
    value: 'payload.event.memberSince',
    label: 'Membro Desde',
    type: 'datetime',
    description: 'Data em que se tornou membro',
    category: 'membro',
    examples: ['2024-01-15T10:00:00.000Z']
  },
  {
    value: 'payload.event.totalPurchases',
    label: 'Total de Compras',
    type: 'number',
    description: 'Número total de compras do cliente',
    category: 'cliente',
    examples: [1, 5, 12, 25]
  },
  {
    value: 'payload.event.lifetimeValue',
    label: 'Valor Vitalício',
    type: 'number',
    description: 'Valor total gasto pelo cliente',
    category: 'financeiro',
    examples: [29700, 149700, 500000]
  }
];