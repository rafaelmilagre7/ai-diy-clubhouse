
-- ========================================
-- FIX V2: Tornar triggers existentes idempotentes (sem desabilitá-los)
-- ========================================

-- Modificar handle_new_user para ser completamente idempotente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $$
DECLARE
  v_default_role_id uuid;
  v_profile_exists boolean;
BEGIN
  -- Verificar se profile já existe (prevenir duplicação)
  SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id = NEW.id) INTO v_profile_exists;
  
  IF v_profile_exists THEN
    RAISE NOTICE '[handle_new_user] Profile já existe para % - ignorando', NEW.email;
    RETURN NEW;
  END IF;

  RAISE NOTICE '[handle_new_user] Criando profile para %', NEW.email;

  -- Buscar role padrão
  SELECT id INTO v_default_role_id
  FROM public.user_roles
  WHERE name IN ('membro_club', 'member', 'formacao')
  ORDER BY CASE name
    WHEN 'membro_club' THEN 1
    WHEN 'member' THEN 2
    WHEN 'formacao' THEN 3
  END
  LIMIT 1;

  -- UPSERT em profiles
  INSERT INTO public.profiles (
    id, email, role_id, name, 
    created_at, updated_at, 
    onboarding_completed, is_master_user
  )
  VALUES (
    NEW.id,
    NEW.email,
    v_default_role_id,
    COALESCE(
      NEW.raw_user_meta_data->>'name',
      NEW.raw_user_meta_data->>'full_name',
      split_part(NEW.email, '@', 1)
    ),
    NOW(), NOW(), false, true
  )
  ON CONFLICT (id) DO NOTHING;

  -- Criar onboarding_final (idempotente)
  INSERT INTO public.onboarding_final (
    user_id, current_step, is_completed,
    personal_info, professional_info,
    created_at, updated_at
  )
  VALUES (
    NEW.id, 1, false,
    '{}'::jsonb, '{}'::jsonb,
    NOW(), NOW()
  )
  ON CONFLICT (user_id) DO NOTHING;

  RAISE NOTICE '[handle_new_user] Profile e onboarding criados para %', NEW.email;
  RETURN NEW;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING '[handle_new_user] Erro: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Modificar handle_new_user_with_onboarding para não fazer nada (já coberto acima)
CREATE OR REPLACE FUNCTION public.handle_new_user_with_onboarding()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- NÃO FAZ NADA - handle_new_user já cobre esta funcionalidade
  RAISE NOTICE '[handle_new_user_with_onboarding] Pulando - delegado ao handle_new_user';
  RETURN NEW;
END;
$$;

-- Modificar process_invite_after_signup para ser idempotente
CREATE OR REPLACE FUNCTION public.process_invite_after_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_invite_token text;
  v_invite_record record;
  v_profile_exists boolean;
BEGIN
  -- Verificar se profile existe primeiro
  SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id = NEW.id) INTO v_profile_exists;
  
  IF NOT v_profile_exists THEN
    RAISE NOTICE '[process_invite_after_signup] Profile não existe ainda para % - aguardando outros triggers', NEW.email;
    -- Aguardar um pouco para outros triggers completarem
    PERFORM pg_sleep(0.2);
  END IF;
  
  v_invite_token := NEW.raw_user_meta_data->>'invite_token';
  
  IF v_invite_token IS NULL OR v_invite_token = '' THEN
    RAISE NOTICE '[process_invite_after_signup] Sem token de convite para %', NEW.email;
    RETURN NEW;
  END IF;
  
  RAISE NOTICE '[process_invite_after_signup] Processando convite para %', NEW.email;
  
  -- Buscar convite válido
  SELECT * INTO v_invite_record
  FROM public.invites
  WHERE UPPER(TRIM(token)) = UPPER(TRIM(v_invite_token))
  AND used_at IS NULL
  AND expires_at > NOW()
  LIMIT 1;
  
  IF v_invite_record.id IS NOT NULL THEN
    -- Aplicar role do convite
    UPDATE public.profiles
    SET role_id = v_invite_record.role_id
    WHERE id = NEW.id;
    
    -- Marcar convite como usado (idempotente)
    UPDATE public.invites
    SET used_at = NOW()
    WHERE id = v_invite_record.id
    AND used_at IS NULL;
    
    RAISE NOTICE '[process_invite_after_signup] Convite aplicado para %', NEW.email;
  ELSE
    RAISE NOTICE '[process_invite_after_signup] Convite inválido para %', NEW.email;
  END IF;
  
  RETURN NEW;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING '[process_invite_after_signup] Erro: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Log da correção
COMMENT ON FUNCTION public.handle_new_user IS 'V2: Trigger idempotente para criar profile e onboarding';
COMMENT ON FUNCTION public.handle_new_user_with_onboarding IS 'V2: Desativado - delegado ao handle_new_user';
COMMENT ON FUNCTION public.process_invite_after_signup IS 'V2: Trigger idempotente para processar convites';
