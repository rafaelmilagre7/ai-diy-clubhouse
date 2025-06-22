
-- Melhorar a função admin_reset_user para preparar para limpeza completa
CREATE OR REPLACE FUNCTION admin_complete_user_cleanup(user_email text)
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
  
  -- FASE 1: Backup completo dos dados existentes
  INSERT INTO public.onboarding_backups (
    user_id,
    onboarding_data,
    profiles_data,
    backup_type,
    additional_data
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
    'complete_cleanup',
    jsonb_build_object(
      'auth_user_data', (SELECT row_to_json(au) FROM auth.users au WHERE au.id = target_user_id),
      'cleanup_timestamp', now(),
      'cleanup_email', user_email
    );
  
  GET DIAGNOSTICS backup_count = ROW_COUNT;
  
  -- FASE 2: Limpeza completa de todas as tabelas públicas
  DELETE FROM public.onboarding_sync WHERE user_id = target_user_id;
  DELETE FROM public.user_onboarding WHERE user_id = target_user_id;
  DELETE FROM public.onboarding_final WHERE user_id = target_user_id;
  DELETE FROM public.implementation_trails WHERE user_id = target_user_id;
  DELETE FROM public.analytics WHERE user_id = target_user_id;
  DELETE FROM public.notifications WHERE user_id = target_user_id;
  DELETE FROM public.progress WHERE user_id = target_user_id;
  DELETE FROM public.learning_progress WHERE user_id = target_user_id;
  DELETE FROM public.forum_posts WHERE user_id = target_user_id;
  DELETE FROM public.forum_topics WHERE user_id = target_user_id;
  DELETE FROM public.solution_comments WHERE user_id = target_user_id;
  DELETE FROM public.profiles WHERE id = target_user_id;
  
  -- FASE 3: Marcar convites relacionados como não utilizados
  UPDATE public.invites 
  SET used_at = NULL, send_attempts = 0, last_sent_at = NULL
  WHERE email = user_email;
  
  -- FASE 4: Log da operação
  INSERT INTO public.audit_logs (
    user_id,
    event_type,
    action,
    resource_id,
    details
  ) VALUES (
    auth.uid(),
    'admin_action',
    'complete_user_cleanup',
    target_user_id::text,
    jsonb_build_object(
      'target_email', user_email,
      'target_user_id', target_user_id,
      'backup_records', backup_count,
      'cleanup_timestamp', now(),
      'cleanup_type', 'complete'
    )
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Dados públicos limpos com sucesso. Auth user será removido via Edge Function.',
    'backup_records', backup_count,
    'user_id', target_user_id,
    'cleanup_timestamp', now(),
    'requires_auth_deletion', true
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Erro ao limpar usuário: ' || SQLERRM
    );
END;
$$;

-- Comentário da função
COMMENT ON FUNCTION admin_complete_user_cleanup IS 'Função para limpeza completa de usuário - prepara para exclusão da auth.users via Edge Function';

-- Adicionar coluna para dados adicionais no backup se não existir
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'onboarding_backups' AND column_name = 'additional_data') THEN
    ALTER TABLE public.onboarding_backups ADD COLUMN additional_data jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;
