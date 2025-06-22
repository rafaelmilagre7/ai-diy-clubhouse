
-- Correção da função admin_force_delete_auth_user para incluir todas as tabelas com foreign keys
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
  operation_timestamp timestamp := now();
BEGIN
  -- Buscar o ID do usuário pelo email
  SELECT au.id INTO target_user_id
  FROM auth.users au
  WHERE au.email = user_email;
  
  IF target_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Usuário não encontrado com email: ' || user_email,
      'details', jsonb_build_object(
        'backup_records', 0,
        'affected_tables', '{}',
        'auth_user_deleted', false,
        'error_count', 1,
        'error_messages', ARRAY['Usuário não encontrado'],
        'operation_timestamp', operation_timestamp
      )
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
      'force_delete_auth_user',
      jsonb_build_object(
        'auth_user_data', (SELECT row_to_json(au) FROM auth.users au WHERE au.id = target_user_id),
        'cleanup_timestamp', operation_timestamp,
        'cleanup_email', user_email,
        'force_delete', true
      );
    
    GET DIAGNOSTICS backup_count = ROW_COUNT;
  EXCEPTION
    WHEN OTHERS THEN
      error_count := error_count + 1;
      error_messages := array_append(error_messages, 'Erro no backup: ' || SQLERRM);
  END;
  
  -- FASE 2: Limpeza completa de TODAS as tabelas com foreign keys (ordem específica)
  
  -- 2.1: Tabelas que referenciam user_id diretamente
  BEGIN
    DELETE FROM public.benefit_clicks WHERE user_id = target_user_id;
    affected_tables := array_append(affected_tables, 'benefit_clicks');
  EXCEPTION
    WHEN OTHERS THEN
      error_count := error_count + 1;
      error_messages := array_append(error_messages, 'Erro ao limpar benefit_clicks: ' || SQLERRM);
  END;

  BEGIN
    DELETE FROM public.onboarding_sync WHERE user_id = target_user_id;
    affected_tables := array_append(affected_tables, 'onboarding_sync');
  EXCEPTION
    WHEN OTHERS THEN
      error_count := error_count + 1;
      error_messages := array_append(error_messages, 'Erro ao limpar onboarding_sync: ' || SQLERRM);
  END;

  BEGIN
    DELETE FROM public.user_onboarding WHERE user_id = target_user_id;
    affected_tables := array_append(affected_tables, 'user_onboarding');
  EXCEPTION
    WHEN OTHERS THEN
      error_count := error_count + 1;
      error_messages := array_append(error_messages, 'Erro ao limpar user_onboarding: ' || SQLERRM);
  END;

  BEGIN
    DELETE FROM public.onboarding_final WHERE user_id = target_user_id;
    affected_tables := array_append(affected_tables, 'onboarding_final');
  EXCEPTION
    WHEN OTHERS THEN
      error_count := error_count + 1;
      error_messages := array_append(error_messages, 'Erro ao limpar onboarding_final: ' || SQLERRM);
  END;

  BEGIN
    DELETE FROM public.implementation_trails WHERE user_id = target_user_id;
    affected_tables := array_append(affected_tables, 'implementation_trails');
  EXCEPTION
    WHEN OTHERS THEN
      error_count := error_count + 1;
      error_messages := array_append(error_messages, 'Erro ao limpar implementation_trails: ' || SQLERRM);
  END;

  BEGIN
    DELETE FROM public.analytics WHERE user_id = target_user_id;
    affected_tables := array_append(affected_tables, 'analytics');
  EXCEPTION
    WHEN OTHERS THEN
      error_count := error_count + 1;
      error_messages := array_append(error_messages, 'Erro ao limpar analytics: ' || SQLERRM);
  END;

  BEGIN
    DELETE FROM public.notifications WHERE user_id = target_user_id;
    affected_tables := array_append(affected_tables, 'notifications');
  EXCEPTION
    WHEN OTHERS THEN
      error_count := error_count + 1;
      error_messages := array_append(error_messages, 'Erro ao limpar notifications: ' || SQLERRM);
  END;

  BEGIN
    DELETE FROM public.progress WHERE user_id = target_user_id;
    affected_tables := array_append(affected_tables, 'progress');
  EXCEPTION
    WHEN OTHERS THEN
      error_count := error_count + 1;
      error_messages := array_append(error_messages, 'Erro ao limpar progress: ' || SQLERRM);
  END;

  BEGIN
    DELETE FROM public.learning_progress WHERE user_id = target_user_id;
    affected_tables := array_append(affected_tables, 'learning_progress');
  EXCEPTION
    WHEN OTHERS THEN
      error_count := error_count + 1;
      error_messages := array_append(error_messages, 'Erro ao limpar learning_progress: ' || SQLERRM);
  END;

  BEGIN
    DELETE FROM public.forum_posts WHERE user_id = target_user_id;
    affected_tables := array_append(affected_tables, 'forum_posts');
  EXCEPTION
    WHEN OTHERS THEN
      error_count := error_count + 1;
      error_messages := array_append(error_messages, 'Erro ao limpar forum_posts: ' || SQLERRM);
  END;

  BEGIN
    DELETE FROM public.forum_topics WHERE user_id = target_user_id;
    affected_tables := array_append(affected_tables, 'forum_topics');
  EXCEPTION
    WHEN OTHERS THEN
      error_count := error_count + 1;
      error_messages := array_append(error_messages, 'Erro ao limpar forum_topics: ' || SQLERRM);
  END;

  BEGIN
    DELETE FROM public.solution_comments WHERE user_id = target_user_id;
    affected_tables := array_append(affected_tables, 'solution_comments');
  EXCEPTION
    WHEN OTHERS THEN
      error_count := error_count + 1;
      error_messages := array_append(error_messages, 'Erro ao limpar solution_comments: ' || SQLERRM);
  END;

  -- 2.2: Tabelas que podem ter outras foreign keys
  BEGIN
    DELETE FROM public.audit_logs WHERE user_id = target_user_id;
    affected_tables := array_append(affected_tables, 'audit_logs');
  EXCEPTION
    WHEN OTHERS THEN
      error_count := error_count + 1;
      error_messages := array_append(error_messages, 'Erro ao limpar audit_logs: ' || SQLERRM);
  END;

  BEGIN
    DELETE FROM public.permission_audit_logs WHERE user_id = target_user_id OR target_user_id = target_user_id;
    affected_tables := array_append(affected_tables, 'permission_audit_logs');
  EXCEPTION
    WHEN OTHERS THEN
      error_count := error_count + 1;
      error_messages := array_append(error_messages, 'Erro ao limpar permission_audit_logs: ' || SQLERRM);
  END;

  -- 2.3: Tabela profiles (deve ser uma das últimas)
  BEGIN
    DELETE FROM public.profiles WHERE id = target_user_id;
    affected_tables := array_append(affected_tables, 'profiles');
  EXCEPTION
    WHEN OTHERS THEN
      error_count := error_count + 1;
      error_messages := array_append(error_messages, 'Erro ao limpar profiles: ' || SQLERRM);
  END;
  
  -- FASE 3: Marcar convites relacionados como não utilizados
  BEGIN
    UPDATE public.invites 
    SET used_at = NULL, send_attempts = 0, last_sent_at = NULL
    WHERE email = user_email;
    affected_tables := array_append(affected_tables, 'invites');
  EXCEPTION
    WHEN OTHERS THEN
      error_count := error_count + 1;
      error_messages := array_append(error_messages, 'Erro ao resetar invites: ' || SQLERRM);
  END;
  
  -- FASE 4: EXCLUSÃO FINAL da auth.users
  BEGIN
    DELETE FROM auth.users WHERE id = target_user_id;
    affected_tables := array_append(affected_tables, 'auth.users');
    
    -- Se chegou aqui, a exclusão foi bem-sucedida
    RETURN jsonb_build_object(
      'success', true,
      'message', format('Usuário %s COMPLETAMENTE removido do sistema', user_email),
      'details', jsonb_build_object(
        'backup_records', backup_count,
        'affected_tables', affected_tables,
        'auth_user_deleted', true,
        'error_count', error_count,
        'error_messages', error_messages,
        'operation_timestamp', operation_timestamp
      )
    );
    
  EXCEPTION
    WHEN OTHERS THEN
      error_count := error_count + 1;
      error_messages := array_append(error_messages, 'ERRO CRÍTICO ao deletar auth.users: ' || SQLERRM);
      
      RETURN jsonb_build_object(
        'success', false,
        'message', format('Falha crítica: usuário NÃO foi removido da auth.users'),
        'details', jsonb_build_object(
          'backup_records', backup_count,
          'affected_tables', affected_tables,
          'auth_user_deleted', false,
          'error_count', error_count,
          'error_messages', error_messages,
          'operation_timestamp', operation_timestamp
        )
      );
  END;
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Erro inesperado na exclusão completa: ' || SQLERRM,
      'details', jsonb_build_object(
        'backup_records', backup_count,
        'affected_tables', affected_tables,
        'auth_user_deleted', false,
        'error_count', error_count + 1,
        'error_messages', array_append(error_messages, 'Erro inesperado: ' || SQLERRM),
        'operation_timestamp', operation_timestamp
      )
    );
END;
$$;

-- Comentário da função
COMMENT ON FUNCTION admin_force_delete_auth_user IS 'Função para exclusão COMPLETA e IRREVERSÍVEL de usuário incluindo auth.users - CORRIGIDA para incluir benefit_clicks e outras foreign keys';
