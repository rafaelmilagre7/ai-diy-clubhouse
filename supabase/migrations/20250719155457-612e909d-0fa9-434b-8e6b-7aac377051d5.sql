
-- SIMPLIFICAÇÃO: REMOVER COMPLETAMENTE SISTEMA DE ONBOARDING
-- ===========================================================

-- ETAPA 1: BACKUP DE SEGURANÇA (caso precise recuperar dados)
-- ===========================================================

CREATE TABLE IF NOT EXISTS public.onboarding_backup_complete AS
SELECT 
  'onboarding_final' as source_table,
  to_jsonb(of.*) as data,
  now() as backup_timestamp
FROM public.onboarding_final of
UNION ALL
SELECT 
  'onboarding_simple' as source_table,
  to_jsonb(os.*) as data,
  now() as backup_timestamp  
FROM public.onboarding_simple os
UNION ALL
SELECT 
  'quick_onboarding' as source_table,
  to_jsonb(qo.*) as data,
  now() as backup_timestamp
FROM public.quick_onboarding qo;

-- ETAPA 2: REMOVER TODAS AS TABELAS DE ONBOARDING
-- ===============================================

-- Desativar triggers primeiro para evitar erros
DROP TRIGGER IF EXISTS sync_onboarding_to_profile_trigger ON public.onboarding_final;
DROP TRIGGER IF EXISTS update_onboarding_final_updated_at ON public.onboarding_final;
DROP TRIGGER IF EXISTS validate_onboarding_data ON public.onboarding_final;

-- Remover tabelas de onboarding (ordem para respeitar foreign keys)
DROP TABLE IF EXISTS public.onboarding_step_tracking CASCADE;
DROP TABLE IF EXISTS public.onboarding_analytics CASCADE;
DROP TABLE IF EXISTS public.onboarding_backups CASCADE;
DROP TABLE IF EXISTS public.onboarding_sync CASCADE;
DROP TABLE IF EXISTS public.onboarding_simple CASCADE;
DROP TABLE IF EXISTS public.quick_onboarding CASCADE;
DROP TABLE IF EXISTS public.onboarding_final CASCADE;
DROP TABLE IF EXISTS public.onboarding_unified CASCADE;

-- ETAPA 3: SIMPLIFICAR PERFIL DE USUÁRIO
-- ======================================

-- Remover colunas de onboarding da tabela profiles
ALTER TABLE public.profiles 
DROP COLUMN IF EXISTS onboarding_completed,
DROP COLUMN IF EXISTS onboarding_completed_at,
DROP COLUMN IF EXISTS onboarding_step,
DROP COLUMN IF EXISTS company_name,
DROP COLUMN IF EXISTS industry,
DROP COLUMN IF EXISTS company_size;

-- Adicionar apenas campos essenciais se não existirem
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS display_name text,
ADD COLUMN IF NOT EXISTS avatar_url text,
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

-- ETAPA 4: REMOVER FUNÇÕES RELACIONADAS AO ONBOARDING
-- ===================================================

DROP FUNCTION IF EXISTS public.initialize_onboarding_for_user(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.initialize_onboarding_for_all_users() CASCADE;
DROP FUNCTION IF EXISTS public.initialize_onboarding_after_invite() CASCADE;
DROP FUNCTION IF EXISTS public.complete_onboarding(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.complete_onboarding_and_unlock_features(uuid, jsonb) CASCADE;
DROP FUNCTION IF EXISTS public.get_onboarding_next_step(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.clean_user_onboarding_data(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.fix_stuck_onboarding_users() CASCADE;
DROP FUNCTION IF EXISTS public.sync_onboarding_to_profile() CASCADE;
DROP FUNCTION IF EXISTS public.validate_onboarding_data() CASCADE;
DROP FUNCTION IF EXISTS public.generate_personalized_completion_message(jsonb) CASCADE;

-- ETAPA 5: ATUALIZAR SISTEMA DE CONVITES (SIMPLIFICADO)
-- =====================================================

-- Remover lógica de onboarding dos triggers de convite
DROP FUNCTION IF EXISTS public.process_invite_after_signup() CASCADE;

-- Recriar trigger simples para convites
CREATE OR REPLACE FUNCTION public.apply_invite_simple()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  invite_token text;
  invite_record record;
BEGIN
  -- Buscar token de convite
  invite_token := NEW.raw_user_meta_data->>'invite_token';
  
  IF invite_token IS NOT NULL THEN
    -- Buscar convite válido
    SELECT * INTO invite_record
    FROM public.invites
    WHERE UPPER(token) = UPPER(invite_token)
    AND used_at IS NULL
    AND expires_at > NOW()
    LIMIT 1;
    
    IF invite_record.id IS NOT NULL THEN
      -- Atualizar perfil com role do convite
      UPDATE public.profiles
      SET role_id = invite_record.role_id
      WHERE id = NEW.id;
      
      -- Marcar convite como usado
      UPDATE public.invites
      SET used_at = NOW()
      WHERE id = invite_record.id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Aplicar trigger simplificado
CREATE TRIGGER apply_invite_simple_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.apply_invite_simple();

-- ETAPA 6: SIMPLIFICAR POLÍTICAS RLS
-- =================================

-- Atualizar políticas do profiles sem referência a onboarding
DROP POLICY IF EXISTS "profiles_safe_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_safe_update" ON public.profiles;
DROP POLICY IF EXISTS "profiles_safe_insert" ON public.profiles;

CREATE POLICY "profiles_simple_select"
  ON public.profiles
  FOR SELECT
  USING (
    id = auth.uid()
    OR
    COALESCE((auth.jwt() ->> 'user_metadata')::jsonb ->> 'role', '') = 'admin'
    OR
    is_active = true  -- Perfis ativos são públicos
  );

CREATE POLICY "profiles_simple_update"
  ON public.profiles
  FOR UPDATE
  USING (
    id = auth.uid()
    OR
    COALESCE((auth.jwt() ->> 'user_metadata')::jsonb ->> 'role', '') = 'admin'
  );

CREATE POLICY "profiles_simple_insert"
  ON public.profiles
  FOR INSERT
  WITH CHECK (id = auth.uid());

-- ETAPA 7: LIMPEZA DE AUDIT LOGS
-- ==============================

-- Remover logs relacionados ao onboarding para limpar base
DELETE FROM public.audit_logs 
WHERE event_type IN (
  'onboarding_step',
  'onboarding_completed',
  'onboarding_initialized',
  'onboarding_error'
);

-- ETAPA 8: LOG DA SIMPLIFICAÇÃO
-- =============================

INSERT INTO public.audit_logs (
  user_id,
  event_type,
  action,
  details
) VALUES (
  auth.uid(),
  'system_simplification',
  'onboarding_system_removed',
  jsonb_build_object(
    'removed_tables', ARRAY[
      'onboarding_final',
      'onboarding_simple', 
      'quick_onboarding',
      'onboarding_unified',
      'onboarding_step_tracking',
      'onboarding_analytics'
    ],
    'removed_functions', ARRAY[
      'initialize_onboarding_for_user',
      'complete_onboarding',
      'get_onboarding_next_step'
    ],
    'simplified_profiles', true,
    'backup_created', 'onboarding_backup_complete',
    'timestamp', now()
  )
);

-- ETAPA 9: VERIFICAÇÃO FINAL
-- ==========================

-- Confirmar que sistema foi simplificado
SELECT 
  'Sistema de onboarding removido com sucesso!' as message,
  (SELECT COUNT(*) FROM public.onboarding_backup_complete) as records_backed_up,
  (SELECT COUNT(*) FROM public.profiles) as profiles_remaining,
  now() as completed_at;
