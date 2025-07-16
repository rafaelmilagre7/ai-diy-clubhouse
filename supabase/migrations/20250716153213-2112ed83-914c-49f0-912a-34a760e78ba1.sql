-- Modificar função create_invite_hybrid para criar perfil pré-existente
-- Adicionar campo status na tabela profiles se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'status') THEN
        ALTER TABLE public.profiles ADD COLUMN status text DEFAULT 'active';
    END IF;
END $$;

-- Corrigir função create_invite_hybrid (corrigir ordem dos parâmetros)
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
  new_profile_id uuid;
  created_by_id uuid;
  extracted_name text;
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
  
  -- Verificar se já existe perfil para este email
  IF EXISTS (SELECT 1 FROM public.profiles WHERE email = p_email) THEN
    RETURN json_build_object(
      'status', 'error',
      'message', 'Já existe um usuário com este email'
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
  
  -- Gerar ID único para o perfil
  new_profile_id := gen_random_uuid();
  
  -- Extrair nome das notes se parecer ser um nome
  IF p_notes IS NOT NULL AND p_notes ~ '^[A-Za-zÀ-ÿ\s]{2,50}$' THEN
    extracted_name := trim(p_notes);
  END IF;
  
  -- Criar perfil pré-existente
  INSERT INTO public.profiles (
    id,
    email,
    role_id,
    name,
    whatsapp_number,
    status,
    onboarding_completed,
    created_at,
    updated_at
  )
  VALUES (
    new_profile_id,
    p_email,
    p_role_id,
    extracted_name,
    p_phone,
    'invited', -- Status inicial
    false,
    now(),
    now()
  );
  
  -- Criar convite
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
    'message', 'Convite e perfil criados com sucesso',
    'invite_id', new_invite_id,
    'profile_id', new_profile_id,
    'token', new_token,
    'expires_at', (now() + p_expires_in),
    'pre_filled_data', json_build_object(
      'email', p_email,
      'name', extracted_name,
      'whatsapp_number', p_phone
    )
  );
END;
$function$;

-- Criar função para ativação de conta pré-existente
CREATE OR REPLACE FUNCTION public.activate_invited_user(
  p_user_id uuid,
  p_email text,
  p_name text,
  p_invite_token text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  profile_record public.profiles;
  invite_record public.invites;
BEGIN
  -- Buscar perfil pré-existente pelo email
  SELECT * INTO profile_record
  FROM public.profiles
  WHERE email = p_email AND status = 'invited';
  
  -- Se não encontrou perfil invited, criar perfil normal
  IF profile_record.id IS NULL THEN
    -- Buscar role padrão
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
    SELECT 
      p_user_id,
      p_email,
      p_name,
      ur.id,
      'active',
      false,
      now(),
      now()
    FROM public.user_roles ur
    WHERE ur.name = 'member'
    LIMIT 1;
    
    RETURN json_build_object(
      'status', 'success',
      'message', 'Perfil padrão criado',
      'type', 'new_profile'
    );
  END IF;
  
  -- Atualizar perfil existente para ativo
  UPDATE public.profiles
  SET 
    id = p_user_id, -- Conectar ao auth.users
    name = COALESCE(p_name, name), -- Preservar nome do convite se não informado
    status = 'active',
    updated_at = now()
  WHERE email = p_email AND status = 'invited';
  
  -- Marcar convite como usado se fornecido
  IF p_invite_token IS NOT NULL THEN
    UPDATE public.invites
    SET used_at = now()
    WHERE token = p_invite_token AND email = p_email;
  END IF;
  
  RETURN json_build_object(
    'status', 'success',
    'message', 'Perfil ativado com sucesso',
    'type', 'activated_profile',
    'profile_data', json_build_object(
      'name', COALESCE(p_name, profile_record.name),
      'email', p_email,
      'role_id', profile_record.role_id,
      'whatsapp_number', profile_record.whatsapp_number
    )
  );
END;
$function$;