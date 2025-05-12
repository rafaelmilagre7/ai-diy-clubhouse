
-- Função para buscar eventos visíveis para um usuário
CREATE OR REPLACE FUNCTION public.get_visible_events_for_user(user_id UUID)
RETURNS SETOF public.events
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  is_user_admin BOOLEAN;
  user_role_id UUID;
BEGIN
  -- Verificar se o usuário é admin
  SELECT public.is_admin() INTO is_user_admin;
  
  -- Se for admin, retornar todos os eventos
  IF is_user_admin THEN
    RETURN QUERY SELECT * FROM public.events ORDER BY start_time ASC;
    RETURN;
  END IF;
  
  -- Obter o papel do usuário
  SELECT role_id INTO user_role_id FROM public.profiles WHERE id = user_id;
  
  -- Retornar eventos públicos (sem controle de acesso) ou específicos para o papel do usuário
  RETURN QUERY 
  SELECT e.* FROM public.events e
  WHERE 
    -- Evento público (não tem controle de acesso)
    NOT EXISTS (SELECT 1 FROM public.event_access_control eac WHERE eac.event_id = e.id)
    OR
    -- Evento com acesso específico para o papel do usuário
    EXISTS (SELECT 1 FROM public.event_access_control eac WHERE eac.event_id = e.id AND eac.role_id = user_role_id)
  ORDER BY e.start_time ASC;
END;
$$;

-- Comentário da função
COMMENT ON FUNCTION public.get_visible_events_for_user IS 'Recupera eventos que são visíveis para um usuário específico com base em seu papel';
