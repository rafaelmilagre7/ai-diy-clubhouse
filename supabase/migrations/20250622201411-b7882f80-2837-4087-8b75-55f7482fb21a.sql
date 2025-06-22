
-- Função para exclusão completa e definitiva de usuário incluindo auth.users
CREATE OR REPLACE FUNCTION admin_force_delete_auth_user(user_email text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_user_id uuid;
  backup_count integer := 0;
  affected_tables text[] := '{}';
  error_count integer := 0;
  error_messages text[] := '{}';
  auth_deleted boolean := false;
BEGIN
  -- VALIDAÇÃO: Verificar se o usuário atual é admin
  IF NOT public.is_user_admin(auth.uid()) THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Acesso negado: apenas administradores podem executar esta operação',
      'error_code', 'ACCESS_DENIED'
    );
  END IF;

  -- VALIDAÇÃO: Verificar se não está tentando deletar a si mesmo
  IF EXISTS (
    SELECT 1 FROM auth.users au 
    JOIN public.profiles p ON au.id = p.id 
    WHERE au.email = user_email AND p.id = auth.uid()
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Erro: não é possível deletar seu próprio usuário',
      'error_code', 'SELF_DELETE_DENIED'
    );
  END IF;

  -- Buscar o ID do usuário pelo email na tabela auth.users
  SELECT au.id INTO target_user_id
  FROM auth.users au
  WHERE au.email = user_email;
  
  IF target_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Usuário não encontrado com email: ' || user_email,
      'error_code', 'USER_NOT_FOUND'
    );
  END IF;

  -- VALIDAÇÃO: Verificar se não está tentando deletar outro admin
  IF EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = target_user_id AND ur.name = 'admin'
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Erro: não é possível deletar outros administradores',
      'error_code', 'ADMIN_DELETE_DENIED'
    );
  END IF;
  
  -- FASE 1: Backup completo dos dados existentes
  BEGIN
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
      'force_delete_complete',
      jsonb_build_object(
        'auth_user_data', (SELECT row_to_json(au) FROM auth.users au WHERE au.id = target_user_id),
        'force_delete_timestamp', now(),
        'force_delete_email', user_email,
        'deleted_by_admin', auth.uid()
      );
    
    GET DIAGNOSTICS backup_count = ROW_COUNT;
    
  EXCEPTION
    WHEN OTHERS THEN
      error_messages := array_append(error_messages, 'Erro no backup: ' || SQLERRM);
      error_count := error_count + 1;
  END;
  
  -- FASE 2: Limpeza completa de todas as tabelas públicas (em ordem de dependências)
  BEGIN
    DELETE FROM public.onboarding_sync WHERE user_id = target_user_id;
    affected_tables := array_append(affected_tables, 'onboarding_sync');
  EXCEPTION
    WHEN OTHERS THEN
      error_messages := array_append(error_messages, 'Erro ao limpar onboarding_sync: ' || SQLERRM);
      error_count := error_count + 1;
  END;

  BEGIN
    DELETE FROM public.user_onboarding WHERE user_id = target_user_id;
    affected_tables := array_append(affected_tables, 'user_onboarding');
  EXCEPTION
    WHEN OTHERS THEN
      error_messages := array_append(error_messages, 'Erro ao limpar user_onboarding: ' || SQLERRM);
      error_count := error_count + 1;
  END;

  BEGIN
    DELETE FROM public.onboarding_final WHERE user_id = target_user_id;
    affected_tables := array_append(affected_tables, 'onboarding_final');
  EXCEPTION
    WHEN OTHERS THEN
      error_messages := array_append(error_messages, 'Erro ao limpar onboarding_final: ' || SQLERRM);
      error_count := error_count + 1;
  END;

  BEGIN
    DELETE FROM public.implementation_trails WHERE user_id = target_user_id;
    affected_tables := array_append(affected_tables, 'implementation_trails');
  EXCEPTION
    WHEN OTHERS THEN
      error_messages := array_append(error_messages, 'Erro ao limpar implementation_trails: ' || SQLERRM);
      error_count := error_count + 1;
  END;

  BEGIN
    DELETE FROM public.analytics WHERE user_id = target_user_id;
    affected_tables := array_append(affected_tables, 'analytics');
  EXCEPTION
    WHEN OTHERS THEN
      error_messages := array_append(error_messages, 'Erro ao limpar analytics: ' || SQLERRM);
      error_count := error_count + 1;
  END;

  BEGIN
    DELETE FROM public.notifications WHERE user_id = target_user_id;
    affected_tables := array_append(affected_tables, 'notifications');
  EXCEPTION
    WHEN OTHERS THEN
      error_messages := array_append(error_messages, 'Erro ao limpar notifications: ' || SQLERRM);
      error_count := error_count + 1;
  END;

  BEGIN
    DELETE FROM public.progress WHERE user_id = target_user_id;
    affected_tables := array_append(affected_tables, 'progress');
  EXCEPTION
    WHEN OTHERS THEN
      error_messages := array_append(error_messages, 'Erro ao limpar progress: ' || SQLERRM);
      error_count := error_count + 1;
  END;

  BEGIN
    DELETE FROM public.learning_progress WHERE user_id = target_user_id;
    affected_tables := array_append(affected_tables, 'learning_progress');
  EXCEPTION
    WHEN OTHERS THEN
      error_messages := array_append(error_messages, 'Erro ao limpar learning_progress: ' || SQLERRM);
      error_count := error_count + 1;
  END;

  BEGIN
    DELETE FROM public.forum_posts WHERE user_id = target_user_id;
    affected_tables := array_append(affected_tables, 'forum_posts');
  EXCEPTION
    WHEN OTHERS THEN
      error_messages := array_append(error_messages, 'Erro ao limpar forum_posts: ' || SQLERRM);
      error_count := error_count + 1;
  END;

  BEGIN
    DELETE FROM public.forum_topics WHERE user_id = target_user_id;
    affected_tables := array_append(affected_tables, 'forum_topics');
  EXCEPTION
    WHEN OTHERS THEN
      error_messages := array_append(error_messages, 'Erro ao limpar forum_topics: ' || SQLERRM);
      error_count := error_count + 1;
  END;

  BEGIN
    DELETE FROM public.solution_comments WHERE user_id = target_user_id;
    affected_tables := array_append(affected_tables, 'solution_comments');
  EXCEPTION
    WHEN OTHERS THEN
      error_messages := array_append(error_messages, 'Erro ao limpar solution_comments: ' || SQLERRM);
      error_count := error_count + 1;
  END;

  BEGIN
    DELETE FROM public.profiles WHERE id = target_user_id;
    affected_tables := array_append(affected_tables, 'profiles');
  EXCEPTION
    WHEN OTHERS THEN
      error_messages := array_append(error_messages, 'Erro ao limpar profiles: ' || SQLERRM);
      error_count := error_count + 1;
  END;
  
  -- FASE 3: Limpar convites relacionados (marcar como não utilizados)
  BEGIN
    UPDATE public.invites 
    SET used_at = NULL, send_attempts = 0, last_sent_at = NULL
    WHERE email = user_email;
    affected_tables := array_append(affected_tables, 'invites');
  EXCEPTION
    WHEN OTHERS THEN
      error_messages := array_append(error_messages, 'Erro ao limpar invites: ' || SQLERRM);
      error_count := error_count + 1;
  END;
  
  -- FASE 4: EXCLUSÃO CRÍTICA - Remover da auth.users via SQL direto
  BEGIN
    DELETE FROM auth.users WHERE id = target_user_id;
    auth_deleted := true;
    affected_tables := array_append(affected_tables, 'auth.users');
  EXCEPTION
    WHEN OTHERS THEN
      error_messages := array_append(error_messages, 'ERRO CRÍTICO ao deletar auth.users: ' || SQLERRM);
      error_count := error_count + 1;
      auth_deleted := false;
  END;
  
  -- FASE 5: Log da operação completa
  BEGIN
    INSERT INTO public.audit_logs (
      user_id,
      event_type,
      action,
      resource_id,
      details
    ) VALUES (
      auth.uid(),
      'admin_critical_action',
      'force_delete_complete_user',
      target_user_id::text,
      jsonb_build_object(
        'target_email', user_email,
        'target_user_id', target_user_id,
        'backup_records', backup_count,
        'affected_tables', affected_tables,
        'auth_user_deleted', auth_deleted,
        'error_count', error_count,
        'error_messages', error_messages,
        'force_delete_timestamp', now(),
        'force_delete_type', 'complete_with_auth'
      )
    );
  EXCEPTION
    WHEN OTHERS THEN
      -- Log de auditoria é crítico, mas não deve falhar a operação
      NULL;
  END;
  
  -- RESULTADO FINAL
  RETURN jsonb_build_object(
    'success', (error_count = 0 AND auth_deleted),
    'message', CASE 
      WHEN error_count = 0 AND auth_deleted THEN 
        'Usuário ' || user_email || ' completamente removido do sistema (incluindo auth.users)'
      WHEN auth_deleted AND error_count > 0 THEN
        'Usuário removido da auth.users mas com ' || error_count || ' erro(s) em tabelas públicas'
      ELSE
        'Falha crítica: usuário NÃO foi removido da auth.users'
    END,
    'details', jsonb_build_object(
      'backup_records', backup_count,
      'affected_tables', affected_tables,
      'auth_user_deleted', auth_deleted,
      'error_count', error_count,
      'error_messages', error_messages,
      'operation_timestamp', now()
    )
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Erro crítico na operação de exclusão: ' || SQLERRM,
      'details', jsonb_build_object(
        'backup_records', backup_count,
        'affected_tables', affected_tables,
        'auth_user_deleted', false,
        'error_count', error_count + 1,
        'error_messages', array_append(error_messages, 'Erro crítico: ' || SQLERRM),
        'operation_timestamp', now()
      )
    );
END;
$$;

-- Comentário da função
COMMENT ON FUNCTION admin_force_delete_auth_user IS 'Função CRÍTICA para exclusão completa de usuário incluindo auth.users - USO APENAS EM EMERGÊNCIAS';
