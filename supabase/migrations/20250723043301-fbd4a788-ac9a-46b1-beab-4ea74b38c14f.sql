-- Função temporária para testar onboarding
CREATE OR REPLACE FUNCTION public.test_reset_onboarding(target_email text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  user_profile record;
BEGIN
  -- Verificar se é admin
  IF NOT public.is_user_admin_secure(auth.uid()) THEN
    RETURN jsonb_build_object('error', 'Acesso negado');
  END IF;
  
  -- Buscar usuário por email
  SELECT * INTO user_profile FROM public.profiles WHERE email = target_email;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Usuário não encontrado');
  END IF;
  
  -- Reset onboarding
  UPDATE public.profiles 
  SET 
    onboarding_completed = false,
    onboarding_completed_at = null,
    updated_at = now()
  WHERE email = target_email;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Onboarding resetado para teste',
    'user_email', target_email
  );
END;
$function$;