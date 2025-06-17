

-- Função para gerar instâncias de eventos recorrentes (corrigida)
CREATE OR REPLACE FUNCTION public.generate_recurring_event_instances(
  p_event_id uuid,
  p_max_instances integer DEFAULT 12
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  event_record events;
  instance_date timestamp with time zone;
  end_date timestamp with time zone;
  event_start_time time;
  event_end_time time;
  instances_created integer := 0;
  base_date timestamp with time zone;
  max_date timestamp with time zone;
  day_of_week integer;
  instances_data jsonb := '[]'::jsonb;
BEGIN
  -- Buscar o evento pai
  SELECT * INTO event_record FROM events WHERE id = p_event_id AND is_recurring = true;
  
  IF event_record.id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Evento recorrente não encontrado');
  END IF;
  
  -- Extrair horários (renomeado para evitar conflito)
  event_start_time := event_record.start_time::time;
  event_end_time := event_record.end_time::time;
  
  -- Determinar data inicial (hoje se for passado, ou a data do evento)
  base_date := GREATEST(CURRENT_DATE::timestamp with time zone, DATE_TRUNC('day', event_record.start_time));
  
  -- Determinar data limite
  IF event_record.recurrence_end_date IS NOT NULL THEN
    max_date := event_record.recurrence_end_date::timestamp with time zone;
  ELSE
    max_date := base_date + INTERVAL '1 year'; -- Limite de 1 ano se não especificado
  END IF;
  
  -- Deletar instâncias existentes futuras
  DELETE FROM events 
  WHERE parent_event_id = p_event_id 
  AND start_time >= base_date;
  
  -- Gerar instâncias baseado no padrão
  instance_date := base_date;
  
  WHILE instances_created < p_max_instances AND instance_date <= max_date LOOP
    -- Ajustar data baseado no padrão de recorrência
    IF event_record.recurrence_pattern = 'daily' THEN
      instance_date := base_date + (instances_created * (event_record.recurrence_interval || ' days')::interval);
      
    ELSIF event_record.recurrence_pattern = 'weekly' THEN
      -- Para eventos semanais, encontrar o próximo dia da semana correto
      IF instances_created = 0 THEN
        -- Primeira instância: encontrar a próxima ocorrência do dia da semana
        day_of_week := EXTRACT(DOW FROM base_date);
        IF day_of_week <= event_record.recurrence_day THEN
          instance_date := base_date + ((event_record.recurrence_day - day_of_week) || ' days')::interval;
        ELSE
          instance_date := base_date + ((7 - day_of_week + event_record.recurrence_day) || ' days')::interval;
        END IF;
      ELSE
        -- Instâncias subsequentes: adicionar semanas
        instance_date := instance_date + ((7 * event_record.recurrence_interval) || ' days')::interval;
      END IF;
      
    ELSIF event_record.recurrence_pattern = 'monthly' THEN
      instance_date := base_date + (instances_created * (event_record.recurrence_interval || ' months')::interval);
      
    END IF;
    
    -- Verificar se ainda está dentro dos limites
    IF instance_date > max_date THEN
      EXIT;
    END IF;
    
    -- Verificar limite de contagem
    IF event_record.recurrence_count IS NOT NULL AND instances_created >= event_record.recurrence_count THEN
      EXIT;
    END IF;
    
    -- Criar instância (usando as variáveis renomeadas)
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
      parent_event_id
    ) VALUES (
      event_record.title,
      event_record.description,
      instance_date::date + event_start_time,
      instance_date::date + event_end_time,
      event_record.location_link,
      event_record.physical_location,
      event_record.cover_image_url,
      event_record.created_by,
      false, -- Instâncias não são recorrentes
      p_event_id
    );
    
    -- Adicionar aos dados de retorno
    instances_data := instances_data || jsonb_build_object(
      'date', instance_date::date,
      'start_time', (instance_date::date + event_start_time)::text,
      'end_time', (instance_date::date + event_end_time)::text
    );
    
    instances_created := instances_created + 1;
  END LOOP;
  
  RETURN jsonb_build_object(
    'success', true,
    'instances_created', instances_created,
    'instances', instances_data,
    'message', format('Criadas %s instâncias do evento recorrente', instances_created)
  );
END;
$$;

