export const mockAutomationRule = {
  id: 'test-rule-id',
  name: 'Convites Automáticos Hubla',
  description: 'Cria convite automático quando cliente compra produto na Hubla',
  rule_type: 'webhook',
  is_active: true,
  priority: 1,
  conditions: {
    id: 'root',
    operator: 'AND',
    conditions: [
      {
        id: 'event_check',
        field: 'event_type',
        operator: 'equals',
        value: 'purchase_completed',
        type: 'string'
      }
    ]
  },
  actions: [
    {
      type: 'send_invite',
      parameters: {
        role_id: 'lovable_course',
        template: 'lovable_welcome',
        channels: ['email', 'whatsapp'],
        expires_in: '7 days'
      },
      enabled: true,
      order: 1
    }
  ],
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
};

export const mockAutomationRules = [
  mockAutomationRule,
  {
    ...mockAutomationRule,
    id: 'test-rule-id-2',
    name: 'Hubla Retry Logic',
    description: 'Sistema de retry para falhas na criação de usuários',
    is_active: false,
    priority: 2
  }
];

export const mockAvailableFields = [
  { value: 'event_type', label: 'Tipo do Evento', type: 'string' },
  { value: 'payload.event.product.name', label: 'Nome do Produto', type: 'string' },
  { value: 'payload.event.customer.email', label: 'Email do Cliente', type: 'string' },
  { value: 'payload.event.value', label: 'Valor da Compra', type: 'number' },
  { value: 'created_at', label: 'Data de Criação', type: 'string' }
];

export const mockAutomationTemplate = {
  id: 'hubla_welcome',
  name: 'Boas-vindas Hubla',
  description: 'Cria convite automático quando cliente compra produto na Hubla',
  category: 'hubla',
  icon: 'UserPlus',
  difficulty: 'easy' as const,
  estimatedTime: '2 min',
  usageCount: 45,
  tags: ['Popular', 'Hubla', 'Convites'],
  conditions: mockAutomationRule.conditions,
  actions: mockAutomationRule.actions
};

export const mockLogStats = {
  total: 150,
  success: 135,
  failed: 10,
  pending: 5
};

export const mockFormData = {
  name: 'Test Automation',
  description: 'Test automation description',
  rule_type: 'webhook',
  is_active: true,
  priority: 1,
  conditions: {
    id: 'root',
    operator: 'AND',
    conditions: []
  },
  actions: []
};