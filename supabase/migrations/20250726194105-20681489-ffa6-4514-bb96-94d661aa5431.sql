-- REFORÇO DE SEGURANÇA: Políticas RLS mais restritivas para dados sensíveis
-- Estas políticas adicionais protegem contra vazamentos de dados

-- 1. Criar tabela para cupons de desconto (exemplo do caso relatado)
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  discount_value NUMERIC NOT NULL CHECK (discount_value > 0),
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percent', 'fixed')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  usage_limit INTEGER CHECK (usage_limit > 0),
  used_count INTEGER NOT NULL DEFAULT 0 CHECK (used_count >= 0),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  description TEXT
);

-- 2. Ativar RLS na tabela de cupons
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- 3. Políticas super restritivas para cupons (apenas admins)
CREATE POLICY "Apenas admins podem ver cupons"
ON public.coupons
FOR SELECT
USING (
  EXISTS (
    SELECT 1 
    FROM public.profiles p
    INNER JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() AND ur.name = 'admin'
  )
);

CREATE POLICY "Apenas admins podem criar cupons"
ON public.coupons
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM public.profiles p
    INNER JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() AND ur.name = 'admin'
  )
);

CREATE POLICY "Apenas admins podem editar cupons"
ON public.coupons
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 
    FROM public.profiles p
    INNER JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() AND ur.name = 'admin'
  )
);

CREATE POLICY "Apenas admins podem deletar cupons"
ON public.coupons
FOR DELETE
USING (
  EXISTS (
    SELECT 1 
    FROM public.profiles p
    INNER JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() AND ur.name = 'admin'
  )
);

-- 4. Função para atualizar timestamp automaticamente
CREATE OR REPLACE FUNCTION public.update_coupons_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- 5. Trigger para timestamp automático
CREATE TRIGGER update_coupons_updated_at
  BEFORE UPDATE ON public.coupons
  FOR EACH ROW
  EXECUTE FUNCTION public.update_coupons_updated_at();

-- 6. Criar política mais restritiva para logs de auditoria (evitar exposição de dados)
DROP POLICY IF EXISTS "audit_logs_secure_insert_policy" ON public.audit_logs;
DROP POLICY IF EXISTS "audit_logs_secure_insert_v2" ON public.audit_logs;

CREATE POLICY "audit_logs_system_only_insert"
ON public.audit_logs
FOR INSERT
WITH CHECK (
  (auth.role() = 'service_role'::text) OR 
  (auth.uid() IS NOT NULL AND user_id = auth.uid())
);

-- 7. Restringir acesso de leitura aos logs de auditoria
CREATE POLICY "audit_logs_admin_only_select"
ON public.audit_logs
FOR SELECT
USING (
  EXISTS (
    SELECT 1 
    FROM public.profiles p
    INNER JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() AND ur.name = 'admin'
  )
);

-- 8. Função para criptografar dados sensíveis
CREATE OR REPLACE FUNCTION public.hash_sensitive_data_secure(input_text TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Usar hash SHA-256 para proteger dados sensíveis
  RETURN encode(digest(input_text, 'sha256'), 'hex');
END;
$$;

-- 9. Função para validar força de senha (melhorada)
CREATE OR REPLACE FUNCTION public.validate_password_strength_enhanced(password TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  score INTEGER := 0;
  feedback TEXT[] := '{}';
BEGIN
  -- Verificar comprimento mínimo
  IF length(password) >= 8 THEN
    score := score + 1;
  ELSE
    feedback := array_append(feedback, 'Mínimo de 8 caracteres');
  END IF;
  
  -- Verificar letras maiúsculas
  IF password ~ '[A-Z]' THEN
    score := score + 1;
  ELSE
    feedback := array_append(feedback, 'Pelo menos uma letra maiúscula');
  END IF;
  
  -- Verificar letras minúsculas
  IF password ~ '[a-z]' THEN
    score := score + 1;
  ELSE
    feedback := array_append(feedback, 'Pelo menos uma letra minúscula');
  END IF;
  
  -- Verificar números
  IF password ~ '[0-9]' THEN
    score := score + 1;
  ELSE
    feedback := array_append(feedback, 'Pelo menos um número');
  END IF;
  
  -- Verificar caracteres especiais
  IF password ~ '[^A-Za-z0-9]' THEN
    score := score + 1;
  ELSE
    feedback := array_append(feedback, 'Pelo menos um caractere especial');
  END IF;
  
  -- Verificar se não contém sequências comuns
  IF password ~* '.*(123|abc|qwe|password|admin).*' THEN
    score := score - 1;
    feedback := array_append(feedback, 'Evite sequências ou palavras comuns');
  END IF;
  
  RETURN jsonb_build_object(
    'score', GREATEST(score, 0),
    'max_score', 5,
    'is_strong', score >= 4,
    'feedback', feedback
  );
END;
$$;