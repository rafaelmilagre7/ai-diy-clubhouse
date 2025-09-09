-- Corrigir controle de acesso de eventos na função get_visible_events_for_user
DROP FUNCTION IF EXISTS public.get_visible_events_for_user(uuid);

CREATE OR REPLACE FUNCTION public.get_visible_events_for_user(p_user_id uuid)
RETURNS TABLE(
  id uuid,
  title text,
  description text,
  start_time timestamp with time zone,
  end_time timestamp with time zone,
  location_link text,
  physical_location text,
  cover_image_url text,
  created_at timestamp with time zone,
  created_by uuid,
  is_recurring boolean,
  recurrence_pattern text,
  recurrence_interval integer,
  recurrence_day integer,
  recurrence_count integer,
  recurrence_end_date text,
  parent_event_id uuid
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  is_user_admin BOOLEAN;
  user_role_id UUID;
BEGIN
  -- Verificar se o usuário é admin
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles p
    INNER JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = p_user_id AND ur.name = 'admin'
  ) INTO is_user_admin;

  -- Se for admin, retornar todos os eventos
  IF is_user_admin THEN
    RETURN QUERY
    SELECT 
      e.id,
      e.title,
      e.description,
      e.start_time,
      e.end_time,
      e.location_link,
      e.physical_location,
      e.cover_image_url,
      e.created_at,
      e.created_by,
      e.is_recurring,
      e.recurrence_pattern,
      e.recurrence_interval,
      e.recurrence_day,
      e.recurrence_count,
      e.recurrence_end_date,
      e.parent_event_id
    FROM public.events e
    ORDER BY e.start_time ASC;
    RETURN;
  END IF;

  -- Se não for admin, obter role_id do usuário
  SELECT p.role_id INTO user_role_id
  FROM public.profiles p
  WHERE p.id = p_user_id;

  -- Retornar apenas eventos visíveis para o papel do usuário
  RETURN QUERY
  SELECT 
    e.id,
    e.title,
    e.description,
    e.start_time,
    e.end_time,
    e.location_link,
    e.physical_location,
    e.cover_image_url,
    e.created_at,
    e.created_by,
    e.is_recurring,
    e.recurrence_pattern,
    e.recurrence_interval,
    e.recurrence_day,
    e.recurrence_count,
    e.recurrence_end_date,
    e.parent_event_id
  FROM public.events e
  WHERE
    -- Evento sem controle de acesso (público para todos)
    NOT EXISTS (SELECT 1 FROM public.event_access_control eac WHERE eac.event_id = e.id)
    OR
    -- Evento com acesso específico para o papel do usuário
    EXISTS (SELECT 1 FROM public.event_access_control eac WHERE eac.event_id = e.id AND eac.role_id = user_role_id)
  ORDER BY e.start_time ASC;
END;
$$;