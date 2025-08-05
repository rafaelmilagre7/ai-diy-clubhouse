-- Corrigir funções sem search_path seguro
-- Estas são algumas das principais funções que precisam ser corrigidas

-- 1. Função para atualizar timestamps de checklists
CREATE OR REPLACE FUNCTION public.update_user_checklists_updated_at()
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

-- 2. Função para atualizar timestamps de solution comments
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

-- 3. Função para atualizar timestamps de unified checklists
CREATE OR REPLACE FUNCTION public.update_unified_checklists_updated_at()
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

-- 4. Função para atualizar timestamps de quick onboarding
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

-- 5. Função para atualizar timestamps de member connections
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

-- 6. Função para incrementar replies de tópicos
CREATE OR REPLACE FUNCTION public.increment_topic_replies(topic_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.community_topics
  SET reply_count = COALESCE(reply_count, 0) + 1,
      last_activity_at = now()
  WHERE id = topic_id;
END;
$function$;

-- 7. Função para criar notificações da comunidade
CREATE OR REPLACE FUNCTION public.create_community_notification(
  p_user_id uuid, 
  p_title text, 
  p_message text, 
  p_type text DEFAULT 'community_activity'::text, 
  p_data jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  notification_id uuid;
BEGIN
  INSERT INTO notifications (
    user_id,
    title,
    message,
    type,
    data,
    created_at
  ) VALUES (
    p_user_id,
    p_title,
    p_message,
    p_type,
    p_data,
    NOW()
  ) RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$function$;

-- 8. Função para handle new connection request
CREATE OR REPLACE FUNCTION public.handle_new_connection_request()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO connection_notifications (
    user_id,
    sender_id,
    type
  ) VALUES (
    NEW.recipient_id,
    NEW.requester_id,
    'connection_request'
  );
  RETURN NEW;
END;
$function$;