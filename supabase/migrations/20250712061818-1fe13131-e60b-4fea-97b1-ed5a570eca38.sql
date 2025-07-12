-- Migration: Final search_path fix for core existing functions only
-- Focus on essential functions that exist in the database

-- Fix only the core functions that are confirmed to exist
-- Based on the original function list from supabase-configuration

-- 1. validate_invite_token_enhanced
CREATE OR REPLACE FUNCTION public.validate_invite_token_enhanced(p_token text)
 RETURNS TABLE(id uuid, email text, role_id uuid, token text, expires_at timestamp with time zone, used_at timestamp with time zone, created_at timestamp with time zone, created_by uuid, notes text, whatsapp_number text, preferred_channel character varying, send_attempts integer, last_sent_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  -- Log da tentativa de validação
  RAISE NOTICE 'Validando token: %', p_token;
  
  -- Busca principal: token exato (case-insensitive)
  RETURN QUERY
  SELECT i.id, i.email, i.role_id, i.token, i.expires_at, i.used_at, 
         i.created_at, i.created_by, i.notes, i.whatsapp_number, 
         i.preferred_channel, i.send_attempts, i.last_sent_at
  FROM public.invites i
  WHERE UPPER(i.token) = UPPER(p_token)
    AND i.used_at IS NULL 
    AND i.expires_at > NOW();
  
  -- Se não encontrou resultado, tentar busca parcial
  IF NOT FOUND THEN
    RAISE NOTICE 'Token exato não encontrado, tentando busca parcial';
    RETURN QUERY
    SELECT i.id, i.email, i.role_id, i.token, i.expires_at, i.used_at, 
           i.created_at, i.created_by, i.notes, i.whatsapp_number, 
           i.preferred_channel, i.send_attempts, i.last_sent_at
    FROM public.invites i
    WHERE UPPER(i.token) LIKE (UPPER(SUBSTRING(p_token, 1, 8)) || '%')
      AND i.used_at IS NULL 
      AND i.expires_at > NOW()
    LIMIT 1;
  END IF;
END;
$function$;

-- 2. log_security_violation
CREATE OR REPLACE FUNCTION public.log_security_violation(violation_type text, resource_type text, resource_id text DEFAULT NULL::text, details jsonb DEFAULT '{}'::jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
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
    violation_type,
    resource_id,
    details || jsonb_build_object(
      'resource_type', resource_type,
      'timestamp', NOW(),
      'user_agent', current_setting('request.headers', true)::jsonb->>'user-agent'
    ),
    'high'
  );
END;
$function$;

-- 3. use_invite_enhanced
CREATE OR REPLACE FUNCTION public.use_invite_enhanced(invite_token text, user_id uuid)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  invite_record public.invites;
  cleaned_token text;
BEGIN
  -- Limpar o token
  cleaned_token := upper(regexp_replace(invite_token, '\s+', '', 'g'));
  
  RAISE NOTICE 'Tentando usar convite: % para usuário: %', cleaned_token, user_id;
  
  -- Buscar convite usando a função de validação
  SELECT * INTO invite_record
  FROM public.validate_invite_token_enhanced(cleaned_token)
  LIMIT 1;
  
  -- Verificar se encontrou o convite
  IF invite_record.id IS NULL THEN
    RAISE NOTICE 'Convite não encontrado ou inválido: %', cleaned_token;
    RETURN json_build_object(
      'status', 'error',
      'message', 'Convite inválido ou expirado'
    );
  END IF;
  
  -- Marcar como usado e atualizar usuário
  BEGIN
    UPDATE public.invites
    SET used_at = now()
    WHERE id = invite_record.id;
    
    UPDATE public.profiles
    SET role_id = invite_record.role_id
    WHERE id = user_id;
    
    RAISE NOTICE 'Convite % aplicado com sucesso para usuário %', cleaned_token, user_id;
    
    RETURN json_build_object(
      'status', 'success',
      'message', 'Convite utilizado com sucesso',
      'invite_id', invite_record.id,
      'role_id', invite_record.role_id
    );
    
  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE 'Erro ao aplicar convite: %', SQLERRM;
      RETURN json_build_object(
        'status', 'error',
        'message', 'Erro interno ao aplicar convite: ' || SQLERRM
      );
  END;
END;
$function$;

-- 4. detect_unauthorized_access
CREATE OR REPLACE FUNCTION public.detect_unauthorized_access()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  -- Log tentativas de inserção com user_id diferente do usuário autenticado
  IF TG_OP = 'INSERT' AND NEW.user_id IS DISTINCT FROM auth.uid() THEN
    PERFORM public.log_security_violation(
      'unauthorized_insert_attempt',
      TG_TABLE_NAME::TEXT,
      NEW.id::TEXT,
      jsonb_build_object(
        'attempted_user_id', NEW.user_id,
        'actual_user_id', auth.uid()
      )
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- 5. validate_password_strength
CREATE OR REPLACE FUNCTION public.validate_password_strength(password text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  -- Mínimo 8 caracteres, pelo menos uma letra e um número
  RETURN length(password) >= 8 
    AND password ~ '[A-Za-z]' 
    AND password ~ '[0-9]';
END;
$function$;

-- 6. use_invite
CREATE OR REPLACE FUNCTION public.use_invite(invite_token text, user_id uuid)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  invite_record public.invites;
  user_profile_record public.profiles;
  result_status text;
  result_message text;
  cleaned_token text;
  debug_info jsonb;
BEGIN
  -- Limpar o token (remover espaços, converter para maiúsculas)
  cleaned_token := upper(regexp_replace(invite_token, '\s+', '', 'g'));
  
  -- Log para depuração
  RAISE NOTICE 'Tentando usar convite com token: % para usuário: %', cleaned_token, user_id;
  
  -- Verificar se o usuário realmente existe na tabela profiles
  SELECT * INTO user_profile_record
  FROM public.profiles
  WHERE id = user_id;
  
  IF user_profile_record.id IS NULL THEN
    RAISE NOTICE 'Usuário % não encontrado na tabela profiles', user_id;
    RETURN json_build_object(
      'status', 'error', 
      'message', 'Usuário não encontrado. Complete o registro primeiro.'
    );
  END IF;
  
  -- Buscar convite válido
  SELECT * INTO invite_record
  FROM public.invites
  WHERE upper(token) = cleaned_token
  AND used_at IS NULL
  AND expires_at > now();
  
  -- Se não encontrou, tenta busca parcial
  IF invite_record.id IS NULL AND length(cleaned_token) >= 8 THEN
    SELECT * INTO invite_record
    FROM public.invites
    WHERE upper(token) ILIKE (substring(cleaned_token from 1 for 8) || '%')
    AND used_at IS NULL
    AND expires_at > now()
    LIMIT 1;
  END IF;
  
  -- Verificar se o convite existe e é válido
  IF invite_record.id IS NULL THEN
    result_status := 'error';
    result_message := 'Convite inválido ou expirado';
    
    RETURN json_build_object(
      'status', result_status, 
      'message', result_message
    );
  END IF;
  
  -- Verificar se o convite já foi usado (double-check)
  IF invite_record.used_at IS NOT NULL THEN
    result_status := 'error';
    result_message := 'Este convite já foi utilizado';
    
    RETURN json_build_object(
      'status', result_status, 
      'message', result_message
    );
  END IF;
  
  -- TRANSAÇÃO: Marcar o convite como utilizado E atualizar o papel do usuário
  BEGIN
    -- Marcar o convite como utilizado
    UPDATE public.invites
    SET used_at = now()
    WHERE id = invite_record.id;
    
    -- Atualizar o papel do usuário
    UPDATE public.profiles
    SET role_id = invite_record.role_id
    WHERE id = user_id;
    
    -- Registrar a alteração no log de auditoria
    PERFORM public.log_permission_change(
      user_id := user_id,
      action_type := 'use_invite',
      target_user_id := user_id,
      role_id := invite_record.role_id
    );
    
    result_status := 'success';
    result_message := 'Convite utilizado com sucesso';
    
    RAISE NOTICE 'Convite % aplicado com sucesso para usuário %', cleaned_token, user_id;
    
  EXCEPTION
    WHEN OTHERS THEN
      -- Em caso de erro, reverter
      RAISE NOTICE 'Erro ao aplicar convite: %', SQLERRM;
      result_status := 'error';
      result_message := 'Erro interno ao aplicar convite: ' || SQLERRM;
  END;
  
  RETURN json_build_object(
    'status', result_status, 
    'message', result_message, 
    'invite_id', invite_record.id,
    'role_id', invite_record.role_id
  );
END;
$function$;

-- 7. update_conversation_last_message
CREATE OR REPLACE FUNCTION public.update_conversation_last_message()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
DECLARE
  conversation_id UUID;
BEGIN
  -- Encontrar ou criar conversa
  SELECT id INTO conversation_id
  FROM conversations
  WHERE (participant_1_id = NEW.sender_id AND participant_2_id = NEW.recipient_id)
     OR (participant_1_id = NEW.recipient_id AND participant_2_id = NEW.sender_id);
  
  -- Se conversa não existe, criar
  IF conversation_id IS NULL THEN
    INSERT INTO conversations (participant_1_id, participant_2_id, last_message_at)
    VALUES (NEW.sender_id, NEW.recipient_id, NEW.created_at)
    RETURNING id INTO conversation_id;
  ELSE
    -- Atualizar timestamp da última mensagem
    UPDATE conversations 
    SET last_message_at = NEW.created_at 
    WHERE id = conversation_id;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- 8. check_rate_limit
CREATE OR REPLACE FUNCTION public.check_rate_limit(action_type text, max_attempts integer DEFAULT 5, window_minutes integer DEFAULT 15)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  attempt_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO attempt_count
  FROM public.audit_logs
  WHERE user_id = auth.uid()
    AND action = action_type
    AND timestamp > (NOW() - INTERVAL '1 minute' * window_minutes);
    
  RETURN attempt_count < max_attempts;
END;
$function$;

-- 9. update_conversation_on_message
CREATE OR REPLACE FUNCTION public.update_conversation_on_message()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
DECLARE
  conversation_id UUID;
BEGIN
  -- Encontrar ou criar conversa
  SELECT id INTO conversation_id
  FROM public.conversations
  WHERE (participant_1_id = NEW.sender_id AND participant_2_id = NEW.recipient_id)
     OR (participant_1_id = NEW.recipient_id AND participant_2_id = NEW.sender_id);
  
  -- Se conversa não existe, criar
  IF conversation_id IS NULL THEN
    INSERT INTO public.conversations (participant_1_id, participant_2_id, last_message_at)
    VALUES (NEW.sender_id, NEW.recipient_id, NEW.created_at)
    RETURNING id INTO conversation_id;
  ELSE
    -- Atualizar timestamp da última mensagem
    UPDATE public.conversations 
    SET last_message_at = NEW.created_at,
        updated_at = NEW.created_at
    WHERE id = conversation_id;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- 10. create_message_notification
CREATE OR REPLACE FUNCTION public.create_message_notification()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
DECLARE
  sender_name TEXT;
BEGIN
  -- Buscar nome do remetente
  SELECT name INTO sender_name 
  FROM public.profiles 
  WHERE id = NEW.sender_id;
  
  -- Criar notificação para o destinatário
  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    message,
    data
  ) VALUES (
    NEW.recipient_id,
    'message',
    'Nova mensagem',
    COALESCE(sender_name, 'Alguém') || ' enviou uma mensagem para você',
    jsonb_build_object(
      'sender_id', NEW.sender_id,
      'sender_name', COALESCE(sender_name, 'Usuário'),
      'message_id', NEW.id,
      'preview', LEFT(NEW.content, 100)
    )
  );
  
  RETURN NEW;
END;
$function$;