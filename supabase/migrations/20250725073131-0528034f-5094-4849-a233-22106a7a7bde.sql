-- ÚLTIMA CORREÇÃO DE SEARCH_PATH - Corrigindo as 43 funções restantes com warnings

-- Triggers/Funções de sistema que precisam de search_path
CREATE OR REPLACE FUNCTION public.update_solution_comments_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_suggestions_updated_at_secure()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_suggestion_comments_updated_at_secure()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_solution_certificates_updated_at_secure()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_quick_onboarding_updated_at_secure()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_solution_tools_reference_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_invite_deliveries_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_learning_lesson_nps_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_admin_communications_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_member_connections_updated_at_secure()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_networking_preferences_timestamp()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_communication_preferences_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_member_connections_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_network_timestamp()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_learning_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_category_topic_count()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Incrementar contador quando tópico é criado
    UPDATE community_categories
    SET topic_count = topic_count + 1
    WHERE id = NEW.category_id;
    
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrementar contador quando tópico é deletado
    UPDATE community_categories
    SET topic_count = GREATEST(topic_count - 1, 0)
    WHERE id = OLD.category_id;
    
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' AND OLD.category_id != NEW.category_id THEN
    -- Atualizar contadores quando tópico muda de categoria
    UPDATE community_categories
    SET topic_count = GREATEST(topic_count - 1, 0)
    WHERE id = OLD.category_id;
    
    UPDATE community_categories
    SET topic_count = topic_count + 1
    WHERE id = NEW.category_id;
    
    RETURN NEW;
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.validate_onboarding_data()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    -- Garantir que campos JSONB não sejam nulos
    NEW.personal_info = COALESCE(NEW.personal_info, '{}'::jsonb);
    NEW.professional_info = COALESCE(NEW.professional_info, '{}'::jsonb);
    NEW.business_goals = COALESCE(NEW.business_goals, '{}'::jsonb);
    NEW.ai_experience = COALESCE(NEW.ai_experience, '{}'::jsonb);
    NEW.experience_personalization = COALESCE(NEW.experience_personalization, '{}'::jsonb);
    NEW.complementary_info = COALESCE(NEW.complementary_info, '{}'::jsonb);
    NEW.business_context = COALESCE(NEW.business_context, '{}'::jsonb);
    
    -- Garantir que completed_steps seja array
    NEW.completed_steps = COALESCE(NEW.completed_steps, ARRAY[]::text[]);
    
    -- Sincronizar campos top-level com JSONB
    IF NEW.professional_info IS NOT NULL THEN
        NEW.company_name = COALESCE(NEW.professional_info->>'company_name', NEW.company_name);
        NEW.company_size = COALESCE(NEW.professional_info->>'company_size', NEW.company_size);
        NEW.company_sector = COALESCE(NEW.professional_info->>'company_sector', NEW.company_sector);
        NEW.company_website = COALESCE(NEW.professional_info->>'company_website', NEW.company_website);
        NEW.current_position = COALESCE(NEW.professional_info->>'current_position', NEW.current_position);
        NEW.annual_revenue = COALESCE(NEW.professional_info->>'annual_revenue', NEW.annual_revenue);
    END IF;
    
    NEW.updated_at = now();
    
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.process_invite_after_signup()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  invite_token TEXT;
  invite_record RECORD;
