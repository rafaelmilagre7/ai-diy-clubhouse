-- CORREÇÃO CRÍTICA: Padronizar assinatura da função create_invite_hybrid
-- Corrigir ordem dos parâmetros e simplificar validações

CREATE OR REPLACE FUNCTION public.create_invite_hybrid(
  p_email text, 
  p_role_id uuid,
  p_phone text DEFAULT NULL,
  p_expires_in interval DEFAULT '7 days'::interval, 
  p_notes text DEFAULT NULL::text,
  p_channel_preference text DEFAULT 'email'
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  new_token text;
  new_invite_id uuid;
  created_by_id uuid;
BEGIN
  -- Obter o ID do usuário atual
  created_by_id := auth.uid();
  
  -- Verificar se o usuário tem permissão para criar convites
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = created_by_id AND (ur.name = 'admin')
  ) THEN
    RETURN json_build_object(
      'status', 'error',
      'message', 'Você não tem permissão para criar convites'
    );
  END IF;
  
  -- Validar preferência de canal
  IF p_channel_preference NOT IN ('email', 'whatsapp', 'both') THEN
    RETURN json_build_object(
      'status', 'error',
      'message', 'Preferência de canal inválida'
    );
  END IF;
  
  -- Validar telefone se necessário
  IF (p_channel_preference = 'whatsapp' OR p_channel_preference = 'both') AND p_phone IS NULL THEN
    RETURN json_build_object(
      'status', 'error',
      'message', 'Telefone é obrigatório para envio via WhatsApp'
    );
  END IF;
  
  -- Gerar token único
  new_token := public.generate_invite_token();
  
  -- Criar novo convite
  INSERT INTO public.invites (
    email,
    whatsapp_number,
    role_id,
    token,
    expires_at,
    created_by,
    notes,
    preferred_channel
  )
  VALUES (
    p_email,
    p_phone,
    p_role_id,
    new_token,
    now() + p_expires_in,
    created_by_id,
    p_notes,
    p_channel_preference
  )
  RETURNING id INTO new_invite_id;
  
  RETURN json_build_object(
    'status', 'success',
    'message', 'Convite criado com sucesso',
    'invite_id', new_invite_id,
    'token', new_token,
    'expires_at', (now() + p_expires_in)
  );
END;
$function$;

-- OTIMIZAR handle_new_user removendo logs excessivos
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = ''
AS $function$
DECLARE
  invite_record public.invites;
  default_role_id uuid;
  extracted_name text;
BEGIN
  -- Verificar se há convite pendente para este email
  SELECT * INTO invite_record
  FROM public.invites
  WHERE email = NEW.email AND used_at IS NULL AND expires_at > now()
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF invite_record.id IS NOT NULL THEN
    -- Convite encontrado - usar dados do convite
    
    -- Extrair nome das notes se parecer ser um nome
    IF invite_record.notes IS NOT NULL AND invite_record.notes ~ '^[A-Za-zÀ-ÿ\s]{2,50}$' THEN
      extracted_name := trim(invite_record.notes);
    END IF;
    
    -- Criar perfil com dados do convite
    INSERT INTO public.profiles (
      id, 
      email,
      name,
      role_id,
      whatsapp_number,
      status,
      onboarding_completed,
      created_at,
      updated_at
    )
    VALUES (
      NEW.id, 
      NEW.email,
      COALESCE(
        extracted_name,
        NEW.raw_user_meta_data->>'name',
        NEW.raw_user_meta_data->>'full_name', 
        NEW.raw_user_meta_data->>'display_name'
      ),
      invite_record.role_id,
      invite_record.whatsapp_number,
      'active',
      false,
      now(),
      now()
    );
    
    -- Marcar convite como usado
    UPDATE public.invites
    SET used_at = now()
    WHERE id = invite_record.id;
    
  ELSE
    -- Sem convite - buscar role padrão de membro
    SELECT id INTO default_role_id
    FROM public.user_roles
    WHERE name = 'member'
    LIMIT 1;
    
    -- Criar perfil padrão
    INSERT INTO public.profiles (
      id,
      email,
      name,
      role_id,
      status,
      onboarding_completed,
      created_at,
      updated_at
    )
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(
        NEW.raw_user_meta_data->>'name',
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'display_name',
        split_part(NEW.email, '@', 1)
      ),
      COALESCE(default_role_id, (SELECT id FROM public.user_roles LIMIT 1)),
      'active',
      false,
      now(),
      now()
    );
  END IF;
  
  RETURN NEW;
END;
$function$;