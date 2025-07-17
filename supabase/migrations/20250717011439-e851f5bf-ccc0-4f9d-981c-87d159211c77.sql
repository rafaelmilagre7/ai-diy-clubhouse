-- FASE 1: Limpeza da estrutura onboarding_final
-- Backup dos dados atuais e migração para estrutura simplificada

-- 1. Criar backup dos dados existentes
INSERT INTO public.analytics_backups (
  table_name,
  backup_reason,
  record_count,
  backup_data
)
SELECT 
  'onboarding_final',
  'Simplificação estrutura - manter apenas campos JSONB',
  COUNT(*),
  jsonb_agg(to_jsonb(onboarding_final.*))
FROM public.onboarding_final;

-- 2. Migrar dados existentes para campos JSONB corretos
UPDATE public.onboarding_final
SET 
  personal_info = personal_info || 
    COALESCE(jsonb_build_object('name', name), '{}') ||
    COALESCE(jsonb_build_object('email', email), '{}') ||
    COALESCE(jsonb_build_object('phone', phone), '{}') ||
    COALESCE(jsonb_build_object('location', location), '{}'),
  
  business_info = business_info ||
    COALESCE(jsonb_build_object('company_name', company_name), '{}') ||
    COALESCE(jsonb_build_object('company_sector', company_sector), '{}') ||
    COALESCE(jsonb_build_object('position', position), '{}') ||
    COALESCE(jsonb_build_object('business_size', business_size), '{}'),
  
  ai_experience = ai_experience ||
    COALESCE(jsonb_build_object('ai_knowledge_level', ai_knowledge_level), '{}') ||
    COALESCE(jsonb_build_object('ai_tools_used', ai_tools_used), '{}') ||
    COALESCE(jsonb_build_object('ai_main_challenge', ai_main_challenge), '{}'),
  
  goals_info = goals_info ||
    COALESCE(jsonb_build_object('ai_implementation_objective', ai_implementation_objective), '{}') ||
    COALESCE(jsonb_build_object('ai_implementation_urgency', ai_implementation_urgency), '{}') ||
    COALESCE(jsonb_build_object('ai_implementation_budget', ai_implementation_budget), '{}'),
  
  personalization = personalization ||
    COALESCE(jsonb_build_object('communication_preference', communication_preference), '{}') ||
    COALESCE(jsonb_build_object('notification_preference', notification_preference), '{}')
WHERE user_id IS NOT NULL;

-- 3. Remover campos redundantes (agora migrados para JSONB)
ALTER TABLE public.onboarding_final 
  DROP COLUMN IF EXISTS name,
  DROP COLUMN IF EXISTS email,
  DROP COLUMN IF EXISTS phone,
  DROP COLUMN IF EXISTS location,
  DROP COLUMN IF EXISTS company_name,
  DROP COLUMN IF EXISTS company_sector,
  DROP COLUMN IF EXISTS position,
  DROP COLUMN IF EXISTS business_size,
  DROP COLUMN IF EXISTS ai_knowledge_level,
  DROP COLUMN IF EXISTS ai_tools_used,
  DROP COLUMN IF EXISTS ai_main_challenge,
  DROP COLUMN IF EXISTS ai_implementation_objective,
  DROP COLUMN IF EXISTS ai_implementation_urgency,
  DROP COLUMN IF EXISTS ai_implementation_budget,
  DROP COLUMN IF EXISTS communication_preference,
  DROP COLUMN IF EXISTS notification_preference,
  DROP COLUMN IF EXISTS completed_at;

-- 4. Garantir que campos JSONB essenciais existam com valores padrão
UPDATE public.onboarding_final
SET 
  personal_info = COALESCE(personal_info, '{}'::jsonb),
  business_info = COALESCE(business_info, '{}'::jsonb),
  ai_experience = COALESCE(ai_experience, '{}'::jsonb),
  goals_info = COALESCE(goals_info, '{}'::jsonb),
  personalization = COALESCE(personalization, '{}'::jsonb),
  location_info = COALESCE(location_info, '{}'::jsonb),
  discovery_info = COALESCE(discovery_info, '{}'::jsonb),
  business_context = COALESCE(business_context, '{}'::jsonb)
WHERE user_id IS NOT NULL;