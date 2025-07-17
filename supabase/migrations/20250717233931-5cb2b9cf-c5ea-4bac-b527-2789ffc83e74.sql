-- FASE 3: CORREÇÕES CRÍTICAS DE SEGURANÇA (VERSÃO CORRIGIDA)
-- ===============================================

-- Corrigir funções críticas sem search_path seguro
-- 1. Função: cleanup_expired_invites_enhanced
CREATE OR REPLACE FUNCTION public.cleanup_expired_invites_enhanced()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  deleted_count integer;
  backup_count integer;
BEGIN
  -- Fazer backup dos convites expirados
  INSERT INTO public.invite_backups (
    original_invite_id, email, backup_data, backup_reason
  )
  SELECT 
    id, email, to_jsonb(invites.*), 'expired_cleanup'
  FROM public.invites
  WHERE expires_at < now() AND used_at IS NULL;
  
  GET DIAGNOSTICS backup_count = ROW_COUNT;
  
  -- Deletar convites expirados
  DELETE FROM public.invites
  WHERE expires_at < now() AND used_at IS NULL;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN jsonb_build_object(
    'success', true,
    'deleted_invites', deleted_count,
    'backed_up_invites', backup_count,
    'cleanup_time', now()
  );
END;
$function$;

-- 2. Função: cleanup_orphaned_data
CREATE OR REPLACE FUNCTION public.cleanup_orphaned_data()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  orphaned_profiles integer := 0;
  invalid_roles integer := 0;
  duplicate_onboarding integer := 0;
  result jsonb;
BEGIN
  -- Contar perfis órfãos (sem role válido)
  SELECT COUNT(*) INTO orphaned_profiles
  FROM public.profiles p
  WHERE p.role_id IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.user_roles ur WHERE ur.id = p.role_id
  );
  
  -- Contar duplicatas de onboarding
  SELECT COUNT(*) - COUNT(DISTINCT user_id) INTO duplicate_onboarding
  FROM public.onboarding_final;
  
  -- Limpar perfis órfãos atribuindo role padrão
  UPDATE public.profiles
  SET role_id = (
    SELECT id FROM public.user_roles 
    WHERE name IN ('member', 'membro') 
    ORDER BY name LIMIT 1
  )
  WHERE role_id IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.user_roles ur WHERE ur.id = profiles.role_id
  );
  
  GET DIAGNOSTICS invalid_roles = ROW_COUNT;
  
  RETURN jsonb_build_object(
    'orphaned_profiles_found', orphaned_profiles,
    'invalid_roles_fixed', invalid_roles,
    'duplicate_onboarding_found', duplicate_onboarding,
    'cleanup_timestamp', now()
  );
END;
$function$;

-- 3. Função: cleanup_user_auth_state
CREATE OR REPLACE FUNCTION public.cleanup_user_auth_state(target_user_id uuid DEFAULT auth.uid())
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  -- Esta função pode ser usada para limpar estado corrompido
  -- Por agora apenas retorna true, mas pode ser expandida
  RETURN true;
END;
$function$;

-- 4. Função: cleanup_orphaned_sessions
CREATE OR REPLACE FUNCTION public.cleanup_orphaned_sessions()
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  cleaned_count integer := 0;
BEGIN
  -- Esta função pode ser expandida para limpar sessões órfãs
  -- Por agora apenas conta profiles sem role válido
  SELECT COUNT(*) INTO cleaned_count
  FROM public.profiles p
  WHERE p.role_id IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.user_roles ur WHERE ur.id = p.role_id
  );
  
  RETURN cleaned_count;
END;
$function$;

-- 5. Função: complete_onboarding
CREATE OR REPLACE FUNCTION public.complete_onboarding(p_user_id uuid)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  onboarding_record public.onboarding_final;
BEGIN
  -- Buscar registro de onboarding
  SELECT * INTO onboarding_record
  FROM public.onboarding_final
  WHERE user_id = p_user_id;
  
  -- Se não existe registro, retornar erro
  IF onboarding_record.id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Registro de onboarding não encontrado'
    );
  END IF;
  
  -- Se já está completo, retornar sucesso
  IF onboarding_record.is_completed = true THEN
    RETURN json_build_object(
      'success', true,
      'message', 'Onboarding já estava completo',
      'already_completed', true
    );
  END IF;
  
  -- Marcar como completo
  UPDATE public.onboarding_final
  SET 
    is_completed = true,
    completed_at = now(),
    current_step = 7,
    completed_steps = ARRAY[1,2,3,4,5,6],
    updated_at = now()
  WHERE user_id = p_user_id;
  
  -- Atualizar perfil
  UPDATE public.profiles
  SET 
    onboarding_completed = true,
    onboarding_completed_at = now(),
    name = COALESCE(onboarding_record.personal_info->>'name', name),
    company_name = COALESCE(onboarding_record.business_info->>'company_name', company_name),
    industry = COALESCE(onboarding_record.business_info->>'company_sector', industry)
  WHERE id = p_user_id;
  
  RETURN json_build_object(
    'success', true,
    'message', 'Onboarding completado com sucesso'
  );
END;
$function$;

-- Log da correção de segurança
INSERT INTO public.audit_logs (
  event_type,
  action,
  details,
  user_id
) VALUES (
  'security_enhancement',
  'phase_3_function_security_fixes',
  '{"message": "FASE 3 - Funções críticas corrigidas com search_path seguro", "functions_fixed": ["cleanup_expired_invites_enhanced", "cleanup_orphaned_data", "cleanup_user_auth_state", "cleanup_orphaned_sessions", "complete_onboarding"], "timestamp": "' || now() || '"}'::jsonb,
  auth.uid()
);