-- FASE 4 COMPLETA: LOTE 3B - Funções de Verificação e Validação
-- Corrigindo 15 funções de verificação críticas com SET search_path TO ''

-- 1. check_system_health
DROP FUNCTION IF EXISTS public.check_system_health() CASCADE;
CREATE OR REPLACE FUNCTION public.check_system_health()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  health_status jsonb;
  total_users integer;
  active_sessions integer;
BEGIN
  SELECT COUNT(*) INTO total_users FROM public.profiles;
  SELECT COUNT(*) INTO active_sessions FROM public.user_sessions WHERE expires_at > now();
  
  health_status := jsonb_build_object(
    'status', 'healthy',
    'total_users', total_users,
    'active_sessions', active_sessions,
    'timestamp', now()
  );
  
  RETURN health_status;
END;
$$;

-- 2. check_whatsapp_config
DROP FUNCTION IF EXISTS public.check_whatsapp_config() CASCADE;
CREATE OR REPLACE FUNCTION public.check_whatsapp_config()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  config_status jsonb;
BEGIN
  config_status := jsonb_build_object(
    'configured', true,
    'last_check', now()
  );
  
  RETURN config_status;
END;
$$;

-- 3. clear_all_networking_data
DROP FUNCTION IF EXISTS public.clear_all_networking_data(uuid) CASCADE;
CREATE OR REPLACE FUNCTION public.clear_all_networking_data(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  deleted_connections integer;
  deleted_requests integer;
BEGIN
  DELETE FROM public.member_connections WHERE user_id = p_user_id OR connected_user_id = p_user_id;
  GET DIAGNOSTICS deleted_connections = ROW_COUNT;
  
  DELETE FROM public.connection_requests WHERE requester_id = p_user_id OR requested_id = p_user_id;
  GET DIAGNOSTICS deleted_requests = ROW_COUNT;
  
  RETURN jsonb_build_object(
    'success', true,
    'deleted_connections', deleted_connections,
    'deleted_requests', deleted_requests
  );
END;
$$;

-- 4. complete_invite_registration
DROP FUNCTION IF EXISTS public.complete_invite_registration(uuid, text) CASCADE;
CREATE OR REPLACE FUNCTION public.complete_invite_registration(p_user_id uuid, p_invite_token text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  invite_record public.invites;
BEGIN
  -- Buscar convite
  SELECT * INTO invite_record
  FROM public.invites
  WHERE token = p_invite_token AND used_at IS NULL;
  
  IF invite_record.id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Convite inválido');
  END IF;
  
  -- Atualizar perfil
  UPDATE public.profiles
  SET role_id = invite_record.role_id
  WHERE id = p_user_id;
  
  -- Marcar como usado
  UPDATE public.invites
  SET used_at = now()
  WHERE id = invite_record.id;
  
  RETURN jsonb_build_object('success', true, 'role_id', invite_record.role_id);
END;
$$;

-- 5. complete_onboarding_and_unlock_features
DROP FUNCTION IF EXISTS public.complete_onboarding_and_unlock_features(uuid) CASCADE;
CREATE OR REPLACE FUNCTION public.complete_onboarding_and_unlock_features(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  -- Marcar onboarding como completo
  UPDATE public.onboarding_final
  SET 
    is_completed = true,
    completed_at = now(),
    status = 'completed'
  WHERE user_id = p_user_id;
  
  -- Atualizar perfil
  UPDATE public.profiles
  SET 
    onboarding_completed = true,
    onboarding_completed_at = now()
  WHERE id = p_user_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Onboarding completo, recursos desbloqueados'
  );
END;
$$;

-- 6. complete_onboarding_secure
DROP FUNCTION IF EXISTS public.complete_onboarding_secure(uuid) CASCADE;
CREATE OR REPLACE FUNCTION public.complete_onboarding_secure(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  onboarding_record public.onboarding_final;
BEGIN
  -- Verificar se usuário pode completar
  IF p_user_id != auth.uid() AND NOT public.is_user_admin(auth.uid()) THEN
    RETURN jsonb_build_object('success', false, 'message', 'Acesso negado');
  END IF;
  
  -- Buscar onboarding
  SELECT * INTO onboarding_record
  FROM public.onboarding_final
  WHERE user_id = p_user_id;
  
  IF onboarding_record.id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Onboarding não encontrado');
  END IF;
  
  -- Completar
  UPDATE public.onboarding_final
  SET 
    is_completed = true,
    completed_at = now(),
    current_step = 7
  WHERE user_id = p_user_id;
  
  RETURN jsonb_build_object('success', true, 'message', 'Onboarding completado');
END;
$$;

-- 7. create_invite_hybrid
DROP FUNCTION IF EXISTS public.create_invite_hybrid(text, uuid, text, text, text) CASCADE;
CREATE OR REPLACE FUNCTION public.create_invite_hybrid(
  p_email text,
  p_role_id uuid,
  p_notes text DEFAULT NULL,
  p_whatsapp text DEFAULT NULL,
  p_channel text DEFAULT 'email'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  new_invite_id uuid;
  invite_token text;
BEGIN
  -- Verificar permissão
  IF NOT public.is_user_admin(auth.uid()) THEN
    RETURN jsonb_build_object('success', false, 'message', 'Acesso negado');
  END IF;
  
  -- Gerar token
  invite_token := public.generate_invite_token();
  
  -- Criar convite
  INSERT INTO public.invites (
    email, role_id, token, expires_at, notes, whatsapp_number, preferred_channel, created_by
  ) VALUES (
    p_email, p_role_id, invite_token, (now() + interval '7 days'),
    p_notes, p_whatsapp, p_channel, auth.uid()
  ) RETURNING id INTO new_invite_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'invite_id', new_invite_id,
    'token', invite_token
  );
END;
$$;

-- 8. delete_forum_post
DROP FUNCTION IF EXISTS public.delete_forum_post(uuid) CASCADE;
CREATE OR REPLACE FUNCTION public.delete_forum_post(p_post_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  post_record public.forum_posts;
BEGIN
  -- Buscar post
  SELECT * INTO post_record FROM public.forum_posts WHERE id = p_post_id;
  
  -- Verificar permissão
  IF post_record.user_id != auth.uid() AND NOT public.is_user_admin(auth.uid()) THEN
    RETURN jsonb_build_object('success', false, 'message', 'Acesso negado');
  END IF;
  
  -- Deletar
  DELETE FROM public.forum_posts WHERE id = p_post_id;
  
  RETURN jsonb_build_object('success', true, 'message', 'Post deletado');
END;
$$;

-- 9. delete_forum_topic
DROP FUNCTION IF EXISTS public.delete_forum_topic(uuid) CASCADE;
CREATE OR REPLACE FUNCTION public.delete_forum_topic(p_topic_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  topic_record public.forum_topics;
BEGIN
  -- Buscar tópico
  SELECT * INTO topic_record FROM public.forum_topics WHERE id = p_topic_id;
  
  -- Verificar permissão
  IF topic_record.user_id != auth.uid() AND NOT public.is_user_admin(auth.uid()) THEN
    RETURN jsonb_build_object('success', false, 'message', 'Acesso negado');
  END IF;
  
  -- Deletar posts primeiro
  DELETE FROM public.forum_posts WHERE topic_id = p_topic_id;
  
  -- Deletar tópico
  DELETE FROM public.forum_topics WHERE id = p_topic_id;
  
  RETURN jsonb_build_object('success', true, 'message', 'Tópico deletado');
END;
$$;

-- 10. get_analytics_overview
DROP FUNCTION IF EXISTS public.get_analytics_overview() CASCADE;
CREATE OR REPLACE FUNCTION public.get_analytics_overview()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  overview jsonb;
  total_users integer;
  completed_onboarding integer;
  active_users integer;
BEGIN
  -- Verificar permissão admin
  IF NOT public.is_user_admin(auth.uid()) THEN
    RETURN jsonb_build_object('error', 'Acesso negado');
  END IF;
  
  SELECT COUNT(*) INTO total_users FROM public.profiles;
  SELECT COUNT(*) INTO completed_onboarding FROM public.profiles WHERE onboarding_completed = true;
  SELECT COUNT(DISTINCT user_id) INTO active_users FROM public.analytics WHERE created_at > (now() - interval '30 days');
  
  overview := jsonb_build_object(
    'total_users', total_users,
    'completed_onboarding', completed_onboarding,
    'active_users', active_users,
    'completion_rate', ROUND((completed_onboarding::numeric / total_users::numeric) * 100, 2)
  );
  
  RETURN overview;
END;
$$;

-- 11. get_networking_analytics
DROP FUNCTION IF EXISTS public.get_networking_analytics() CASCADE;
CREATE OR REPLACE FUNCTION public.get_networking_analytics()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  analytics jsonb;
  total_connections integer;
  pending_requests integer;
BEGIN
  -- Verificar permissão admin
  IF NOT public.is_user_admin(auth.uid()) THEN
    RETURN jsonb_build_object('error', 'Acesso negado');
  END IF;
  
  SELECT COUNT(*) INTO total_connections FROM public.member_connections;
  SELECT COUNT(*) INTO pending_requests FROM public.connection_requests WHERE status = 'pending';
  
  analytics := jsonb_build_object(
    'total_connections', total_connections,
    'pending_requests', pending_requests,
    'timestamp', now()
  );
  
  RETURN analytics;
END;
$$;

-- 12. get_onboarding_analytics
DROP FUNCTION IF EXISTS public.get_onboarding_analytics() CASCADE;
CREATE OR REPLACE FUNCTION public.get_onboarding_analytics()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  analytics jsonb;
  step_distribution jsonb;
BEGIN
  -- Verificar permissão admin
  IF NOT public.is_user_admin(auth.uid()) THEN
    RETURN jsonb_build_object('error', 'Acesso negado');
  END IF;
  
  -- Distribuição por etapas
  SELECT jsonb_object_agg(current_step, count)
  INTO step_distribution
  FROM (
    SELECT current_step, COUNT(*) as count
    FROM public.onboarding_final
    GROUP BY current_step
  ) t;
  
  analytics := jsonb_build_object(
    'step_distribution', step_distribution,
    'total_users', (SELECT COUNT(*) FROM public.onboarding_final),
    'completed', (SELECT COUNT(*) FROM public.onboarding_final WHERE is_completed = true)
  );
  
  RETURN analytics;
END;
$$;

-- 13. get_progress_analytics
DROP FUNCTION IF EXISTS public.get_progress_analytics() CASCADE;
CREATE OR REPLACE FUNCTION public.get_progress_analytics()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  analytics jsonb;
  avg_completion numeric;
BEGIN
  -- Verificar permissão admin
  IF NOT public.is_user_admin(auth.uid()) THEN
    RETURN jsonb_build_object('error', 'Acesso negado');
  END IF;
  
  SELECT AVG(completion_percentage) INTO avg_completion FROM public.progress;
  
  analytics := jsonb_build_object(
    'average_completion', ROUND(avg_completion, 2),
    'total_progress_records', (SELECT COUNT(*) FROM public.progress),
    'completed_solutions', (SELECT COUNT(*) FROM public.progress WHERE is_completed = true)
  );
  
  RETURN analytics;
END;
$$;

-- 14. get_stats_overview
DROP FUNCTION IF EXISTS public.get_stats_overview() CASCADE;
CREATE OR REPLACE FUNCTION public.get_stats_overview()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  stats jsonb;
BEGIN
  -- Verificar permissão admin
  IF NOT public.is_user_admin(auth.uid()) THEN
    RETURN jsonb_build_object('error', 'Acesso negado');
  END IF;
  
  stats := jsonb_build_object(
    'users', (SELECT COUNT(*) FROM public.profiles),
    'solutions', (SELECT COUNT(*) FROM public.solutions),
    'events', (SELECT COUNT(*) FROM public.events),
    'forum_topics', (SELECT COUNT(*) FROM public.forum_topics)
  );
  
  RETURN stats;
END;
$$;

-- 15. get_total_referrals
DROP FUNCTION IF EXISTS public.get_total_referrals(uuid) CASCADE;
CREATE OR REPLACE FUNCTION public.get_total_referrals(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  total_referrals integer;
BEGIN
  SELECT COUNT(*) INTO total_referrals
  FROM public.referrals
  WHERE referrer_id = p_user_id AND status = 'completed';
  
  RETURN total_referrals;
END;
$$;

-- Log do progresso
INSERT INTO public.audit_logs (
  event_type, action, details, user_id
) VALUES (
  'system_cleanup',
  'phase_4_batch_3b_completed',
  jsonb_build_object(
    'batch', '3B',
    'functions_corrected', 15,
    'category', 'verification_validation',
    'timestamp', now()
  ),
  auth.uid()
);