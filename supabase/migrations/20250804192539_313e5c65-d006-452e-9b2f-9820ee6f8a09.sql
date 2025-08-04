-- Limpar todas as funções duplicadas
DROP FUNCTION IF EXISTS public.generate_recurring_event_instances;

-- Criar a função única e correta
CREATE FUNCTION public.generate_recurring_event_instances(parent_event_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  parent_event RECORD;
  new_end_time TIMESTAMP WITH TIME ZONE;
  duration_interval INTERVAL;
  created_count INTEGER := 0;
  max_events INTEGER;
  end_date_limit TIMESTAMP WITH TIME ZONE;
  next_event_date TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Buscar evento pai
  SELECT * INTO parent_event
  FROM events 
  WHERE id = parent_event_id 
  AND is_recurring = true 
  AND parent_event_id IS NULL;
  
  IF parent_event.id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Evento pai não encontrado ou não é recorrente'
    );
  END IF;
  
  -- Verificar se já existem eventos filhos
  IF EXISTS (SELECT 1 FROM events WHERE parent_event_id = parent_event.id) THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Eventos recorrentes já foram gerados para este evento'
    );
  END IF;
  
  -- Calcular duração do evento
  duration_interval := parent_event.end_time - parent_event.start_time;
  
  -- Determinar limites (máximo 10 eventos para teste)
  max_events := LEAST(COALESCE(parent_event.recurrence_count, 10), 10);
  end_date_limit := CASE 
    WHEN parent_event.recurrence_end_date IS NOT NULL 
    THEN parent_event.recurrence_end_date::timestamp with time zone
    ELSE NULL 
  END;
  
  -- Gerar eventos recorrentes
  FOR i IN 1..(max_events - 1) LOOP
    IF parent_event.recurrence_pattern = 'weekly' THEN
      next_event_date := parent_event.start_time + (i * INTERVAL '7 days' * COALESCE(parent_event.recurrence_interval, 1));
    ELSIF parent_event.recurrence_pattern = 'daily' THEN
      next_event_date := parent_event.start_time + (i * INTERVAL '1 day' * COALESCE(parent_event.recurrence_interval, 1));
    ELSIF parent_event.recurrence_pattern = 'monthly' THEN
      next_event_date := parent_event.start_time + (i * INTERVAL '1 month' * COALESCE(parent_event.recurrence_interval, 1));
    ELSE
      EXIT;
    END IF;
    
    -- Verificar se ultrapassou a data limite
    IF end_date_limit IS NOT NULL AND next_event_date > end_date_limit THEN
      EXIT;
    END IF;
    
    -- Calcular horário de fim
    new_end_time := next_event_date + duration_interval;
    
    -- Inserir evento filho
    INSERT INTO events (
      title,
      description,
      start_time,
      end_time,
      location_link,
      physical_location,
      cover_image_url,
      created_by,
      is_recurring,
      recurrence_pattern,
      recurrence_interval,
      recurrence_day,
      recurrence_count,
      recurrence_end_date,
      parent_event_id
    ) VALUES (
      parent_event.title,
      parent_event.description,
      next_event_date,
      new_end_time,
      parent_event.location_link,
      parent_event.physical_location,
      parent_event.cover_image_url,
      parent_event.created_by,
      true,
      parent_event.recurrence_pattern,
      parent_event.recurrence_interval,
      parent_event.recurrence_day,
      parent_event.recurrence_count,
      parent_event.recurrence_end_date,
      parent_event.id
    );
    
    created_count := created_count + 1;
  END LOOP;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', format('Criados %s eventos recorrentes', created_count),
    'created_count', created_count,
    'parent_event_id', parent_event.id
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;