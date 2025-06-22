
-- Função para limpeza completa de usuário com backup automático
CREATE OR REPLACE FUNCTION admin_reset_user(user_email text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_user_id uuid;
  backup_count integer := 0;
  result jsonb;
BEGIN
  -- Buscar o ID do usuário pelo email
  SELECT au.id INTO target_user_id
  FROM auth.users au
  WHERE au.email = user_email;
  
  IF target_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Usuário não encontrado com email: ' || user_email
    );
  END IF;
  
  -- FASE 1: Backup dos dados existentes
  INSERT INTO public.onboarding_backups (
    user_id,
    onboarding_data,
    profiles_data,
    backup_type
  )
  SELECT 
    target_user_id,
    COALESCE(
      (SELECT row_to_json(uo) FROM public.user_onboarding uo WHERE uo.user_id = target_user_id),
      (SELECT row_to_json(os) FROM public.onboarding_sync os WHERE os.user_id = target_user_id),
      '{}'::json
    )::jsonb,
    COALESCE(
      (SELECT row_to_json(p) FROM public.profiles p WHERE p.id = target_user_id),
      '{}'::json
    )::jsonb,
    'manual_reset';
  
  GET DIAGNOSTICS backup_count = ROW_COUNT;
  
  -- FASE 2: Limpeza dos dados de onboarding
  DELETE FROM public.onboarding_sync WHERE user_id = target_user_id;
  DELETE FROM public.user_onboarding WHERE user_id = target_user_id;
  DELETE FROM public.onboarding_final WHERE user_id = target_user_id;
  DELETE FROM public.implementation_trails WHERE user_id = target_user_id;
  DELETE FROM public.analytics WHERE user_id = target_user_id;
  DELETE FROM public.notifications WHERE user_id = target_user_id;
  
  -- FASE 3: Limpeza do perfil (mantém o usuário auth para não quebrar referências)
  DELETE FROM public.profiles WHERE id = target_user_id;
  
  -- FASE 4: Marcar convites relacionados como não utilizados (para permitir novo convite)
  UPDATE public.invites 
  SET used_at = NULL 
  WHERE email = user_email AND used_at IS NOT NULL;
  
  -- Log da operação
  INSERT INTO public.audit_logs (
    user_id,
    event_type,
    action,
    resource_id,
    details
  ) VALUES (
    auth.uid(),
    'admin_action',
    'user_reset',
    target_user_id::text,
    jsonb_build_object(
      'target_email', user_email,
      'target_user_id', target_user_id,
      'backup_records', backup_count,
      'reset_timestamp', now()
    )
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Usuário resetado com sucesso',
    'backup_records', backup_count,
    'user_id', target_user_id,
    'reset_timestamp', now()
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Erro ao resetar usuário: ' || SQLERRM
    );
END;
$$;

-- Comentário da função
COMMENT ON FUNCTION admin_reset_user IS 'Função para reset completo de usuário com backup automático dos dados';
