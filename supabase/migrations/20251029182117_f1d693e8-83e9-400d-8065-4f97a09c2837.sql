-- Correção do trigger create_event_reminders para resolver erro "relation profiles does not exist"
-- Problema: search_path vazio impedia encontrar a tabela profiles
-- Solução: Definir search_path como 'public'

CREATE OR REPLACE FUNCTION public.create_event_reminders()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  user_record record;
BEGIN
  -- Criar lembretes para todos os usuários
  FOR user_record IN 
    SELECT DISTINCT id FROM public.profiles WHERE id IS NOT NULL
  LOOP
    -- Criar lembretes de 24h e 1h antes do evento
    INSERT INTO public.event_reminders (event_id, user_id, reminder_type)
    VALUES 
      (NEW.id, user_record.id, '24h'),
      (NEW.id, user_record.id, '1h')
    ON CONFLICT (event_id, user_id, reminder_type) DO NOTHING;
  END LOOP;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log do erro mas não bloqueia a criação do evento
    RAISE WARNING 'Erro ao criar lembretes para evento %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$function$;