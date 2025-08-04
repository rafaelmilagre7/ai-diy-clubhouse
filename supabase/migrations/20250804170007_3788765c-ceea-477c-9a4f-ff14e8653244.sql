-- Corrigir função para exibir eventos recorrentes para membros
DROP FUNCTION IF EXISTS public.get_visible_events_for_user(uuid);
DROP FUNCTION IF EXISTS public.get_visible_events_for_user(user_id uuid);

-- Criar função corrigida com parâmetro correto
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
BEGIN
  -- Retornar todos os eventos (incluindo recorrentes) ordenados por data
  -- Membros podem ver todos os eventos criados
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
END;
$$;