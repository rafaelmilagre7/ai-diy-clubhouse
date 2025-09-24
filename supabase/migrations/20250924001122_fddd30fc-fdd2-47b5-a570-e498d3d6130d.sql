-- Verificar se existe regra com mesmo nome e deletar se necessário
DELETE FROM automation_rules WHERE name IN ('Convites Automáticos Hubla', 'Hubla Retry Logic');

-- Inserir regra de automação funcional para Hubla
INSERT INTO automation_rules (
  name,
  description,
  rule_type,
  conditions,
  actions,
  is_active,
  priority,
  created_by
) VALUES (
  'Convites Automáticos Hubla',
  'Processa webhooks da Hubla e envia convites automáticos baseado no produto adquirido',
  'webhook',
  '{
    "operator": "OR",
    "conditions": [
      {
        "field": "type",
        "operator": "equals",
        "value": "customer.member_added"
      },
      {
        "field": "event.type", 
        "operator": "equals",
        "value": "NewSale"
      },
      {
        "field": "event_type",
        "operator": "equals", 
        "value": "customer.member_added"
      }
    ]
  }'::jsonb,
  '[
    {
      "type": "send_invite",
      "parameters": {
        "role_mapping": {
          "3rYUFiiBV8zHXFAjnEmZ": "lovable_course",
          "PLATFORM_VIVER_IA": "membro_club",
          "FORMACAO_VIVER_IA": "formacao", 
          "LOVABLE_E_FORMACAO": "lovable_e_formacao",
          "CONVIDADO_PLATFORM": "convidado",
          "HANDS_ON_PLATFORM": "hands_on"
        },
        "product_to_role_mapping": {
          "Lovable na Prática | Viver de IA": "lovable_course",
          "Plataforma Viver de IA": "membro_club", 
          "Formação Viver de IA": "formacao",
          "Lovable na Prática E Formação Viver de IA": "lovable_e_formacao"
        },
        "email_fields": {
          "email": ["customer.email", "event.customer.email", "customer_email"],
          "name": ["customer.name", "event.customer.name", "customer_name"],
          "phone": ["customer.phone", "event.customer.phone", "customer_phone"],
          "product_name": ["product.name", "event.product.name", "product_name"]
        },
        "default_role": "convidado",
        "auto_send": true,
        "expires_in_days": 30,
        "preferred_channels": ["email", "whatsapp"],
        "email_template": "hubla_welcome",
        "whatsapp_template": "hubla_welcome_wa",
        "duplicate_prevention": true,
        "rate_limit": {
          "max_invites_per_email_per_day": 3,
          "max_invites_per_hour": 50
        }
      }
    },
    {
      "type": "log_analytics",
      "parameters": {
        "event_type": "hubla_webhook_processed",
        "track_conversion": true
      }
    }
  ]'::jsonb,
  true,
  10,
  (SELECT p.id FROM profiles p INNER JOIN user_roles ur ON p.role_id = ur.id WHERE ur.name = 'admin' LIMIT 1)
),
(
  'Hubla Retry Logic',
  'Processa reenvios de convites que falharam inicialmente',
  'scheduled',
  '{
    "operator": "AND",
    "conditions": [
      {
        "field": "source",
        "operator": "equals",
        "value": "hubla_webhook"
      },
      {
        "field": "failed_attempts",
        "operator": "less_than",
        "value": 3
      },
      {
        "field": "last_attempt",
        "operator": "older_than_minutes",
        "value": 15
      }
    ]
  }'::jsonb,
  '[
    {
      "type": "retry_invite",
      "parameters": {
        "max_attempts": 3,
        "backoff_minutes": [5, 15, 60],
        "notify_admin_after_final_failure": true
      }
    }
  ]'::jsonb,
  true,
  5,
  (SELECT p.id FROM profiles p INNER JOIN user_roles ur ON p.role_id = ur.id WHERE ur.name = 'admin' LIMIT 1)
);