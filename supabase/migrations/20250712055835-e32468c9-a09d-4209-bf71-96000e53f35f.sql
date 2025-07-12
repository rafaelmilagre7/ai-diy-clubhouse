-- CORREÇÃO DE SEARCH_PATH MUTÁVEL EM FUNÇÕES - FASE 3 (FINAL)
-- Funções restantes de negócio, validação e utilidade

-- Funções de negócio/convites
CREATE OR REPLACE FUNCTION public.increment_suggestion_upvote(suggestion_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  PERFORM public.increment(suggestion_id, 'suggestions', 'upvotes');
END;
$function$;

CREATE OR REPLACE FUNCTION public.increment_suggestion_downvote(suggestion_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  PERFORM public.increment(suggestion_id, 'suggestions', 'downvotes');
END;
$function$;

CREATE OR REPLACE FUNCTION public.decrement_suggestion_upvote(suggestion_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  PERFORM public.decrement(suggestion_id, 'suggestions', 'upvotes');
END;
$function$;

CREATE OR REPLACE FUNCTION public.decrement_suggestion_downvote(suggestion_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  PERFORM public.decrement(suggestion_id, 'suggestions', 'downvotes');
END;
$function$;

CREATE OR REPLACE FUNCTION public.increment_benefit_clicks(tool_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  UPDATE public.tools
  SET benefit_clicks = COALESCE(benefit_clicks, 0) + 1
  WHERE id = tool_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.increment(row_id uuid, table_name text, column_name text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  EXECUTE format('UPDATE %I SET %I = %I + 1 WHERE id = $1', table_name, column_name, column_name)
  USING row_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.decrement(row_id uuid, table_name text, column_name text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  EXECUTE format('UPDATE %I SET %I = GREATEST(0, %I - 1) WHERE id = $1', table_name, column_name, column_name)
  USING row_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_invite_send_attempt(invite_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  UPDATE public.invites
  SET last_sent_at = NOW(),
      send_attempts = send_attempts + 1
  WHERE id = invite_id;
END;
$function$;

-- Funções de limpeza e manutenção
CREATE OR REPLACE FUNCTION public.cleanup_expired_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  DELETE FROM public.notifications 
  WHERE expires_at IS NOT NULL AND expires_at < NOW();
  
  DELETE FROM public.invites 
  WHERE expires_at < NOW() AND used_at IS NULL;
  
  INSERT INTO public.analytics (user_id, event_type, event_data)
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    'system_cleanup',
    jsonb_build_object('cleaned_at', NOW(), 'type', 'expired_sessions')
  );
END;
$function$;

-- Funções de storage e buckets
CREATE OR REPLACE FUNCTION public.create_storage_public_policy(bucket_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = bucket_name) THEN
    BEGIN
      INSERT INTO storage.buckets (id, name, public, file_size_limit)
      VALUES (bucket_name, bucket_name, true, 314572800)
      ON CONFLICT (id) DO UPDATE SET 
        public = true,
        file_size_limit = 314572800;
    EXCEPTION
      WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao criar bucket %: %', bucket_name, SQLERRM;
    END;
  ELSE
    UPDATE storage.buckets
    SET public = true,
        file_size_limit = 314572800
    WHERE id = bucket_name;
  END IF;

  BEGIN
    DROP POLICY IF EXISTS "Política de acesso público para leitura ${bucket_name}" ON storage.objects;
    DROP POLICY IF EXISTS "Política de acesso público para upload ${bucket_name}" ON storage.objects;
    DROP POLICY IF EXISTS "Política de acesso público para delete ${bucket_name}" ON storage.objects;
    DROP POLICY IF EXISTS "Política de acesso público para update ${bucket_name}" ON storage.objects;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE 'Erro ao limpar políticas existentes: %', SQLERRM;
  END;

  BEGIN
    CREATE POLICY "Política de acesso público para leitura ${bucket_name}"
      ON storage.objects FOR SELECT
      USING (bucket_id = bucket_name);
  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE 'Erro ao criar política de leitura: %', SQLERRM;
  END;

  BEGIN
    CREATE POLICY "Política de acesso público para upload ${bucket_name}"
      ON storage.objects FOR INSERT
      WITH CHECK (bucket_id = bucket_name AND auth.role() = 'authenticated');
  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE 'Erro ao criar política de upload: %', SQLERRM;
  END;
    
  BEGIN
    CREATE POLICY "Política de acesso público para delete ${bucket_name}"
      ON storage.objects FOR DELETE
      USING (bucket_id = bucket_name AND auth.role() = 'authenticated');
  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE 'Erro ao criar política de delete: %', SQLERRM;
  END;
    
  BEGIN
    CREATE POLICY "Política de acesso público para update ${bucket_name}"
      ON storage.objects FOR UPDATE
      USING (bucket_id = bucket_name AND auth.role() = 'authenticated')
      WITH CHECK (bucket_id = bucket_name AND auth.role() = 'authenticated');
  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE 'Erro ao criar política de update: %', SQLERRM;
  END;

  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Erro ao criar políticas: %', SQLERRM;
    RETURN FALSE;
END;
$function$;

CREATE OR REPLACE FUNCTION public.setup_learning_storage_buckets()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  result jsonb := '{}'::jsonb;
  buckets text[] := ARRAY['learning_materials', 'course_images', 'learning_videos', 'solution_files'];
  bucket text;
  success boolean;
  error_messages text[] := '{}';
BEGIN
  FOREACH bucket IN ARRAY buckets LOOP
    BEGIN
      success := public.create_storage_public_policy(bucket);
      IF NOT success THEN
        error_messages := array_append(error_messages, format('Falha ao configurar bucket %s', bucket));
      END IF;
    EXCEPTION 
      WHEN OTHERS THEN
        error_messages := array_append(error_messages, format('Erro ao configurar bucket %s: %s', bucket, SQLERRM));
        success := false;
    END;
  END LOOP;
  
  result := jsonb_build_object(
    'success', array_length(error_messages, 1) IS NULL OR array_length(error_messages, 1) = 0,
    'message', CASE 
      WHEN array_length(error_messages, 1) IS NULL OR array_length(error_messages, 1) = 0 THEN 'Todos os buckets configurados com sucesso'
      ELSE format('Alguns buckets não puderam ser configurados: %s', array_to_string(error_messages, ', '))
    END,
    'buckets_configured', buckets,
    'errors', error_messages
  );
  
  RETURN result;
END;
$function$;

-- Trigger para inicialização de onboarding
CREATE OR REPLACE FUNCTION public.initialize_onboarding_after_invite()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $function$
BEGIN
  IF OLD.role_id IS NULL AND NEW.role_id IS NOT NULL THEN
    INSERT INTO public.onboarding_final (
      user_id,
      personal_info,
      location_info,
      discovery_info,
      business_info,
      business_context,
      goals_info,
      ai_experience,
      personalization,
      current_step,
      completed_steps,
      is_completed
    ) VALUES (
      NEW.id,
      '{}'::jsonb,
      '{}'::jsonb,
      '{}'::jsonb,
      '{}'::jsonb,
      '{}'::jsonb,
      '{}'::jsonb,
      '{}'::jsonb,
      '{}'::jsonb,
      1,
      '{}',
      false
    )
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Log da correção final
INSERT INTO public.audit_logs (
  user_id,
  event_type,
  action,
  details
) VALUES (
  auth.uid(),
  'security_fix',
  'function_search_path_fix_completed',
  jsonb_build_object(
    'total_functions_fixed', 77,
    'phases_completed', 3,
    'security_improvement', 'All functions now have SET search_path = empty for security',
    'completion_timestamp', NOW()
  )
);