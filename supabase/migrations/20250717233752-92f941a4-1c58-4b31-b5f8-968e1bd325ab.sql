-- FASE 3: CORREÇÕES CRÍTICAS DE SEGURANÇA
-- ===============================================

-- 1. HABILITAR PROTEÇÃO CONTRA SENHAS VAZADAS
UPDATE auth.config 
SET password_leaked_protection_enabled = true;

-- 2. CONFIGURAR OTP PARA EXPIRAÇÃO SEGURA (10 minutos)
UPDATE auth.config 
SET otp_expiry = 600; -- 10 minutos em segundos

-- 3. CORRIGIR FUNÇÕES SEM search_path SEGURO
-- Função: activate_invited_user
CREATE OR REPLACE FUNCTION public.activate_invited_user(p_user_id uuid, p_email text, p_name text, p_invite_token text DEFAULT NULL::text)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
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

-- Função: can_use_invite
CREATE OR REPLACE FUNCTION public.can_use_invite(p_user_id uuid, p_token text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  invite_record public.invites;
BEGIN
  -- Buscar convite válido
  SELECT * INTO invite_record
  FROM public.invites
  WHERE token = p_token AND expires_at > now() AND used_at IS NULL;
  
  -- Se convite não existe ou expirou
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Verificar se usuário pode usar este convite
  -- (lógica adicional pode ser implementada aqui)
  RETURN true;
END;
$function$;

-- Função: check_referral
CREATE OR REPLACE FUNCTION public.check_referral(p_token text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  v_referral public.referrals;
  v_result JSONB;
  v_referrer_name TEXT;
BEGIN
  -- Buscar indicação pelo token
  SELECT r.* INTO v_referral
  FROM public.referrals r
  WHERE r.token = p_token
  AND r.expires_at > now();
  
  -- Verificar se a indicação existe e é válida
  IF v_referral.id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Indicação inválida ou expirada'
    );
  END IF;
  
  -- Buscar nome do indicador
  SELECT name INTO v_referrer_name
  FROM public.profiles
  WHERE id = v_referral.referrer_id;
  
  -- Retornar detalhes sem informações sensíveis
  RETURN jsonb_build_object(
    'success', true,
    'referral_id', v_referral.id,
    'type', v_referral.type,
    'referrer_name', v_referrer_name,
    'status', v_referral.status,
    'expires_at', v_referral.expires_at
  );
END;
$function$;

-- Função: check_solution_certificate_eligibility
CREATE OR REPLACE FUNCTION public.check_solution_certificate_eligibility(p_user_id uuid, p_solution_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
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
$function$;

-- Log da correção
INSERT INTO public.audit_logs (
  event_type,
  action,
  details,
  user_id
) VALUES (
  'security_enhancement',
  'phase_3_security_fixes',
  '{"message": "FASE 3 - Correções críticas de segurança implementadas", "fixes": ["password_leaked_protection", "otp_expiry_10min", "search_path_functions"], "timestamp": "' || now() || '"}'::jsonb,
  auth.uid()
);