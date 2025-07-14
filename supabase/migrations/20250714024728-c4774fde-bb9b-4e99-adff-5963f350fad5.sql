-- Remover completamente a função problemática e recriar corretamente
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

-- Recriar a função sem referenciar campos inexistentes
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $function$
BEGIN
    -- Verificar se a tabela tem a coluna updated_at antes de tentar atualizá-la
    IF TG_TABLE_NAME = 'onboarding' THEN
        NEW.updated_at = now();
    END IF;
    RETURN NEW;
END;
$function$;

-- Agora executar a correção de dados sem triggers
UPDATE public.onboarding 
SET is_completed = true
WHERE current_step = 7 
  AND completed_steps @> ARRAY[1,2,3,4,5,6]
  AND is_completed = false;

-- Sincronizar manualmente com profiles
UPDATE public.profiles 
SET 
  onboarding_completed = true,
  onboarding_completed_at = now()
WHERE id IN (
  SELECT user_id 
  FROM public.onboarding 
  WHERE is_completed = true 
    AND current_step = 7
)
AND onboarding_completed = false;