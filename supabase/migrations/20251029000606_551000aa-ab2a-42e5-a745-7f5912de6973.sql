-- ============================================
-- CORREÇÃO: Função detect_privilege_escalation com schema qualificado
-- ============================================
-- Problema: A função tem SET search_path TO '' mas acessa tabelas
-- sem qualificar com public., causando erro "relation does not exist"

-- Remover função antiga
DROP FUNCTION IF EXISTS public.detect_privilege_escalation() CASCADE;

-- Recriar com TODAS as referências de tabela qualificadas
CREATE OR REPLACE FUNCTION public.detect_privilege_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  -- Detectar mudança de role_id
  IF OLD.role_id IS DISTINCT FROM NEW.role_id THEN
    -- Verificar se quem está fazendo a mudança é admin
    IF NOT (
      EXISTS (
        SELECT 1 
        FROM public.profiles p  -- ✅ Qualificado com public.
        INNER JOIN public.user_roles ur ON p.role_id = ur.id  -- ✅ Qualificado
        WHERE p.id = auth.uid() AND ur.name = 'admin'
      ) OR 
      current_setting('role', true) = 'service_role' OR
      current_setting('app.onboarding_context', true) = 'true'
    ) THEN
      -- Registrar tentativa bloqueada no audit log
      INSERT INTO public.audit_logs (  -- ✅ Qualificado
        user_id,
        event_type,
        action,
        resource_id,
        details,
        severity
      ) VALUES (
        auth.uid(),
        'security_violation',
        'privilege_escalation_attempt',
        NEW.id::text,
        jsonb_build_object(
          'attempted_by', auth.uid(),
          'target_user', NEW.id,
          'old_role_id', OLD.role_id,
          'attempted_new_role_id', NEW.role_id,
          'blocked', true,
          'timestamp', now(),
          'context', current_setting('app.onboarding_context', true)
        ),
        'critical'
      );
      
      RAISE EXCEPTION 'SECURITY VIOLATION: Tentativa de escalação de privilégios detectada e bloqueada';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Recriar trigger na tabela profiles
DROP TRIGGER IF EXISTS detect_privilege_escalation_trigger ON public.profiles;
CREATE TRIGGER detect_privilege_escalation_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.detect_privilege_escalation();