
-- Corrigir função admin_force_delete_auth_user com todas as correções necessárias
CREATE OR REPLACE FUNCTION admin_force_delete_auth_user(user_email text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_user_id uuid;
  backup_count integer := 0;
  total_deleted integer := 0;
  affected_tables text[] := '{}';
  error_count integer := 0;
  error_messages text[] := '{}';
  operation_start timestamp := now();
  table_name text;
  delete_count integer;
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
        'operation_timestamp', operation_start,
        'total_records_deleted', 0
      )
    );
  END IF;
  
  -- BACKUP COMPLETO antes da exclusão
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
        (SELECT row_to_json(of) FROM public.onboarding_final of WHERE of.user_id = target_user_id),
        '{}'::json
      )::jsonb,
      COALESCE(
        (SELECT row_to_json(p) FROM public.profiles p WHERE p.id = target_user_id),
        '{}'::json
      )::jsonb,
      'force_delete_total',
      jsonb_build_object(
        'auth_user_data', (SELECT row_to_json(au) FROM auth.users au WHERE au.id = target_user_id),
        'cleanup_timestamp', operation_start,
        'cleanup_email', user_email,
        'cleanup_type', 'complete_force_deletion'
      );
    
    GET DIAGNOSTICS backup_count = ROW_COUNT;
    RAISE NOTICE 'Backup criado: % registros', backup_count;
  EXCEPTION
    WHEN OTHERS THEN
      error_count := error_count + 1;
      error_messages := array_append(error_messages, 'Erro no backup: ' || SQLERRM);
      RAISE NOTICE 'Erro no backup: %', SQLERRM;
  END;

  -- FASE 1: CRÍTICO - Limpar security_logs primeiro (impede exclusão de auth.users)
  BEGIN
    DELETE FROM public.security_logs WHERE user_id = target_user_id;
    GET DIAGNOSTICS delete_count = ROW_COUNT;
    IF delete_count > 0 THEN
      total_deleted := total_deleted + delete_count;
      affected_tables := array_append(affected_tables, 'security_logs');
      RAISE NOTICE 'security_logs: % registros removidos', delete_count;
    END IF;
  EXCEPTION
    WHEN OTHERS THEN
      error_count := error_count + 1;
      error_messages := array_append(error_messages, 'security_logs: ' || SQLERRM);
      RAISE NOTICE 'Erro em security_logs: %', SQLERRM;
  END;

  -- FASE 2: Tabelas com relacionamentos indiretos (via invite_id)
  
  -- Limpar invite_deliveries via convites do usuário
  BEGIN
    DELETE FROM public.invite_deliveries 
    WHERE invite_id IN (SELECT id FROM public.invites WHERE email = user_email);
    GET DIAGNOSTICS delete_count = ROW_COUNT;
    IF delete_count > 0 THEN
      total_deleted := total_deleted + delete_count;
      affected_tables := array_append(affected_tables, 'invite_deliveries');
      RAISE NOTICE 'invite_deliveries: % registros removidos', delete_count;
    END IF;
  EXCEPTION
    WHEN OTHERS THEN
      error_count := error_count + 1;
      error_messages := array_append(error_messages, 'invite_deliveries: ' || SQLERRM);
      RAISE NOTICE 'Erro em invite_deliveries: %', SQLERRM;
  END;

  -- Limpar email_queue via convites do usuário
  BEGIN
    DELETE FROM public.email_queue 
    WHERE invite_id IN (SELECT id FROM public.invites WHERE email = user_email);
    GET DIAGNOSTICS delete_count = ROW_COUNT;
    IF delete_count > 0 THEN
      total_deleted := total_deleted + delete_count;
      affected_tables := array_append(affected_tables, 'email_queue');
      RAISE NOTICE 'email_queue: % registros removidos', delete_count;
    END IF;
  EXCEPTION
    WHEN OTHERS THEN
      error_count := error_count + 1;
      error_messages := array_append(error_messages, 'email_queue: ' || SQLERRM);
      RAISE NOTICE 'Erro em email_queue: %', SQLERRM;
  END;

  -- Limpar admin_communications criadas pelo usuário
  BEGIN
    DELETE FROM public.admin_communications WHERE created_by = target_user_id;
    GET DIAGNOSTICS delete_count = ROW_COUNT;
    IF delete_count > 0 THEN
      total_deleted := total_deleted + delete_count;
      affected_tables := array_append(affected_tables, 'admin_communications');
      RAISE NOTICE 'admin_communications: % registros removidos', delete_count;
    END IF;
  EXCEPTION
    WHEN OTHERS THEN
      error_count := error_count + 1;
      error_messages := array_append(error_messages, 'admin_communications: ' || SQLERRM);
      RAISE NOTICE 'Erro em admin_communications: %', SQLERRM;
  END;

  -- FASE 3: Limpeza de todas as outras tabelas (com correções de ambiguidade)
  
  -- Lista de tabelas para limpeza direta por user_id
  FOR table_name IN 
    SELECT unnest(ARRAY[
      'onboarding_sync', 'user_onboarding', 'onboarding_final', 'onboarding_users',
      'implementation_trails', 'implementation_profiles', 'analytics', 'notifications',
      'progress', 'learning_progress', 'learning_certificates', 'learning_comments',
      'learning_comment_likes', 'learning_lesson_nps', 'forum_posts', 'forum_topics',
      'forum_reactions', 'forum_mentions', 'forum_notifications', 'solution_comments',
      'suggestion_votes', 'suggestions', 'benefit_clicks', 'member_connections',
      'connection_notifications', 'connection_recommendations', 'direct_messages',
      'networking_preferences', 'network_connections', 'network_matches',
      'communication_preferences', 'notification_preferences', 'community_reports',
      'implementation_checkpoints', 'badges', 'user_badges', 'referrals'
    ])
  LOOP
    BEGIN
      EXECUTE format('DELETE FROM public.%I WHERE user_id = $1', table_name) USING target_user_id;
      GET DIAGNOSTICS delete_count = ROW_COUNT;
      IF delete_count > 0 THEN
        total_deleted := total_deleted + delete_count;
        affected_tables := array_append(affected_tables, table_name);
        RAISE NOTICE '%: % registros removidos', table_name, delete_count;
      END IF;
    EXCEPTION
      WHEN OTHERS THEN
        error_count := error_count + 1;
        error_messages := array_append(error_messages, table_name || ': ' || SQLERRM);
        RAISE NOTICE 'Erro em %: %', table_name, SQLERRM;
    END;
  END LOOP;

  -- Tabelas com colunas específicas (com correção de ambiguidade)
  
  -- moderation_actions (correção de ambiguidade com alias)
  BEGIN
    DELETE FROM public.moderation_actions ma WHERE ma.target_user_id = target_user_id;
    GET DIAGNOSTICS delete_count = ROW_COUNT;
    IF delete_count > 0 THEN
      total_deleted := total_deleted + delete_count;
      affected_tables := array_append(affected_tables, 'moderation_actions');
      RAISE NOTICE 'moderation_actions: % registros removidos', delete_count;
    END IF;
  EXCEPTION
    WHEN OTHERS THEN
      error_count := error_count + 1;
      error_messages := array_append(error_messages, 'moderation_actions: ' || SQLERRM);
      RAISE NOTICE 'Erro em moderation_actions: %', SQLERRM;
  END;

  -- permission_audit_logs (correção de ambiguidade)
  BEGIN
    DELETE FROM public.permission_audit_logs pal WHERE pal.target_user_id = target_user_id;
    GET DIAGNOSTICS delete_count = ROW_COUNT;
    IF delete_count > 0 THEN
      total_deleted := total_deleted + delete_count;
      affected_tables := array_append(affected_tables, 'permission_audit_logs');
      RAISE NOTICE 'permission_audit_logs: % registros removidos', delete_count;
    END IF;
  EXCEPTION
    WHEN OTHERS THEN
      error_count := error_count + 1;
      error_messages := array_append(error_messages, 'permission_audit_logs: ' || SQLERRM);
      RAISE NOTICE 'Erro em permission_audit_logs: %', SQLERRM;
  END;

  -- Outras tabelas com colunas específicas
  FOR table_name IN 
    SELECT unnest(ARRAY[
      'sender_id:direct_messages', 'recipient_id:direct_messages',
      'requester_id:member_connections', 'recipient_id:member_connections',
      'requester_id:network_connections', 'recipient_id:network_connections',
      'matched_user_id:network_matches', 'reported_user_id:community_reports',
      'moderator_id:moderation_actions', 'created_by:events'
    ])
  LOOP
    BEGIN
      EXECUTE format('DELETE FROM public.%s WHERE %s = $1', 
        split_part(table_name, ':', 2), 
        split_part(table_name, ':', 1)
      ) USING target_user_id;
      GET DIAGNOSTICS delete_count = ROW_COUNT;
      IF delete_count > 0 THEN
        total_deleted := total_deleted + delete_count;
        affected_tables := array_append(affected_tables, split_part(table_name, ':', 2));
        RAISE NOTICE '%: % registros removidos via %', split_part(table_name, ':', 2), delete_count, split_part(table_name, ':', 1);
      END IF;
    EXCEPTION
      WHEN OTHERS THEN
        error_count := error_count + 1;
        error_messages := array_append(error_messages, split_part(table_name, ':', 2) || ' (' || split_part(table_name, ':', 1) || '): ' || SQLERRM);
        RAISE NOTICE 'Erro em % via %: %', split_part(table_name, ':', 2), split_part(table_name, ':', 1), SQLERRM;
    END;
  END LOOP;

  -- FASE 4: Limpar convites relacionados ao email
  BEGIN
    UPDATE public.invites 
    SET used_at = NULL, send_attempts = 0, last_sent_at = NULL
    WHERE email = user_email;
    GET DIAGNOSTICS delete_count = ROW_COUNT;
    IF delete_count > 0 THEN
      total_deleted := total_deleted + delete_count;
      affected_tables := array_append(affected_tables, 'invites_reset');
      RAISE NOTICE 'invites: % registros liberados', delete_count;
    END IF;
  EXCEPTION
    WHEN OTHERS THEN
      error_count := error_count + 1;
      error_messages := array_append(error_messages, 'invites: ' || SQLERRM);
      RAISE NOTICE 'Erro em invites: %', SQLERRM;
  END;

  -- FASE 5: Remover profiles
  BEGIN
    DELETE FROM public.profiles WHERE id = target_user_id;
    GET DIAGNOSTICS delete_count = ROW_COUNT;
    IF delete_count > 0 THEN
      total_deleted := total_deleted + delete_count;
      affected_tables := array_append(affected_tables, 'profiles');
      RAISE NOTICE 'profiles: % registros removidos', delete_count;
    END IF;
  EXCEPTION
    WHEN OTHERS THEN
      error_count := error_count + 1;
      error_messages := array_append(error_messages, 'profiles: ' || SQLERRM);
      RAISE NOTICE 'Erro em profiles: %', SQLERRM;
  END;

  -- FASE 6: FINAL - Remover da auth.users (agora deve funcionar)
  BEGIN
    DELETE FROM auth.users WHERE id = target_user_id;
    GET DIAGNOSTICS delete_count = ROW_COUNT;
    IF delete_count > 0 THEN
      total_deleted := total_deleted + delete_count;
      affected_tables := array_append(affected_tables, 'auth.users');
      RAISE NOTICE 'auth.users: USUÁRIO REMOVIDO DEFINITIVAMENTE';
      
      -- Log de auditoria da exclusão total
      INSERT INTO public.audit_logs (
        user_id,
        event_type,
        action,
        resource_id,
        details
      ) VALUES (
        NULL, -- Usuário não existe mais
        'admin_action',
        'force_delete_auth_user_complete',
        target_user_id::text,
        jsonb_build_object(
          'target_email', user_email,
          'target_user_id', target_user_id,
          'backup_records', backup_count,
          'total_records_deleted', total_deleted,
          'affected_tables', affected_tables,
          'error_count', error_count,
          'error_messages', error_messages,
          'operation_timestamp', operation_start,
          'operation_duration_ms', EXTRACT(EPOCH FROM (now() - operation_start)) * 1000,
          'deletion_type', 'force_total_irreversible'
        )
      );
      
      RETURN jsonb_build_object(
        'success', true,
        'message', 'Usuário COMPLETAMENTE removido do sistema - email liberado para novos convites',
        'details', jsonb_build_object(
          'backup_records', backup_count,
          'affected_tables', affected_tables,
          'auth_user_deleted', true,
          'error_count', error_count,
          'error_messages', error_messages,
          'operation_timestamp', operation_start,
          'total_records_deleted', total_deleted
        )
      );
    ELSE
      error_count := error_count + 1;
      error_messages := array_append(error_messages, 'auth.users: Nenhum registro removido - usuário pode não existir');
      RAISE NOTICE 'FALHA CRÍTICA: auth.users não foi removido';
    END IF;
  EXCEPTION
    WHEN OTHERS THEN
      error_count := error_count + 1;
      error_messages := array_append(error_messages, 'auth.users: ' || SQLERRM);
      RAISE NOTICE 'FALHA CRÍTICA em auth.users: %', SQLERRM;
  END;

  -- Se chegou aqui, houve falha na exclusão de auth.users
  RETURN jsonb_build_object(
    'success', false,
    'message', 'FALHA CRÍTICA: usuário ' || user_email || ' NÃO foi removido da auth.users',
    'details', jsonb_build_object(
      'backup_records', backup_count,
      'affected_tables', affected_tables,
      'auth_user_deleted', false,
      'error_count', error_count,
      'error_messages', error_messages,
      'operation_timestamp', operation_start,
      'total_records_deleted', total_deleted
    )
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Erro fatal na exclusão total: ' || SQLERRM,
      'details', jsonb_build_object(
        'backup_records', backup_count,
        'affected_tables', affected_tables,
        'auth_user_deleted', false,
        'error_count', error_count + 1,
        'error_messages', array_append(error_messages, 'Erro fatal: ' || SQLERRM),
        'operation_timestamp', operation_start,
        'total_records_deleted', total_deleted
      )
    );
END;
$$;

-- Comentário da função atualizada
COMMENT ON FUNCTION admin_force_delete_auth_user IS 'Função CORRIGIDA para exclusão total irreversível com todas as correções aplicadas';
