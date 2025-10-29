-- ============================================
-- FIX: create_profile_for_user() - Role Padrão Inválido
-- ============================================
-- PROBLEMA: Função busca role 'member' que não existe
-- SOLUÇÃO: Usar 'convidado' como padrão + fallback robusto
-- ============================================

CREATE OR REPLACE FUNCTION public.create_profile_for_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  default_role_id UUID;
  invite_role_id UUID;
  invite_token TEXT;
  fallback_role_id UUID;
BEGIN
  -- 🔍 LOG: Início da criação de perfil
  RAISE NOTICE '🆕 Criando perfil para usuário: % (email: %)', NEW.id, NEW.email;
  
  -- Buscar o role padrão (CORRIGIDO: 'convidado' ao invés de 'member')
  SELECT id INTO default_role_id 
  FROM public.user_roles 
  WHERE name = 'convidado' 
  LIMIT 1;
  
  RAISE NOTICE '📋 Role padrão encontrado: %', default_role_id;

  -- Verificar se há um token de convite nos metadados
  invite_token := NEW.raw_user_meta_data->>'invite_token';
  
  IF invite_token IS NOT NULL THEN
    RAISE NOTICE '🎫 Token de convite detectado: %', invite_token;
    
    -- Buscar role do convite
    SELECT role_id INTO invite_role_id
    FROM public.invites
    WHERE token = invite_token
      AND used_at IS NULL
      AND expires_at > now();
      
    IF invite_role_id IS NOT NULL THEN
      RAISE NOTICE '✅ Convite válido encontrado. Role do convite: %', invite_role_id;
      
      -- Marcar convite como usado
      UPDATE public.invites 
      SET used_at = now() 
      WHERE token = invite_token;
      
      RAISE NOTICE '✓ Convite marcado como usado';
    ELSE
      RAISE NOTICE '⚠️ Token de convite inválido, expirado ou já usado';
    END IF;
  ELSE
    RAISE NOTICE 'ℹ️ Nenhum token de convite fornecido. Usando role padrão';
  END IF;

  -- 🛡️ FALLBACK ROBUSTO: Se ambos forem NULL, buscar qualquer role disponível
  IF invite_role_id IS NULL AND default_role_id IS NULL THEN
    RAISE NOTICE '⚠️ FALLBACK: Nenhuma role encontrada. Buscando qualquer role disponível...';
    
    SELECT id INTO fallback_role_id
    FROM public.user_roles
    ORDER BY 
      CASE name 
        WHEN 'convidado' THEN 1
        WHEN 'hands_on' THEN 2
        ELSE 3
      END
    LIMIT 1;
    
    IF fallback_role_id IS NULL THEN
      RAISE EXCEPTION '❌ ERRO CRÍTICO: Nenhuma role disponível no sistema';
    END IF;
    
    RAISE NOTICE '🔄 Role de fallback selecionado: %', fallback_role_id;
  END IF;

  -- Criar perfil com role apropriado
  INSERT INTO public.profiles (
    id,
    email,
    name,
    role_id
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(invite_role_id, default_role_id, fallback_role_id)
  );

  RAISE NOTICE '✅ Perfil criado com sucesso para: %', NEW.email;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '❌ ERRO ao criar perfil: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
    RAISE;
END;
$function$;