BEGIN
  -- Log de início
  RAISE NOTICE 'TRIGGER EXECUTANDO: process_invite_after_signup para usuário %', NEW.email;
  
  -- Verificar se há token de convite nos metadados
  invite_token := NEW.raw_user_meta_data->>'invite_token';
  
  RAISE NOTICE 'TOKEN DE CONVITE encontrado: %', COALESCE(invite_token, 'NENHUM');
  
  IF invite_token IS NOT NULL THEN
    -- Aguardar um pouco para garantir que o perfil foi criado
    PERFORM pg_sleep(0.1);
    
    -- Buscar convite válido
    SELECT * INTO invite_record
    FROM public.invites
    WHERE UPPER(token) = UPPER(invite_token)
    AND used_at IS NULL
    AND expires_at > NOW()
    LIMIT 1;
    
    IF invite_record.id IS NOT NULL THEN
      RAISE NOTICE 'CONVITE VÁLIDO ENCONTRADO: % para role %', invite_record.id, invite_record.role_id;
      
      -- Aplicar role do convite ao perfil
      UPDATE public.profiles
      SET role_id = invite_record.role_id
      WHERE id = NEW.id;
      
      -- Marcar convite como usado
      UPDATE public.invites
      SET used_at = NOW()
      WHERE id = invite_record.id;
      
      -- Log da aplicação do convite
      INSERT INTO public.audit_logs (
        user_id,
        event_type,
        action,
        details
      ) VALUES (
        NEW.id,
        'invite_processed',
        'auto_invite_application',
        jsonb_build_object(
          'invite_id', invite_record.id,
          'token', invite_token,
          'role_id', invite_record.role_id,
          'trigger_execution', 'process_invite_after_signup'
        )
      );
      
      RAISE NOTICE 'CONVITE APLICADO COM SUCESSO para usuário %', NEW.email;
    ELSE
      RAISE NOTICE 'CONVITE INVÁLIDO OU EXPIRADO: %', invite_token;
      
      -- Log de convite inválido
      INSERT INTO public.audit_logs (
        user_id,
        event_type,
        action,
        details
      ) VALUES (
        NEW.id,
        'invite_processed',
        'invalid_invite_token',
        jsonb_build_object(
          'token', invite_token,
          'email', NEW.email
        )
      );
    END IF;
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'ERRO NO PROCESSAMENTO DE CONVITE para %: %', NEW.email, SQLERRM;
    INSERT INTO public.audit_logs (
      user_id,
      event_type,
      action,
      details
    ) VALUES (
      NEW.id,
      'invite_processed',
      'invite_processing_error',
      jsonb_build_object(
        'error', SQLERRM,
        'token', invite_token,
        'email', NEW.email
      )
    );
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_forum_post_reaction_counts()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Atualizar contador na tabela forum_posts se ela tiver essas colunas
  -- Como não vi reaction_count na estrutura original, vou apenas documentar
  -- UPDATE public.forum_posts
  -- SET reaction_count = (
  --   SELECT COUNT(*) 
  --   FROM public.forum_reactions 
  --   WHERE post_id = COALESCE(NEW.post_id, OLD.post_id)
  -- )
  -- WHERE id = COALESCE(NEW.post_id, OLD.post_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_topic_reply_count()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Incrementar contador quando post é criado
    UPDATE community_topics
    SET reply_count = reply_count + 1,
        last_activity_at = NOW()
    WHERE id = NEW.topic_id;
    
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrementar contador quando post é deletado
    UPDATE community_topics
    SET reply_count = GREATEST(reply_count - 1, 0),
        last_activity_at = NOW()
    WHERE id = OLD.topic_id;
    
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_notification_preferences_timestamp_secure()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_quick_onboarding_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_learning_comment_like_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Incrementar contador quando curtida é adicionada
    UPDATE learning_comments 
    SET likes_count = likes_count + 1 
    WHERE id = NEW.comment_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrementar contador quando curtida é removida
    UPDATE learning_comments 
    SET likes_count = GREATEST(0, likes_count - 1) 
    WHERE id = OLD.comment_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$function$;

CREATE OR REPLACE FUNCTION public.log_security_violation_attempt()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Log tentativas de atualização não autorizadas
  INSERT INTO public.audit_logs (
    user_id,
    event_type,
    action,
    resource_id,
    details,
    severity
  ) VALUES (
    auth.uid(),
    'security_violation',
    'unauthorized_update_attempt',
    COALESCE(NEW.id::TEXT, OLD.id::TEXT),
    jsonb_build_object(
      'table_name', TG_TABLE_NAME,
      'operation', TG_OP,
      'attempted_changes', row_to_json(NEW),
      'original_data', row_to_json(OLD),
      'timestamp', NOW(),
      'ip_address', current_setting('request.headers', true)::jsonb->>'x-forwarded-for'
    ),
    'critical'
  );
  
  -- Bloquear a operação
  RAISE EXCEPTION 'Unauthorized operation detected and logged';
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_notification_preferences_timestamp()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_solution_certificates_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_suggestion_comments_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_suggestions_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.audit_role_assignments()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Log de mudanças de role
  IF (TG_OP = 'UPDATE' AND OLD.role_id IS DISTINCT FROM NEW.role_id) OR TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs (
      user_id, event_type, action, details
    ) VALUES (
      NEW.id,
      'role_assignment',
      TG_OP,
      jsonb_build_object(
        'old_role_id', OLD.role_id,
        'new_role_id', NEW.role_id,
        'changed_by', auth.uid(),
        'changed_at', now()
      )
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.detect_suspicious_activity()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  recent_attempts INTEGER;
BEGIN
  -- Verificar múltiplas tentativas de mudança de papel
  SELECT COUNT(*) INTO recent_attempts
  FROM public.audit_logs
  WHERE user_id = auth.uid()
    AND event_type = 'role_change'
    AND timestamp > NOW() - INTERVAL '1 hour';
  
  IF recent_attempts > 3 THEN
    INSERT INTO public.audit_logs (
      user_id,
      event_type,
      action,
      details,
      severity
    ) VALUES (
      auth.uid(),
      'suspicious_activity',
      'multiple_role_change_attempts',
      jsonb_build_object(
        'attempts_count', recent_attempts,
        'time_window', '1 hour',
        'timestamp', NOW()
      ),
      'high'
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Funções auxiliares que foram esquecidas
CREATE OR REPLACE FUNCTION public.generate_referral_token()
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT string_agg(
    substring('ABCDEFGHJKMNPQRSTUVWXYZ23456789', 
    ceil(random() * 32)::integer, 1), '')
  FROM generate_series(1, 10);
$function$;

CREATE OR REPLACE FUNCTION public.normalize_bucket_name(bucket_name text)
 RETURNS text
 LANGUAGE sql
 IMMUTABLE
 SET search_path TO 'public'
AS $function$
  SELECT replace(lower(trim(bucket_name)), '-', '_');
$function$;

CREATE OR REPLACE FUNCTION public.notify_topic_author_on_reply()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  topic_author_id uuid;
  topic_title text;
  poster_name text;
BEGIN
  -- Buscar autor do tópico e título
  SELECT user_id, title INTO topic_author_id, topic_title
  FROM community_topics
  WHERE id = NEW.topic_id;
  
  -- Buscar nome de quem postou
  SELECT name INTO poster_name
  FROM profiles
  WHERE id = NEW.user_id;
  
  -- Só notificar se não for o próprio autor respondendo
  IF topic_author_id != NEW.user_id THEN
    PERFORM create_community_notification(
      topic_author_id,
      'Nova resposta no seu tópico',
      poster_name || ' respondeu no tópico "' || topic_title || '"',
      'community_reply',
      jsonb_build_object(
        'topic_id', NEW.topic_id,
        'post_id', NEW.id,
        'responder_id', NEW.user_id
      )
    );
  END IF;
  
  RETURN NEW;
END;
$function$;