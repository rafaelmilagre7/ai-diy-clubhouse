-- Inserir preferências padrão para todos os usuários que não possuem
INSERT INTO networking_preferences (
  user_id,
  looking_for,
  exclude_sectors,
  min_compatibility,
  preferred_connections_per_week,
  is_active,
  created_at,
  updated_at
)
SELECT 
  p.id,
  '{"types": ["customer", "supplier", "partner"], "industries": [], "company_sizes": ["startup", "pequena", "media", "grande"]}'::jsonb,
  ARRAY[]::text[],
  0.7,
  5,
  true,
  now(),
  now()
FROM profiles p
WHERE p.available_for_networking = true 
AND NOT EXISTS (
  SELECT 1 FROM networking_preferences np WHERE np.user_id = p.id
);

-- Atualizar as funções para melhor tratamento de erros
CREATE OR REPLACE FUNCTION public.initialize_networking_preferences_for_user(target_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Verificar se o usuário já tem preferências
  IF EXISTS (SELECT 1 FROM networking_preferences WHERE user_id = target_user_id) THEN
    RETURN jsonb_build_object(
      'success', true,
      'message', 'Usuário já possui preferências de networking'
    );
  END IF;
  
  -- Criar preferências padrão
  INSERT INTO networking_preferences (
    user_id,
    looking_for,
    exclude_sectors,
    min_compatibility,
    preferred_connections_per_week,
    is_active
  ) VALUES (
    target_user_id,
    '{"types": ["customer", "supplier", "partner"], "industries": [], "company_sizes": ["startup", "pequena", "media", "grande"]}'::jsonb,
    ARRAY[]::text[],
    0.7,
    5,
    true
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Preferências de networking inicializadas com sucesso'
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$function$;