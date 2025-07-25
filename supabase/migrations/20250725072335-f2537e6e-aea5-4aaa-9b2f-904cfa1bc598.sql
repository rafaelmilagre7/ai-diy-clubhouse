-- Corrigir TODAS as funções restantes com search_path - Lote FINAL completo
-- PARTE 1: Funções de triggers e utilitários restantes

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

CREATE OR REPLACE FUNCTION public.generate_personalized_completion_message(onboarding_data jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  result jsonb;
BEGIN
  -- Esta função será implementada via edge function
  -- Por enquanto retorna uma mensagem padrão
  result := jsonb_build_object(
    'success', true,
    'message', 'Parabéns por concluir seu onboarding! Sua jornada de implementação de IA está prestes a começar.',
    'personalized', false
  );
  
  RETURN result;
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

CREATE OR REPLACE FUNCTION public.clear_all_networking_data()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  backup_timestamp text;
  cleared_counts jsonb;
  matches_count integer := 0;
  connections_count integer := 0;
  preferences_count integer := 0;
  notifications_count integer := 0;
BEGIN
  -- Gerar timestamp para backup
  backup_timestamp := to_char(now(), 'YYYY_MM_DD_HH24_MI_SS');
  
  -- Criar backup das tabelas antes de limpar
  EXECUTE format('
    CREATE TABLE IF NOT EXISTS networking_backup_matches_%s AS 
    SELECT * FROM network_matches
  ', backup_timestamp);
  
  EXECUTE format('
    CREATE TABLE IF NOT EXISTS networking_backup_connections_%s AS 
    SELECT * FROM network_connections
  ', backup_timestamp);
  
  EXECUTE format('
    CREATE TABLE IF NOT EXISTS networking_backup_preferences_%s AS 
    SELECT * FROM networking_preferences
  ', backup_timestamp);
  
  EXECUTE format('
    CREATE TABLE IF NOT EXISTS networking_backup_notifications_%s AS 
    SELECT * FROM connection_notifications
  ', backup_timestamp);
  
  -- Contar registros antes da limpeza
  SELECT COUNT(*) INTO matches_count FROM network_matches;
  SELECT COUNT(*) INTO connections_count FROM network_connections;
  SELECT COUNT(*) INTO preferences_count FROM networking_preferences;
  SELECT COUNT(*) INTO notifications_count FROM connection_notifications;
  
  -- Limpar todas as tabelas de networking
  DELETE FROM network_matches;
  DELETE FROM network_connections;
  DELETE FROM networking_preferences;
  DELETE FROM connection_notifications;
  
  -- Construir objeto com contadores
  cleared_counts := jsonb_build_object(
    'matches', matches_count,
    'connections', connections_count,
    'preferences', preferences_count,
    'notifications', notifications_count
  );
  
  -- Retornar resultado
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Limpeza global do networking concluída com sucesso',
    'cleared_data', cleared_counts,
    'backup_timestamp', backup_timestamp
  );
  
EXCEPTION
  WHEN OTHERS THEN
    -- Em caso de erro, retornar detalhes
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Erro durante a limpeza global',
      'error', SQLERRM,
      'error_detail', SQLSTATE
    );
END;
$function$;

-- PARTE 2: Funções de validação e triggers restantes

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

CREATE OR REPLACE FUNCTION public.validate_solution_certificate(p_validation_code text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  certificate_record RECORD;
  user_record RECORD;
  solution_record RECORD;
  result JSONB;
BEGIN
  SELECT * INTO certificate_record
  FROM public.solution_certificates
  WHERE validation_code = p_validation_code;
  
  IF certificate_record.id IS NULL THEN
    RETURN jsonb_build_object(
      'valid', false,
      'message', 'Código de validação inválido'
    );
  END IF;
  
  SELECT name, email INTO user_record
  FROM public.profiles
  WHERE id = certificate_record.user_id;
  
  SELECT title, category INTO solution_record
  FROM public.solutions
  WHERE id = certificate_record.solution_id;
  
  result := jsonb_build_object(
    'valid', true,
    'certificate_id', certificate_record.id,
    'user_name', user_record.name,
    'solution_title', solution_record.title,
    'solution_category', solution_record.category,
    'implementation_date', certificate_record.implementation_date,
    'issued_at', certificate_record.issued_at,
    'validation_code', certificate_record.validation_code
  );
  
  RETURN result;
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