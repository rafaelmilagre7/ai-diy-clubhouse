-- FASE 1: Correção de Erro Bloqueador
-- Corrigir search_path em funções críticas para resolver problemas de segurança

-- Atualizar funções com search_path correto
CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  RETURN public.is_user_admin(auth.uid());
END;
$function$;

CREATE OR REPLACE FUNCTION public.is_user_admin(user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.profiles p
    JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = user_id AND ur.name = 'admin'
  );
END;
$function$;

-- FASE 2: Criar políticas RLS para tabelas expostas
-- Tabela benefit_access_control
CREATE POLICY "Admins can manage benefit access control"
ON public.benefit_access_control
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM public.profiles p
    JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() AND ur.name = 'admin'
  )
);

-- Tabela analytics_backups
CREATE POLICY "Only admins can access analytics backups"
ON public.analytics_backups
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM public.profiles p
    JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() AND ur.name = 'admin'
  )
);

-- Tabela invite_backups  
CREATE POLICY "Only admins can access invite backups"
ON public.invite_backups
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM public.profiles p
    JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() AND ur.name = 'admin'
  )
);

-- Tabela event_access_control
CREATE POLICY "Admins can manage event access control"
ON public.event_access_control
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM public.profiles p
    JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() AND ur.name = 'admin'
  )
);

-- FASE 3: Corrigir funções com search_path inseguro
CREATE OR REPLACE FUNCTION public.fix_stuck_onboarding_users()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  fixed_count INTEGER := 0;
  user_record RECORD;
BEGIN
  -- Destrava usuários no step 1 que não têm completed_steps
  FOR user_record IN 
    SELECT p.id, p.email, onb.current_step, onb.completed_steps
    FROM public.profiles p
    LEFT JOIN public.onboarding_final onb ON p.id = onb.user_id
    WHERE p.onboarding_completed = false
      AND (onb.completed_steps IS NULL OR array_length(onb.completed_steps, 1) IS NULL)
      AND COALESCE(onb.current_step, 1) = 1
  LOOP
    -- Simular que step 1 foi completado com dados mínimos
    UPDATE public.onboarding_final
    SET 
      completed_steps = ARRAY[1],
      current_step = 2,
      personal_info = COALESCE(personal_info, '{}'::jsonb) || jsonb_build_object(
        'name', COALESCE(personal_info->>'name', 'Usuário'),
        'email', user_record.email
      ),
      updated_at = now()
    WHERE user_id = user_record.id;
    
    fixed_count := fixed_count + 1;
    RAISE NOTICE 'Destravado usuário %: %', user_record.email, user_record.id;
  END LOOP;
  
  RETURN jsonb_build_object(
    'success', true,
    'fixed_users', fixed_count,
    'message', format('Destravados %s usuários do onboarding', fixed_count)
  );
END;
$function$;