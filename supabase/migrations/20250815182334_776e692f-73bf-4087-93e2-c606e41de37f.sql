-- Criar tabela para overrides de acesso a cursos por usuário
CREATE TABLE public.user_course_access (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  course_id UUID NOT NULL,
  granted_by UUID NOT NULL,
  access_type TEXT NOT NULL DEFAULT 'granted', -- 'granted' ou 'denied'
  expires_at TIMESTAMP WITH TIME ZONE NULL,
  notes TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Constraint única por usuário+curso
  UNIQUE(user_id, course_id)
);

-- Habilitar RLS na tabela
ALTER TABLE public.user_course_access ENABLE ROW LEVEL SECURITY;

-- Política: Apenas admins podem gerenciar overrides de acesso
CREATE POLICY "user_course_access_admin_only" 
ON public.user_course_access 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 
    FROM public.profiles p
    INNER JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() AND ur.name = 'admin'
  )
);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_user_course_access_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER update_user_course_access_updated_at
BEFORE UPDATE ON public.user_course_access
FOR EACH ROW
EXECUTE FUNCTION public.update_user_course_access_updated_at();

-- Função para verificar acesso a curso com override
CREATE OR REPLACE FUNCTION public.can_access_course_enhanced(target_user_id UUID, target_course_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  override_access RECORD;
  role_access BOOLEAN := false;
BEGIN
  -- Primeiro verificar se existe override específico para este usuário+curso
  SELECT 
    access_type,
    expires_at
  INTO override_access
  FROM public.user_course_access
  WHERE user_id = target_user_id 
    AND course_id = target_course_id;
  
  -- Se existe override, verificar validade
  IF override_access IS NOT NULL THEN
    -- Se é negado explicitamente, retornar false
    IF override_access.access_type = 'denied' THEN
      RETURN false;
    END IF;
    
    -- Se é concedido, verificar se não expirou
    IF override_access.access_type = 'granted' THEN
      IF override_access.expires_at IS NULL OR override_access.expires_at > now() THEN
        RETURN true;
      ELSE
        -- Override expirado, cair para verificação de role
        NULL;
      END IF;
    END IF;
  END IF;
  
  -- Se não há override válido, usar sistema atual de roles + course_access_control
  SELECT public.can_access_learning_content(target_user_id) INTO role_access;
  
  IF NOT role_access THEN
    RETURN false;
  END IF;
  
  -- Verificar se o role do usuário tem acesso ao curso específico
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles p
    INNER JOIN public.course_access_control cac ON p.role_id = cac.role_id
    WHERE p.id = target_user_id 
      AND cac.course_id = target_course_id
  );
END;
$$;