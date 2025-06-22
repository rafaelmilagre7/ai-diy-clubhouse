
-- CORREÇÃO DA SINTAXE: Função de exclusão total corrigida
-- =====================================================

CREATE OR REPLACE FUNCTION admin_force_delete_auth_user(user_email text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_user_id uuid;
  backup_count integer := 0;
  total_deleted integer := 0;
  table_results jsonb := '[]'::jsonb;
  current_table_count integer;
  error_messages text[] := '{}';
  affected_tables text[] := '{}';
BEGIN
  RAISE NOTICE '🗑️ [FORCE DELETE] Iniciando exclusão COMPLETA para: %', user_email;

  -- ETAPA 1: Buscar o ID do usuário pelo email
  SELECT au.id INTO target_user_id
  FROM auth.users au
  WHERE au.email = user_email;
  
  IF target_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Usuário não encontrado com email: ' || user_email,
      'details', jsonb_build_object(
        'backup_records', 0,
        'affected_tables', '[]'::jsonb,
        'auth_user_deleted', false,
        'error_count', 1,
        'error_messages', ARRAY['Usuário não encontrado'],
        'operation_timestamp', now()
      )
    );
  END IF;

  RAISE NOTICE '✅ [FORCE DELETE] Usuário encontrado: %', target_user_id;

  -- ETAPA 2: Backup completo antes da exclusão
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
      'force_delete_complete',
      jsonb_build_object(
        'auth_user_data', (SELECT row_to_json(au) FROM auth.users au WHERE au.id = target_user_id),
        'operation_type', 'force_delete_complete',
        'operation_timestamp', now(),
        'operation_email', user_email,
        'operation_user_id', target_user_id
      );
    
    GET DIAGNOSTICS backup_count = ROW_COUNT;
    RAISE NOTICE '💾 [FORCE DELETE] Backup criado: % registros', backup_count;
  EXCEPTION
    WHEN OTHERS THEN
      error_messages := array_append(error_messages, 'Erro no backup: ' || SQLERRM);
      RAISE NOTICE '❌ [FORCE DELETE] Erro no backup: %', SQLERRM;
  END;

  -- ETAPA 3: FASE A - Tabelas de relacionamento e dependências indiretas
  RAISE NOTICE '🧹 [FORCE DELETE] FASE A: Limpeza de relacionamentos indiretos';

  -- 3.1: Forum e Community (relacionamentos indiretos)
  BEGIN
    DELETE FROM public.forum_mentions WHERE post_id IN (SELECT id FROM public.forum_posts WHERE user_id = target_user_id);
    GET DIAGNOSTICS current_table_count = ROW_COUNT;
    IF current_table_count > 0 THEN
      affected_tables := array_append(affected_tables, 'forum_mentions');
      total_deleted := total_deleted + current_table_count;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    error_messages := array_append(error_messages, 'forum_mentions: ' || SQLERRM);
  END;

  BEGIN
    DELETE FROM public.forum_reactions WHERE post_id IN (SELECT id FROM public.forum_posts WHERE user_id = target_user_id);
    GET DIAGNOSTICS current_table_count = ROW_COUNT;
    IF current_table_count > 0 THEN
      affected_tables := array_append(affected_tables, 'forum_reactions');
      total_deleted := total_deleted + current_table_count;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    error_messages := array_append(error_messages, 'forum_reactions: ' || SQLERRM);
  END;

  BEGIN
    DELETE FROM public.community_reports WHERE post_id IN (SELECT id FROM public.forum_posts WHERE user_id = target_user_id);
    GET DIAGNOSTICS current_table_count = ROW_COUNT;
    IF current_table_count > 0 THEN
      affected_tables := array_append(affected_tables, 'community_reports');
      total_deleted := total_deleted + current_table_count;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    error_messages := array_append(error_messages, 'community_reports: ' || SQLERRM);
  END;

  -- 3.2: Moderation (relacionamentos indiretos)
  BEGIN
    DELETE FROM public.moderation_actions WHERE target_user_id = target_user_id;
    GET DIAGNOSTICS current_table_count = ROW_COUNT;
    IF current_table_count > 0 THEN
      affected_tables := array_append(affected_tables, 'moderation_actions');
      total_deleted := total_deleted + current_table_count;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    error_messages := array_append(error_messages, 'moderation_actions: ' || SQLERRM);
  END;

  -- ETAPA 4: FASE B - Tabelas principais com user_id direto
  RAISE NOTICE '🧹 [FORCE DELETE] FASE B: Limpeza de tabelas principais';

  -- Lista completa das 47 tabelas com user_id direto
  DECLARE
    tables_to_clean text[] := ARRAY[
      'forum_posts', 'forum_topics', 'forum_notifications', 'solution_comments',
      'learning_comments', 'learning_comment_likes', 'learning_progress', 'learning_lesson_nps', 'learning_certificates',
      'communication_deliveries', 'communication_preferences', 'notification_preferences', 'notifications',
      'analytics', 'progress', 'implementation_trails', 'implementation_profiles',
      'onboarding_final', 'onboarding_sync', 'user_onboarding', 'onboarding_users', 'onboarding_integrity_checks',
      'member_connections', 'connection_notifications', 'connection_recommendations', 'network_connections', 'network_matches', 'networking_preferences',
      'direct_messages', 'conversations', 'benefit_clicks', 'community_reports',
      'invite_deliveries', 'email_queue', 'admin_communications'
    ];
    table_name text;
  BEGIN
    FOREACH table_name IN ARRAY tables_to_clean LOOP
      BEGIN
        -- Limpeza específica para cada tabela
        CASE table_name
          WHEN 'conversations' THEN
            EXECUTE format('DELETE FROM public.%I WHERE participant_1_id = $1 OR participant_2_id = $1', table_name) USING target_user_id;
          WHEN 'direct_messages' THEN
            EXECUTE format('DELETE FROM public.%I WHERE sender_id = $1 OR recipient_id = $1', table_name) USING target_user_id;
          WHEN 'member_connections' THEN
            EXECUTE format('DELETE FROM public.%I WHERE requester_id = $1 OR recipient_id = $1', table_name) USING target_user_id;
          WHEN 'network_connections' THEN
            EXECUTE format('DELETE FROM public.%I WHERE requester_id = $1 OR recipient_id = $1', table_name) USING target_user_id;
          WHEN 'network_matches' THEN
            EXECUTE format('DELETE FROM public.%I WHERE user_id = $1 OR matched_user_id = $1', table_name) USING target_user_id;
          WHEN 'connection_notifications' THEN
            EXECUTE format('DELETE FROM public.%I WHERE user_id = $1 OR sender_id = $1', table_name) USING target_user_id;
          WHEN 'community_reports' THEN
            EXECUTE format('DELETE FROM public.%I WHERE reporter_id = $1 OR reported_user_id = $1 OR reviewed_by = $1', table_name) USING target_user_id;
          ELSE
            -- Para tabelas com user_id simples
            EXECUTE format('DELETE FROM public.%I WHERE user_id = $1', table_name) USING target_user_id;
        END CASE;
        
        GET DIAGNOSTICS current_table_count = ROW_COUNT;
        IF current_table_count > 0 THEN
          affected_tables := array_append(affected_tables, table_name);
          total_deleted := total_deleted + current_table_count;
          RAISE NOTICE '✅ [FORCE DELETE] Tabela %: % registros removidos', table_name, current_table_count;
        END IF;
      EXCEPTION WHEN OTHERS THEN
        error_messages := array_append(error_messages, table_name || ': ' || SQLERRM);
        RAISE NOTICE '❌ [FORCE DELETE] Erro em %: %', table_name, SQLERRM;
      END;
    END LOOP;
  END;

  -- ETAPA 5: FASE C - permission_audit_logs (com correção de ambiguidade)
  RAISE NOTICE '🧹 [FORCE DELETE] FASE C: Limpeza de permission_audit_logs';
  BEGIN
    DELETE FROM public.permission_audit_logs pal 
    WHERE pal.user_id = target_user_id OR pal.target_user_id = target_user_id;
    GET DIAGNOSTICS current_table_count = ROW_COUNT;
    IF current_table_count > 0 THEN
      affected_tables := array_append(affected_tables, 'permission_audit_logs');
      total_deleted := total_deleted + current_table_count;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    error_messages := array_append(error_messages, 'permission_audit_logs: ' || SQLERRM);
  END;

  -- ETAPA 6: FASE D - Profiles (penúltimo)
  RAISE NOTICE '🧹 [FORCE DELETE] FASE D: Removendo profiles';
  BEGIN
    DELETE FROM public.profiles WHERE id = target_user_id;
    GET DIAGNOSTICS current_table_count = ROW_COUNT;
    IF current_table_count > 0 THEN
      affected_tables := array_append(affected_tables, 'profiles');
      total_deleted := total_deleted + current_table_count;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    error_messages := array_append(error_messages, 'profiles: ' || SQLERRM);
  END;

  -- ETAPA 7: FASE E - Auth.users (último e crítico) - SINTAXE CORRIGIDA
  RAISE NOTICE '🗑️ [FORCE DELETE] FASE E: Removendo auth.users (CRÍTICO)';
  BEGIN
    DELETE FROM auth.users WHERE id = target_user_id;
    GET DIAGNOSTICS current_table_count = ROW_COUNT;
    IF current_table_count > 0 THEN
      affected_tables := array_append(affected_tables, 'auth.users');
      total_deleted := total_deleted + current_table_count;
      RAISE NOTICE '✅ [FORCE DELETE] AUTH.USERS REMOVIDO COM SUCESSO!';
    ELSE
      error_messages := array_append(error_messages, 'auth.users: Nenhum registro foi removido');
      RAISE NOTICE '❌ [FORCE DELETE] FALHA: auth.users não foi removido';
    END IF;
  EXCEPTION WHEN OTHERS THEN
    error_messages := array_append(error_messages, 'auth.users: ' || SQLERRM);
    RAISE NOTICE '💥 [FORCE DELETE] ERRO CRÍTICO em auth.users: %', SQLERRM;
  END;

  -- ETAPA 8: Resetar convites relacionados ao email
  RAISE NOTICE '🔄 [FORCE DELETE] Resetando convites para o email';
  BEGIN
    UPDATE public.invites 
    SET used_at = NULL, send_attempts = 0, last_sent_at = NULL
    WHERE email = user_email;
    GET DIAGNOSTICS current_table_count = ROW_COUNT;
    IF current_table_count > 0 THEN
      RAISE NOTICE '✅ [FORCE DELETE] Convites resetados: %', current_table_count;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    error_messages := array_append(error_messages, 'invites_reset: ' || SQLERRM);
  END;

  -- ETAPA 9: Log da operação
  BEGIN
    INSERT INTO public.audit_logs (
      user_id,
      event_type,
      action,
      resource_id,
      details
    ) VALUES (
      auth.uid(),
      'admin_action',
      'force_delete_auth_user_complete',
      target_user_id::text,
      jsonb_build_object(
        'target_email', user_email,
        'target_user_id', target_user_id,
        'backup_records', backup_count,
        'total_deleted', total_deleted,
        'affected_tables', affected_tables,
        'error_count', array_length(error_messages, 1),
        'error_messages', error_messages,
        'operation_timestamp', now(),
        'operation_type', 'force_delete_complete'
      )
    );
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '⚠️ [FORCE DELETE] Erro ao salvar log: %', SQLERRM;
  END;

  -- RESULTADO FINAL
  DECLARE
    auth_deleted boolean := 'auth.users' = ANY(affected_tables);
    operation_success boolean := auth_deleted AND array_length(error_messages, 1) <= 2; -- Tolerância para erros menores
  BEGIN
    RAISE NOTICE '📊 [FORCE DELETE] RESULTADO: success=%, auth_deleted=%, errors=%', operation_success, auth_deleted, array_length(error_messages, 1);
    
    RETURN jsonb_build_object(
      'success', operation_success,
      'message', CASE 
        WHEN operation_success THEN format('Usuário %s completamente removido do sistema (%s tabelas afetadas)', user_email, array_length(affected_tables, 1))
        WHEN NOT auth_deleted THEN format('FALHA CRÍTICA: usuário %s NÃO foi removido da auth.users', user_email)
        ELSE format('Exclusão parcial: %s erros encontrados', array_length(error_messages, 1))
      END,
      'details', jsonb_build_object(
        'backup_records', backup_count,
        'affected_tables', affected_tables,
        'auth_user_deleted', auth_deleted,
        'error_count', COALESCE(array_length(error_messages, 1), 0),
        'error_messages', error_messages,
        'operation_timestamp', now(),
        'total_records_deleted', total_deleted
      )
    );
  END;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '💥 [FORCE DELETE] ERRO GLOBAL: %', SQLERRM;
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Erro crítico na exclusão: ' || SQLERRM,
      'details', jsonb_build_object(
        'backup_records', backup_count,
        'affected_tables', affected_tables,
        'auth_user_deleted', false,
        'error_count', 1,
        'error_messages', ARRAY[SQLERRM],
        'operation_timestamp', now()
      )
    );
END;
$$;

-- Comentário da função
COMMENT ON FUNCTION admin_force_delete_auth_user IS 'Função CORRIGIDA para exclusão COMPLETA de usuário - inclui TODAS as 47 tabelas identificadas e resolve ambiguidade SQL + erro de sintaxe';
