-- Criar organizações automaticamente para master users sem organization_id
-- Esta migração resolve o problema de master users não conseguirem convidar membros

-- Passo 1: Criar organizações para todos os master users sem organization_id
INSERT INTO public.organizations (
  name,
  master_user_id,
  plan_type,
  max_users,
  is_active,
  created_at,
  updated_at
)
SELECT 
  COALESCE(p.company_name, p.name, p.email, 'Organização de ' || p.email) as name,
  p.id as master_user_id,
  'basic' as plan_type,
  5 as max_users,
  true as is_active,
  now() as created_at,
  now() as updated_at
FROM public.profiles p
WHERE p.is_master_user = true 
  AND p.organization_id IS NULL
ON CONFLICT DO NOTHING;

-- Passo 2: Atualizar profiles com organization_id recém-criado
UPDATE public.profiles p
SET 
  organization_id = o.id,
  updated_at = now()
FROM public.organizations o
WHERE o.master_user_id = p.id
  AND p.is_master_user = true
  AND p.organization_id IS NULL;

-- Passo 3: Registrar criação automática no audit_logs
INSERT INTO public.audit_logs (
  user_id,
  event_type,
  action,
  details,
  severity
)
SELECT 
  p.id,
  'organization_auto_created',
  'system_migration',
  jsonb_build_object(
    'organization_name', o.name,
    'organization_id', o.id,
    'reason', 'auto_created_for_master_user',
    'migration_timestamp', now()
  ),
  'info'
FROM public.profiles p
INNER JOIN public.organizations o ON o.master_user_id = p.id
WHERE p.is_master_user = true
  AND o.created_at > now() - interval '1 minute';

-- Passo 4: Verificação pós-migração
DO $$
DECLARE
  total_created integer;
  orphaned_masters integer;
BEGIN
  -- Contar organizações criadas
  SELECT COUNT(*) INTO total_created
  FROM public.organizations 
  WHERE created_at > now() - interval '1 minute';
  
  -- Verificar se ainda existem master users sem organização
  SELECT COUNT(*) INTO orphaned_masters
  FROM public.profiles 
  WHERE is_master_user = true 
    AND organization_id IS NULL;
  
  RAISE NOTICE '✅ Migração concluída: % organizações criadas', total_created;
  
  IF orphaned_masters > 0 THEN
    RAISE WARNING '⚠️ Ainda existem % master users sem organização', orphaned_masters;
  ELSE
    RAISE NOTICE '✅ Todos os master users agora possuem organização!';
  END IF;
END $$;