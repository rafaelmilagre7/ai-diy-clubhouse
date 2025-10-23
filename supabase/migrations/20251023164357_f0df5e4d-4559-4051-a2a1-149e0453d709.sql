-- ============================================================
-- CORREÇÃO DE SEGURANÇA: Adicionar SET search_path em funções SECURITY DEFINER
-- Previne ataques de hijacking de schema
-- ============================================================

-- DROP das funções existentes para recriar com SET search_path
DROP FUNCTION IF EXISTS public.validate_invite_token_enhanced(text);
DROP FUNCTION IF EXISTS public.use_invite_enhanced(text, uuid);
DROP FUNCTION IF EXISTS public.check_solution_certificate_eligibility(uuid, uuid);

-- Função 1: validate_invite_token_enhanced
CREATE FUNCTION public.validate_invite_token_enhanced(p_token text)
RETURNS TABLE(
  id uuid,
  email text,
  role_id uuid,
  token text,
  expires_at timestamp with time zone,
  used_at timestamp with time zone,
  created_at timestamp with time zone,
  created_by uuid,
  notes text,
  whatsapp_number text,
  preferred_channel character varying,
  send_attempts integer,
  last_sent_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log da tentativa de validação
  RAISE NOTICE 'Validando token: %', p_token;
  
  -- Busca principal: token exato (case-insensitive)
  RETURN QUERY
  SELECT i.id, i.email, i.role_id, i.token, i.expires_at, i.used_at, 
         i.created_at, i.created_by, i.notes, i.whatsapp_number, 
         i.preferred_channel, i.send_attempts, i.last_sent_at
  FROM public.invites i
  WHERE UPPER(i.token) = UPPER(p_token)
    AND i.used_at IS NULL 
    AND i.expires_at > NOW();
  
  -- Se não encontrou resultado, tentar busca parcial
  IF NOT FOUND THEN
    RAISE NOTICE 'Token exato não encontrado, tentando busca parcial';
    RETURN QUERY
    SELECT i.id, i.email, i.role_id, i.token, i.expires_at, i.used_at, 
           i.created_at, i.created_by, i.notes, i.whatsapp_number, 
           i.preferred_channel, i.send_attempts, i.last_sent_at
    FROM public.invites i
    WHERE UPPER(i.token) LIKE (UPPER(SUBSTRING(p_token, 1, 8)) || '%')
      AND i.used_at IS NULL 
      AND i.expires_at > NOW()
    LIMIT 1;
  END IF;
END;
$$;

-- Função 2: use_invite_enhanced
CREATE FUNCTION public.use_invite_enhanced(invite_token text, user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  invite_record public.invites;
  cleaned_token text;
BEGIN
  -- Limpar o token
  cleaned_token := upper(regexp_replace(invite_token, '\s+', '', 'g'));
  
  RAISE NOTICE 'Tentando usar convite: % para usuário: %', cleaned_token, user_id;
  
  -- Buscar convite usando a função de validação
  SELECT * INTO invite_record
  FROM public.validate_invite_token_enhanced(cleaned_token)
  LIMIT 1;
  
  -- Verificar se encontrou o convite
  IF invite_record.id IS NULL THEN
    RAISE NOTICE 'Convite não encontrado ou inválido: %', cleaned_token;
    RETURN json_build_object(
      'status', 'error',
      'message', 'Convite inválido ou expirado'
    );
  END IF;
  
  -- Marcar como usado e atualizar usuário
  BEGIN
    UPDATE public.invites
    SET used_at = now()
    WHERE id = invite_record.id;
    
    UPDATE public.profiles
    SET role_id = invite_record.role_id
    WHERE id = user_id;
    
    RAISE NOTICE 'Convite % aplicado com sucesso para usuário %', cleaned_token, user_id;
    
    RETURN json_build_object(
      'status', 'success',
      'message', 'Convite utilizado com sucesso',
      'invite_id', invite_record.id,
      'role_id', invite_record.role_id
    );
    
  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE 'Erro ao aplicar convite: %', SQLERRM;
      RETURN json_build_object(
        'status', 'error',
        'message', 'Erro interno ao aplicar convite: ' || SQLERRM
      );
  END;
END;
$$;

-- Função 3: check_solution_certificate_eligibility
CREATE FUNCTION public.check_solution_certificate_eligibility(p_user_id UUID, p_solution_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  progress_record public.progress;
BEGIN
  -- Buscar progresso do usuário na solução
  SELECT * INTO progress_record
  FROM public.progress
  WHERE user_id = p_user_id AND solution_id = p_solution_id;
  
  -- Se não há progresso, não é elegível
  IF progress_record.id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Verificar se a implementação está completa
  RETURN COALESCE(progress_record.is_completed, FALSE);
END;
$$;