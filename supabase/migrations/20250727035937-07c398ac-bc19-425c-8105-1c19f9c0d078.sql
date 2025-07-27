-- Função para regenerar datas corretas dos eventos recorrentes
CREATE OR REPLACE FUNCTION regenerate_recurring_event_dates()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  parent_event RECORD;
  child_event RECORD;
  new_start_time TIMESTAMP WITH TIME ZONE;
  new_end_time TIMESTAMP WITH TIME ZONE;
  duration_interval INTERVAL;
  week_offset INTEGER;
  fixed_count INTEGER := 0;
BEGIN
  -- Para cada evento pai recorrente
  FOR parent_event IN 
    SELECT * FROM events 
    WHERE is_recurring = true 
    AND parent_event_id IS NULL
    AND recurrence_pattern = 'weekly'
  LOOP
    -- Calcular duração do evento
    duration_interval := parent_event.end_time - parent_event.start_time;
    
    -- Para cada evento filho
    week_offset := 0;
    FOR child_event IN 
      SELECT * FROM events 
      WHERE parent_event_id = parent_event.id 
      ORDER BY created_at
    LOOP
      -- Calcular nova data baseada no padrão semanal
      new_start_time := parent_event.start_time + (week_offset * INTERVAL '7 days');
      new_end_time := new_start_time + duration_interval;
      
      -- Atualizar o evento filho
      UPDATE events 
      SET 
        start_time = new_start_time,
        end_time = new_end_time,
        updated_at = now()
      WHERE id = child_event.id;
      
      week_offset := week_offset + parent_event.recurrence_interval;
      fixed_count := fixed_count + 1;
    END LOOP;
  END LOOP;
  
  RETURN jsonb_build_object(
    'success', true,
    'fixed_events', fixed_count,
    'message', format('Corrigidas as datas de %s eventos recorrentes', fixed_count)
  );
END;
$function$;