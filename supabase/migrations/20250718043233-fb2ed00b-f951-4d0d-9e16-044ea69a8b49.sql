-- CORREÇÃO DEFINITIVA: Loops de redirecionamento e permissões de banco
-- Fix para eliminar loops infinitos de login/dashboard

-- 1. Criar função segura para criar perfil (sem acessar auth.users diretamente)
CREATE OR REPLACE FUNCTION public.create_missing_profile_safe(target_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  default_role_id uuid;
  result jsonb;
BEGIN
  -- Verificar se perfil já existe
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = target_user_id) THEN
    RETURN jsonb_build_object('success', false, 'message', 'Perfil já existe');
  END IF;
  
  -- Buscar role padrão (com fallback)
  SELECT id INTO default_role_id 
  FROM public.user_roles 
  WHERE name IN ('membro_club', 'member', 'membro') 
  ORDER BY name 
  LIMIT 1;
  
  -- Se não encontrou role padrão, criar um básico
  IF default_role_id IS NULL THEN
    INSERT INTO public.user_roles (name, permissions) 
    VALUES ('member', '{"basic": true}'::jsonb)
    ON CONFLICT (name) DO NOTHING
    RETURNING id INTO default_role_id;
  END IF;
  
  -- Criar perfil básico
  INSERT INTO public.profiles (
    id,
    email,
    name,
    role_id,
    onboarding_completed,
    created_at
  ) VALUES (
    target_user_id,
    '', -- Email será preenchido pelo trigger se disponível
    'Usuário',
    default_role_id,
    false,
    now()
  )
  ON CONFLICT (id) DO NOTHING;
  
  -- Log da criação
  INSERT INTO public.audit_logs (
    user_id,
    event_type,
    action,
    details
  ) VALUES (
    target_user_id,
    'profile_creation',
    'auto_create_missing_profile',
    jsonb_build_object(
      'role_id', default_role_id,
      'created_via', 'create_missing_profile_safe'
    )
  );
  
  result := jsonb_build_object(
    'success', true,
    'message', 'Perfil criado com sucesso',
    'role_id', default_role_id
  );
  
  RETURN result;
END;
$$;

-- 2. Política para permitir que usuários criem seu próprio perfil
CREATE POLICY "Users can create their own profile via function"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

-- 3. Garantir que a função de verificação de legacy seja segura
CREATE OR REPLACE FUNCTION public.is_legacy_user(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Lógica simples: usuários criados antes de 2024 são legacy
  -- ou se têm dados específicos que indicam legacy
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id 
    AND (
      created_at < '2024-01-01'::timestamp 
      OR (role IS NOT NULL AND role != '')
    )
  );
END;
$$;

-- 4. Log da correção
INSERT INTO public.audit_logs (
  event_type,
  action,
  details,
  severity
) VALUES (
  'system_fix',
  'redirect_loop_correction',
  jsonb_build_object(
    'changes', 'Created safe profile creation function and policies',
    'purpose', 'Eliminate infinite redirect loops',
    'timestamp', NOW()
  ),
  'high'
);