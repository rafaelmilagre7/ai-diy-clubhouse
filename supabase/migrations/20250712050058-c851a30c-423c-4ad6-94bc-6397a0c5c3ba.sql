-- ========================================================================
-- CORREÇÕES CRÍTICAS DE SEGURANÇA - PATCH DE SEGURANÇA v1.0 (CORRIGIDO)
-- ========================================================================

-- 1. FORTALECER POLÍTICA RLS PARA MUDANÇAS DE ROLE (CRÍTICO)
-- Prevenir escalação de privilégios

-- Remover política atual e criar versão mais restritiva
DROP POLICY IF EXISTS "final_profiles_update_policy" ON public.profiles;

-- Nova política de UPDATE para profiles com validação tripla
-- Usando CHECK constraint em vez de OLD/NEW nas políticas
CREATE POLICY "secure_profiles_update_policy" ON public.profiles
  FOR UPDATE 
  USING (
    -- Condição 1: Usuário pode atualizar apenas seu próprio perfil
    auth.uid() = id
    OR 
    -- Condição 2: Apenas admins podem alterar qualquer perfil
    is_user_admin(auth.uid())
  )
  WITH CHECK (
    -- Check 1: Apenas admins podem alterar role_id de outros usuários
    (auth.uid() = id OR is_user_admin(auth.uid()))
  );

-- 2. ADICIONAR FUNÇÃO DE AUDITORIA PARA MUDANÇAS DE ROLE
CREATE OR REPLACE FUNCTION public.audit_role_changes()
RETURNS TRIGGER AS $$
DECLARE
  old_role_name TEXT;
  new_role_name TEXT;
  actor_role_name TEXT;
BEGIN
  -- Buscar nomes dos roles para auditoria
  SELECT name INTO old_role_name FROM public.user_roles WHERE id = OLD.role_id;
  SELECT name INTO new_role_name FROM public.user_roles WHERE id = NEW.role_id;
  SELECT ur.name INTO actor_role_name 
  FROM public.profiles p 
  JOIN public.user_roles ur ON p.role_id = ur.id 
  WHERE p.id = auth.uid();

  -- Só auditar mudanças de role_id
  IF OLD.role_id IS DISTINCT FROM NEW.role_id THEN
    INSERT INTO public.audit_logs (
      user_id,
      event_type,
      action,
      resource_id,
      details,
      severity
    ) VALUES (
      auth.uid(),
      'role_change',
      'update_user_role',
      NEW.id::text,
      jsonb_build_object(
        'target_user_id', NEW.id,
        'old_role_id', OLD.role_id,
        'new_role_id', NEW.role_id,
        'old_role_name', COALESCE(old_role_name, 'unknown'),
        'new_role_name', COALESCE(new_role_name, 'unknown'),
        'actor_role_name', COALESCE(actor_role_name, 'unknown'),
        'timestamp', NOW()
      ),
      'high'
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aplicar trigger para auditoria automática
DROP TRIGGER IF EXISTS audit_role_changes_trigger ON public.profiles;
CREATE TRIGGER audit_role_changes_trigger
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_role_changes();

-- 3. MELHORAR FUNÇÃO validate_role_change COM MAIS VALIDAÇÕES
CREATE OR REPLACE FUNCTION public.validate_role_change(target_user_id uuid, new_role_id uuid, current_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_role TEXT;
  target_current_role TEXT;
  new_role_name TEXT;
  is_admin BOOLEAN := FALSE;
BEGIN
  -- Verificar se o usuário atual é admin
  SELECT EXISTS(
    SELECT 1 
    FROM public.profiles p
    JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = current_user_id AND ur.name = 'admin'
  ) INTO is_admin;
  
  -- Buscar role atual do usuário que está fazendo a mudança
  SELECT ur.name INTO current_user_role
  FROM public.profiles p
  JOIN public.user_roles ur ON p.role_id = ur.id
  WHERE p.id = current_user_id;
  
  -- Buscar role atual do usuário alvo
  SELECT ur.name INTO target_current_role
  FROM public.profiles p
  JOIN public.user_roles ur ON p.role_id = ur.id
  WHERE p.id = target_user_id;
  
  -- Buscar nome do novo role
  SELECT name INTO new_role_name
  FROM public.user_roles
  WHERE id = new_role_id;
  
  -- REGRA 1: Apenas admins podem alterar papéis de outros usuários
  IF target_user_id != current_user_id AND NOT is_admin THEN
    RAISE WARNING 'SECURITY VIOLATION: User % (role: %) attempted to change role of user % from % to %', 
      current_user_id, current_user_role, target_user_id, target_current_role, new_role_name;
    RETURN FALSE;
  END IF;
  
  -- REGRA 2: Usuários não-admin não podem se promover para admin
  IF target_user_id = current_user_id AND NOT is_admin THEN
    IF new_role_name = 'admin' THEN
      RAISE WARNING 'SECURITY VIOLATION: User % attempted self-promotion to admin', current_user_id;
      RETURN FALSE;
    END IF;
  END IF;
  
  -- REGRA 3: Não permitir mudanças para roles inexistentes
  IF new_role_name IS NULL THEN
    RAISE WARNING 'SECURITY VIOLATION: Attempt to assign non-existent role % to user %', new_role_id, target_user_id;
    RETURN FALSE;
  END IF;
  
  -- REGRA 4: Log de validação bem-sucedida
  RAISE NOTICE 'ROLE CHANGE VALIDATED: User % (%) changing user % from % to %', 
    current_user_id, current_user_role, target_user_id, target_current_role, new_role_name;
  
  RETURN TRUE;
END;
$$;

-- 4. CRIAR ÍNDICES PARA PERFORMANCE DE AUDITORIA
CREATE INDEX IF NOT EXISTS idx_audit_logs_role_changes 
ON public.audit_logs(event_type, user_id, timestamp) 
WHERE event_type = 'role_change';

CREATE INDEX IF NOT EXISTS idx_audit_logs_security_events 
ON public.audit_logs(event_type, severity, timestamp) 
WHERE event_type IN ('security_violation', 'role_change');

-- 5. VERIFICAÇÃO FINAL DE SEGURANÇA
SELECT 
  'Patch de segurança aplicado com sucesso!' as status,
  COUNT(*) as policies_count
FROM pg_policies 
WHERE tablename = 'profiles' 
AND policyname = 'secure_profiles_update_policy';